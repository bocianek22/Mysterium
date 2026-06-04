import type { Dict } from "@/lib/i18n";
import LockmeWidget from "./LockmeWidget";

export default function Booking({
  t,
  lockmeUrl,
  widget,
}: {
  t: Dict;
  lockmeUrl: string;
  widget?: string | null;
}) {
  const hasWidget = !!widget && widget.trim().length > 0;
  return (
    <section
      className="px-6 md:px-[60px] py-20 md:py-[100px] relative z-[1] aurora"
      id="rezerwacja"
      style={{ background: "linear-gradient(135deg,var(--teal-m),var(--navy-dd))" }}
    >
      <div className="relative z-[1]">
        <div className="text-center mb-12">
          <div className="sec-label reveal">{t.booking.label}</div>
          <h2 className="sec-title text-gold-grad shimmer reveal reveal-d1">{t.booking.title}</h2>
          <div className="sec-divider reveal reveal-d2" style={{ margin: "20px auto 30px" }} />
        </div>
        <div
          className="corner-frame max-w-[960px] mx-auto p-5 md:p-8 reveal reveal-scale"
          style={{ border: "1px solid var(--border)", background: "rgba(201,168,76,.02)" }}
        >
          {hasWidget ? (
            <>
              <LockmeWidget code={widget!} />
              <div className="text-center mt-6">
                <a href={lockmeUrl} target="_blank" rel="noopener noreferrer" className="font-serif text-[11px] tracking-[2px]" style={{ color: "var(--gold-l)" }}>
                  {t.booking.cta} ↗
                </a>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <a href={lockmeUrl} target="_blank" rel="noopener noreferrer" className="btn-gold">
                {t.booking.cta}
              </a>
              <p className="font-serif text-[11px] tracking-[2px] mt-4" style={{ color: "var(--dim)" }}>
                {t.booking.powered}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
