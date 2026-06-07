"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Result = { action: "IN" | "OUT"; clockIn?: string; clockOut?: string; hours?: number; breakMinutes?: number };

// Przycisk rejestracji wejścia/wyjścia. Token pochodzi z zeskanowanego kodu QR.
export default function ClockAction({ token, open }: { token?: string; open: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [err, setErr] = useState("");

  if (!token) {
    return (
      <div className="p-4 rounded text-sm text-center" style={{ background: "rgba(201,168,76,.06)", border: "1px solid var(--border)", color: "var(--muted)" }}>
        📷 Zeskanuj kod QR przy wejściu, aby zarejestrować {open ? "wyjście" : "wejście"}.
      </div>
    );
  }

  async function go() {
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/admin/clock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ t: token }),
      });
      const j = await res.json();
      if (!res.ok) {
        setErr(j.message || "Nie udało się zarejestrować.");
        return;
      }
      setResult(j);
      router.refresh();
    } catch {
      setErr("Błąd połączenia.");
    } finally {
      setBusy(false);
    }
  }

  if (result) {
    const t = (s?: string) => (s ? new Date(s).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" }) : "");
    return (
      <div className="p-5 rounded text-center" style={{ background: "rgba(126,235,176,.08)", border: "1px solid rgba(126,235,176,.3)" }}>
        {result.action === "IN" ? (
          <>
            <div className="text-3xl mb-2">✅</div>
            <div className="font-display text-xl" style={{ color: "#7eebb0" }}>Wejście zarejestrowane</div>
            <div className="text-sm mt-1" style={{ color: "var(--muted)" }}>Godzina: <b>{t(result.clockIn)}</b></div>
          </>
        ) : (
          <>
            <div className="text-3xl mb-2">👋</div>
            <div className="font-display text-xl" style={{ color: "#7eebb0" }}>Wyjście zarejestrowane</div>
            <div className="text-sm mt-1" style={{ color: "var(--muted)" }}>
              {t(result.clockIn)}–{t(result.clockOut)} · czas pracy <b>{(result.hours ?? 0).toFixed(2)} h</b>
            </div>
            {!!result.breakMinutes && (
              <div className="text-xs mt-1" style={{ color: "var(--gold)" }}>Należna płatna przerwa: {result.breakMinutes} min</div>
            )}
            <div className="text-xs mt-3" style={{ color: "var(--muted)" }}>Pamiętaj uzupełnić kartę godzin w panelu.</div>
          </>
        )}
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={go}
        disabled={busy}
        className="btn-gold w-full text-center"
        style={{ clipPath: "none", padding: "18px 24px", fontSize: 18, opacity: busy ? 0.6 : 1 }}
      >
        {busy ? "Rejestruję…" : open ? "🔴 Zarejestruj WYJŚCIE" : "🟢 Zarejestruj WEJŚCIE"}
      </button>
      {err && <div className="mt-3 text-sm text-center" style={{ color: "#fca5a5" }}>{err}</div>}
    </div>
  );
}
