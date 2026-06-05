import { notFound, redirect } from "next/navigation";
import { resources } from "@/lib/resourceConfig";
import { getSession, isManager } from "@/lib/auth";
import ResourceManager from "@/components/admin/ResourceManager";

export const dynamic = "force-dynamic";

export default async function ResourcePage({ params }: { params: { resource: string } }) {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!isManager(session.role)) redirect("/admin");
  const config = resources[params.resource];
  if (!config) notFound();
  return <ResourceManager resource={params.resource} config={config} />;
}
