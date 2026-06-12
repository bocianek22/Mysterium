// Liczenie wolnych terminów na podstawie godzin otwarcia + istniejących rezerwacji.
// Pracujemy w czasie lokalnym Europe/Warsaw (niezależnie od strefy serwera).

export type DayHours = { closed: boolean; open: string; close: string };
export const DEFAULT_HOURS: DayHours[] = Array.from({ length: 7 }, (_, i) => ({
  closed: i === 6 ? false : false, // domyślnie otwarte cały tydzień
  open: "12:00",
  close: "22:00",
}));

export function parseHours(json?: string | null): DayHours[] {
  try {
    const a = json ? JSON.parse(json) : null;
    if (Array.isArray(a) && a.length === 7) return a.map((d) => ({ closed: !!d.closed, open: d.open || "12:00", close: d.close || "22:00" }));
  } catch {}
  return DEFAULT_HOURS;
}

const TZ = "Europe/Warsaw";
const dateFmt = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
const timeFmt = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false });
const wdFmt = new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "short" });
const WD: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };

function dateKey(d: Date) { return dateFmt.format(d); }
function minutesOfDay(d: Date) { const [h, m] = timeFmt.format(d).split(":").map(Number); return h * 60 + m; }
function weekdayIdx(d: Date) { return WD[wdFmt.format(d)] ?? 0; }
const toMin = (hhmm: string) => { const [h, m] = hhmm.split(":").map(Number); return (h || 0) * 60 + (m || 0); };
const fmtMin = (min: number) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

export type FreeSlot = { dateKey: string; dateLabel: string; time: string };

const DAY_LABEL = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"];
const MONTH_SHORT = ["sty", "lut", "mar", "kwi", "maj", "cze", "lip", "sie", "wrz", "paź", "lis", "gru"];

// Zwraca listę najbliższych wolnych slotów (start) dla danego zbioru rezerwacji.
export function freeSlots(
  reservationStarts: Date[],
  hours: DayHours[],
  opts: { stepMin?: number; daysAhead?: number; limit?: number; leadMin?: number; blocks?: { start: Date; end: Date }[] } = {}
): FreeSlot[] {
  const step = opts.stepMin || 90;
  const daysAhead = opts.daysAhead || 10;
  const limit = opts.limit || 8;
  const lead = opts.leadMin ?? 60;

  // zajęte: zbiór "dateKey@minStart"
  const taken = new Set<string>();
  for (const d of reservationStarts) taken.add(`${dateKey(d)}@${minutesOfDay(d)}`);
  const takenAt = (dk: string, min: number) =>
    reservationStarts.some((d) => dateKey(d) === dk && Math.abs(minutesOfDay(d) - min) < step);

  const blocks = (opts.blocks || []).map((b) => ({ dk: dateKey(b.start), s: minutesOfDay(b.start), e: minutesOfDay(b.end) }));
  const blockedAt = (dk: string, min: number) =>
    blocks.some((b) => b.dk === dk && min < b.e && min + step > b.s);

  const now = new Date();
  const nowKey = dateKey(now);
  const nowMin = minutesOfDay(now);
  const out: FreeSlot[] = [];

  for (let i = 0; i < daysAhead && out.length < limit; i++) {
    const day = new Date(now.getTime() + i * 86400000);
    const dk = dateKey(day);
    const wd = weekdayIdx(day);
    const h = hours[wd];
    if (!h || h.closed) continue;
    const open = toMin(h.open);
    const close = toMin(h.close);
    for (let m = open; m + step <= close && out.length < limit; m += step) {
      if (dk === nowKey && m < nowMin + lead) continue; // za późno na dziś
      if (takenAt(dk, m)) continue;
      if (blockedAt(dk, m)) continue;
      const [y, mo, da] = dk.split("-").map(Number);
      const label = `${DAY_LABEL[wd]} ${da} ${MONTH_SHORT[mo - 1]}`;
      out.push({ dateKey: dk, dateLabel: label, time: fmtMin(m) });
    }
  }
  return out;
}

// Tworzy instant odpowiadający ścianie zegara w Warszawie dla daty+godziny.
export function warsawDate(dateStr: string, hhmm: string): Date {
  const [y, mo, da] = dateStr.split("-").map(Number);
  const [h, m] = hhmm.split(":").map(Number);
  const utcGuess = Date.UTC(y, (mo || 1) - 1, da || 1, h || 0, m || 0);
  const asUtc = new Date(utcGuess);
  const inv = new Date(asUtc.toLocaleString("en-US", { timeZone: TZ }));
  const offset = asUtc.getTime() - inv.getTime();
  return new Date(utcGuess + offset);
}

export { DAY_LABEL };
