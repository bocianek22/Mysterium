"use client";
import { useState } from "react";

export default function QRGenerator() {
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);

  async function gen() {
    if (!text.trim()) return;
    setBusy(true);
    try {
      const QRCode = (await import("qrcode")).default;
      const dataUrl = await QRCode.toDataURL(text.trim(), { width: 600, margin: 2, color: { dark: "#0d1b2a", light: "#ffffff" } });
      setUrl(dataUrl);
    } catch { /* ignore */ } finally { setBusy(false); }
  }

  return (
    <div>
      <h1 className="font-display text-gold-grad text-3xl mb-2 flex items-center gap-3"><span>🔳</span> Generator kodów QR</h1>
      <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>Wpisz adres URL lub tekst (np. link do rezerwacji, bonu, Wi-Fi) i pobierz kod QR do druku.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start max-w-[820px]">
        <div className="flex flex-col gap-3">
          <textarea className="field-input h-28 resize-none" placeholder="https://… lub dowolny tekst" value={text} onChange={(e) => setText(e.target.value)} />
          <button onClick={gen} disabled={busy || !text.trim()} className="btn-gold" style={{ clipPath: "none", padding: "11px 22px" }}>{busy ? "Generuję…" : "Generuj QR"}</button>
        </div>
        <div className="p-5 rounded text-center" style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--border)" }}>
          {url ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="QR" className="mx-auto rounded" style={{ width: 240, height: 240, background: "#fff" }} />
              <a href={url} download="mysterium-qr.png" className="btn-gold inline-block mt-4" style={{ clipPath: "none", padding: "9px 18px", fontSize: 12 }}>⬇ Pobierz PNG</a>
            </>
          ) : <p className="text-sm" style={{ color: "var(--muted)" }}>Tu pojawi się kod QR.</p>}
        </div>
      </div>
    </div>
  );
}
