"use client";
import { useState } from "react";

export default function SurveyForm({ token }: { token: string }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [nps, setNps] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ googleUrl: string | null } | null>(null);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) { setErr("Wybierz ocenę (1–5 gwiazdek)"); return; }
    setBusy(true); setErr("");
    try {
      const res = await fetch(`/api/survey/${token}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rating, nps, comment }) });
      const d = await res.json();
      if (res.ok) setDone({ googleUrl: d.googleUrl || null });
      else setErr(d.error || "Nie udało się wysłać");
    } catch { setErr("Błąd połączenia"); } finally { setBusy(false); }
  }

  if (done) {
    return (
      <div className="p-6 rounded text-center" style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--border)" }}>
        <div className="text-5xl mb-3">🙏</div>
        <h2 className="font-display text-gold-grad text-2xl mb-2">Dziękujemy!</h2>
        <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>Twoja opinia bardzo nam pomaga.</p>
        {done.googleUrl && (
          <a href={done.googleUrl} target="_blank" rel="noopener noreferrer" className="btn-gold inline-block" style={{ clipPath: "none", padding: "12px 26px" }}>⭐ Zostaw opinię w Google</a>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="p-6 rounded flex flex-col gap-5" style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--border)" }}>
      <div>
        <label className="field-label">Jak oceniasz grę?</label>
        <div className="flex gap-1.5 mt-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button type="button" key={n} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} onClick={() => setRating(n)} className="text-4xl leading-none transition-transform hover:scale-110" style={{ color: (hover || rating) >= n ? "var(--gold)" : "var(--dim)" }} aria-label={`${n}`}>★</button>
          ))}
        </div>
      </div>
      <div>
        <label className="field-label">Czy poleciłbyś nas znajomym? (0–10)</label>
        <div className="flex flex-wrap gap-1 mt-1">
          {Array.from({ length: 11 }).map((_, n) => (
            <button type="button" key={n} onClick={() => setNps(n)} className="w-8 h-8 rounded text-xs" style={nps === n ? { background: "var(--gold)", color: "#1a1206" } : { border: "1px solid var(--border)", color: "var(--muted)" }}>{n}</button>
          ))}
        </div>
      </div>
      <div>
        <label className="field-label">Komentarz (opcjonalnie)</label>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="field-input h-24 resize-none" placeholder="Co Ci się podobało? Co możemy poprawić?" />
      </div>
      {err && <div className="text-sm" style={{ color: "#fca5a5" }}>{err}</div>}
      <button type="submit" disabled={busy} className="btn-gold" style={{ clipPath: "none", padding: "12px 26px" }}>{busy ? "Wysyłanie…" : "Wyślij ankietę"}</button>
    </form>
  );
}
