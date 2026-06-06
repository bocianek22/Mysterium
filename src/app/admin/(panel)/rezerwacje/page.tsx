import { redirect } from "next/navigation";
import { getSession, isManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ReservationsManager from "@/components/admin/ReservationsManager";

export const dynamic = "force-dynamic";

export default async function RezerwacjePage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!isManager(session.role)) redirect("/admin");
  const [rooms, users] = await Promise.all([
    prisma.room.findMany({ select: { id: true, namePl: true }, orderBy: { order: "asc" } }),
    prisma.user.findMany({ where: { active: true }, select: { id: true, name: true, email: true }, orderBy: { name: "asc" } }),
  ]);
  return <ReservationsManager rooms={rooms} users={users} />;
}
