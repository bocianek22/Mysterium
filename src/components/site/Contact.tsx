"use client";
import { useState } from "react";
import type { Locale, Dict } from "@/lib/i18n";

export default function Contact({
  locale,
  t,
  phone,
  email,
  address,
  hours,
  whatsapp,
}: {
  locale: Locale;
  t: Dict;
  phone: string;
  email: string;
  address: string;
  hours: string;
  whatsapp: string;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const [coupon, setCoupon] = useState("");
  const [couponMsg, setCouponMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function checkCoupon() {
    if (!coupon.trim()) return;
    setCouponMsg({ ok: false, text: "..." });
    try {
      const res = await fetch(`/api/coupon?code=${encodeURIComponent(coupon)}`);
      const d = await res.json();
      if (d.valid) {
        const desc = (locale === "pl" ? d.descriptionPl : d.descriptionEn) || (d.kind === "PERCENT" ? `-${d.value}%` : `-${d.value} zł`);
        setCouponMsg({ ok: true, text: `✓ ${locale === "pl" ? "Kod aktywny" : "Code valid"}: ${desc}` });
      } else {
        setCouponMsg({ ok: false, text: locale === "pl" ? "Kod nieprawidłowy lub wygasł" : "Invalid or expired code" });
      }
    } catch {
      setCouponMsg({ ok: false, text: locale === "pl" ? "Błąd sprawdzania" : "Check failed" });
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    if (data.website) return; // honeypot
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setStatus("ok");
        form.reset();
      } else setStatus("err");
    } catch {
      setStatus("err");
    }
  }

  const info = [
    { icon: "📍", label: t.contact.address, value: address },
    { icon: "📞", label: t.contact.phone, value: phone, href: `tel:${phone.replace(/\s/g, "")}` },
    { icon: "✉️", label: t.contact.email, value: email, href: `mailto:${email}` },
    { icon: "🕐", label: t.contact.hours, value: hours },
  ];

  return (
    <section
      className="px-6 md:px-[60px] py-20 md:py-[120px] relative z-[1]"
      id="kontakt"
      style={{ background: "linear-gradient(135deg,var(--teal-m) 0%,var(--navy-dd) 100%)" }}
    >
      <div className="sec-label">{t.contact.label}</div>
      <h2 className="sec-title text-gold-grad">{t.contact.title}</h2>
      <div className="sec-divider" />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-20 max-w-[1100px] mx-auto items-start">
        <div className="reveal reveal-left">
          {info.map((it, i) => (
            <div key={i} className="flex gap-4 mb-7 pb-7" style={{ borderBottom: i < info.length - 1 ? "1px solid rgba(201,168,76,.07)" : "none" }}>
              <div className="w-11 h-11 flex items-center justify-center text-lg flex-shrink-0" style={{ border: "1px solid var(--border)", background: "rgba(201,168,76,.04)" }}>
                {it.icon}
              </div>
              <div>
                <div className="font-serif text-[9px] tracking-[3px] uppercase mb-[5px]" style={{ color: "var(--gold)" }}>
                  {it.label}
                </div>
                <div className="text-[15px]" style={{ color: "var(--text)" }}>
                  {it.href ? (
                    <a href={it.href} className="no-underline" style={{ color: "var(--gold-l)" }}>
                      {it.value}
                    </a>
                  ) : (
                    it.value
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="corner-frame p-8 md:p-10 reveal reveal-right" style={{ background: "rgba(201,168,76,.03)", border: "1px solid var(--border)" }}>
          <h3 className="font-display text-[22px] mb-[6px] text-gold-grad">{t.contact.formTitle}</h3>
          <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
            {t.contact.formSub}
          </p>

          {status === "ok" && (
            <div className="px-4 py-3 text-[13px] mb-4 font-serif tracking-[1px]" style={{ background: "rgba(37,211,102,.07)", borderLeft: "3px solid #25D366", color: "#7eebb0" }}>
              {t.contact.ok}
            </div>
          )}
          {status === "err" && (
            <div className="px-4 py-3 text-[13px] mb-4 font-serif tracking-[1px]" style={{ background: "rgba(239,68,68,.07)", borderLeft: "3px solid #ef4444", color: "#fca5a5" }}>
              {t.contact.err}
            </div>
          )}

          <form onSubmit={onSubmit}>
            <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
              <div className="mb-[14px]">
                <label className="field-label">{t.contact.name} *</label>
                <input type="text" name="name" required className="field-input" placeholder="Jan Kowalski" />
              </div>
              <div className="mb-[14px]">
                <label className="field-label">{t.contact.yourPhone}</label>
                <input type="text" name="phone" className="field-input" placeholder="+48 000 000 000" />
              </div>
            </div>
            <div className="mb-[14px]">
              <label className="field-label">E-mail *</label>
              <input type="email" name="email" required className="field-input" placeholder="jan@example.com" />
            </div>
            <div className="mb-[14px]">
              <label className="field-label">{t.contact.subject}</label>
              <select name="subject" className="field-input" defaultValue="">
                <option value="" disabled>
                  {t.contact.choose}
                </option>
                {t.contact.subjects.map((s) => (
                  <option key={s} style={{ background: "var(--navy-d)" }}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-[14px]">
              <label className="field-label">{t.contact.couponLabel}</label>
              <div className="flex gap-2">
                <input type="text" name="coupon" value={coupon} onChange={(e) => { setCoupon(e.target.value.toUpperCase()); setCouponMsg(null); }} className="field-input uppercase flex-1" placeholder="np. WELCOME10" />
                <button type="button" onClick={checkCoupon} className="px-4 text-xs rounded whitespace-nowrap" style={{ border: "1px solid var(--border)", color: "var(--gold)" }}>{locale === "pl" ? "Sprawdź" : "Check"}</button>
              </div>
              {couponMsg && <p className="text-[12px] mt-1" style={{ color: couponMsg.ok ? "#7eebb0" : "#fca5a5" }}>{couponMsg.text}</p>}
            </div>
            <div className="mb-[14px]">
              <label className="field-label">{t.contact.message} *</label>
              <textarea name="message" required className="field-input h-[90px] resize-none" placeholder="..." />
            </div>
            <button type="submit" disabled={status === "sending"} className="btn-gold w-full" style={{ clipPath: "none" }}>
              {status === "sending" ? t.contact.sending : t.contact.send}
            </button>
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full mt-[10px] py-[13px] flex items-center justify-center gap-[10px] no-underline font-serif text-xs tracking-[2px] uppercase text-white"
              style={{ background: "#25D366" }}
            >
              WhatsApp
            </a>
            <p className="text-[11px] text-center mt-3 leading-[1.7]" style={{ color: "var(--dim)" }}>
              {t.contact.privacy}
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
