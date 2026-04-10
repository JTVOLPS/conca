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
