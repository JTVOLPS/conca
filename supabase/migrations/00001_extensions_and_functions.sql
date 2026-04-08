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
