-- Create bonus table with same structure as recipes
CREATE TABLE public.bonus (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT,
  ingredients JSONB,
  steps TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.bonus ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to view bonus content
CREATE POLICY "Anyone can view bonus content" 
ON public.bonus 
FOR SELECT 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_bonus_updated_at
BEFORE UPDATE ON public.bonus
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();