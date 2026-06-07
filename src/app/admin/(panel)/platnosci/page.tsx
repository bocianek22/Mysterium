import { redirect } from "next/navigation";
import { getSession, canFinance } from "@/lib/auth";
import PaymentsManager from "@/components/admin/PaymentsManager";

export const dynamic = "force-dynamic";

export default async function PlatnosciPage() {
  const s = await getSession();
  if (!s) redirect("/admin/login");
  if (!canFinance(s.role)) redirect("/admin");
  return <PaymentsManager />;
}
