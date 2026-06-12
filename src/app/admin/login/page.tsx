"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        setError(data.error || "Błąd logowania");
      }
    } catch {
      setError("Błąd połączenia");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative z-[1]" style={{ background: "var(--navy-dd)" }}>
      <form onSubmit={onSubmit} className="corner-frame w-full max-w-[400px] p-8 md:p-10" style={{ background: "rgba(13,27,42,.7)", border: "1px solid var(--border)" }}>
        <div className="text-center mb-8">
          <div className="font-display text-gold-grad text-2xl mb-1">MYSTERIUM</div>
          <div className="font-serif text-[10px] tracking-[4px] uppercase" style={{ color: "var(--muted)" }}>
            Panel administratora
          </div>
        </div>

        {error && (
          <div className="px-4 py-3 text-[13px] mb-4 font-serif" style={{ background: "rgba(239,68,68,.07)", borderLeft: "3px solid #ef4444", color: "#fca5a5" }}>
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="field-label">E-mail</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="field-input" placeholder="admin@mysterium.pl" />
        </div>
        <div className="mb-6">
          <label className="field-label">Hasło</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="field-input" placeholder="••••••••" />
        </div>
        <button type="submit" disabled={loading} className="btn-gold w-full" style={{ clipPath: "none" }}>
          {loading ? "Logowanie..." : "Zaloguj się"}
        </button>
        <div className="text-center mt-4">
          <a href="/admin/reset" className="text-[12px] underline" style={{ color: "var(--muted)" }}>Nie pamiętasz hasła?</a>
        </div>
      </form>
    </div>
  );
}
