import { siteUrl } from "@/lib/seo";

// Breadcrumbs strukturalne — Google pokazuje ścieżkę nawigacji w wynikach.
export default function BreadcrumbJsonLd({ items }: { items: { name: string; path: string }[] }) {
  const base = siteUrl();
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${base}${it.path}`,
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
