"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { resources, resourceKeys } from "@/lib/resourceConfig";

type Item = { href: string; label: string; icon: string };

export default function Sidebar({
  email,
  role,
  name,
}: {
  email: string;
  role: string;
  name?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const isManager = role === "OWNER" || role === "ADMIN";

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const operations: Item[] = isManager
    ? [
        { href: "/admin", label: "Pulpit", icon: "📊" },
        { href: "/admin/rezerwacje", label: "Rezerwacje", icon: "📅" },
        { href: "/admin/grafik", label: "Grafik", icon: "🗓️" },
        { href: "/admin/wyplaty", label: "Wypłaty", icon: "💵" },
        { href: "/admin/users", label: "Pracownicy", icon: "👥" },
      ]
    : [
        { href: "/admin", label: "Pulpit", icon: "📊" },
        { href: "/admin/grafik", label: "Mój grafik", icon: "🗓️" },
        { href: "/admin/dyspozycyjnosc", label: "Dyspozycyjność", icon: "✋" },
      ];

  const content: Item[] = isManager
    ? [
        ...resourceKeys.map((key) => ({
          href: `/admin/${key}`,
          label: resources[key].label,
          icon: resources[key].icon,
        })),
        { href: "/admin/settings", label: "Ustawienia", icon: "⚙️" },
      ]
    : [];

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const renderLinks = (items: Item[]) =>
    items.map((it) => (
      <Link
        key={it.href}
        href={it.href}
        onClick={() => setOpen(false)}
        className="flex items-center gap-3 px-4 py-[10px] text-sm rounded transition-colors"
        style={isActive(it.href) ? { background: "rgba(201,168,76,.1)", color: "var(--gold)" } : { color: "var(--muted)" }}
      >
        <span>{it.icon}</span>
        {it.label}
      </Link>
    ));

  return (
    <>
      <div className="md:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-30" style={{ background: "var(--navy-d)", borderBottom: "1px solid var(--border)" }}>
        <span className="font-display text-gold-grad text-lg">MYSTERIUM</span>
        <button onClick={() => setOpen((o) => !o)} style={{ color: "var(--gold)" }} className="text-2xl" aria-label="Menu">☰</button>
      </div>

      <aside
        className={`${open ? "block" : "hidden"} md:block w-full md:w-[250px] md:min-h-screen md:sticky md:top-0 flex-shrink-0`}
        style={{ background: "var(--navy-d)", borderRight: "1px solid var(--border)" }}
      >
        <div className="hidden md:block p-6 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="font-display text-gold-grad text-xl">MYSTERIUM</div>
          <div className="font-serif text-[9px] tracking-[3px] uppercase mt-1" style={{ color: "var(--muted)" }}>
            {isManager ? "Panel zarządzania" : "Panel pracownika"}
          </div>
        </div>

        <nav className="p-3 flex flex-col gap-1">{renderLinks(operations)}</nav>

        {content.length > 0 && (
          <>
            <div className="px-4 pt-2 pb-1 text-[9px] font-serif tracking-[2px] uppercase" style={{ color: "var(--dim)" }}>
              Treść strony
            </div>
            <nav className="p-3 pt-0 flex flex-col gap-1">{renderLinks(content)}</nav>
          </>
        )}

        <div className="p-3 mt-2 border-t" style={{ borderColor: "var(--border)" }}>
          <a href="/" target="_blank" className="flex items-center gap-3 px-4 py-[10px] text-sm no-underline" style={{ color: "var(--muted)" }}>
            🌐 Zobacz stronę
          </a>
          <button onClick={logout} className="flex items-center gap-3 px-4 py-[10px] text-sm w-full text-left" style={{ color: "var(--muted)" }}>
            🚪 Wyloguj
          </button>
          <div className="px-4 py-2 text-[11px] truncate" style={{ color: "var(--dim)" }}>
            {name || email}
            <span className="ml-1" style={{ color: "var(--gold)" }}>
              · {role === "OWNER" ? "Właściciel" : role === "ADMIN" ? "Admin" : "Pracownik"}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
