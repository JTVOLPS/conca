export const DISTRIBUTION_TYPES = [
  { value: "preferred_return", label: "Preferred Return" },
  { value: "profit_share", label: "Profit Share" },
  { value: "return_of_capital", label: "Return of Capital" },
  { value: "refinance_proceeds", label: "Refinance Proceeds" },
  { value: "sale_proceeds", label: "Sale Proceeds" },
  { value: "other", label: "Other" },
] as const;

export type DistributionType = (typeof DISTRIBUTION_TYPES)[number]["value"];

export const DISTRIBUTION_TYPE_MAP = Object.fromEntries(
  DISTRIBUTION_TYPES.map((t) => [t.value, t])
) as Record<DistributionType, (typeof DISTRIBUTION_TYPES)[number]>;
