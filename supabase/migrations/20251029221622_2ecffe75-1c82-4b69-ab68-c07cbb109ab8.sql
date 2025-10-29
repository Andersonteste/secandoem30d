-- Add new columns to profiles table for personalization
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS goal text CHECK (goal IN ('lose_weight', 'gain_muscle', 'maintain', 'get_fit')),
ADD COLUMN IF NOT EXISTS experience_level text CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
ADD COLUMN IF NOT EXISTS available_days integer CHECK (available_days >= 1 AND available_days <= 7),
ADD COLUMN IF NOT EXISTS dietary_restrictions text[],
ADD COLUMN IF NOT EXISTS target_weight_kg numeric,
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding ON public.profiles(onboarding_completed);

-- Update existing profiles to mark them as completed if they have basic info
UPDATE public.profiles 
SET onboarding_completed = true 
WHERE weight_kg IS NOT NULL AND height_cm IS NOT NULL;