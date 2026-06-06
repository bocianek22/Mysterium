import { isLocale, type Locale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { addressCity } from "@/lib/address";

export const dynamic = "force-dynamic";

export default async function PrivacyPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const pl = locale === "pl";
  const settings = await prisma.siteSettings.findUnique({ where: { id: "main" } });
  const address = (pl ? settings?.addressPl : settings?.addressEn) || "Warszawska 40, 05-100 Nowy Dwór Mazowiecki";
  const city = addressCity(address);
  const email = settings?.email || "artsmysterium@gmail.com";

  return (
    <section className="px-6 md:px-[60px] pt-[140px] pb-20 max-w-[800px] mx-auto relative z-[1]">
      <div className="sec-label">{pl ? "Dokumenty" : "Documents"}</div>
      <h1 className="sec-title text-gold-grad">
        {pl ? "Polityka prywatności" : "Privacy Policy"}
      </h1>
      <div className="sec-divider" />
      <div className="space-y-5 text-[15px] leading-[1.9]" style={{ color: "var(--muted)" }}>
        <p>
          {pl
            ? `Administratorem danych osobowych jest Mysterium Escape Room z siedzibą pod adresem ${address}. Dane zbierane przez formularz kontaktowy (imię, e-mail, telefon, treść wiadomości) przetwarzane są wyłącznie w celu odpowiedzi na zapytanie oraz obsługi rezerwacji.`
            : `The data controller is Mysterium Escape Room, based at ${address}. Data collected via the contact form (name, e-mail, phone, message) is processed solely to respond to your inquiry and handle bookings.`}
        </p>
        <p>
          {pl
            ? "Dane nie są przekazywane podmiotom trzecim poza zakresem niezbędnym do realizacji usługi (np. system rezerwacji LockMe). Masz prawo dostępu do swoich danych, ich poprawienia oraz usunięcia."
            : "Data is not shared with third parties beyond what is necessary to provide the service (e.g. the LockMe booking system). You have the right to access, correct and delete your data."}
        </p>
        <p>
          {pl
            ? `W sprawach dotyczących danych osobowych skontaktuj się z nami pod adresem ${email}.`
            : `For matters regarding personal data, contact us at ${email}.`}
        </p>
      </div>
    </section>
  );
}
