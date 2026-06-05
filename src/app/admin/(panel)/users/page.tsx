import { redirect } from "next/navigation";
import { getSession, isManager } from "@/lib/auth";
import UsersManager from "@/components/admin/UsersManager";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!isManager(session.role)) redirect("/admin");
  return <UsersManager currentUserId={session.sub} />;
}
