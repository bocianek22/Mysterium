import { redirect } from "next/navigation";
import { getSession, canOps, canOpsManage } from "@/lib/auth";
import ChecklistManager from "@/components/admin/ChecklistManager";

export const dynamic = "force-dynamic";

export default async function ChecklistyPage() {
  const s = await getSession();
  if (!s) redirect("/admin/login");
  if (!canOps(s.role)) redirect("/admin");
  return <ChecklistManager canManage={canOpsManage(s.role)} />;
}
