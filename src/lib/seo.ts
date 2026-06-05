import type { Metadata } from "next";
import type { Locale } from "./i18n";

// Bazowy adres strony (do metadanych, OG, sitemap)
export function siteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

// Buduje metadane podstrony (dwujęzyczne, z OG + linkami alternatywnymi)
export function pageMeta(opts: {
  locale: Locale;
  title: string;
  description: string;
  path: string; // np. "/pokoje" lub "" dla strony głównej
  image?: string | null;
}): Metadata {
  const base = siteUrl();
  const url = `${base}/${opts.locale}${opts.path}`;
  const other: Locale = opts.locale === "pl" ? "en" : "pl";
  return {
    title: opts.title,
    description: opts.description,
    alternates: {
      canonical: url,
      languages: {
        pl: `${base}/pl${opts.path}`,
        en: `${base}/en${opts.path}`,
        "x-default": `${base}/pl${opts.path}`,
      },
    },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      siteName: "MYSTERIUM",
      locale: opts.locale === "pl" ? "pl_PL" : "en_US",
      type: "website",
      images: opts.image ? [{ url: opts.image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
      images: opts.image ? [opts.image] : undefined,
    },
  };
}
