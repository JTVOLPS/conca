-- Migration: 00010_audit.sql
-- Enable audit tracking on critical tables
-- NOTE: supa_audit extension must be enabled in Supabase dashboard first
-- Uncomment the lines below after enabling the extension:

-- create extension if not exists "supa_audit" cascade;
-- select audit.enable_tracking('public.deals'::regclass);
-- select audit.enable_tracking('public.contacts'::regclass);
-- select audit.enable_tracking('public.companies'::regclass);
-- select audit.enable_tracking('public.properties'::regclass);
-- select audit.enable_tracking('public.deal_economics'::regclass);

-- Fallback: simple audit log table for tracking changes
create table public.audit_log (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid references public.orgs(id) on delete cascade,
  user_id       uuid references auth.users(id),
  action        text not null check (action in ('insert', 'update', 'delete')),
  table_name    text not null,
  record_id     uuid not null,
  old_data      jsonb,
  new_data      jsonb,
  created_at    timestamptz not null default now()
);

create index idx_audit_log_org on public.audit_log(org_id);
create index idx_audit_log_record on public.audit_log(table_name, record_id);
create index idx_audit_log_created on public.audit_log(created_at);

alter table public.audit_log enable row level security;

create policy "audit_select" on public.audit_log for select
  using (org_id = auth.org_id());
create policy "audit_insert" on public.audit_log for insert
  with check (org_id = auth.org_id());
