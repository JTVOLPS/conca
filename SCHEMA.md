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

## Asset Management Module (Phase 2)

### `tenants`
Rent roll tracking per property.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| org_id | uuid FK orgs | |
| property_id | uuid FK properties | |
| name | text | Required |
| contact_id | uuid FK contacts | Nullable — link to CRM contact |
| unit_label | text | Suite/unit identifier |
| status | text CHECK | active, vacant, notice_given, month_to_month |
| occupied_sf | numeric(12,2) | |
| notes | text | |
| created_by | uuid FK auth.users | |
| created_at, updated_at | timestamptz | |

### `leases`
Lease terms and escalations.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| org_id | uuid FK orgs | |
| tenant_id | uuid FK tenants | |
| property_id | uuid FK properties | |
| lease_type | text CHECK | gross, modified_gross, nnn, percentage, ground, month_to_month, other |
| start_date | date | |
| end_date | date | Nullable |
| rent_amount | numeric(15,2) | |
| rent_frequency | text CHECK | monthly, quarterly, annually |
| rent_escalation_pct | numeric(5,2) | |
| rent_escalation_date | date | |
| security_deposit | numeric(15,2) | |
| cam_charges | numeric(15,2) | |
| free_rent_months | integer | |
| renewal_option_terms | text | |
| early_termination_terms | text | |
| notes | text | |
| created_at, updated_at | timestamptz | |

### `operating_statements`
Monthly revenue and expense tracking with actual vs budget.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| org_id | uuid FK orgs | |
| property_id | uuid FK properties | |
| period_year | integer | |
| period_month | integer | 1–12 |
| category | text CHECK | revenue, operating_expense, capital_expense, debt_service, other |
| line_item | text | e.g., "Base Rent", "Utilities" |
| actual_amount | numeric(15,2) | |
| budget_amount | numeric(15,2) | |
| notes | text | |
| created_by | uuid FK auth.users | |
| created_at, updated_at | timestamptz | |

**Unique constraint**: (org_id, property_id, period_year, period_month, category, line_item)

### `capex_projects`
Capital expenditure tracking.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| org_id | uuid FK orgs | |
| property_id | uuid FK properties | Nullable |
| deal_id | uuid FK deals | Nullable |
| name | text | Required |
| description | text | |
| status | text CHECK | planned, in_progress, completed, on_hold, cancelled |
| budgeted_amount | numeric(15,2) | |
| actual_amount | numeric(15,2) | |
| start_date | date | |
| end_date | date | |
| contractor | text | |
| notes | text | |
| created_by | uuid FK auth.users | |
| created_at, updated_at | timestamptz | |

### `debt_instruments`
Loan and financing tracking.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| org_id | uuid FK orgs | |
| property_id | uuid FK properties | Nullable |
| deal_id | uuid FK deals | Nullable |
| lender_company_id | uuid FK companies | |
| loan_name | text | |
| loan_type | text CHECK | permanent, bridge, construction, mezzanine, line_of_credit, other |
| original_amount | numeric(15,2) | |
| current_balance | numeric(15,2) | |
| interest_rate | numeric(6,4) | |
| rate_type | text CHECK | fixed, variable, hybrid |
| spread_bps | integer | Basis points over index |
| index_name | text | e.g., SOFR, Prime |
| origination_date | date | |
| maturity_date | date | |
| io_period_months | integer | Interest-only period |
| amortization_months | integer | |
| monthly_payment | numeric(15,2) | |
| dscr | numeric(6,2) | Debt service coverage ratio |
| ltv | numeric(5,4) | Loan-to-value |
| recourse | text CHECK | full, partial, non_recourse |
| covenants | jsonb | Structured covenant terms |
| prepayment_terms | text | |
| extension_options | text | |
| notes | text | |
| created_by | uuid FK auth.users | |
| created_at, updated_at | timestamptz | |

---

## Documents & Files

### `documents`
File storage linked to entities via Supabase Storage.

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
| category | text | LOI, PSA, Appraisal, Title, Environmental, Survey, Financials, Lease, Insurance, Legal, Photo, Other |
| tags | text[] | |
| version | integer | Default 1 |
| notes | text | |
| document_group_id | uuid | Self-referencing first upload for version grouping |
| uploaded_by | uuid FK auth.users | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

---

## Tasks & Workflow

### `tasks`
Assignable tasks linked to entities.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| org_id | uuid FK orgs | |
| title | text | Required |
| description | text | |
| status | text CHECK | todo, in_progress, done, cancelled |
| priority | text CHECK | low, medium, high, urgent |
| due_date | date | |
| entity_type | text CHECK | deal, property, contact, company |
| entity_id | uuid | Polymorphic FK |
| assigned_to | uuid FK auth.users | |
| created_by | uuid FK auth.users | |
| completed_at | timestamptz | Set when status → done |
| position | integer | Default 0, for kanban ordering |
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

## Views

### `v_rent_roll`
Denormalized view joining tenants + latest lease with computed lease_status.

| Column | Source |
|--------|-------|
| property_id | tenants |
| tenant_id, tenant_name, unit_label, tenant_status, occupied_sf | tenants |
| lease_id, lease_type, start_date, end_date, rent_amount, rent_frequency | leases (latest) |

---

## Functions

| Function | Returns | Description |
|----------|---------|-------------|
| `global_search(query, limit)` | rows | Full-text + trigram search across all entities |
| `get_expiring_leases(org_id, within_days)` | rows | Leases expiring within N days |
| `portfolio_aum()` | numeric | Sum of purchase_price for closed deals |
| `portfolio_noi(p_year)` | numeric | Revenue minus expenses for a given year |
| `portfolio_occupancy()` | numeric | Occupied SF / total SF percentage |
| `portfolio_weighted_cap_rate()` | numeric | Purchase-price-weighted avg cap rate |
| `pipeline_by_stage()` | rows | Deal count and total value per stage |
| `debt_maturity_ladder()` | rows | Debt count and balance grouped by maturity year |

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
