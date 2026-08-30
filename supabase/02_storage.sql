-- Allow anyone to upload photos (no accounts)
create policy "public upload gift photos"
  on storage.objects for insert
  with check (bucket_id = 'gift-photos');

-- Allow anyone to read photos (needed so the recipient can see them)
create policy "public read gift photos"
  on storage.objects for select
  using (bucket_id = 'gift-photos');
