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
