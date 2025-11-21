-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Create produtos_loja table
CREATE TABLE public.produtos_loja (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  imagem_url TEXT,
  preco_exibicao TEXT,
  link_afiliado TEXT NOT NULL,
  categoria TEXT NOT NULL,
  destaque BOOLEAN DEFAULT false,
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.produtos_loja ENABLE ROW LEVEL SECURITY;

-- RLS policies for produtos_loja
CREATE POLICY "Anyone can view active products"
ON public.produtos_loja
FOR SELECT
USING (ativo = true);

CREATE POLICY "Admins can insert products"
ON public.produtos_loja
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update products"
ON public.produtos_loja
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete products"
ON public.produtos_loja
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Create clicks_afiliados table for tracking
CREATE TABLE public.clicks_afiliados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id UUID REFERENCES public.produtos_loja(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_agent TEXT,
  referrer TEXT
);

-- Enable RLS
ALTER TABLE public.clicks_afiliados ENABLE ROW LEVEL SECURITY;

-- RLS policies for clicks_afiliados
CREATE POLICY "Anyone can insert clicks"
ON public.clicks_afiliados
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all clicks"
ON public.clicks_afiliados
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Create indexes for better performance
CREATE INDEX idx_produtos_loja_categoria ON public.produtos_loja(categoria);
CREATE INDEX idx_produtos_loja_ativo ON public.produtos_loja(ativo);
CREATE INDEX idx_produtos_loja_ordem ON public.produtos_loja(ordem);
CREATE INDEX idx_clicks_afiliados_produto_id ON public.clicks_afiliados(produto_id);
CREATE INDEX idx_clicks_afiliados_clicked_at ON public.clicks_afiliados(clicked_at DESC);

-- Create trigger for updated_at
CREATE TRIGGER update_produtos_loja_updated_at
BEFORE UPDATE ON public.produtos_loja
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();