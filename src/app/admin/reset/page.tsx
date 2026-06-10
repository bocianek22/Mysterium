"use client";
import { useState } from "react";

export default function ResetRequestPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/auth/forgot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) }).catch(() => {});
    setSent(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative z-[1]" style={{ background: "var(--navy-dd)" }}>
      <form onSubmit={onSubmit} className="corner-frame w-full max-w-[400px] p-8 md:p-10" style={{ background: "rgba(13,27,42,.7)", border: "1px solid var(--border)" }}>
        <div className="text-center mb-8">
          <div className="font-display text-gold-grad text-2xl mb-1">MYSTERIUM</div>
          <div className="font-serif text-[10px] tracking-[4px] uppercase" style={{ color: "var(--muted)" }}>Reset hasła</div>
        </div>
        {sent ? (
          <p className="text-[13px] leading-[1.7]" style={{ color: "var(--muted)" }}>
            Jeśli konto istnieje, wysłaliśmy na nie link do zresetowania hasła. Sprawdź skrzynkę (link ważny 1 godzinę).
          </p>
        ) : (
          <>
            <div className="mb-6">
              <label className="field-label">E-mail konta</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="field-input" placeholder="admin@mysterium.pl" />
            </div>
            <button type="submit" disabled={loading} className="btn-gold w-full" style={{ clipPath: "none" }}>
              {loading ? "Wysyłanie..." : "Wyślij link resetujący"}
            </button>
          </>
        )}
        <div className="text-center mt-4">
          <a href="/admin/login" className="text-[12px] underline" style={{ color: "var(--muted)" }}>← Powrót do logowania</a>
        </div>
      </form>
    </div>
  );
}
