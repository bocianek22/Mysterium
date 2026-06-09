"use client";
import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

export default function RoomGallery({ images }: { images: string[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const close = useCallback(() => setIndex(null), []);
  const prev = useCallback(() => setIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length)), [images.length]);
  const next = useCallback(() => setIndex((i) => (i === null ? i : (i + 1) % images.length)), [images.length]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (index === null) return;
    const html = document.documentElement;
    const body = document.body;
    const ph = html.style.overflow;
    const pb = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      html.style.overflow = ph;
      body.style.overflow = pb;
      window.removeEventListener("keydown", onKey);
    };
  }, [index, close, prev, next]);

  if (images.length === 0) return null;

  const overlay = index === null ? null : (
    <div
      onClick={close}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-6"
      style={{ background: "rgba(0,0,0,.92)", backdropFilter: "blur(6px)", animation: "lbIn .25s ease", overscrollBehavior: "contain", touchAction: "none" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={images[index]} alt="" onClick={(e) => e.stopPropagation()} className="max-w-full max-h-[85vh] object-contain" style={{ animation: "lbZoom .3s cubic-bezier(.16,1,.3,1)" }} />
      <button onClick={(e) => { e.stopPropagation(); close(); }} className="absolute top-4 right-5 w-12 h-12 flex items-center justify-center text-4xl leading-none rounded-full" style={{ color: "var(--gold)", background: "rgba(4,12,20,.6)", border: "1px solid var(--border)" }} aria-label="Zamknij">×</button>
      {images.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-3xl rounded-full" style={{ color: "var(--gold)", border: "1px solid var(--border)", background: "rgba(4,12,20,.5)" }} aria-label="Poprzednie">‹</button>
          <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-3xl rounded-full" style={{ color: "var(--gold)", border: "1px solid var(--border)", background: "rgba(4,12,20,.5)" }} aria-label="Następne">›</button>
          <div className="absolute top-6 left-6 font-serif text-xs tracking-[2px]" style={{ color: "var(--muted)" }}>{index + 1} / {images.length}</div>
        </>
      )}
    </div>
  );

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-[3px]">
        {images.map((url, i) => (
          <button key={i} onClick={() => setIndex(i)} className="group relative overflow-hidden aspect-square cursor-pointer reveal reveal-scale">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="Mysterium" loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <span className="absolute inset-0 transition-all duration-300 group-hover:bg-[rgba(201,168,76,.08)]" style={{ border: "1px solid rgba(201,168,76,.06)" }} />
          </button>
        ))}
      </div>
      {mounted && overlay ? createPortal(overlay, document.body) : null}
    </>
  );
}
