"use client";
import { useRef } from "react";
import type { Room } from "@prisma/client";
import type { Locale, Dict } from "@/lib/i18n";
import { pick } from "@/lib/i18n";

const gradients = [
  "linear-gradient(135deg,var(--teal) 0%,#061020 100%)",
  "linear-gradient(135deg,#0A0A20 0%,#1A0A2E 100%)",
  "linear-gradient(135deg,#1A0A08 0%,#0A0A20 100%)",
];

export default function RoomCard({
  room,
  locale,
  t,
  index,
}: {
  room: Room;
  locale: Locale;
  t: Dict;
  index: number;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const glare = useRef<HTMLDivElement>(null);

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el || !window.matchMedia("(pointer: fine)").matches) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rotX = (0.5 - py) * 8;
    const rotY = (px - 0.5) * 8;
    el.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px)`;
    if (glare.current) {
      glare.current.style.background = `radial-gradient(400px circle at ${px * 100}% ${py * 100}%, rgba(201,168,76,.18), transparent 60%)`;
      glare.current.style.opacity = "1";
    }
  }
  function onLeave() {
    const el = ref.current;
    if (el) el.style.transform = "";
    if (glare.current) glare.current.style.opacity = "0";
  }

  const name = pick(room, "name", locale);
  const tagline = pick(room, "tagline", locale);
  const badge = pick(room, "badge", locale);
  const difficulty = pick(room, "difficulty", locale);
  const isSoon = room.status === "SOON";

  return (
    <a
      ref={ref}
      href={room.bookingUrl || `/${locale}#rezerwacja`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="group relative overflow-hidden no-underline block min-h-[480px] reveal reveal-scale tilt"
      style={{ transition: "transform .35s cubic-bezier(.16,1,.3,1)" }}
    >
      <div
        className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.06]"
        style={
          room.image
            ? { backgroundImage: `url(${room.image})`, backgroundSize: "cover", backgroundPosition: "center" }
            : { background: gradients[index % gradients.length] }
        }
      />
      <div className="absolute inset-0" style={{ background: "linear-gradient(0deg,rgba(4,12,20,.97) 0%,rgba(4,12,20,.4) 60%,transparent 100%)" }} />
      <div ref={glare} className="absolute inset-0 pointer-events-none" style={{ opacity: 0, transition: "opacity .3s" }} />
      <div className="absolute inset-0 transition-colors duration-500 group-hover:border-[rgba(201,168,76,.55)]" style={{ border: "1px solid rgba(201,168,76,.1)" }} />

      <span
        className="absolute top-6 left-6 font-serif text-[9px] tracking-[3px] uppercase px-3 py-[3px]"
        style={
          isSoon
            ? { border: "1px solid rgba(100,200,200,.3)", color: "#7dd3d0", background: "rgba(13,61,58,.3)" }
            : { border: "1px solid rgba(201,168,76,.5)", color: "var(--gold)", background: "rgba(201,168,76,.08)" }
        }
      >
        {badge}
      </span>

      <div className="absolute bottom-0 left-0 right-0 px-8 pb-9 pt-9 transition-transform duration-500 group-hover:-translate-y-1">
        <div className="font-display text-[28px] font-bold text-white mb-[10px] leading-[1.1]">{name}</div>
        {tagline && (
          <div className="text-sm mb-4 leading-[1.6] max-h-0 opacity-0 group-hover:max-h-24 group-hover:opacity-100 transition-all duration-500 overflow-hidden" style={{ color: "var(--muted)" }}>
            {tagline}
          </div>
        )}
        <div className="flex gap-4 flex-wrap">
          <span className="font-serif text-[10px] tracking-[1px] flex items-center gap-[5px]" style={{ color: "var(--gold)" }}>
            ⏱ {room.durationMin} {t.rooms.min}
          </span>
          <span className="font-serif text-[10px] tracking-[1px] flex items-center gap-[5px]" style={{ color: "var(--gold)" }}>
            👥 {room.minPlayers}–{room.maxPlayers} {t.rooms.people}
          </span>
          <span className="font-serif text-[10px] tracking-[1px] flex items-center gap-[5px]" style={{ color: "var(--gold)" }}>
            ⚡ {difficulty}
          </span>
        </div>
      </div>

      <span className="absolute bottom-9 right-8 font-serif text-[10px] tracking-[2px] uppercase opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-[-6px] group-hover:translate-x-0" style={{ color: "var(--gold)" }}>
        {t.rooms.explore}
      </span>
    </a>
  );
}
