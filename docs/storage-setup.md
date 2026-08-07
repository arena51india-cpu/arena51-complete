# Storage Setup

The Admin CMS (games, gallery, offers, logo, SEO share image) uploads images
directly to Supabase Storage from the browser. Before using any image
upload field, create the bucket once:

1. In the Supabase dashboard, go to **Storage** → **New bucket**.
2. Name it exactly `arena51-public`.
3. Toggle **Public bucket** on (uploaded images need to be publicly
   viewable on the website — no sensitive files should go in this bucket).
4. No extra policy setup is required for reads (public buckets allow
   anonymous `SELECT`), but uploads are still gated by Supabase Auth —
   only signed-in staff can upload, enforced by the same `is_staff()`
   check used everywhere else, applied via a Storage policy:

   ```sql
   create policy "staff upload to public bucket"
   on storage.objects for insert
   with check (
     bucket_id = 'arena51-public' and public.is_staff()
   );

   create policy "public read public bucket"
   on storage.objects for select
   using (bucket_id = 'arena51-public');
   ```

   Run this in the SQL editor after creating the bucket.

Images are organized into folders automatically by the upload component:
`games/`, `gallery/`, `offers/`, `branding/`.
