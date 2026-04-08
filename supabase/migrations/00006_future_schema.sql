-- Migration: 00006_future_schema.sql
-- Schema for future modules (documents, tasks) -- no UI in Phase 1

create table public.documents (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references public.orgs(id) on delete cascade,
  storage_path    text not null,
  file_name       text not null,
  file_size       bigint,
  mime_type       text,
  entity_type     text not null check (entity_type in (
                    'deal', 'property', 'contact', 'company'
                  )),
  entity_id       uuid not null,
  category        text,
  tags            text[] not null default '{}',
  version         integer not null default 1,
  uploaded_by     uuid references auth.users(id),
  created_at      timestamptz not null default now()
);

create index idx_documents_org on public.documents(org_id);
create index idx_documents_entity on public.documents(entity_type, entity_id);

create table public.tasks (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references public.orgs(id) on delete cascade,
  title           text not null,
  description     text,
  status          text not null default 'todo' check (status in ('todo', 'in_progress', 'done', 'cancelled')),
  priority        text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  due_date        date,
  entity_type     text check (entity_type in ('deal', 'property', 'contact', 'company')),
  entity_id       uuid,
  assigned_to     uuid references auth.users(id),
  created_by      uuid references auth.users(id),
  completed_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_tasks_org on public.tasks(org_id);
create index idx_tasks_assigned on public.tasks(assigned_to) where status != 'done';
create index idx_tasks_entity on public.tasks(entity_type, entity_id);
