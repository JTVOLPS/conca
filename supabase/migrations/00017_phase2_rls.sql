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
