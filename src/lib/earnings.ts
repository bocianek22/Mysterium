// Wyliczanie godzin i wynagrodzenia ze zmian.
// Klasyfikacja każdego fragmentu czasu wg priorytetu: weekend > noc > dzień.
//   - weekend: sobota lub niedziela (cała doba) → stawka weekendowa
//   - noc: godziny 22:00–06:00 → stawka nocna
//   - dzień: pozostałe → stawka dzienna
// Uwaga: czas interpretowany jest wg strefy serwera (na Vercel = UTC), więc
// godziny wpisane w panelu traktujemy jako lokalny czas obiektu.

export type Rates = {
  rateDay: number;
  rateNight: number;
  rateWeekend: number;
};

export type Breakdown = {
  dayHours: number;
  nightHours: number;
  weekendHours: number;
  totalHours: number;
  pay: number;
};

function classify(d: Date): "weekend" | "night" | "day" {
  const day = d.getUTCDay(); // 0 = niedziela, 6 = sobota
  if (day === 0 || day === 6) return "weekend";
  const h = d.getUTCHours();
  if (h >= 22 || h < 6) return "night";
  return "day";
}

const STEP_MIN = 15;

export function shiftBreakdown(
  start: Date | string,
  end: Date | string,
  rates: Rates
): Breakdown {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  let day = 0,
    night = 0,
    weekend = 0;
  if (e > s) {
    const step = STEP_MIN * 60 * 1000;
    for (let t = s; t < e; t += step) {
      const slice = Math.min(step, e - t) / 3_600_000; // godziny w tym fragmencie
      const mid = new Date(t + Math.min(step, e - t) / 2);
      const kind = classify(mid);
      if (kind === "weekend") weekend += slice;
      else if (kind === "night") night += slice;
      else day += slice;
    }
  }
  const pay =
    day * (rates.rateDay || 0) +
    night * (rates.rateNight || 0) +
    weekend * (rates.rateWeekend || 0);
  return {
    dayHours: round(day),
    nightHours: round(night),
    weekendHours: round(weekend),
    totalHours: round(day + night + weekend),
    pay: Math.round(pay * 100) / 100,
  };
}

export function sumBreakdowns(items: Breakdown[]): Breakdown {
  return items.reduce(
    (acc, b) => ({
      dayHours: round(acc.dayHours + b.dayHours),
      nightHours: round(acc.nightHours + b.nightHours),
      weekendHours: round(acc.weekendHours + b.weekendHours),
      totalHours: round(acc.totalHours + b.totalHours),
      pay: Math.round((acc.pay + b.pay) * 100) / 100,
    }),
    { dayHours: 0, nightHours: 0, weekendHours: 0, totalHours: 0, pay: 0 }
  );
}

function round(n: number) {
  return Math.round(n * 100) / 100;
}

// Zakres miesiąca [start, end) dla danego roku/miesiąca (miesiąc 0–11)
export function monthRange(year: number, month: number) {
  const start = new Date(Date.UTC(year, month, 1, 0, 0, 0));
  const end = new Date(Date.UTC(year, month + 1, 1, 0, 0, 0));
  return { start, end };
}
