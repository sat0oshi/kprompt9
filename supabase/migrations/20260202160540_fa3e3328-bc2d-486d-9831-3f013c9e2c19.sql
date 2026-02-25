-- Create storage bucket for prompt assets (images/videos)
INSERT INTO storage.buckets (id, name, public)
VALUES ('prompt-assets', 'prompt-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to view files (public bucket)
CREATE POLICY "Public can view prompt assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'prompt-assets');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload prompt assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'prompt-assets');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update prompt assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'prompt-assets');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete prompt assets"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'prompt-assets');