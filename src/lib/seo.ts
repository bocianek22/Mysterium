import type { Metadata } from "next";
import type { Locale } from "./i18n";
import { prisma } from "./prisma";

// Bazowy adres strony (do metadanych, OG, sitemap)
export function siteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

// Zamienia ścieżkę na pełny adres (Blob jest już absolutny).
export function absUrl(u?: string | null, base = siteUrl()): string | undefined {
  if (!u) return undefined;
  return /^https?:\/\//.test(u) ? u : `${base}${u.startsWith("/") ? "" : "/"}${u}`;
}

let _logoCache: { v: string | undefined; t: number } | null = null;
// Logo jako grafika OG / favicon (z ustawień). Lekki cache w obrębie procesu.
export async function siteLogo(base = siteUrl()): Promise<string | undefined> {
  if (_logoCache && Date.now() - _logoCache.t < 30000) return _logoCache.v;
  const s = await prisma.siteSettings.findUnique({ where: { id: "main" }, select: { logoUrl: true } }).catch(() => null);
  const v = absUrl(s?.logoUrl, base);
  _logoCache = { v, t: Date.now() };
  return v;
}

// Buduje metadane podstrony (dwujęzyczne, z OG + linkami alternatywnymi)
export async function pageMeta(opts: {
  locale: Locale;
  title: string;
  description: string;
  path: string; // np. "/pokoje" lub "" dla strony głównej
  image?: string | null;
}): Promise<Metadata> {
  const base = siteUrl();
  const url = `${base}/${opts.locale}${opts.path}`;
  const image = absUrl(opts.image) || (await siteLogo(base));
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
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
      images: image ? [image] : undefined,
    },
  };
}
