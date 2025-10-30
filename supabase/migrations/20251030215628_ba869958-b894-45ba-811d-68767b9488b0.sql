-- Create banners table
CREATE TABLE public.banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  redirect_link TEXT NOT NULL,
  title TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  order_num INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing active banners
CREATE POLICY "Anyone can view active banners" 
ON public.banners 
FOR SELECT 
USING (is_active = true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_banners_updated_at
BEFORE UPDATE ON public.banners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_banners_active_order ON public.banners(is_active, order_num) WHERE is_active = true;