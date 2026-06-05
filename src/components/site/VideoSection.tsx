"use client";
import { useState } from "react";
import type { Video } from "@prisma/client";
import type { Locale, Dict } from "@/lib/i18n";
import { pick } from "@/lib/i18n";
import SectionHeader from "./SectionHeader";

function VideoPlayer({ video, locale }: { video: Video; locale: Locale }) {
  const [active, setActive] = useState(false);
  const title = pick(video, "title", locale);

  if (active) {
    if (video.type === "FILE" && video.fileUrl) {
      return (
        <video controls autoPlay playsInline className="w-full h-full object-cover" style={{ display: "block" }}>
          <source src={video.fileUrl} type="video/mp4" />
        </video>
      );
    }
    if (video.youtubeId) {
      return (
        <iframe
          src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
          allow="autoplay; fullscreen"
          allowFullScreen
          className="w-full h-full border-0 block"
          title={title}
        />
      );
    }
  }

  const thumb =
    video.thumbnail ||
    (video.youtubeId ? `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg` : null);

  return (
    <button
      onClick={() => setActive(true)}
      className="w-full h-full relative flex flex-col items-center justify-center gap-3 cursor-pointer"
      style={{
        background: thumb ? `url(${thumb}) center/cover` : "linear-gradient(135deg,var(--teal-m),var(--navy))",
      }}
      aria-label={title}
    >
      <span className="absolute inset-0" style={{ background: "rgba(4,12,20,.45)" }} />
      <span
        className="relative w-16 h-16 rounded-full flex items-center justify-center"
        style={{ background: "rgba(201,168,76,.9)", color: "var(--navy-dd)" }}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
      <span className="relative font-serif text-[11px] tracking-[2px] uppercase text-white">{title}</span>
    </button>
  );
}

export default function VideoSection({
  locale,
  t,
  videos,
}: {
  locale: Locale;
  t: Dict;
  videos: Video[];
}) {
  if (videos.length === 0) return null;
  const [main, ...rest] = videos;

  return (
    <section className="px-6 md:px-[60px] py-20 md:py-[120px] relative z-[1]" id="film" style={{ background: "var(--navy-d)" }}>
      <div className="max-w-[1000px] mx-auto">
        <SectionHeader label={t.video.label} title={t.video.title} center />
        <div className="corner-frame aspect-video w-full overflow-hidden reveal reveal-scale" style={{ border: "1px solid var(--border)" }}>
          <VideoPlayer video={main} locale={locale} />
        </div>
        {rest.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-[3px] mt-[3px]">
            {rest.map((v) => (
              <div key={v.id} className="aspect-video overflow-hidden">
                <VideoPlayer video={v} locale={locale} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
