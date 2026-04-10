-- Migration: 00014_capex_projects.sql
-- Capital expenditure project tracking

create table public.capex_projects (
  id                      uuid primary key default gen_random_uuid(),
  org_id                  uuid not null references public.orgs(id) on delete cascade,
  property_id             uuid not null references public.properties(id) on delete cascade,
  deal_id                 uuid references public.deals(id) on delete set null,
  name                    text not null,
  status                  text not null default 'planned'
                          check (status in ('planned', 'in_progress', 'completed', 'on_hold', 'cancelled')),
  budget_amount           numeric(15,2),
  spent_amount            numeric(15,2) default 0,
  start_date              date,
  target_completion_date  date,
  actual_completion_date  date,
  contractor              text,
  contractor_contact_id   uuid references public.contacts(id) on delete set null,
  description             text,
  notes                   text,
  created_by              uuid references auth.users(id),
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create index idx_capex_org on public.capex_projects(org_id);
create index idx_capex_property on public.capex_projects(property_id);
create index idx_capex_property_status on public.capex_projects(property_id, status);
create index idx_capex_deal on public.capex_projects(deal_id) where deal_id is not null;

create trigger set_capex_projects_updated_at
  before update on public.capex_projects
  for each row execute function public.set_updated_at();
