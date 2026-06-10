"use client";
import { useState } from "react";

export default function ChangePasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (next !== confirm) { setMsg({ ok: false, text: "Nowe hasła nie są takie same" }); return; }
    setLoading(true);
    const res = await fetch("/api/admin/account/password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ current, next }) });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (res.ok) { setMsg({ ok: true, text: "✓ Hasło zmienione" }); setCurrent(""); setNext(""); setConfirm(""); }
    else setMsg({ ok: false, text: data.error || "Nie udało się zmienić hasła" });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {msg && <div className="px-3 py-2 text-[13px] rounded" style={{ background: msg.ok ? "rgba(34,197,94,.08)" : "rgba(239,68,68,.07)", color: msg.ok ? "#7eebb0" : "#fca5a5" }}>{msg.text}</div>}
      <div><label className="field-label">Obecne hasło</label><input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required className="field-input" /></div>
      <div><label className="field-label">Nowe hasło (min. 8 znaków)</label><input type="password" value={next} onChange={(e) => setNext(e.target.value)} required minLength={8} className="field-input" /></div>
      <div><label className="field-label">Powtórz nowe hasło</label><input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required className="field-input" /></div>
      <button type="submit" disabled={loading} className="btn-gold" style={{ clipPath: "none" }}>{loading ? "Zapisywanie..." : "Zmień hasło"}</button>
    </form>
  );
}
