"use client";
import { useEffect, useState, useCallback } from "react";

const MONTHS = ["Styczeń","Luty","Marzec","Kwiecień","Maj","Czerwiec","Lipiec","Sierpień","Wrzesień","Październik","Listopad","Grudzień"];
const DOW = ["Nd","Pn","Wt","Śr","Cz","Pt","So"];

type Demand = { stationary: number; mobile: number };

export default function AutoSchedule({ employeesCount }: { employeesCount: number }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [demands, setDemands] = useState<Record<string, Demand>>({});
  const [startTime, setStartTime] = useState("16:00");
  const [endTime, setEndTime] = useState("22:00");
  const [proposal, setProposal] = useState<any[] | null>(null);
  const [summary, setSummary] = useState<any[]>([]);
  const [unfilled, setUnfilled] = useState<any[]>([]);
  const [busy, setBusy] = useState("");
  const [ai, setAi] = useState("");
  const [aiMsg, setAiMsg] = useState("");

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const ymd = (d: number) => `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const load = useCallback(async () => {
    const from = new Date(year, month, 1).toISOString();
    const to = new Date(year, month + 1, 1).toISOString();
    const res = await fetch(`/api/admin/demand?from=${from}&to=${to}`);
    if (res.ok) {
      const items = (await res.json()).items;
      const map: Record<string, Demand> = {};
      for (const it of items) {
        const d = new Date(it.date);
        map[`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`] = { stationary: it.stationary, mobile: it.mobile };
        if (it.startTime) setStartTime(it.startTime);
        if (it.endTime) setEndTime(it.endTime);
      }
      setDemands(map);
    }
    setProposal(null); setUnfilled([]); setSummary([]);
  }, [year, month]);
  useEffect(() => { load(); }, [load]);

  async function saveDemand(date: string, d: Demand) {
    await fetch("/api/admin/demand", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date, stationary: d.stationary || 0, mobile: d.mobile || 0, startTime, endTime }) });
  }
  function setCell(date: string, field: keyof Demand, val: number) {
    const base: Demand = demands[date] ? { ...demands[date] } : { stationary: 0, mobile: 0 };
    base[field] = Math.max(0, val);
    setDemands((m) => ({ ...m, [date]: base }));
    saveDemand(date, base);
  }

  async function generate() {
    setBusy("Generuję grafik…"); setAiMsg("");
    const from = new Date(year, month, 1).toISOString();
    const to = new Date(year, month + 1, 1).toISOString();
    const res = await fetch("/api/admin/schedule/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ from, to }) });
    const data = await res.json();
    if (res.ok) { setProposal(data.proposed); setSummary(data.summary); setUnfilled(data.unfilled); setBusy(data.proposed.length ? "" : "Brak zmian — sprawdź zapotrzebowanie i dyspozycyjność."); }
    else setBusy(data.error || "Błąd");
  }

  async function apply() {
    if (!proposal?.length || !confirm(`Dodać ${proposal.length} zmian do grafiku?`)) return;
    setBusy("Zapisuję…");
    const res = await fetch("/api/admin/schedule/apply", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ shifts: proposal }) });
    const data = await res.json();
    setBusy(res.ok ? `✓ Dodano ${data.created} zmian do grafiku` : data.error || "Błąd");
    if (res.ok) setProposal(null);
  }

  async function askAi() {
    if (!ai.trim()) return;
    setAiMsg("AI myśli…");
    const res = await fetch("/api/admin/schedule/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ employees: summary, proposal, instruction: ai }) });
    const data = await res.json();
    if (!res.ok) { setAiMsg(data.error || "Błąd AI"); return; }
    if (data.shifts) setProposal(data.shifts);
    setAiMsg(data.explanation || "Gotowe.");
  }

  // grupuj propozycję per pracownik
  const byUser: Record<string, any[]> = {};
  (proposal || []).forEach((p) => { (byUser[p.userName] ||= []).push(p); });

  return (
    <div>
      <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
        <h1 className="font-display text-gold-grad text-3xl flex items-center gap-3"><span>🤖</span> Auto-grafik</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => setMonth((m) => (m === 0 ? (setYear((y) => y - 1), 11) : m - 1))} className="px-3 py-1 rounded" style={{ border: "1px solid var(--border)", color: "var(--gold)" }}>‹</button>
          <span className="font-display text-lg" style={{ color: "var(--gold)" }}>{MONTHS[month]} {year}</span>
          <button onClick={() => setMonth((m) => (m === 11 ? (setYear((y) => y + 1), 0) : m + 1))} className="px-3 py-1 rounded" style={{ border: "1px solid var(--border)", color: "var(--gold)" }}>›</button>
        </div>
      </div>
      <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>
        Ustaw ilu ludzi potrzebujesz danego dnia (stacjonarne / wyjazdy). Algorytm ułoży sprawiedliwy grafik z dyspozycyjności, celów godzin i umiejętności.
        {employeesCount === 0 && <b style={{ color: "#fca5a5" }}> Najpierw dodaj pracowników i ich dyspozycyjność.</b>}
      </p>

      <div className="flex items-end gap-3 mb-4 flex-wrap">
        <div><label className="field-label">Godziny zmiany (domyślne)</label>
          <div className="flex gap-2">
            <input type="time" className="field-input" value={startTime} onChange={(e) => setStartTime(e.target.value)} style={{ width: 110 }} />
            <input type="time" className="field-input" value={endTime} onChange={(e) => setEndTime(e.target.value)} style={{ width: 110 }} />
          </div>
        </div>
        <button onClick={generate} className="btn-gold" style={{ clipPath: "none", padding: "11px 24px" }}>Generuj grafik</button>
        {busy && <span className="text-sm" style={{ color: "var(--gold)" }}>{busy}</span>}
      </div>

      {/* Zapotrzebowanie — siatka dni */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mb-8">
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
          const date = ymd(d);
          const dow = new Date(year, month, d).getDay();
          const cur = demands[date] || { stationary: 0, mobile: 0 };
          const active = cur.stationary > 0 || cur.mobile > 0;
          return (
            <div key={d} className="p-2 rounded" style={{ background: active ? "rgba(201,168,76,.06)" : "rgba(13,27,42,.5)", border: "1px solid var(--border)" }}>
              <div className="text-[11px] mb-1" style={{ color: dow === 0 || dow === 6 ? "var(--gold)" : "var(--muted)" }}>{DOW[dow]} {d}.{String(month + 1).padStart(2, "0")}</div>
              <div className="flex gap-2">
                <label className="flex-1 text-[10px]" style={{ color: "var(--muted)" }}>🏠<input type="number" min={0} className="field-input mt-[2px]" style={{ padding: "4px 6px" }} value={cur.stationary || 0} onChange={(e) => setCell(date, "stationary", Number(e.target.value))} /></label>
                <label className="flex-1 text-[10px]" style={{ color: "var(--muted)" }}>🚐<input type="number" min={0} className="field-input mt-[2px]" style={{ padding: "4px 6px" }} value={cur.mobile || 0} onChange={(e) => setCell(date, "mobile", Number(e.target.value))} /></label>
              </div>
            </div>
          );
        })}
      </div>

      {/* Propozycja */}
      {proposal && proposal.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h2 className="font-serif text-sm tracking-[2px] uppercase" style={{ color: "var(--gold)" }}>Propozycja ({proposal.length} zmian)</h2>
            <button onClick={apply} className="btn-gold" style={{ clipPath: "none", padding: "9px 20px" }}>✓ Zastosuj do grafiku</button>
          </div>

          {/* Podsumowanie sprawiedliwości */}
          <div className="overflow-x-auto rounded mb-4" style={{ border: "1px solid var(--border)" }}>
            <table className="w-full text-sm" style={{ color: "var(--text)" }}>
              <thead><tr style={{ background: "rgba(201,168,76,.06)", color: "var(--gold)" }}>
                {["Pracownik", "Godziny / cel", "Stacjonarne", "Wyjazdy", "Dni"].map((h) => <th key={h} className="text-left font-serif text-[10px] tracking-[1px] uppercase px-4 py-2">{h}</th>)}
              </tr></thead>
              <tbody>
                {summary.map((u) => (
                  <tr key={u.userId} style={{ borderTop: "1px solid var(--border)" }}>
                    <td className="px-4 py-2">{u.name}</td>
                    <td className="px-4 py-2"><span style={{ color: u.targetHours && u.hours < u.targetHours * 0.8 ? "#fca5a5" : "var(--gold)" }}>{u.hours.toFixed(1)}</span> / {u.targetHours || "—"}</td>
                    <td className="px-4 py-2">{u.stationary}</td>
                    <td className="px-4 py-2">{u.mobile}</td>
                    <td className="px-4 py-2">{u.days}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {unfilled.length > 0 && (
            <p className="text-[13px] mb-3" style={{ color: "#fca5a5" }}>⚠ Nieobsadzone: {unfilled.length} (brak dostępnych pracowników — sprawdź dyspozycyjność/umiejętności).</p>
          )}

          {/* AI assistant */}
          <div className="p-4 rounded" style={{ background: "rgba(13,27,42,.5)", border: "1px solid var(--border)" }}>
            <div className="font-serif text-[11px] tracking-[2px] uppercase mb-2" style={{ color: "var(--gold)" }}>🤖 Dograj słownie (AI)</div>
            <div className="flex gap-2 flex-wrap">
              <input className="field-input flex-1" style={{ minWidth: 220 }} value={ai} onChange={(e) => setAi(e.target.value)} placeholder="np. Daj Markowi wolne w piątek, mniej wyjazdów dla Ani" />
              <button onClick={askAi} className="px-4 text-sm rounded" style={{ border: "1px solid var(--border)", color: "var(--gold)" }}>Zapytaj AI</button>
            </div>
            {aiMsg && <p className="text-[13px] mt-2" style={{ color: "var(--muted)" }}>{aiMsg}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
