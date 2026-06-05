"use client";
import { useEffect, useState } from "react";

type Field = { name: string; label: string; type?: string; help?: string; options?: { value: string; label: string }[] };

const groups: { title: string; fields: Field[] }[] = [
  {
    title: "Kontakt i strona",
    fields: [
      { name: "phone", label: "Telefon" },
      { name: "email", label: "E-mail" },
      { name: "whatsapp", label: "Numer WhatsApp", help: "Same cyfry z kodem kraju, np. 48571080192" },
      { name: "addressPl", label: "Adres (PL)" },
      { name: "addressEn", label: "Adres (EN)" },
      { name: "hoursPl", label: "Godziny / dostępność (PL)" },
      { name: "hoursEn", label: "Godziny / dostępność (EN)" },
      { name: "heroDescPl", label: "Opis na stronie głównej (PL)", type: "textarea" },
      { name: "heroDescEn", label: "Opis na stronie głównej (EN)", type: "textarea" },
      { name: "instagram", label: "Instagram (URL)" },
      { name: "facebook", label: "Facebook (URL)" },
    ],
  },
  {
    title: "O nas i mapa",
    fields: [
      { name: "aboutPl", label: "O nas — treść (PL)", type: "textarea", help: "Akapity oddzielaj pustą linią." },
      { name: "aboutEn", label: "O nas — treść (EN)", type: "textarea" },
      { name: "mapLink", label: "Link „Otwórz w Google Maps”" },
      { name: "mapEmbed", label: "Mapa — kod osadzenia (src iframe)", help: "Google Maps → Udostępnij → Umieść mapę → skopiuj adres z src=\"...\". Zostaw puste, by użyć adresu." },
    ],
  },
  {
    title: "Sekcja promo / odliczanie (strona główna)",
    fields: [
      { name: "promoMode", label: "Tryb", type: "select", options: [
        { value: "OFF", label: "Wyłączona" },
        { value: "COUNTDOWN", label: "Odliczanie do daty" },
        { value: "BANNER", label: "Baner (bez zegara)" },
      ] },
      { name: "promoTitlePl", label: "Tytuł (PL)" },
      { name: "promoTitleEn", label: "Tytuł (EN)" },
      { name: "promoTextPl", label: "Tekst (PL)", type: "textarea" },
      { name: "promoTextEn", label: "Tekst (EN)", type: "textarea" },
      { name: "promoDate", label: "Data odliczania", type: "datetime", help: "Wymagane dla trybu „Odliczanie”." },
      { name: "promoCtaLabelPl", label: "Przycisk — tekst (PL)" },
      { name: "promoCtaLabelEn", label: "Przycisk — tekst (EN)" },
      { name: "promoCtaUrl", label: "Przycisk — link" },
    ],
  },
  {
    title: "Rezerwacje — LockMe",
    fields: [
      { name: "lockmeUrl", label: "Link do rezerwacji LockMe (przycisk)" },
      { name: "lockmeWidget", label: "Kod widżetu LockMe (osadzenie na stronie)", type: "textarea", help: "Panel LockMe → Firmy → Widgety → skopiuj kod (iframe lub script)." },
      { name: "lockmeApiUrl", label: "LockMe API — adres URL (import rezerwacji)", help: "Endpoint zwracający rezerwacje w JSON. Zostaw puste jeśli nie używasz." },
      { name: "lockmeApiKey", label: "LockMe API — klucz / token" },
      { name: "lockmeRoomId", label: "LockMe — ID pokoju (opcjonalnie)" },
    ],
  },
  {
    title: "Google Calendar — pełna synchronizacja (opcjonalnie)",
    fields: [
      { name: "googleClientEmail", label: "Konto serwisowe — e-mail", help: "Z pliku JSON konta serwisowego Google Cloud (client_email)." },
      { name: "googlePrivateKey", label: "Konto serwisowe — klucz prywatny", type: "textarea", help: "Pole private_key z pliku JSON (z -----BEGIN PRIVATE KEY-----)." },
      { name: "googleCalendarId", label: "ID kalendarza Google", help: "np. twoj-kalendarz@group.calendar.google.com — udostępnij go kontu serwisowemu." },
    ],
  },
];

export default function SettingsForm() {
  const [data, setData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings").then((r) => r.json()).then((d) => { setData(d.settings || {}); setLoading(false); });
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setMsg("");
    const res = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    setMsg(res.ok ? "✓ Zapisano" : "Błąd zapisu");
    setSaving(false);
    setTimeout(() => setMsg(""), 3000);
  }

  const set = (k: string, v: any) => setData((d) => ({ ...d, [k]: v }));
  if (loading) return <p style={{ color: "var(--muted)" }}>Ładowanie...</p>;

  return (
    <form onSubmit={save} className="max-w-[680px]">
      {groups.map((g) => (
        <div key={g.title} className="mb-8">
          <h2 className="font-serif text-sm tracking-[2px] uppercase mb-4 pb-2" style={{ color: "var(--gold)", borderBottom: "1px solid var(--border)" }}>{g.title}</h2>
          {g.title.startsWith("Google") && (
            <label className="flex items-center gap-3 mb-4">
              <input type="checkbox" checked={!!data.googleSyncEnabled} onChange={(e) => set("googleSyncEnabled", e.target.checked)} />
              <span className="text-sm" style={{ color: "var(--text)" }}>Włącz synchronizację rezerwacji z Google Calendar</span>
            </label>
          )}
          <div className="grid grid-cols-1 gap-4">
            {g.fields.map((f) => (
              <div key={f.name}>
                <label className="field-label">{f.label}</label>
                {f.type === "textarea" ? (
                  <textarea value={data[f.name] || ""} onChange={(e) => set(f.name, e.target.value)} className="field-input h-20 resize-none" />
                ) : f.type === "select" ? (
                  <select value={data[f.name] || ""} onChange={(e) => set(f.name, e.target.value)} className="field-input">
                    {f.options?.map((o) => <option key={o.value} value={o.value} style={{ background: "var(--navy-d)" }}>{o.label}</option>)}
                  </select>
                ) : f.type === "datetime" ? (
                  <input type="datetime-local" value={(data[f.name] || "").slice(0, 16)} onChange={(e) => set(f.name, e.target.value)} className="field-input" />
                ) : (
                  <input type="text" value={data[f.name] || ""} onChange={(e) => set(f.name, e.target.value)} className="field-input" />
                )}
                {f.help && <p className="text-[11px] mt-1" style={{ color: "var(--dim)" }}>{f.help}</p>}
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="flex items-center gap-4 sticky bottom-0 py-4" style={{ background: "var(--navy-dd)" }}>
        <button type="submit" disabled={saving} className="btn-gold" style={{ clipPath: "none", padding: "11px 24px" }}>{saving ? "Zapisywanie..." : "Zapisz ustawienia"}</button>
        {msg && <span className="text-sm" style={{ color: "var(--gold)" }}>{msg}</span>}
      </div>
    </form>
  );
}
