import { redirect } from "next/navigation";
import { getSession, canReservations, canFinance } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ReservationsManager from "@/components/admin/ReservationsManager";
import { roomColorId, GOOGLE_EVENT_COLORS } from "@/lib/google";

export const dynamic = "force-dynamic";

export default async function RezerwacjePage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!canReservations(session.role)) redirect("/admin");
  const [rooms, users, settings] = await Promise.all([
    prisma.room.findMany({ select: { id: true, namePl: true, googleColorId: true }, orderBy: { order: "asc" } }),
    prisma.user.findMany({ where: { active: true }, select: { id: true, name: true, email: true }, orderBy: { name: "asc" } }),
    prisma.siteSettings.findUnique({ where: { id: "main" }, select: { googleSyncEnabled: true } }),
  ]);
  return (
    <>
      {settings?.googleSyncEnabled && rooms.length > 0 && (
        <div className="mb-5 p-4 rounded" style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--border)" }}>
          <div className="font-serif text-[11px] tracking-[2px] uppercase mb-3" style={{ color: "var(--gold)" }}>Kolory w Google Calendar</div>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {rooms.map((r) => {
              const col = GOOGLE_EVENT_COLORS[r.googleColorId || roomColorId(r.id) || "1"];
              return (
                <div key={r.id} className="flex items-center gap-2 text-[13px]" style={{ color: "var(--text)" }}>
                  <span style={{ width: 14, height: 14, borderRadius: 3, background: col.hex, display: "inline-block" }} />
                  {r.namePl} <span style={{ color: "var(--dim)" }}>· {col.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <ReservationsManager rooms={rooms} users={users} showFinance={canFinance(session.role)} />
    </>
  );
}
