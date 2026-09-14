-- Enum de status de revisão
DO $$ BEGIN
  CREATE TYPE public.exercise_review_status AS ENUM ('pending_review', 'published', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =========================== exercises ===========================
CREATE TABLE IF NOT EXISTS public.exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  original_filename text,
  video_path text UNIQUE,
  thumbnail_path text,
  primary_muscle text,
  secondary_muscles text[] NOT NULL DEFAULT '{}',
  equipment text[] NOT NULL DEFAULT '{}',
  environments text[] NOT NULL DEFAULT '{}',
  movement_pattern text,
  difficulty text,
  laterality text,
  instructions text,
  cautions text,
  content_hash text UNIQUE,
  review_status public.exercise_review_status NOT NULL DEFAULT 'pending_review',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.exercises
  DROP CONSTRAINT IF EXISTS exercises_slug_format_check;
ALTER TABLE public.exercises
  ADD CONSTRAINT exercises_slug_format_check CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');

ALTER TABLE public.exercises DROP CONSTRAINT IF EXISTS exercises_difficulty_check;
ALTER TABLE public.exercises
  ADD CONSTRAINT exercises_difficulty_check
  CHECK (difficulty IS NULL OR difficulty IN ('beginner','intermediate','advanced'));

ALTER TABLE public.exercises DROP CONSTRAINT IF EXISTS exercises_laterality_check;
ALTER TABLE public.exercises
  ADD CONSTRAINT exercises_laterality_check
  CHECK (laterality IS NULL OR laterality IN ('bilateral','unilateral','alternating'));

ALTER TABLE public.exercises DROP CONSTRAINT IF EXISTS exercises_environments_check;
ALTER TABLE public.exercises
  ADD CONSTRAINT exercises_environments_check
  CHECK (environments <@ ARRAY['casa','academia']::text[]);

CREATE INDEX IF NOT EXISTS exercises_review_status_idx ON public.exercises (review_status);
CREATE INDEX IF NOT EXISTS exercises_active_idx ON public.exercises (is_active);
CREATE INDEX IF NOT EXISTS exercises_primary_muscle_idx ON public.exercises (primary_muscle);
CREATE INDEX IF NOT EXISTS exercises_equipment_idx ON public.exercises USING gin (equipment);
CREATE INDEX IF NOT EXISTS exercises_environments_idx ON public.exercises USING gin (environments);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.exercises TO authenticated;
GRANT ALL ON public.exercises TO service_role;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage exercises" ON public.exercises;
CREATE POLICY "Admins manage exercises" ON public.exercises
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Active access reads published exercises" ON public.exercises;
CREATE POLICY "Active access reads published exercises" ON public.exercises
  FOR SELECT TO authenticated
  USING (
    public.has_active_access(auth.uid())
    AND review_status = 'published'
    AND is_active = true
  );

DROP TRIGGER IF EXISTS trg_exercises_updated_at ON public.exercises;
CREATE TRIGGER trg_exercises_updated_at BEFORE UPDATE ON public.exercises
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==================== exercise_substitutions ====================
CREATE TABLE IF NOT EXISTS public.exercise_substitutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id uuid NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  substitute_id uuid NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  reason text,
  priority integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT exercise_substitutions_unique UNIQUE (exercise_id, substitute_id),
  CONSTRAINT exercise_substitutions_not_self CHECK (exercise_id <> substitute_id)
);

CREATE INDEX IF NOT EXISTS exercise_substitutions_exercise_idx ON public.exercise_substitutions (exercise_id);
CREATE INDEX IF NOT EXISTS exercise_substitutions_substitute_idx ON public.exercise_substitutions (substitute_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.exercise_substitutions TO authenticated;
GRANT ALL ON public.exercise_substitutions TO service_role;
ALTER TABLE public.exercise_substitutions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage substitutions" ON public.exercise_substitutions;
CREATE POLICY "Admins manage substitutions" ON public.exercise_substitutions
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Active access reads substitutions" ON public.exercise_substitutions;
CREATE POLICY "Active access reads substitutions" ON public.exercise_substitutions
  FOR SELECT TO authenticated
  USING (
    public.has_active_access(auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.exercises e
      WHERE e.id = exercise_substitutions.substitute_id
        AND e.review_status = 'published' AND e.is_active = true
    )
  );

DROP TRIGGER IF EXISTS trg_exercise_substitutions_updated_at ON public.exercise_substitutions;
CREATE TRIGGER trg_exercise_substitutions_updated_at BEFORE UPDATE ON public.exercise_substitutions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ======================= training_programs =======================
CREATE TABLE IF NOT EXISTS public.training_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  goal text,
  environment text,
  level text,
  weeks integer NOT NULL DEFAULT 4,
  days_per_week integer,
  cover_url text,
  order_num integer NOT NULL DEFAULT 0,
  review_status public.exercise_review_status NOT NULL DEFAULT 'pending_review',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.training_programs DROP CONSTRAINT IF EXISTS training_programs_environment_check;
ALTER TABLE public.training_programs
  ADD CONSTRAINT training_programs_environment_check
  CHECK (environment IS NULL OR environment IN ('casa','academia','ambos'));

ALTER TABLE public.training_programs DROP CONSTRAINT IF EXISTS training_programs_weeks_check;
ALTER TABLE public.training_programs ADD CONSTRAINT training_programs_weeks_check CHECK (weeks > 0);

CREATE INDEX IF NOT EXISTS training_programs_status_idx ON public.training_programs (review_status, is_active);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.training_programs TO authenticated;
GRANT ALL ON public.training_programs TO service_role;
ALTER TABLE public.training_programs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage programs" ON public.training_programs;
CREATE POLICY "Admins manage programs" ON public.training_programs
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Active access reads programs" ON public.training_programs;
CREATE POLICY "Active access reads programs" ON public.training_programs
  FOR SELECT TO authenticated
  USING (public.has_active_access(auth.uid()) AND review_status = 'published' AND is_active = true);

DROP TRIGGER IF EXISTS trg_training_programs_updated_at ON public.training_programs;
CREATE TRIGGER trg_training_programs_updated_at BEFORE UPDATE ON public.training_programs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ======================= training_sessions =======================
CREATE TABLE IF NOT EXISTS public.training_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES public.training_programs(id) ON DELETE CASCADE,
  week_num integer NOT NULL DEFAULT 1,
  day_num integer NOT NULL DEFAULT 1,
  title text NOT NULL,
  focus text,
  duration_min integer,
  notes text,
  order_num integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT training_sessions_unique UNIQUE (program_id, week_num, day_num)
);

CREATE INDEX IF NOT EXISTS training_sessions_program_idx ON public.training_sessions (program_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.training_sessions TO authenticated;
GRANT ALL ON public.training_sessions TO service_role;
ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage sessions" ON public.training_sessions;
CREATE POLICY "Admins manage sessions" ON public.training_sessions
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Active access reads sessions" ON public.training_sessions;
CREATE POLICY "Active access reads sessions" ON public.training_sessions
  FOR SELECT TO authenticated
  USING (
    public.has_active_access(auth.uid())
    AND is_active = true
    AND EXISTS (
      SELECT 1 FROM public.training_programs p
      WHERE p.id = training_sessions.program_id
        AND p.review_status = 'published' AND p.is_active = true
    )
  );

DROP TRIGGER IF EXISTS trg_training_sessions_updated_at ON public.training_sessions;
CREATE TRIGGER trg_training_sessions_updated_at BEFORE UPDATE ON public.training_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ======================= session_exercises =======================
CREATE TABLE IF NOT EXISTS public.session_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.training_sessions(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES public.exercises(id) ON DELETE RESTRICT,
  order_num integer NOT NULL DEFAULT 0,
  block text,
  sets integer,
  reps text,
  duration_sec integer,
  rest_sec integer,
  tempo text,
  load_guidance text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT session_exercises_unique UNIQUE (session_id, order_num, exercise_id),
  CONSTRAINT session_exercises_volume_check CHECK (reps IS NOT NULL OR duration_sec IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS session_exercises_session_idx ON public.session_exercises (session_id, order_num);
CREATE INDEX IF NOT EXISTS session_exercises_exercise_idx ON public.session_exercises (exercise_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.session_exercises TO authenticated;
GRANT ALL ON public.session_exercises TO service_role;
ALTER TABLE public.session_exercises ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage session exercises" ON public.session_exercises;
CREATE POLICY "Admins manage session exercises" ON public.session_exercises
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Active access reads session exercises" ON public.session_exercises;
CREATE POLICY "Active access reads session exercises" ON public.session_exercises
  FOR SELECT TO authenticated
  USING (
    public.has_active_access(auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.training_sessions s
      JOIN public.training_programs p ON p.id = s.program_id
      WHERE s.id = session_exercises.session_id
        AND s.is_active = true
        AND p.review_status = 'published' AND p.is_active = true
    )
  );

DROP TRIGGER IF EXISTS trg_session_exercises_updated_at ON public.session_exercises;
CREATE TRIGGER trg_session_exercises_updated_at BEFORE UPDATE ON public.session_exercises
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();