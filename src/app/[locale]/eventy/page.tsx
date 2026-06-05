import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, getDict, type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { pageMeta } from "@/lib/seo";
import PageHero from "@/components/site/PageHero";
import QuoteForm from "@/components/site/QuoteForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const locale = params.locale as Locale;
  return pageMeta({
    locale,
    title: locale === "pl" ? "Eventy firmowe i integracje" : "Corporate events & team building",
    description: locale === "pl" ? "Escape room dla firm w Nowym Dworze Mazowieckim lub z dojazdem. Integracje, team building, eventy." : "Escape room for companies in Nowy Dwór Mazowiecki or on-site at your place. Team building and events.",
    path: "/eventy",
  });
}

export default async function EventsPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  const pl = locale === "pl";
  const settings = await prisma.siteSettings.findUnique({ where: { id: "main" } });
  const whatsapp = settings?.whatsapp || "48571080192";

  const benefits = pl
    ? [
        { icon: "🤝", title: "Integracja zespołu", desc: "Wspólne rozwiązywanie zagadek buduje zaufanie i współpracę." },
        { icon: "🧠", title: "Komunikacja pod presją", desc: "60 minut, w których liczy się każdy pomysł i dobra organizacja." },
        { icon: "🎯", title: "Rywalizacja", desc: "Kilka grup, ranking czasów i zdrowa dawka adrenaliny." },
        { icon: "🎭", title: "Mocny klimat", desc: "Mroczna „Pułapka” — skrzynia mordercy, której się nie zapomina." },
      ]
    : [
        { icon: "🤝", title: "Team integration", desc: "Solving puzzles together builds trust and cooperation." },
        { icon: "🧠", title: "Communication under pressure", desc: "60 minutes where every idea and good organisation counts." },
        { icon: "🎯", title: "Friendly rivalry", desc: "Several groups, a time ranking and a healthy dose of adrenaline." },
        { icon: "🎭", title: "Strong atmosphere", desc: "The dark 'Trap' — a murderer's chest you won't forget." },
      ];

  const formats = pl
    ? [
        { icon: "🏠", title: "U nas — stacjonarnie", desc: "Zapraszamy do Nowego Dworu Mazowieckiego (ul. Warszawska 40). Idealne dla mniejszych grup." },
        { icon: "🚐", title: "U Was — z dojazdem", desc: "Mobilna „Pułapka” przyjeżdża do biura, na salę czy plener. Obsłużymy nawet większą firmę w turach." },
      ]
    : [
        { icon: "🏠", title: "At our place", desc: "Visit us in Nowy Dwór Mazowiecki (Warszawska 40). Perfect for smaller groups." },
        { icon: "🚐", title: "At your place", desc: "The mobile 'Trap' comes to your office or venue. We can handle a larger company in rounds." },
      ];

  return (
    <>
      <PageHero
        label={pl ? "Dla firm" : "For business"}
        title={pl ? "Eventy firmowe i integracje" : "Corporate events & team building"}
        subtitle={pl ? "Mocne wrażenia dla Twojego zespołu — u nas na miejscu lub z dojazdem do Was." : "Strong experiences for your team — at our place or delivered to you."}
      />

      <section className="px-6 md:px-[60px] py-12 md:py-16 relative z-[1]" style={{ background: "var(--navy-dd)" }}>
        <div className="max-w-[1000px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[1px]" style={{ background: "var(--border)" }}>
            {benefits.map((b, i) => (
              <div key={i} className={`px-6 py-8 text-center reveal reveal-d${i + 1}`} style={{ background: "var(--navy-dd)" }}>
                <div className="text-4xl mb-3">{b.icon}</div>
                <div className="font-serif text-[12px] tracking-[2px] uppercase mb-2" style={{ color: "var(--gold)" }}>{b.title}</div>
                <div className="text-[13px] leading-[1.6]" style={{ color: "var(--muted)" }}>{b.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 md:px-[60px] py-12 md:py-16 relative z-[1] aurora" style={{ background: "linear-gradient(135deg,var(--teal-m),var(--navy-dd))" }}>
        <div className="relative z-[1] max-w-[1000px] mx-auto">
          <div className="sec-label reveal">{pl ? "Dwie formuły" : "Two formats"}</div>
          <h2 className="sec-title text-gold-grad shimmer reveal reveal-d1">{pl ? "Jak to robimy" : "How we do it"}</h2>
          <div className="sec-divider reveal reveal-d1" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {formats.map((f, i) => (
              <div key={i} className={`p-7 rounded reveal reveal-d${i + 1}`} style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--border)" }}>
                <div className="text-4xl mb-3">{f.icon}</div>
                <div className="font-display text-xl mb-2" style={{ color: "var(--gold)" }}>{f.title}</div>
                <p className="text-sm leading-[1.7]" style={{ color: "var(--muted)" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 md:px-[60px] py-14 md:py-20 relative z-[1]" style={{ background: "var(--navy-dd)" }}>
        <div className="max-w-[640px] mx-auto">
          <div className="text-center mb-8">
            <div className="sec-label" style={{ marginBottom: 6 }}>{pl ? "Wycena" : "Quote"}</div>
            <h2 className="sec-title text-gold-grad shimmer">{pl ? "Zapytaj o event" : "Ask about an event"}</h2>
            <div className="sec-divider" style={{ margin: "16px auto 0" }} />
          </div>
          <div className="reveal reveal-scale">
            <QuoteForm t={t} offerName={pl ? "Event firmowy" : "Corporate event"} whatsapp={whatsapp} />
          </div>
        </div>
      </section>
    </>
  );
}
