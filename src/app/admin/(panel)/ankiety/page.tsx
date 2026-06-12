import { redirect } from "next/navigation";
import { getSession, canCustomers } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SurveysPage() {
  const s = await getSession();
  if (!s) redirect("/admin/login");
  if (!canCustomers(s.role)) redirect("/admin");

  const done = await prisma.survey.findMany({ where: { status: "DONE" }, orderBy: { submittedAt: "desc" }, take: 200 }).catch(() => []);
  const pending = await prisma.survey.count({ where: { status: "PENDING" } }).catch(() => 0);

  const ratings = done.map((d) => d.rating || 0).filter(Boolean);
  const avg = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2) : "—";
  const npsVals = done.map((d) => d.nps).filter((n): n is number => typeof n === "number");
  const promoters = npsVals.filter((n) => n >= 9).length;
  const detractors = npsVals.filter((n) => n <= 6).length;
  const nps = npsVals.length ? Math.round(((promoters - detractors) / npsVals.length) * 100) : null;

  const cards = [
    { label: "Wypełnione", value: String(done.length) },
    { label: "Średnia ocena", value: `${avg} / 5` },
    { label: "NPS", value: nps === null ? "—" : String(nps) },
    { label: "Oczekujące", value: String(pending) },
  ];

  return (
    <div>
      <h1 className="font-display text-gold-grad text-3xl mb-6 flex items-center gap-3"><span>📝</span> Ankiety po grze</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="p-5 rounded" style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--border)" }}>
            <div className="text-[11px] uppercase tracking-[1px] mb-2" style={{ color: "var(--muted)" }}>{c.label}</div>
            <div className="font-display" style={{ color: "var(--gold)", fontSize: 26 }}>{c.value}</div>
          </div>
        ))}
      </div>

      {done.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>Brak wypełnionych ankiet. Włącz ankietę w Ustawieniach (Klienci — auto-podziękowanie).</p>
      ) : (
        <div className="overflow-x-auto rounded" style={{ border: "1px solid var(--border)" }}>
          <table className="w-full text-sm" style={{ color: "var(--text)" }}>
            <thead><tr style={{ background: "rgba(201,168,76,.06)", color: "var(--gold)" }}>
              {["Data", "Klient", "Ocena", "NPS", "Komentarz"].map((h) => <th key={h} className="text-left font-serif text-[10px] tracking-[1px] uppercase px-3 py-3">{h}</th>)}
            </tr></thead>
            <tbody>
              {done.map((d) => (
                <tr key={d.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td className="px-3 py-2" style={{ color: "var(--muted)" }}>{d.submittedAt ? new Date(d.submittedAt).toLocaleDateString("pl-PL") : "—"}</td>
                  <td className="px-3 py-2">{d.customerName || d.customerEmail || "—"}</td>
                  <td className="px-3 py-2" style={{ color: "var(--gold)" }}>{"★".repeat(d.rating || 0)}<span style={{ color: "var(--dim)" }}>{"★".repeat(5 - (d.rating || 0))}</span></td>
                  <td className="px-3 py-2" style={{ color: "var(--muted)" }}>{typeof d.nps === "number" ? d.nps : "—"}</td>
                  <td className="px-3 py-2" style={{ color: "var(--muted)" }}>{d.comment || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
