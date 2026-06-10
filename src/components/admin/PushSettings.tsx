"use client";
import { useCallback, useEffect, useState } from "react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export default function PushSettings({ isManager }: { isManager: boolean }) {
  const [supported, setSupported] = useState(true);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [admin, setAdmin] = useState<{ configured: boolean; subscriptions: number } | null>(null);

  const refresh = useCallback(async () => {
    const key = await fetch("/api/push/key").then((r) => r.json()).catch(() => ({}));
    setPublicKey(key.publicKey || null);
    setEnabled(!!key.enabled);
    if ("serviceWorker" in navigator && "PushManager" in window) {
      const reg = await navigator.serviceWorker.ready.catch(() => null);
      const sub = reg ? await reg.pushManager.getSubscription() : null;
      setSubscribed(!!sub);
    } else setSupported(false);
    if (isManager) {
      const a = await fetch("/api/admin/push").then((r) => r.json()).catch(() => null);
      if (a) setAdmin({ configured: a.configured, subscriptions: a.subscriptions });
    }
  }, [isManager]);

  useEffect(() => { refresh(); }, [refresh]);

  async function subscribe() {
    setBusy(true); setMsg("");
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") { setMsg("Nie udzielono zgody na powiadomienia."); setBusy(false); return; }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(publicKey!) });
      const json = sub.toJSON();
      await fetch("/api/push/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ endpoint: sub.endpoint, keys: json.keys }) });
      setSubscribed(true); setMsg("✓ Powiadomienia włączone na tym urządzeniu.");
    } catch { setMsg("Nie udało się włączyć powiadomień."); }
    setBusy(false);
  }

  async function unsubscribe() {
    setBusy(true); setMsg("");
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) { await fetch("/api/push/unsubscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ endpoint: sub.endpoint }) }); await sub.unsubscribe(); }
      setSubscribed(false); setMsg("Powiadomienia wyłączone na tym urządzeniu.");
    } catch {}
    setBusy(false);
  }

  async function adminAction(action: string) {
    setBusy(true); setMsg("");
    const res = await fetch("/api/admin/push", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setMsg(d.error || "Błąd"); return; }
    if (action === "test") setMsg("Wysłano testowe powiadomienie (jeśli masz włączone na tym urządzeniu).");
    refresh();
  }

  return (
    <div className="corner-frame p-6 mt-6" style={{ background: "rgba(13,27,42,.5)", border: "1px solid var(--border)" }}>
      <h2 className="text-sm font-serif tracking-[2px] uppercase mb-4" style={{ color: "var(--gold)" }}>🔔 Powiadomienia push</h2>

      {isManager && admin && !admin.configured && (
        <div className="mb-4">
          <p className="text-[13px] mb-2" style={{ color: "var(--muted)" }}>Push nie jest jeszcze skonfigurowany. Wygeneruj klucze, aby włączyć powiadomienia dla zespołu.</p>
          <button disabled={busy} onClick={() => adminAction("generate")} className="btn-gold" style={{ clipPath: "none", padding: "9px 18px" }}>Wygeneruj i włącz push</button>
        </div>
      )}

      {!supported ? (
        <p className="text-[13px]" style={{ color: "var(--muted)" }}>Ta przeglądarka nie wspiera powiadomień push.</p>
      ) : !enabled || !publicKey ? (
        !isManager && <p className="text-[13px]" style={{ color: "var(--muted)" }}>Powiadomienia push nie są jeszcze włączone przez administratora.</p>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          {subscribed ? (
            <button disabled={busy} onClick={unsubscribe} className="text-sm px-4 py-2 rounded" style={{ border: "1px solid var(--border)", color: "var(--text)" }}>Wyłącz na tym urządzeniu</button>
          ) : (
            <button disabled={busy} onClick={subscribe} className="btn-gold" style={{ clipPath: "none", padding: "9px 18px" }}>Włącz powiadomienia</button>
          )}
          {isManager && <button disabled={busy} onClick={() => adminAction("test")} className="text-sm px-4 py-2 rounded" style={{ border: "1px solid var(--border)", color: "var(--gold-l)" }}>Wyślij test</button>}
          {isManager && admin && <span className="text-[12px]" style={{ color: "var(--dim)" }}>Subskrypcji: {admin.subscriptions}</span>}
        </div>
      )}

      {msg && <p className="text-[13px] mt-3" style={{ color: "var(--muted)" }}>{msg}</p>}
    </div>
  );
}
