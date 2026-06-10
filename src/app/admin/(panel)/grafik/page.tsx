import { redirect } from "next/navigation";
import { getSession, isManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ScheduleManager from "@/components/admin/ScheduleManager";
import ShiftSwapPanel from "@/components/admin/ShiftSwapPanel";

export const dynamic = "force-dynamic";

export default async function GrafikPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  const manager = isManager(session.role);
  const users = manager
    ? await prisma.user.findMany({
        where: { active: true },
        select: { id: true, name: true, email: true },
        orderBy: { name: "asc" },
      })
    : [];
  return (
    <>
      <ScheduleManager isManager={manager} users={users} currentUserId={session.sub} />
      <ShiftSwapPanel />
    </>
  );
}
