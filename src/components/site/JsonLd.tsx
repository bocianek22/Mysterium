import { siteUrl } from "@/lib/seo";
import { addressCity, addressStreet } from "@/lib/address";

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
  const postal = address.match(/\d{2}-\d{3}/)?.[0];
  const city = addressCity(address);
  const data: any = {
    "@context": "https://schema.org",
    "@type": "EntertainmentBusiness",
    name: "MYSTERIUM Escape Room",
    description: `Escape room${city ? " w " + city : ""} — pokój „Pułapka” oraz mobilna skrzynia na eventy.`,
    url: siteUrl(),
    image: `${siteUrl()}/logo.png`,
    telephone: phone,
    email,
    address: {
      "@type": "PostalAddress",
      streetAddress: addressStreet(address),
      postalCode: postal,
      addressLocality: city,
      addressCountry: "PL",
    },
    areaServed: city,
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
