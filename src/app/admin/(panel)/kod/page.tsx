import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession, canShowCode, isManager } from "@/lib/auth";
import ClockQR from "@/components/admin/ClockQR";
import LogoutButton from "@/components/admin/LogoutButton";

export const dynamic = "force-dynamic";

export default async function KodPage() {
  const s = await getSession();
  if (!s) redirect("/admin/login");
  if (!canShowCode(s.role)) redirect("/admin");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-5 md:p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-4">
          <div className="font-display text-gold-grad text-2xl">MYSTERIUM</div>
          <div className="font-serif text-[10px] tracking-[3px] uppercase mt-1" style={{ color: "var(--muted)" }}>Rejestracja czasu pracy</div>
        </div>

        <ClockQR kiosk />

        <div className="mt-5 flex items-center justify-center gap-4">
          {isManager(s.role) && (
            <Link href="/admin/zegar" className="text-xs px-4 py-2 rounded" style={{ border: "1px solid var(--border)", color: "var(--muted)" }}>← Panel RCP</Link>
          )}
          <LogoutButton className="text-xs px-4 py-2 rounded" style={{ border: "1px solid var(--border)", color: "var(--muted)" }} />
        </div>
      </div>
    </div>
  );
}
