"use client";
import { useEffect, useRef } from "react";

export default function Particles() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || el.childElementCount > 0) return;
    for (let i = 0; i < 20; i++) {
      const p = document.createElement("div");
      p.className = "pt";
      p.style.left = `${Math.random() * 100}%`;
      p.style.animationDuration = `${10 + Math.random() * 15}s`;
      p.style.animationDelay = `${Math.random() * 12}s`;
      el.appendChild(p);
    }
  }, []);
  return (
    <div
      ref={ref}
      aria-hidden
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1 }}
    />
  );
}
