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
    const t1 = setTimeout(() => setHide(true), 2400);
    const t2 = setTimeout(() => setShow(false), 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center"
      style={{ background: "var(--navy-dd)", transition: "opacity .6s ease", opacity: hide ? 0 : 1, pointerEvents: hide ? "none" : "all" }}
      aria-hidden
    >
      <div className="lock-box splash-lock" style={{ width: 112, height: 192 }}>
        <div className="hero-lock" style={{ transform: "scale(0.8)" }}>
          <div className="hero-kh-glow" />
          <svg className="hero-keyhole" viewBox="0 0 100 140" fill="none">
            <defs>
              <linearGradient id="skh" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#F5E4B0" /><stop offset=".5" stopColor="#C9A84C" /><stop offset="1" stopColor="#8B6914" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="46" r="30" stroke="url(#skh)" strokeWidth="6" />
            <path d="M50 72 L66 126 H34 Z" stroke="url(#skh)" strokeWidth="6" strokeLinejoin="round" />
            <circle cx="50" cy="46" r="13" fill="rgba(201,168,76,.16)" />
          </svg>
          <svg className="hero-key" viewBox="0 0 48 150" fill="none">
            <defs>
              <linearGradient id="sk" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#F5E4B0" /><stop offset=".55" stopColor="#E8C97A" /><stop offset="1" stopColor="#C9A84C" />
              </linearGradient>
            </defs>
            <circle cx="24" cy="22" r="17" stroke="url(#sk)" strokeWidth="6" />
            <circle cx="24" cy="22" r="6.5" fill="url(#sk)" />
            <circle cx="24" cy="6" r="3.2" fill="url(#sk)" />
            <rect x="20.5" y="40" width="7" height="86" rx="2" fill="url(#sk)" />
            <rect x="27.5" y="104" width="13" height="6" rx="1" fill="url(#sk)" />
            <rect x="27.5" y="116" width="9" height="6" rx="1" fill="url(#sk)" />
            <path d="M20.5 126 L27.5 126 L24 136 Z" fill="url(#sk)" />
          </svg>
        </div>
      </div>
      <div className="font-display text-gold-grad text-2xl mt-2" style={{ letterSpacing: 4 }}>MYSTERIUM</div>
      <div className="font-serif text-[10px] tracking-[3px] uppercase mt-2" style={{ color: "var(--muted)" }}>{label}</div>
    </div>
  );
}
