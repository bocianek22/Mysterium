"use client";
import { useRef } from "react";
import type { MobileOffer } from "@prisma/client";
import type { Locale, Dict } from "@/lib/i18n";
import { pick } from "@/lib/i18n";

export default function MobileCard({
  offer,
  locale,
  t,
}: {
  offer: MobileOffer;
  locale: Locale;
  t: Dict;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el || !window.matchMedia("(pointer: fine)").matches) return;
    const r = el.getBoundingClientRect();
    const rx = (0.5 - (e.clientY - r.top) / r.height) * 6;
    const ry = ((e.clientX - r.left) / r.width - 0.5) * 6;
    el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
  }
  function onLeave() { if (ref.current) ref.current.style.transform = ""; }

  const name = pick(offer, "name", locale);
  const tagline = pick(offer, "tagline", locale);
  const badge = pick(offer, "badge", locale);

  return (
    <a
      ref={ref}
      href={`/${locale}/mobilna/${offer.slug}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="group relative overflow-hidden no-underline block min-h-[480px] reveal reveal-scale tilt"
      style={{ transition: "transform .35s cubic-bezier(.16,1,.3,1)" }}
    >
      <div
        className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.06]"
        style={offer.image ? { backgroundImage: `url(${offer.image})`, backgroundSize: "cover", backgroundPosition: "center" } : { background: "linear-gradient(135deg,#0A2E2C 0%,#061020 100%)" }}
      />
      <div className="absolute inset-0" style={{ background: "linear-gradient(0deg,rgba(4,12,20,.97) 0%,rgba(4,12,20,.4) 60%,transparent 100%)" }} />
      <div className="absolute inset-0 transition-colors duration-500 group-hover:border-[rgba(201,168,76,.55)]" style={{ border: "1px solid rgba(201,168,76,.1)" }} />
      <span className="absolute top-6 left-6 font-serif text-[9px] tracking-[3px] uppercase px-3 py-[3px]" style={{ border: "1px solid rgba(125,211,208,.4)", color: "#7dd3d0", background: "rgba(13,61,58,.3)" }}>{badge}</span>
      <span className="absolute top-6 right-6 text-3xl opacity-30">📦</span>
      <div className="absolute bottom-0 left-0 right-0 px-8 pb-9 pt-9 md:pr-28 transition-transform duration-500 group-hover:-translate-y-1">
        <div className="font-display text-[28px] font-bold text-white mb-[10px] leading-[1.1]">{name}</div>
        {tagline && <div className="text-sm mb-4 leading-[1.6]" style={{ color: "var(--muted)" }}>{tagline}</div>}
        <div className="flex gap-4 flex-wrap">
          <span className="font-serif text-[10px] tracking-[1px] flex items-center gap-[5px]" style={{ color: "var(--gold)" }}>⏱ {offer.durationMin} {t.rooms.min}</span>
          <span className="font-serif text-[10px] tracking-[1px] flex items-center gap-[5px]" style={{ color: "var(--gold)" }}>👥 {offer.minPlayers}–{offer.maxPlayers} {t.rooms.people}</span>
          <span className="font-serif text-[10px] tracking-[1px] flex items-center gap-[5px]" style={{ color: "var(--gold)" }}>🚐 {t.mobile.label}</span>
        </div>
      </div>
      <span className="hidden md:block absolute bottom-9 right-8 font-serif text-[10px] tracking-[2px] uppercase opacity-0 group-hover:opacity-100 transition-all duration-500" style={{ color: "var(--gold)" }}>{t.mobile.seeOffer}</span>
    </a>
  );
}
