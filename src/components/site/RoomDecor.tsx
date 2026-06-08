// Dekoracje tematyczne podstron pokoi — szczegółowe rekwizyty SVG (klimat).
// Renderowane w hero, pod treścią; czysto wizualne (pointer-events: none).

function Pirate() {
  const spokes = Array.from({ length: 8 }).map((_, i) => {
    const a = (i * Math.PI) / 4;
    const x1 = 60 + Math.cos(a) * 20, y1 = 60 + Math.sin(a) * 20;
    const x2 = 60 + Math.cos(a) * 50, y2 = 60 + Math.sin(a) * 50;
    return (
      <g key={i}>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#7a5430" strokeWidth="6" strokeLinecap="round" />
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#a9794a" strokeWidth="2" strokeLinecap="round" />
        <circle cx={x2} cy={y2} r="6" fill="#6b4a2a" />
      </g>
    );
  });
  return (
    <div className="room-decor" aria-hidden="true">
      {/* koło sterowe statku */}
      <svg className="decor decor-wheel" viewBox="0 0 120 120" style={{ right: "-34px", bottom: "-34px", width: "clamp(190px,28vw,340px)", opacity: 0.5 }}>
        {spokes}
        <g fill="none"><circle cx="60" cy="60" r="34" stroke="#7a5430" strokeWidth="6" /><circle cx="60" cy="60" r="34" stroke="#a9794a" strokeWidth="2" /><circle cx="60" cy="60" r="22" stroke="#6b4a2a" strokeWidth="4" /></g>
        <circle cx="60" cy="60" r="9" fill="#7a5430" />
      </svg>
      {/* skrzynia ze skarbem */}
      <svg className="decor" viewBox="0 0 120 92" style={{ left: "2%", bottom: "-8px", width: "clamp(130px,19vw,230px)", opacity: 0.62 }}>
        <ellipse className="decor-treasure-glow" cx="60" cy="46" rx="42" ry="9" fill="#ffd86b" />
        <path d="M10 46 Q60 8 110 46 Z" fill="#6b4626" stroke="#33220f" strokeWidth="2" />
        <rect x="10" y="44" width="100" height="42" rx="4" fill="#553a1f" stroke="#33220f" strokeWidth="2" />
        <g fill="#c9a84c" stroke="#8a6314" strokeWidth="1">
          <rect x="28" y="12" width="7" height="74" /><rect x="85" y="12" width="7" height="74" />
          <rect x="8" y="44" width="104" height="6" />
        </g>
        <rect x="53" y="40" width="14" height="16" rx="2" fill="#e0b257" stroke="#8a6314" /><circle cx="60" cy="48" r="2.5" fill="#33220f" />
        <g fill="#ffe08a" className="decor-treasure-glow"><circle cx="40" cy="40" r="3" /><circle cx="74" cy="42" r="2.5" /><circle cx="60" cy="36" r="2" /></g>
      </svg>
    </div>
  );
}

function Loch() {
  const web = (
    <g stroke="#d8d0bf" strokeWidth="0.6" fill="none" opacity="0.9">
      <path d="M0 0 L100 22" /><path d="M0 0 L78 60" /><path d="M0 0 L40 100" /><path d="M0 0 L100 0" /><path d="M0 0 L0 100" />
      <path d="M22 0 Q16 16 0 22" /><path d="M50 0 Q34 34 0 50" /><path d="M82 0 Q56 56 0 82" />
    </g>
  );
  return (
    <div className="room-decor" aria-hidden="true">
      {/* pajęczyny w narożnikach */}
      <svg className="decor" viewBox="0 0 100 100" style={{ top: 0, left: 0, width: "min(28vw,200px)", height: "min(28vw,200px)", opacity: 0.22 }}>{web}</svg>
      <svg className="decor" viewBox="0 0 100 100" style={{ top: 0, right: 0, width: "min(24vw,170px)", height: "min(24vw,170px)", opacity: 0.18, transform: "scaleX(-1)" }}>{web}</svg>
      {/* żelazny kinkiet z płomieniem */}
      <svg className="decor" viewBox="0 0 80 150" style={{ left: "9.5%", top: "5%", width: "clamp(74px,10vw,128px)", opacity: 0.92 }}>
        <rect x="6" y="8" width="9" height="86" rx="2" fill="#1f1810" />
        <circle cx="10.5" cy="14" r="3" fill="#0c0805" /><circle cx="10.5" cy="88" r="3" fill="#0c0805" />
        <path d="M12 30 Q44 34 44 64" stroke="#241b12" strokeWidth="6" fill="none" />
        <path d="M30 60 L58 60 L52 80 L36 80 Z" fill="#191108" stroke="#000" strokeWidth="1" />
        <ellipse className="decor-flame" cx="44" cy="50" rx="12" ry="18" fill="#ff9a30" opacity="0.55" />
        <path className="decor-flame" d="M44 64 C36 52 41 44 44 33 C47 44 52 52 44 64 Z" fill="#ffd070" />
        <path className="decor-flame" d="M44 62 C39 54 42 49 44 42 C46 49 49 54 44 62 Z" fill="#fff2c0" />
      </svg>
      {/* łańcuch zwisający */}
      <svg className="decor" viewBox="0 0 16 200" style={{ right: "22%", top: 0, width: "16px", height: "min(46vh,320px)", opacity: 0.5 }}>
        {Array.from({ length: 11 }).map((_, i) => (
          <ellipse key={i} cx="8" cy={12 + i * 18} rx={i % 2 ? 6 : 4} ry="8" fill="none" stroke="#2b211780" strokeWidth="3" />
        ))}
      </svg>
    </div>
  );
}

function Horror() {
  const drips = [
    { x: 6, h: 22, c: "d1" }, { x: 15, h: 38, c: "d2" }, { x: 27, h: 16, c: "d3" },
    { x: 41, h: 30, c: "d4" }, { x: 55, h: 46, c: "d1" }, { x: 68, h: 20, c: "d3" },
    { x: 80, h: 34, c: "d2" }, { x: 92, h: 26, c: "d4" },
  ];
  return (
    <div className="room-decor" aria-hidden="true">
      {/* krew ściekająca z góry */}
      <svg className="decor" preserveAspectRatio="none" viewBox="0 0 100 60" style={{ top: 0, left: 0, width: "100%", height: "34%", opacity: 0.9 }}>
        <path d="M0 0 H100 V6 Q92 11 84 6 T68 6 T52 7 T36 5 T20 7 T0 5 Z" fill="#56090a" />
        <g fill="#6c0d0d">
          {drips.map((d, i) => (
            <g key={i} className={`decor-drip ${d.c}`}>
              <rect x={d.x} y="0" width="2.4" height={d.h} />
              <circle cx={d.x + 1.2} cy={d.h} r="2" />
            </g>
          ))}
        </g>
      </svg>
      {/* zadrapania pazurami */}
      <svg className="decor" viewBox="0 0 120 130" style={{ right: "5%", top: "26%", width: "clamp(150px,24vw,320px)", opacity: 0.5 }}>
        <g stroke="#4a0708" strokeWidth="3" fill="none" strokeLinecap="round">
          <path d="M8 6 C36 40 64 72 96 122" /><path d="M26 2 C52 38 78 70 108 118" /><path d="M44 4 C68 36 92 70 118 112" />
        </g>
      </svg>
      {/* rozbryzgi krwi */}
      <svg className="decor decor-splat" viewBox="0 0 120 100" style={{ left: "4%", bottom: "4%", width: "clamp(120px,20vw,240px)", opacity: 0.55 }}>
        <g fill="#5a0a0b">
          <ellipse cx="40" cy="60" rx="30" ry="20" /><circle cx="74" cy="44" r="9" /><circle cx="86" cy="64" r="6" />
          <circle cx="18" cy="40" r="5" /><circle cx="64" cy="80" r="7" /><circle cx="96" cy="40" r="3" /><circle cx="14" cy="70" r="3.5" />
        </g>
      </svg>
    </div>
  );
}

function Occult() {
  const candle = (x: number, h: number, key: number) => (
    <g key={key}>
      <ellipse className="decor-flame" cx={x} cy={84 - h} rx="9" ry="14" fill="#c9a8ff" opacity="0.35" />
      <path className="decor-flame" d={`M${x} ${94 - h} C${x - 4} ${86 - h} ${x - 1} ${82 - h} ${x} ${76 - h} C${x + 1} ${82 - h} ${x + 4} ${86 - h} ${x} ${94 - h} Z`} fill="#ffd070" />
      <rect x={x - 4} y={94 - h} width="8" height={h + 6} rx="2" fill="#d8cdb0" />
      <ellipse cx={x} cy={100} rx="9" ry="3" fill="#1a142e" />
    </g>
  );
  return (
    <div className="room-decor" aria-hidden="true">
      <svg className="decor" viewBox="0 0 200 110" style={{ left: "50%", bottom: "2%", transform: "translateX(-50%)", width: "clamp(220px,40vw,460px)", opacity: 0.7 }}>
        {candle(40, 40, 1)}{candle(100, 56, 2)}{candle(160, 36, 3)}
      </svg>
    </div>
  );
}

function Tomb() {
  return (
    <div className="room-decor" aria-hidden="true">
      {/* pochodnia na ścianie */}
      <svg className="decor" viewBox="0 0 60 150" style={{ right: "9%", top: "8%", width: "clamp(56px,8vw,100px)", opacity: 0.88 }}>
        <rect x="25" y="40" width="10" height="92" rx="3" fill="#5a4326" />
        <path d="M20 44 L40 44 L36 26 L24 26 Z" fill="#6b5230" stroke="#3a2c16" />
        <ellipse className="decor-flame" cx="30" cy="20" rx="13" ry="20" fill="#ff9a30" opacity="0.5" />
        <path className="decor-flame" d="M30 34 C21 20 27 12 30 0 C33 12 39 20 30 34 Z" fill="#ffd070" />
      </svg>
      {/* kolumna hieroglifów */}
      <svg className="decor" viewBox="0 0 40 200" style={{ left: "6%", top: "10%", width: "clamp(44px,6vw,80px)", height: "min(60vh,420px)", opacity: 0.3 }}>
        <rect x="2" y="0" width="36" height="200" rx="2" fill="none" stroke="#e6c067" strokeWidth="1.5" />
        <g fill="#e6c067">
          <circle cx="20" cy="16" r="5" /><rect x="12" y="30" width="16" height="4" /><path d="M12 44 L28 44 L20 56 Z" />
          <rect x="17" y="66" width="6" height="18" /><rect x="11" y="72" width="18" height="5" />
          <circle cx="20" cy="100" r="6" fill="none" stroke="#e6c067" strokeWidth="3" /><rect x="18" y="106" width="4" height="16" />
          <path d="M12 134 Q20 126 28 134 Q20 142 12 134 Z" /><rect x="12" y="150" width="16" height="4" /><rect x="12" y="158" width="16" height="4" />
          <path d="M20 174 L26 186 L14 186 Z" />
        </g>
      </svg>
    </div>
  );
}

function Steampunk() {
  return (
    <div className="room-decor" aria-hidden="true">
      {/* rury */}
      <svg className="decor" viewBox="0 0 60 200" style={{ left: "5%", top: 0, width: "clamp(40px,6vw,72px)", height: "100%", opacity: 0.5 }} preserveAspectRatio="none">
        <rect x="14" y="0" width="20" height="200" fill="#5a4326" stroke="#2a1f12" strokeWidth="2" />
        <rect x="10" y="40" width="28" height="10" rx="2" fill="#7a5a30" /><rect x="10" y="150" width="28" height="10" rx="2" fill="#7a5a30" />
        <rect x="16" y="0" width="5" height="200" fill="#ffffff" opacity="0.06" />
      </svg>
      {/* manometr */}
      <svg className="decor" viewBox="0 0 100 100" style={{ right: "7%", top: "12%", width: "clamp(90px,14vw,170px)", opacity: 0.62 }}>
        <circle cx="50" cy="50" r="42" fill="#1c150d" stroke="#c98a3c" strokeWidth="5" />
        <circle cx="50" cy="50" r="42" fill="none" stroke="#e0a85a" strokeWidth="1.5" />
        {Array.from({ length: 11 }).map((_, i) => {
          const a = (-210 + i * 24) * (Math.PI / 180);
          return <line key={i} x1={50 + Math.cos(a) * 34} y1={50 + Math.sin(a) * 34} x2={50 + Math.cos(a) * 40} y2={50 + Math.sin(a) * 40} stroke="#e0a85a" strokeWidth="2" />;
        })}
        <g className="decor-needle"><line x1="50" y1="50" x2="74" y2="34" stroke="#ff7a3c" strokeWidth="3" strokeLinecap="round" /></g>
        <circle cx="50" cy="50" r="6" fill="#c98a3c" />
      </svg>
      {/* dodatkowa zębatka */}
      <svg className="decor decor-wheel" viewBox="0 0 100 100" style={{ left: "10%", bottom: "-26px", width: "clamp(120px,18vw,210px)", opacity: 0.4 }}>
        <g fill="#c98a3c">
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i * 30) * (Math.PI / 180);
            return <rect key={i} x="46" y="2" width="8" height="14" transform={`rotate(${i * 30} 50 50)`} />;
          })}
        </g>
        <circle cx="50" cy="50" r="34" fill="#1c150d" stroke="#c98a3c" strokeWidth="6" /><circle cx="50" cy="50" r="10" fill="#c98a3c" />
      </svg>
    </div>
  );
}

export default function RoomDecor({ theme }: { theme: string }) {
  switch (theme) {
    case "pirate": return <Pirate />;
    case "loch": return <Loch />;
    case "horror": return <Horror />;
    case "occult": return <Occult />;
    case "tomb": return <Tomb />;
    case "steampunk": return <Steampunk />;
    default: return null;
  }
}
