export type { Database, Json } from "./database";

import type { Database } from "./database";

// ---------------------------------------------------------------------------
// Helper generics for accessing table row / insert / update shapes
// ---------------------------------------------------------------------------

/** The shape returned by a SELECT on the given table. */
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

/** The shape accepted by an INSERT on the given table. */
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

/** The shape accepted by an UPDATE on the given table. */
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

// ---------------------------------------------------------------------------
// Convenient per-entity type aliases (Row types)
// ---------------------------------------------------------------------------

export type Org = Tables<"orgs">;
export type UserProfile = Tables<"user_profiles">;
export type Invitation = Tables<"invitations">;
export type Contact = Tables<"contacts">;
export type Company = Tables<"companies">;
export type ContactCompany = Tables<"contact_companies">;
export type Interaction = Tables<"interactions">;
export type Property = Tables<"properties">;
export type Deal = Tables<"deals">;
export type DealEconomics = Tables<"deal_economics">;
export type DealContact = Tables<"deal_contacts">;
export type DealStageHistory = Tables<"deal_stage_history">;
export type DealFieldDefinition = Tables<"deal_field_definitions">;
export type Document = Tables<"documents">;
export type Task = Tables<"tasks">;
export type Tenant = Tables<"tenants">;
export type Lease = Tables<"leases">;
export type OperatingStatement = Tables<"operating_statements">;
export type CapexProject = Tables<"capex_projects">;
export type DebtInstrument = Tables<"debt_instruments">;

// ---------------------------------------------------------------------------
// Enum-like union types extracted from the schema for standalone use
// ---------------------------------------------------------------------------

export type UserRole = UserProfile["role"];
export type InvitationRole = Invitation["role"];
export type ContactType = NonNullable<Contact["type"]>;
export type CompanyType = NonNullable<Company["type"]>;
export type InteractionType = Interaction["type"];
export type AssetClass = Property["asset_class"];
export type PropertyStatus = Property["status"];
export type DealStage = Deal["stage"];
export type FieldType = DealFieldDefinition["field_type"];
export type EntityType = Document["entity_type"];
export type TaskStatus = Task["status"];
export type TaskPriority = Task["priority"];
export type TaskEntityType = NonNullable<Task["entity_type"]>;
export type TenantStatus = Tenant["status"];
export type LeaseType = Lease["lease_type"];
export type RentFrequency = Lease["rent_frequency"];
export type OperatingCategory = OperatingStatement["category"];
export type CapexStatus = CapexProject["status"];
export type LoanType = DebtInstrument["loan_type"];
export type RateType = DebtInstrument["rate_type"];
