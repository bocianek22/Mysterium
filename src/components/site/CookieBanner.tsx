"use client";
import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";

export default function CookieBanner({ locale }: { locale: Locale }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      if (!localStorage.getItem("mysterium_cookies")) setShow(true);
    } catch {}
  }, []);
  if (!show) return null;
  const pl = locale === "pl";
  function accept() {
    try { localStorage.setItem("mysterium_cookies", "1"); } catch {}
    setShow(false);
  }
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[3000] px-5 py-4 flex flex-col sm:flex-row items-center gap-3"
      style={{ background: "rgba(4,12,20,.98)", borderTop: "1px solid var(--border)", backdropFilter: "blur(8px)" }}
    >
      <p className="text-[13px] leading-[1.6] flex-1" style={{ color: "var(--muted)" }}>
        {pl
          ? "Używamy plików cookie, aby strona działała poprawnie i była wygodniejsza. "
          : "We use cookies to make the site work properly and more convenient. "}
        <a href={`/${locale}/polityka-prywatnosci`} className="underline" style={{ color: "var(--gold-l)" }}>
          {pl ? "Polityka prywatności" : "Privacy policy"}
        </a>
      </p>
      <button onClick={accept} className="btn-gold" style={{ clipPath: "none", padding: "10px 24px", whiteSpace: "nowrap" }}>
        {pl ? "Akceptuję" : "Accept"}
      </button>
    </div>
  );
}
