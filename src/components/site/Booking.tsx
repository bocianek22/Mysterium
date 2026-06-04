import type { Dict } from "@/lib/i18n";

export default function Booking({ t, lockmeUrl }: { t: Dict; lockmeUrl: string }) {
  return (
    <section
      className="px-6 md:px-[60px] py-20 md:py-[100px] relative z-[1]"
      id="rezerwacja"
      style={{ background: "linear-gradient(135deg,var(--teal-m),var(--navy-dd))" }}
    >
      <div className="text-center mb-12">
        <div className="sec-label">{t.booking.label}</div>
        <h2 className="sec-title text-gold-grad">{t.booking.title}</h2>
        <div className="sec-divider" style={{ margin: "20px auto 30px" }} />
      </div>
      <div
        className="corner-frame max-w-[900px] mx-auto p-8 md:p-[50px] text-center"
        style={{ border: "1px solid var(--border)", background: "rgba(201,168,76,.02)" }}
      >
        <a href={lockmeUrl} target="_blank" rel="noopener noreferrer" className="btn-gold">
          {t.booking.cta}
        </a>
        <p className="font-serif text-[11px] tracking-[2px] mt-4" style={{ color: "var(--dim)" }}>
          {t.booking.powered}
        </p>
      </div>
    </section>
  );
}
