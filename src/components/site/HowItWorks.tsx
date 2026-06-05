import type { Dict } from "@/lib/i18n";
import SectionHeader from "./SectionHeader";

export default function HowItWorks({ t }: { t: Dict }) {
  return (
    <section
      className="px-6 md:px-[60px] py-20 md:py-[120px] relative z-[1]"
      id="jak-to-dziala"
      style={{ background: "var(--navy-dd)" }}
    >
      <SectionHeader label={t.how.label} title={t.how.title} />
      <p className="text-base leading-[1.9] max-w-[580px] reveal" style={{ color: "var(--muted)" }}>
        {t.how.text}
      </p>
      <div
        className="grid grid-cols-2 lg:grid-cols-4 gap-[1px] max-w-[1100px] mx-auto mt-[60px]"
        style={{ background: "var(--border)" }}
      >
        {t.how.steps.map((step, i) => (
          <div
            key={i}
            className={`group relative overflow-hidden px-7 py-10 transition-all duration-500 hover:bg-[rgba(13,61,58,.35)] reveal reveal-d${i + 1}`}
            style={{ background: "var(--navy-dd)" }}
          >
            <span className="absolute top-0 left-0 right-0 h-[2px] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" style={{ background: "linear-gradient(90deg,transparent,var(--gold),transparent)" }} />
            <div className="font-display font-black text-[56px] leading-none mb-4 transition-colors duration-500 group-hover:text-[rgba(201,168,76,.2)]" style={{ color: "rgba(201,168,76,.08)" }}>
              {String(i + 1).padStart(2, "0")}
            </div>
            <span className="text-[32px] mb-[14px] block transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-1">{step.icon}</span>
            <div className="font-serif text-sm tracking-[2px] uppercase mb-[10px]" style={{ color: "var(--gold)" }}>
              {step.title}
            </div>
            <div className="text-sm leading-[1.8]" style={{ color: "var(--muted)" }}>
              {step.desc}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
