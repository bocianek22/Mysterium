// Magazyn — kategorie pozycji.
export const INVENTORY_CATEGORIES = [
  { key: "BILETY", label: "Bilety / vouchery" },
  { key: "GADZETY", label: "Gadżety" },
  { key: "AKCESORIA", label: "Akcesoria na wyjazdy" },
  { key: "MATERIALY", label: "Materiały eksploatacyjne" },
  { key: "INNE", label: "Inne" },
] as const;

export function inventoryCategoryLabel(key: string) {
  return INVENTORY_CATEGORIES.find((c) => c.key === key)?.label || key;
}
