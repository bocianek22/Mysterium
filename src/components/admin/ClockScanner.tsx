"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Result = { action: "IN" | "OUT"; clockIn?: string; clockOut?: string; hours?: number; breakMinutes?: number };
const EL_ID = "qr-reader";

// Skaner kodu QR w panelu pracownika — kamera odczytuje kod, a system
// rejestruje wejście/wyjście na koncie zalogowanego pracownika.
export default function ClockScanner({ open }: { open: boolean }) {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const scannerRef = useRef<any>(null);

  async function start() {
    setErr(""); setResult(null);
    setScanning(true);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode(EL_ID);
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 230, height: 230 } },
        (text: string) => { onScan(text); },
        () => {}
      );
    } catch {
      setErr("Nie udało się uruchomić kamery. Zezwól na dostęp do kamery w przeglądarce.");
      setScanning(false);
    }
  }

  async function stop() {
    try { await scannerRef.current?.stop(); scannerRef.current?.clear(); } catch { /* już zatrzymany */ }
    scannerRef.current = null;
    setScanning(false);
  }

  async function onScan(text: string) {
    if (busy) return;
    setBusy(true);
    let token = text;
    try { const u = new URL(text); token = u.searchParams.get("t") || text; } catch { /* nie URL — użyj surowego */ }
    await stop();
    try {
      const res = await fetch("/api/admin/clock", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ t: token }) });
      const j = await res.json();
      if (!res.ok) setErr(j.message || "Nie udało się zarejestrować.");
      else { setResult(j); router.refresh(); }
    } catch {
      setErr("Błąd połączenia.");
    } finally {
      setBusy(false);
    }
  }

  if (result) {
    const tm = (s?: string) => (s ? new Date(s).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" }) : "");
    return (
      <div className="p-5 rounded text-center" style={{ background: "rgba(126,235,176,.08)", border: "1px solid rgba(126,235,176,.3)" }}>
        <div className="text-3xl mb-2">{result.action === "IN" ? "✅" : "👋"}</div>
        <div className="font-display text-xl" style={{ color: "#7eebb0" }}>{result.action === "IN" ? "Wejście zarejestrowane" : "Wyjście zarejestrowane"}</div>
        {result.action === "IN" ? (
          <div className="text-sm mt-1" style={{ color: "var(--muted)" }}>Godzina: <b>{tm(result.clockIn)}</b></div>
        ) : (
          <>
            <div className="text-sm mt-1" style={{ color: "var(--muted)" }}>{tm(result.clockIn)}–{tm(result.clockOut)} · <b>{(result.hours ?? 0).toFixed(2)} h</b></div>
            {!!result.breakMinutes && <div className="text-xs mt-1" style={{ color: "var(--gold)" }}>Należna płatna przerwa: {result.breakMinutes} min</div>}
          </>
        )}
        <button onClick={() => setResult(null)} className="mt-4 text-xs px-4 py-2 rounded" style={{ border: "1px solid var(--border)", color: "var(--muted)" }}>Skanuj ponownie</button>
      </div>
    );
  }

  return (
    <div>
      {/* kontener kamery musi istnieć w DOM zanim wystartujemy skaner */}
      <div id={EL_ID} className="rounded overflow-hidden mx-auto" style={{ width: scanning ? "100%" : 0, maxWidth: 320, height: scanning ? "auto" : 0 }} />
      {!scanning ? (
        <button onClick={start} disabled={busy} className="btn-gold w-full text-center" style={{ clipPath: "none", padding: "16px 24px", fontSize: 17, opacity: busy ? 0.6 : 1 }}>
          📷 Skanuj kod QR ({open ? "wyjście" : "wejście"})
        </button>
      ) : (
        <button onClick={stop} className="mt-3 text-sm px-4 py-2 rounded w-full" style={{ border: "1px solid var(--border)", color: "var(--muted)" }}>Anuluj skanowanie</button>
      )}
      {err && <div className="mt-3 text-sm text-center" style={{ color: "#fca5a5" }}>{err}</div>}
    </div>
  );
}
