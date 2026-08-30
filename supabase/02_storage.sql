-- One More Candle — storage bucket for photos
-- Run this AFTER creating a public bucket named "gift-photos" in
-- Supabase Dashboard → Storage → New Bucket → name: gift-photos → Public bucket: ON

-- Allow anyone to upload photos (no accounts in V1)
create policy "public upload gift photos"
  on storage.objects for insert
  with check (bucket_id = 'gift-photos');

-- Allow anyone to read photos (needed so the recipient can see them)
create policy "public read gift photos"
  on storage.objects for select
  using (bucket_id = 'gift-photos');
