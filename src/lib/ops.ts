// Operacje — typy konserwacji i checklist.
export const MAINTENANCE_TYPES = [
  { key: "RESET", label: "Reset rekwizytów" },
  { key: "BATERIE", label: "Wymiana baterii" },
  { key: "USTERKA", label: "Usterka" },
  { key: "NAPRAWA", label: "Naprawa" },
  { key: "PRZEGLAD", label: "Przegląd" },
  { key: "INNE", label: "Inne" },
] as const;

export const PRIORITIES = [
  { key: "LOW", label: "Niski" },
  { key: "NORMAL", label: "Normalny" },
  { key: "HIGH", label: "Pilny" },
] as const;

export function maintenanceTypeLabel(key: string) {
  return MAINTENANCE_TYPES.find((t) => t.key === key)?.label || key;
}
export function priorityLabel(key: string) {
  return PRIORITIES.find((p) => p.key === key)?.label || key;
}

export const CHECKLIST_KINDS = [
  { key: "OPEN", label: "Otwarcie lokalu" },
  { key: "CLOSE", label: "Zamknięcie lokalu" },
] as const;
