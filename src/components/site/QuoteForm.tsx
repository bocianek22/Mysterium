"use client";
import { useState } from "react";
import type { Dict } from "@/lib/i18n";

export default function QuoteForm({
  t,
  offerName,
  whatsapp,
}: {
  t: Dict;
  offerName: string;
  whatsapp: string;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const [form, setForm] = useState({ name: "", email: "", phone: "", date: "", place: "", people: "", occasion: "", message: "" });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    const message =
      `Zapytanie o wycenę: ${offerName}\n` +
      `Data: ${form.date || "—"}\n` +
      `Miejsce: ${form.place || "—"}\n` +
      `Liczba osób: ${form.people || "—"}\n` +
      `Okazja: ${form.occasion || "—"}\n\n` +
      (form.message || "");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          subject: `Mobilna Skrzynia — ${offerName}`,
          message,
        }),
      });
      setStatus(res.ok ? "ok" : "err");
      if (res.ok) setForm({ name: "", email: "", phone: "", date: "", place: "", people: "", occasion: "", message: "" });
    } catch {
      setStatus("err");
    }
  }

  const waText = encodeURIComponent(`Cześć! Chcę zapytać o wycenę: ${offerName}.`);

  return (
    <div className="corner-frame p-6 md:p-8" style={{ background: "rgba(201,168,76,.03)", border: "1px solid var(--border)" }}>
      <h3 className="font-display text-gold-grad text-2xl mb-1">{t.mobile.quoteTitle}</h3>
      <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>{t.mobile.quoteSub}</p>

      {status === "ok" && <div className="px-4 py-3 text-[13px] mb-4 font-serif tracking-[1px]" style={{ background: "rgba(37,211,102,.07)", borderLeft: "3px solid #25D366", color: "#7eebb0" }}>{t.contact.ok}</div>}
      {status === "err" && <div className="px-4 py-3 text-[13px] mb-4 font-serif tracking-[1px]" style={{ background: "rgba(239,68,68,.07)", borderLeft: "3px solid #ef4444", color: "#fca5a5" }}>{t.contact.err}</div>}

      <form onSubmit={submit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
          <div className="mb-[14px]"><label className="field-label">{t.contact.name} *</label><input className="field-input" required value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
          <div className="mb-[14px]"><label className="field-label">{t.contact.yourPhone}</label><input className="field-input" value={form.phone} onChange={(e) => set("phone", e.target.value)} /></div>
        </div>
        <div className="mb-[14px]"><label className="field-label">E-mail *</label><input type="email" className="field-input" required value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
          <div className="mb-[14px]"><label className="field-label">{t.mobile.date}</label><input type="date" className="field-input" value={form.date} onChange={(e) => set("date", e.target.value)} /></div>
          <div className="mb-[14px]"><label className="field-label">{t.mobile.people}</label><input className="field-input" value={form.people} onChange={(e) => set("people", e.target.value)} /></div>
        </div>
        <div className="mb-[14px]"><label className="field-label">{t.mobile.place}</label><input className="field-input" value={form.place} onChange={(e) => set("place", e.target.value)} /></div>
        <div className="mb-[14px]"><label className="field-label">{t.mobile.occasion}</label><input className="field-input" value={form.occasion} onChange={(e) => set("occasion", e.target.value)} /></div>
        <div className="mb-[14px]"><label className="field-label">{t.contact.message}</label><textarea className="field-input h-20 resize-none" value={form.message} onChange={(e) => set("message", e.target.value)} /></div>
        <button type="submit" disabled={status === "sending"} className="btn-gold w-full" style={{ clipPath: "none" }}>{status === "sending" ? t.contact.sending : t.mobile.send}</button>
        <a href={`https://wa.me/${whatsapp}?text=${waText}`} target="_blank" rel="noopener noreferrer" className="w-full mt-[10px] py-[13px] flex items-center justify-center gap-[10px] no-underline font-serif text-xs tracking-[2px] uppercase text-white" style={{ background: "#25D366" }}>{t.mobile.whatsapp}</a>
      </form>
    </div>
  );
}
