// Wydatki firmowe — kategorie wspólne dla panelu i wyliczeń.
export const EXPENSE_CATEGORIES = [
  { key: "ZAKUP", label: "Zakup / wyposażenie" },
  { key: "NAPRAWA", label: "Naprawa" },
  { key: "KONSERWACJA", label: "Konserwacja pokoju" },
  { key: "MEDIA", label: "Media / czynsz" },
  { key: "MARKETING", label: "Marketing" },
  { key: "INNE", label: "Inne" },
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]["key"];

export function expenseCategoryLabel(key: string): string {
  return EXPENSE_CATEGORIES.find((c) => c.key === key)?.label || key;
}
