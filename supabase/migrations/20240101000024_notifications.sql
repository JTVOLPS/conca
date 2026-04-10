-- Migration: 00024_notifications.sql
-- Activity feed / notification system

-- ---------------------------------------------------------------------------
-- notifications — per-user notifications scoped to an org
-- ---------------------------------------------------------------------------
create table public.notifications (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references public.orgs(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  type            text not null
                  check (type in (
                    'task_assigned',
                    'deal_stage_changed',
                    'lease_expiring',
                    'document_uploaded',
                    'commitment_created',
                    'distribution_created'
                  )),
  title           text not null,
  body            text,
  entity_type     text,        -- 'deal', 'property', 'contact', etc.
  entity_id       uuid,        -- polymorphic FK
  read_at         timestamptz, -- null = unread
  created_at      timestamptz not null default now()
);

create index idx_notifications_user_read on public.notifications(user_id, read_at);
create index idx_notifications_org on public.notifications(org_id);

-- RLS
alter table public.notifications enable row level security;

create policy "notifications_select" on public.notifications for select
  using (org_id = auth.org_id() and user_id = auth.uid());
create policy "notifications_insert" on public.notifications for insert
  with check (org_id = auth.org_id());
create policy "notifications_update" on public.notifications for update
  using (org_id = auth.org_id() and user_id = auth.uid())
  with check (org_id = auth.org_id() and user_id = auth.uid());
create policy "notifications_delete" on public.notifications for delete
  using (org_id = auth.org_id() and user_id = auth.uid());
