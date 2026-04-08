-- Migration: 00013_operating_statements.sql
-- Monthly financial line items for property operating statements

create table public.operating_statements (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references public.orgs(id) on delete cascade,
  property_id     uuid not null references public.properties(id) on delete cascade,
  period_year     integer not null,
  period_month    integer not null check (period_month between 1 and 12),
  category        text not null
                  check (category in ('revenue', 'operating_expense', 'capital_expense')),
  line_item       text not null,
  actual_amount   numeric(15,2),
  budget_amount   numeric(15,2),
  notes           text,
  created_by      uuid references auth.users(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  unique (org_id, property_id, period_year, period_month, category, line_item)
);

create index idx_opstatements_org on public.operating_statements(org_id);
create index idx_opstatements_property_period on public.operating_statements(property_id, period_year, period_month);

create trigger set_operating_statements_updated_at
  before update on public.operating_statements
  for each row execute function public.set_updated_at();
