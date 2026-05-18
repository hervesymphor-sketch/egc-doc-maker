
CREATE TABLE public.school_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'EGC Martinique',
  rne text DEFAULT '',
  address text DEFAULT '',
  city text DEFAULT '',
  postal_code text DEFAULT '',
  signatory_name text DEFAULT '',
  signatory_title text DEFAULT 'Responsable pédagogique',
  logo_url text DEFAULT '',
  google_sheet_id text DEFAULT '1IQoyNYzV69U8iVveJHUeUlHNtpmhdNTx',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.school_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read settings"
  ON public.school_settings FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Authenticated users can update settings"
  ON public.school_settings FOR UPDATE
  TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert settings"
  ON public.school_settings FOR INSERT
  TO authenticated WITH CHECK (true);

-- Seed one row
INSERT INTO public.school_settings (name) VALUES ('EGC Martinique');

-- Storage bucket for logos
INSERT INTO storage.buckets (id, name, public) VALUES ('school-assets', 'school-assets', true);

CREATE POLICY "Public can read school assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'school-assets');

CREATE POLICY "Authenticated can upload school assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'school-assets');

CREATE POLICY "Authenticated can update school assets"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'school-assets');
