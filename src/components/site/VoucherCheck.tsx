"use client";
import { useState } from "react";
import type { Locale } from "@/lib/i18n";

export default function VoucherCheck({ locale }: { locale: Locale }) {
  const pl = locale === "pl";
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function check() {
    if (!code.trim()) return;
    setMsg({ ok: false, text: "..." });
    try {
      const res = await fetch(`/api/voucher?code=${encodeURIComponent(code)}`);
      const d = await res.json();
      if (d.valid) {
        const t = (pl ? d.titlePl : d.titleEn) || (pl ? "Bon ważny" : "Voucher valid");
        setMsg({ ok: true, text: `✓ ${t}${d.validUntil ? ` · ${pl ? "ważny do" : "valid until"} ${d.validUntil}` : ""}` });
      } else if (d.redeemed) setMsg({ ok: false, text: pl ? "Bon został już zrealizowany" : "Voucher already redeemed" });
      else if (d.expired) setMsg({ ok: false, text: pl ? "Bon stracił ważność" : "Voucher expired" });
      else setMsg({ ok: false, text: pl ? "Nie znaleziono bonu" : "Voucher not found" });
    } catch {
      setMsg({ ok: false, text: pl ? "Błąd sprawdzania" : "Check failed" });
    }
  }

  return (
    <div className="max-w-[440px]">
      <label className="field-label">{pl ? "Sprawdź ważność bonu" : "Check your voucher"}</label>
      <div className="flex gap-2">
        <input className="field-input uppercase flex-1" value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setMsg(null); }} placeholder="MYS-XXXX" />
        <button onClick={check} className="px-4 text-sm rounded whitespace-nowrap" style={{ border: "1px solid var(--border)", color: "var(--gold)" }}>{pl ? "Sprawdź" : "Check"}</button>
      </div>
      {msg && <p className="text-[13px] mt-2" style={{ color: msg.ok ? "#7eebb0" : "#fca5a5" }}>{msg.text}</p>}
    </div>
  );
}
