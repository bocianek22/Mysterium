import type { Locale, Dict } from "@/lib/i18n";

export default function Hero({
  locale,
  t,
  desc,
}: {
  locale: Locale;
  t: Dict;
  desc: string;
}) {
  const tags = [t.hero.tagOnsite, t.hero.tagMobile, t.hero.tagLocation];
  return (
    <section
      className="min-h-screen flex items-center justify-center relative overflow-hidden text-center px-6 md:px-10 pt-[120px] pb-20"
      id="hero"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 50% 40%,rgba(13,61,58,.4) 0%,transparent 70%),radial-gradient(ellipse 50% 40% at 85% 20%,rgba(201,168,76,.05) 0%,transparent 60%),linear-gradient(180deg,var(--navy-dd) 0%,var(--navy-d) 100%)",
        }}
      />
      <div
        className="absolute rounded-full animate-orbDrift"
        style={{ width: 400, height: 400, background: "rgba(13,61,58,.35)", top: "10%", left: -100, filter: "blur(60px)", animationDuration: "12s" }}
      />
      <div
        className="absolute rounded-full animate-orbDrift"
        style={{ width: 300, height: 300, background: "rgba(201,168,76,.06)", bottom: "10%", right: -80, filter: "blur(60px)", animationDuration: "15s", animationDelay: "3s" }}
      />

      <div className="relative z-[2] max-w-[820px]">
        <div
          className="font-serif text-[11px] tracking-[6px] mb-6 flex items-center justify-center gap-[14px]"
          style={{ color: "var(--gold)", animation: "fadeUp .8s .2s both" }}
        >
          <span style={{ width: 40, height: 1, background: "linear-gradient(90deg,transparent,var(--gold))" }} />
          {t.hero.eyebrow}
          <span style={{ width: 40, height: 1, background: "linear-gradient(90deg,var(--gold),transparent)" }} />
        </div>

        <h1 className="font-display font-black leading-[.95] mb-6" style={{ letterSpacing: 4, animation: "fadeUp .8s .4s both" }}>
          <span
            className="block"
            style={{
              fontSize: "clamp(52px,10vw,108px)",
              background: "linear-gradient(135deg,#fff 0%,var(--gold-ll) 40%,var(--gold) 70%,var(--gold-d) 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 30px rgba(201,168,76,.3))",
            }}
          >
            MYSTERIUM
          </span>
          <span
            className="block"
            style={{
              fontSize: "clamp(23px,4.5vw,48px)",
              letterSpacing: 12,
              background: "linear-gradient(90deg,var(--muted),var(--text),var(--muted))",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {t.hero.subtitle}
          </span>
        </h1>

        <div className="mx-auto mb-7" style={{ width: 120, height: 1, background: "linear-gradient(90deg,transparent,var(--gold),transparent)", animation: "fadeUp .8s .5s both" }} />

        <p className="mx-auto mb-12 text-[17px] leading-[1.9] max-w-[580px]" style={{ color: "var(--muted)", animation: "fadeUp .8s .6s both" }}>
          {desc}
        </p>

        <div className="flex gap-[10px] flex-wrap justify-center mb-8">
          {tags.map((tag) => (
            <span key={tag} className="font-serif text-[9px] tracking-[2px] uppercase px-[14px] py-1" style={{ border: "1px solid rgba(201,168,76,.25)", background: "rgba(201,168,76,.05)", color: "var(--muted)" }}>
              {tag}
            </span>
          ))}
        </div>

        <div className="flex gap-4 justify-center flex-wrap" style={{ animation: "fadeUp .8s .8s both" }}>
          <a href={`/${locale}#rezerwacja`} className="btn-gold">
            {t.hero.bookNow}
          </a>
          <a href={`/${locale}#pokoje`} className="btn-outline">
            {t.hero.exploreRooms}
          </a>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center" style={{ animation: "fadeUp .8s 1.5s both" }}>
        <div className="font-serif text-[9px] tracking-[4px] mb-[10px]" style={{ color: "var(--dim)" }}>
          {t.hero.scroll}
        </div>
        <div className="mx-auto" style={{ width: 1, height: 50, background: "linear-gradient(180deg,var(--gold),transparent)", animation: "scrollLine 2s ease-in-out infinite" }} />
      </div>
    </section>
  );
}
