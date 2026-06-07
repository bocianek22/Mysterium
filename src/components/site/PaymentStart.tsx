"use client";
import { useState } from "react";

export default function PaymentStart({ id, label }: { id: string; label: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  async function go() {
    setBusy(true); setErr("");
    try {
      const res = await fetch(`/api/pay/start/${id}`, { method: "POST" });
      const j = await res.json();
      if (res.ok && j.url) window.location.href = j.url;
      else { setErr(j.error || "Nie udało się rozpocząć płatności"); setBusy(false); }
    } catch { setErr("Błąd połączenia"); setBusy(false); }
  }
  return (
    <div className="text-center">
      <button onClick={go} disabled={busy} className="btn-gold" style={{ clipPath: "none", padding: "14px 32px", fontSize: 17 }}>{busy ? "Przekierowanie…" : label}</button>
      {err && <div className="mt-3 text-sm" style={{ color: "#fca5a5" }}>{err}</div>}
    </div>
  );
}
