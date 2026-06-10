import { redirect } from "next/navigation";
import { getSession, isManager } from "@/lib/auth";
import QRGenerator from "@/components/admin/QRGenerator";

export const dynamic = "force-dynamic";

export default async function QRPage() {
  const s = await getSession();
  if (!s) redirect("/admin/login");
  if (!isManager(s.role)) redirect("/admin");
  return <QRGenerator />;
}
