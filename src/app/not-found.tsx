import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center text-center px-6 relative z-[1]" style={{ background: "radial-gradient(ellipse at 50% 30%,rgba(13,61,58,.4),transparent 70%),var(--navy-dd)" }}>
      <div>
        <svg viewBox="0 0 100 140" fill="none" className="mx-auto mb-6" style={{ width: 64, height: 90, opacity: 0.85, filter: "drop-shadow(0 0 14px rgba(201,168,76,.4))", animation: "floaty 5s ease-in-out infinite" }}>
          <circle cx="50" cy="46" r="28" stroke="var(--gold)" strokeWidth="5" />
          <path d="M50 70 L64 122 H36 Z" stroke="var(--gold)" strokeWidth="5" strokeLinejoin="round" />
          <circle cx="50" cy="46" r="12" fill="rgba(201,168,76,.14)" />
        </svg>
        <div className="font-display text-gold-grad shimmer" style={{ fontSize: "clamp(64px,12vw,120px)", lineHeight: 1 }}>404</div>
        <h1 className="font-display text-gold-grad text-2xl md:text-3xl mt-2 mb-3">Zgubiłeś się w labiryncie</h1>
        <p className="text-base mb-2" style={{ color: "var(--muted)" }}>
          Ta strona zniknęła za ukrytymi drzwiami. Wróćmy do znanych korytarzy.
        </p>
        <p className="text-sm mb-8" style={{ color: "var(--dim)" }}>
          This page vanished behind a hidden door. Let&apos;s head back.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/pl" className="btn-gold">Strona główna</Link>
          <Link href="/pl/pokoje" className="btn-outline">Zobacz pokoje</Link>
        </div>
      </div>
    </main>
  );
}
