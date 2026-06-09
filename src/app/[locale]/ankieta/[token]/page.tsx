import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import PageHero from "@/components/site/PageHero";
import SurveyForm from "@/components/site/SurveyForm";

export const dynamic = "force-dynamic";

export default async function SurveyPage({ params }: { params: { locale: string; token: string } }) {
  if (!isLocale(params.locale)) notFound();
  const pl = params.locale === "pl";
  const survey = await prisma.survey.findUnique({ where: { token: params.token } }).catch(() => null);
  if (!survey) notFound();

  return (
    <>
      <PageHero label={pl ? "Ankieta" : "Survey"} title={pl ? "Jak było?" : "How was it?"} subtitle={pl ? "Zajmie Ci to 30 sekund — dziękujemy!" : "Takes 30 seconds — thank you!"} />
      <section className="px-6 md:px-[60px] py-12 md:py-16 relative z-[1]" style={{ background: "var(--navy-dd)" }}>
        <div className="max-w-[560px] mx-auto">
          {survey.status === "DONE" ? (
            <div className="p-6 rounded text-center" style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--border)" }}>
              <div className="text-4xl mb-2">✓</div>
              <p style={{ color: "var(--muted)" }}>{pl ? "Ta ankieta została już wypełniona. Dziękujemy!" : "This survey has already been completed. Thank you!"}</p>
            </div>
          ) : (
            <SurveyForm token={params.token} />
          )}
        </div>
      </section>
    </>
  );
}
