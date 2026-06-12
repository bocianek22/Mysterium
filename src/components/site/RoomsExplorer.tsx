"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";

export type ExplorerRoom = {
  id: string; slug: string; name: string; tagline: string; image: string | null;
  minPlayers: number; maxPlayers: number; durationMin: number; difficulty: string; badge: string;
  featured: boolean; priceFrom: number | null;
};

export default function RoomsExplorer({ locale, rooms, bookBase }: { locale: Locale; rooms: ExplorerRoom[]; bookBase: string }) {
  const pl = locale === "pl";
  const [q, setQ] = useState("");
  const [people, setPeople] = useState(0);
  const [diff, setDiff] = useState("");
  const [compare, setCompare] = useState(false);
  const [sel, setSel] = useState<string[]>([]);

  const difficulties = useMemo(() => Array.from(new Set(rooms.map((r) => r.difficulty).filter(Boolean))), [rooms]);

  const filtered = useMemo(() => rooms.filter((r) => {
    if (q && !`${r.name} ${r.tagline}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (people && !(r.minPlayers <= people && r.maxPlayers >= people)) return false;
    if (diff && r.difficulty !== diff) return false;
    return true;
  }).sort((a, b) => Number(b.featured) - Number(a.featured)), [rooms, q, people, diff]);

  const toggle = (id: string) => setSel((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  const selected = rooms.filter((r) => sel.includes(r.id));

  return (
    <section className="px-6 md:px-[60px] py-12 md:py-16 relative z-[1]" style={{ background: "var(--navy-dd)" }}>
      <div className="max-w-[1200px] mx-auto">
        {/* Filtry */}
        <div className="flex flex-wrap gap-3 mb-8 items-end">
          <div>
            <label className="field-label">{pl ? "Szukaj" : "Search"}</label>
            <input value={q} onChange={(e) => setQ(e.target.value)} className="field-input" placeholder={pl ? "nazwa pokoju…" : "room name…"} style={{ width: 200 }} />
          </div>
          <div>
            <label className="field-label">{pl ? "Liczba osób" : "Players"}</label>
            <select value={people} onChange={(e) => setPeople(Number(e.target.value))} className="field-input" style={{ width: 130 }}>
              <option value={0}>{pl ? "dowolna" : "any"}</option>
              {[2, 3, 4, 5, 6, 7, 8].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          {difficulties.length > 1 && (
            <div>
              <label className="field-label">{pl ? "Trudność" : "Difficulty"}</label>
              <select value={diff} onChange={(e) => setDiff(e.target.value)} className="field-input" style={{ width: 150 }}>
                <option value="">{pl ? "dowolna" : "any"}</option>
                {difficulties.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          )}
          <button onClick={() => { setCompare((c) => !c); setSel([]); }} className="px-4 py-2 rounded text-sm" style={compare ? { background: "var(--gold)", color: "#1a1206" } : { border: "1px solid var(--border)", color: "var(--gold)" }}>
            {compare ? (pl ? "Wyłącz porównanie" : "Stop comparing") : (pl ? "⇄ Porównaj pokoje" : "⇄ Compare rooms")}
          </button>
          {(q || people || diff) && <button onClick={() => { setQ(""); setPeople(0); setDiff(""); }} className="text-sm" style={{ color: "var(--muted)" }}>{pl ? "wyczyść" : "clear"}</button>}
        </div>

        {/* Tabela porównania */}
        {compare && selected.length > 0 && (
          <div className="overflow-x-auto mb-8 rounded" style={{ border: "1px solid var(--border)" }}>
            <table className="w-full text-sm" style={{ color: "var(--text)" }}>
              <thead><tr style={{ background: "rgba(201,168,76,.06)", color: "var(--gold)" }}>
                <th className="text-left px-3 py-2 font-serif text-[10px] uppercase tracking-[1px]">{pl ? "Cecha" : "Feature"}</th>
                {selected.map((r) => <th key={r.id} className="text-left px-3 py-2">{r.name}</th>)}
              </tr></thead>
              <tbody>
                {[
                  [pl ? "Osoby" : "Players", (r: ExplorerRoom) => `${r.minPlayers}–${r.maxPlayers}`],
                  [pl ? "Czas" : "Time", (r: ExplorerRoom) => `${r.durationMin} min`],
                  [pl ? "Trudność" : "Difficulty", (r: ExplorerRoom) => r.difficulty],
                  [pl ? "Cena od" : "From", (r: ExplorerRoom) => (r.priceFrom ? `${r.priceFrom} zł` : "—")],
                ].map(([label, fn], i) => (
                  <tr key={i} style={{ borderTop: "1px solid var(--border)" }}>
                    <td className="px-3 py-2" style={{ color: "var(--muted)" }}>{label as string}</td>
                    {selected.map((r) => <td key={r.id} className="px-3 py-2">{(fn as any)(r)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Siatka */}
        {filtered.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>{pl ? "Brak pokoi spełniających kryteria." : "No rooms match your filters."}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((r) => (
              <div key={r.id} className="relative rounded overflow-hidden group" style={{ border: "1px solid var(--border)", background: "rgba(13,27,42,.5)" }}>
                {r.featured && <span className="absolute top-3 left-3 z-[2] text-[10px] px-2 py-1 rounded font-serif tracking-[1px] uppercase" style={{ background: "var(--gold)", color: "#1a1206" }}>★ {pl ? "Polecany" : "Featured"}</span>}
                {compare && (
                  <label className="absolute top-3 right-3 z-[2] flex items-center gap-1 text-[11px] px-2 py-1 rounded cursor-pointer" style={{ background: "rgba(4,12,20,.7)", color: "var(--gold)" }}>
                    <input type="checkbox" checked={sel.includes(r.id)} onChange={() => toggle(r.id)} /> {pl ? "porównaj" : "compare"}
                  </label>
                )}
                <Link href={`${bookBase}/${r.slug}`} className="no-underline block">
                  <div className="h-44 bg-cover bg-center" style={{ backgroundImage: r.image ? `url(${r.image})` : "radial-gradient(ellipse at 50% 40%,rgba(13,61,58,.5),var(--navy-dd))" }} />
                  <div className="p-4">
                    <div className="font-display text-gold-grad text-lg mb-1">{r.name}</div>
                    <p className="text-xs mb-3 line-clamp-2" style={{ color: "var(--muted)" }}>{r.tagline}</p>
                    <div className="flex gap-3 flex-wrap text-[11px]" style={{ color: "var(--gold)" }}>
                      <span>👥 {r.minPlayers}–{r.maxPlayers}</span><span>⏱ {r.durationMin}′</span><span>⚡ {r.difficulty}</span>
                      {r.priceFrom ? <span>{pl ? "od" : "from"} {r.priceFrom} zł</span> : null}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
