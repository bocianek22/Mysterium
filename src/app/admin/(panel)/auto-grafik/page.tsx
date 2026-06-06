import { redirect } from "next/navigation";
import { getSession, isManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AutoSchedule from "@/components/admin/AutoSchedule";

export const dynamic = "force-dynamic";

export default async function AutoSchedulePage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!isManager(session.role)) redirect("/admin");
  const employeesCount = await prisma.user.count({ where: { role: "EMPLOYEE", active: true } });
  return <AutoSchedule employeesCount={employeesCount} />;
}
