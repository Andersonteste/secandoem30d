-- 1. Normaliza níveis dos treinos
UPDATE public.workouts SET level = CASE
  WHEN lower(level) IN ('iniciante','beginner') THEN 'beginner'
  WHEN lower(level) IN ('intermediario','intermediário','intermediate') THEN 'intermediate'
  WHEN lower(level) IN ('avancado','avançado','advanced') THEN 'advanced'
  ELSE 'beginner' END;

-- 2. Objetivo dos treinos a partir do título
UPDATE public.workouts SET goal = CASE
  WHEN title ILIKE '%along%' OR title ILIKE '%yoga%' OR title ILIKE '%pilates%' OR title ILIKE '%mobil%' OR title ILIKE '%relaxa%' THEN 'mobilidade'
  WHEN title ILIKE '%glúteo%' OR title ILIKE '%gluteo%' OR title ILIKE '%aumentar%' OR title ILIKE '%pesado%' OR title ILIKE '%hipertrof%' THEN 'hipertrofia'
  WHEN title ILIKE '%hiit%' OR title ILIKE '%corpo todo%' OR title ILIKE '%full body%' OR title ILIKE '%condicion%' THEN 'condicionamento'
  ELSE 'emagrecimento' END
WHERE goal IS NULL;

UPDATE public.workouts SET location = COALESCE(location, 'casa'), active = COALESCE(active, true);

-- 3. Local de treino padrão para alunos sem escolha
UPDATE public.profiles SET training_location = 'casa' WHERE training_location IS NULL;

-- 4. Dias da Jornada Inicial a partir do conteúdo diário
INSERT INTO public.journey_days (journey_id, day_num, title, focus, task, workout_id)
SELECT j.id, dm.day_num, dm.title, NULL,
       dm.task,
       (SELECT w.id FROM public.workouts w WHERE w.seq = ((dm.day_num - 1) % GREATEST((SELECT count(*) FROM public.workouts), 1)) + 1 LIMIT 1)
FROM public.daily_meals dm
CROSS JOIN (SELECT id FROM public.journeys ORDER BY order_num, created_at LIMIT 1) j
WHERE dm.day_num IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.journey_days d WHERE d.journey_id = j.id AND d.day_num = dm.day_num);

-- 5. Planos de assinatura configuráveis
INSERT INTO public.plans (name, description, period, price_label, checkout_url, highlight, order_num, active)
SELECT * FROM (VALUES
  ('Mensal', 'Acesso completo à plataforma, renovado a cada mês.', 'monthly', NULL, 'https://pay.kiwify.com.br/0DZqpCK', false, 1, true),
  ('Trimestral', 'Acesso completo por 3 meses.', 'quarterly', NULL, 'https://pay.kiwify.com.br/0DZqpCK', false, 2, true),
  ('Semestral', 'Acesso completo por 6 meses.', 'semiannual', NULL, 'https://pay.kiwify.com.br/0DZqpCK', false, 3, true),
  ('Anual', 'Acesso completo por 12 meses, melhor custo por mês.', 'annual', NULL, 'https://pay.kiwify.com.br/0DZqpCK', true, 4, true)
) AS v(name, description, period, price_label, checkout_url, highlight, order_num, active)
WHERE NOT EXISTS (SELECT 1 FROM public.plans);

-- 6. Primeiros materiais da Biblioteca
INSERT INTO public.library_items (title, description, category, item_type, goals, native_content, requires_access, order_num, active)
SELECT * FROM (VALUES
  ('Como começar na plataforma', 'Passo a passo para organizar sua primeira semana.', 'Início', 'guia', ARRAY['emagrecimento','ganho_massa','manutencao'],
   E'1. Complete seu perfil com objetivo, nível e local de treino.\n2. Abra a aba Hoje todos os dias e siga o treino recomendado.\n3. Registre água, sono e treino na aba Hábitos.\n4. Pese-se uma vez por semana, sempre no mesmo horário, e registre em Evolução.\n5. Use a aba Alimentação para escolher receitas de acordo com seu objetivo.\n6. Marque "Concluir o dia" para manter sua sequência.', true, 1, true),
  ('Lista de compras da semana', 'Base de compras simples e barata para a rotina.', 'Alimentação', 'lista', ARRAY['baixo_orcamento','rotina_rapida'],
   E'Proteínas: ovos, frango, carne moída magra, atum, iogurte natural.\nCarboidratos: arroz, batata-doce, mandioca, aveia, pão integral.\nVegetais: alface, tomate, cenoura, brócolis, abobrinha, cebola, alho.\nFrutas: banana, maçã, mamão, laranja, limão.\nGorduras boas: azeite, castanhas, abacate.\nExtras: café, chá verde, canela, temperos naturais.', true, 2, true),
  ('Treino em casa sem equipamentos', 'Como treinar bem usando só o peso do corpo.', 'Treinos', 'guia', ARRAY['emagrecimento','manutencao'],
   E'Aqueça 5 minutos com movimentos leves.\nCircuito: 12 agachamentos, 10 flexões (pode ser com os joelhos no chão), 20 segundos de prancha, 20 elevações de quadril.\nFaça de 3 a 4 voltas, com 60 segundos de descanso entre elas.\nFinalize com 5 minutos de alongamento.\nSe sentir dor (não é o mesmo que cansaço), pare e ajuste a intensidade.', true, 3, true),
  ('Sono e hidratação', 'Dois hábitos que mudam seu resultado.', 'Hábitos', 'guia', ARRAY['emagrecimento','manutencao'],
   E'Sono: procure dormir entre 7 e 9 horas, com horários parecidos todos os dias. Reduza telas 30 minutos antes de dormir.\nÁgua: comece o dia com um copo de água e distribua sua meta ao longo do dia. Deixe uma garrafa sempre por perto.\nRegistre os dois na aba Hábitos para acompanhar sua média.', true, 4, true)
) AS v(title, description, category, item_type, goals, native_content, requires_access, order_num, active)
WHERE NOT EXISTS (SELECT 1 FROM public.library_items);