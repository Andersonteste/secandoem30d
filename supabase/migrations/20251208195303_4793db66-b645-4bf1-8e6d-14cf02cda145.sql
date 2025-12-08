-- Tabela para receitas favoritas dos usuários
CREATE TABLE public.user_favorite_recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, recipe_id)
);

-- Enable RLS
ALTER TABLE public.user_favorite_recipes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own favorites"
ON public.user_favorite_recipes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
ON public.user_favorite_recipes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove favorites"
ON public.user_favorite_recipes FOR DELETE
USING (auth.uid() = user_id);

-- Adicionar campos opcionais de metadados às receitas
ALTER TABLE public.recipes 
ADD COLUMN IF NOT EXISTS prep_time_min INTEGER,
ADD COLUMN IF NOT EXISTS servings INTEGER,
ADD COLUMN IF NOT EXISTS calories INTEGER,
ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'Fácil',
ADD COLUMN IF NOT EXISTS description TEXT;