-- =========================================================
-- 1. PROFILES: novos campos do onboarding
-- =========================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS training_location text,
  ADD COLUMN IF NOT EXISTS session_minutes integer,
  ADD COLUMN IF NOT EXISTS equipment text[],
  ADD COLUMN IF NOT EXISTS food_preferences text[],
  ADD COLUMN IF NOT EXISTS sleep_quality text,
  ADD COLUMN IF NOT EXISTS physical_limitations text,
  ADD COLUMN IF NOT EXISTS phone text;

CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles (phone);

-- =========================================================
-- 2. ADMIN HELPER
-- =========================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin'::app_role)
$$;

-- =========================================================
-- 3. PLANOS
-- =========================================================
CREATE TABLE IF NOT EXISTS public.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price_cents integer,
  price_label text,
  period text NOT NULL DEFAULT 'monthly',
  external_product_id text,
  checkout_url text,
  highlight boolean NOT NULL DEFAULT false,
  order_num integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.plans TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.plans TO authenticated;
GRANT ALL ON public.plans TO service_role;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plans_public_read" ON public.plans FOR SELECT USING (active = true);
CREATE POLICY "plans_admin_all" ON public.plans FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON public.plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- 4. ASSINATURAS
-- =========================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan_id uuid REFERENCES public.plans(id) ON DELETE SET NULL,
  provider text NOT NULL DEFAULT 'kiwify',
  external_id text,
  status text NOT NULL DEFAULT 'pending',
  started_at timestamptz,
  expires_at timestamptz,
  buyer_email text,
  buyer_phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_external ON public.subscriptions (provider, external_id) WHERE external_id IS NOT NULL;
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subs_own_read" ON public.subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "subs_admin_all" ON public.subscriptions FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.subscription_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  user_id uuid,
  provider text NOT NULL DEFAULT 'kiwify',
  external_event_id text,
  event_type text NOT NULL,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_sub_events_external ON public.subscription_events (provider, external_event_id) WHERE external_event_id IS NOT NULL;
GRANT SELECT ON public.subscription_events TO authenticated;
GRANT ALL ON public.subscription_events TO service_role;
ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sub_events_admin_read" ON public.subscription_events FOR SELECT TO authenticated USING (public.is_admin());

-- =========================================================
-- 5. AUTORIZAÇÕES DE ACESSO
-- =========================================================
CREATE TABLE IF NOT EXISTS public.entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  source text NOT NULL DEFAULT 'subscription',
  active boolean NOT NULL DEFAULT true,
  granted_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_entitlements_user ON public.entitlements (user_id);
GRANT SELECT ON public.entitlements TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.entitlements TO authenticated;
GRANT ALL ON public.entitlements TO service_role;
ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ent_own_read" ON public.entitlements FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "ent_admin_all" ON public.entitlements FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER update_entitlements_updated_at BEFORE UPDATE ON public.entitlements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.has_active_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.entitlements e
    WHERE e.user_id = _user_id
      AND e.active = true
      AND (e.expires_at IS NULL OR e.expires_at > now())
  ) OR public.has_role(_user_id, 'admin'::app_role)
$$;

-- =========================================================
-- 6. BIBLIOTECA
-- =========================================================
CREATE TABLE IF NOT EXISTS public.library_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  cover_url text,
  category text,
  item_type text NOT NULL DEFAULT 'guide',
  goals text[],
  native_content text,
  file_path text,
  external_url text,
  requires_access boolean NOT NULL DEFAULT true,
  order_num integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.library_items TO authenticated;
GRANT ALL ON public.library_items TO service_role;
ALTER TABLE public.library_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "library_read_with_access" ON public.library_items FOR SELECT TO authenticated
  USING (active = true AND (requires_access = false OR public.has_active_access(auth.uid())));
CREATE POLICY "library_admin_all" ON public.library_items FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER update_library_items_updated_at BEFORE UPDATE ON public.library_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- 7. JORNADAS
-- =========================================================
CREATE TABLE IF NOT EXISTS public.journeys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  cover_url text,
  goal text,
  total_days integer NOT NULL DEFAULT 30,
  order_num integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.journeys TO authenticated;
GRANT ALL ON public.journeys TO service_role;
ALTER TABLE public.journeys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "journeys_read" ON public.journeys FOR SELECT TO authenticated USING (active = true);
CREATE POLICY "journeys_admin_all" ON public.journeys FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER update_journeys_updated_at BEFORE UPDATE ON public.journeys
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.journey_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id uuid NOT NULL REFERENCES public.journeys(id) ON DELETE CASCADE,
  day_num integer NOT NULL,
  title text,
  focus text,
  workout_id uuid,
  task text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (journey_id, day_num)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.journey_days TO authenticated;
GRANT ALL ON public.journey_days TO service_role;
ALTER TABLE public.journey_days ENABLE ROW LEVEL SECURITY;
CREATE POLICY "journey_days_read" ON public.journey_days FOR SELECT TO authenticated USING (true);
CREATE POLICY "journey_days_admin_all" ON public.journey_days FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

INSERT INTO public.journeys (slug, name, description, goal, total_days, order_num)
VALUES ('jornada-inicial', 'Jornada Inicial', 'Primeiros 30 dias para criar constância em treino, alimentação e hábitos.', 'condicionamento', 30, 1)
ON CONFLICT (slug) DO NOTHING;

-- =========================================================
-- 8. HÁBITOS
-- =========================================================
CREATE TABLE IF NOT EXISTS public.habits_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  water_ml integer NOT NULL DEFAULT 0,
  water_goal_ml integer NOT NULL DEFAULT 2500,
  sleep_hours numeric,
  sleep_quality text,
  sleep_start time,
  sleep_end time,
  sleep_goal_hours numeric DEFAULT 8,
  workout_done boolean NOT NULL DEFAULT false,
  meals_ok boolean NOT NULL DEFAULT false,
  steps integer,
  energy integer,
  notes text,
  day_completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, entry_date)
);
CREATE INDEX IF NOT EXISTS idx_habits_daily_user_date ON public.habits_daily (user_id, entry_date DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.habits_daily TO authenticated;
GRANT ALL ON public.habits_daily TO service_role;
ALTER TABLE public.habits_daily ENABLE ROW LEVEL SECURITY;
CREATE POLICY "habits_own_select" ON public.habits_daily FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "habits_own_insert" ON public.habits_daily FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "habits_own_update" ON public.habits_daily FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "habits_own_delete" ON public.habits_daily FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER update_habits_daily_updated_at BEFORE UPDATE ON public.habits_daily
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- 9. MEDIDAS / EVOLUÇÃO
-- =========================================================
CREATE TABLE IF NOT EXISTS public.body_measurements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  measured_at date NOT NULL DEFAULT CURRENT_DATE,
  waist_cm numeric,
  hip_cm numeric,
  chest_cm numeric,
  arm_cm numeric,
  thigh_cm numeric,
  body_fat_pct numeric,
  photo_url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_body_measurements_user ON public.body_measurements (user_id, measured_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.body_measurements TO authenticated;
GRANT ALL ON public.body_measurements TO service_role;
ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "measure_own_select" ON public.body_measurements FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "measure_own_insert" ON public.body_measurements FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "measure_own_update" ON public.body_measurements FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "measure_own_delete" ON public.body_measurements FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =========================================================
-- 10. TREINOS E RECEITAS: novos campos
-- =========================================================
ALTER TABLE public.workouts
  ADD COLUMN IF NOT EXISTS location text DEFAULT 'casa',
  ADD COLUMN IF NOT EXISTS goal text,
  ADD COLUMN IF NOT EXISTS equipment text[],
  ADD COLUMN IF NOT EXISTS instructions text,
  ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true;

CREATE POLICY "workouts_admin_all" ON public.workouts FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
GRANT INSERT, UPDATE, DELETE ON public.workouts TO authenticated;

ALTER TABLE public.recipes
  ADD COLUMN IF NOT EXISTS goals text[],
  ADD COLUMN IF NOT EXISTS diet_tags text[],
  ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true;

CREATE POLICY "recipes_admin_all" ON public.recipes FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
GRANT INSERT, UPDATE, DELETE ON public.recipes TO authenticated;

-- =========================================================
-- 11. WHATSAPP / ATENDIMENTO
-- =========================================================
CREATE TABLE IF NOT EXISTS public.whatsapp_instances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  provider text NOT NULL DEFAULT 'evolution',
  base_url text,
  instance_name text,
  status text NOT NULL DEFAULT 'disconnected',
  qr_code text,
  webhook_url text,
  connected_at timestamptz,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_instances TO authenticated;
GRANT ALL ON public.whatsapp_instances TO service_role;
ALTER TABLE public.whatsapp_instances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wa_instances_admin_all" ON public.whatsapp_instances FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER update_wa_instances_updated_at BEFORE UPDATE ON public.whatsapp_instances
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id uuid REFERENCES public.whatsapp_instances(id) ON DELETE SET NULL,
  user_id uuid,
  phone text NOT NULL,
  contact_name text,
  channel text NOT NULL DEFAULT 'whatsapp',
  status text NOT NULL DEFAULT 'open',
  handled_by text NOT NULL DEFAULT 'agent',
  assigned_to uuid,
  tags text[],
  last_message_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_conversations_phone_channel ON public.conversations (channel, phone);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversations TO authenticated;
GRANT ALL ON public.conversations TO service_role;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "conv_admin_all" ON public.conversations FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "conv_own_read" ON public.conversations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  direction text NOT NULL,
  sender text,
  content text,
  media_url text,
  message_type text NOT NULL DEFAULT 'text',
  external_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_messages_conv ON public.messages (conversation_id, created_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_messages_external ON public.messages (external_id) WHERE external_id IS NOT NULL;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "messages_admin_all" ON public.messages FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "messages_own_read" ON public.messages FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND c.user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public.conversation_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  admin_id uuid,
  note text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversation_notes TO authenticated;
GRANT ALL ON public.conversation_notes TO service_role;
ALTER TABLE public.conversation_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "conv_notes_admin_all" ON public.conversation_notes FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =========================================================
-- 12. ATENDENTE DIGITAL
-- =========================================================
CREATE TABLE IF NOT EXISTS public.agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  greeting text,
  tone text,
  prompt text,
  rules text,
  goals text,
  business_hours text,
  transfer_message text,
  away_message text,
  model text DEFAULT 'google/gemini-2.5-flash',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agents TO authenticated;
GRANT ALL ON public.agents TO service_role;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agents_admin_all" ON public.agents FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON public.agents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.agents (name, greeting, tone, prompt, rules, goals, business_hours, transfer_message, away_message)
SELECT 'Personal Digital Secando em Casa',
       'Oi! Eu sou o seu personal online do Secando em Casa. Como posso te ajudar hoje?',
       'motivador, claro e direto',
       'Você é o personal online digital da plataforma Secando em Casa. Ajude o aluno com treinos em casa ou academia, alimentação, receitas, hábitos, água, sono e evolução. Use sempre os dados reais do aluno.',
       'Nunca prometa resultados garantidos. Nunca dê orientação médica ou clínica. Não invente dados do aluno. Se não conseguir resolver, transfira para atendimento humano.',
       'Fazer onboarding, identificar objetivo e local de treino, recomendar treino e receita, registrar água, sono, peso e treino concluído, enviar lembretes e retomada.',
       'Seg a Sex, 08:00 às 20:00',
       'Vou te transferir para um atendimento humano, tudo bem? Em breve alguém do time responde por aqui.',
       'Nosso time está fora do horário de atendimento agora, mas eu já registrei sua mensagem.'
WHERE NOT EXISTS (SELECT 1 FROM public.agents);

-- =========================================================
-- 13. GOVERNANÇA E CONFIGURAÇÕES
-- =========================================================
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid,
  action text NOT NULL,
  entity text,
  entity_id text,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.admin_audit_log TO authenticated;
GRANT ALL ON public.admin_audit_log TO service_role;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_admin_read" ON public.admin_audit_log FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "audit_admin_insert" ON public.admin_audit_log FOR INSERT TO authenticated WITH CHECK (public.is_admin() AND admin_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.automation_failures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  error text,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.automation_failures TO authenticated;
GRANT ALL ON public.automation_failures TO service_role;
ALTER TABLE public.automation_failures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "autofail_admin_read" ON public.automation_failures FOR SELECT TO authenticated USING (public.is_admin());

CREATE TABLE IF NOT EXISTS public.ai_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  function_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_date ON public.ai_usage (user_id, created_at DESC);
GRANT SELECT ON public.ai_usage TO authenticated;
GRANT ALL ON public.ai_usage TO service_role;
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_usage_own_read" ON public.ai_usage FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());

CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_public boolean NOT NULL DEFAULT false,
  description text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.app_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings_public_read" ON public.app_settings FOR SELECT USING (is_public = true);
CREATE POLICY "settings_admin_all" ON public.app_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON public.app_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.app_settings (key, value, is_public, description) VALUES
  ('brand', '{"name":"Secando em Casa","tagline":"Seu personal online para treinos, alimentação e evolução."}'::jsonb, true, 'Identidade da plataforma'),
  ('ai_limits', '{"daily_per_user":30}'::jsonb, false, 'Limite diário de chamadas de IA por aluno'),
  ('evolution', '{"base_url":"","instance":""}'::jsonb, false, 'Configuração pública da Evolution API (a chave fica em segredo)')
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION public.check_ai_limit(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _limit integer;
  _used integer;
BEGIN
  SELECT COALESCE((value->>'daily_per_user')::int, 30) INTO _limit FROM public.app_settings WHERE key = 'ai_limits';
  SELECT count(*) INTO _used FROM public.ai_usage
    WHERE user_id = _user_id AND created_at > now() - interval '1 day';
  RETURN _used < COALESCE(_limit, 30);
END;
$$;