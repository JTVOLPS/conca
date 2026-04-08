export const INVESTOR_TYPES = [
  { value: "individual", label: "Individual" },
  { value: "entity", label: "Entity" },
  { value: "fund", label: "Fund" },
  { value: "family_office", label: "Family Office" },
  { value: "institution", label: "Institution" },
  { value: "other", label: "Other" },
] as const;

export type InvestorType = (typeof INVESTOR_TYPES)[number]["value"];

export const INVESTOR_TYPE_MAP = Object.fromEntries(
  INVESTOR_TYPES.map((t) => [t.value, t])
) as Record<InvestorType, (typeof INVESTOR_TYPES)[number]>;
