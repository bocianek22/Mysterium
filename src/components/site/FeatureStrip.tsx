import type { Dict } from "@/lib/i18n";

export default function FeatureStrip({ t }: { t: Dict }) {
  return (
    <section className="px-6 md:px-[60px] py-10 md:py-12 relative z-[1]" style={{ background: "var(--navy-dd)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
      <div className="max-w-[1100px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-[1px]" style={{ background: "var(--border)" }}>
        {t.features.map((f, i) => (
          <div key={i} className={`flex flex-col items-center text-center gap-2 px-4 py-6 reveal reveal-d${i + 1}`} style={{ background: "var(--navy-dd)" }}>
            <span className="text-3xl">{f.icon}</span>
            <span className="font-serif text-[12px] tracking-[2px] uppercase" style={{ color: "var(--gold)" }}>{f.title}</span>
            <span className="text-[13px] leading-[1.5]" style={{ color: "var(--muted)" }}>{f.desc}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
