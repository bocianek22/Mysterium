"use client";
import { useMemo, useState } from "react";

export type CalEvent = {
  id: string;
  start: string | Date;
  end: string | Date;
  title: string;
  color?: string;
  sub?: string;
};

const MONTHS = [
  "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec",
  "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień",
];
const DOW = ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"];

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function MonthCalendar({
  events,
  year,
  month,
  onMonthChange,
  onDayClick,
  onEventClick,
}: {
  events: CalEvent[];
  year: number;
  month: number; // 0–11
  onMonthChange: (y: number, m: number) => void;
  onDayClick?: (date: string) => void;
  onEventClick?: (id: string) => void;
}) {
  const today = ymd(new Date());

  const days = useMemo(() => {
    const first = new Date(year, month, 1);
    const startDow = (first.getDay() + 6) % 7; // poniedziałek = 0
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startDow; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [year, month]);

  const byDay = useMemo(() => {
    const map: Record<string, CalEvent[]> = {};
    for (const ev of events) {
      const key = ymd(new Date(ev.start));
      (map[key] ||= []).push(ev);
    }
    return map;
  }, [events]);

  function shift(delta: number) {
    const m = month + delta;
    const y = year + Math.floor(m / 12);
    const mm = ((m % 12) + 12) % 12;
    onMonthChange(y, mm);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => shift(-1)} className="px-3 py-1 rounded text-sm" style={{ border: "1px solid var(--border)", color: "var(--gold)" }}>‹</button>
        <div className="font-display text-xl" style={{ color: "var(--gold)" }}>
          {MONTHS[month]} {year}
        </div>
        <button onClick={() => shift(1)} className="px-3 py-1 rounded text-sm" style={{ border: "1px solid var(--border)", color: "var(--gold)" }}>›</button>
      </div>
      <div className="grid grid-cols-7 gap-[2px]">
        {DOW.map((d) => (
          <div key={d} className="text-center text-[10px] font-serif tracking-[2px] uppercase py-1" style={{ color: "var(--dim)" }}>
            {d}
          </div>
        ))}
        {days.map((d, i) => {
          if (!d) return <div key={i} style={{ background: "rgba(255,255,255,.01)" }} className="min-h-[78px] rounded" />;
          const key = ymd(d);
          const evs = byDay[key] || [];
          const isToday = key === today;
          return (
            <div
              key={i}
              onClick={() => onDayClick?.(key)}
              className="min-h-[78px] rounded p-1 cursor-pointer transition-colors hover:bg-[rgba(201,168,76,.06)]"
              style={{ border: isToday ? "1px solid var(--gold)" : "1px solid var(--border)", background: "rgba(13,27,42,.5)" }}
            >
              <div className="text-[11px] mb-1" style={{ color: isToday ? "var(--gold)" : "var(--muted)" }}>
                {d.getDate()}
              </div>
              <div className="flex flex-col gap-[2px]">
                {evs.slice(0, 3).map((ev) => (
                  <button
                    key={ev.id}
                    onClick={(e) => { e.stopPropagation(); onEventClick?.(ev.id); }}
                    className="text-[10px] px-1 py-[1px] rounded truncate text-left"
                    style={{ background: (ev.color || "var(--gold)") + "22", color: ev.color || "var(--gold)", borderLeft: `2px solid ${ev.color || "var(--gold)"}` }}
                    title={ev.title}
                  >
                    {new Date(ev.start).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })} {ev.title}
                  </button>
                ))}
                {evs.length > 3 && (
                  <span className="text-[9px]" style={{ color: "var(--dim)" }}>+{evs.length - 3} więcej</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
