import { notFound } from "next/navigation";
import Link from "next/link";
import { isLocale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { zl } from "@/lib/payments";
import PageHero from "@/components/site/PageHero";

export const dynamic = "force-dynamic";

export default async function PayStatusPage({ params, searchParams }: { params: { locale: string }; searchParams: { id?: string } }) {
  if (!isLocale(params.locale)) notFound();
  const pl = params.locale === "pl";
  const p = searchParams.id ? await prisma.payment.findUnique({ where: { id: searchParams.id } }) : null;
  const paid = p?.status === "PAID";
  const pending = p && p.status === "PENDING";

  return (
    <>
      <PageHero label={pl ? "Płatność" : "Payment"} title={paid ? (pl ? "Dziękujemy!" : "Thank you!") : pending ? (pl ? "Przetwarzanie…" : "Processing…") : (pl ? "Status płatności" : "Payment status")} />
      <section className="px-6 md:px-[60px] pb-24 max-w-[560px] mx-auto text-center">
        <div className="p-8 rounded" style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--border)" }}>
          {!p ? (
            <p style={{ color: "var(--muted)" }}>{pl ? "Nie znaleziono płatności." : "Payment not found."}</p>
          ) : paid ? (
            <>
              <div className="text-5xl mb-3">✅</div>
              <div className="font-display text-2xl mb-1" style={{ color: "#7eebb0" }}>{zl(p.amount)} {pl ? "opłacone" : "paid"}</div>
              <p className="text-sm mt-2" style={{ color: "var(--muted)" }}>
                {p.purpose === "VOUCHER"
                  ? (pl ? "Kod bonu wysłaliśmy na Twój e-mail." : "We've emailed your voucher code.")
                  : (pl ? "Potwierdzenie wysłaliśmy na e-mail." : "We've emailed your confirmation.")}
              </p>
            </>
          ) : pending ? (
            <>
              <div className="text-5xl mb-3">⏳</div>
              <p className="text-sm" style={{ color: "var(--muted)" }}>{pl ? "Płatność jest przetwarzana. Odśwież za chwilę." : "Your payment is being processed. Refresh in a moment."}</p>
              <Link href={`/${params.locale}/platnosc/status?id=${p.id}`} className="inline-block mt-4 text-sm" style={{ color: "var(--gold)" }}>{pl ? "Odśwież" : "Refresh"}</Link>
            </>
          ) : (
            <>
              <div className="text-5xl mb-3">⚠️</div>
              <p className="text-sm" style={{ color: "#fca5a5" }}>{pl ? "Płatność nie została zakończona." : "Payment was not completed."}</p>
            </>
          )}
          <div className="mt-6"><Link href={`/${params.locale}`} className="text-sm no-underline" style={{ color: "var(--gold)" }}>← {pl ? "Strona główna" : "Home"}</Link></div>
        </div>
      </section>
    </>
  );
}
