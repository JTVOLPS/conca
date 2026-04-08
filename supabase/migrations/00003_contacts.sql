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
