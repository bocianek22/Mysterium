"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

// Rotujący kod QR do rejestracji wejścia/wyjścia (RCP).
// Co kilka sekund pobiera świeży token i przerysowuje kod.
export default function ClockQR() {
  const [dataUrl, setDataUrl] = useState("");
  const [ttl, setTtl] = useState(0);
  const [err, setErr] = useState(false);
  const [busy, setBusy] = useState(false);
  const urlRef = useRef("");

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/clock/qr", { cache: "no-store" });
      if (!res.ok) { setErr(true); return; }
      const j = await res.json();
      setErr(false);
      setTtl(j.ttl);
      if (j.url !== urlRef.current) {
        urlRef.current = j.url;
        const png = await QRCode.toDataURL(j.url, {
          width: 300,
          margin: 1,
          color: { dark: "#0d1b2a", light: "#f7f4ea" },
          errorCorrectionLevel: "M",
        });
        setDataUrl(png);
      }
    } catch {
      setErr(true);
    }
  }, []);

  // Pobieraj świeży token co 5 s (token żyje ~30 s, więc zawsze jest aktualny).
  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 5000);
    return () => clearInterval(id);
  }, [refresh]);

  // Lokalne odliczanie sekund do kolejnej rotacji.
  useEffect(() => {
    const id = setInterval(() => setTtl((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);

  async function regenerate() {
    if (!confirm("Wygenerować nowy kod? Wcześniej udostępnione/sfotografowane kody przestaną działać.")) return;
    setBusy(true);
    try {
      await fetch("/api/admin/clock/qr", { method: "POST" });
      urlRef.current = "";
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="p-5 rounded flex flex-col items-center text-center" style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--border)" }}>
      <h2 className="font-serif text-sm tracking-[2px] uppercase mb-1" style={{ color: "var(--gold)" }}>Kod QR — wejście / wyjście</h2>
      <p className="text-[11px] mb-4" style={{ color: "var(--muted)" }}>
        Wywieś przy wejściu. Pracownik skanuje telefonem i rejestruje wejście lub wyjście. Kod odświeża się co kilka sekund.
      </p>

      <div className="rounded overflow-hidden" style={{ width: 300, height: 300, background: "#f7f4ea", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {err ? (
          <span className="text-sm" style={{ color: "#b91c1c" }}>Błąd generowania kodu</span>
        ) : dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={dataUrl} alt="Kod QR rejestracji czasu pracy" width={300} height={300} />
        ) : (
          <span className="text-sm" style={{ color: "#0d1b2a" }}>Generowanie…</span>
        )}
      </div>

      <div className="mt-3 text-[11px]" style={{ color: "var(--muted)" }}>
        Odświeżenie za <b style={{ color: "var(--gold)" }}>{ttl}s</b>
      </div>
      <button onClick={regenerate} disabled={busy} className="mt-3 text-xs px-4 py-2 rounded" style={{ border: "1px solid var(--border)", color: "var(--gold)", opacity: busy ? 0.6 : 1 }}>
        ↻ Wygeneruj nowy kod
      </button>
    </div>
  );
}
