import { redirect } from "next/navigation";
import { getSession, canReservations } from "@/lib/auth";
import BlocksManager from "@/components/admin/BlocksManager";

export const dynamic = "force-dynamic";

export default async function BlokadyPage() {
  const s = await getSession();
  if (!s) redirect("/admin/login");
  if (!canReservations(s.role)) redirect("/admin");
  return <BlocksManager />;
}
