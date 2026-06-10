"use client";
import { useState } from "react";

export default function RequestLinkForm({ locale, expired }: { locale: "pl" | "en"; expired?: boolean }) {
  const pl = locale === "pl";
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/account/request-link", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, locale }) }).catch(() => {});
    setSent(true); setLoading(false);
  }

  return (
    <div className="corner-frame p-8 max-w-md mx-auto" style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--border)" }}>
      {expired && !sent && (
        <p className="text-[13px] mb-4 px-3 py-2 rounded" style={{ background: "rgba(239,68,68,.07)", color: "#fca5a5" }}>
          {pl ? "Link wygasł lub jest nieprawidłowy. Wyślij nowy poniżej." : "The link expired or is invalid. Request a new one below."}
        </p>
      )}
      {sent ? (
        <p className="text-[13px] leading-[1.7]" style={{ color: "var(--muted)" }}>
          {pl ? "Jeśli mamy rezerwacje na ten e-mail, wysłaliśmy link dostępowy. Sprawdź skrzynkę." : "If we have bookings for this email, we've sent an access link. Check your inbox."}
        </p>
      ) : (
        <form onSubmit={submit}>
          <p className="text-[13px] mb-4 leading-[1.7]" style={{ color: "var(--muted)" }}>
            {pl ? "Podaj e-mail użyty przy rezerwacji — wyślemy link do Twoich rezerwacji." : "Enter the email used for booking — we'll send a link to your bookings."}
          </p>
          <label className="field-label">E-mail</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="field-input mb-4" placeholder="jan@example.com" />
          <button type="submit" disabled={loading} className="btn-gold w-full" style={{ clipPath: "none" }}>
            {loading ? (pl ? "Wysyłanie…" : "Sending…") : (pl ? "Wyślij link" : "Send link")}
          </button>
        </form>
      )}
    </div>
  );
}
