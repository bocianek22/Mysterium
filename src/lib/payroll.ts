// Wyliczanie wypłat z dziennych tabelek godzin (netto/brutto).
import { WORK_CATEGORIES, type CategoryKey } from "./categories";

export type Rates = Partial<Record<CategoryKey, { net?: number; brutto?: number }>>;

export type TimesheetRow = {
  stationaryH: number;
  mobileH: number;
  travelH: number;
  cleaningH: number;
};

export function parseRates(json?: string | null): Rates {
  try {
    const r = json ? JSON.parse(json) : {};
    return typeof r === "object" && r ? r : {};
  } catch {
    return {};
  }
}

const HFIELD: Record<CategoryKey, keyof TimesheetRow> = {
  stationary: "stationaryH",
  mobile: "mobileH",
  travel: "travelH",
  cleaning: "cleaningH",
};

export type PayrollResult = {
  hours: Record<CategoryKey, number>;
  totalHours: number;
  net: number;
  brutto: number;
};

export function computePayroll(timesheets: TimesheetRow[], ratesJson?: string | null): PayrollResult {
  const rates = parseRates(ratesJson);
  const hours = { stationary: 0, mobile: 0, travel: 0, cleaning: 0 } as Record<CategoryKey, number>;
  for (const ts of timesheets) {
    for (const c of WORK_CATEGORIES) hours[c.key] += Number((ts as any)[HFIELD[c.key]] || 0);
  }
  let net = 0;
  let brutto = 0;
  let totalHours = 0;
  for (const c of WORK_CATEGORIES) {
    const h = hours[c.key];
    totalHours += h;
    net += h * (rates[c.key]?.net || 0);
    brutto += h * (rates[c.key]?.brutto || 0);
  }
  return { hours, totalHours: round(totalHours), net: round(net), brutto: round(brutto) };
}

function round(n: number) {
  return Math.round(n * 100) / 100;
}

export function monthRange(year: number, month: number) {
  return { start: new Date(Date.UTC(year, month, 1)), end: new Date(Date.UTC(year, month + 1, 1)) };
}
