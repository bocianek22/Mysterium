import { getSession, isManager } from "@/lib/auth";
import { roleLabel } from "@/lib/auth";
import ChangePasswordForm from "@/components/admin/ChangePasswordForm";
import PushSettings from "@/components/admin/PushSettings";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await getSession();
  if (!session) return null;
  return (
    <div className="max-w-lg">
      <h1 className="font-display text-gold-grad text-2xl mb-1">Moje konto</h1>
      <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>{session.email} · {roleLabel(session.role)}</p>
      <div className="corner-frame p-6" style={{ background: "rgba(13,27,42,.5)", border: "1px solid var(--border)" }}>
        <h2 className="text-sm font-serif tracking-[2px] uppercase mb-4" style={{ color: "var(--gold)" }}>Zmiana hasła</h2>
        <ChangePasswordForm />
      </div>
      <PushSettings isManager={isManager(session.role)} />
    </div>
  );
}
