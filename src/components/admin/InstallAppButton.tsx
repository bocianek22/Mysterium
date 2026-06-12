"use client";
import { useEffect, useState } from "react";

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

export default function InstallAppButton() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    // Rejestracja service workera (wymagane do instalacji)
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});

    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) { setInstalled(true); return; }

    const onPrompt = (e: Event) => { e.preventDefault(); setDeferred(e as BIPEvent); };
    const onInstalled = () => { setInstalled(true); setDeferred(null); };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    // iOS Safari nie wspiera beforeinstallprompt — pokaż wskazówkę
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (isIOS) setIosHint(true);

    return () => { window.removeEventListener("beforeinstallprompt", onPrompt); window.removeEventListener("appinstalled", onInstalled); };
  }, []);

  if (installed) return null;

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice.catch(() => {});
    setDeferred(null);
  }

  if (deferred) {
    return (
      <button onClick={install} className="w-full text-sm rounded-lg px-3 py-2 font-medium transition"
        style={{ background: "var(--gold,#c9a84c)", color: "#1a1206" }}>
        ⬇ Zainstaluj aplikację
      </button>
    );
  }

  if (iosHint) {
    return (
      <p className="text-[11px] leading-snug px-1" style={{ color: "#9a8b75" }}>
        📱 Aby zainstalować: <b>Udostępnij</b> → <b>Dodaj do ekranu początkowego</b>.
      </p>
    );
  }

  return null;
}
