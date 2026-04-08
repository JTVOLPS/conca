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
