-- Migration: 00019_storage_bucket.sql
-- Create documents storage bucket and policies
-- Note: bucket creation via SQL may not work in all Supabase setups.
-- If this fails, create the bucket via the Supabase dashboard instead.

insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- Storage policies: scope access by org_id folder
-- Path convention: {org_id}/{entity_type}/{entity_id}/{timestamp}_{filename}

create policy "org_documents_select" on storage.objects for select
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = (auth.org_id())::text
  );

create policy "org_documents_insert" on storage.objects for insert
  with check (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = (auth.org_id())::text
  );

create policy "org_documents_update" on storage.objects for update
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = (auth.org_id())::text
  );

create policy "org_documents_delete" on storage.objects for delete
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = (auth.org_id())::text
  );
