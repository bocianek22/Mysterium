"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ResetTokenPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Hasła nie są takie same"); return; }
    setLoading(true);
    const res = await fetch("/api/auth/reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (res.ok) { setDone(true); setTimeout(() => router.push("/admin/login"), 1800); }
    else setError(data.error || "Nie udało się ustawić hasła");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative z-[1]" style={{ background: "var(--navy-dd)" }}>
      <form onSubmit={onSubmit} className="corner-frame w-full max-w-[400px] p-8 md:p-10" style={{ background: "rgba(13,27,42,.7)", border: "1px solid var(--border)" }}>
        <div className="text-center mb-8">
          <div className="font-display text-gold-grad text-2xl mb-1">MYSTERIUM</div>
          <div className="font-serif text-[10px] tracking-[4px] uppercase" style={{ color: "var(--muted)" }}>Nowe hasło</div>
        </div>
        {done ? (
          <p className="text-[13px]" style={{ color: "#7eebb0" }}>✓ Hasło zmienione. Przekierowuję do logowania…</p>
        ) : (
          <>
            {error && <div className="px-4 py-3 text-[13px] mb-4 font-serif" style={{ background: "rgba(239,68,68,.07)", borderLeft: "3px solid #ef4444", color: "#fca5a5" }}>{error}</div>}
            <div className="mb-4">
              <label className="field-label">Nowe hasło (min. 8 znaków)</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="field-input" placeholder="••••••••" />
            </div>
            <div className="mb-6">
              <label className="field-label">Powtórz hasło</label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required className="field-input" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading} className="btn-gold w-full" style={{ clipPath: "none" }}>{loading ? "Zapisywanie..." : "Ustaw nowe hasło"}</button>
          </>
        )}
      </form>
    </div>
  );
}
