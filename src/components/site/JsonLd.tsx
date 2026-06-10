import { siteUrl, absUrl } from "@/lib/seo";
import { addressCity, addressStreet } from "@/lib/address";
import { parseHours } from "@/lib/slots";

const DOW = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Dane strukturalne LocalBusiness — pomagają Google pokazać adres,
// telefon, godziny i gwiazdki w wynikach wyszukiwania.
export default function JsonLd({
  address,
  phone,
  email,
  rating,
  logo,
  openHoursJson,
}: {
  address: string;
  phone: string;
  email: string;
  hours?: string | null;
  rating?: string | null;
  logo?: string | null;
  openHoursJson?: string | null;
}) {
  const base = siteUrl();
  const postal = address.match(/\d{2}-\d{3}/)?.[0];
  const city = addressCity(address);
  const image = absUrl(logo, base) || `${base}/logo.png`;

  const hours = parseHours(openHoursJson);
  const openingHoursSpecification = hours
    .map((h, i) => (h.closed ? null : { "@type": "OpeningHoursSpecification", dayOfWeek: DOW[i], opens: h.open, closes: h.close }))
    .filter(Boolean);

  const data: any = {
    "@context": "https://schema.org",
    "@type": "EntertainmentBusiness",
    name: "MYSTERIUM Escape Room",
    description: `Escape room${city ? " w " + city : ""} — pokój „Pułapka” oraz mobilna skrzynia na eventy, urodziny i integracje.`,
    url: base,
    image,
    logo: image,
    telephone: phone,
    email,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: addressStreet(address),
      postalCode: postal,
      addressLocality: city,
      addressRegion: "mazowieckie",
      addressCountry: "PL",
    },
    areaServed: [city, "Warszawa", "Legionowo", "Modlin"].filter(Boolean),
    ...(openingHoursSpecification.length ? { openingHoursSpecification } : {}),
  };
  if (rating) {
    data.aggregateRating = { "@type": "AggregateRating", ratingValue: rating, reviewCount: 1, bestRating: "5" };
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
