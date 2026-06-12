"use client";
import { useEffect, useState } from "react";
import Script from "next/script";
import { getConsent } from "./CookieBanner";

// Google Analytics 4 ładowane WYŁĄCZNIE po zgodzie analitycznej (RODO).
export default function Analytics({ gaId }: { gaId: string }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const check = () => setEnabled(!!getConsent()?.analytics);
    check();
    const onChange = (e: Event) => setEnabled(!!(e as CustomEvent).detail?.analytics);
    window.addEventListener("consentchange", onChange);
    return () => window.removeEventListener("consentchange", onChange);
  }, []);

  if (!enabled) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${gaId}', { anonymize_ip: true });
      `}</Script>
    </>
  );
}
