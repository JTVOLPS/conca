-- Migration: 00016_alter_documents.sql
-- Add version grouping and metadata columns to documents table

alter table public.documents
  add column notes text,
  add column updated_at timestamptz not null default now(),
  add column document_group_id uuid;

-- Backfill: set document_group_id = id for any existing rows
update public.documents set document_group_id = id where document_group_id is null;

-- Now set NOT NULL
alter table public.documents alter column document_group_id set not null;

-- Index for version history queries
create index idx_documents_group on public.documents(document_group_id, version desc);

-- Add missing UPDATE policy
create policy "documents_update" on public.documents for update
  using (org_id = auth.org_id())
  with check (org_id = auth.org_id());

create trigger set_documents_updated_at
  before update on public.documents
  for each row execute function public.set_updated_at();
