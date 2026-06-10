"use client";
import { useEffect, useRef } from "react";
import type { Locale, Dict } from "@/lib/i18n";
import { addressCity, addressShort } from "@/lib/address";

export default function Hero({
  locale,
  t,
  desc,
  address,
}: {
  locale: Locale;
  t: Dict;
  desc: string;
  address?: string;
}) {
  const city = addressCity(address);
  const eyebrow = city ? `${t.hero.eyebrow} · ${city}` : t.hero.eyebrow;
  const tags = [t.hero.tagOnsite, t.hero.tagMobile, addressShort(address) || t.hero.tagLocation];
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
      <div ref={orb1} className="absolute orb-anim hidden md:block" style={{ transition: "transform .4s ease-out" }}>
        <div
          className="rounded-full"
          style={{ width: 420, height: 420, background: "rgba(13,61,58,.4)", marginTop: "-30vh", marginLeft: "-30vw", filter: "blur(70px)" }}
        />
      </div>
      <div ref={orb2} className="absolute orb-anim hidden md:block" style={{ transition: "transform .4s ease-out" }}>
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
          {eyebrow}
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
        <div className="mx-auto mb-6 flex items-center justify-center gap-4" style={{ height: 124, animation: "fadeUp .8s .5s both" }}>
          <span aria-hidden style={{ width: 70, height: 1, background: "linear-gradient(90deg,transparent,var(--gold))" }} />
          <div className="lock-box" style={{ width: 70, height: 120 }} aria-hidden>
            <div className="hero-lock" style={{ transform: "scale(0.5)" }}>
              <div className="hero-kh-glow" />
              <svg className="hero-keyhole" viewBox="0 0 100 140" fill="none">
                <defs>
                  <linearGradient id="hkh" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#F5E4B0" /><stop offset=".5" stopColor="#C9A84C" /><stop offset="1" stopColor="#8B6914" />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="46" r="30" stroke="url(#hkh)" strokeWidth="6" />
                <path d="M50 72 L66 126 H34 Z" stroke="url(#hkh)" strokeWidth="6" strokeLinejoin="round" />
                <circle cx="50" cy="46" r="13" fill="rgba(201,168,76,.16)" />
              </svg>
              <svg className="hero-key" viewBox="0 0 48 150" fill="none">
                <defs>
                  <linearGradient id="hk" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#F5E4B0" /><stop offset=".55" stopColor="#E8C97A" /><stop offset="1" stopColor="#C9A84C" />
                  </linearGradient>
                </defs>
                <circle cx="24" cy="22" r="17" stroke="url(#hk)" strokeWidth="6" />
                <circle cx="24" cy="22" r="6.5" fill="url(#hk)" />
                <circle cx="24" cy="6" r="3.2" fill="url(#hk)" />
                <rect x="20.5" y="40" width="7" height="86" rx="2" fill="url(#hk)" />
                <rect x="27.5" y="104" width="13" height="6" rx="1" fill="url(#hk)" />
                <rect x="27.5" y="116" width="9" height="6" rx="1" fill="url(#hk)" />
                <path d="M20.5 126 L27.5 126 L24 136 Z" fill="url(#hk)" />
              </svg>
            </div>
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

    </section>
  );
}
