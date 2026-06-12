import { redirect } from "next/navigation";
import { getSession, isManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const ACTION_LABEL: Record<string, string> = {
  CREATE: "Dodano", UPDATE: "Zmieniono", DELETE: "Usunięto", SETTINGS: "Ustawienia", LOGIN: "Logowanie", OTHER: "Akcja",
};
const ACTION_COLOR: Record<string, string> = {
  CREATE: "#7eebb0", UPDATE: "#5fb0d8", DELETE: "#fca5a5", SETTINGS: "var(--gold)", OTHER: "var(--muted)",
};

export default async function BackupPage() {
  const s = await getSession();
  if (!s) redirect("/admin/login");
  if (!isManager(s.role)) redirect("/admin");

  const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 }).catch(() => []);

  return (
    <div>
      <h1 className="font-display text-gold-grad text-3xl mb-6 flex items-center gap-3"><span>💾</span> Kopia zapasowa i audyt</h1>

      <div className="p-5 rounded mb-8" style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--border)" }}>
        <h2 className="font-serif text-sm tracking-[2px] uppercase mb-2" style={{ color: "var(--gold)" }}>Kopia zapasowa</h2>
        <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>Pobierz pełen eksport danych (pokoje, rezerwacje, klienci, finanse, treści…) w pliku JSON. Trzymaj w bezpiecznym miejscu.</p>
        <a href="/api/admin/backup" className="btn-gold inline-block" style={{ clipPath: "none", padding: "11px 22px" }}>⬇ Pobierz kopię (JSON)</a>
      </div>

      <h2 className="font-serif text-sm tracking-[2px] uppercase mb-4" style={{ color: "var(--gold)" }}>Dziennik audytu (ostatnie 100)</h2>
      {logs.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>Brak wpisów. Zmiany w panelu będą tu rejestrowane.</p>
      ) : (
        <div className="overflow-x-auto rounded" style={{ border: "1px solid var(--border)" }}>
          <table className="w-full text-sm" style={{ color: "var(--text)" }}>
            <thead><tr style={{ background: "rgba(201,168,76,.06)", color: "var(--gold)" }}>
              {["Data", "Kto", "Akcja", "Sekcja", "Szczegóły"].map((h) => <th key={h} className="text-left font-serif text-[10px] tracking-[1px] uppercase px-3 py-3">{h}</th>)}
            </tr></thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td className="px-3 py-2" style={{ color: "var(--muted)" }}>{new Date(l.createdAt).toLocaleString("pl-PL")}</td>
                  <td className="px-3 py-2">{l.userName || "—"}</td>
                  <td className="px-3 py-2" style={{ color: ACTION_COLOR[l.action] || "var(--muted)" }}>{ACTION_LABEL[l.action] || l.action}</td>
                  <td className="px-3 py-2" style={{ color: "var(--muted)" }}>{l.entity}</td>
                  <td className="px-3 py-2">{l.detail || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
