CREATE TABLE public.page_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visited_at timestamptz NOT NULL DEFAULT now(),
  page_path text NOT NULL DEFAULT '/'
);

ALTER TABLE public.page_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert visits"
  ON public.page_visits FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can read visits"
  ON public.page_visits FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));