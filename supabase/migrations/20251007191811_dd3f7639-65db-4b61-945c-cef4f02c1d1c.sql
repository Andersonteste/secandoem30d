-- 1) TABELAS ESSENCIAIS
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  age integer,
  weight_kg numeric,
  height_cm integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seq integer,
  title text NOT NULL,
  description text,
  youtube_url text,
  duration_min integer,
  level text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text,
  ingredients jsonb,
  steps text,
  photo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.daily_meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_num integer,
  title text,
  meals jsonb,
  task text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.challenge_progress (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  day_num integer NOT NULL,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  PRIMARY KEY (user_id, day_num)
);

CREATE TABLE IF NOT EXISTS public.food_diary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  entry_date date NOT NULL,
  notes text,
  photos jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_diary ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- RLS Policies for workouts (public read)
CREATE POLICY "Anyone can view workouts"
ON public.workouts FOR SELECT
USING (true);

-- RLS Policies for recipes (public read)
CREATE POLICY "Anyone can view recipes"
ON public.recipes FOR SELECT
USING (true);

-- RLS Policies for daily_meals (public read)
CREATE POLICY "Anyone can view daily meals"
ON public.daily_meals FOR SELECT
USING (true);

-- RLS Policies for challenge_progress
CREATE POLICY "Users can view own progress"
ON public.challenge_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
ON public.challenge_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
ON public.challenge_progress FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for food_diary
CREATE POLICY "Users can view own diary"
ON public.food_diary FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diary"
ON public.food_diary FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own diary"
ON public.food_diary FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own diary"
ON public.food_diary FOR DELETE
USING (auth.uid() = user_id);

-- 2) FUNCTIONS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, display_name, age, weight_kg, height_cm)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'User'),
    COALESCE((NEW.raw_user_meta_data->>'age')::integer, NULL),
    COALESCE((NEW.raw_user_meta_data->>'weight_kg')::numeric, NULL),
    COALESCE((NEW.raw_user_meta_data->>'height_cm')::integer, NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 3) TRIGGERS
CREATE TRIGGER trigger_handle_new_user
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER trg_update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_update_workouts_updated_at
BEFORE UPDATE ON public.workouts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_update_recipes_updated_at
BEFORE UPDATE ON public.recipes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_update_daily_meals_updated_at
BEFORE UPDATE ON public.daily_meals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();