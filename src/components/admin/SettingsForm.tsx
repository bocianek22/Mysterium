"use client";
import { useEffect, useState } from "react";
import FileUpload from "./FileUpload";

function NotifyTestButton() {
  const [msg, setMsg] = useState("");
  async function test() {
    setMsg("Wysyłanie...");
    try {
      const res = await fetch("/api/admin/notify-test", { method: "POST" });
      const d = await res.json();
      if (!res.ok) { setMsg("Błąd"); return; }
      setMsg(`Telegram: ${d.telegram ? "✓" : "—"} · E-mail: ${d.email ? "✓" : "—"}`);
    } catch { setMsg("Błąd połączenia"); }
  }
  return (
    <div className="flex items-center gap-3 mt-1">
      <button type="button" onClick={test} className="text-xs px-3 py-2 rounded" style={{ border: "1px solid var(--border)", color: "var(--gold)" }}>Wyślij testowe powiadomienie</button>
      {msg && <span className="text-xs" style={{ color: "var(--muted)" }}>{msg} <span style={{ color: "var(--dim)" }}>(najpierw zapisz ustawienia)</span></span>}
    </div>
  );
}

type Field = { name: string; label: string; type?: string; help?: string; options?: { value: string; label: string }[] };

const groups: { title: string; fields: Field[] }[] = [
  {
    title: "Kontakt i strona",
    fields: [
      { name: "logoUrl", label: "Logo (w nawigacji)", type: "image", help: "Wgraj logo — pojawi się w menu na górze strony. Najlepiej PNG na przezroczystym tle." },
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
    title: "Powiadomienia",
    fields: [
      { name: "telegramBotToken", label: "Telegram — token bota", help: "Utwórz bota u @BotFather (komenda /newbot) i wklej token. Dodaj bota do grupy zespołu." },
      { name: "telegramChatId", label: "Telegram — ID czatu/grupy", help: "Napisz coś na grupie, otwórz https://api.telegram.org/bot<TOKEN>/getUpdates i skopiuj wartość chat→id (dla grup zaczyna się od minusa)." },
    ],
  },
  {
    title: "Opinie Google",
    fields: [
      { name: "googleReviewsUrl", label: "Link do opinii Google", help: "Adres Twojej wizytówki Google (przycisk „Zobacz nas w Google” w sekcji opinii)." },
      { name: "googleRating", label: "Ocena Google (np. 4.9)" },
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
          {g.title.startsWith("Google Calendar") && (
            <label className="flex items-center gap-3 mb-4">
              <input type="checkbox" checked={!!data.googleSyncEnabled} onChange={(e) => set("googleSyncEnabled", e.target.checked)} />
              <span className="text-sm" style={{ color: "var(--text)" }}>Włącz synchronizację rezerwacji z Google Calendar</span>
            </label>
          )}
          {g.title === "Powiadomienia" && (
            <div className="mb-4 flex flex-col gap-2">
              <label className="flex items-center gap-3"><input type="checkbox" checked={!!data.telegramEnabled} onChange={(e) => set("telegramEnabled", e.target.checked)} /><span className="text-sm" style={{ color: "var(--text)" }}>Włącz powiadomienia Telegram</span></label>
              <label className="flex items-center gap-3"><input type="checkbox" checked={!!data.emailNotifyEnabled} onChange={(e) => set("emailNotifyEnabled", e.target.checked)} /><span className="text-sm" style={{ color: "var(--text)" }}>Włącz powiadomienia e-mail (wymaga klucza Resend na serwerze)</span></label>
              <div className="flex flex-wrap gap-4 mt-1 text-sm" style={{ color: "var(--muted)" }}>
                <label className="flex items-center gap-2"><input type="checkbox" checked={data.notifyOnReservation ?? true} onChange={(e) => set("notifyOnReservation", e.target.checked)} /> Nowe rezerwacje</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={data.notifyOnMessage ?? true} onChange={(e) => set("notifyOnMessage", e.target.checked)} /> Nowe wiadomości</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={data.notifyOnSchedule ?? true} onChange={(e) => set("notifyOnSchedule", e.target.checked)} /> Zmiany grafiku</label>
              </div>
              <NotifyTestButton />
            </div>
          )}
          {g.title === "Opinie Google" && (
            <label className="flex items-center gap-3 mb-4">
              <input type="checkbox" checked={!!data.googleReviewsEnabled} onChange={(e) => set("googleReviewsEnabled", e.target.checked)} />
              <span className="text-sm" style={{ color: "var(--text)" }}>Pokaż sekcję opinii Google (przycisk + ocena)</span>
            </label>
          )}
          <div className="grid grid-cols-1 gap-4">
            {g.fields.map((f) => (
              <div key={f.name}>
                <label className="field-label">{f.label}</label>
                {f.type === "textarea" ? (
                  <textarea value={data[f.name] || ""} onChange={(e) => set(f.name, e.target.value)} className="field-input h-20 resize-none" />
                ) : f.type === "image" ? (
                  <FileUpload value={data[f.name] || ""} onChange={(url) => set(f.name, url)} accept="image/*" kind="image" />
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
