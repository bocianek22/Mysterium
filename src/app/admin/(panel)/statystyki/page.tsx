import { redirect } from "next/navigation";
import { getSession, isManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
const MONTHS = ["Sty", "Lut", "Mar", "Kwi", "Maj", "Cze", "Lip", "Sie", "Wrz", "Paź", "Lis", "Gru"];
const zl = (n: number) => Math.round(n).toLocaleString("pl-PL") + " zł";

function Bars({ data, fmt, color }: { data: { label: string; value: number }[]; fmt: (n: number) => string; color?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-2 md:gap-3" style={{ height: 200 }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
          <div className="text-[10px] mb-1" style={{ color: "var(--muted)" }}>{d.value > 0 ? fmt(d.value) : ""}</div>
          <div className="w-full rounded-t" title={`${d.label}: ${fmt(d.value)}`} style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value > 0 ? 4 : 0, background: color || "linear-gradient(180deg,var(--gold-l),var(--gold-d))" }} />
          <div className="text-[10px] mt-2 text-center" style={{ color: "var(--dim)" }}>{d.label}</div>
        </div>
      ))}
    </div>
  );
}

export default async function StatsPage() {
  const s = await getSession();
  if (!s) redirect("/admin/login");
  if (!isManager(s.role)) redirect("/admin");

  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const [reservations, rooms, customers, messages] = await Promise.all([
    prisma.reservation.findMany({ where: { start: { gte: from } } }),
    prisma.room.findMany({ select: { id: true, namePl: true } }),
    prisma.customer.findMany({ select: { source: true, createdAt: true, marketingConsent: true } }).catch(() => []),
    prisma.contactMessage.findMany({ where: { createdAt: { gte: from } }, select: { createdAt: true } }).catch(() => []),
  ]);
  const active = reservations.filter((r) => r.status !== "CANCELLED");

  // Marketing: źródła klientów, nowi w czasie, zgody
  const SRC_LABEL: Record<string, string> = { MANUAL: "Ręcznie", RESERVATION: "Rezerwacja", CONTACT: "Formularz", NEWSLETTER: "Newsletter" };
  const bySource = Object.entries(
    customers.reduce((m: Record<string, number>, c) => { const k = c.source || "MANUAL"; m[k] = (m[k] || 0) + 1; return m; }, {})
  ).map(([k, v]) => ({ label: SRC_LABEL[k] || k, value: v as number }));
  const consent = customers.filter((c) => c.marketingConsent).length;
  const mkMonths = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    return {
      label: `${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`,
      newCust: customers.filter((c) => { const t = new Date(c.createdAt); return t >= d && t < end; }).length,
      msgs: messages.filter((c) => { const t = new Date(c.createdAt); return t >= d && t < end; }).length,
    };
  });

  // 6 miesięcy: przychód, gracze, liczba gier
  const months = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const inM = active.filter((r) => { const t = new Date(r.start); return t >= d && t < end; });
    return {
      label: `${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`,
      revenue: inM.reduce((a, r) => a + (r.price || 0), 0),
      players: inM.reduce((a, r) => a + (r.people || 0), 0),
      games: inM.length,
    };
  });

  const byRoom = rooms.map((r) => ({ label: r.namePl.slice(0, 10), value: active.filter((x) => x.roomId === r.id).length }));

  const statuses = [
    { key: "NEW", label: "Nowe" }, { key: "CONFIRMED", label: "Potw." }, { key: "DONE", label: "Zrealiz." }, { key: "CANCELLED", label: "Anul." },
  ].map((st) => ({ label: st.label, value: reservations.filter((r) => r.status === st.key).length }));

  const totalRev = months.reduce((a, m) => a + m.revenue, 0);
  const totalGames = active.length;
  const totalPlayers = active.reduce((a, r) => a + (r.people || 0), 0);
  const avg = totalGames ? Math.round(totalRev / totalGames) : 0;

  const cards = [
    { label: "Przychód (6 mies.)", value: zl(totalRev), c: "#7eebb0" },
    { label: "Gry (6 mies.)", value: String(totalGames), c: "var(--gold)" },
    { label: "Gracze (6 mies.)", value: String(totalPlayers), c: "var(--gold)" },
    { label: "Śr. wartość gry", value: zl(avg), c: "var(--gold-l)" },
  ];

  return (
    <div>
      <h1 className="font-display text-gold-grad text-3xl mb-6 flex items-center gap-3"><span>📈</span> Statystyki</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="p-5 rounded" style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--border)" }}>
            <div className="text-[11px] uppercase tracking-[1px] mb-2" style={{ color: "var(--muted)" }}>{c.label}</div>
            <div className="font-display" style={{ color: c.c, fontSize: 26 }}>{c.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded" style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--border)" }}>
          <h2 className="font-serif text-sm tracking-[2px] uppercase mb-5" style={{ color: "var(--gold)" }}>Przychód miesięcznie</h2>
          <Bars data={months.map((m) => ({ label: m.label, value: m.revenue }))} fmt={zl} />
        </div>
        <div className="p-5 rounded" style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--border)" }}>
          <h2 className="font-serif text-sm tracking-[2px] uppercase mb-5" style={{ color: "var(--gold)" }}>Gracze miesięcznie</h2>
          <Bars data={months.map((m) => ({ label: m.label, value: m.players }))} fmt={(n) => String(n)} color="linear-gradient(180deg,#5fb0d8,#2f6e92)" />
        </div>
        <div className="p-5 rounded" style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--border)" }}>
          <h2 className="font-serif text-sm tracking-[2px] uppercase mb-5" style={{ color: "var(--gold)" }}>Gry wg pokoju</h2>
          {byRoom.length ? <Bars data={byRoom} fmt={(n) => String(n)} color="linear-gradient(180deg,#c9a8ff,#6f5bb0)" /> : <p style={{ color: "var(--muted)" }}>Brak danych.</p>}
        </div>
        <div className="p-5 rounded" style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--border)" }}>
          <h2 className="font-serif text-sm tracking-[2px] uppercase mb-5" style={{ color: "var(--gold)" }}>Statusy rezerwacji</h2>
          <Bars data={statuses} fmt={(n) => String(n)} color="linear-gradient(180deg,#e0b257,#8a6314)" />
        </div>
      </div>

      <h2 className="font-display text-gold-grad text-2xl mt-10 mb-4 flex items-center gap-2"><span>📣</span> Marketing</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-5 rounded" style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--border)" }}>
          <div className="text-[11px] uppercase tracking-[1px] mb-2" style={{ color: "var(--muted)" }}>Klienci łącznie</div>
          <div className="font-display" style={{ color: "var(--gold)", fontSize: 26 }}>{customers.length}</div>
        </div>
        <div className="p-5 rounded" style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--border)" }}>
          <div className="text-[11px] uppercase tracking-[1px] mb-2" style={{ color: "var(--muted)" }}>Zgody marketingowe</div>
          <div className="font-display" style={{ color: "#7eebb0", fontSize: 26 }}>{consent}</div>
        </div>
        <div className="p-5 rounded" style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--border)" }}>
          <div className="text-[11px] uppercase tracking-[1px] mb-2" style={{ color: "var(--muted)" }}>Wiadomości (6 mies.)</div>
          <div className="font-display" style={{ color: "var(--gold)", fontSize: 26 }}>{messages.length}</div>
        </div>
        <div className="p-5 rounded" style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--border)" }}>
          <div className="text-[11px] uppercase tracking-[1px] mb-2" style={{ color: "var(--muted)" }}>Nowi (6 mies.)</div>
          <div className="font-display" style={{ color: "var(--gold)", fontSize: 26 }}>{mkMonths.reduce((a, m) => a + m.newCust, 0)}</div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded" style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--border)" }}>
          <h2 className="font-serif text-sm tracking-[2px] uppercase mb-5" style={{ color: "var(--gold)" }}>Źródła klientów</h2>
          {bySource.length ? <Bars data={bySource} fmt={(n) => String(n)} color="linear-gradient(180deg,#7eebb0,#2f8f63)" /> : <p style={{ color: "var(--muted)" }}>Brak danych.</p>}
        </div>
        <div className="p-5 rounded" style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--border)" }}>
          <h2 className="font-serif text-sm tracking-[2px] uppercase mb-5" style={{ color: "var(--gold)" }}>Nowi klienci miesięcznie</h2>
          <Bars data={mkMonths.map((m) => ({ label: m.label, value: m.newCust }))} fmt={(n) => String(n)} color="linear-gradient(180deg,#e0b257,#8a6314)" />
        </div>
      </div>

      <p className="text-xs mt-6" style={{ color: "var(--dim)" }}>Dane z ostatnich 6 miesięcy (bez anulowanych w sumach przychodu/graczy).</p>
    </div>
  );
}
