import { prisma } from "./prisma";

// Pobiera wszystkie opublikowane treści potrzebne na stronie głównej.
export async function getHomeData() {
  const [settings, rooms, gallery, videos, reviews, pricing, faq] =
    await Promise.all([
      prisma.siteSettings.findUnique({ where: { id: "main" } }),
      prisma.room.findMany({
        where: { published: true },
        orderBy: { order: "asc" },
      }),
      prisma.galleryImage.findMany({
        where: { published: true },
        orderBy: { order: "asc" },
      }),
      prisma.video.findMany({
        where: { published: true },
        orderBy: { order: "asc" },
      }),
      prisma.review.findMany({
        where: { published: true },
        orderBy: { order: "asc" },
      }),
      prisma.pricingPlan.findMany({
        where: { published: true },
        orderBy: { order: "asc" },
      }),
      prisma.faqItem.findMany({
        where: { published: true },
        orderBy: { order: "asc" },
      }),
    ]);

  return { settings, rooms, gallery, videos, reviews, pricing, faq };
}

export type HomeData = Awaited<ReturnType<typeof getHomeData>>;
