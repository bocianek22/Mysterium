import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { pageMeta } from "@/lib/seo";
import { DEFAULT_PAGE_MAP } from "@/lib/defaultPages";
import PageHero from "@/components/site/PageHero";

export const dynamic = "force-dynamic";

async function load(slug: string, locale: Locale) {
  const db = await prisma.page.findUnique({ where: { slug } }).catch(() => null);
  if (db && db.published) {
    return {
      title: (locale === "en" ? db.titleEn : db.titlePl) || db.titlePl,
      content: (locale === "en" ? db.contentEn : db.contentPl) || db.contentPl,
    };
  }
  const def = DEFAULT_PAGE_MAP[slug];
  if (def) return { title: locale === "en" ? def.titleEn : def.titlePl, content: def.contentEn || def.contentPl };
  return null;
}

export async function generateMetadata({ params }: { params: { locale: string; slug: string } }): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const locale = params.locale as Locale;
  const p = await load(params.slug, locale);
  if (!p) return {};
  return pageMeta({ locale, title: p.title, description: p.content.slice(0, 155).replace(/\n/g, " "), path: `/${params.slug}` });
}

function renderContent(content: string) {
  const blocks = content.split(/\n{2,}/).filter(Boolean);
  return blocks.map((block, bi) => {
    const lines = block.split("\n");
    if (lines.every((l) => l.trim().startsWith("- "))) {
      return (
        <ul key={bi} className="flex flex-col gap-2 mb-5 pl-1">
          {lines.map((l, i) => (
            <li key={i} className="flex items-start gap-3 text-[15px] leading-[1.8]" style={{ color: "var(--muted)" }}>
              <span style={{ color: "var(--gold)" }}>◆</span>
              <span>{l.replace(/^- /, "")}</span>
            </li>
          ))}
        </ul>
      );
    }
    if (block.startsWith("## ")) {
      return <h2 key={bi} className="font-display text-gold-grad text-xl md:text-2xl mt-8 mb-3">{block.replace(/^## /, "")}</h2>;
    }
    return <p key={bi} className="text-[15px] md:text-base leading-[1.95] mb-4" style={{ color: "var(--muted)" }}>{block}</p>;
  });
}

export default async function DynamicPage({ params }: { params: { locale: string; slug: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const p = await load(params.slug, locale);
  if (!p) notFound();

  return (
    <>
      <PageHero label={locale === "pl" ? "Informacje" : "Information"} title={p.title} />
      <section className="px-6 md:px-[60px] py-12 md:py-16 relative z-[1]" style={{ background: "var(--navy-dd)" }}>
        <div className="max-w-[820px] mx-auto reveal">{renderContent(p.content)}</div>
      </section>
    </>
  );
}
