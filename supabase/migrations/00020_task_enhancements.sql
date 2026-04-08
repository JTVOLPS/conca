-- Migration: 00020_task_enhancements.sql
-- Add position column for kanban ordering and updated_at trigger

alter table public.tasks
  add column if not exists position integer not null default 0;

create index idx_tasks_status_position on public.tasks(status, position);

-- Add updated_at trigger (column exists but no trigger)
create trigger set_tasks_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();
