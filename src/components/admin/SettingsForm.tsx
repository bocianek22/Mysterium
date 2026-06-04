"use client";
import { useEffect, useState } from "react";

const fields: { name: string; label: string; type?: string; help?: string }[] = [
  { name: "phone", label: "Telefon" },
  { name: "email", label: "E-mail" },
  { name: "whatsapp", label: "Numer WhatsApp", help: "Same cyfry z kodem kraju, np. 48571080192" },
  { name: "lockmeUrl", label: "Link do rezerwacji LockMe (przycisk zapasowy)" },
  {
    name: "lockmeWidget",
    label: "Kod widżetu LockMe (osadzenie)",
    type: "textarea",
    help: "Skopiuj z panelu LockMe: Firmy → Widgety → wybierz wariant → skopiuj kod (iframe lub script) i wklej tutaj. Po zapisaniu widżet pojawi się w sekcji Rezerwacja.",
  },
  { name: "addressPl", label: "Adres (PL)" },
  { name: "addressEn", label: "Adres (EN)" },
  { name: "hoursPl", label: "Godziny / dostępność (PL)" },
  { name: "hoursEn", label: "Godziny / dostępność (EN)" },
  { name: "heroDescPl", label: "Opis na stronie głównej (PL)", type: "textarea" },
  { name: "heroDescEn", label: "Opis na stronie głównej (EN)", type: "textarea" },
  { name: "instagram", label: "Instagram (URL)" },
  { name: "facebook", label: "Facebook (URL)" },
];

export default function SettingsForm() {
  const [data, setData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        setData(d.settings || {});
        setLoading(false);
      });
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setMsg(res.ok ? "✓ Zapisano" : "Błąd zapisu");
    setSaving(false);
    setTimeout(() => setMsg(""), 3000);
  }

  if (loading) return <p style={{ color: "var(--muted)" }}>Ładowanie...</p>;

  return (
    <form onSubmit={save} className="max-w-[640px]">
      <div className="grid grid-cols-1 gap-4">
        {fields.map((f) => (
          <div key={f.name}>
            <label className="field-label">{f.label}</label>
            {f.type === "textarea" ? (
              <textarea value={data[f.name] || ""} onChange={(e) => setData({ ...data, [f.name]: e.target.value })} className="field-input h-20 resize-none" />
            ) : (
              <input type="text" value={data[f.name] || ""} onChange={(e) => setData({ ...data, [f.name]: e.target.value })} className="field-input" />
            )}
            {f.help && <p className="text-[11px] mt-1" style={{ color: "var(--dim)" }}>{f.help}</p>}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 mt-8">
        <button type="submit" disabled={saving} className="btn-gold" style={{ clipPath: "none", padding: "11px 24px" }}>
          {saving ? "Zapisywanie..." : "Zapisz ustawienia"}
        </button>
        {msg && <span className="text-sm" style={{ color: "var(--gold)" }}>{msg}</span>}
      </div>
    </form>
  );
}
