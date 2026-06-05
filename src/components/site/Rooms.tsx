import type { Room } from "@prisma/client";
import type { Locale, Dict } from "@/lib/i18n";
import SectionHeader from "./SectionHeader";
import RoomCard from "./RoomCard";

export default function Rooms({
  locale,
  t,
  rooms,
  hideHeader,
}: {
  locale: Locale;
  t: Dict;
  rooms: Room[];
  hideHeader?: boolean;
}) {
  return (
    <section
      className="px-6 md:px-[60px] py-20 md:py-[120px] relative z-[1] aurora"
      id="pokoje"
      style={{
        background:
          "linear-gradient(180deg,var(--navy-dd) 0%,var(--teal-m) 50%,var(--navy-dd) 100%)",
      }}
    >
      <div className="relative z-[1]">
        {!hideHeader && <SectionHeader label={t.rooms.label} title={t.rooms.title} />}
        {rooms.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>{t.rooms.empty}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(340px,1fr))] gap-[2px] max-w-[1200px] mx-auto">
            {rooms.map((room, i) => (
              <RoomCard key={room.id} room={room} locale={locale} t={t} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
