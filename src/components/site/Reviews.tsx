import type { Review } from "@prisma/client";
import type { Locale, Dict } from "@/lib/i18n";
import { pick } from "@/lib/i18n";
import SectionHeader from "./SectionHeader";

export default function Reviews({
  locale,
  t,
  reviews,
}: {
  locale: Locale;
  t: Dict;
  reviews: Review[];
}) {
  if (reviews.length === 0) return null;
  return (
    <section
      className="px-6 md:px-[60px] py-20 md:py-[120px] relative z-[1]"
      id="opinie"
      style={{ background: "linear-gradient(135deg,var(--teal-m) 0%,var(--navy-dd) 100%)" }}
    >
      <SectionHeader label={t.reviews.label} title={t.reviews.title} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-[1100px] mx-auto mt-[60px]">
        {reviews.map((r) => (
          <div
            key={r.id}
            className="relative px-7 py-8 transition-all hover:-translate-y-1"
            style={{ background: "rgba(13,27,42,.7)", border: "1px solid var(--border)" }}
          >
            <div className="absolute top-4 right-5 font-display text-[56px] leading-none" style={{ color: "rgba(201,168,76,.06)" }}>
              &quot;
            </div>
            <div className="text-base tracking-[2px] mb-[14px]">{"⭐".repeat(Math.max(1, Math.min(5, r.rating)))}</div>
            <div className="font-serif italic text-sm leading-[1.8] mb-5" style={{ color: "var(--muted)" }}>
              {pick(r, "text", locale)}
            </div>
            <div className="font-serif text-[11px] tracking-[2px]" style={{ color: "var(--gold)" }}>
              {r.authorName}
            </div>
            {pick(r, "event", locale) && (
              <div className="text-xs mt-[3px]" style={{ color: "var(--dim)" }}>
                {pick(r, "event", locale)}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
