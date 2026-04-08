# Conca — Database Schema Documentation

## Overview

All tables use `uuid` primary keys generated with `gen_random_uuid()`. Timestamps use `timestamptz`. Every data table includes `org_id` for Row Level Security (RLS). The schema uses PostgreSQL extensions: `pg_trgm` for fuzzy search.

---

## Core Tables

### `orgs`
Organization / workspace.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| name | text | Organization name |
| slug | text UNIQUE | URL-friendly identifier |
| settings | jsonb | Org-level settings |
| created_at | timestamptz | |
| updated_at | timestamptz | Auto-updated via trigger |

### `user_profiles`
Extends Supabase `auth.users`.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK, FK auth.users | |
| org_id | uuid FK orgs | |
| role | text | 'owner', 'admin', 'member' |
| full_name | text | |
| avatar_url | text | Nullable |
| is_active | boolean | Default true |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `invitations`
Pending team member invitations.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| org_id | uuid FK orgs | |
| email | text | |
| role | text | 'admin', 'member' |
| invited_by | uuid FK auth.users | |
| accepted_at | timestamptz | Null until accepted |
| expires_at | timestamptz | Default now() + 7 days |
| created_at | timestamptz | |

---

## Contacts Module

### `contacts`
People in the CRM.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| org_id | uuid FK orgs | |
| first_name | text | Required |
| last_name | text | Required |
| email | text | |
| phone | text | |
| mobile | text | |
| title | text | Job title |
| type | text | broker, lender, investor, attorney, property_manager, contractor, tenant, partner, other |
| address_line1 | text | |
| address_line2 | text | |
| city | text | |
| state | text | |
| zip | text | |
| country | text | Default 'US' |
| notes | text | |
| tags | text[] | Array of tag strings |
| source | text | How the contact was found |
| search_vector | tsvector | Auto-updated via trigger |
| created_by | uuid FK auth.users | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `companies`
Organizations/firms in the CRM.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| org_id | uuid FK orgs | |
| name | text | Required |
| type | text | brokerage, lender, investor, developer, property_manager, law_firm, title_company, insurance, contractor, other |
| website | text | |
| phone | text | |
| email | text | |
| address_* | text | Standard address fields |
| notes | text | |
| tags | text[] | |
| search_vector | tsvector | |
| created_by | uuid FK auth.users | |
| created_at, updated_at | timestamptz | |

### `contact_companies`
Many-to-many junction between contacts and companies.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| contact_id | uuid FK contacts | |
| company_id | uuid FK companies | |
| role | text | e.g., "Partner", "Broker" |
| is_primary | boolean | Default false |
| started_at | date | |
| ended_at | date | |
| created_at | timestamptz | |

**Unique constraint**: (contact_id, company_id)

### `interactions`
Activity log entries (calls, emails, meetings, notes).

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| org_id | uuid FK orgs | |
| contact_id | uuid FK contacts | Nullable |
| company_id | uuid FK companies | Nullable |
| deal_id | uuid FK deals | Nullable |
| type | text | call, email, meeting, note, site_visit, other |
| subject | text | |
| body | text | |
| occurred_at | timestamptz | When it happened |
| logged_by | uuid FK auth.users | Who logged it |
| created_at, updated_at | timestamptz | |

---

## Properties Module

### `properties`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| org_id | uuid FK orgs | |
| name | text | Required |
| asset_class | text | ios, marina, hospitality, multifamily, transitional, other |
| status | text | active, under_contract, closed, disposed, watch_list |
| address_* | text | Standard address fields + county |
| latitude | numeric(10,7) | |
| longitude | numeric(10,7) | |
| year_built | integer | |
| total_sf | numeric(12,2) | |
| lot_size_acres | numeric(10,4) | |
| num_units | integer | |
| zoning | text | |
| parcel_number | text | |
| custom_fields | jsonb | Asset-class-specific data |
| notes | text | |
| tags | text[] | |
| search_vector | tsvector | |
| created_by | uuid FK auth.users | |
| created_at, updated_at | timestamptz | |

---

## Deals Module

### `deals`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| org_id | uuid FK orgs | |
| name | text | Required |
| asset_class | text | Same enum as properties |
| stage | text | sourcing, loi, under_contract, due_diligence, closed, dead |
| stage_position | integer | Ordering within kanban column |
| stage_changed_at | timestamptz | |
| sourced_at through closing_date | date | Key milestone dates |
| dead_at | date | |
| dead_reason | text | |
| lead_broker_id | uuid FK contacts | |
| lead_source | text | |
| property_id | uuid FK properties | |
| custom_fields | jsonb | Per-asset-class fields |
| description | text | |
| notes | text | |
| tags | text[] | |
| search_vector | tsvector | |
| assigned_to | uuid FK auth.users | |
| created_by | uuid FK auth.users | |
| created_at, updated_at | timestamptz | |

### `deal_economics`
Financial data for a deal (one record per deal).

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| deal_id | uuid FK deals UNIQUE | One-to-one |
| org_id | uuid FK orgs | |
| asking_price | numeric(15,2) | |
| offer_price | numeric(15,2) | |
| purchase_price | numeric(15,2) | |
| price_per_unit | numeric(15,2) | |
| price_per_sf | numeric(15,2) | |
| noi | numeric(15,2) | |
| gross_revenue | numeric(15,2) | |
| occupancy_pct | numeric(5,2) | |
| cap_rate_in | numeric(6,4) | Stored as decimal (0.0525 = 5.25%) |
| cap_rate_out | numeric(6,4) | |
| loan_amount | numeric(15,2) | |
| ltv | numeric(5,4) | |
| interest_rate | numeric(6,4) | |
| loan_term_months | integer | |
| lender_id | uuid FK companies | |
| irr_target | numeric(6,4) | |
| equity_multiple | numeric(6,2) | |
| cash_on_cash | numeric(6,4) | |
| total_equity | numeric(15,2) | |
| sponsor_equity | numeric(15,2) | |
| lp_equity | numeric(15,2) | |
| closing_costs | numeric(15,2) | |
| capex_budget | numeric(15,2) | |
| hold_period_months | integer | |
| custom_fields | jsonb | |
| notes | text | |
| created_at, updated_at | timestamptz | |

### `deal_contacts`
Many-to-many junction: contacts involved in a deal.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| deal_id | uuid FK deals | |
| contact_id | uuid FK contacts | |
| role | text | e.g., "Seller", "Buyer", "Broker" |
| created_at | timestamptz | |

**Unique constraint**: (deal_id, contact_id, role)

### `deal_stage_history`
Audit trail of stage transitions.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| deal_id | uuid FK deals | |
| org_id | uuid FK orgs | |
| from_stage | text | Null for initial creation |
| to_stage | text | |
| changed_by | uuid FK auth.users | |
| changed_at | timestamptz | |

### `deal_field_definitions`
Schema for custom fields per asset class.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| asset_class | text | |
| field_key | text | Machine-readable key |
| field_label | text | Display label |
| field_type | text | text, number, boolean, date, select, textarea |
| options | jsonb | For 'select' type |
| display_order | integer | |
| is_required | boolean | |
| section | text | UI grouping |

**Unique constraint**: (asset_class, field_key)

---

## Future Tables (Schema Ready, No UI Yet)

### `documents`
File storage linked to entities.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| org_id | uuid FK orgs | |
| storage_path | text | Supabase Storage path |
| file_name | text | |
| file_size | bigint | |
| mime_type | text | |
| entity_type | text | deal, property, contact, company |
| entity_id | uuid | Polymorphic FK |
| category | text | LOI, PSA, Appraisal, etc. |
| tags | text[] | |
| version | integer | Default 1 |
| uploaded_by | uuid FK auth.users | |
| created_at | timestamptz | |

### `tasks`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| org_id | uuid FK orgs | |
| title | text | |
| description | text | |
| status | text | todo, in_progress, done, cancelled |
| priority | text | low, medium, high, urgent |
| due_date | date | |
| entity_type | text | deal, property, contact, company |
| entity_id | uuid | Polymorphic FK |
| assigned_to | uuid FK auth.users | |
| created_by | uuid FK auth.users | |
| completed_at | timestamptz | |
| created_at, updated_at | timestamptz | |

### `audit_log`
Application-level change tracking.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| org_id | uuid FK orgs | |
| user_id | uuid FK auth.users | |
| action | text | insert, update, delete |
| table_name | text | |
| record_id | uuid | |
| old_data | jsonb | Previous state |
| new_data | jsonb | New state |
| created_at | timestamptz | |

---

## RLS Strategy

Every table has Row Level Security enabled. Policies follow this pattern:

- **SELECT**: `org_id = auth.org_id()` — users see only their org's data
- **INSERT**: `WITH CHECK (org_id = auth.org_id())` — can only insert into own org
- **UPDATE**: `USING (org_id = auth.org_id()) WITH CHECK (org_id = auth.org_id())`
- **DELETE**: `USING (org_id = auth.org_id() AND auth.user_role() IN ('owner', 'admin'))` — only admins can delete

Junction tables without `org_id` derive access via EXISTS subquery on the parent table.

## Search

- `tsvector` columns with GIN indexes on contacts, companies, deals, properties
- `pg_trgm` trigram indexes for fuzzy/partial matching
- `global_search(query, limit)` Postgres function unions results across all entity tables
