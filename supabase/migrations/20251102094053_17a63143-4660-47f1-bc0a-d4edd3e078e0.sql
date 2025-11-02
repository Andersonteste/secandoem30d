-- Create storage bucket for community post images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'post-images',
  'post-images',
  true,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png']
);

-- Create storage policies for post images
CREATE POLICY "Anyone can view post images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'post-images');

CREATE POLICY "Authenticated users can upload post images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'post-images' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their own post images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'post-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own post images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'post-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);