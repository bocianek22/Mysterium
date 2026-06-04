import { redirect } from "next/navigation";
import { getSession, isManager } from "@/lib/auth";
import SettingsForm from "@/components/admin/SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!isManager(session.role)) redirect("/admin");
  return (
    <div>
      <h1 className="font-display text-gold-grad text-3xl mb-2 flex items-center gap-3">
        <span>⚙️</span> Ustawienia
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>
        Dane kontaktowe, integracje (LockMe, Google Calendar) i teksty na stronie.
      </p>
      <SettingsForm />
    </div>
  );
}
