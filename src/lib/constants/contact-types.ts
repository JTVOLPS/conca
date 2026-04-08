export const CONTACT_TYPES = [
  { value: "broker", label: "Broker" },
  { value: "lender", label: "Lender" },
  { value: "investor", label: "Investor" },
  { value: "attorney", label: "Attorney" },
  { value: "property_manager", label: "Property Manager" },
  { value: "contractor", label: "Contractor" },
  { value: "tenant", label: "Tenant" },
  { value: "partner", label: "Partner" },
  { value: "other", label: "Other" },
] as const;

export type ContactType = (typeof CONTACT_TYPES)[number]["value"];

export const COMPANY_TYPES = [
  { value: "brokerage", label: "Brokerage" },
  { value: "lender", label: "Lender" },
  { value: "investor", label: "Investor" },
  { value: "developer", label: "Developer" },
  { value: "property_manager", label: "Property Manager" },
  { value: "law_firm", label: "Law Firm" },
  { value: "title_company", label: "Title Company" },
  { value: "insurance", label: "Insurance" },
  { value: "contractor", label: "Contractor" },
  { value: "other", label: "Other" },
] as const;

export type CompanyType = (typeof COMPANY_TYPES)[number]["value"];

export const INTERACTION_TYPES = [
  { value: "call", label: "Call" },
  { value: "email", label: "Email" },
  { value: "meeting", label: "Meeting" },
  { value: "note", label: "Note" },
  { value: "site_visit", label: "Site Visit" },
  { value: "other", label: "Other" },
] as const;

export type InteractionType = (typeof INTERACTION_TYPES)[number]["value"];
