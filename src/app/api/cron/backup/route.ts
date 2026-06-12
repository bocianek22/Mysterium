import { NextRequest, NextResponse } from "next/server";
import { getSession, isOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/notify";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

// Nocny backup danych biznesowych → JSON na Vercel Blob + link mailem do właściciela.
export async function GET(req: NextRequest) {
  const cronHeader = req.headers.get("x-vercel-cron");
  const key = new URL(req.url).searchParams.get("key");
  const session = await getSession();
  const authorized = !!cronHeader || (process.env.CRON_SECRET && key === process.env.CRON_SECRET) || (session && isOwner(session.role));
  if (!authorized) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ ok: false, error: "Brak BLOB_READ_WRITE_TOKEN — backup wymaga Vercel Blob" }, { status: 200 });
  }

  try {
    const [
      users, reservations, customers, payments, vouchers, discountCodes, expenses,
      shifts, availability, clockEntries, timesheets, leaves, inventory, inventoryMoves,
      maintenance, reviews, posts, pages, rooms, mobileOffers, pricingPlans, faq,
      contactMessages, surveys, settings, galleryImages, videos, eventAlbums,
      leaderboard, kbArticles, slotBlocks, campaigns,
    ] = await Promise.all([
      prisma.user.findMany({ select: { id: true, email: true, name: true, phone: true, role: true, active: true, rateDay: true, rateNight: true, rateWeekend: true } }),
      prisma.reservation.findMany(), prisma.customer.findMany(), prisma.payment.findMany(),
      prisma.voucher.findMany(), prisma.discountCode.findMany(), prisma.expense.findMany(),
      prisma.shift.findMany(), prisma.availability.findMany(), prisma.clockEntry.findMany(),
      prisma.dailyTimesheet.findMany(), prisma.leaveRequest.findMany(), prisma.inventoryItem.findMany(),
      prisma.inventoryMovement.findMany(), prisma.maintenanceLog.findMany(), prisma.review.findMany(),
      prisma.post.findMany(), prisma.page.findMany(), prisma.room.findMany(), prisma.mobileOffer.findMany(),
      prisma.pricingPlan.findMany(), prisma.faqItem.findMany(), prisma.contactMessage.findMany(),
      prisma.survey.findMany(), prisma.siteSettings.findMany(), prisma.galleryImage.findMany(),
      prisma.video.findMany(), prisma.eventAlbum.findMany(), prisma.leaderboardEntry.findMany(),
      prisma.kbArticle.findMany(), prisma.slotBlock.findMany(), prisma.campaign.findMany(),
    ]);

    const dump = {
      _meta: { generatedAt: new Date().toISOString(), note: "Backup danych Mysterium (hasła pominięte)" },
      users, reservations, customers, payments, vouchers, discountCodes, expenses,
      shifts, availability, clockEntries, timesheets, leaves, inventory, inventoryMoves,
      maintenance, reviews, posts, pages, rooms, mobileOffers, pricingPlans, faq,
      contactMessages, surveys, settings, galleryImages, videos, eventAlbums,
      leaderboard, kbArticles, slotBlocks, campaigns,
    };

    const date = new Date().toISOString().slice(0, 10);
    const json = JSON.stringify(dump, null, 0);
    const { put } = await import("@vercel/blob");
    const blob = await put(`backups/mysterium-${date}.json`, json, {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: true, // losowy sufiks = nieodgadywalny URL
    });

    const counts = Object.entries(dump).filter(([k]) => k !== "_meta").map(([k, v]) => `${k}: ${(v as unknown[]).length}`).join(", ");
    const s = settings[0];
    if (s?.email) {
      await sendMail({
        to: s.email,
        subject: `Backup Mysterium — ${date} ✅`,
        text: `Nocny backup gotowy (${(json.length / 1024).toFixed(0)} KB).\n\nPobierz (link prywatny, nie udostępniaj):\n${blob.url}\n\nRekordy: ${counts}`,
      });
    }
    return NextResponse.json({ ok: true, url: blob.url, sizeKB: Math.round(json.length / 1024) });
  } catch (e) {
    console.error("[cron/backup]", e);
    return NextResponse.json({ ok: false, error: "Błąd tworzenia backupu" }, { status: 500 });
  }
}
