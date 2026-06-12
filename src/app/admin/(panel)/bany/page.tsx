import { redirect } from "next/navigation";
import { getSession, isManager } from "@/lib/auth";
import BansManager from "@/components/admin/BansManager";

export const dynamic = "force-dynamic";

export default async function BansPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!isManager(session.role)) redirect("/admin");
  return <BansManager />;
}
