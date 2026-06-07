"use client";
import { useEffect, useState } from "react";
import type { Locale, Dict } from "@/lib/i18n";

const KEY = "mys_popup_seen";
const DAYS = 7;

export default function SitePopup({
  locale,
  t,
  mode,
  title,
  text,
  image,
  ctaLabel,
  ctaUrl,
  delaySec,
}: {
  locale: Locale;
  t: Dict;
  mode: "PROMO" | "NEWSLETTER";
  title: string;
  text: string;
  image?: string | null;
  ctaLabel?: string;
  ctaUrl?: string | null;
  delaySec: number;
}) {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [err, setErr] = useState("");

  useEffect(() => {
    try {
      const seen = localStorage.getItem(KEY);
      if (seen && Date.now() - Number(seen) < DAYS * 86400000) return;
    } catch { /* brak localStorage */ }
    const id = setTimeout(() => setShow(true), Math.max(0, delaySec) * 1000);
    return () => clearTimeout(id);
  }, [delaySec]);

  function dismiss() {
    try { localStorage.setItem(KEY, String(Date.now())); } catch { /* ignore */ }
    setShow(false);
  }

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    setState("sending"); setErr("");
    try {
      const res = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const j = await res.json();
      if (!res.ok) { setErr(j.error || "Błąd"); setState("error"); return; }
      setState("done");
      try { localStorage.setItem(KEY, String(Date.now())); } catch { /* ignore */ }
      setTimeout(() => setShow(false), 2500);
    } catch {
      setErr("Błąd połączenia"); setState("error");
    }
  }

  if (!show) return null;

  return (
    <div onClick={dismiss} className="fixed inset-0 z-[9500] flex items-center justify-center p-5" style={{ background: "rgba(0,0,0,.8)", backdropFilter: "blur(6px)", animation: "lbIn .25s ease" }}>
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-[440px] rounded overflow-hidden" style={{ background: "var(--navy-d)", border: "1px solid var(--border-h)", boxShadow: "0 30px 80px rgba(0,0,0,.6)" }}>
        <button onClick={dismiss} aria-label="Zamknij" className="absolute top-3 right-4 text-2xl z-[2]" style={{ color: "var(--gold)" }}>×</button>
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="w-full object-cover" style={{ maxHeight: 180 }} />
        )}
        <div className="p-6 md:p-8 text-center">
          {title && <h3 className="font-display text-gold-grad text-2xl mb-3">{title}</h3>}
          {text && <p className="text-sm leading-[1.8] mb-5" style={{ color: "var(--muted)" }}>{text}</p>}

          {mode === "PROMO" ? (
            ctaUrl ? (
              <a href={ctaUrl} onClick={dismiss} className="btn-gold inline-block no-underline" style={{ clipPath: "none", padding: "12px 28px" }}>
                {ctaLabel || t.popup.learnMore}
              </a>
            ) : null
          ) : state === "done" ? (
            <p className="text-sm" style={{ color: "#7eebb0" }}>{t.popup.success}</p>
          ) : (
            <form onSubmit={subscribe} className="flex flex-col gap-3">
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.popup.emailPlaceholder} className="field-input text-center" />
              <button type="submit" disabled={state === "sending"} className="btn-gold" style={{ clipPath: "none", padding: "12px 24px" }}>
                {state === "sending" ? t.popup.sending : (ctaLabel || t.popup.subscribe)}
              </button>
              {err && <span className="text-xs" style={{ color: "#fca5a5" }}>{err}</span>}
              <span className="text-[11px]" style={{ color: "var(--dim)" }}>{t.popup.consent}</span>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
