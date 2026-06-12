import { redirect } from "next/navigation";
import { getSession, canCustomers } from "@/lib/auth";
import CustomersManager from "@/components/admin/CustomersManager";

export const dynamic = "force-dynamic";

export default async function KlienciPage() {
  const s = await getSession();
  if (!s) redirect("/admin/login");
  if (!canCustomers(s.role)) redirect("/admin");
  return <CustomersManager />;
}
