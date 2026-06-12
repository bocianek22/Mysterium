import { redirect } from "next/navigation";
import { getSession, canExpenses } from "@/lib/auth";
import ExpensesManager from "@/components/admin/ExpensesManager";

export const dynamic = "force-dynamic";

export default async function WydatkiPage() {
  const s = await getSession();
  if (!s) redirect("/admin/login");
  if (!canExpenses(s.role)) redirect("/admin");
  return <ExpensesManager />;
}
