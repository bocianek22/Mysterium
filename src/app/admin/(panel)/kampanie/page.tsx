import { redirect } from "next/navigation";
import { getSession, isManager } from "@/lib/auth";
import CampaignManager from "@/components/admin/CampaignManager";

export const dynamic = "force-dynamic";

export default async function KampaniePage() {
  const s = await getSession();
  if (!s) redirect("/admin/login");
  if (!isManager(s.role)) redirect("/admin");
  return <CampaignManager />;
}
