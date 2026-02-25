-- Create junction table for prompt-tags many-to-many relationship
CREATE TABLE public.prompt_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(prompt_id, tag_id)
);

-- Enable RLS
ALTER TABLE public.prompt_tags ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Prompt tags are publicly readable"
ON public.prompt_tags FOR SELECT
USING (true);

-- Admin write access
CREATE POLICY "Admins can insert prompt tags"
ON public.prompt_tags FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete prompt tags"
ON public.prompt_tags FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Index for performance
CREATE INDEX idx_prompt_tags_prompt_id ON public.prompt_tags(prompt_id);
CREATE INDEX idx_prompt_tags_tag_id ON public.prompt_tags(tag_id);