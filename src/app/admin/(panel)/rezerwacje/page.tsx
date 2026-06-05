import { redirect } from "next/navigation";
import { getSession, isManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ReservationsManager from "@/components/admin/ReservationsManager";

export const dynamic = "force-dynamic";

export default async function RezerwacjePage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!isManager(session.role)) redirect("/admin");
  const rooms = await prisma.room.findMany({
    select: { id: true, namePl: true },
    orderBy: { order: "asc" },
  });
  return <ReservationsManager rooms={rooms} />;
}
