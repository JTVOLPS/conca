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
