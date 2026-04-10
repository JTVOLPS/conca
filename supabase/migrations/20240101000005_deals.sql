-- Migration: 00005_deals.sql
-- Deals, deal economics, deal contacts, stage history, and field definitions

create table public.deals (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references public.orgs(id) on delete cascade,
  name            text not null,
  asset_class     text not null check (asset_class in (
                    'ios', 'marina', 'hospitality', 'multifamily', 'transitional', 'other'
                  )),
  stage           text not null default 'sourcing' check (stage in (
                    'sourcing', 'loi', 'under_contract', 'due_diligence', 'closed', 'dead'
                  )),
  stage_position  integer not null default 0,
  stage_changed_at timestamptz not null default now(),
  -- Key dates
  sourced_at      date,
  loi_submitted_at date,
  loi_accepted_at  date,
  contract_date   date,
  due_diligence_start date,
  due_diligence_end   date,
  closing_date    date,
  dead_at         date,
  dead_reason     text,
  -- Key contacts
  lead_broker_id  uuid references public.contacts(id) on delete set null,
  lead_source     text,
  -- Property link
  property_id     uuid references public.properties(id) on delete set null,
  -- Asset-class-specific custom fields
  custom_fields   jsonb not null default '{}',
  -- Summary / notes
  description     text,
  notes           text,
  tags            text[] not null default '{}',
  search_vector   tsvector,
  -- Ownership
  assigned_to     uuid references auth.users(id),
  created_by      uuid references auth.users(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_deals_org on public.deals(org_id);
create index idx_deals_stage on public.deals(org_id, stage);
create index idx_deals_stage_pos on public.deals(org_id, stage, stage_position);
create index idx_deals_asset_class on public.deals(org_id, asset_class);
create index idx_deals_property on public.deals(property_id);
create index idx_deals_search on public.deals using gin(search_vector);
create index idx_deals_name_trgm on public.deals using gin(name gin_trgm_ops);
create index idx_deals_custom on public.deals using gin(custom_fields);

-- Add FK from interactions to deals
alter table public.interactions
  add constraint fk_interactions_deal
  foreign key (deal_id) references public.deals(id) on delete set null;

-- Deal economics (one record per deal)
create table public.deal_economics (
  id              uuid primary key default gen_random_uuid(),
  deal_id         uuid not null references public.deals(id) on delete cascade unique,
  org_id          uuid not null references public.orgs(id) on delete cascade,
  -- Purchase
  asking_price    numeric(15, 2),
  offer_price     numeric(15, 2),
  purchase_price  numeric(15, 2),
  price_per_unit  numeric(15, 2),
  price_per_sf    numeric(15, 2),
  -- Income
  noi             numeric(15, 2),
  gross_revenue   numeric(15, 2),
  occupancy_pct   numeric(5, 2),
  cap_rate_in     numeric(6, 4),
  cap_rate_out    numeric(6, 4),
  -- Financing
  loan_amount     numeric(15, 2),
  ltv             numeric(5, 4),
  interest_rate   numeric(6, 4),
  loan_term_months integer,
  lender_id       uuid references public.companies(id) on delete set null,
  -- Returns (stored, not calculated)
  irr_target      numeric(6, 4),
  equity_multiple numeric(6, 2),
  cash_on_cash    numeric(6, 4),
  -- Equity
  total_equity    numeric(15, 2),
  sponsor_equity  numeric(15, 2),
  lp_equity       numeric(15, 2),
  -- Costs
  closing_costs   numeric(15, 2),
  capex_budget    numeric(15, 2),
  hold_period_months integer,
  -- Flexible
  custom_fields   jsonb not null default '{}',
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_deal_economics_org on public.deal_economics(org_id);
create index idx_deal_economics_deal on public.deal_economics(deal_id);

-- Deal contacts junction (many-to-many)
create table public.deal_contacts (
  id            uuid primary key default gen_random_uuid(),
  deal_id       uuid not null references public.deals(id) on delete cascade,
  contact_id    uuid not null references public.contacts(id) on delete cascade,
  role          text,
  created_at    timestamptz not null default now(),
  unique(deal_id, contact_id, role)
);

create index idx_dc_deal on public.deal_contacts(deal_id);
create index idx_dc_contact on public.deal_contacts(contact_id);

-- Deal stage history
create table public.deal_stage_history (
  id            uuid primary key default gen_random_uuid(),
  deal_id       uuid not null references public.deals(id) on delete cascade,
  org_id        uuid not null references public.orgs(id) on delete cascade,
  from_stage    text,
  to_stage      text not null,
  changed_by    uuid not null references auth.users(id),
  changed_at    timestamptz not null default now()
);

create index idx_dsh_deal on public.deal_stage_history(deal_id);
create index idx_dsh_org on public.deal_stage_history(org_id);

-- Deal field definitions (schema for custom_fields per asset class)
create table public.deal_field_definitions (
  id              uuid primary key default gen_random_uuid(),
  asset_class     text not null,
  field_key       text not null,
  field_label     text not null,
  field_type      text not null check (field_type in (
                    'text', 'number', 'boolean', 'date', 'select', 'textarea'
                  )),
  options         jsonb,
  display_order   integer not null default 0,
  is_required     boolean not null default false,
  section         text,
  unique(asset_class, field_key)
);

create index idx_dfd_asset_class on public.deal_field_definitions(asset_class);
