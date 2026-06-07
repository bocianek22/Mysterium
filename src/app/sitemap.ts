import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/seo";
import { locales } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const staticPaths = ["", "/pokoje", "/mobilna", "/galeria", "/cennik", "/blog", "/hall-of-fame", "/o-nas", "/kontakt", "/rezerwacja", "/polityka-prywatnosci"];

  let rooms: { slug: string }[] = [];
  let mobile: { slug: string }[] = [];
  let posts: { slug: string }[] = [];
  let albums: { slug: string }[] = [];
  try {
    [rooms, mobile, posts, albums] = await Promise.all([
      prisma.room.findMany({ where: { published: true }, select: { slug: true } }),
      prisma.mobileOffer.findMany({ where: { published: true }, select: { slug: true } }),
      prisma.post.findMany({ where: { published: true }, select: { slug: true } }),
      prisma.eventAlbum.findMany({ where: { published: true }, select: { slug: true } }),
    ]);
  } catch {
    // baza może być niedostępna w trakcie buildu — pomijamy dynamiczne wpisy
  }

  const entries: MetadataRoute.Sitemap = [];
  for (const locale of locales) {
    for (const p of staticPaths) entries.push({ url: `${base}/${locale}${p}`, changeFrequency: "weekly", priority: p === "" ? 1 : 0.7 });
    for (const r of rooms) entries.push({ url: `${base}/${locale}/pokoje/${r.slug}`, changeFrequency: "monthly", priority: 0.8 });
    for (const m of mobile) entries.push({ url: `${base}/${locale}/mobilna/${m.slug}`, changeFrequency: "monthly", priority: 0.8 });
    for (const p of posts) entries.push({ url: `${base}/${locale}/blog/${p.slug}`, changeFrequency: "monthly", priority: 0.6 });
    for (const a of albums) entries.push({ url: `${base}/${locale}/galeria/${a.slug}`, changeFrequency: "monthly", priority: 0.5 });
  }
  return entries;
}
