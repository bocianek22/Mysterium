export default function PageHero({
  label,
  title,
  subtitle,
}: {
  label: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="relative overflow-hidden text-center px-6 md:px-10 pt-[150px] pb-12 md:pb-16">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 0%,rgba(13,61,58,.45) 0%,transparent 70%),linear-gradient(180deg,var(--navy-dd),var(--navy-d))",
        }}
      />
      <div className="relative z-[1]">
        <div className="font-serif text-[11px] tracking-[6px] uppercase mb-4 flex items-center justify-center gap-[14px]" style={{ color: "var(--gold)" }}>
          <span style={{ width: 40, height: 1, background: "linear-gradient(90deg,transparent,var(--gold))" }} />
          {label}
          <span style={{ width: 40, height: 1, background: "linear-gradient(90deg,var(--gold),transparent)" }} />
        </div>
        <h1 className="font-display text-gold-grad shimmer font-bold" style={{ fontSize: "clamp(34px,6vw,64px)", lineHeight: 1.05 }}>
          {title}
        </h1>
        {subtitle && (
          <p className="mx-auto mt-5 text-base md:text-[17px] leading-[1.9] max-w-[600px]" style={{ color: "var(--muted)" }}>
            {subtitle}
          </p>
        )}
        <div className="mx-auto mt-7" style={{ width: 120, height: 1, background: "linear-gradient(90deg,transparent,var(--gold),transparent)" }} />
      </div>
    </section>
  );
}
