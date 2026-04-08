-- Migration: 00022_investors.sql
-- Investor module: investors, commitments, distributions, waterfall tiers

-- ---------------------------------------------------------------------------
-- investors — investor entities linked to CRM contacts
-- ---------------------------------------------------------------------------
create table public.investors (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references public.orgs(id) on delete cascade,
  name            text not null,
  type            text not null default 'individual'
                  check (type in ('individual', 'entity', 'fund', 'family_office', 'institution', 'other')),
  contact_id      uuid references public.contacts(id) on delete set null,
  company_id      uuid references public.companies(id) on delete set null,
  accredited      boolean not null default false,
  tax_id          text,
  entity_name     text,                -- legal entity name if type != individual
  address_line1   text,
  address_city    text,
  address_state   text,
  address_zip     text,
  notes           text,
  tags            text[] default '{}',
  created_by      uuid references auth.users(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_investors_org on public.investors(org_id);
create index idx_investors_contact on public.investors(contact_id);
create index idx_investors_company on public.investors(company_id);

create trigger set_investors_updated_at
  before update on public.investors
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- investor_commitments — capital committed per deal
-- ---------------------------------------------------------------------------
create table public.investor_commitments (
  id                uuid primary key default gen_random_uuid(),
  org_id            uuid not null references public.orgs(id) on delete cascade,
  investor_id       uuid not null references public.investors(id) on delete cascade,
  deal_id           uuid not null references public.deals(id) on delete cascade,
  committed_amount  numeric(15,2) not null default 0,
  called_amount     numeric(15,2) not null default 0,
  status            text not null default 'committed'
                    check (status in ('committed', 'partially_called', 'fully_called', 'returned')),
  commitment_date   date,
  notes             text,
  created_by        uuid references auth.users(id),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index idx_commitments_org on public.investor_commitments(org_id);
create index idx_commitments_investor on public.investor_commitments(investor_id);
create index idx_commitments_deal on public.investor_commitments(deal_id);
create unique index idx_commitments_investor_deal on public.investor_commitments(investor_id, deal_id);

create trigger set_commitments_updated_at
  before update on public.investor_commitments
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- investor_distributions — capital returned to investors
-- ---------------------------------------------------------------------------
create table public.investor_distributions (
  id                  uuid primary key default gen_random_uuid(),
  org_id              uuid not null references public.orgs(id) on delete cascade,
  investor_id         uuid not null references public.investors(id) on delete cascade,
  deal_id             uuid not null references public.deals(id) on delete cascade,
  commitment_id       uuid references public.investor_commitments(id) on delete set null,
  distribution_date   date not null,
  amount              numeric(15,2) not null,
  type                text not null default 'preferred_return'
                      check (type in ('preferred_return', 'profit_share', 'return_of_capital', 'refinance_proceeds', 'sale_proceeds', 'other')),
  period_label        text,              -- e.g., "Q1 2025", "2024 Annual"
  notes               text,
  created_by          uuid references auth.users(id),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_distributions_org on public.investor_distributions(org_id);
create index idx_distributions_investor on public.investor_distributions(investor_id);
create index idx_distributions_deal on public.investor_distributions(deal_id);
create index idx_distributions_commitment on public.investor_distributions(commitment_id);

create trigger set_distributions_updated_at
  before update on public.investor_distributions
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- waterfall_tiers — promote / hurdle structure per deal
-- ---------------------------------------------------------------------------
create table public.waterfall_tiers (
  id                uuid primary key default gen_random_uuid(),
  org_id            uuid not null references public.orgs(id) on delete cascade,
  deal_id           uuid not null references public.deals(id) on delete cascade,
  tier_order        integer not null,     -- 1, 2, 3 ...
  tier_label        text not null,        -- e.g., "Preferred Return", "Catch-Up", "80/20 Split"
  hurdle_rate       numeric(6,4),         -- e.g., 0.08 = 8%
  lp_split_pct      numeric(5,2),         -- e.g., 80.00
  gp_split_pct      numeric(5,2),         -- e.g., 20.00
  is_catch_up       boolean not null default false,
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index idx_waterfall_org on public.waterfall_tiers(org_id);
create index idx_waterfall_deal on public.waterfall_tiers(deal_id);
create unique index idx_waterfall_deal_order on public.waterfall_tiers(deal_id, tier_order);

create trigger set_waterfall_updated_at
  before update on public.waterfall_tiers
  for each row execute function public.set_updated_at();
