"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

// Kod QR do rejestracji wejścia/wyjścia (RCP).
// Tryb STATIC: kod stały, zmienia się tylko po „Wygeneruj nowy kod".
// Tryb DYNAMIC: kod odświeża się automatycznie co kilka sekund.
export default function ClockQR({ kiosk = false }: { kiosk?: boolean }) {
  const [dataUrl, setDataUrl] = useState("");
  const [mode, setMode] = useState<"STATIC" | "DYNAMIC">("STATIC");
  const [ttl, setTtl] = useState<number | null>(null);
  const [err, setErr] = useState(false);
  const [busy, setBusy] = useState(false);
  const [isFull, setIsFull] = useState(false);
  const urlRef = useRef("");
  const wrapRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/clock/qr", { cache: "no-store" });
      if (!res.ok) { setErr(true); return; }
      const j = await res.json();
      setErr(false);
      setMode(j.mode);
      setTtl(j.ttl);
      if (j.url !== urlRef.current) {
        urlRef.current = j.url;
        const png = await QRCode.toDataURL(j.url, {
          width: 600,
          margin: 1,
          color: { dark: "#0d1b2a", light: "#ffffff" },
          errorCorrectionLevel: "M",
        });
        setDataUrl(png);
      }
    } catch {
      setErr(true);
    }
  }, []);

  // Tryb dynamiczny: częsty refresh (token żyje ~30 s). Statyczny: rzadki,
  // tylko po to, by wychwycić ręczną regenerację z innego urządzenia.
  useEffect(() => {
    refresh();
    const everyMs = mode === "DYNAMIC" ? 5000 : 30000;
    const id = setInterval(refresh, everyMs);
    return () => clearInterval(id);
  }, [refresh, mode]);

  // Lokalne odliczanie do rotacji (tylko tryb dynamiczny).
  useEffect(() => {
    if (mode !== "DYNAMIC") return;
    const id = setInterval(() => setTtl((t) => (t && t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [mode]);

  // Śledzenie trybu pełnoekranowego.
  useEffect(() => {
    const onChange = () => setIsFull(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (wrapRef.current) await wrapRef.current.requestFullscreen();
    } catch { /* przeglądarka może odmówić — ignorujemy */ }
  }

  async function regenerate() {
    if (!confirm("Wygenerować nowy kod? Wcześniej udostępnione/wydrukowane kody przestaną działać.")) return;
    setBusy(true);
    try {
      await fetch("/api/admin/clock/qr", { method: "POST" });
      urlRef.current = "";
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  const qrSize = isFull ? "min(82vh, 82vw)" : kiosk ? 360 : 300;

  return (
    <div
      ref={wrapRef}
      className="p-5 rounded flex flex-col items-center text-center"
      style={{ background: isFull ? "var(--navy-dd)" : "rgba(13,27,42,.6)", border: isFull ? "none" : "1px solid var(--border)", justifyContent: isFull ? "center" : undefined, minHeight: isFull ? "100vh" : undefined, width: isFull ? "100vw" : undefined }}
    >
      <h2 className="font-serif tracking-[2px] uppercase mb-1" style={{ color: "var(--gold)", fontSize: isFull ? 18 : 14 }}>Kod QR — wejście / wyjście</h2>
      <p className="text-[11px] mb-4 max-w-sm" style={{ color: "var(--muted)" }}>
        Zeskanuj telefonem, aby zarejestrować wejście lub wyjście.
      </p>

      <div className="rounded overflow-hidden" style={{ width: qrSize, height: qrSize, background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", padding: 8 }}>
        {err ? (
          <span className="text-sm" style={{ color: "#b91c1c" }}>Błąd generowania kodu</span>
        ) : dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={dataUrl} alt="Kod QR rejestracji czasu pracy" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        ) : (
          <span className="text-sm" style={{ color: "#0d1b2a" }}>Generowanie…</span>
        )}
      </div>

      <div className="mt-3 text-[11px]" style={{ color: "var(--muted)" }}>
        {mode === "DYNAMIC"
          ? <>🔄 Kod dynamiczny · odświeżenie za <b style={{ color: "var(--gold)" }}>{ttl ?? "—"}s</b></>
          : <>📌 Kod stały · zmienia się tylko ręcznie</>}
      </div>

      <div className="mt-3 flex items-center gap-2 flex-wrap justify-center">
        <button onClick={toggleFullscreen} className="text-xs px-4 py-2 rounded" style={{ border: "1px solid var(--border)", color: "var(--gold)" }}>
          {isFull ? "✕ Zamknij pełny ekran" : "⛶ Pełny ekran"}
        </button>
        <button onClick={regenerate} disabled={busy} className="text-xs px-4 py-2 rounded" style={{ border: "1px solid var(--border)", color: "var(--gold)", opacity: busy ? 0.6 : 1 }}>
          ↻ Wygeneruj nowy kod
        </button>
      </div>
    </div>
  );
}
