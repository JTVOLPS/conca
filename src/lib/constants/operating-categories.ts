export const REVENUE_LINE_ITEMS = [
  "Base Rent",
  "Percentage Rent",
  "CAM Recoveries",
  "Parking Revenue",
  "Other Revenue",
] as const;

export type RevenueLineItem = (typeof REVENUE_LINE_ITEMS)[number];

export const OPERATING_EXPENSE_LINE_ITEMS = [
  "Property Taxes",
  "Insurance",
  "Utilities",
  "Management Fee",
  "Repairs & Maintenance",
  "Landscaping",
  "Janitorial",
  "Security",
  "Marketing",
  "Legal & Professional",
  "Administrative",
  "Other Operating Expense",
] as const;

export type OperatingExpenseLineItem = (typeof OPERATING_EXPENSE_LINE_ITEMS)[number];

export const CAPITAL_EXPENSE_LINE_ITEMS = [
  "Roof",
  "HVAC",
  "Parking Lot",
  "Common Area",
  "Tenant Improvements",
  "Other Capital",
] as const;

export type CapitalExpenseLineItem = (typeof CAPITAL_EXPENSE_LINE_ITEMS)[number];

export const OPERATING_CATEGORY_LABELS = {
  revenue: "Revenue",
  operating_expense: "Operating Expenses",
  capital_expense: "Capital Expenses",
} as const;

export type OperatingCategory = keyof typeof OPERATING_CATEGORY_LABELS;

export const OPERATING_CATEGORY_LABEL_MAP = Object.fromEntries(
  Object.entries(OPERATING_CATEGORY_LABELS).map(([key, label]) => [key, label])
) as Record<OperatingCategory, (typeof OPERATING_CATEGORY_LABELS)[OperatingCategory]>;
