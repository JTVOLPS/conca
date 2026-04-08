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
