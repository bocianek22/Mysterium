"use client";
import { useState } from "react";

export default function CopyField({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }
  return (
    <div className="flex gap-2">
      <input readOnly value={value} className="field-input text-xs flex-1" onFocus={(e) => e.target.select()} />
      <button onClick={copy} className="px-3 text-xs rounded whitespace-nowrap" style={{ border: "1px solid var(--border)", color: "var(--gold)" }}>
        {copied ? "✓ Skopiowano" : "Kopiuj"}
      </button>
    </div>
  );
}
