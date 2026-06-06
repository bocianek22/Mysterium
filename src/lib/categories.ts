// Kategorie pracy (wspólne dla panelu i wyliczeń wypłat)
export const WORK_CATEGORIES = [
  { key: "stationary", label: "Gra stacjonarna" },
  { key: "mobile", label: "Gra mobilna" },
  { key: "travel", label: "Dojazd" },
  { key: "cleaning", label: "Sprzątanie/konserwacja" },
] as const;

export type CategoryKey = (typeof WORK_CATEGORIES)[number]["key"];

export const CONTRACT_TYPES = ["UoP", "Zlecenie", "UoD", "B2B"];
