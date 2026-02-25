-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
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

-- RLS policy for user_roles: users can see their own roles, admins can see all
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Create tags table
CREATE TABLE public.tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    color TEXT DEFAULT 'secondary',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on tags
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- Tags are readable by everyone
CREATE POLICY "Tags are publicly readable"
ON public.tags
FOR SELECT
TO anon, authenticated
USING (true);

-- Only admins can manage tags
CREATE POLICY "Admins can insert tags"
ON public.tags
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update tags"
ON public.tags
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete tags"
ON public.tags
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create prompts table
CREATE TABLE public.prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Vidéo', 'Image')),
    style TEXT NOT NULL,
    prompt TEXT NOT NULL,
    is_nsfw BOOLEAN DEFAULT false,
    recommended_tool_name TEXT,
    recommended_tool_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on prompts
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

-- Prompts are readable by everyone
CREATE POLICY "Prompts are publicly readable"
ON public.prompts
FOR SELECT
TO anon, authenticated
USING (true);

-- Only admins can manage prompts
CREATE POLICY "Admins can insert prompts"
ON public.prompts
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update prompts"
ON public.prompts
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete prompts"
ON public.prompts
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create prompt_images table for multiple images per prompt
CREATE TABLE public.prompt_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt_id UUID REFERENCES public.prompts(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on prompt_images
ALTER TABLE public.prompt_images ENABLE ROW LEVEL SECURITY;

-- Images are readable by everyone
CREATE POLICY "Prompt images are publicly readable"
ON public.prompt_images
FOR SELECT
TO anon, authenticated
USING (true);

-- Only admins can manage images
CREATE POLICY "Admins can insert prompt images"
ON public.prompt_images
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update prompt images"
ON public.prompt_images
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete prompt images"
ON public.prompt_images
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at on prompts
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_prompts_updated_at
BEFORE UPDATE ON public.prompts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default tags
INSERT INTO public.tags (name, color) VALUES
    ('Cinématique', 'secondary'),
    ('Produit', 'secondary'),
    ('Viral', 'secondary'),
    ('Trend', 'secondary'),
    ('NSFW', 'destructive');