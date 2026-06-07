import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { isLocale, getDict, pick, type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { pageMeta } from "@/lib/seo";
import PageHero from "@/components/site/PageHero";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const locale = params.locale as Locale;
  const t = getDict(locale);
  return pageMeta({ locale, title: `${t.blog.title} — Mysterium`, description: t.blog.sub, path: "/blog" });
}

export default async function BlogPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: [{ order: "desc" }, { createdAt: "desc" }],
  });
  const fmt = (d: Date) => new Date(d).toLocaleDateString(locale === "pl" ? "pl-PL" : "en-GB", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <>
      <PageHero label={t.blog.label} title={t.blog.title} subtitle={t.blog.sub} />
      <section className="px-6 md:px-[60px] pb-20 max-w-[1100px] mx-auto">
        {posts.length === 0 ? (
          <p className="text-center" style={{ color: "var(--muted)" }}>{t.blog.empty}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((p) => {
              const title = pick(p, "title", locale);
              const excerpt = pick(p, "excerpt", locale);
              return (
                <Link key={p.id} href={`/${locale}/blog/${p.slug}`} className="group no-underline rounded overflow-hidden flex flex-col transition-all hover:-translate-y-1" style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--border)" }}>
                  <div className="aspect-[16/10] overflow-hidden" style={{ background: "var(--navy-d)" }}>
                    {p.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.coverImage} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl" style={{ color: "var(--dim)" }}>🗝️</div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="font-serif text-[10px] tracking-[2px] uppercase mb-2" style={{ color: "var(--gold)" }}>{fmt(p.createdAt)}</div>
                    <h2 className="font-display text-lg mb-2" style={{ color: "var(--text)" }}>{title}</h2>
                    {excerpt && <p className="text-sm leading-[1.7] flex-1" style={{ color: "var(--muted)" }}>{excerpt.slice(0, 140)}{excerpt.length > 140 ? "…" : ""}</p>}
                    <span className="mt-4 text-xs" style={{ color: "var(--gold-l)" }}>{t.blog.readMore}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
