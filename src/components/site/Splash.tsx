"use client";
import { useEffect, useState } from "react";

export default function Splash({ label }: { label: string }) {
  const [show, setShow] = useState(false);
  const [hide, setHide] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("mysterium_splash")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      sessionStorage.setItem("mysterium_splash", "1");
      return;
    }
    sessionStorage.setItem("mysterium_splash", "1");
    setShow(true);
    const t1 = setTimeout(() => setHide(true), 2000);
    const t2 = setTimeout(() => setShow(false), 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center"
      style={{ background: "var(--navy-dd)", transition: "opacity .6s ease", opacity: hide ? 0 : 1, pointerEvents: hide ? "none" : "all" }}
      aria-hidden
    >
      <div className="hero-lock splash-lock" style={{ transform: "scale(0.9)" }}>
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
      <div className="font-display text-gold-grad text-2xl mt-2" style={{ letterSpacing: 4 }}>MYSTERIUM</div>
      <div className="font-serif text-[10px] tracking-[3px] uppercase mt-2" style={{ color: "var(--muted)" }}>{label}</div>
    </div>
  );
}
