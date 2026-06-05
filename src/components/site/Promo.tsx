"use client";
import { useEffect, useState } from "react";
import type { Locale, Dict } from "@/lib/i18n";

export default function Promo({
  locale,
  t,
  mode,
  title,
  text,
  ctaLabel,
  ctaUrl,
  date,
}: {
  locale: Locale;
  t: Dict;
  mode: string; // OFF | COUNTDOWN | BANNER
  title: string;
  text: string;
  ctaLabel: string;
  ctaUrl?: string | null;
  date?: string | null;
}) {
  if (mode === "OFF" || !title) return null;

  return (
    <section className="px-6 md:px-[60px] py-16 md:py-20 relative z-[1] aurora" style={{ background: "linear-gradient(135deg,var(--teal-m),var(--navy-dd))" }}>
      <div className="relative z-[1] max-w-[900px] mx-auto text-center corner-frame p-8 md:p-12 reveal reveal-scale" style={{ border: "1px solid var(--border)", background: "rgba(201,168,76,.03)" }}>
        <div className="sec-label" style={{ marginBottom: 8 }}>{t.promo.soon}</div>
        <h2 className="font-display text-gold-grad shimmer text-3xl md:text-4xl mb-4">{title}</h2>
        {text && <p className="text-base mb-8 max-w-[560px] mx-auto" style={{ color: "var(--muted)" }}>{text}</p>}

        {mode === "COUNTDOWN" && date && <Countdown date={date} t={t} />}

        {ctaUrl && ctaLabel && (
          <div className="mt-8">
            <a href={ctaUrl} className="btn-gold">{ctaLabel}</a>
          </div>
        )}
      </div>
    </section>
  );
}

function Countdown({ date, t }: { date: string; t: Dict }) {
  const target = new Date(date).getTime();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (now === null) return null;
  const diff = Math.max(0, target - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const units = [
    { v: d, l: t.promo.days },
    { v: h, l: t.promo.hours },
    { v: m, l: t.promo.minutes },
    { v: s, l: t.promo.seconds },
  ];

  return (
    <div className="flex gap-3 md:gap-5 justify-center flex-wrap">
      {units.map((u, i) => (
        <div key={i} className="min-w-[70px] md:min-w-[90px] py-4 px-2 rounded" style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--border)" }}>
          <div className="font-display text-3xl md:text-5xl" style={{ color: "var(--gold)" }}>{String(u.v).padStart(2, "0")}</div>
          <div className="font-serif text-[9px] md:text-[10px] tracking-[2px] uppercase mt-1" style={{ color: "var(--dim)" }}>{u.l}</div>
        </div>
      ))}
    </div>
  );
}
