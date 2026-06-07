import { redirect } from "next/navigation";
import { getSession, canOps, canOpsManage } from "@/lib/auth";
import InventoryManager from "@/components/admin/InventoryManager";

export const dynamic = "force-dynamic";

export default async function MagazynPage() {
  const s = await getSession();
  if (!s) redirect("/admin/login");
  if (!canOps(s.role)) redirect("/admin");
  return <InventoryManager canManage={canOpsManage(s.role)} />;
}
