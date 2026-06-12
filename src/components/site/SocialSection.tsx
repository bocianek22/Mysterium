import type { Locale } from "@/lib/i18n";

type Social = { instagram?: string | null; facebook?: string | null; tiktok?: string | null; youtube?: string | null };

const ICONS: Record<string, React.ReactNode> = {
  instagram: (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
      <path d="M14 9h3l.4-3H14V4.2c0-.9.3-1.5 1.6-1.5H17V.1C16.7 0 15.7 0 14.6 0 12.1 0 10.5 1.5 10.5 4v2H7.5v3h3v9H14V9z" />
    </svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
      <path d="M16.5 2c.3 2.1 1.6 3.8 3.5 4.2v2.5c-1.3.1-2.5-.3-3.6-1v6.6c0 3.3-2.7 6-6 6s-6-2.7-6-6 2.7-6 6-6c.3 0 .6 0 .9.1v2.7c-.3-.1-.6-.2-.9-.2-1.8 0-3.3 1.5-3.3 3.3S8.1 17.6 9.9 17.6s3.3-1.5 3.3-3.3V2h3.3z" />
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
      <path d="M23 8.2s-.2-1.6-.9-2.3c-.9-.9-1.8-.9-2.3-1C16.7 4.6 12 4.6 12 4.6h0s-4.7 0-7.8.3c-.4 0-1.4.1-2.3 1C1.2 6.6 1 8.2 1 8.2S.8 10.1.8 12v1.7c0 1.9.2 3.8.2 3.8s.2 1.6.9 2.3c.9.9 2 .9 2.5 1 1.8.2 7.6.2 7.6.2s4.7 0 7.8-.3c.5-.1 1.4-.1 2.3-1 .7-.7.9-2.3.9-2.3s.2-1.9.2-3.8V12c0-1.9-.2-3.8-.2-3.8zM9.7 15.5V8.9l6.2 3.3-6.2 3.3z" />
    </svg>
  ),
};

const LABELS: Record<string, string> = { instagram: "Instagram", facebook: "Facebook", tiktok: "TikTok", youtube: "YouTube" };

export default function SocialSection({ locale, social }: { locale: Locale; social: Social }) {
  const pl = locale === "pl";
  const items = (["instagram", "facebook", "tiktok", "youtube"] as const)
    .map((k) => ({ k, url: social[k] }))
    .filter((i) => i.url);
  if (items.length === 0) return null;

  return (
    <section className="px-6 md:px-[60px] py-16 md:py-20 relative z-[1]" style={{ background: "var(--navy-d)" }} id="social">
      <div className="max-w-[900px] mx-auto text-center">
        <div className="sec-label reveal" style={{ marginBottom: 8 }}>{pl ? "Bądźmy w kontakcie" : "Stay connected"}</div>
        <h2 className="font-display text-gold-grad text-3xl md:text-4xl mb-3 reveal">{pl ? "Śledź nas w sieci" : "Follow us"}</h2>
        <p className="text-sm md:text-base mb-9 reveal reveal-d1" style={{ color: "var(--muted)" }}>
          {pl ? "Kulisy, nowości, konkursy i klimatyczne kadry z pokoi." : "Behind the scenes, news, contests and atmospheric shots."}
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          {items.map(({ k, url }, i) => (
            <a
              key={k}
              href={url!}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={LABELS[k]}
              className={`reveal reveal-d${(i % 4) + 1} group flex items-center gap-3 px-6 py-4 rounded-xl no-underline transition-all`}
              style={{ border: "1px solid var(--border)", background: "rgba(201,168,76,.04)", color: "var(--gold)", minWidth: 150 }}
            >
              <span className="transition-transform group-hover:scale-110">{ICONS[k]}</span>
              <span className="font-serif text-sm tracking-[1px]">{LABELS[k]}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
