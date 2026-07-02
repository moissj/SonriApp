-- Aislamiento por usuario en el bucket 'logos'. El path es '<uid>/logo.ext',
-- asi que la primera carpeta debe coincidir con el uid del usuario.
-- Lectura publica (logo de marca del consultorio, no es dato clinico).
create policy "logos: lectura publica" on storage.objects
  for select using (bucket_id = 'logos');
create policy "logos: subir en carpeta propia" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'logos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "logos: actualizar carpeta propia" on storage.objects
  for update to authenticated
  using (bucket_id = 'logos' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'logos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "logos: eliminar carpeta propia" on storage.objects
  for delete to authenticated
  using (bucket_id = 'logos' and (storage.foldername(name))[1] = auth.uid()::text);;
