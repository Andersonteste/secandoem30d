-- ===================== exercise-videos =====================
DROP POLICY IF EXISTS "exercise_videos_admin_all" ON storage.objects;
CREATE POLICY "exercise_videos_admin_all" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'exercise-videos' AND public.is_admin())
  WITH CHECK (bucket_id = 'exercise-videos' AND public.is_admin() AND lower(name) LIKE '%.mp4');

DROP POLICY IF EXISTS "exercise_videos_active_access_read" ON storage.objects;
CREATE POLICY "exercise_videos_active_access_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'exercise-videos' AND public.has_active_access(auth.uid()));

-- =================== exercise-thumbnails ===================
DROP POLICY IF EXISTS "exercise_thumbs_admin_all" ON storage.objects;
CREATE POLICY "exercise_thumbs_admin_all" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'exercise-thumbnails' AND public.is_admin())
  WITH CHECK (bucket_id = 'exercise-thumbnails' AND public.is_admin() AND lower(name) LIKE '%.webp');

DROP POLICY IF EXISTS "exercise_thumbs_public_read" ON storage.objects;
CREATE POLICY "exercise_thumbs_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'exercise-thumbnails');