-- Migration: 00015_debt_instruments.sql
-- Debt / loan tracking per property or deal

create table public.debt_instruments (
  id                    uuid primary key default gen_random_uuid(),
  org_id                uuid not null references public.orgs(id) on delete cascade,
  property_id           uuid references public.properties(id) on delete set null,
  deal_id               uuid references public.deals(id) on delete set null,
  lender_company_id     uuid references public.companies(id) on delete set null,
  loan_name             text not null,
  loan_type             text not null
                        check (loan_type in ('permanent', 'bridge', 'construction', 'mezzanine', 'line_of_credit', 'other')),
  original_amount       numeric(15,2),
  current_balance       numeric(15,2),
  interest_rate         numeric(6,4),
  rate_type             text not null default 'fixed'
                        check (rate_type in ('fixed', 'floating', 'hybrid')),
  spread_over_index     numeric(6,4),
  index_name            text,
  origination_date      date,
  maturity_date         date,
  io_period_months      integer,
  amortization_months   integer,
  annual_debt_service   numeric(15,2),
  dscr                  numeric(6,4),
  ltv_current           numeric(5,4),
  prepayment_terms      text,
  covenants             jsonb not null default '{}',
  recourse              text check (recourse in ('full', 'partial', 'non_recourse')),
  guarantor             text,
  notes                 text,
  created_by            uuid references auth.users(id),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index idx_debt_org on public.debt_instruments(org_id);
create index idx_debt_property on public.debt_instruments(property_id) where property_id is not null;
create index idx_debt_deal on public.debt_instruments(deal_id) where deal_id is not null;
create index idx_debt_maturity on public.debt_instruments(maturity_date);

create trigger set_debt_instruments_updated_at
  before update on public.debt_instruments
  for each row execute function public.set_updated_at();
