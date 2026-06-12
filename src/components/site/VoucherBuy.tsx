"use client";
import { useState } from "react";
import type { Locale } from "@/lib/i18n";

const AMOUNTS = [150, 200, 250, 300];

export default function VoucherBuy({ locale }: { locale: Locale }) {
  const pl = locale === "pl";
  const [amount, setAmount] = useState(200);
  const [custom, setCustom] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function buy(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr("");
    const val = custom ? Number(custom) : amount;
    try {
      const res = await fetch("/api/pay/voucher", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount: val, buyerName: name, buyerEmail: email }) });
      const j = await res.json();
      if (res.ok && j.url) window.location.href = j.url;
      else { setErr(j.error || (pl ? "Nie udało się rozpocząć płatności" : "Could not start payment")); setBusy(false); }
    } catch { setErr(pl ? "Błąd połączenia" : "Connection error"); setBusy(false); }
  }

  return (
    <form onSubmit={buy} className="p-5 rounded flex flex-col gap-3" style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--border)" }}>
      <div className="font-display text-gold-grad text-xl">{pl ? "Kup bon online" : "Buy a voucher online"}</div>
      <div className="flex gap-2 flex-wrap">
        {AMOUNTS.map((a) => (
          <button type="button" key={a} onClick={() => { setAmount(a); setCustom(""); }} className="px-4 py-2 rounded text-sm" style={!custom && amount === a ? { background: "var(--gold)", color: "#1a1206" } : { border: "1px solid var(--border)", color: "var(--muted)" }}>{a} zł</button>
        ))}
        <input type="number" min={20} placeholder={pl ? "inna kwota" : "other"} value={custom} onChange={(e) => setCustom(e.target.value)} className="field-input" style={{ width: 110 }} />
      </div>
      <input className="field-input" placeholder={pl ? "Imię (opcjonalnie)" : "Name (optional)"} value={name} onChange={(e) => setName(e.target.value)} />
      <input type="email" required className="field-input" placeholder={pl ? "Twój e-mail (wyślemy kod)" : "Your e-mail (we'll send the code)"} value={email} onChange={(e) => setEmail(e.target.value)} />
      <button type="submit" disabled={busy} className="btn-gold" style={{ clipPath: "none", padding: "12px 24px" }}>{busy ? (pl ? "Przekierowanie…" : "Redirecting…") : `${pl ? "Zapłać" : "Pay"} ${custom || amount} zł`}</button>
      {err && <span className="text-sm" style={{ color: "#fca5a5" }}>{err}</span>}
    </form>
  );
}
