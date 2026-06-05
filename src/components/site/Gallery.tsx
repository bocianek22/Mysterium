"use client";
import { useState, useEffect, useCallback } from "react";
import type { GalleryImage } from "@prisma/client";
import type { Locale, Dict } from "@/lib/i18n";
import { pick } from "@/lib/i18n";
import SectionHeader from "./SectionHeader";

export default function Gallery({
  locale,
  t,
  images,
}: {
  locale: Locale;
  t: Dict;
  images: GalleryImage[];
}) {
  const [index, setIndex] = useState<number | null>(null);

  const close = useCallback(() => setIndex(null), []);
  const prev = useCallback(
    () => setIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length)),
    [images.length]
  );
  const next = useCallback(
    () => setIndex((i) => (i === null ? i : (i + 1) % images.length)),
    [images.length]
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [index, close, prev, next]);

  if (images.length === 0) return null;
  const current = index !== null ? images[index] : null;

  return (
    <section className="px-6 md:px-[60px] py-20 md:py-[120px] relative z-[1]" id="galeria" style={{ background: "var(--navy-dd)" }}>
      <SectionHeader label={t.gallery.label} title={t.gallery.title} />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-[3px] max-w-[1200px] mx-auto mt-[60px]">
        {images.map((img, i) => (
          <button
            key={img.id}
            onClick={() => setIndex(i)}
            className={`group relative overflow-hidden cursor-pointer aspect-square reveal reveal-scale reveal-d${(i % 6) + 1}`}
            style={i === 0 ? { gridRow: "span 2", aspectRatio: "auto" } : undefined}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.url}
              alt={pick(img, "caption", locale) || "Mysterium escape room"}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <span className="absolute inset-0 transition-all duration-300 group-hover:bg-[rgba(201,168,76,.08)]" style={{ border: "1px solid rgba(201,168,76,.06)" }} />
            <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-2xl" style={{ color: "var(--gold-ll)", textShadow: "0 2px 12px #000" }}>
              ⌕
            </span>
            {pick(img, "caption", locale) && (
              <span className="absolute bottom-0 left-0 right-0 px-3 py-2 text-[11px] font-serif tracking-[1px] translate-y-full group-hover:translate-y-0 transition-transform duration-300" style={{ color: "var(--text)", background: "linear-gradient(0deg,rgba(4,12,20,.9),transparent)" }}>
                {pick(img, "caption", locale)}
              </span>
            )}
          </button>
        ))}
      </div>

      {current && (
        <div
          onClick={close}
          className="fixed inset-0 z-[9000] flex items-center justify-center p-6"
          style={{ background: "rgba(0,0,0,.92)", backdropFilter: "blur(6px)", animation: "lbIn .25s ease" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.url}
            alt={pick(current, "caption", locale) || ""}
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-[85vh] object-contain"
            style={{ animation: "lbZoom .3s cubic-bezier(.16,1,.3,1)", boxShadow: "0 30px 80px rgba(0,0,0,.6)" }}
          />
          {pick(current, "caption", locale) && (
            <div className="absolute bottom-6 left-0 right-0 text-center font-serif text-sm tracking-[1px]" style={{ color: "var(--gold-l)" }}>
              {pick(current, "caption", locale)}
            </div>
          )}
          <button onClick={close} className="absolute top-5 right-6 text-4xl leading-none" style={{ color: "var(--gold)" }} aria-label="Zamknij">
            ×
          </button>
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-3xl rounded-full transition-colors"
                style={{ color: "var(--gold)", border: "1px solid var(--border)", background: "rgba(4,12,20,.5)" }}
                aria-label="Poprzednie"
              >
                ‹
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-3xl rounded-full transition-colors"
                style={{ color: "var(--gold)", border: "1px solid var(--border)", background: "rgba(4,12,20,.5)" }}
                aria-label="Następne"
              >
                ›
              </button>
              <div className="absolute top-6 left-6 font-serif text-xs tracking-[2px]" style={{ color: "var(--muted)" }}>
                {index! + 1} / {images.length}
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
