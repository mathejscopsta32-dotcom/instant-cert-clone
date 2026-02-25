-- Add city column to click_events
ALTER TABLE public.click_events ADD COLUMN IF NOT EXISTS city text;