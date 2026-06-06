import { siteUrl } from "@/lib/seo";

// Dane strukturalne LocalBusiness — pomagają Google pokazać adres,
// telefon, godziny i gwiazdki w wynikach wyszukiwania.
export default function JsonLd({
  address,
  phone,
  email,
  hours,
  rating,
}: {
  address: string;
  phone: string;
  email: string;
  hours?: string | null;
  rating?: string | null;
}) {
  const data: any = {
    "@context": "https://schema.org",
    "@type": "EntertainmentBusiness",
    name: "MYSTERIUM Escape Room",
    description: "Escape room w Nowym Dworze Mazowieckim — pokój „Pułapka” oraz mobilna skrzynia na eventy.",
    url: siteUrl(),
    image: `${siteUrl()}/logo.png`,
    telephone: phone,
    email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Warszawska 40",
      postalCode: "05-100",
      addressLocality: "Nowy Dwór Mazowiecki",
      addressCountry: "PL",
    },
    areaServed: "Nowy Dwór Mazowiecki, Warszawa",
  };
  if (rating) {
    data.aggregateRating = { "@type": "AggregateRating", ratingValue: rating, reviewCount: 1, bestRating: "5" };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
