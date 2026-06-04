"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale, Dict } from "@/lib/i18n";

export default function Nav({ locale, t }: { locale: Locale; t: Dict }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Druga wersja językowa tej samej ścieżki
  const otherLocale: Locale = locale === "pl" ? "en" : "pl";
  const otherPath = pathname.replace(/^\/(pl|en)/, `/${otherLocale}`);

  const links = [
    { href: `/${locale}#pokoje`, label: t.nav.rooms },
    { href: `/${locale}#jak-to-dziala`, label: t.nav.how },
    { href: `/${locale}#cennik`, label: t.nav.pricing },
    { href: `/${locale}#galeria`, label: t.nav.gallery },
    { href: `/${locale}#opinie`, label: t.nav.reviews },
    { href: `/${locale}#kontakt`, label: t.nav.contact },
  ];

  return (
    <nav
      className="fixed top-0 w-full z-[1000] flex justify-between items-center transition-all duration-300 px-6 md:px-[60px] py-[14px] md:py-[18px]"
      style={
        scrolled
          ? {
              background: "rgba(4,12,20,.97)",
              backdropFilter: "blur(16px)",
              borderBottom: "1px solid var(--border)",
            }
          : undefined
      }
    >
      <Link href={`/${locale}`} className="flex items-center gap-3 no-underline">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/uploads/logo.png"
          alt="Mysterium"
          className="h-9 md:h-11"
          style={{ filter: "drop-shadow(0 0 10px rgba(201,168,76,.4))" }}
          onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
        />
        <span className="font-display text-gold-grad text-[15px] md:text-base tracking-wide">
          MYSTERIUM
        </span>
      </Link>

      <ul className="hidden md:flex gap-8 list-none">
        {links.map((l) => (
          <li key={l.href}>
            <a
              href={l.href}
              className="font-serif text-[11px] tracking-[2px] uppercase transition-colors"
              style={{ color: "var(--muted)" }}
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-3 md:gap-4">
        <Link
          href={otherPath}
          className="font-serif text-[11px] tracking-[2px] uppercase"
          style={{ color: "var(--gold)" }}
          aria-label="Change language"
        >
          {otherLocale.toUpperCase()}
        </Link>
        <a
          href={`/${locale}#rezerwacja`}
          className="hidden sm:inline-block px-[26px] py-[10px] font-serif text-[11px] tracking-[2px] uppercase no-underline transition-all"
          style={{
            border: "1px solid var(--gold)",
            color: "var(--gold)",
            clipPath:
              "polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)",
          }}
        >
          {t.nav.book}
        </a>
        <button
          className="md:hidden text-gold text-2xl"
          style={{ color: "var(--gold)" }}
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
        >
          ☰
        </button>
      </div>

      {open && (
        <div
          className="md:hidden absolute top-full left-0 right-0 flex flex-col gap-1 p-4"
          style={{
            background: "rgba(4,12,20,.98)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="font-serif text-xs tracking-[2px] uppercase py-3"
              style={{ color: "var(--muted)" }}
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
