import type { Room } from "@prisma/client";
import type { Locale, Dict } from "@/lib/i18n";
import { pick } from "@/lib/i18n";
import SectionHeader from "./SectionHeader";

const gradients = [
  "linear-gradient(135deg,var(--teal) 0%,#061020 100%)",
  "linear-gradient(135deg,#0A0A20 0%,#1A0A2E 100%)",
  "linear-gradient(135deg,#1A0A08 0%,#0A0A20 100%)",
];

export default function Rooms({
  locale,
  t,
  rooms,
}: {
  locale: Locale;
  t: Dict;
  rooms: Room[];
}) {
  return (
    <section
      className="px-6 md:px-[60px] py-20 md:py-[120px] relative z-[1]"
      id="pokoje"
      style={{
        background:
          "linear-gradient(180deg,var(--navy-dd) 0%,var(--teal-m) 50%,var(--navy-dd) 100%)",
      }}
    >
      <SectionHeader label={t.rooms.label} title={t.rooms.title} />
      {rooms.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>{t.rooms.empty}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(340px,1fr))] gap-[2px] max-w-[1200px] mx-auto">
          {rooms.map((room, i) => {
            const name = pick(room, "name", locale);
            const tagline = pick(room, "tagline", locale);
            const badge = pick(room, "badge", locale);
            const difficulty = pick(room, "difficulty", locale);
            const isSoon = room.status === "SOON";
            return (
              <a
                key={room.id}
                href={room.bookingUrl || `/${locale}#rezerwacja`}
                className="group relative overflow-hidden no-underline block min-h-[480px]"
              >
                <div
                  className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.04]"
                  style={
                    room.image
                      ? { backgroundImage: `url(${room.image})`, backgroundSize: "cover", backgroundPosition: "center" }
                      : { background: gradients[i % gradients.length] }
                  }
                />
                <div className="absolute inset-0" style={{ background: "linear-gradient(0deg,rgba(4,12,20,.97) 0%,rgba(4,12,20,.4) 60%,transparent 100%)" }} />
                <div className="absolute inset-0 transition-colors duration-300" style={{ border: "1px solid rgba(201,168,76,.1)" }} />
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
                <div className="absolute bottom-0 left-0 right-0 px-8 pb-9 pt-9">
                  <div className="font-display text-[28px] font-bold text-white mb-[10px] leading-[1.1]">{name}</div>
                  {tagline && (
                    <div className="text-sm mb-4 leading-[1.6] opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ color: "var(--muted)" }}>
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
                <span className="absolute bottom-9 right-8 font-serif text-[10px] tracking-[2px] uppercase opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--gold)" }}>
                  {t.rooms.explore}
                </span>
              </a>
            );
          })}
        </div>
      )}
    </section>
  );
}
