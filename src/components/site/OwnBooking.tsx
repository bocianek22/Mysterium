"use client";
import { useEffect, useState } from "react";

type Tier = { label: string; price: number };
type Room = { id: string; name: string; pricing?: Tier[] };
type Slot = { dateKey: string; dateLabel: string; time: string };
type CodeInfo = { valid: boolean; finalPrice?: number; basePrice?: number; descriptionPl?: string; descriptionEn?: string; error?: string };

export default function OwnBooking({
  locale, rooms, depositZl, info,
}: { locale: "pl" | "en"; rooms: Room[]; depositZl: number; info?: string | null }) {
  const pl = locale === "pl";
  const [roomId, setRoomId] = useState(rooms[0]?.id || "");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [sel, setSel] = useState<Slot | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", people: 2, notes: "", deposit: false });
  const [code, setCode] = useState("");
  const [codeInfo, setCodeInfo] = useState<CodeInfo | null>(null);
  const [checkingCode, setCheckingCode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ refNo: string } | null>(null);

  const room = rooms.find((r) => r.id === roomId);
  const pricing = room?.pricing || [];

  async function applyCode() {
    if (!code.trim()) { setCodeInfo(null); return; }
    setCheckingCode(true);
    const res = await fetch("/api/booking/validate-code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, roomId, people: form.people }) });
    const d = await res.json().catch(() => ({}));
    setCheckingCode(false);
    setCodeInfo(d);
  }

  useEffect(() => {
    if (!roomId) return;
    setLoadingSlots(true); setSel(null);
    fetch(`/api/booking/slots?roomId=${roomId}`)
      .then((r) => r.ok ? r.json() : { slots: [] })
      .then((d) => setSlots(d.slots || []))
      .finally(() => setLoadingSlots(false));
  }, [roomId]);

  // Grupowanie slotów po dniach
  const byDay = slots.reduce<Record<string, Slot[]>>((acc, s) => {
    (acc[s.dateLabel] ||= []).push(s); return acc;
  }, {});

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!sel) { setError(pl ? "Wybierz termin" : "Pick a slot"); return; }
    setSubmitting(true);
    const res = await fetch("/api/booking", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId, dateKey: sel.dateKey, time: sel.time, ...form, discountCode: codeInfo?.valid ? code : undefined }),
    });
    const data = await res.json().catch(() => ({}));
    setSubmitting(false);
    if (!res.ok) { setError(data.error || (pl ? "Nie udało się zarezerwować" : "Booking failed")); return; }
    if (data.paymentUrl) { window.location.href = data.paymentUrl; return; }
    setDone({ refNo: data.refNo });
  }

  if (done) {
    return (
      <div className="corner-frame p-8 text-center max-w-lg mx-auto" style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--gold)" }}>
        <div className="text-4xl mb-3">✅</div>
        <h3 className="font-display text-gold-grad text-2xl mb-2">{pl ? "Rezerwacja przyjęta!" : "Booking confirmed!"}</h3>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          {pl ? "Numer rezerwacji:" : "Reference:"} <b style={{ color: "var(--gold-l)" }}>{done.refNo}</b>
        </p>
        <p className="text-[13px] mt-3" style={{ color: "var(--muted)" }}>{pl ? "Potwierdzenie z linkiem do kalendarza wysłaliśmy na Twój e-mail." : "We've emailed a confirmation with a calendar link."}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="max-w-3xl mx-auto grid gap-6">
      {info && <p className="text-[13px] leading-[1.7] text-center" style={{ color: "var(--muted)" }}>{info}</p>}

      {rooms.length > 1 && (
        <div>
          <label className="field-label">{pl ? "Pokój" : "Room"}</label>
          <select className="field-input" value={roomId} onChange={(e) => setRoomId(e.target.value)}>
            {rooms.map((r) => <option key={r.id} value={r.id} style={{ background: "var(--navy-d)" }}>{r.name}</option>)}
          </select>
        </div>
      )}

      <div>
        <label className="field-label">{pl ? "Wybierz termin" : "Pick a time"}</label>
        {loadingSlots ? (
          <p className="text-[13px]" style={{ color: "var(--muted)" }}>{pl ? "Ładowanie terminów…" : "Loading…"}</p>
        ) : slots.length === 0 ? (
          <p className="text-[13px]" style={{ color: "var(--muted)" }}>{pl ? "Brak wolnych terminów w najbliższym czasie." : "No free slots soon."}</p>
        ) : (
          <div className="flex flex-col gap-3 max-h-[320px] overflow-y-auto pr-1">
            {Object.entries(byDay).map(([day, list]) => (
              <div key={day}>
                <div className="font-serif text-[11px] tracking-[2px] uppercase mb-2" style={{ color: "var(--gold)" }}>{day}</div>
                <div className="flex flex-wrap gap-2">
                  {list.map((s) => {
                    const active = sel?.dateKey === s.dateKey && sel?.time === s.time;
                    return (
                      <button type="button" key={s.dateKey + s.time} onClick={() => setSel(s)}
                        className="px-3 py-2 rounded text-[13px]"
                        style={active ? { background: "var(--gold)", color: "#0a0a0a", fontWeight: 600 } : { border: "1px solid var(--border)", color: "var(--text)" }}>
                        {s.time}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div><label className="field-label">{pl ? "Imię i nazwisko" : "Full name"}</label><input className="field-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div><label className="field-label">{pl ? "Liczba osób" : "People"}</label><input type="number" min={1} max={50} className="field-input" required value={form.people} onChange={(e) => setForm({ ...form, people: Number(e.target.value) })} /></div>
        <div><label className="field-label">E-mail</label><input type="email" className="field-input" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        <div><label className="field-label">{pl ? "Telefon" : "Phone"}</label><input className="field-input" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
      </div>
      <div><label className="field-label">{pl ? "Uwagi (opcjonalnie)" : "Notes (optional)"}</label><textarea className="field-input" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>

      {pricing.length > 0 && (
        <div className="rounded p-4" style={{ border: "1px solid var(--border)", background: "rgba(13,27,42,.4)" }}>
          <div className="font-serif text-[11px] tracking-[2px] uppercase mb-2" style={{ color: "var(--gold)" }}>{pl ? "Cennik" : "Pricing"}</div>
          <ul className="text-[13px] flex flex-col gap-1" style={{ color: "var(--text)" }}>
            {pricing.map((t, i) => <li key={i} className="flex justify-between"><span style={{ color: "var(--muted)" }}>{t.label}</span><span>{t.price} zł</span></li>)}
          </ul>
          <p className="text-[11px] mt-2" style={{ color: "var(--dim)" }}>{pl ? "Płatność za grę na miejscu." : "Pay for the game on site."}</p>
        </div>
      )}

      <div>
        <label className="field-label">{pl ? "Kod rabatowy (opcjonalnie)" : "Discount code (optional)"}</label>
        <div className="flex gap-2">
          <input className="field-input" value={code} onChange={(e) => { setCode(e.target.value); setCodeInfo(null); }} placeholder={pl ? "np. WITAJ10" : "e.g. WELCOME10"} />
          <button type="button" onClick={applyCode} disabled={checkingCode || !code.trim()} className="px-4 rounded text-[13px] whitespace-nowrap" style={{ border: "1px solid var(--border)", color: "var(--gold)" }}>{checkingCode ? "…" : (pl ? "Zastosuj" : "Apply")}</button>
        </div>
        {codeInfo && (codeInfo.valid ? (
          <p className="text-[13px] mt-2" style={{ color: "#7eebb0" }}>
            {pl ? "Kod zaakceptowany." : "Code applied."}
            {codeInfo.finalPrice ? ` ${pl ? "Cena po rabacie:" : "Price after discount:"} ${codeInfo.finalPrice} zł` : ""}
          </p>
        ) : (
          <p className="text-[13px] mt-2" style={{ color: "#fca5a5" }}>{codeInfo.error || (pl ? "Kod nieprawidłowy" : "Invalid code")}</p>
        ))}
      </div>

      {depositZl > 0 && (
        <label className="flex items-center gap-3 text-[13px] cursor-pointer">
          <input type="checkbox" checked={form.deposit} onChange={(e) => setForm({ ...form, deposit: e.target.checked })} />
          <span style={{ color: "var(--text)" }}>{pl ? `Chcę zapłacić zadatek online (${depositZl} zł) — reszta na miejscu` : `Pay a deposit online (${depositZl} zł) — rest on site`}</span>
        </label>
      )}

      {error && <p className="text-[13px]" style={{ color: "#fca5a5" }}>{error}</p>}

      <button type="submit" disabled={submitting || !sel} className="btn-gold" style={{ clipPath: "none", padding: "12px 28px" }}>
        {submitting ? (pl ? "Rezerwuję…" : "Booking…") : form.deposit && depositZl > 0 ? (pl ? "Rezerwuj i zapłać zadatek" : "Book & pay deposit") : (pl ? "Rezerwuj termin" : "Book now")}
      </button>
    </form>
  );
}
