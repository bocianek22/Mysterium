import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, getDict, type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { pageMeta } from "@/lib/seo";
import PageHero from "@/components/site/PageHero";
import QuoteForm from "@/components/site/QuoteForm";
import VoucherCheck from "@/components/site/VoucherCheck";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const locale = params.locale as Locale;
  return pageMeta({
    locale,
    title: locale === "pl" ? "Bony podarunkowe" : "Gift vouchers",
    description: locale === "pl" ? "Podaruj emocje — bon podarunkowy do escape roomu Mysterium." : "Give the gift of thrills — a Mysterium escape room gift voucher.",
    path: "/bony",
  });
}

export default async function VouchersPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  const pl = locale === "pl";
  const settings = await prisma.siteSettings.findUnique({ where: { id: "main" } });
  const whatsapp = settings?.whatsapp || "48571080192";

  const perks = pl
    ? ["Idealny prezent na urodziny, święta czy walentynki", "Do wykorzystania na pokój stacjonarny lub wyjazdowy", "Elegancki bon z unikalnym kodem", "Ważny przez wiele miesięcy"]
    : ["A perfect gift for a birthday, holidays or Valentine's", "Valid for the on-site or mobile room", "An elegant voucher with a unique code", "Valid for many months"];

  return (
    <>
      <PageHero
        label={pl ? "Prezent" : "Gift"}
        title={pl ? "Bony podarunkowe" : "Gift vouchers"}
        subtitle={pl ? "Podaruj komuś emocje, których nie zapomni." : "Give someone thrills they won't forget."}
      />

      <section className="px-6 md:px-[60px] py-12 md:py-16 relative z-[1]" style={{ background: "var(--navy-dd)" }}>
        <div className="max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          <div className="reveal">
            <div className="text-7xl mb-4 floaty">🎁</div>
            <ul className="flex flex-col gap-3">
              {perks.map((p, i) => (
                <li key={i} className="flex items-start gap-3 text-[15px]" style={{ color: "var(--muted)" }}>
                  <span style={{ color: "var(--gold)" }}>◆</span> {p}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <VoucherCheck locale={locale} />
            </div>
          </div>
          <div className="reveal reveal-right">
            <div className="sec-label" style={{ marginBottom: 6 }}>{pl ? "Zamów bon" : "Order a voucher"}</div>
            <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>{pl ? "Napisz na jaką kwotę lub grę — przygotujemy bon i podeślemy szczegóły." : "Tell us the amount or game — we'll prepare the voucher and send the details."}</p>
            <QuoteForm t={t} offerName={pl ? "Bon podarunkowy" : "Gift voucher"} whatsapp={whatsapp} />
          </div>
        </div>
      </section>
    </>
  );
}
