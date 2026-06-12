"use client";
import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";

export type Consent = { necessary: true; analytics: boolean; marketing: boolean; ts: number };
const KEY = "mysterium_consent";

// Odczyt zgody (np. przez loader Google Analytics).
export function getConsent(): Consent | null {
  try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
}

function save(c: Consent) {
  try {
    localStorage.setItem(KEY, JSON.stringify(c));
    document.cookie = `mysterium_consent=${c.analytics ? "a" : ""}${c.marketing ? "m" : ""}; path=/; max-age=31536000; samesite=lax`;
    window.dispatchEvent(new CustomEvent("consentchange", { detail: c }));
  } catch {}
}

export default function CookieBanner({ locale }: { locale: Locale }) {
  const pl = locale === "pl";
  const [show, setShow] = useState(false);
  const [manage, setManage] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    if (!getConsent()) setShow(true);
    const open = () => { setManage(true); setShow(true); };
    window.addEventListener("open-cookie-settings", open);
    return () => window.removeEventListener("open-cookie-settings", open);
  }, []);

  if (!show) return null;

  function commit(c: Consent) { save(c); setShow(false); setManage(false); }
  const acceptAll = () => commit({ necessary: true, analytics: true, marketing: true, ts: Date.now() });
  const onlyNecessary = () => commit({ necessary: true, analytics: false, marketing: false, ts: Date.now() });
  const saveChoice = () => commit({ necessary: true, analytics, marketing, ts: Date.now() });

  return (
    <div className="fixed inset-x-0 bottom-0 z-[3000] p-3 sm:p-4">
      <div className="mx-auto max-w-3xl rounded-xl p-5" style={{ background: "rgba(4,12,20,.98)", border: "1px solid var(--border)", backdropFilter: "blur(8px)", boxShadow: "0 -8px 40px rgba(0,0,0,.5)" }}>
        <p className="text-[13px] leading-[1.6]" style={{ color: "var(--muted)" }}>
          {pl ? "Używamy plików cookie, aby strona działała poprawnie oraz — za Twoją zgodą — do analityki i marketingu. " : "We use cookies to make the site work and, with your consent, for analytics and marketing. "}
          <a href={`/${locale}/polityka-prywatnosci`} className="underline" style={{ color: "var(--gold-l)" }}>
            {pl ? "Polityka prywatności" : "Privacy policy"}
          </a>
        </p>

        {manage && (
          <div className="mt-4 flex flex-col gap-2 text-[13px]">
            <label className="flex items-center gap-3 opacity-70">
              <input type="checkbox" checked readOnly />
              <span style={{ color: "var(--text)" }}>{pl ? "Niezbędne (zawsze aktywne)" : "Necessary (always on)"}</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} />
              <span style={{ color: "var(--text)" }}>{pl ? "Analityczne (statystyki odwiedzin)" : "Analytics"}</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} />
              <span style={{ color: "var(--text)" }}>{pl ? "Marketingowe (remarketing, reklamy)" : "Marketing"}</span>
            </label>
          </div>
        )}

        <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:justify-end">
          {!manage && (
            <button onClick={() => setManage(true)} className="text-[13px] underline px-3 py-2" style={{ color: "var(--muted)" }}>
              {pl ? "Ustawienia" : "Settings"}
            </button>
          )}
          <button onClick={onlyNecessary} className="text-[13px] px-4 py-2 rounded-lg" style={{ border: "1px solid var(--border)", color: "var(--text)" }}>
            {pl ? "Tylko niezbędne" : "Only necessary"}
          </button>
          {manage ? (
            <button onClick={saveChoice} className="btn-gold" style={{ clipPath: "none", padding: "9px 20px" }}>{pl ? "Zapisz wybór" : "Save"}</button>
          ) : (
            <button onClick={acceptAll} className="btn-gold" style={{ clipPath: "none", padding: "9px 20px" }}>{pl ? "Akceptuję wszystkie" : "Accept all"}</button>
          )}
        </div>
      </div>
    </div>
  );
}
