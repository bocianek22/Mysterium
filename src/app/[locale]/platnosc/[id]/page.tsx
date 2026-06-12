import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { zl } from "@/lib/payments";
import PageHero from "@/components/site/PageHero";
import PaymentStart from "@/components/site/PaymentStart";

export const dynamic = "force-dynamic";

export default async function PayPage({ params }: { params: { locale: string; id: string } }) {
  if (!isLocale(params.locale)) notFound();
  const pl = params.locale === "pl";
  const p = await prisma.payment.findUnique({ where: { id: params.id } });
  if (!p) notFound();

  return (
    <>
      <PageHero label={pl ? "Płatność" : "Payment"} title={p.description || (pl ? "Płatność online" : "Online payment")} />
      <section className="px-6 md:px-[60px] pb-24 max-w-[560px] mx-auto text-center">
        <div className="p-8 rounded" style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--border)" }}>
          <div className="font-display text-gold-grad text-4xl mb-2">{zl(p.amount)}</div>
          {p.description && <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>{p.description}</p>}
          {p.status === "PAID" ? (
            <div className="text-lg" style={{ color: "#7eebb0" }}>✓ {pl ? "Opłacone — dziękujemy!" : "Paid — thank you!"}</div>
          ) : (
            <PaymentStart id={p.id} label={pl ? "Zapłać teraz" : "Pay now"} />
          )}
        </div>
        <p className="text-[11px] mt-4" style={{ color: "var(--dim)" }}>{pl ? "Płatność obsługiwana bezpiecznie przez operatora płatności." : "Payment securely handled by the payment provider."}</p>
      </section>
    </>
  );
}
