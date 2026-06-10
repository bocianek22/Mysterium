"use client";
import { useEffect, useState } from "react";
import FileUpload from "./FileUpload";
import OpeningHoursEditor from "./OpeningHoursEditor";

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

type Field = { name: string; label: string; type?: string; help?: string; placeholder?: string; default?: string | number; options?: { value: string; label: string }[] };

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
      { name: "parkingPl", label: "Parking / dojazd (PL)", type: "textarea", help: "Wyświetla się pod mapą na stronie Kontakt." },
      { name: "parkingEn", label: "Parking / dojazd (EN)", type: "textarea" },
      { name: "heroDescPl", label: "Opis na stronie głównej (PL)", type: "textarea" },
      { name: "heroDescEn", label: "Opis na stronie głównej (EN)", type: "textarea" },
      { name: "instagram", label: "Instagram (URL)" },
      { name: "facebook", label: "Facebook (URL)" },
      { name: "tiktok", label: "TikTok (URL)" },
      { name: "youtube", label: "YouTube (URL)" },
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
    title: "Zegar (RCP) — kod QR",
    fields: [
      { name: "clockCodeMode", label: "Tryb kodu QR", type: "select", options: [
        { value: "STATIC", label: "Statyczny — zmienia się tylko po kliknięciu „Wygeneruj nowy kod”" },
        { value: "DYNAMIC", label: "Dynamiczny — odświeża się automatycznie co kilka sekund" },
      ], help: "Statyczny jest wygodniejszy (możesz wydrukować kod). Dynamiczny jest bezpieczniejszy — sfotografowany kod szybko wygasa." },
    ],
  },
  {
    title: "Płatności online",
    fields: [
      { name: "paymentProvider", label: "Operator płatności", type: "select", options: [
        { value: "STRIPE", label: "Stripe (karty + BLIK)" },
        { value: "P24", label: "Przelewy24 (BLIK + przelewy)" },
      ], help: "Klucze API ustaw w zmiennych środowiskowych na Vercel: Stripe (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET) lub Przelewy24 (P24_MERCHANT_ID, P24_POS_ID, P24_CRC, P24_API_KEY, P24_SANDBOX)." },
    ],
  },
  {
    title: "Pop-up (promocja / newsletter)",
    fields: [
      { name: "popupMode", label: "Tryb pop-upu", type: "select", options: [
        { value: "OFF", label: "Wyłączony" },
        { value: "PROMO", label: "Promocja (z przyciskiem)" },
        { value: "NEWSLETTER", label: "Newsletter (zapis e-mail)" },
      ], help: "Wyskakujące okno na stronie. Newsletter zapisuje e-mail do bazy klientów ze zgodą marketingową." },
      { name: "popupTitlePl", label: "Tytuł (PL)", type: "text" },
      { name: "popupTitleEn", label: "Tytuł (EN)", type: "text" },
      { name: "popupTextPl", label: "Tekst (PL)", type: "textarea" },
      { name: "popupTextEn", label: "Tekst (EN)", type: "textarea" },
      { name: "popupImage", label: "Obrazek (opcjonalnie)", type: "image" },
      { name: "popupCtaLabelPl", label: "Przycisk — tekst (PL)", type: "text", help: "Dla promocji: napis na przycisku. Dla newslettera: napis przy zapisie." },
      { name: "popupCtaLabelEn", label: "Przycisk — tekst (EN)", type: "text" },
      { name: "popupCtaUrl", label: "Przycisk — link (tylko promocja)", type: "text", placeholder: "https://..." },
      { name: "popupDelaySec", label: "Opóźnienie pokazania (sekundy)", type: "number", default: 6 },
    ],
  },
  {
    title: "Klienci — auto-podziękowanie",
    fields: [
      { name: "thankYouMessagePl", label: "Treść podziękowania (mail po grze)", type: "textarea", help: "Wysyłane automatycznie do klienta po zakończonej rezerwacji (jeśli ma e-mail). Link do opinii Google z sekcji „Opinie Google” dołączamy automatycznie. Zostaw puste, by użyć domyślnej treści." },
      { name: "loyaltyPerGame", label: "Punkty lojalnościowe za grę", type: "number", default: 0, help: "Ile punktów dopisać klientowi (po e-mailu) za każdą rozegraną grę. 0 = wyłączone." },
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
    title: "Szablony e-maili (bony / płatności)",
    fields: [
      { name: "voucherEmailSubject", label: "Bon — temat", placeholder: "Twój bon podarunkowy Mysterium 🎁" },
      { name: "voucherEmailBody", label: "Bon — treść", type: "textarea", help: "Placeholdery: {code} (kod bonu), {amount} (wartość). Puste = domyślna treść." },
      { name: "payEmailSubject", label: "Płatność — temat", placeholder: "Potwierdzenie płatności — Mysterium" },
      { name: "payEmailBody", label: "Płatność — treść", type: "textarea", help: "Placeholdery: {amount} (kwota), {description} (opis). Puste = domyślna treść." },
    ],
  },
  {
    title: "SEO i Google",
    fields: [
      { name: "gaMeasurementId", label: "Google Analytics ID", placeholder: "G-XXXXXXXXXX", help: "GA4. Wczytywane tylko po zgodzie analitycznej użytkownika (RODO)." },
      { name: "googleSiteVerification", label: "Google Search Console — token weryfikacji", placeholder: "np. abc123...", help: "Wartość z meta tagu google-site-verification." },
    ],
  },
  {
    title: "Newsletter — kod powitalny",
    fields: [
      { name: "newsletterDiscountPct", label: "Zniżka za zapis (%)", type: "number", default: 10 },
      { name: "newsletterDiscountCode", label: "Wspólny kod rabatowy", placeholder: "WITAJ10", help: "Jeden kod dla wszystkich zapisanych. Wysyłany automatycznie mailem przy zapisie (raz na osobę)." },
    ],
  },
  {
    title: "Przypomnienia przed grą",
    fields: [
      { name: "reminderLeadHours", label: "Ile godzin przed grą wysłać", type: "number", default: 24 },
      { name: "reminderSubject", label: "Temat (puste = domyślny)", placeholder: "Przypomnienie o grze w Mysterium" },
      { name: "reminderBody", label: "Treść (placeholdery: {name} {date} {time} {room})", type: "textarea" },
    ],
  },
  {
    title: "Godziny otwarcia i wolne terminy",
    fields: [
      { name: "slotStepMin", label: "Długość slotu rezerwacji (min)", type: "number", default: 90, help: "Co ile minut zaczyna się nowa gra (np. 90)." },
      { name: "weekendSurchargePct", label: "Dopłata weekendowa do cen (%)", type: "number", default: 0, help: "0 = brak. Np. 15 pokaże w cenniku drugą cenę weekendową +15%." },
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
          {g.title === "Newsletter — kod powitalny" && (
            <label className="flex items-center gap-3 mb-4"><input type="checkbox" checked={!!data.newsletterDiscountEnabled} onChange={(e) => set("newsletterDiscountEnabled", e.target.checked)} /><span className="text-sm" style={{ color: "var(--text)" }}>Wysyłaj kod powitalny po zapisie do newslettera (wymaga Resend)</span></label>
          )}
          {g.title === "Przypomnienia przed grą" && (
            <label className="flex items-center gap-3 mb-4"><input type="checkbox" checked={!!data.reminderEnabled} onChange={(e) => set("reminderEnabled", e.target.checked)} /><span className="text-sm" style={{ color: "var(--text)" }}>Wysyłaj automatyczne przypomnienia e-mail przed grą (wymaga Resend + cron)</span></label>
          )}
          {g.title === "Godziny otwarcia i wolne terminy" && (
            <div className="mb-4">
              <label className="flex items-center gap-3 mb-3"><input type="checkbox" checked={!!data.slotsEnabled} onChange={(e) => set("slotsEnabled", e.target.checked)} /><span className="text-sm" style={{ color: "var(--text)" }}>Pokazuj „Wolne terminy" na stronie (/terminy)</span></label>
              <OpeningHoursEditor value={data.openHoursJson} onChange={(v) => set("openHoursJson", v)} />
            </div>
          )}
          {g.title === "Płatności online" && (
            <div className="mb-4 flex flex-col gap-2">
              <label className="flex items-center gap-3"><input type="checkbox" checked={!!data.paymentsEnabled} onChange={(e) => set("paymentsEnabled", e.target.checked)} /><span className="text-sm" style={{ color: "var(--text)" }}>Włącz płatności online</span></label>
              <label className="flex items-center gap-3"><input type="checkbox" checked={!!data.voucherSaleEnabled} onChange={(e) => set("voucherSaleEnabled", e.target.checked)} /><span className="text-sm" style={{ color: "var(--text)" }}>Sprzedaż bonów online na stronie /bony</span></label>
            </div>
          )}
          {g.title === "Klienci — auto-podziękowanie" && (
            <div className="mb-4 flex flex-col gap-2">
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={!!data.autoThankYouEnabled} onChange={(e) => set("autoThankYouEnabled", e.target.checked)} />
                <span className="text-sm" style={{ color: "var(--text)" }}>Wysyłaj automatyczne podziękowanie e-mail po grze (wymaga klucza Resend)</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={!!data.surveyEnabled} onChange={(e) => set("surveyEnabled", e.target.checked)} />
                <span className="text-sm" style={{ color: "var(--text)" }}>Dołącz krótką ankietę po grze (ocena + opinia; wyniki w „Ankiety")</span>
              </label>
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
