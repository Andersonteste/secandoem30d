CREATE POLICY "Alunos com acesso ativo leem a biblioteca"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'library' AND public.has_active_access(auth.uid()));

CREATE POLICY "Admins enviam arquivos da biblioteca"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'library' AND public.is_admin());

CREATE POLICY "Admins atualizam arquivos da biblioteca"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'library' AND public.is_admin());

CREATE POLICY "Admins removem arquivos da biblioteca"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'library' AND public.is_admin());