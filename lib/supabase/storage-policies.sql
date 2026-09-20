-- Run this in the Supabase SQL Editor after creating the private `media` bucket.
-- Storage objects are only accessible to signed-in users.

create policy "Authenticated users can upload career documents"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'media');

create policy "Authenticated users can read career documents"
on storage.objects
for select
to authenticated
using (bucket_id = 'media');