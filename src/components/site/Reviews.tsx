import type { Review } from "@prisma/client";
import type { Locale, Dict } from "@/lib/i18n";
import { pick } from "@/lib/i18n";
import SectionHeader from "./SectionHeader";

function GoogleG() {
  return (
    <svg width="14" height="14" viewBox="0 0 48 48" aria-hidden>
      <path fill="#4285F4" d="M45 24c0-1.5-.1-2.9-.4-4.3H24v8.1h11.8c-.5 2.8-2 5.1-4.4 6.7v5.6h7.1C42.7 36.4 45 30.7 45 24z" />
      <path fill="#34A853" d="M24 46c5.9 0 10.9-2 14.5-5.3l-7.1-5.6c-2 1.3-4.5 2.1-7.4 2.1-5.7 0-10.5-3.8-12.2-9H4.5v5.7C8.1 41.1 15.4 46 24 46z" />
      <path fill="#FBBC05" d="M11.8 28.2c-.4-1.3-.7-2.7-.7-4.2s.2-2.9.7-4.2v-5.7H4.5C3 17.1 2.2 20.4 2.2 24s.8 6.9 2.3 9.9l7.3-5.7z" />
      <path fill="#EA4335" d="M24 10.8c3.2 0 6.1 1.1 8.4 3.3l6.3-6.3C34.9 4.1 29.9 2 24 2 15.4 2 8.1 6.9 4.5 14.1l7.3 5.7c1.7-5.2 6.5-9 12.2-9z" />
    </svg>
  );
}

export default function Reviews({
  locale,
  t,
  reviews,
  googleUrl,
  googleRating,
}: {
  locale: Locale;
  t: Dict;
  reviews: Review[];
  googleUrl?: string | null;
  googleRating?: string | null;
}) {
  if (reviews.length === 0 && !googleUrl) return null;
  return (
    <section
      className="px-6 md:px-[60px] py-20 md:py-[120px] relative z-[1]"
      id="opinie"
      style={{ background: "linear-gradient(135deg,var(--teal-m) 0%,var(--navy-dd) 100%)" }}
    >
      <SectionHeader label={t.reviews.label} title={t.reviews.title} />

      {googleUrl && (
        <a
          href={googleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="reveal inline-flex items-center gap-3 px-5 py-3 rounded no-underline mb-2"
          style={{ background: "rgba(13,27,42,.7)", border: "1px solid var(--border)" }}
        >
          <GoogleG />
          <span className="text-sm" style={{ color: "var(--text)" }}>
            {googleRating ? <><b style={{ color: "var(--gold)" }}>{googleRating}</b> · </> : null}
            {locale === "pl" ? "Zobacz nasze opinie w Google" : "See our Google reviews"} ↗
          </span>
        </a>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-[1100px] mx-auto mt-[40px]">
        {reviews.map((r, i) => (
          <div
            key={r.id}
            className={`relative px-7 py-8 transition-all duration-500 hover:-translate-y-[6px] glow-hover reveal reveal-d${(i % 3) + 1}`}
            style={{ background: "rgba(13,27,42,.7)", border: "1px solid var(--border)" }}
          >
            <div className="absolute top-4 right-5 font-display text-[56px] leading-none" style={{ color: "rgba(201,168,76,.06)" }}>
              &quot;
            </div>
            <div className="text-base tracking-[2px] mb-[14px]">{"⭐".repeat(Math.max(1, Math.min(5, r.rating)))}</div>
            <div className="font-serif italic text-sm leading-[1.8] mb-5" style={{ color: "var(--muted)" }}>
              {pick(r, "text", locale)}
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-serif text-[11px] tracking-[2px]" style={{ color: "var(--gold)" }}>
                  {r.authorName}
                </div>
                {pick(r, "event", locale) && (
                  <div className="text-xs mt-[3px]" style={{ color: "var(--dim)" }}>
                    {pick(r, "event", locale)}
                  </div>
                )}
              </div>
              {(r as any).source === "GOOGLE" && (
                <span className="flex items-center gap-1 text-[10px] px-2 py-1 rounded" style={{ background: "rgba(255,255,255,.05)", color: "var(--muted)" }} title="Opinia z Google">
                  <GoogleG /> Google
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
