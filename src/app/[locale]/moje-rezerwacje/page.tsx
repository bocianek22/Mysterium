import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, pick, type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { pageMeta } from "@/lib/seo";
import { verifyCustomerToken } from "@/lib/customerToken";
import PageHero from "@/components/site/PageHero";
import RequestLinkForm from "@/components/site/RequestLinkForm";
import CustomerReservations from "@/components/site/CustomerReservations";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const locale = params.locale as Locale;
  return pageMeta({ locale, title: locale === "pl" ? "Moje rezerwacje" : "My bookings", description: locale === "pl" ? "Sprawdź i zarządzaj swoimi rezerwacjami w Mysterium." : "View and manage your Mysterium bookings.", path: "/moje-rezerwacje" });
}

export default async function MyBookingsPage({ params, searchParams }: { params: { locale: string }; searchParams: { token?: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const pl = locale === "pl";
  const token = searchParams.token || "";
  const email = token ? await verifyCustomerToken(token) : null;

  let upcoming: any[] = [];
  let past: any[] = [];
  if (email) {
    const list = await prisma.reservation.findMany({
      where: { customerEmail: email },
      orderBy: { start: "desc" },
      include: { room: { select: { namePl: true, nameEn: true } } },
    });
    const now = new Date();
    const map = (r: any) => ({
      id: r.id,
      roomName: r.room ? pick(r.room, "name", locale) : (r.title || "—"),
      start: r.start.toISOString(),
      end: r.end.toISOString(),
      people: r.people,
      status: r.status,
      source: r.source,
      refNo: r.refNo,
      deposit: r.deposit,
      paid: r.paid,
    });
    upcoming = list.filter((r) => r.start >= now && r.status !== "CANCELLED").map(map).reverse();
    past = list.filter((r) => r.start < now || r.status === "CANCELLED").map(map);
  }

  return (
    <>
      <PageHero
        label={pl ? "Klient" : "Customer"}
        title={pl ? "Moje rezerwacje" : "My bookings"}
        subtitle={pl ? "Podgląd terminów, anulowanie i ponowna rezerwacja." : "View, cancel and re-book your slots."}
      />
      <section className="px-6 md:px-[60px] py-12 max-w-[900px] mx-auto">
        {email ? (
          <CustomerReservations locale={locale} email={email} token={token} upcoming={upcoming} past={past} />
        ) : (
          <RequestLinkForm locale={locale} expired={!!token} />
        )}
      </section>
    </>
  );
}
