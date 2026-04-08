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
