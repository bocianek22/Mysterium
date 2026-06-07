import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import LeaveManager from "@/components/admin/LeaveManager";

export const dynamic = "force-dynamic";

export default async function UrlopyPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return <LeaveManager />;
}
