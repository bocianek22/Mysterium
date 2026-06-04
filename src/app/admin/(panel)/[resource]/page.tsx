import { notFound } from "next/navigation";
import { resources } from "@/lib/resourceConfig";
import ResourceManager from "@/components/admin/ResourceManager";

export default function ResourcePage({ params }: { params: { resource: string } }) {
  const config = resources[params.resource];
  if (!config) notFound();
  return <ResourceManager resource={params.resource} config={config} />;
}
