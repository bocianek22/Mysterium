// Deterministyczny silnik auto-grafiku.
// Cel: pokryć zapotrzebowanie (stacjonarne + wyjazdy), respektować
// dyspozycyjność i umiejętności, dążyć do celu godzin i SPRAWIEDLIWIE
// rozdzielać typy zmian oraz dni „gorące".

export type SchedEmployee = {
  id: string;
  name: string;
  canStationary: boolean;
  canMobile: boolean;
  targetHours: number;
  baseHours?: number; // godziny już zaplanowane w tym miesiącu (poza generowaniem)
};

export type SchedAvailability = { userId: string; start: string | Date; end: string | Date };

export type SchedDemand = {
  date: string; // YYYY-MM-DD
  stationary: number;
  mobile: number;
  startTime: string; // "16:00"
  endTime: string; // "22:00"
};

export type ProposedShift = {
  userId: string;
  userName: string;
  start: string; // ISO/local "YYYY-MM-DDTHH:mm"
  end: string;
  type: "stationary" | "mobile";
};

export type SchedSummary = {
  userId: string;
  name: string;
  hours: number;
  targetHours: number;
  stationary: number;
  mobile: number;
  days: number;
};

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function hoursBetween(a: Date, b: Date) {
  return Math.max(0, (b.getTime() - a.getTime()) / 3_600_000);
}

export function generateSchedule(input: {
  employees: SchedEmployee[];
  availabilities: SchedAvailability[];
  demands: SchedDemand[];
}) {
  const { employees, availabilities, demands } = input;

  // dyspozycyjność: userId+dzień -> okno [start,end]
  const availByKey = new Map<string, { start: Date; end: Date }>();
  for (const a of availabilities) {
    const s = new Date(a.start);
    const e = new Date(a.end);
    const key = `${a.userId}|${ymd(s)}`;
    const cur = availByKey.get(key);
    // jeśli kilka okien — bierzemy najszersze
    if (!cur) availByKey.set(key, { start: s, end: e });
    else availByKey.set(key, { start: s < cur.start ? s : cur.start, end: e > cur.end ? e : cur.end });
  }

  const stats = new Map<string, SchedSummary>();
  for (const e of employees) {
    stats.set(e.id, { userId: e.id, name: e.name, hours: e.baseHours || 0, targetHours: e.targetHours, stationary: 0, mobile: 0, days: 0 });
  }
  const daysWorked = new Map<string, Set<string>>(); // userId -> set of dates
  employees.forEach((e) => daysWorked.set(e.id, new Set()));

  const proposed: ProposedShift[] = [];
  const unfilled: { date: string; type: "stationary" | "mobile" }[] = [];

  const sortedDemands = [...demands].sort((a, b) => a.date.localeCompare(b.date));

  for (const day of sortedDemands) {
    const assignedToday = new Set<string>();
    const slots: ("stationary" | "mobile")[] = [
      ...Array(Math.max(0, day.stationary)).fill("stationary"),
      ...Array(Math.max(0, day.mobile)).fill("mobile"),
    ];
    const demandStart = new Date(`${day.date}T${day.startTime}`);
    const demandEnd = new Date(`${day.date}T${day.endTime}`);

    for (const type of slots) {
      const candidates = employees.filter((e) => {
        if (assignedToday.has(e.id)) return false;
        if (type === "stationary" && !e.canStationary) return false;
        if (type === "mobile" && !e.canMobile) return false;
        return availByKey.has(`${e.id}|${day.date}`);
      });
      if (candidates.length === 0) {
        unfilled.push({ date: day.date, type });
        continue;
      }
      candidates.sort((a, b) => {
        const sa = stats.get(a.id)!;
        const sb = stats.get(b.id)!;
        const defA = a.targetHours > 0 ? a.targetHours - sa.hours : 0;
        const defB = b.targetHours > 0 ? b.targetHours - sb.hours : 0;
        if (defB !== defA) return defB - defA; // większy deficyt = wyżej
        const tA = type === "stationary" ? sa.stationary : sa.mobile;
        const tB = type === "stationary" ? sb.stationary : sb.mobile;
        if (tA !== tB) return tA - tB; // mniej tego typu = wyżej (sprawiedliwie)
        if (sa.days !== sb.days) return sa.days - sb.days; // mniej dni = wyżej
        if (sa.hours !== sb.hours) return sa.hours - sb.hours;
        return sa.name.localeCompare(sb.name);
      });
      const pick = candidates[0];
      const av = availByKey.get(`${pick.id}|${day.date}`)!;
      // zmiana = część wspólna okna firmy i dyspozycyjności
      const start = av.start > demandStart ? av.start : demandStart;
      const end = av.end < demandEnd ? av.end : demandEnd;
      if (hoursBetween(start, end) <= 0) {
        unfilled.push({ date: day.date, type });
        continue;
      }
      const st = stats.get(pick.id)!;
      const h = hoursBetween(start, end);
      st.hours += h;
      if (type === "stationary") st.stationary++; else st.mobile++;
      const dw = daysWorked.get(pick.id)!;
      if (!dw.has(day.date)) { dw.add(day.date); st.days++; }
      assignedToday.add(pick.id);
      proposed.push({
        userId: pick.id,
        userName: pick.name,
        start: localIso(start),
        end: localIso(end),
        type,
      });
    }
  }

  const summary = employees.map((e) => stats.get(e.id)!);
  return { proposed, summary, unfilled };
}

function localIso(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
