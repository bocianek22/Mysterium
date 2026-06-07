import { redirect } from "next/navigation";
import { getSession, canFinance } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
const zl = (n: number) => (n || 0).toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " zł";

export default async function InvoicesPage() {
  const s = await getSession();
  if (!s) redirect("/admin/login");
  if (!canFinance(s.role)) redirect("/admin");

  const all = await prisma.reservation.findMany({ orderBy: { start: "desc" }, include: { assignedUser: { select: { name: true, email: true } } } });
  const items = all.filter((r) => r.invoiceUrl || r.fuelInvoiceUrl || r.otherInvoiceUrl || r.price || r.fuelCost || r.otherCost);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display text-gold-grad text-3xl flex items-center gap-3"><span>🧾</span> Faktury i koszty</h1>
        <a href="/api/admin/export/reservations" className="text-sm px-4 py-2 rounded" style={{ border: "1px solid var(--border)", color: "var(--gold)" }}>⬇ Eksport CSV</a>
      </div>
      <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>Wszystkie zlecenia z wartością lub kosztami. Kliknij załącznik, by otworzyć fakturę/paragon.</p>

      {items.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>Brak zleceń z finansami. Dodaj wartość/koszty przy rezerwacji.</p>
      ) : (
        <div className="overflow-x-auto rounded" style={{ border: "1px solid var(--border)" }}>
          <table className="w-full text-sm" style={{ color: "var(--text)" }}>
            <thead>
              <tr style={{ background: "rgba(201,168,76,.06)", color: "var(--gold)" }}>
                {["Nr", "Data", "Zlecenie", "Przychód", "Paliwo", "Inne", "Zysk", "Załączniki"].map((h) => (
                  <th key={h} className="text-left font-serif text-[10px] tracking-[1px] uppercase px-3 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((r) => {
                const profit = (r.price || 0) - (r.fuelCost || 0) - (r.otherCost || 0);
                return (
                  <tr key={r.id} style={{ borderTop: "1px solid var(--border)" }}>
                    <td className="px-3 py-3 whitespace-nowrap" style={{ color: "var(--gold)" }}>{r.refNo || "—"}</td>
                    <td className="px-3 py-3 whitespace-nowrap">{new Date(r.start).toLocaleDateString("pl-PL")}</td>
                    <td className="px-3 py-3">{r.title}{r.assignedUser ? <span style={{ color: "var(--dim)" }}> · {r.assignedUser.name || r.assignedUser.email}</span> : null}</td>
                    <td className="px-3 py-3 whitespace-nowrap">{zl(r.price)}</td>
                    <td className="px-3 py-3 whitespace-nowrap">{zl(r.fuelCost)}</td>
                    <td className="px-3 py-3 whitespace-nowrap">{zl(r.otherCost)}</td>
                    <td className="px-3 py-3 whitespace-nowrap" style={{ color: profit >= 0 ? "var(--gold)" : "#fca5a5" }}>{zl(profit)}</td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="flex gap-2">
                        {r.invoiceUrl && <a href={r.invoiceUrl} target="_blank" rel="noopener noreferrer" title="Faktura/paragon" style={{ color: "var(--gold-l)" }}>📄</a>}
                        {r.fuelInvoiceUrl && <a href={r.fuelInvoiceUrl} target="_blank" rel="noopener noreferrer" title="Faktura paliwo" style={{ color: "var(--gold-l)" }}>⛽</a>}
                        {r.otherInvoiceUrl && <a href={r.otherInvoiceUrl} target="_blank" rel="noopener noreferrer" title="Faktura inne" style={{ color: "var(--gold-l)" }}>🧾</a>}
                        {!r.invoiceUrl && !r.fuelInvoiceUrl && !r.otherInvoiceUrl && <span style={{ color: "var(--dim)" }}>—</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
