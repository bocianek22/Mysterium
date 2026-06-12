"use client";
import { useState } from "react";

type Res = { id: string; roomName: string; start: string; end: string; people: number; status: string; source: string; refNo?: string | null; deposit: number; paid: boolean };

const STATUS: Record<string, { pl: string; en: string; color: string }> = {
  NEW: { pl: "Nowa", en: "New", color: "var(--gold-l)" },
  CONFIRMED: { pl: "Potwierdzona", en: "Confirmed", color: "#7eebb0" },
  DONE: { pl: "Zakończona", en: "Done", color: "var(--muted)" },
  CANCELLED: { pl: "Anulowana", en: "Cancelled", color: "#fca5a5" },
};

export default function CustomerReservations({ locale, email, token, upcoming, past, points = 0 }: { locale: "pl" | "en"; email: string; token: string; upcoming: Res[]; past: Res[]; points?: number }) {
  const pl = locale === "pl";
  const [list, setList] = useState(upcoming);
  const [busy, setBusy] = useState("");

  const fmt = (d: string) => new Date(d).toLocaleString(pl ? "pl-PL" : "en-GB", { weekday: "long", day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit" });
  const fmtEnd = (d: string) => new Date(d).toLocaleTimeString(pl ? "pl-PL" : "en-GB", { hour: "2-digit", minute: "2-digit" });

  async function cancel(id: string) {
    if (!confirm(pl ? "Na pewno anulować tę rezerwację?" : "Cancel this booking?")) return;
    setBusy(id);
    const res = await fetch("/api/account/cancel", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, reservationId: id }) });
    const d = await res.json().catch(() => ({}));
    setBusy("");
    if (!res.ok) { alert(d.error || (pl ? "Nie udało się anulować" : "Failed to cancel")); return; }
    setList((prev) => prev.filter((r) => r.id !== id));
  }

  const Badge = ({ s }: { s: string }) => {
    const st = STATUS[s] || STATUS.NEW;
    return <span className="text-[11px] font-serif tracking-[1px] uppercase px-2 py-1 rounded" style={{ color: st.color, border: `1px solid ${st.color}33` }}>{pl ? st.pl : st.en}</span>;
  };

  const Card = ({ r, canCancel }: { r: Res; canCancel: boolean }) => (
    <div className="corner-frame p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ background: "rgba(13,27,42,.5)", border: "1px solid var(--border)" }}>
      <div>
        <div className="flex items-center gap-2 mb-1"><h3 className="font-display text-gold-grad text-lg">{r.roomName}</h3><Badge s={r.status} /></div>
        <p className="text-[13px]" style={{ color: "var(--text)" }}>{fmt(r.start)}–{fmtEnd(r.end)} · 👥 {r.people}</p>
        <p className="text-[12px]" style={{ color: "var(--dim)" }}>{r.refNo}{r.deposit > 0 ? ` · ${pl ? "zadatek" : "deposit"} ${r.deposit} zł ${r.paid ? "✓" : ""}` : ""}</p>
      </div>
      {canCancel && r.source === "ONLINE" && (
        <button disabled={busy === r.id} onClick={() => cancel(r.id)} className="text-[13px] px-4 py-2 rounded self-start" style={{ border: "1px solid rgba(239,68,68,.3)", color: "#fca5a5" }}>
          {busy === r.id ? "…" : (pl ? "Anuluj" : "Cancel")}
        </button>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-8">
      <p className="text-[13px]" style={{ color: "var(--muted)" }}>{pl ? "Zalogowano jako" : "Signed in as"} <b style={{ color: "var(--gold-l)" }}>{email}</b></p>

      {points > 0 && (
        <div className="corner-frame p-5 flex items-center gap-4" style={{ background: "rgba(201,168,76,.07)", border: "1px solid rgba(201,168,76,.3)" }}>
          <div className="text-3xl">🏆</div>
          <div>
            <div className="font-display text-gold-grad text-xl">{points} {pl ? "pkt" : "pts"}</div>
            <p className="text-[12px]" style={{ color: "var(--muted)" }}>{pl ? "Twoje punkty lojalnościowe — wymienisz je na rabat przy wizycie w Mysterium." : "Your loyalty points — redeem them for a discount on your visit."}</p>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-serif tracking-[2px] uppercase" style={{ color: "var(--gold)" }}>{pl ? "Nadchodzące" : "Upcoming"}</h2>
          <a href={`/${locale}/rezerwacja`} className="btn-gold text-[12px]" style={{ clipPath: "none", padding: "6px 16px" }}>{pl ? "Zarezerwuj ponownie" : "Book again"}</a>
        </div>
        {list.length === 0 ? (
          <p className="text-[13px]" style={{ color: "var(--muted)" }}>{pl ? "Brak nadchodzących rezerwacji." : "No upcoming bookings."}</p>
        ) : <div className="flex flex-col gap-3">{list.map((r) => <Card key={r.id} r={r} canCancel />)}</div>}
      </div>

      {past.length > 0 && (
        <div>
          <h2 className="text-sm font-serif tracking-[2px] uppercase mb-3" style={{ color: "var(--gold)" }}>{pl ? "Historia" : "History"}</h2>
          <div className="flex flex-col gap-3 opacity-80">{past.map((r) => <Card key={r.id} r={r} canCancel={false} />)}</div>
        </div>
      )}
    </div>
  );
}
