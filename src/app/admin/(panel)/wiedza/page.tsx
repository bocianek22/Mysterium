import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function render(content: string) {
  return content.split(/\n{2,}/).filter(Boolean).map((block, i) => {
    const lines = block.split("\n");
    if (lines.every((l) => l.trim().startsWith("- "))) {
      return <ul key={i} className="flex flex-col gap-1.5 mb-3 pl-1">{lines.map((l, j) => <li key={j} className="flex gap-2 text-sm" style={{ color: "var(--muted)" }}><span style={{ color: "var(--gold)" }}>◆</span>{l.replace(/^- /, "")}</li>)}</ul>;
    }
    if (block.startsWith("## ")) return <h3 key={i} className="font-display text-gold-grad text-lg mt-4 mb-1">{block.replace(/^## /, "")}</h3>;
    return <p key={i} className="text-sm leading-[1.8] mb-3" style={{ color: "var(--muted)" }}>{block}</p>;
  });
}

export default async function KbPage() {
  const s = await getSession();
  if (!s) redirect("/admin/login");
  const articles = await prisma.kbArticle.findMany({ where: { published: true }, orderBy: [{ pinned: "desc" }, { order: "asc" }, { createdAt: "desc" }] }).catch(() => []);

  return (
    <div>
      <h1 className="font-display text-gold-grad text-3xl mb-2 flex items-center gap-3"><span>📚</span> Baza wiedzy</h1>
      <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>Procedury, instrukcje i ogłoszenia dla zespołu.</p>
      {articles.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>Brak wpisów. Zarząd może je dodać w sekcji „Baza wiedzy (zespół)”.</p>
      ) : (
        <div className="flex flex-col gap-4 max-w-[820px]">
          {articles.map((a) => (
            <div key={a.id} className="p-5 rounded" style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--border)" }}>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {a.pinned && <span className="text-[10px] px-2 py-[2px] rounded" style={{ background: "var(--gold)", color: "#1a1206" }}>📌 przypięte</span>}
                {a.category && <span className="text-[10px] px-2 py-[2px] rounded" style={{ background: "rgba(201,168,76,.12)", color: "var(--gold)" }}>{a.category}</span>}
              </div>
              <h2 className="font-display text-gold-grad text-xl mb-2">{a.title}</h2>
              <div>{render(a.content)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
