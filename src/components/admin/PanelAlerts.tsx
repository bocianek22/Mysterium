import Link from "next/link";
import { prisma } from "@/lib/prisma";

// Powiadomienia w panelu: nadchodzące rezerwacje, nieopłacone, nowe wiadomości,
// otwarte usterki, niski stan magazynu. Lekki widget na pulpicie.
export default async function PanelAlerts() {
  const now = new Date();
  const in7 = new Date(now.getTime() + 7 * 24 * 3600 * 1000);

  const [upcoming, unpaid, messages, maintenance, lowStock] = await Promise.all([
    prisma.reservation.findMany({ where: { start: { gte: now, lt: in7 }, status: { not: "CANCELLED" } }, orderBy: { start: "asc" }, take: 6 }),
    prisma.reservation.count({ where: { start: { lt: now }, paid: false, status: { not: "CANCELLED" }, price: { gt: 0 } } }),
    prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 3 }).catch(() => []),
    prisma.maintenanceLog.count({ where: { status: { not: "DONE" } } }).catch(() => 0),
    prisma.inventoryItem.findMany({ where: { lowStock: { gt: 0 } }, take: 100 }).catch(() => [] as any[]),
  ]);

  const low = (lowStock as any[]).filter((i) => typeof i.quantity === "number" && typeof i.lowStock === "number" && i.quantity <= i.lowStock);

  const chips: { label: string; href: string; tone: string }[] = [];
  if (unpaid > 0) chips.push({ label: `${unpaid} nieopłaconych`, href: "/admin/finanse", tone: "#fca5a5" });
  if (maintenance > 0) chips.push({ label: `${maintenance} usterek`, href: "/admin/konserwacja", tone: "#e0b257" });
  if (low.length > 0) chips.push({ label: `${low.length} niski stan`, href: "/admin/magazyn", tone: "#e0b257" });
  if (messages.length > 0) chips.push({ label: `${messages.length} wiadomości`, href: "/admin/messages", tone: "#5fb0d8" });

  return (
    <div className="mb-8 p-5 rounded" style={{ background: "rgba(13,27,42,.7)", border: "1px solid var(--border)" }}>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="font-serif text-sm tracking-[2px] uppercase flex items-center gap-2" style={{ color: "var(--gold)" }}><span>🔔</span> Co nowego</h2>
        <div className="flex gap-2 flex-wrap">
          {chips.length ? chips.map((c) => (
            <Link key={c.label} href={c.href} className="text-[11px] px-3 py-1 rounded-full no-underline" style={{ border: `1px solid ${c.tone}`, color: c.tone }}>{c.label}</Link>
          )) : <span className="text-xs" style={{ color: "var(--muted)" }}>Brak alertów ✓</span>}
        </div>
      </div>
      <div className="text-[11px] uppercase tracking-[1px] mb-2" style={{ color: "var(--muted)" }}>Nadchodzące rezerwacje (7 dni)</div>
      {upcoming.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--muted)" }}>Brak rezerwacji w najbliższym tygodniu.</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {upcoming.map((r) => (
            <li key={r.id} className="flex items-center gap-3 text-sm flex-wrap" style={{ color: "var(--text)" }}>
              <span className="font-display" style={{ color: "var(--gold)" }}>{new Date(r.start).toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit" })} {new Date(r.start).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}</span>
              <span>{r.title}</span>
              <span style={{ color: "var(--muted)" }}>· {r.customerName} · {r.people} os.</span>
              {!r.paid && (r.price || 0) > 0 && <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: "rgba(252,165,165,.12)", color: "#fca5a5" }}>nieopłacone</span>}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4 flex gap-4 text-xs">
        <Link href="/admin/kalendarz" style={{ color: "var(--gold)" }}>→ Kalendarz</Link>
        <Link href="/admin/rezerwacje" style={{ color: "var(--gold)" }}>→ Rezerwacje</Link>
      </div>
    </div>
  );
}
