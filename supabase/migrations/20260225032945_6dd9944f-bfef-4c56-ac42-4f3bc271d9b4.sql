
-- Create click tracking table
CREATE TABLE public.click_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page text NOT NULL,
  element text,
  element_text text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.click_events ENABLE ROW LEVEL SECURITY;

-- Anyone can insert clicks (anonymous tracking)
CREATE POLICY "Anyone can insert clicks"
ON public.click_events
FOR INSERT
WITH CHECK (true);

-- Only admins can view clicks
CREATE POLICY "Admins can view clicks"
ON public.click_events
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));
