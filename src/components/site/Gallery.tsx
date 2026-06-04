"use client";
import { useState } from "react";
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
  const [lightbox, setLightbox] = useState<string | null>(null);
  if (images.length === 0) return null;

  return (
    <section className="px-6 md:px-[60px] py-20 md:py-[120px] relative z-[1]" id="galeria" style={{ background: "var(--navy-dd)" }}>
      <SectionHeader label={t.gallery.label} title={t.gallery.title} />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-[3px] max-w-[1200px] mx-auto mt-[60px]">
        {images.map((img, i) => (
          <button
            key={img.id}
            onClick={() => setLightbox(img.url)}
            className="group relative overflow-hidden cursor-pointer aspect-square"
            style={i === 0 ? { gridRow: "span 2", aspectRatio: "auto" } : undefined}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.url}
              alt={pick(img, "caption", locale) || "Mysterium"}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span className="absolute inset-0 transition-colors" style={{ border: "1px solid rgba(201,168,76,.06)" }} />
          </button>
        ))}
      </div>

      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-[9000] flex items-center justify-center p-6"
          style={{ background: "rgba(0,0,0,.9)", backdropFilter: "blur(4px)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox} alt="" className="max-w-full max-h-full object-contain" />
          <button className="absolute top-6 right-6 text-3xl" style={{ color: "var(--gold)" }} aria-label="Close">
            ×
          </button>
        </div>
      )}
    </section>
  );
}
