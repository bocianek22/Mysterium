import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AvailabilityManager from "@/components/admin/AvailabilityManager";

export const dynamic = "force-dynamic";

export default async function DyspoPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return <AvailabilityManager />;
}
