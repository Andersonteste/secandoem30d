-- Add column to track if user has completed the app tour
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tour_completed boolean DEFAULT false;