import { getSession, isManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Eksport całej bazy do JSON (kopia zapasowa). Tylko zarząd.
export async function GET() {
  const s = await getSession();
  if (!s || !isManager(s.role)) return new Response("Forbidden", { status: 403 });

  const [
    siteSettings, rooms, mobileOffers, pages, posts, eventAlbums, leaderboard,
    galleryImages, videos, reviews, faq, vouchers, codes, reservations,
    customers, expenses, payments, maintenance, inventory, users,
  ] = await Promise.all([
    prisma.siteSettings.findMany(), prisma.room.findMany(), prisma.mobileOffer.findMany(),
    prisma.page.findMany(), prisma.post.findMany(), prisma.eventAlbum.findMany(),
    prisma.leaderboardEntry.findMany(), prisma.galleryImage.findMany(), prisma.video.findMany(),
    prisma.review.findMany(), prisma.faqItem.findMany(), prisma.voucher.findMany(),
    prisma.discountCode.findMany(), prisma.reservation.findMany(), prisma.customer.findMany(),
    prisma.expense.findMany(), prisma.payment.findMany(), prisma.maintenanceLog.findMany(),
    prisma.inventoryItem.findMany(),
    prisma.user.findMany({ select: { id: true, email: true, name: true, role: true, contractType: true, active: true, createdAt: true } }),
  ]);

  const dump = {
    _meta: { app: "Mysterium", exportedAt: new Date().toISOString(), by: s.name || s.email },
    siteSettings, rooms, mobileOffers, pages, posts, eventAlbums, leaderboard,
    galleryImages, videos, reviews, faq, vouchers, codes, reservations,
    customers, expenses, payments, maintenance, inventory, users,
  };

  logAudit(s, "OTHER", "backup", "Pobranie kopii zapazowej (JSON)");
  const filename = `mysterium-backup-${new Date().toISOString().slice(0, 10)}.json`;
  return new Response(JSON.stringify(dump, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
