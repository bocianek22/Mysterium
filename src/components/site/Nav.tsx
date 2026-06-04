"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale, Dict } from "@/lib/i18n";

export default function Nav({ locale, t }: { locale: Locale; t: Dict }) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [active, setActive] = useState("");
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

  useEffect(() => {
    const ids = ["pokoje", "jak-to-dziala", "cennik", "galeria", "opinie", "kontakt"];
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    if (sections.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [pathname]);

  // Druga wersja językowa tej samej ścieżki
  const otherLocale: Locale = locale === "pl" ? "en" : "pl";
  const otherPath = pathname.replace(/^\/(pl|en)/, `/${otherLocale}`);

  const links = [
    { id: "pokoje", href: `/${locale}#pokoje`, label: t.nav.rooms },
    { id: "jak-to-dziala", href: `/${locale}#jak-to-dziala`, label: t.nav.how },
    { id: "cennik", href: `/${locale}#cennik`, label: t.nav.pricing },
    { id: "galeria", href: `/${locale}#galeria`, label: t.nav.gallery },
    { id: "opinie", href: `/${locale}#opinie`, label: t.nav.reviews },
    { id: "kontakt", href: `/${locale}#kontakt`, label: t.nav.contact },
  ];

  return (
    <nav
      className="fixed top-0 w-full z-[1000] flex justify-between items-center transition-all duration-500 px-6 md:px-[60px] py-[14px] md:py-[18px]"
      style={{
        transform: hidden ? "translateY(-100%)" : "translateY(0)",
        ...(scrolled
          ? {
              background: "rgba(4,12,20,.97)",
              backdropFilter: "blur(16px)",
              borderBottom: "1px solid var(--border)",
            }
          : {}),
      }}
    >
      <Link href={`/${locale}`} className="flex items-center gap-3 no-underline">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/uploads/logo.png"
          alt="Mysterium"
          className="h-9 md:h-11"
          style={{ filter: "drop-shadow(0 0 10px rgba(201,168,76,.4))", display: "none" }}
          onLoad={(e) => ((e.target as HTMLImageElement).style.display = "block")}
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
              className="relative font-serif text-[11px] tracking-[2px] uppercase transition-colors hover:text-[var(--gold)] group"
              style={{ color: active === l.id ? "var(--gold)" : "var(--muted)" }}
            >
              {l.label}
              <span
                className="absolute -bottom-1 left-0 h-[1px] bg-[var(--gold)] transition-all duration-300 group-hover:w-full"
                style={{ width: active === l.id ? "100%" : "0%" }}
              />
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
