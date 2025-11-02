-- Add initial_weight_kg column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS initial_weight_kg numeric;

-- Add comment to the column
COMMENT ON COLUMN public.profiles.initial_weight_kg IS 'Initial weight recorded at the start, never updated after first entry';