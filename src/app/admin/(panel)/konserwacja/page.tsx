import { redirect } from "next/navigation";
import { getSession, canOps, canOpsManage } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MaintenanceManager from "@/components/admin/MaintenanceManager";

export const dynamic = "force-dynamic";

export default async function KonserwacjaPage() {
  const s = await getSession();
  if (!s) redirect("/admin/login");
  if (!canOps(s.role)) redirect("/admin");
  const rooms = await prisma.room.findMany({ select: { id: true, namePl: true }, orderBy: { order: "asc" } });
  return <MaintenanceManager rooms={rooms} canManage={canOpsManage(s.role)} />;
}
