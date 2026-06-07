// Wnioski urlopowe — typy, liczenie dni roboczych i salda dni wolnych.

export const LEAVE_TYPES = [
  { key: "URLOP", label: "Urlop wypoczynkowy", counts: true },
  { key: "NA_ZADANIE", label: "Urlop na żądanie", counts: true },
  { key: "BEZPLATNY", label: "Urlop bezpłatny", counts: false },
  { key: "CHOROBA", label: "Chorobowe (L4)", counts: false },
  { key: "INNE", label: "Inne / niedostępność", counts: false },
] as const;

export type LeaveType = (typeof LEAVE_TYPES)[number]["key"];

export function leaveTypeLabel(key: string): string {
  return LEAVE_TYPES.find((t) => t.key === key)?.label || key;
}

// Czy dany typ pomniejsza saldo urlopu wypoczynkowego.
export function leaveCounts(key: string): boolean {
  return !!LEAVE_TYPES.find((t) => t.key === key)?.counts;
}

// Liczba dni roboczych (pon–pt) w zakresie [start, end] włącznie.
// Interpretacja w UTC — daty zapisujemy jako YYYY-MM-DDT00:00:00Z.
export function workingDays(start: Date | string, end: Date | string): number {
  const s = new Date(start);
  const e = new Date(end);
  if (e < s) return 0;
  let count = 0;
  const cur = new Date(Date.UTC(s.getUTCFullYear(), s.getUTCMonth(), s.getUTCDate()));
  const last = new Date(Date.UTC(e.getUTCFullYear(), e.getUTCMonth(), e.getUTCDate()));
  while (cur <= last) {
    const day = cur.getUTCDay(); // 0 = niedziela, 6 = sobota
    if (day !== 0 && day !== 6) count++;
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return count;
}

// Zakres całego roku [start, end) w UTC.
export function yearRange(year: number) {
  return { start: new Date(Date.UTC(year, 0, 1)), end: new Date(Date.UTC(year + 1, 0, 1)) };
}
