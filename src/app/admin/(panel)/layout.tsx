import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Sidebar from "@/components/admin/Sidebar";

export const dynamic = "force-dynamic";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  // Rola „Kod" (kiosk) — bez sidebara, sam ekran kodu na pełną wysokość.
  if (session.role === "CODE") {
    return (
      <main className="min-h-screen relative z-[1]" style={{ background: "var(--navy-dd)" }}>{children}</main>
    );
  }

  return (
    <div className="md:flex min-h-screen relative z-[1]" style={{ background: "var(--navy-dd)" }}>
      <Sidebar email={session.email} role={session.role} name={session.name} />
      <main className="flex-1 p-5 md:p-8 max-w-full overflow-x-hidden">{children}</main>
    </div>
  );
}
