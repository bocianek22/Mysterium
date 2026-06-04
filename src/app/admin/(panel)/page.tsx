import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { resources } from "@/lib/resourceConfig";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const [rooms, gallery, videos, reviews, pricing, faq, messages, unread] =
    await Promise.all([
      prisma.room.count(),
      prisma.galleryImage.count(),
      prisma.video.count(),
      prisma.review.count(),
      prisma.pricingPlan.count(),
      prisma.faqItem.count(),
      prisma.contactMessage.count(),
      prisma.contactMessage.count({ where: { read: false } }),
    ]);

  const cards = [
    { key: "rooms", count: rooms },
    { key: "gallery", count: gallery },
    { key: "videos", count: videos },
    { key: "reviews", count: reviews },
    { key: "pricing", count: pricing },
    { key: "faq", count: faq },
    { key: "messages", count: messages, badge: unread },
  ];

  return (
    <div>
      <h1 className="font-display text-gold-grad text-3xl mb-2">Pulpit</h1>
      <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>
        Witaj w panelu Mysterium. Zarządzaj treścią strony poniżej.
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => {
          const cfg = resources[c.key];
          return (
            <Link
              key={c.key}
              href={`/admin/${c.key}`}
              className="relative p-6 rounded transition-all hover:-translate-y-1 no-underline"
              style={{ background: "rgba(13,27,42,.7)", border: "1px solid var(--border)" }}
            >
              <div className="text-3xl mb-3">{cfg.icon}</div>
              <div className="font-display text-3xl" style={{ color: "var(--gold)" }}>
                {c.count}
              </div>
              <div className="font-serif text-[11px] tracking-[2px] uppercase mt-1" style={{ color: "var(--muted)" }}>
                {cfg.label}
              </div>
              {!!c.badge && c.badge > 0 && (
                <span className="absolute top-4 right-4 text-[11px] px-2 py-[2px] rounded-full" style={{ background: "#ef4444", color: "#fff" }}>
                  {c.badge} nowe
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
