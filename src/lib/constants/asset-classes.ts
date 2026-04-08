export const ASSET_CLASSES = [
  { value: "ios", label: "Industrial Outdoor Storage" },
  { value: "marina", label: "Marina" },
  { value: "hospitality", label: "Hospitality" },
  { value: "multifamily", label: "Multifamily" },
  { value: "transitional", label: "Transitional" },
  { value: "other", label: "Other" },
] as const;

export type AssetClass = (typeof ASSET_CLASSES)[number]["value"];

export const ASSET_CLASS_MAP = Object.fromEntries(
  ASSET_CLASSES.map((a) => [a.value, a])
) as Record<AssetClass, (typeof ASSET_CLASSES)[number]>;
