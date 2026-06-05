"use client";
import { useEffect, useRef } from "react";
import type { Locale, Dict } from "@/lib/i18n";

export default function Hero({
  locale,
  t,
  desc,
}: {
  locale: Locale;
  t: Dict;
  desc: string;
}) {
  const tags = [t.hero.tagOnsite, t.hero.tagMobile, t.hero.tagLocation];
  const orb1 = useRef<HTMLDivElement>(null);
  const orb2 = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const onMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      if (orb1.current) orb1.current.style.transform = `translate(${x * 60}px,${y * 60}px)`;
      if (orb2.current) orb2.current.style.transform = `translate(${x * -90}px,${y * -70}px)`;
      if (title.current) title.current.style.transform = `translate(${x * 14}px,${y * 10}px)`;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <section
      className="min-h-screen flex items-center justify-center relative overflow-hidden text-center px-6 md:px-10 pt-[120px] pb-20"
      id="hero"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 50% 40%,rgba(13,61,58,.4) 0%,transparent 70%),radial-gradient(ellipse 50% 40% at 85% 20%,rgba(201,168,76,.05) 0%,transparent 60%),linear-gradient(180deg,var(--navy-dd) 0%,var(--navy-d) 100%)",
        }}
      />
      <div ref={orb1} className="absolute orb-anim" style={{ transition: "transform .4s ease-out" }}>
        <div
          className="rounded-full"
          style={{ width: 420, height: 420, background: "rgba(13,61,58,.4)", marginTop: "-30vh", marginLeft: "-30vw", filter: "blur(70px)" }}
        />
      </div>
      <div ref={orb2} className="absolute orb-anim" style={{ transition: "transform .4s ease-out" }}>
        <div
          className="rounded-full"
          style={{ width: 320, height: 320, background: "rgba(201,168,76,.07)", marginTop: "30vh", marginLeft: "30vw", filter: "blur(70px)" }}
        />
      </div>

      {/* Ozdobny obracający się pierścień za tytułem */}
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          width: "min(560px,90vw)",
          height: "min(560px,90vw)",
          border: "1px solid rgba(201,168,76,.08)",
          borderRadius: "50%",
          boxShadow: "inset 0 0 80px rgba(201,168,76,.04)",
          animation: "spin 60s linear infinite",
        }}
      />


      <div className="relative z-[2] max-w-[820px]">
        <div
          className="font-serif text-[11px] tracking-[6px] mb-6 flex items-center justify-center gap-[14px]"
          style={{ color: "var(--gold)", animation: "fadeUp .8s .2s both" }}
        >
          <span style={{ width: 40, height: 1, background: "linear-gradient(90deg,transparent,var(--gold))" }} />
          {t.hero.eyebrow}
          <span style={{ width: 40, height: 1, background: "linear-gradient(90deg,var(--gold),transparent)" }} />
        </div>

        <h1 ref={title} className="font-display font-black leading-[.95] mb-6" style={{ letterSpacing: 4, animation: "fadeUp .8s .4s both", transition: "transform .3s ease-out" }}>
          <span
            className="block shimmer"
            style={{
              fontSize: "clamp(52px,10vw,108px)",
              background: "linear-gradient(135deg,#fff 0%,var(--gold-ll) 40%,var(--gold) 70%,var(--gold-d) 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 30px rgba(201,168,76,.3))",
            }}
          >
            MYSTERIUM
          </span>
          <span
            className="block"
            style={{
              fontSize: "clamp(23px,4.5vw,48px)",
              letterSpacing: 12,
              background: "linear-gradient(90deg,var(--muted),var(--text),var(--muted))",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {t.hero.subtitle}
          </span>
        </h1>

        {/* Emblemat: zamek — klucz wchodzi w dziurkę i się przekręca */}
        <div className="mx-auto mb-7 flex items-center justify-center gap-3" style={{ height: 96, animation: "fadeUp .8s .5s both" }}>
          <span aria-hidden style={{ width: 70, height: 1, background: "linear-gradient(90deg,transparent,var(--gold))" }} />
          <div className="hero-lock" aria-hidden>
            <div className="hero-kh-glow" />
            <svg className="hero-keyhole" viewBox="0 0 100 140" fill="none">
              <circle cx="50" cy="46" r="28" stroke="var(--gold)" strokeWidth="5" />
              <path d="M50 70 L64 122 H36 Z" stroke="var(--gold)" strokeWidth="5" strokeLinejoin="round" />
              <circle cx="50" cy="46" r="12" fill="rgba(201,168,76,.14)" />
            </svg>
            <svg className="hero-key" viewBox="0 0 40 110" fill="none">
              <circle cx="20" cy="16" r="13" stroke="var(--gold-l)" strokeWidth="5" />
              <circle cx="20" cy="16" r="4" fill="var(--gold-l)" />
              <rect x="17" y="28" width="6" height="64" fill="var(--gold-l)" />
              <rect x="23" y="74" width="9" height="5" fill="var(--gold-l)" />
              <rect x="23" y="84" width="6" height="5" fill="var(--gold-l)" />
              <path d="M17 92 L23 92 L20 100 Z" fill="var(--gold-l)" />
            </svg>
          </div>
          <span aria-hidden style={{ width: 70, height: 1, background: "linear-gradient(90deg,var(--gold),transparent)" }} />
        </div>

        <p className="mx-auto mb-12 text-[17px] leading-[1.9] max-w-[580px]" style={{ color: "var(--muted)", animation: "fadeUp .8s .6s both" }}>
          {desc}
        </p>

        <div className="flex gap-[10px] flex-wrap justify-center mb-8" style={{ animation: "fadeUp .8s .7s both" }}>
          {tags.map((tag) => (
            <span key={tag} className="font-serif text-[9px] tracking-[2px] uppercase px-[14px] py-1" style={{ border: "1px solid rgba(201,168,76,.25)", background: "rgba(201,168,76,.05)", color: "var(--muted)" }}>
              {tag}
            </span>
          ))}
        </div>

        <div className="flex gap-4 justify-center flex-wrap" style={{ animation: "fadeUp .8s .8s both" }}>
          <a href={`/${locale}/rezerwacja`} className="btn-gold">
            {t.hero.bookNow}
          </a>
          <a href={`/${locale}/pokoje`} className="btn-outline">
            {t.hero.exploreRooms}
          </a>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center" style={{ animation: "fadeUp .8s 1.5s both" }}>
        <div className="font-serif text-[9px] tracking-[4px] mb-[10px]" style={{ color: "var(--dim)" }}>
          {t.hero.scroll}
        </div>
        <div className="mx-auto" style={{ width: 1, height: 50, background: "linear-gradient(180deg,var(--gold),transparent)", animation: "scrollLine 2s ease-in-out infinite" }} />
      </div>
    </section>
  );
}
