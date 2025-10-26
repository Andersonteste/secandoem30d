-- Create weight_logs table for tracking weight progress
CREATE TABLE public.weight_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  weight_kg NUMERIC NOT NULL,
  measured_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for weight_logs
CREATE POLICY "Users can view own weight logs"
ON public.weight_logs
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weight logs"
ON public.weight_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own weight logs"
ON public.weight_logs
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_weight_logs_user_id ON public.weight_logs(user_id);
CREATE INDEX idx_weight_logs_measured_at ON public.weight_logs(measured_at DESC);