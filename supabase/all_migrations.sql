-- Migration: 00001_extensions_and_functions.sql
-- Enable required extensions and create helper functions

create extension if not exists "pg_trgm";

-- Helper to get org_id from JWT
create or replace function auth.org_id() returns uuid as $$
  select coalesce(
    (current_setting('request.jwt.claims', true)::json->'app_metadata'->>'org_id')::uuid,
    null
  );
$$ language sql stable;

-- Helper to get user role from JWT
create or replace function auth.user_role() returns text as $$
  select coalesce(
    current_setting('request.jwt.claims', true)::json->'app_metadata'->>'role',
    'member'
  );
$$ language sql stable;
-- Migration: 00002_core_tables.sql
-- Organizations, user profiles, and invitations

create table public.orgs (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text unique not null,
  settings      jsonb not null default '{}',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.user_profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  org_id        uuid not null references public.orgs(id) on delete cascade,
  role          text not null default 'member' check (role in ('owner', 'admin', 'member')),
  full_name     text not null,
  avatar_url    text,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_user_profiles_org on public.user_profiles(org_id);

create table public.invitations (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references public.orgs(id) on delete cascade,
  email         text not null,
  role          text not null default 'member' check (role in ('admin', 'member')),
  invited_by    uuid not null references auth.users(id),
  accepted_at   timestamptz,
  expires_at    timestamptz not null default (now() + interval '7 days'),
  created_at    timestamptz not null default now()
);

create index idx_invitations_org on public.invitations(org_id);
create index idx_invitations_email on public.invitations(email);
-- Migration: 00003_contacts.sql
-- Companies, contacts, contact-company junction, and interactions

create table public.companies (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references public.orgs(id) on delete cascade,
  name          text not null,
  type          text check (type in (
                  'brokerage', 'lender', 'investor', 'developer',
                  'property_manager', 'law_firm', 'title_company',
                  'insurance', 'contractor', 'other'
                )),
  website       text,
  phone         text,
  email         text,
  address_line1 text,
  address_line2 text,
  city          text,
  state         text,
  zip           text,
  country       text default 'US',
  notes         text,
  tags          text[] not null default '{}',
  search_vector tsvector,
  created_by    uuid references auth.users(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_companies_org on public.companies(org_id);
create index idx_companies_search on public.companies using gin(search_vector);
create index idx_companies_name_trgm on public.companies using gin(name gin_trgm_ops);
create index idx_companies_tags on public.companies using gin(tags);

create table public.contacts (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references public.orgs(id) on delete cascade,
  first_name    text not null,
  last_name     text not null,
  email         text,
  phone         text,
  mobile        text,
  title         text,
  type          text check (type in (
                  'broker', 'lender', 'investor', 'attorney',
                  'property_manager', 'contractor', 'tenant',
                  'partner', 'other'
                )),
  address_line1 text,
  address_line2 text,
  city          text,
  state         text,
  zip           text,
  country       text default 'US',
  notes         text,
  tags          text[] not null default '{}',
  source        text,
  search_vector tsvector,
  created_by    uuid references auth.users(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_contacts_org on public.contacts(org_id);
create index idx_contacts_search on public.contacts using gin(search_vector);
create index idx_contacts_name_trgm on public.contacts
  using gin ((first_name || ' ' || last_name) gin_trgm_ops);
create index idx_contacts_tags on public.contacts using gin(tags);

create table public.contact_companies (
  id            uuid primary key default gen_random_uuid(),
  contact_id    uuid not null references public.contacts(id) on delete cascade,
  company_id    uuid not null references public.companies(id) on delete cascade,
  role          text,
  is_primary    boolean not null default false,
  started_at    date,
  ended_at      date,
  created_at    timestamptz not null default now(),
  unique(contact_id, company_id)
);

create index idx_cc_contact on public.contact_companies(contact_id);
create index idx_cc_company on public.contact_companies(company_id);

create table public.interactions (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references public.orgs(id) on delete cascade,
  contact_id    uuid references public.contacts(id) on delete set null,
  company_id    uuid references public.companies(id) on delete set null,
  deal_id       uuid,
  type          text not null check (type in (
                  'call', 'email', 'meeting', 'note', 'site_visit', 'other'
                )),
  subject       text,
  body          text,
  occurred_at   timestamptz not null default now(),
  logged_by     uuid not null references auth.users(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_interactions_org on public.interactions(org_id);
create index idx_interactions_contact on public.interactions(contact_id);
create index idx_interactions_deal on public.interactions(deal_id);
-- Migration: 00004_properties.sql

create table public.properties (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references public.orgs(id) on delete cascade,
  name            text not null,
  asset_class     text not null check (asset_class in (
                    'ios', 'marina', 'hospitality', 'multifamily', 'transitional', 'other'
                  )),
  status          text not null default 'active' check (status in (
                    'active', 'under_contract', 'closed', 'disposed', 'watch_list'
                  )),
  address_line1   text,
  address_line2   text,
  city            text,
  state           text,
  zip             text,
  county          text,
  country         text default 'US',
  latitude        numeric(10, 7),
  longitude       numeric(10, 7),
  year_built      integer,
  total_sf        numeric(12, 2),
  lot_size_acres  numeric(10, 4),
  num_units       integer,
  zoning          text,
  parcel_number   text,
  custom_fields   jsonb not null default '{}',
  notes           text,
  tags            text[] not null default '{}',
  search_vector   tsvector,
  created_by      uuid references auth.users(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_properties_org on public.properties(org_id);
create index idx_properties_asset_class on public.properties(org_id, asset_class);
create index idx_properties_search on public.properties using gin(search_vector);
create index idx_properties_name_trgm on public.properties using gin(name gin_trgm_ops);
create index idx_properties_custom on public.properties using gin(custom_fields);
create index idx_properties_geo on public.properties(latitude, longitude)
  where latitude is not null and longitude is not null;
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
-- Migration: 00007_search_triggers.sql
-- tsvector auto-update triggers and updated_at triggers

-- Contacts search vector
create or replace function update_contact_search_vector() returns trigger as $$
begin
  new.search_vector := to_tsvector('english',
    coalesce(new.first_name, '') || ' ' ||
    coalesce(new.last_name, '') || ' ' ||
    coalesce(new.email, '') || ' ' ||
    coalesce(new.phone, '') || ' ' ||
    coalesce(new.title, '') || ' ' ||
    coalesce(new.notes, '') || ' ' ||
    coalesce(array_to_string(new.tags, ' '), '')
  );
  return new;
end;
$$ language plpgsql;

create trigger trg_contacts_search
  before insert or update on public.contacts
  for each row execute function update_contact_search_vector();

-- Companies search vector
create or replace function update_company_search_vector() returns trigger as $$
begin
  new.search_vector := to_tsvector('english',
    coalesce(new.name, '') || ' ' ||
    coalesce(new.website, '') || ' ' ||
    coalesce(new.email, '') || ' ' ||
    coalesce(new.notes, '') || ' ' ||
    coalesce(array_to_string(new.tags, ' '), '')
  );
  return new;
end;
$$ language plpgsql;

create trigger trg_companies_search
  before insert or update on public.companies
  for each row execute function update_company_search_vector();

-- Deals search vector
create or replace function update_deal_search_vector() returns trigger as $$
begin
  new.search_vector := to_tsvector('english',
    coalesce(new.name, '') || ' ' ||
    coalesce(new.description, '') || ' ' ||
    coalesce(new.notes, '') || ' ' ||
    coalesce(array_to_string(new.tags, ' '), '')
  );
  return new;
end;
$$ language plpgsql;

create trigger trg_deals_search
  before insert or update on public.deals
  for each row execute function update_deal_search_vector();

-- Properties search vector
create or replace function update_property_search_vector() returns trigger as $$
begin
  new.search_vector := to_tsvector('english',
    coalesce(new.name, '') || ' ' ||
    coalesce(new.address_line1, '') || ' ' ||
    coalesce(new.city, '') || ' ' ||
    coalesce(new.state, '') || ' ' ||
    coalesce(new.notes, '') || ' ' ||
    coalesce(array_to_string(new.tags, ' '), '')
  );
  return new;
end;
$$ language plpgsql;

create trigger trg_properties_search
  before insert or update on public.properties
  for each row execute function update_property_search_vector();

-- Reusable updated_at trigger
create or replace function update_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_orgs_updated before update on public.orgs
  for each row execute function update_updated_at();
create trigger trg_user_profiles_updated before update on public.user_profiles
  for each row execute function update_updated_at();
create trigger trg_contacts_updated before update on public.contacts
  for each row execute function update_updated_at();
create trigger trg_companies_updated before update on public.companies
  for each row execute function update_updated_at();
create trigger trg_deals_updated before update on public.deals
  for each row execute function update_updated_at();
create trigger trg_properties_updated before update on public.properties
  for each row execute function update_updated_at();
create trigger trg_deal_economics_updated before update on public.deal_economics
  for each row execute function update_updated_at();
create trigger trg_interactions_updated before update on public.interactions
  for each row execute function update_updated_at();
create trigger trg_tasks_updated before update on public.tasks
  for each row execute function update_updated_at();
-- Migration: 00008_global_search.sql
-- Global search function combining all searchable entities

create or replace function public.global_search(search_query text, result_limit int default 20)
returns table(
  id uuid,
  entity_type text,
  title text,
  subtitle text,
  rank real
) as $$
declare
  tsquery_val tsquery;
  trgm_query text;
begin
  tsquery_val := websearch_to_tsquery('english', search_query);
  trgm_query := search_query;

  return query
  (
    select c.id, 'contact'::text,
           c.first_name || ' ' || c.last_name,
           coalesce(c.email, c.title, ''),
           ts_rank(c.search_vector, tsquery_val) + similarity(c.first_name || ' ' || c.last_name, trgm_query)
    from public.contacts c
    where c.org_id = auth.org_id()
      and (c.search_vector @@ tsquery_val
           or similarity(c.first_name || ' ' || c.last_name, trgm_query) > 0.15)
  )
  union all
  (
    select co.id, 'company'::text,
           co.name,
           coalesce(co.type, ''),
           ts_rank(co.search_vector, tsquery_val) + similarity(co.name, trgm_query)
    from public.companies co
    where co.org_id = auth.org_id()
      and (co.search_vector @@ tsquery_val
           or similarity(co.name, trgm_query) > 0.15)
  )
  union all
  (
    select d.id, 'deal'::text,
           d.name,
           d.stage || ' - ' || d.asset_class,
           ts_rank(d.search_vector, tsquery_val) + similarity(d.name, trgm_query)
    from public.deals d
    where d.org_id = auth.org_id()
      and (d.search_vector @@ tsquery_val
           or similarity(d.name, trgm_query) > 0.15)
  )
  union all
  (
    select p.id, 'property'::text,
           p.name,
           coalesce(p.city || ', ' || p.state, p.address_line1, ''),
           ts_rank(p.search_vector, tsquery_val) + similarity(p.name, trgm_query)
    from public.properties p
    where p.org_id = auth.org_id()
      and (p.search_vector @@ tsquery_val
           or similarity(p.name, trgm_query) > 0.15)
  )
  order by rank desc
  limit result_limit;
end;
$$ language plpgsql stable security definer;
-- Migration: 00009_rls_policies.sql
-- Enable RLS and create policies for all tables

alter table public.orgs enable row level security;
alter table public.user_profiles enable row level security;
alter table public.invitations enable row level security;
alter table public.contacts enable row level security;
alter table public.companies enable row level security;
alter table public.contact_companies enable row level security;
alter table public.interactions enable row level security;
alter table public.properties enable row level security;
alter table public.deals enable row level security;
alter table public.deal_economics enable row level security;
alter table public.deal_contacts enable row level security;
alter table public.deal_stage_history enable row level security;
alter table public.deal_field_definitions enable row level security;
alter table public.documents enable row level security;
alter table public.tasks enable row level security;

-- Orgs
create policy "org_select" on public.orgs for select
  using (id = auth.org_id());
create policy "org_update" on public.orgs for update
  using (id = auth.org_id() and auth.user_role() in ('owner', 'admin'))
  with check (id = auth.org_id());

-- User profiles
create policy "profiles_select" on public.user_profiles for select
  using (org_id = auth.org_id());
create policy "profiles_insert" on public.user_profiles for insert
  with check (org_id = auth.org_id());
create policy "profiles_update" on public.user_profiles for update
  using (id = auth.uid() or (org_id = auth.org_id() and auth.user_role() in ('owner', 'admin')))
  with check (org_id = auth.org_id());

-- Invitations
create policy "invitations_select" on public.invitations for select
  using (org_id = auth.org_id());
create policy "invitations_insert" on public.invitations for insert
  with check (org_id = auth.org_id() and auth.user_role() in ('owner', 'admin'));
create policy "invitations_delete" on public.invitations for delete
  using (org_id = auth.org_id() and auth.user_role() in ('owner', 'admin'));

-- Contacts
create policy "contacts_select" on public.contacts for select
  using (org_id = auth.org_id());
create policy "contacts_insert" on public.contacts for insert
  with check (org_id = auth.org_id());
create policy "contacts_update" on public.contacts for update
  using (org_id = auth.org_id())
  with check (org_id = auth.org_id());
create policy "contacts_delete" on public.contacts for delete
  using (org_id = auth.org_id() and auth.user_role() in ('owner', 'admin'));

-- Companies
create policy "companies_select" on public.companies for select
  using (org_id = auth.org_id());
create policy "companies_insert" on public.companies for insert
  with check (org_id = auth.org_id());
create policy "companies_update" on public.companies for update
  using (org_id = auth.org_id())
  with check (org_id = auth.org_id());
create policy "companies_delete" on public.companies for delete
  using (org_id = auth.org_id() and auth.user_role() in ('owner', 'admin'));

-- Contact companies (junction -- derive from contact)
create policy "cc_select" on public.contact_companies for select
  using (exists (select 1 from public.contacts where contacts.id = contact_id and contacts.org_id = auth.org_id()));
create policy "cc_insert" on public.contact_companies for insert
  with check (exists (select 1 from public.contacts where contacts.id = contact_id and contacts.org_id = auth.org_id()));
create policy "cc_update" on public.contact_companies for update
  using (exists (select 1 from public.contacts where contacts.id = contact_id and contacts.org_id = auth.org_id()));
create policy "cc_delete" on public.contact_companies for delete
  using (exists (select 1 from public.contacts where contacts.id = contact_id and contacts.org_id = auth.org_id()));

-- Interactions
create policy "interactions_select" on public.interactions for select
  using (org_id = auth.org_id());
create policy "interactions_insert" on public.interactions for insert
  with check (org_id = auth.org_id());
create policy "interactions_update" on public.interactions for update
  using (org_id = auth.org_id())
  with check (org_id = auth.org_id());
create policy "interactions_delete" on public.interactions for delete
  using (org_id = auth.org_id() and auth.user_role() in ('owner', 'admin'));

-- Properties
create policy "properties_select" on public.properties for select
  using (org_id = auth.org_id());
create policy "properties_insert" on public.properties for insert
  with check (org_id = auth.org_id());
create policy "properties_update" on public.properties for update
  using (org_id = auth.org_id())
  with check (org_id = auth.org_id());
create policy "properties_delete" on public.properties for delete
  using (org_id = auth.org_id() and auth.user_role() in ('owner', 'admin'));

-- Deals
create policy "deals_select" on public.deals for select
  using (org_id = auth.org_id());
create policy "deals_insert" on public.deals for insert
  with check (org_id = auth.org_id());
create policy "deals_update" on public.deals for update
  using (org_id = auth.org_id())
  with check (org_id = auth.org_id());
create policy "deals_delete" on public.deals for delete
  using (org_id = auth.org_id() and auth.user_role() in ('owner', 'admin'));

-- Deal economics
create policy "de_select" on public.deal_economics for select
  using (org_id = auth.org_id());
create policy "de_insert" on public.deal_economics for insert
  with check (org_id = auth.org_id());
create policy "de_update" on public.deal_economics for update
  using (org_id = auth.org_id())
  with check (org_id = auth.org_id());
create policy "de_delete" on public.deal_economics for delete
  using (org_id = auth.org_id() and auth.user_role() in ('owner', 'admin'));

-- Deal contacts (junction -- derive from deal)
create policy "dc_select" on public.deal_contacts for select
  using (exists (select 1 from public.deals where deals.id = deal_id and deals.org_id = auth.org_id()));
create policy "dc_insert" on public.deal_contacts for insert
  with check (exists (select 1 from public.deals where deals.id = deal_id and deals.org_id = auth.org_id()));
create policy "dc_delete" on public.deal_contacts for delete
  using (exists (select 1 from public.deals where deals.id = deal_id and deals.org_id = auth.org_id()));

-- Deal stage history
create policy "dsh_select" on public.deal_stage_history for select
  using (org_id = auth.org_id());
create policy "dsh_insert" on public.deal_stage_history for insert
  with check (org_id = auth.org_id());

-- Deal field definitions (global, not org-scoped)
create policy "dfd_select" on public.deal_field_definitions for select
  using (true);
create policy "dfd_insert" on public.deal_field_definitions for insert
  with check (auth.user_role() in ('owner', 'admin'));
create policy "dfd_update" on public.deal_field_definitions for update
  using (auth.user_role() in ('owner', 'admin'));

-- Documents (future)
create policy "documents_select" on public.documents for select
  using (org_id = auth.org_id());
create policy "documents_insert" on public.documents for insert
  with check (org_id = auth.org_id());
create policy "documents_delete" on public.documents for delete
  using (org_id = auth.org_id() and auth.user_role() in ('owner', 'admin'));

-- Tasks (future)
create policy "tasks_select" on public.tasks for select
  using (org_id = auth.org_id());
create policy "tasks_insert" on public.tasks for insert
  with check (org_id = auth.org_id());
create policy "tasks_update" on public.tasks for update
  using (org_id = auth.org_id())
  with check (org_id = auth.org_id());
create policy "tasks_delete" on public.tasks for delete
  using (org_id = auth.org_id() and auth.user_role() in ('owner', 'admin'));
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
-- Migration: 00011_seed_field_definitions.sql
-- Predefined custom field definitions for all asset classes

-- IOS (Industrial Outdoor Storage)
insert into public.deal_field_definitions (asset_class, field_key, field_label, field_type, display_order, section) values
  ('ios', 'total_acres', 'Total Acres', 'number', 1, 'Physical'),
  ('ios', 'paved_pct', 'Paved %', 'number', 2, 'Physical'),
  ('ios', 'num_tenants', 'Number of Tenants', 'number', 3, 'Operations'),
  ('ios', 'weighted_avg_lease_term', 'WALT (months)', 'number', 4, 'Operations'),
  ('ios', 'environmental_phase', 'Environmental Phase', 'select', 5, 'Due Diligence'),
  ('ios', 'zoning_compliant', 'Zoning Compliant', 'boolean', 6, 'Due Diligence');

-- Marina
insert into public.deal_field_definitions (asset_class, field_key, field_label, field_type, display_order, section) values
  ('marina', 'num_wet_slips', 'Wet Slips', 'number', 1, 'Physical'),
  ('marina', 'num_dry_slips', 'Dry Storage Slips', 'number', 2, 'Physical'),
  ('marina', 'total_linear_ft', 'Total Linear Feet', 'number', 3, 'Physical'),
  ('marina', 'fuel_station', 'Fuel Station', 'boolean', 4, 'Amenities'),
  ('marina', 'ship_store', 'Ship Store', 'boolean', 5, 'Amenities'),
  ('marina', 'restaurant', 'Restaurant/Bar', 'boolean', 6, 'Amenities'),
  ('marina', 'avg_slip_rate', 'Avg Monthly Slip Rate', 'number', 7, 'Operations'),
  ('marina', 'occupancy_seasonal', 'Seasonal Occupancy %', 'number', 8, 'Operations');

-- Hospitality
insert into public.deal_field_definitions (asset_class, field_key, field_label, field_type, display_order, section) values
  ('hospitality', 'num_keys', 'Number of Keys', 'number', 1, 'Physical'),
  ('hospitality', 'brand', 'Brand/Flag', 'text', 2, 'Operations'),
  ('hospitality', 'management_company', 'Management Company', 'text', 3, 'Operations'),
  ('hospitality', 'franchise_expiry', 'Franchise Expiry', 'date', 4, 'Operations'),
  ('hospitality', 'adr', 'ADR ($)', 'number', 5, 'Performance'),
  ('hospitality', 'revpar', 'RevPAR ($)', 'number', 6, 'Performance'),
  ('hospitality', 'occ_rate', 'Occupancy Rate %', 'number', 7, 'Performance'),
  ('hospitality', 'star_rating', 'Star Rating', 'select', 8, 'Physical');

-- Multifamily
insert into public.deal_field_definitions (asset_class, field_key, field_label, field_type, display_order, section) values
  ('multifamily', 'num_units', 'Total Units', 'number', 1, 'Physical'),
  ('multifamily', 'unit_mix', 'Unit Mix Summary', 'textarea', 2, 'Physical'),
  ('multifamily', 'avg_rent', 'Average Rent ($)', 'number', 3, 'Operations'),
  ('multifamily', 'market_rent', 'Market Rent ($)', 'number', 4, 'Operations'),
  ('multifamily', 'rent_growth_pct', 'Rent Growth %', 'number', 5, 'Operations'),
  ('multifamily', 'value_add', 'Value-Add Opportunity', 'boolean', 6, 'Strategy'),
  ('multifamily', 'renovation_cost_per_unit', 'Renovation $/Unit', 'number', 7, 'Strategy'),
  ('multifamily', 'laundry_income', 'Laundry Income (annual)', 'number', 8, 'Operations');

-- Transitional
insert into public.deal_field_definitions (asset_class, field_key, field_label, field_type, display_order, section) values
  ('transitional', 'current_use', 'Current Use', 'text', 1, 'Physical'),
  ('transitional', 'proposed_use', 'Proposed Use', 'text', 2, 'Strategy'),
  ('transitional', 'entitlement_status', 'Entitlement Status', 'select', 3, 'Due Diligence'),
  ('transitional', 'rezone_required', 'Rezone Required', 'boolean', 4, 'Due Diligence'),
  ('transitional', 'demolition_cost', 'Demolition Cost ($)', 'number', 5, 'Strategy'),
  ('transitional', 'development_timeline_months', 'Development Timeline (months)', 'number', 6, 'Strategy'),
  ('transitional', 'permits_in_hand', 'Permits in Hand', 'boolean', 7, 'Due Diligence');

-- Add select options
update public.deal_field_definitions
  set options = '["Phase I", "Phase I & II", "None Required", "Pending"]'
  where field_key = 'environmental_phase';

update public.deal_field_definitions
  set options = '["1", "2", "3", "4", "5"]'
  where field_key = 'star_rating';

update public.deal_field_definitions
  set options = '["Not Started", "In Progress", "Approved", "Denied"]'
  where field_key = 'entitlement_status';
-- Migration: 00012_tenants_leases.sql
-- Tenant and lease tables for rent roll tracking

create table public.tenants (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references public.orgs(id) on delete cascade,
  property_id     uuid not null references public.properties(id) on delete cascade,
  name            text not null,
  contact_id      uuid references public.contacts(id) on delete set null,
  unit_label      text,
  status          text not null default 'active'
                  check (status in ('active', 'expired', 'month_to_month', 'vacating', 'vacated')),
  occupied_sf     numeric(12,2),
  notes           text,
  created_by      uuid references auth.users(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_tenants_org on public.tenants(org_id);
create index idx_tenants_property on public.tenants(property_id);
create index idx_tenants_property_status on public.tenants(property_id, status);

create table public.leases (
  id                      uuid primary key default gen_random_uuid(),
  org_id                  uuid not null references public.orgs(id) on delete cascade,
  tenant_id               uuid not null references public.tenants(id) on delete cascade,
  property_id             uuid not null references public.properties(id) on delete cascade,
  lease_type              text not null
                          check (lease_type in ('gross', 'modified_gross', 'nnn', 'percentage', 'ground', 'month_to_month', 'other')),
  start_date              date not null,
  end_date                date,
  rent_amount             numeric(15,2),
  rent_frequency          text not null default 'monthly'
                          check (rent_frequency in ('monthly', 'quarterly', 'annually')),
  rent_escalation_pct     numeric(6,4),
  rent_escalation_date    date,
  security_deposit        numeric(15,2),
  cam_charges             numeric(15,2),
  free_rent_months        integer,
  renewal_option_terms    text,
  early_termination_terms text,
  notes                   text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create index idx_leases_org on public.leases(org_id);
create index idx_leases_tenant on public.leases(tenant_id);
create index idx_leases_property on public.leases(property_id);
create index idx_leases_end_date on public.leases(end_date);

-- updated_at triggers
create trigger set_tenants_updated_at
  before update on public.tenants
  for each row execute function public.set_updated_at();

create trigger set_leases_updated_at
  before update on public.leases
  for each row execute function public.set_updated_at();
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
-- Migration: 00017_phase2_rls.sql
-- RLS policies for Phase 2 tables

-- Tenants
alter table public.tenants enable row level security;

create policy "tenants_select" on public.tenants for select
  using (org_id = auth.org_id());
create policy "tenants_insert" on public.tenants for insert
  with check (org_id = auth.org_id());
create policy "tenants_update" on public.tenants for update
  using (org_id = auth.org_id())
  with check (org_id = auth.org_id());
create policy "tenants_delete" on public.tenants for delete
  using (org_id = auth.org_id() and auth.user_role() in ('owner', 'admin'));

-- Leases
alter table public.leases enable row level security;

create policy "leases_select" on public.leases for select
  using (org_id = auth.org_id());
create policy "leases_insert" on public.leases for insert
  with check (org_id = auth.org_id());
create policy "leases_update" on public.leases for update
  using (org_id = auth.org_id())
  with check (org_id = auth.org_id());
create policy "leases_delete" on public.leases for delete
  using (org_id = auth.org_id() and auth.user_role() in ('owner', 'admin'));

-- Operating Statements
alter table public.operating_statements enable row level security;

create policy "opstatements_select" on public.operating_statements for select
  using (org_id = auth.org_id());
create policy "opstatements_insert" on public.operating_statements for insert
  with check (org_id = auth.org_id());
create policy "opstatements_update" on public.operating_statements for update
  using (org_id = auth.org_id())
  with check (org_id = auth.org_id());
create policy "opstatements_delete" on public.operating_statements for delete
  using (org_id = auth.org_id() and auth.user_role() in ('owner', 'admin'));

-- CapEx Projects
alter table public.capex_projects enable row level security;

create policy "capex_select" on public.capex_projects for select
  using (org_id = auth.org_id());
create policy "capex_insert" on public.capex_projects for insert
  with check (org_id = auth.org_id());
create policy "capex_update" on public.capex_projects for update
  using (org_id = auth.org_id())
  with check (org_id = auth.org_id());
create policy "capex_delete" on public.capex_projects for delete
  using (org_id = auth.org_id() and auth.user_role() in ('owner', 'admin'));

-- Debt Instruments
alter table public.debt_instruments enable row level security;

create policy "debt_select" on public.debt_instruments for select
  using (org_id = auth.org_id());
create policy "debt_insert" on public.debt_instruments for insert
  with check (org_id = auth.org_id());
create policy "debt_update" on public.debt_instruments for update
  using (org_id = auth.org_id())
  with check (org_id = auth.org_id());
create policy "debt_delete" on public.debt_instruments for delete
  using (org_id = auth.org_id() and auth.user_role() in ('owner', 'admin'));
-- Migration: 00018_views_functions.sql
-- Rent roll view and lease expiration function

-- Rent roll view: tenants joined with their most recent lease
create or replace view public.v_rent_roll as
select
  t.id as tenant_id,
  t.property_id,
  t.org_id,
  t.name as tenant_name,
  t.unit_label,
  t.status as tenant_status,
  t.occupied_sf,
  t.contact_id,
  l.id as lease_id,
  l.lease_type,
  l.start_date,
  l.end_date,
  l.rent_amount,
  l.rent_frequency,
  l.cam_charges,
  coalesce(l.rent_amount, 0) + coalesce(l.cam_charges, 0) as total_monthly_rent,
  l.rent_escalation_pct,
  l.security_deposit,
  case
    when l.end_date is null then 'month_to_month'
    when l.end_date <= current_date then 'expired'
    when l.end_date <= current_date + interval '90 days' then 'expiring_soon'
    else 'active'
  end as lease_status
from public.tenants t
left join lateral (
  select *
  from public.leases l2
  where l2.tenant_id = t.id
  order by l2.start_date desc
  limit 1
) l on true;

-- Function: get leases expiring within N days (respects RLS via SECURITY DEFINER + org_id check)
create or replace function public.get_expiring_leases(days_ahead integer default 90)
returns setof public.leases
language sql
stable
security invoker
as $$
  select *
  from public.leases
  where org_id = auth.org_id()
    and end_date is not null
    and end_date between current_date and (current_date + (days_ahead || ' days')::interval)
  order by end_date asc;
$$;
-- Migration: 00019_storage_bucket.sql
-- Create documents storage bucket and policies
-- Note: bucket creation via SQL may not work in all Supabase setups.
-- If this fails, create the bucket via the Supabase dashboard instead.

insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- Storage policies: scope access by org_id folder
-- Path convention: {org_id}/{entity_type}/{entity_id}/{timestamp}_{filename}

create policy "org_documents_select" on storage.objects for select
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = (auth.org_id())::text
  );

create policy "org_documents_insert" on storage.objects for insert
  with check (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = (auth.org_id())::text
  );

create policy "org_documents_update" on storage.objects for update
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = (auth.org_id())::text
  );

create policy "org_documents_delete" on storage.objects for delete
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = (auth.org_id())::text
  );
-- Migration: 00020_task_enhancements.sql
-- Add position column for kanban ordering and updated_at trigger

alter table public.tasks
  add column if not exists position integer not null default 0;

create index idx_tasks_status_position on public.tasks(status, position);

-- Add updated_at trigger (column exists but no trigger)
create trigger set_tasks_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();
-- Migration: 00021_portfolio_kpi_functions.sql
-- Postgres functions for portfolio dashboard KPIs

-- AUM: sum of purchase_price from deal_economics where deal is closed
create or replace function public.portfolio_aum()
returns numeric
language sql stable security invoker
as $$
  select coalesce(sum(de.purchase_price), 0)
  from public.deal_economics de
  join public.deals d on d.id = de.deal_id
  where d.org_id = auth.org_id()
    and d.stage = 'closed';
$$;

-- NOI for a given year: revenue - operating expenses
create or replace function public.portfolio_noi(p_year integer)
returns numeric
language sql stable security invoker
as $$
  select coalesce(
    sum(case when os.category = 'revenue' then coalesce(os.actual_amount, 0) else 0 end) -
    sum(case when os.category = 'operating_expense' then coalesce(os.actual_amount, 0) else 0 end),
    0
  )
  from public.operating_statements os
  where os.org_id = auth.org_id()
    and os.period_year = p_year;
$$;

-- Portfolio occupancy: occupied SF / total SF
create or replace function public.portfolio_occupancy()
returns numeric
language sql stable security invoker
as $$
  select case
    when coalesce(sum(p.total_sf), 0) = 0 then 0
    else round(
      coalesce(sum(t.occupied_sf), 0) / sum(p.total_sf) * 100,
      1
    )
  end
  from public.properties p
  left join public.tenants t on t.property_id = p.id and t.status = 'active'
  where p.org_id = auth.org_id();
$$;

-- Weighted avg cap rate for closed deals
create or replace function public.portfolio_weighted_cap_rate()
returns numeric
language sql stable security invoker
as $$
  select case
    when coalesce(sum(de.purchase_price), 0) = 0 then 0
    else round(
      sum(de.cap_rate_in * de.purchase_price) / sum(de.purchase_price),
      4
    )
  end
  from public.deal_economics de
  join public.deals d on d.id = de.deal_id
  where d.org_id = auth.org_id()
    and d.stage = 'closed'
    and de.cap_rate_in is not null
    and de.purchase_price is not null
    and de.purchase_price > 0;
$$;

-- Pipeline by stage: deal count and total value per stage
create or replace function public.pipeline_by_stage()
returns table(stage text, deal_count bigint, total_value numeric)
language sql stable security invoker
as $$
  select
    d.stage,
    count(d.id) as deal_count,
    coalesce(sum(de.purchase_price), 0) as total_value
  from public.deals d
  left join public.deal_economics de on de.deal_id = d.id
  where d.org_id = auth.org_id()
    and d.stage not in ('closed', 'dead')
  group by d.stage
  order by
    case d.stage
      when 'sourcing' then 1
      when 'loi' then 2
      when 'under_contract' then 3
      when 'due_diligence' then 4
    end;
$$;

-- Debt maturity ladder: count and total balance grouped by year
create or replace function public.debt_maturity_ladder()
returns table(maturity_year integer, loan_count bigint, total_balance numeric)
language sql stable security invoker
as $$
  select
    extract(year from di.maturity_date)::integer as maturity_year,
    count(di.id) as loan_count,
    coalesce(sum(di.current_balance), 0) as total_balance
  from public.debt_instruments di
  where di.org_id = auth.org_id()
    and di.maturity_date is not null
  group by maturity_year
  order by maturity_year;
$$;
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
-- Migration: 00023_investor_rls.sql
-- RLS policies for investor module tables

-- Investors
alter table public.investors enable row level security;

create policy "investors_select" on public.investors for select
  using (org_id = auth.org_id());
create policy "investors_insert" on public.investors for insert
  with check (org_id = auth.org_id());
create policy "investors_update" on public.investors for update
  using (org_id = auth.org_id())
  with check (org_id = auth.org_id());
create policy "investors_delete" on public.investors for delete
  using (org_id = auth.org_id() and auth.user_role() in ('owner', 'admin'));

-- Investor Commitments
alter table public.investor_commitments enable row level security;

create policy "commitments_select" on public.investor_commitments for select
  using (org_id = auth.org_id());
create policy "commitments_insert" on public.investor_commitments for insert
  with check (org_id = auth.org_id());
create policy "commitments_update" on public.investor_commitments for update
  using (org_id = auth.org_id())
  with check (org_id = auth.org_id());
create policy "commitments_delete" on public.investor_commitments for delete
  using (org_id = auth.org_id() and auth.user_role() in ('owner', 'admin'));

-- Investor Distributions
alter table public.investor_distributions enable row level security;

create policy "distributions_select" on public.investor_distributions for select
  using (org_id = auth.org_id());
create policy "distributions_insert" on public.investor_distributions for insert
  with check (org_id = auth.org_id());
create policy "distributions_update" on public.investor_distributions for update
  using (org_id = auth.org_id())
  with check (org_id = auth.org_id());
create policy "distributions_delete" on public.investor_distributions for delete
  using (org_id = auth.org_id() and auth.user_role() in ('owner', 'admin'));

-- Waterfall Tiers
alter table public.waterfall_tiers enable row level security;

create policy "waterfall_select" on public.waterfall_tiers for select
  using (org_id = auth.org_id());
create policy "waterfall_insert" on public.waterfall_tiers for insert
  with check (org_id = auth.org_id());
create policy "waterfall_update" on public.waterfall_tiers for update
  using (org_id = auth.org_id())
  with check (org_id = auth.org_id());
create policy "waterfall_delete" on public.waterfall_tiers for delete
  using (org_id = auth.org_id() and auth.user_role() in ('owner', 'admin'));
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
