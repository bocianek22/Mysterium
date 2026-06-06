"use client";
import { useState } from "react";

export default function FileUpload({
  value,
  onChange,
  accept,
  kind,
}: {
  value: string;
  onChange: (url: string) => void;
  accept: string;
  kind: "image" | "video" | "doc";
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function upload(file: File) {
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) onChange(data.url);
      else setError(data.error || "Błąd wysyłania");
    } catch {
      setError("Błąd połączenia");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div className="flex gap-2 items-start flex-wrap">
        {value && kind === "image" && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="w-20 h-20 object-cover rounded" style={{ border: "1px solid var(--border)" }} />
        )}
        {value && kind === "video" && (
          <video src={value} className="w-32 h-20 object-cover rounded" style={{ border: "1px solid var(--border)" }} />
        )}
        {value && kind === "doc" && (
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-2 rounded" style={{ border: "1px solid var(--border)", color: "var(--gold)" }}>📄 Otwórz załącznik</a>
        )}
        <div className="flex-1 min-w-[200px]">
          <input
            type="file"
            accept={accept}
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
            }}
            className="text-xs"
            style={{ color: "var(--muted)" }}
          />
          {uploading && <div className="text-xs mt-1" style={{ color: "var(--gold)" }}>Wysyłanie...</div>}
          {error && <div className="text-xs mt-1" style={{ color: "#fca5a5" }}>{error}</div>}
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="...lub wklej adres URL"
            className="field-input mt-2 text-xs"
          />
        </div>
      </div>
    </div>
  );
}
