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
      {/* koło sterowe statku — odsunięte od krawędzi */}
      <svg className="decor decor-wheel" viewBox="0 0 120 120" style={{ right: "5%", bottom: "7%", width: "clamp(150px,22vw,290px)", opacity: 0.5 }}>
        {spokes}
        <g fill="none"><circle cx="60" cy="60" r="34" stroke="#7a5430" strokeWidth="6" /><circle cx="60" cy="60" r="34" stroke="#a9794a" strokeWidth="2" /><circle cx="60" cy="60" r="22" stroke="#6b4a2a" strokeWidth="4" /></g>
        <circle cx="60" cy="60" r="9" fill="#7a5430" />
      </svg>
      {/* OTWARTA skrzynia ze skarbem — odsunięta od krawędzi */}
      <svg className="decor" viewBox="0 0 140 116" style={{ left: "5%", bottom: "7%", width: "clamp(150px,21vw,260px)", opacity: 0.74 }}>
        <defs><radialGradient id="tg" cx="50%" cy="40%" r="62%"><stop offset="0" stopColor="#fff0b0" /><stop offset="60%" stopColor="#e6c067" /><stop offset="100%" stopColor="#9a6f1e" /></radialGradient></defs>
        <ellipse className="decor-treasure-glow" cx="70" cy="50" rx="62" ry="30" fill="#ffd86b" opacity="0.5" />
        {/* otwarte wieko odchylone do tyłu */}
        <path d="M22 54 L30 14 L110 14 L118 54 Z" fill="#5a3a1e" stroke="#2f1e0d" strokeWidth="2" />
        <path d="M30 18 L106 18 L112 50 L26 50 Z" fill="#6b4626" />
        <rect x="44" y="14" width="8" height="40" fill="#c9a84c" stroke="#8a6314" /><rect x="88" y="14" width="8" height="40" fill="#c9a84c" stroke="#8a6314" />
        <ellipse cx="70" cy="32" rx="10" ry="7" fill="#3a2512" />
        {/* korpus */}
        <rect x="20" y="52" width="100" height="56" rx="5" fill="#553a1f" stroke="#2f1e0d" strokeWidth="2" />
        <rect x="40" y="52" width="9" height="56" fill="#c9a84c" stroke="#8a6314" /><rect x="91" y="52" width="9" height="56" fill="#c9a84c" stroke="#8a6314" />
        <rect x="14" y="66" width="112" height="9" rx="2" fill="#8a6314" />
        {/* kopiec złota */}
        <path d="M24 60 Q70 32 116 60 Q116 66 70 62 Q24 66 24 60 Z" fill="url(#tg)" />
        {/* monety */}
        <g fill="#f1cd7e" stroke="#b5852f" strokeWidth="0.8">
          <circle cx="40" cy="58" r="5" /><circle cx="54" cy="54" r="5" /><circle cx="70" cy="52" r="5.5" /><circle cx="86" cy="54" r="5" /><circle cx="100" cy="59" r="5" />
          <circle cx="34" cy="72" r="5" /><circle cx="112" cy="72" r="5" /><circle cx="48" cy="104" r="5" /><circle cx="94" cy="104" r="5" />
        </g>
        {/* klejnoty */}
        <g stroke="#ffffff" strokeOpacity="0.45" strokeWidth="0.5">
          <polygon points="60,46 65,52 60,58 55,52" fill="#e0414f" /><polygon points="80,46 85,52 80,58 75,52" fill="#3a7de0" /><polygon points="70,42 74,47 70,52 66,47" fill="#3fb56a" />
        </g>
        {/* kielich */}
        <g fill="#f1cd7e" stroke="#b5852f" strokeWidth="0.8"><path d="M96 38 L108 38 L106 46 Q102 50 98 46 Z" /><rect x="101" y="48" width="2" height="8" /><rect x="97" y="56" width="10" height="2.5" /></g>
        {/* iskry */}
        <g className="decor-treasure-glow" fill="#fff3c4"><circle cx="50" cy="46" r="1.6" /><circle cx="78" cy="40" r="1.4" /><circle cx="64" cy="54" r="1.2" /></g>
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
  // strugi krwi: x (%), szerokość, długość, klasa animacji
  const drips = [
    { x: 5, w: 3.2, h: 26, c: "d1" }, { x: 13, w: 2.2, h: 42, c: "d2" }, { x: 24, w: 4, h: 18, c: "d3" },
    { x: 34, w: 2.6, h: 34, c: "d4" }, { x: 46, w: 3.4, h: 52, c: "d1" }, { x: 57, w: 2, h: 24, c: "d3" },
    { x: 67, w: 3.8, h: 38, c: "d2" }, { x: 78, w: 2.4, h: 30, c: "d4" }, { x: 88, w: 3, h: 46, c: "d1" }, { x: 95, w: 2, h: 22, c: "d3" },
  ];
  // rozbryzgi: drobne krople wokół głównej plamy
  const splatter = Array.from({ length: 22 }).map((_, i) => ({
    cx: 12 + ((i * 37) % 100), cy: 10 + ((i * 53) % 80), r: 1 + ((i * 7) % 5),
  }));
  return (
    <div className="room-decor" aria-hidden="true">
      {/* krew ściekająca z góry */}
      <svg className="decor" preserveAspectRatio="none" viewBox="0 0 100 64" style={{ top: 0, left: 0, width: "100%", height: "40%", opacity: 0.95 }}>
        <defs>
          <linearGradient id="bl" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2a0303" /><stop offset="0.55" stopColor="#6a0c0c" /><stop offset="1" stopColor="#8f1414" />
          </linearGradient>
          <filter id="goo"><feGaussianBlur stdDeviation="0.35" /></filter>
        </defs>
        {/* nierówna warstwa u góry */}
        <path d="M0 0 H100 V9 Q93 15 86 9 Q79 4 72 10 Q64 16 56 9 Q48 3 40 10 Q32 16 24 9 Q16 4 8 10 Q4 13 0 8 Z" fill="url(#bl)" filter="url(#goo)" />
        {/* strugi z kroplą na końcu */}
        <g fill="url(#bl)" filter="url(#goo)">
          {drips.map((d, i) => (
            <g key={i} className={`decor-drip ${d.c}`}>
              <path d={`M${d.x} 4 h${d.w} v${d.h} a${d.w / 2} ${d.w / 2} 0 0 1 -${d.w} 0 z`} />
              <circle cx={d.x + d.w / 2} cy={d.h + 4} r={d.w * 0.8} />
            </g>
          ))}
        </g>
      </svg>

      {/* smuga / rozmazana dłoń */}
      <svg className="decor" viewBox="0 0 100 120" style={{ right: "8%", top: "30%", width: "clamp(90px,14vw,180px)", opacity: 0.42 }}>
        <g fill="#5c0a0b" filter="url(#goo)">
          <path d="M30 20 Q50 10 66 24 Q78 36 60 50 Q44 62 50 80 Q40 70 34 54 Q20 40 30 20 Z" />
          <path d="M48 52 Q56 70 46 96" stroke="#5c0a0b" strokeWidth="3" fill="none" />
          <path d="M40 54 Q44 74 36 100" stroke="#5c0a0b" strokeWidth="2.5" fill="none" />
        </g>
      </svg>

      {/* zadrapania pazurami */}
      <svg className="decor" viewBox="0 0 120 130" style={{ right: "4%", top: "22%", width: "clamp(150px,24vw,320px)", opacity: 0.5 }}>
        <g stroke="#4a0708" strokeWidth="3" fill="none" strokeLinecap="round">
          <path d="M8 6 C36 40 64 72 96 122" /><path d="M26 2 C52 38 78 70 108 118" /><path d="M44 4 C68 36 92 70 118 112" />
        </g>
      </svg>

      {/* rozbryzg z kroplami */}
      <svg className="decor decor-splat" viewBox="0 0 120 100" style={{ left: "4%", bottom: "10%", width: "clamp(130px,22vw,270px)", opacity: 0.6 }}>
        <g fill="#5a0a0b" filter="url(#goo)">
          <ellipse cx="42" cy="56" rx="28" ry="19" /><ellipse cx="66" cy="44" rx="12" ry="9" /><circle cx="82" cy="62" r="6" />
          {splatter.map((s, i) => <circle key={i} cx={s.cx} cy={s.cy} r={s.r} />)}
        </g>
      </svg>

      {/* kałuża u dołu */}
      <svg className="decor" preserveAspectRatio="none" viewBox="0 0 100 22" style={{ left: 0, bottom: 0, width: "100%", height: "13%", opacity: 0.55 }}>
        <path d="M0 22 H100 V11 Q82 4 64 10 Q46 16 28 9 Q14 4 0 11 Z" fill="#3e0505" filter="url(#goo)" />
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
      {/* pentagram na ścianie */}
      <svg className="decor decor-glow" viewBox="0 0 100 100" style={{ left: "50%", top: "30%", transform: "translate(-50%,-50%)", width: "clamp(220px,34vw,420px)", opacity: 0.5 }}>
        <circle cx="50" cy="50" r="42" fill="none" stroke="#b48cff" strokeWidth="1.4" />
        <circle cx="50" cy="50" r="36" fill="none" stroke="#b48cff" strokeWidth="0.6" />
        <polygon points="50,10 61,44 96,44 68,65 79,99 50,78 21,99 32,65 4,44 39,44" fill="none" stroke="#c9a8ff" strokeWidth="1.4" transform="scale(0.86) translate(8 8)" />
      </svg>
      {/* unoszące się runy */}
      <svg className="decor decor-glow" viewBox="0 0 120 40" style={{ left: "12%", top: "16%", width: "clamp(120px,18vw,200px)", opacity: 0.4 }}>
        <g stroke="#c9a8ff" strokeWidth="2" fill="none" strokeLinecap="round">
          <path d="M8 4 V36 M8 4 L20 16 M8 20 L20 8" /><path d="M36 4 V36 M36 20 L50 4 M36 20 L50 36" /><path d="M66 4 V36 M66 4 H80 M66 20 H78 M66 36 H80" /><path d="M96 6 L110 6 L103 36 Z" />
        </g>
      </svg>
      {/* świece */}
      <svg className="decor" viewBox="0 0 200 110" style={{ left: "50%", bottom: "2%", transform: "translateX(-50%)", width: "clamp(220px,40vw,460px)", opacity: 0.78 }}>
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
      {/* sarkofag */}
      <svg className="decor" viewBox="0 0 90 150" style={{ right: "6%", bottom: "4%", width: "clamp(90px,14vw,170px)", opacity: 0.5 }}>
        <path d="M45 4 C30 4 22 16 22 30 V128 C22 140 30 146 45 146 C60 146 68 140 68 128 V30 C68 16 60 4 45 4 Z" fill="#2a1f0d" stroke="#e6c067" strokeWidth="2" />
        <circle cx="45" cy="34" r="13" fill="none" stroke="#e6c067" strokeWidth="2" /><path d="M38 30 Q45 22 52 30" fill="none" stroke="#e6c067" strokeWidth="1.6" />
        <rect x="40" y="50" width="10" height="60" rx="2" fill="#e6c067" opacity="0.5" />
        <path d="M30 70 H60 M30 86 H60 M30 102 H60" stroke="#e6c067" strokeWidth="1.2" opacity="0.6" />
      </svg>
      {/* ankh */}
      <svg className="decor decor-glow" viewBox="0 0 40 70" style={{ left: "44%", top: "12%", width: "clamp(40px,6vw,72px)", opacity: 0.55 }}>
        <g fill="none" stroke="#f3d98b" strokeWidth="3.5">
          <ellipse cx="20" cy="16" rx="9" ry="12" /><line x1="20" y1="28" x2="20" y2="64" /><line x1="8" y1="40" x2="32" y2="40" />
        </g>
      </svg>
    </div>
  );
}

// Realistyczna zębatka (trapezowe zęby + piasta + otwory).
function Gear({ teeth = 12, color = "#b5852f", dark = "#5a3f17", hi = "#e0a85a" }: { teeth?: number; color?: string; dark?: string; hi?: string }) {
  const c = 50, rb = 39, rt = 48;
  const p = (ang: number, r: number) => `${(c + Math.cos(ang) * r).toFixed(1)},${(c + Math.sin(ang) * r).toFixed(1)}`;
  const teethEls = Array.from({ length: teeth }).map((_, i) => {
    const a = (i * 2 * Math.PI) / teeth;
    const wt = (Math.PI / teeth) * 0.42, wb = (Math.PI / teeth) * 0.66;
    return <polygon key={i} points={`${p(a - wb, rb)} ${p(a - wt, rt)} ${p(a + wt, rt)} ${p(a + wb, rb)}`} fill={color} />;
  });
  const holes = Array.from({ length: 6 }).map((_, i) => {
    const a = (i * 2 * Math.PI) / 6;
    return <circle key={i} cx={c + Math.cos(a) * 26} cy={c + Math.sin(a) * 26} r="4.5" fill={dark} />;
  });
  return (
    <g>
      {teethEls}
      <circle cx={c} cy={c} r={rb} fill={color} stroke={dark} strokeWidth="2" />
      <circle cx={c} cy={c} r={rb - 1} fill="none" stroke={hi} strokeWidth="1" />
      <circle cx={c} cy={c} r="31" fill="none" stroke={dark} strokeWidth="2" />
      {holes}
      <circle cx={c} cy={c} r="15" fill={color} stroke={dark} strokeWidth="2" />
      <circle cx={c} cy={c} r="6.5" fill={dark} />
    </g>
  );
}

function Steampunk() {
  return (
    <div className="room-decor" aria-hidden="true">
      {/* rura przy lewej krawędzi */}
      <svg className="decor" viewBox="0 0 60 200" style={{ left: "3%", top: 0, width: "clamp(32px,5vw,58px)", height: "100%", opacity: 0.5 }} preserveAspectRatio="none">
        <rect x="16" y="0" width="22" height="200" fill="#5a4326" stroke="#2a1f12" strokeWidth="2" />
        <rect x="12" y="40" width="30" height="10" rx="2" fill="#7a5a30" /><rect x="12" y="152" width="30" height="10" rx="2" fill="#7a5a30" />
        <rect x="20" y="0" width="5" height="200" fill="#ffffff" opacity="0.07" />
      </svg>
      {/* duża zębatka (góra-prawo) */}
      <svg className="decor decor-wheel" viewBox="0 0 100 100" style={{ right: "8%", top: "8%", width: "clamp(140px,20vw,250px)", opacity: 0.5 }}><Gear teeth={14} /></svg>
      {/* mała zębatka zazębiona (obrót w drugą stronę) */}
      <svg className="decor decor-wheel-rev" viewBox="0 0 100 100" style={{ right: "5%", top: "29%", width: "clamp(82px,12vw,150px)", opacity: 0.46 }}><Gear teeth={10} color="#a9772a" /></svg>
      {/* manometr (środek-lewo) */}
      <svg className="decor" viewBox="0 0 100 100" style={{ left: "6%", top: "38%", width: "clamp(94px,14vw,170px)", opacity: 0.64 }}>
        <circle cx="50" cy="50" r="42" fill="#1c150d" stroke="#c98a3c" strokeWidth="5" />
        <circle cx="50" cy="50" r="42" fill="none" stroke="#e0a85a" strokeWidth="1.5" />
        {Array.from({ length: 11 }).map((_, i) => {
          const a = (-210 + i * 24) * (Math.PI / 180);
          return <line key={i} x1={50 + Math.cos(a) * 34} y1={50 + Math.sin(a) * 34} x2={50 + Math.cos(a) * 40} y2={50 + Math.sin(a) * 40} stroke="#e0a85a" strokeWidth="2" />;
        })}
        <g className="decor-needle"><line x1="50" y1="50" x2="74" y2="34" stroke="#ff7a3c" strokeWidth="3" strokeLinecap="round" /></g>
        <circle cx="50" cy="50" r="6" fill="#c98a3c" />
      </svg>
      {/* średnia zębatka (dół-lewo) */}
      <svg className="decor decor-wheel" viewBox="0 0 100 100" style={{ left: "9%", bottom: "8%", width: "clamp(104px,15vw,180px)", opacity: 0.42 }}><Gear teeth={12} color="#9a6f1e" /></svg>
    </div>
  );
}

function Noir() {
  const rain = Array.from({ length: 16 }).map((_, i) => ({ x: 3 + i * 6.3, d: 0.7 + (i % 4) * 0.25, delay: (i % 6) * 0.18, len: 14 + (i % 4) * 8 }));
  return (
    <div className="room-decor" aria-hidden="true">
      {/* deszcz */}
      <svg className="decor" preserveAspectRatio="none" viewBox="0 0 100 100" style={{ inset: 0, width: "100%", height: "100%", opacity: 0.3 }}>
        <g stroke="#cdd6e0" strokeWidth="0.4" strokeLinecap="round">
          {rain.map((r, i) => (
            <line key={i} className="decor-rain" x1={r.x} y1="0" x2={r.x - 5} y2={r.len} style={{ animationDuration: `${r.d}s`, animationDelay: `${r.delay}s` }} />
          ))}
        </g>
      </svg>
      {/* neon — szyld */}
      <svg className="decor decor-neon" viewBox="0 0 140 54" style={{ right: "6%", top: "12%", width: "clamp(130px,20vw,230px)", opacity: 0.85 }}>
        <rect x="3" y="3" width="134" height="48" rx="6" fill="none" stroke="#e0a85a" strokeWidth="1.5" />
        <text x="70" y="36" textAnchor="middle" fontFamily="Cinzel, serif" fontSize="22" letterSpacing="3" fill="#f0d49a">NOIR</text>
      </svg>
      {/* kapelusz fedora */}
      <svg className="decor" viewBox="0 0 120 70" style={{ left: "5%", bottom: "6%", width: "clamp(110px,17vw,200px)", opacity: 0.42 }}>
        <path d="M10 54 Q60 38 110 54 Q60 64 10 54 Z" fill="#15110c" />
        <path d="M34 50 Q36 20 60 18 Q84 20 86 50 Z" fill="#1c1610" />
        <path d="M34 44 Q60 50 86 44" fill="none" stroke="#000" strokeWidth="4" />
      </svg>
      {/* lupa */}
      <svg className="decor" viewBox="0 0 80 80" style={{ right: "10%", bottom: "10%", width: "clamp(80px,12vw,140px)", opacity: 0.4 }}>
        <circle cx="32" cy="32" r="20" fill="none" stroke="#caa15a" strokeWidth="4" /><line x1="47" y1="47" x2="70" y2="70" stroke="#caa15a" strokeWidth="6" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function Bunker() {
  return (
    <div className="room-decor" aria-hidden="true">
      {/* pasy ostrzegawcze (góra) */}
      <svg className="decor" preserveAspectRatio="none" viewBox="0 0 100 8" style={{ top: 0, left: 0, width: "100%", height: "5%", opacity: 0.5 }}>
        <defs><pattern id="hz" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="4" height="8" fill="#d8b73a" /><rect x="4" width="4" height="8" fill="#1a1d12" /></pattern></defs>
        <rect width="100" height="8" fill="url(#hz)" />
      </svg>
      {/* zawór */}
      <svg className="decor decor-wheel" viewBox="0 0 100 100" style={{ left: "7%", top: "16%", width: "clamp(96px,14vw,170px)", opacity: 0.5 }}>
        <g fill="none" stroke="#8aa6ba" strokeWidth="6">
          <circle cx="50" cy="50" r="34" />
          {Array.from({ length: 5 }).map((_, i) => { const a = (i * 72) * Math.PI / 180; return <line key={i} x1="50" y1="50" x2={50 + Math.cos(a) * 34} y2={50 + Math.sin(a) * 34} />; })}
        </g>
        <circle cx="50" cy="50" r="9" fill="#8aa6ba" />
      </svg>
      {/* żarówka w klatce (kołysze się + miga) */}
      <svg className="decor" viewBox="0 0 60 150" style={{ right: "14%", top: 0, width: "clamp(50px,7vw,90px)", opacity: 0.85 }}>
        <g className="decor-swinglamp" style={{ transformOrigin: "30px 0px" }}>
          <line x1="30" y1="0" x2="30" y2="56" stroke="#3a4650" strokeWidth="2" />
          <g className="decor-flame"><circle cx="30" cy="72" r="20" fill="rgba(160,210,245,.25)" /></g>
          <circle cx="30" cy="72" r="11" fill="#cfe6f5" className="decor-flame" />
          <g fill="none" stroke="#46566280" strokeWidth="2"><circle cx="30" cy="72" r="15" /><path d="M16 66 Q30 86 44 66 M20 60 V84 M40 60 V84 M30 57 V87" /></g>
        </g>
      </svg>
      {/* szron w narożnikach */}
      <svg className="decor" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ inset: 0, width: "100%", height: "100%", opacity: 0.25 }}>
        <g stroke="#bfe2f5" strokeWidth="0.5" fill="none">
          <path d="M0 0 L14 10 M0 0 L10 14 M0 0 L18 4 M0 0 L4 18" /><path d="M100 0 L86 10 M100 0 L90 14 M100 0 L82 4" />
          <path d="M0 100 L14 90 M0 100 L10 86" /><path d="M100 100 L86 90 M100 100 L90 86 M100 100 L82 96" />
        </g>
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
    case "noir": return <Noir />;
    case "bunker": return <Bunker />;
    default: return null;
  }
}
