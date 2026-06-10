import { redirect } from "next/navigation";
import { getSession, canFinance } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function VoucherPrintPage() {
  const s = await getSession();
  if (!s) redirect("/admin/login");
  if (!canFinance(s.role)) redirect("/admin");
  const vouchers = await prisma.voucher.findMany({ orderBy: { createdAt: "desc" }, take: 200 });

  return (
    <div>
      <h1 className="font-display text-gold-grad text-3xl mb-2 flex items-center gap-3"><span>🎁</span> Druk bonów (PDF)</h1>
      <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>Wygeneruj elegancki bon z kodem i QR do druku lub wysyłki. Edycja bonów: w sekcji „Bony podarunkowe".</p>
      {vouchers.length === 0 ? <p style={{ color: "var(--muted)" }}>Brak bonów.</p> : (
        <div className="overflow-x-auto rounded" style={{ border: "1px solid var(--border)" }}>
          <table className="w-full text-sm" style={{ color: "var(--text)" }}>
            <thead><tr style={{ background: "rgba(201,168,76,.06)", color: "var(--gold)" }}>{["Kod", "Na co", "Wartość", "Status", ""].map((h) => <th key={h} className="text-left font-serif text-[10px] uppercase tracking-[1px] px-3 py-3">{h}</th>)}</tr></thead>
            <tbody>
              {vouchers.map((v) => (
                <tr key={v.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td className="px-3 py-2 font-mono">{v.code}</td>
                  <td className="px-3 py-2">{v.titlePl}</td>
                  <td className="px-3 py-2" style={{ color: "var(--gold)" }}>{v.amount ? `${v.amount} zł` : "gra"}</td>
                  <td className="px-3 py-2" style={{ color: "var(--muted)" }}>{v.status}</td>
                  <td className="px-3 py-2"><a href={`/api/admin/voucher-pdf/${v.id}`} target="_blank" rel="noreferrer" className="text-xs px-3 py-1 rounded" style={{ border: "1px solid var(--border)", color: "var(--gold)" }}>⬇ Drukuj bon</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
