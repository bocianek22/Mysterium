"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale, Dict } from "@/lib/i18n";

export default function Nav({ locale, t, logoUrl }: { locale: Locale; t: Dict; logoUrl?: string | null }) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 60);
      setHidden(y > 400 && y > last && !open);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [open]);

  useEffect(() => setOpen(false), [pathname]);

  const otherLocale: Locale = locale === "pl" ? "en" : "pl";
  const otherPath = pathname.replace(/^\/(pl|en)/, `/${otherLocale}`);

  const links = [
    { href: `/${locale}/pokoje`, label: t.nav.rooms },
    { href: `/${locale}/mobilna`, label: t.nav.mobile },
    { href: `/${locale}/eventy`, label: t.nav.events },
    { href: `/${locale}/bony`, label: t.nav.vouchers },
    { href: `/${locale}/galeria`, label: t.nav.gallery },
    { href: `/${locale}/cennik`, label: t.nav.pricing },
    { href: `/${locale}/blog`, label: t.nav.blog },
    { href: `/${locale}/o-nas`, label: t.nav.about },
    { href: `/${locale}/kontakt`, label: t.nav.contact },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <nav
      className="fixed top-0 w-full z-[1000] flex justify-between items-center transition-all duration-500 px-6 md:px-[60px] py-[14px] md:py-[18px]"
      style={{
        transform: hidden ? "translateY(-100%)" : "translateY(0)",
        ...(scrolled
          ? { background: "rgba(4,12,20,.97)", backdropFilter: "blur(16px)", borderBottom: "1px solid var(--border)" }
          : {}),
      }}
    >
      <Link href={`/${locale}`} className="flex items-center gap-3 no-underline">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl || "/logo.png"}
          alt="Mysterium"
          className="h-9 md:h-11"
          style={{ filter: "drop-shadow(0 0 10px rgba(201,168,76,.4))" }}
          onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
        />
        <span className="font-display text-gold-grad text-[15px] md:text-base tracking-wide">MYSTERIUM</span>
      </Link>

      <ul className="hidden xl:flex gap-6 list-none">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="relative font-serif text-[11px] tracking-[2px] uppercase transition-colors hover:text-[var(--gold)] group no-underline"
              style={{ color: isActive(l.href) ? "var(--gold)" : "var(--muted)" }}
            >
              {l.label}
              <span className="absolute -bottom-1 left-0 h-[1px] bg-[var(--gold)] transition-all duration-300 group-hover:w-full" style={{ width: isActive(l.href) ? "100%" : "0%" }} />
            </Link>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-3 md:gap-4">
        <Link href={otherPath} className="font-serif text-[11px] tracking-[2px] uppercase no-underline" style={{ color: "var(--gold)" }} aria-label="Change language">
          {otherLocale.toUpperCase()}
        </Link>
        <Link
          href={`/${locale}/rezerwacja`}
          className="hidden sm:inline-block px-[26px] py-[10px] font-serif text-[11px] tracking-[2px] uppercase no-underline transition-all"
          style={{ border: "1px solid var(--gold)", color: "var(--gold)", clipPath: "polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)" }}
        >
          {t.nav.book}
        </Link>
        <button className="xl:hidden text-2xl" style={{ color: "var(--gold)" }} onClick={() => setOpen((o) => !o)} aria-label="Menu">☰</button>
      </div>

      {open && (
        <div className="xl:hidden absolute top-full left-0 right-0 flex flex-col gap-1 p-4" style={{ background: "rgba(4,12,20,.98)", borderBottom: "1px solid var(--border)" }}>
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="font-serif text-xs tracking-[2px] uppercase py-3 no-underline" style={{ color: isActive(l.href) ? "var(--gold)" : "var(--muted)" }}>
              {l.label}
            </Link>
          ))}
          <Link href={`/${locale}/rezerwacja`} className="font-serif text-xs tracking-[2px] uppercase py-3 no-underline" style={{ color: "var(--gold)" }}>
            {t.nav.book}
          </Link>
        </div>
      )}
    </nav>
  );
}
