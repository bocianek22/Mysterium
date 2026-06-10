"use client";
import { useState } from "react";
import type { Locale } from "@/lib/i18n";

export default function NewsletterForm({ locale }: { locale: Locale }) {
  const pl = locale === "pl";
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "ok" | "err">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("busy"); setMsg("");
    try {
      const res = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const d = await res.json();
      if (res.ok) { setState("ok"); setEmail(""); }
      else { setState("err"); setMsg(d.error || (pl ? "Błąd zapisu" : "Error")); }
    } catch { setState("err"); setMsg(pl ? "Błąd połączenia" : "Connection error"); }
  }

  if (state === "ok") return <p className="text-sm" style={{ color: "#7eebb0" }}>✓ {pl ? "Dziękujemy! Jesteś zapisany/a." : "Thanks! You're subscribed."}</p>;

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={pl ? "Twój e-mail" : "Your e-mail"} className="field-input text-sm" style={{ flex: 1 }} />
        <button type="submit" disabled={state === "busy"} className="btn-gold" style={{ clipPath: "none", padding: "8px 16px", fontSize: 11 }}>{state === "busy" ? "…" : pl ? "Zapisz" : "Join"}</button>
      </div>
      {state === "err" && <span className="text-xs" style={{ color: "#fca5a5" }}>{msg}</span>}
      <span className="text-[10px]" style={{ color: "var(--dim)" }}>{pl ? "Zapisując się akceptujesz otrzymywanie e-maili marketingowych. Możesz zrezygnować w każdej chwili." : "By subscribing you agree to receive marketing e-mails. Unsubscribe anytime."}</span>
    </form>
  );
}
