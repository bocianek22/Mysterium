import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { isLocale, getDict, pick, type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { pageMeta, siteUrl } from "@/lib/seo";
import BreadcrumbJsonLd from "@/components/site/BreadcrumbJsonLd";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { locale: string; slug: string } }): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const locale = params.locale as Locale;
  const post = await prisma.post.findUnique({ where: { slug: params.slug } });
  if (!post) return {};
  const title = pick(post, "title", locale);
  const desc = (pick(post, "excerpt", locale) || title).slice(0, 160);
  return pageMeta({ locale, title: `${title} — Mysterium`, description: desc, path: `/blog/${post.slug}`, image: post.coverImage });
}

export default async function PostPage({ params }: { params: { locale: string; slug: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  const post = await prisma.post.findUnique({ where: { slug: params.slug } });
  if (!post || !post.published) notFound();

  const title = pick(post, "title", locale);
  const content = pick(post, "content", locale);
  const fmt = (d: Date) => new Date(d).toLocaleDateString(locale === "pl" ? "pl-PL" : "en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const paragraphs = content.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    datePublished: post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    image: post.coverImage ? [post.coverImage] : undefined,
    author: { "@type": "Organization", name: "MYSTERIUM" },
    publisher: { "@type": "Organization", name: "MYSTERIUM", logo: { "@type": "ImageObject", url: `${siteUrl()}/logo.png` } },
    mainEntityOfPage: `${siteUrl()}/${locale}/blog/${post.slug}`,
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BreadcrumbJsonLd items={[{ name: "Mysterium", path: `/${locale}` }, { name: "Blog", path: `/${locale}/blog` }, { name: title, path: `/${locale}/blog/${post.slug}` }]} />
      <section className="relative overflow-hidden pt-[140px] pb-12 px-6 md:px-[60px]">
        {post.coverImage ? (
          <>
            <div className="absolute inset-0" style={{ backgroundImage: `url(${post.coverImage})`, backgroundSize: "cover", backgroundPosition: "center" }} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(0deg,var(--navy-dd) 5%,rgba(4,12,20,.85) 55%,rgba(4,12,20,.7))" }} />
          </>
        ) : (
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 0%,rgba(13,61,58,.45),transparent 70%),var(--navy-dd)" }} />
        )}
        <div className="relative z-[1] max-w-[760px] mx-auto text-center">
          <div className="font-serif text-[11px] tracking-[4px] uppercase mb-4" style={{ color: "var(--gold)" }}>{fmt(post.createdAt)}</div>
          <h1 className="font-display text-gold-grad font-bold" style={{ fontSize: "clamp(28px,5vw,52px)", lineHeight: 1.1 }}>{title}</h1>
        </div>
      </section>

      <section className="px-6 md:px-[60px] pb-20 max-w-[760px] mx-auto">
        <div className="flex flex-col gap-5">
          {paragraphs.length === 0 ? (
            <p style={{ color: "var(--muted)" }}>{pick(post, "excerpt", locale)}</p>
          ) : paragraphs.map((p, i) => (
            <p key={i} className="text-[16px] leading-[1.9]" style={{ color: "var(--text)" }}>{p}</p>
          ))}
        </div>
        <div className="mt-12">
          <Link href={`/${locale}/blog`} className="text-sm no-underline" style={{ color: "var(--gold)" }}>{t.blog.back}</Link>
        </div>
      </section>
    </article>
  );
}
