-- Create table for AI generated recipes
CREATE TABLE public.receitas_geradas_ia (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ingredientes_input TEXT NOT NULL,
  receitas_geradas JSONB NOT NULL,
  favorita BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.receitas_geradas_ia ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own generated recipes"
ON public.receitas_geradas_ia
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own generated recipes"
ON public.receitas_geradas_ia
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own generated recipes"
ON public.receitas_geradas_ia
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generated recipes"
ON public.receitas_geradas_ia
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX idx_receitas_geradas_ia_user_id ON public.receitas_geradas_ia(user_id);
CREATE INDEX idx_receitas_geradas_ia_created_at ON public.receitas_geradas_ia(created_at DESC);