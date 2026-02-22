import { useState, useEffect, useRef, useCallback, useMemo } from "react";

/* ══════════════════════════════════════════════════════════════
   SOUND ENGINE — Web Audio API
══════════════════════════════════════════════════════════════ */
const AudioEngine = (() => {
  let ctx = null;
  const getCtx = () => { if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)(); return ctx; };

  const play = (type, opts = {}) => {
    try {
      const ac = getCtx();
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      const now = ac.currentTime;
      if (type === "click") {
        o.type = "square"; o.frequency.setValueAtTime(440, now); o.frequency.exponentialRampToValueAtTime(220, now + 0.08);
        g.gain.setValueAtTime(0.15, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        o.start(now); o.stop(now + 0.1);
      } else if (type === "select") {
        o.type = "sine"; o.frequency.setValueAtTime(523, now); o.frequency.exponentialRampToValueAtTime(784, now + 0.12);
        g.gain.setValueAtTime(0.2, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        o.start(now); o.stop(now + 0.2);
      } else if (type === "confirm") {
        [440, 554, 659].forEach((f, i) => {
          const oo = ac.createOscillator(); const gg = ac.createGain();
          oo.connect(gg); gg.connect(ac.destination);
          const t = now + i * 0.08;
          oo.type = "triangle"; oo.frequency.setValueAtTime(f, t);
          gg.gain.setValueAtTime(0.18, t); gg.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
          oo.start(t); oo.stop(t + 0.2);
        });
        return;
      } else if (type === "error") {
        o.type = "sawtooth"; o.frequency.setValueAtTime(180, now); o.frequency.exponentialRampToValueAtTime(80, now + 0.2);
        g.gain.setValueAtTime(0.2, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        o.start(now); o.stop(now + 0.25);
      } else if (type === "unlock") {
        [330, 392, 494, 659].forEach((f, i) => {
          const oo = ac.createOscillator(); const gg = ac.createGain();
          oo.connect(gg); gg.connect(ac.destination);
          const t = now + i * 0.07;
          oo.type = "sine"; oo.frequency.setValueAtTime(f, t);
          gg.gain.setValueAtTime(0.22, t); gg.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
          oo.start(t); oo.stop(t + 0.22);
        });
        return;
      } else if (type === "paper") {
        const buf = ac.createBuffer(1, ac.sampleRate * 0.15, ac.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length) * 0.3;
        const src = ac.createBufferSource(); const bpf = ac.createBiquadFilter();
        bpf.type = "bandpass"; bpf.frequency.value = 3000;
        src.buffer = buf; src.connect(bpf); bpf.connect(ac.destination);
        src.start(now); return;
      } else if (type === "hover") {
        o.type = "sine"; o.frequency.setValueAtTime(880, now);
        g.gain.setValueAtTime(0.04, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        o.start(now); o.stop(now + 0.06);
      }
    } catch (e) {}
  };
  return { play };
})();

/* ══════════════════════════════════════════════════════════════
   GLOBAL CSS
══════════════════════════════════════════════════════════════ */
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cinzel:wght@400;600;700;900&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,600&family=Special+Elite&family=Share+Tech+Mono&family=Oswald:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html{scroll-behavior:smooth;}
body{background:#050302;font-size:14px;}
::-webkit-scrollbar{width:4px;}
::-webkit-scrollbar-track{background:#0a0704;}
::-webkit-scrollbar-thumb{background:#3d2a10;}
@keyframes scanline{0%{transform:translateY(-100%)}100%{transform:translateY(100vh)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes fadeInScale{from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)}}
@keyframes pulse-gold{0%,100%{box-shadow:0 0 10px rgba(200,169,110,0.2)}50%{box-shadow:0 0 30px rgba(200,169,110,0.6)}}
@keyframes breathe{0%,100%{opacity:0.4;transform:translateX(-50%) scale(1)}50%{opacity:0.9;transform:translateX(-50%) scale(1.04)}}
@keyframes float-up{0%{transform:translateY(100vh) rotate(0deg);opacity:0}5%{opacity:1}90%{opacity:0.5}100%{transform:translateY(-10vh) rotate(720deg);opacity:0}}
@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}
@keyframes stamp-in{0%{opacity:0;transform:rotate(-12deg) scale(1.6)}60%{transform:rotate(2deg) scale(0.97)}100%{opacity:1;transform:rotate(-8deg) scale(1)}}
@keyframes doc-unfold{0%{opacity:0;transform:perspective(800px) rotateX(-8deg) translateY(20px)}100%{opacity:1;transform:perspective(800px) rotateX(0deg) translateY(0)}}
@keyframes paper-jitter{0%,100%{transform:rotate(-1.5deg)}25%{transform:rotate(-1.2deg) translateX(1px)}75%{transform:rotate(-1.8deg) translateX(-1px)}}
@keyframes map-pulse{0%,100%{opacity:0.6}50%{opacity:1}}
@keyframes infection-spread{0%{r:0;opacity:0.7}100%{r:8;opacity:0}}
@keyframes blink-dot{0%,100%{opacity:1}50%{opacity:0}}
@keyframes slide-in-right{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
@keyframes rotate-slow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes success-ring{0%{transform:scale(0.5);opacity:1}100%{transform:scale(2);opacity:0}}
`;

/* ══════════════════════════════════════════════════════════════
   DATA
══════════════════════════════════════════════════════════════ */
const FACTIONS = {
  survivor: {
    id: "survivor", name: "Survivors", color: "#D4A853", accent: "#F0C070",
    bg: "#0f0b05", secondary: "#1e1508", border: "#6B4C1E", tag: "CIVILIAN",
    description: "Navigate the infected world. Find safety. Stay alive.",
    lore: "No allegiance. No army. Just the will to endure.",
    icon: "⚒", glow: "rgba(212,168,83,0.5)",
    headFont: "'Special Elite', cursive",
    bodyFont: "'Playfair Display', serif",
    monoFont: "'Share Tech Mono', monospace",
    cardBorder: "#8B6914",
    stamped: "SURVIVOR",
    stampColor: "#8B4513",
  },
  firefly: {
    id: "firefly", name: "Fireflies", color: "#C8D840", accent: "#E8F060",
    bg: "#080900", secondary: "#111400", border: "#3A4000", tag: "REBEL",
    description: "Fight for freedom. Liberate the zones. Find the cure.",
    lore: "When you're lost in the darkness, look for the light.",
    icon: "✦", glow: "rgba(200,216,64,0.5)",
    headFont: "'Oswald', sans-serif",
    bodyFont: "'Oswald', sans-serif",
    monoFont: "'Share Tech Mono', monospace",
    cardBorder: "#5A6400",
    stamped: "FIREFLY",
    stampColor: "#4A5E00",
  },
  fedra: {
    id: "fedra", name: "FEDRA Military", color: "#60C8E8", accent: "#80E0FF",
    bg: "#010810", secondary: "#021020", border: "#0A3050", tag: "MILITARY",
    description: "Maintain order. Secure the QZs. Eliminate threats.",
    lore: "Order is the only thing keeping humanity alive.",
    icon: "◈", glow: "rgba(96,200,232,0.5)",
    headFont: "'Oswald', sans-serif",
    bodyFont: "'Share Tech Mono', monospace",
    monoFont: "'Share Tech Mono', monospace",
    cardBorder: "#0A4060",
    stamped: "FEDRA",
    stampColor: "#0A3878",
  },
};

/* ══════════════════════════════════════════════════════════════
   MAP DATA — Fictional city "New Elysium" with real districts
══════════════════════════════════════════════════════════════ */
const MAP_DISTRICTS = [
  // Central districts
  { id: "d1", name: "Downtown Core", shortName: "Downtown", cx: 500, cy: 400, r: 70, infectionLevel: 0.85, controlled: "infected", type: "urban", population: 42000 },
  { id: "d2", name: "Harbor District", shortName: "Harbor", cx: 720, cy: 250, r: 55, infectionLevel: 0.30, controlled: "fedra", type: "port", population: 18000 },
  { id: "d3", name: "Old Quarter", shortName: "Old Quarter", cx: 260, cy: 480, r: 60, infectionLevel: 0.93, controlled: "infected", type: "historic", population: 31000 },
  { id: "d4", name: "Green Zone", shortName: "Green Zone", cx: 610, cy: 600, r: 65, infectionLevel: 0.08, controlled: "fedra", type: "qz", population: 24000 },
  { id: "d5", name: "University Hill", shortName: "Uni. Hill", cx: 380, cy: 200, r: 50, infectionLevel: 0.52, controlled: "firefly", type: "campus", population: 15000 },
  { id: "d6", name: "Industrial Belt", shortName: "Industrial", cx: 820, cy: 480, r: 58, infectionLevel: 0.44, controlled: "mixed", type: "industrial", population: 22000 },
  { id: "d7", name: "Northside Suburbs", shortName: "Suburbs", cx: 320, cy: 100, r: 48, infectionLevel: 0.18, controlled: "survivor", type: "residential", population: 12000 },
  { id: "d8", name: "Medical Row", shortName: "Med. Row", cx: 150, cy: 320, r: 52, infectionLevel: 0.63, controlled: "firefly", type: "medical", population: 9000 },
  { id: "d9", name: "Westgate Markets", shortName: "Westgate", cx: 150, cy: 570, r: 45, infectionLevel: 0.76, controlled: "infected", type: "commercial", population: 17000 },
  { id: "d10", name: "Chapel District", shortName: "Chapel", cx: 640, cy: 130, r: 40, infectionLevel: 0.22, controlled: "survivor", type: "residential", population: 8000 },
  { id: "d11", name: "Eastern Slums", shortName: "E. Slums", cx: 870, cy: 330, r: 44, infectionLevel: 0.71, controlled: "infected", type: "slum", population: 27000 },
  { id: "d12", name: "Power Station", shortName: "Power Stn.", cx: 720, cy: 660, r: 38, infectionLevel: 0.35, controlled: "fedra", type: "utility", population: 4000 },
  { id: "d13", name: "Firefly Quarter", shortName: "FF Quarter", cx: 440, cy: 560, r: 42, infectionLevel: 0.47, controlled: "firefly", type: "rebel", population: 11000 },
  { id: "d14", name: "Collapsed Zone", shortName: "Collapsed", cx: 560, cy: 310, r: 36, infectionLevel: 0.98, controlled: "infected", type: "ruins", population: 0 },
  { id: "d15", name: "Border Checkpoint", shortName: "Checkpoint", cx: 900, cy: 600, r: 32, infectionLevel: 0.12, controlled: "fedra", type: "military", population: 2000 },
];

const ARCADE_PTS = [
  { id: "ap1", cx: 500, cy: 400, name: "AP-077: City Hall", status: "active", faction: "public" },
  { id: "ap2", cx: 720, cy: 250, name: "AP-023: Harbor Gate", status: "active", faction: "fedra" },
  { id: "ap3", cx: 380, cy: 200, name: "AP-091: Uni. Campus", status: "damaged", faction: "firefly" },
  { id: "ap4", cx: 610, cy: 600, name: "AP-034: Green HQ", status: "active", faction: "fedra" },
  { id: "ap5", cx: 150, cy: 570, name: "AP-055: Old Market", status: "offline", faction: "public" },
  { id: "ap6", cx: 820, cy: 480, name: "AP-012: Warehouse", status: "active", faction: "public" },
  { id: "ap7", cx: 320, cy: 100, name: "AP-108: North Gate", status: "active", faction: "survivor" },
  { id: "ap8", cx: 150, cy: 320, name: "AP-067: Med Center", status: "active", faction: "firefly" },
];

const ROADS = [
  [500,400, 720,250], [500,400, 260,480], [500,400, 610,600],
  [500,400, 380,200], [500,400, 820,480], [500,400, 150,320],
  [720,250, 640,130], [720,250, 870,330], [720,250, 820,480],
  [610,600, 820,480], [610,600, 720,660], [610,600, 900,600],
  [380,200, 320,100], [380,200, 150,320], [380,200, 260,480],
  [260,480, 150,570], [260,480, 440,560], [150,320, 150,570],
  [440,560, 610,600], [560,310, 500,400], [560,310, 380,200],
];

const INFECTION_STAGES = [
  { stage: "Runner", hours: "0–48 Hours", color: "#FF6B35", symbol: "I", description: "Fully mobile, erratic aggression. Partial consciousness remains. The most unpredictable." },
  { stage: "Stalker", hours: "2 Weeks – 1 Year", color: "#CC4400", symbol: "II", description: "Sight fading. Fungal plates forming. Begins ambushing rather than charging." },
  { stage: "Clicker", hours: "1 – 10 Years", color: "#8B0000", symbol: "III", description: "Fully blind. Echolocates via clicks. Armored skull. Lethal at close range." },
  { stage: "Bloater", hours: "10+ Years", color: "#4A0000", symbol: "IV", description: "Fungal mass overwhelms the host. Throws acid pods. Near-invulnerable." },
];

const RESOURCES = ["Medkits", "Ammo", "Rags", "Alcohol", "Trading Cards"];
const RESOURCE_ICONS = ["🩹", "🔫", "🧣", "🍶", "🃏"];

function genHistory(base) {
  return Array.from({ length: 7 }, (_, i) => ({
    day: `D${i + 1}`,
    value: Math.max(0.05, Math.min(1, base + (Math.random() - 0.5) * 0.28 - (6 - i) * 0.015)),
  }));
}
function genResources(id) {
  const s = id.charCodeAt(1);
  return [
    { label: "Ammo", value: 20 + (s * 7) % 30, color: "#FF6B35" },
    { label: "Medical", value: 15 + (s * 11) % 25, color: "#60C8E8" },
    { label: "Food", value: 10 + (s * 5) % 20, color: "#81C784" },
    { label: "Crafting", value: 5 + (s * 3) % 15, color: "#FFD54F" },
    { label: "Misc", value: 5 + (s * 9) % 10, color: "#CE93D8" },
  ];
}

/* ══════════════════════════════════════════════════════════════
   COMPONENTS
══════════════════════════════════════════════════════════════ */
function SporeField({ count = 20, color = "rgba(190,140,50,0.5)" }) {
  const pts = useRef(Array.from({ length: count }, (_, i) => ({
    left: Math.random() * 100, delay: Math.random() * 15,
    duration: 10 + Math.random() * 15, size: 1 + Math.random() * 2.5, id: i,
  }))).current;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 2 }}>
      {pts.map(p => (
        <div key={p.id} style={{
          position: "absolute", bottom: -10, left: `${p.left}%`,
          width: p.size, height: p.size, borderRadius: "50%", background: color,
          animation: `float-up ${p.duration}s ${p.delay}s ease-in infinite`,
        }} />
      ))}
    </div>
  );
}

function ScrollReveal({ children, threshold = 0.1, delay = 0 }) {
  const ref = useRef(); const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(32px)", transition: `opacity 0.85s ease ${delay}ms, transform 0.85s ease ${delay}ms` }}>
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   CONFIDENTIAL DOCUMENT COMPONENT
══════════════════════════════════════════════════════════════ */
function ConfidentialDoc({ onOpen }) {
  const [isDragging, setIsDragging] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const dragStart = useRef(null);
  const docRef = useRef(null);

  const handleMouseDown = (e) => {
    AudioEngine.play("paper");
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
  };
  const handleMouseMove = useCallback((e) => {
    if (isDragging && dragStart.current) {
      const newX = e.clientX - dragStart.current.x;
      const newY = e.clientY - dragStart.current.y;
      setPos({ x: newX, y: newY });
      if (!revealed && (Math.abs(newX) > 40 || Math.abs(newY) > 40)) {
        setRevealed(true);
        AudioEngine.play("unlock");
      }
    }
    if (!isDragging && docRef.current) {
      const rect = docRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      setTilt({ x: dy * 6, y: -dx * 6 });
    }
  }, [isDragging, revealed]);
  const handleMouseUp = () => { setIsDragging(false); dragStart.current = null; };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => { window.removeEventListener("mousemove", handleMouseMove); window.removeEventListener("mouseup", handleMouseUp); };
  }, [handleMouseMove]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", padding: "40px 20px" }}>
      {!revealed && (
        <div style={{ textAlign: "center", marginBottom: 30, animation: "fadeIn 1s ease" }}>
          <div style={{ fontSize: 11, letterSpacing: 6, color: "rgba(200,169,110,0.35)", marginBottom: 8, fontFamily: "'Share Tech Mono',monospace" }}>CLASSIFIED DOCUMENT DETECTED</div>
          <div style={{ fontSize: 14, color: "rgba(200,169,110,0.55)", fontFamily: "'Playfair Display',serif", fontStyle: "italic" }}>Drag the document to reveal its contents</div>
        </div>
      )}

      {/* The document */}
      <div
        ref={docRef}
        onMouseDown={handleMouseDown}
        onMouseEnter={() => { setIsHovered(true); AudioEngine.play("hover"); }}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: "relative",
          transform: `translate(${pos.x}px, ${pos.y}px) perspective(800px) rotateX(${isDragging ? 0 : tilt.x}deg) rotateY(${isDragging ? 0 : tilt.y}deg) rotate(-1.5deg)`,
          transition: isDragging ? "none" : "transform 0.3s ease",
          cursor: isDragging ? "grabbing" : "grab",
          userSelect: "none",
          animation: isDragging ? "none" : "paper-jitter 4s ease-in-out infinite",
          zIndex: 10,
          filter: `drop-shadow(0 ${isHovered ? "20px 30px" : "8px 16px"} rgba(0,0,0,0.8))`,
        }}
      >
        {/* Paper texture layers */}
        <div style={{
          position: "absolute", inset: -3, background: "#c8b898", zIndex: -1,
          transform: "rotate(1deg) translate(2px, 2px)", opacity: 0.6,
        }} />
        <div style={{
          position: "absolute", inset: -2, background: "#d4c4a4", zIndex: -1,
          transform: "rotate(-0.5deg) translate(-1px, 1px)", opacity: 0.7,
        }} />

        {/* Main document body */}
        <div style={{
          width: "clamp(280px, 38vw, 440px)",
          background: "linear-gradient(160deg, #e8dcc0 0%, #d4c4a0 30%, #c8b890 60%, #d0c098 100%)",
          padding: "36px 32px",
          position: "relative", overflow: "hidden",
          border: "1px solid rgba(100,70,20,0.4)",
        }}>
          {/* Paper grain overlay */}
          <div style={{
            position: "absolute", inset: 0, opacity: 0.08, zIndex: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          }} />

          {/* Stain marks */}
          <div style={{ position: "absolute", top: 20, right: 30, width: 40, height: 40, borderRadius: "50%", background: "rgba(80,40,10,0.08)", zIndex: 0 }} />
          <div style={{ position: "absolute", bottom: 60, left: 20, width: 25, height: 25, borderRadius: "50%", background: "rgba(80,40,10,0.05)", zIndex: 0 }} />

          {/* Fold lines */}
          <div style={{ position: "absolute", top: "33%", left: 0, right: 0, height: 1, background: "rgba(100,70,20,0.12)", zIndex: 0 }} />
          <div style={{ position: "absolute", top: "66%", left: 0, right: 0, height: 1, background: "rgba(100,70,20,0.12)", zIndex: 0 }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 18, borderBottom: "2px solid rgba(80,40,10,0.25)", paddingBottom: 14 }}>
              <div style={{ fontSize: 8, letterSpacing: 5, color: "rgba(80,40,10,0.6)", fontFamily: "'Share Tech Mono',monospace", marginBottom: 6 }}>
                FEDERAL DISASTER RESPONSE AUTHORITY
              </div>
              <div style={{ fontSize: "clamp(13px,2.5vw,16px)", fontFamily: "'Cinzel',serif", fontWeight: 700, color: "#2a1800", letterSpacing: 2, lineHeight: 1.3 }}>
                THE CORDYCEPS ARCHIVE<br/>
                <span style={{ fontSize: "0.7em", fontWeight: 400, letterSpacing: 4, color: "rgba(80,40,10,0.7)" }}>INFORMATION NETWORK</span>
              </div>
            </div>

            {/* Classification bands */}
            {[0, 1].map(i => (
              <div key={i} style={{
                background: "rgba(120,20,20,0.85)", padding: "4px 8px", marginBottom: i === 0 ? 6 : 16,
                textAlign: "center", fontSize: 9, fontFamily: "'Oswald',sans-serif",
                letterSpacing: 6, color: "#ffcccc", fontWeight: 600,
              }}>
                ███ TOP SECRET ███
              </div>
            ))}

            {/* Body text */}
            <div style={{ fontSize: 11, fontFamily: "'Special Elite',cursive", color: "#2a1800", lineHeight: 1.9, marginBottom: 16 }}>
              <p style={{ marginBottom: 10 }}>
                This document contains classified tactical data pertaining to the Cordyceps outbreak, quarantine zone operations, and active faction movements within New Elysium City limits.
              </p>
              <p style={{ marginBottom: 10, opacity: 0.7 }}>
                <span style={{ textDecoration: "line-through", opacity: 0.4 }}>VACCINE PROGRAM STATUS: PHASE II</span><br/>
                Distribution of this document to civilian personnel is punishable under <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10 }}>FEDRA Emergency Protocol 7-C</span>.
              </p>
            </div>

            {/* Redacted lines */}
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{ height: 10, background: "#1a0800", marginBottom: 6, width: `${70 + i * 10}%`, opacity: 0.85 }} />
            ))}

            <div style={{ marginTop: 16, fontSize: 9, fontFamily: "'Share Tech Mono',monospace", color: "rgba(80,40,10,0.5)", letterSpacing: 2 }}>
              DOC REF: TCA-2023-0087 · EYES ONLY
            </div>
          </div>

          {/* CONFIDENTIAL STAMP */}
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%) rotate(-18deg)",
            border: "3px solid rgba(120,20,20,0.55)", padding: "6px 14px",
            fontFamily: "'Oswald',sans-serif", fontWeight: 700,
            fontSize: "clamp(20px,4vw,28px)", letterSpacing: 5,
            color: "rgba(120,20,20,0.45)", whiteSpace: "nowrap",
            animation: "stamp-in 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.4s both",
            zIndex: 5, pointerEvents: "none",
          }}>CONFIDENTIAL</div>

          {/* Tape strip top */}
          <div style={{
            position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)",
            width: 80, height: 16, background: "rgba(220,200,140,0.7)",
            border: "1px solid rgba(180,150,80,0.5)", zIndex: 6,
          }} />
        </div>
      </div>

      {/* CTA after drag */}
      {revealed && (
        <div style={{ marginTop: 32, textAlign: "center", animation: "fadeUp 0.7s ease" }}>
          <div style={{ fontSize: 11, letterSpacing: 4, color: "rgba(200,169,110,0.5)", marginBottom: 12, fontFamily: "'Share Tech Mono',monospace" }}>
            DOCUMENT UNSEALED — CONTENTS ACCESSIBLE
          </div>
          <button
            onClick={() => { AudioEngine.play("confirm"); onOpen(); }}
            style={{
              padding: "14px 44px",
              background: "rgba(200,169,110,0.08)",
              border: "1px solid rgba(200,169,110,0.6)",
              color: "#D4A853", fontFamily: "'Cinzel',serif",
              fontSize: 13, letterSpacing: 4, cursor: "pointer",
              transition: "all 0.3s",
              animation: "pulse-gold 2.5s ease infinite",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(200,169,110,0.18)"; AudioEngine.play("hover"); }}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(200,169,110,0.08)"}
          >
            ENTER THE ARCHIVE ▸
          </button>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   FACTION AUTH (after document reveal)
══════════════════════════════════════════════════════════════ */
function FactionAuth({ onLogin }) {
  const [form, setForm] = useState({ username: "", faction: "", location: "" });
  const [step, setStep] = useState("select"); // select | form | travel | hack
  const [prevLocation, setPrevLocation] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  const handleFactionSelect = (id) => {
    AudioEngine.play("select");
    setForm(f => ({ ...f, faction: id }));
  };

  const handleProceed = () => {
    if (form.faction) { AudioEngine.play("confirm"); setStep("form"); }
  };

  const handleAuth = () => {
    if (!form.username || !form.location) return;
    AudioEngine.play("confirm");
    const ret = localStorage.getItem(`tcp_${form.username}`);
    if (ret) { setStep("travel"); } else { localStorage.setItem(`tcp_${form.username}`, "1"); setStep("hack"); }
  };

  const fc = form.faction ? FACTIONS[form.faction] : null;

  return (
    <div style={{
      opacity: visible ? 1 : 0, transition: "opacity 0.6s ease",
      padding: "40px 20px", maxWidth: 920, margin: "0 auto",
      animation: visible ? "fadeInScale 0.7s ease" : "none",
    }}>
      {/* ── STEP 1: FACTION SELECTION ── */}
      {(step === "select") && (
        <>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: 10, letterSpacing: 7, color: "rgba(200,169,110,0.35)", marginBottom: 10, fontFamily: "'Share Tech Mono',monospace" }}>
              STEP 1 OF 3 — FACTION DECLARATION
            </div>
            <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: "clamp(22px,4vw,38px)", color: "#D4A853", letterSpacing: 3, marginBottom: 8 }}>
              Choose Your Allegiance
            </h2>
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, color: "rgba(200,169,110,0.5)", fontStyle: "italic" }}>
              Your faction determines what you see, what you fight for, and who trusts you.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18, marginBottom: 32 }}>
            {Object.values(FACTIONS).map((f, i) => {
              const sel = form.faction === f.id;
              return (
                <div key={f.id}
                  onClick={() => handleFactionSelect(f.id)}
                  style={{
                    padding: "28px 20px 22px", cursor: "pointer",
                    border: `2px solid ${sel ? f.color : `${f.cardBorder}55`}`,
                    background: sel
                      ? `radial-gradient(ellipse at 40% 30%, ${f.color}12 0%, ${f.bg} 70%)`
                      : `linear-gradient(160deg, ${f.bg} 0%, ${f.secondary} 100%)`,
                    position: "relative", overflow: "hidden",
                    transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
                    transform: sel ? "translateY(-5px) scale(1.02)" : "translateY(0) scale(1)",
                    boxShadow: sel ? `0 12px 40px ${f.glow}, 0 0 0 1px ${f.color}20` : "none",
                  }}
                  onMouseEnter={e => { if (!sel) { AudioEngine.play("hover"); e.currentTarget.style.borderColor = `${f.cardBorder}aa`; e.currentTarget.style.transform = "translateY(-2px)"; }}}
                  onMouseLeave={e => { if (!sel) { e.currentTarget.style.borderColor = `${f.cardBorder}55`; e.currentTarget.style.transform = "translateY(0)"; }}}
                >
                  {/* Bg glow */}
                  {sel && <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 60% 50% at 35% 25%, ${f.color}10, transparent)`, pointerEvents: "none" }} />}

                  {/* Selected check */}
                  {sel && <div style={{ position: "absolute", top: 10, right: 12, width: 10, height: 10, borderRadius: "50%", background: f.color, boxShadow: `0 0 12px ${f.color}`, animation: "pulse-gold 1.5s infinite" }} />}

                  {/* Icon */}
                  <div style={{ fontSize: 42, color: f.color, opacity: sel ? 1 : 0.45, marginBottom: 14, textShadow: sel ? `0 0 30px ${f.color}90` : "none", fontFamily: "'Share Tech Mono',monospace", transition: "all 0.3s" }}>{f.icon}</div>

                  {/* Tag */}
                  <div style={{ fontSize: 9, letterSpacing: 5, color: `${f.color}70`, marginBottom: 6, fontFamily: "'Share Tech Mono',monospace" }}>{f.tag}</div>

                  {/* Name */}
                  <div style={{ fontFamily: f.headFont, fontSize: 17, color: sel ? f.color : `${f.color}bb`, marginBottom: 10, letterSpacing: f.id === "fedra" ? 2 : 0.5, fontWeight: f.id !== "survivor" ? 600 : 400, transition: "color 0.3s" }}>
                    {f.name}
                  </div>

                  {/* Description */}
                  <div style={{ fontSize: 12, fontFamily: f.bodyFont, color: `${f.color}65`, lineHeight: 1.8 }}>
                    {f.description}
                  </div>

                  {/* Quote */}
                  <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${f.color}18`, fontSize: 11, fontFamily: "'Playfair Display',serif", color: `${f.color}48`, fontStyle: "italic" }}>
                    "{f.lore}"
                  </div>

                  {/* Bottom bar */}
                  <div style={{ marginTop: 14, height: 2, background: `linear-gradient(90deg, ${f.color}, transparent)`, opacity: sel ? 0.9 : 0.22, transition: "opacity 0.3s" }} />
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: "center" }}>
            <button onClick={handleProceed} disabled={!form.faction}
              style={{
                padding: "13px 48px", background: form.faction ? `${fc?.color}0f` : "transparent",
                border: `1px solid ${form.faction ? fc?.color : "rgba(200,169,110,0.15)"}`,
                color: form.faction ? fc?.color : "rgba(200,169,110,0.2)",
                fontFamily: "'Cinzel',serif", fontSize: 12, letterSpacing: 4, cursor: form.faction ? "pointer" : "not-allowed",
                transition: "all 0.3s",
              }}
              onMouseEnter={e => { if (form.faction) { AudioEngine.play("hover"); e.currentTarget.style.background = `${fc?.color}1e`; }}}
              onMouseLeave={e => { if (form.faction) e.currentTarget.style.background = `${fc?.color}0f`; }}
            >
              DECLARE ALLEGIANCE ▸
            </button>
          </div>
        </>
      )}

      {/* ── STEP 2: FORM ── */}
      {step === "form" && fc && (
        <div style={{ maxWidth: 560, margin: "0 auto", animation: "slide-in-right 0.5s ease" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ fontSize: 9, letterSpacing: 5, color: `${fc.color}50`, marginBottom: 8, fontFamily: "'Share Tech Mono',monospace" }}>
              STEP 2 OF 3 — IDENTITY REGISTRATION
            </div>
            <div style={{ fontSize: 28, color: fc.color, marginBottom: 8, fontFamily: fc.headFont, letterSpacing: fc.id === "fedra" ? 2 : 0 }}>{fc.icon} {fc.name}</div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 14, color: `${fc.color}55`, fontStyle: "italic" }}>"{fc.lore}"</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { key: "username", label: "CALLSIGN / IDENTIFIER", placeholder: "Enter your callsign..." },
              { key: "location", label: "CURRENT LOCATION", placeholder: null, isSelect: true },
            ].map(field => (
              <div key={field.key}>
                <label style={{ display: "block", fontSize: 9, letterSpacing: 3, color: `${fc.color}55`, marginBottom: 8, fontFamily: "'Share Tech Mono',monospace" }}>{field.label}</label>
                {field.isSelect ? (
                  <select value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                    style={{ width: "100%", padding: "12px 16px", background: fc.bg, border: `1px solid ${form.location ? fc.color + "60" : fc.border}`, color: form.location ? fc.color : `${fc.color}50`, fontFamily: "'Share Tech Mono',monospace", fontSize: 12, outline: "none", cursor: "pointer" }}
                    onFocus={e => e.target.style.borderColor = `${fc.color}90`}
                    onBlur={e => e.target.style.borderColor = form.location ? `${fc.color}60` : fc.border}>
                    <option value="">— SELECT SECTOR —</option>
                    {MAP_DISTRICTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                ) : (
                  <input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} placeholder={field.placeholder}
                    style={{ width: "100%", padding: "12px 16px", background: fc.bg, border: `1px solid ${form.username ? fc.color + "60" : fc.border}`, color: fc.color, fontFamily: fc.monoFont, fontSize: 12, outline: "none" }}
                    onFocus={e => { e.target.style.borderColor = `${fc.color}90`; AudioEngine.play("click"); }}
                    onBlur={e => e.target.style.borderColor = form.username ? `${fc.color}60` : fc.border} />
                )}
              </div>
            ))}

            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <button onClick={() => setStep("select")} style={{ flex: 1, padding: 13, background: "transparent", border: `1px solid ${fc.border}`, color: `${fc.color}60`, fontFamily: "'Share Tech Mono',monospace", fontSize: 10, letterSpacing: 3, cursor: "pointer" }}
                onMouseEnter={e => AudioEngine.play("hover")} >← BACK</button>
              <button onClick={handleAuth} disabled={!form.username || !form.location}
                style={{ flex: 2, padding: 13, background: (form.username && form.location) ? `${fc.color}10` : "transparent", border: `1px solid ${(form.username && form.location) ? fc.color : fc.border}`, color: (form.username && form.location) ? fc.color : `${fc.color}30`, fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: 4, cursor: (form.username && form.location) ? "pointer" : "not-allowed" }}
                onMouseEnter={e => { if (form.username && form.location) AudioEngine.play("hover"); }}>
                INITIATE HANDSHAKE ▸
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TRAVEL LOG ── */}
      {step === "travel" && fc && (
        <div style={{ maxWidth: 520, margin: "0 auto", textAlign: "center", animation: "slide-in-right 0.5s ease" }}>
          <div style={{ fontSize: 9, letterSpacing: 5, color: `${fc.color}50`, marginBottom: 8, fontFamily: "'Share Tech Mono',monospace" }}>STEP 2 OF 3 — TRAVEL VERIFICATION</div>
          <h3 style={{ fontFamily: fc.headFont, fontSize: 26, color: fc.color, marginBottom: 8 }}>Travel Log</h3>
          <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 14, color: `${fc.color}55`, marginBottom: 32, fontStyle: "italic" }}>
            Welcome back, {form.username}. Confirm your route.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 28px 1fr", gap: 8, alignItems: "end", marginBottom: 20 }}>
            <div>
              <label style={{ display: "block", fontSize: 8, letterSpacing: 3, color: `${fc.color}50`, marginBottom: 7, fontFamily: "'Share Tech Mono',monospace" }}>PREVIOUS LOCATION</label>
              <select value={prevLocation} onChange={e => setPrevLocation(e.target.value)}
                style={{ width: "100%", padding: "11px 12px", background: fc.bg, border: `1px solid ${fc.border}`, color: prevLocation ? fc.color : `${fc.color}50`, fontFamily: "'Share Tech Mono',monospace", fontSize: 10, outline: "none" }}>
                <option value="">— SELECT —</option>
                {MAP_DISTRICTS.filter(d => d.id !== form.location).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div style={{ textAlign: "center", color: `${fc.color}50`, fontSize: 18, paddingBottom: 2 }}>→</div>
            <div>
              <label style={{ display: "block", fontSize: 8, letterSpacing: 3, color: `${fc.color}50`, marginBottom: 7, fontFamily: "'Share Tech Mono',monospace" }}>CURRENT LOCATION</label>
              <div style={{ padding: "11px 12px", border: `1px solid ${fc.border}`, color: `${fc.color}70`, fontSize: 10, fontFamily: "'Share Tech Mono',monospace", textAlign: "left" }}>
                {MAP_DISTRICTS.find(d => d.id === form.location)?.name || "Unknown"}
              </div>
            </div>
          </div>
          <button onClick={() => { if (prevLocation) { AudioEngine.play("confirm"); setStep("hack"); }}} disabled={!prevLocation}
            style={{ width: "100%", padding: 13, background: prevLocation ? `${fc.color}10` : "transparent", border: `1px solid ${prevLocation ? fc.color : fc.border}`, color: prevLocation ? fc.color : `${fc.color}30`, fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: 4, cursor: prevLocation ? "pointer" : "not-allowed" }}>
            CONFIRM ROUTE ▸
          </button>
        </div>
      )}

      {/* ── HACK ── */}
      {step === "hack" && fc && (
        <div style={{ maxWidth: 500, margin: "0 auto", animation: "slide-in-right 0.5s ease" }}>
          <div style={{ textAlign: "center", marginBottom: 22 }}>
            <div style={{ fontSize: 9, letterSpacing: 5, color: `${fc.color}50`, marginBottom: 8, fontFamily: "'Share Tech Mono',monospace" }}>STEP 3 OF 3 — SYSTEM VERIFICATION</div>
            <h3 style={{ fontFamily: fc.headFont, fontSize: 28, color: fc.color, marginBottom: 6 }}>Pattern Lock</h3>
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 13, color: `${fc.color}50`, fontStyle: "italic" }}>
              Watch the 3-symbol sequence. Reproduce it to gain access.
            </p>
          </div>
          <HackMinigame
            onSuccess={() => { AudioEngine.play("unlock"); setTimeout(() => onLogin(form.faction, form.username), 600); }}
            factionColor={fc.color} factionBg={fc.bg} factionBorder={fc.border}
          />
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   HACK MINIGAME
══════════════════════════════════════════════════════════════ */
function HackMinigame({ onSuccess, factionColor, factionBg, factionBorder }) {
  const SYMBOLS = ["◈", "△", "◻", "⬡", "⊕"];
  const [sequence, setSequence] = useState([]);
  const [highlighted, setHighlighted] = useState(-1);
  const [input, setInput] = useState([]);
  const [phase, setPhase] = useState("showing");
  const [attempts, setAttempts] = useState(5);
  const [shake, setShake] = useState(false);
  const fc = factionColor;

  const startNew = () => {
    const seq = Array.from({ length: 3 }, () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
    setSequence(seq); setInput([]); setHighlighted(-1); setPhase("showing");
    seq.forEach((_, i) => setTimeout(() => { setHighlighted(i); AudioEngine.play("click"); }, 600 + i * 800));
    setTimeout(() => { setHighlighted(-1); setPhase("input"); }, 600 + 3 * 800 + 400);
  };

  useEffect(() => { startNew(); }, []);

  const pick = (sym) => {
    if (phase !== "input") return;
    AudioEngine.play("click");
    const next = [...input, sym];
    setInput(next);
    if (next.length === 3) {
      if (next.every((s, i) => s === sequence[i])) {
        setPhase("success"); AudioEngine.play("confirm"); setTimeout(onSuccess, 900);
      } else {
        AudioEngine.play("error");
        setShake(true); setTimeout(() => setShake(false), 500);
        const rem = attempts - 1; setAttempts(rem); setInput([]);
        if (rem <= 0) setTimeout(() => { startNew(); setAttempts(5); }, 700);
      }
    }
  };

  return (
    <div style={{ background: `${factionBg}cc`, border: `1px solid ${factionBorder}`, padding: "28px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 9, letterSpacing: 4, color: `${fc}50`, marginBottom: 6, fontFamily: "'Share Tech Mono',monospace" }}>ARCADE CALIBRATION PROTOCOL</div>
      <div style={{ fontSize: 11, letterSpacing: 3, color: "#FFD54F", marginBottom: 24, fontFamily: "'Share Tech Mono',monospace" }}>
        {phase === "showing" ? "MEMORIZE THE SEQUENCE" : phase === "input" ? "REPRODUCE THE PATTERN" : "✓ IDENTITY CONFIRMED"}
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 18, marginBottom: 28, animation: shake ? "shake 0.45s ease" : "none" }}>
        {[0, 1, 2].map(i => {
          const isH = highlighted === i, filled = phase === "input" && input[i], done = phase === "success";
          return (
            <div key={i} style={{
              width: 60, height: 60,
              border: `2px solid ${isH || done ? fc : filled ? "#FFD54F" : `${fc}20`}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 26, transition: "all 0.25s",
              background: isH || done ? `${fc}15` : filled ? "rgba(255,213,79,0.08)" : "transparent",
              boxShadow: isH ? `0 0 24px ${fc}60` : done ? `0 0 16px ${fc}40` : "none",
              color: isH || done ? fc : filled ? "#FFD54F" : `${fc}25`,
              fontFamily: "'Share Tech Mono',monospace",
            }}>
              {isH || done ? sequence[i] : (phase === "input" && input[i]) ? input[i] : "·"}
            </div>
          );
        })}
      </div>

      {phase === "input" && (
        <>
          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
            {SYMBOLS.map(sym => (
              <button key={sym} onClick={() => pick(sym)} style={{
                width: 62, height: 62, border: `1px solid ${fc}40`,
                background: `${fc}06`, color: fc, fontSize: 26, cursor: "pointer",
                fontFamily: "'Share Tech Mono',monospace", transition: "all 0.15s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = `${fc}1a`; e.currentTarget.style.boxShadow = `0 0 16px ${fc}40`; AudioEngine.play("hover"); }}
                onMouseLeave={e => { e.currentTarget.style.background = `${fc}06`; e.currentTarget.style.boxShadow = "none"; }}
              >{sym}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", alignItems: "center" }}>
            <button onClick={() => { setInput([]); AudioEngine.play("click"); }}
              style={{ padding: "5px 16px", background: "transparent", border: "1px solid rgba(255,100,50,0.35)", color: "rgba(255,120,70,0.8)", cursor: "pointer", fontSize: 9, letterSpacing: 2, fontFamily: "'Share Tech Mono',monospace" }}>CLEAR</button>
            <span style={{ fontSize: 9, color: `${fc}40`, fontFamily: "'Share Tech Mono',monospace" }}>ATTEMPTS: {attempts}</span>
          </div>
        </>
      )}
      {phase === "success" && (
        <div style={{ position: "relative" }}>
          <div style={{ color: "#81C784", fontSize: 14, letterSpacing: 4, fontFamily: "'Share Tech Mono',monospace", animation: "fadeIn 0.5s ease" }}>
            ACCESS GRANTED — ENTERING ARCHIVE
          </div>
          <div style={{ position: "absolute", inset: "-20px", border: `2px solid #81C784`, borderRadius: "50%", animation: "success-ring 1s ease forwards" }} />
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   REAL DRAGGABLE MAP — New Elysium
══════════════════════════════════════════════════════════════ */
function TacticalMap({ faction, listenMode }) {
  const svgRef = useRef();
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [tooltip, setTooltip] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [liveData, setLiveData] = useState(() => MAP_DISTRICTS.map(d => ({ ...d, currentInf: d.infectionLevel })));
  const [spreadEvents, setSpreadEvents] = useState([]);
  const [tick, setTick] = useState(0);
  const f = FACTIONS[faction];
  const canFF = faction === "firefly" || faction === "fedra";
  const canFD = faction === "fedra";

  // Live infection simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
      setLiveData(prev => prev.map(d => {
        const delta = (Math.random() - 0.48) * 0.008;
        const newInf = Math.max(0.02, Math.min(0.99, d.currentInf + delta));
        return { ...d, currentInf: newInf };
      }));
      // Random spread event
      if (Math.random() < 0.3) {
        const src = MAP_DISTRICTS[Math.floor(Math.random() * MAP_DISTRICTS.length)];
        setSpreadEvents(ev => [...ev.slice(-8), { id: Date.now(), cx: src.cx + (Math.random() - 0.5) * 60, cy: src.cy + (Math.random() - 0.5) * 60 }]);
      }
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  // Wheel zoom
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.12 : 0.9;
    setZoom(z => Math.max(0.5, Math.min(3.5, z * factor)));
  }, []);

  const handleMouseDown = (e) => {
    if (e.target.closest(".map-district")) return;
    setDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };
  const handleMouseMove = useCallback((e) => {
    if (dragging && dragStart) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  }, [dragging, dragStart]);
  const handleMouseUp = () => { setDragging(false); setDragStart(null); };

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  const getDistrictColor = (inf, ctrl, alpha = 1) => {
    if (ctrl === "fedra") return `rgba(30,120,200,${alpha * 0.5 + inf * 0.1})`;
    if (ctrl === "firefly") return `rgba(140,160,20,${alpha * 0.45 + inf * 0.15})`;
    if (ctrl === "survivor") return `rgba(180,140,60,${alpha * 0.45})`;
    if (ctrl === "qz") return `rgba(20,150,200,${alpha * 0.4})`;
    if (inf > 0.75) return `rgba(200,20,20,${alpha * 0.7})`;
    if (inf > 0.5) return `rgba(200,80,20,${alpha * 0.6})`;
    if (inf > 0.3) return `rgba(200,140,20,${alpha * 0.5})`;
    return `rgba(60,160,60,${alpha * 0.4})`;
  };

  const getDistrictStroke = (ctrl, inf) => {
    if (ctrl === "fedra") return "#3090E0";
    if (ctrl === "firefly") return "#A0C020";
    if (ctrl === "survivor") return "#C8A050";
    if (inf > 0.7) return "#CC2020";
    if (inf > 0.4) return "#CC8020";
    return "#60B060";
  };

  const VMAP_W = 1050, VMAP_H = 800;

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", background: "#0a0d08", overflow: "hidden", cursor: dragging ? "grabbing" : "grab" }}>
      {/* Map controls */}
      <div style={{ position: "absolute", top: 10, right: 10, zIndex: 10, display: "flex", flexDirection: "column", gap: 4 }}>
        {["+", "−", "⌂"].map((btn, i) => (
          <button key={btn} onClick={() => {
            AudioEngine.play("click");
            if (btn === "+") setZoom(z => Math.min(3.5, z * 1.25));
            else if (btn === "−") setZoom(z => Math.max(0.5, z * 0.8));
            else { setZoom(1); setPan({ x: 0, y: 0 }); }
          }}
            style={{ width: 32, height: 32, background: "rgba(0,0,0,0.7)", border: `1px solid ${f.border}`, color: f.color, fontSize: 14, cursor: "pointer", fontFamily: "'Share Tech Mono',monospace", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.9)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,0.7)"}
          >{btn}</button>
        ))}
      </div>

      {/* Zoom indicator */}
      <div style={{ position: "absolute", bottom: 8, right: 10, fontSize: 8, color: `${f.color}55`, fontFamily: "'Share Tech Mono',monospace", zIndex: 10 }}>
        ZOOM {Math.round(zoom * 100)}% · SCROLL TO ZOOM · DRAG TO PAN
      </div>

      <svg ref={svgRef} width="100%" height="100%" viewBox={`0 0 ${VMAP_W} ${VMAP_H}`}
        onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
        style={{ display: "block" }}>
        <defs>
          <filter id="district-glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="spread-glow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="ap-glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.025)" strokeWidth="0.5" />
          </pattern>
          <pattern id="terrain-dots" width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="4" cy="4" r="0.5" fill="rgba(80,120,60,0.12)" />
          </pattern>
          <radialGradient id="cityVignette" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="100%" stopColor="rgba(5,8,3,0.7)" />
          </radialGradient>
        </defs>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom}) translate(${(VMAP_W / zoom * (1 - 1 / zoom)) / 2 * 0}, ${0})`}>

          {/* Base terrain */}
          <rect width={VMAP_W} height={VMAP_H} fill="#0e1408" />
          <rect width={VMAP_W} height={VMAP_H} fill="url(#terrain-dots)" />
          <rect width={VMAP_W} height={VMAP_H} fill="url(#map-grid)" />

          {/* City boundary */}
          <ellipse cx={530} cy={400} rx={480} ry={360} fill="rgba(20,30,15,0.5)" stroke="rgba(100,130,60,0.2)" strokeWidth="1.5" strokeDasharray="8,5" />

          {/* Outer terrain patches */}
          {[[100,700,180,60,"rgba(20,50,15,0.4)"],[900,680,160,55,"rgba(20,50,15,0.3)"],[30,200,100,80,"rgba(15,40,10,0.35)"],[950,150,120,70,"rgba(15,40,10,0.3)"]].map(([x,y,w,h,fill],i) => (
            <ellipse key={i} cx={x} cy={y} rx={w/2} ry={h/2} fill={fill} />
          ))}

          {/* Water features */}
          <path d="M 750,0 Q 820,100 780,200 Q 820,280 750,300 Q 920,250 1000,200 L 1050,0 Z" fill="rgba(20,50,100,0.35)" />
          <path d="M 760,10 Q 800,80 775,180" stroke="rgba(40,80,160,0.3)" strokeWidth="2" fill="none" />
          <text x={870} y={130} fill="rgba(60,100,180,0.4)" fontSize="11" fontFamily="'Share Tech Mono',monospace" transform="rotate(-15, 870, 130)">EASTERN SEA</text>

          {/* Roads */}
          {ROADS.map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="rgba(180,160,100,0.18)" strokeWidth="2.5"
              strokeDasharray="none" />
          ))}
          {ROADS.map(([x1, y1, x2, y2], i) => (
            <line key={`r2-${i}`} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="rgba(220,190,120,0.08)" strokeWidth="5" />
          ))}

          {/* Spread events (animated rings) */}
          {spreadEvents.map(ev => (
            <circle key={ev.id} cx={ev.cx} cy={ev.cy} r="3" fill="none"
              stroke="rgba(255,40,40,0.7)" strokeWidth="1.5"
              style={{ animation: "infection-spread 2s ease-out forwards" }} />
          ))}

          {/* District blobs */}
          {liveData.map(d => {
            const isVisible = d.controlled !== "firefly" || canFF;
            if (!isVisible) return null;
            const live = d.currentInf;
            const fill = getDistrictColor(live, d.controlled, 0.9);
            const stroke = getDistrictStroke(d.controlled, live);
            const strokeW = d.controlled === "fedra" || d.controlled === "firefly" ? 1.5 : 1;

            return (
              <g key={d.id} className="map-district"
                style={{ cursor: "pointer" }}
                onMouseEnter={(e) => { AudioEngine.play("hover"); setTooltip(d); const rect = svgRef.current.getBoundingClientRect(); setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top }); }}
                onMouseLeave={() => setTooltip(null)}>

                {/* Outer glow for high infection */}
                {live > 0.6 && (
                  <circle cx={d.cx} cy={d.cy} r={d.r + 16}
                    fill={`rgba(200,20,20,${(live - 0.6) * 0.25})`}
                    style={{ animation: `map-pulse ${1.5 + Math.random()}s ease-in-out infinite` }} />
                )}
                {/* QZ wall effect */}
                {d.controlled === "fedra" && (
                  <circle cx={d.cx} cy={d.cy} r={d.r + 8}
                    fill="none" stroke="rgba(60,150,220,0.25)" strokeWidth="4" strokeDasharray="6,4" />
                )}

                {/* Main district */}
                <circle cx={d.cx} cy={d.cy} r={d.r}
                  fill={fill} stroke={stroke}
                  strokeWidth={strokeW} opacity={listenMode && live < 0.5 ? 0.5 : 1}
                  style={{ filter: "url(#district-glow)", transition: "fill 1.5s ease, stroke 1.5s ease" }} />

                {/* Listen mode pulse for danger zones */}
                {listenMode && live > 0.5 && (
                  <circle cx={d.cx} cy={d.cy} r={d.r + 20}
                    fill="none" stroke="rgba(255,40,40,0.8)" strokeWidth="1.5"
                    style={{ animation: "infection-spread 2s ease-out infinite" }} />
                )}

                {/* District label */}
                <text x={d.cx} y={d.cy - 3} textAnchor="middle" fill="rgba(240,230,200,0.9)"
                  fontSize={d.r > 55 ? 10 : 9} fontFamily="'Share Tech Mono',monospace"
                  fontWeight="600" style={{ pointerEvents: "none" }}>
                  {d.shortName}
                </text>
                <text x={d.cx} y={d.cy + 10} textAnchor="middle" fill={stroke}
                  fontSize="7.5" fontFamily="'Share Tech Mono',monospace"
                  style={{ pointerEvents: "none", opacity: 0.9 }}>
                  {Math.round(live * 100)}%
                </text>
              </g>
            );
          })}

          {/* Arcade Points */}
          {ARCADE_PTS.filter(ap => ap.faction === "public" || ap.faction === "survivor" || (ap.faction === "firefly" && canFF) || (ap.faction === "fedra" && canFD)).map(ap => {
            const c = ap.status === "active" ? "#60D8F8" : ap.status === "damaged" ? "#FFD54F" : "#555";
            return (
              <g key={ap.id} style={{ cursor: "pointer" }}
                onMouseEnter={(e) => { setTooltip({ name: ap.name, status: ap.status, isAP: true }); const rect = svgRef.current.getBoundingClientRect(); setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top }); }}
                onMouseLeave={() => setTooltip(null)}>
                {ap.status === "active" && (
                  <circle cx={ap.cx} cy={ap.cy} r="14" fill="none" stroke={c} strokeWidth="0.8" opacity="0.4">
                    <animate attributeName="r" values="10;18;10" dur="2.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.4;0;0.4" dur="2.5s" repeatCount="indefinite" />
                  </circle>
                )}
                <rect x={ap.cx - 5} y={ap.cy - 5} width={10} height={10}
                  fill={`${c}22`} stroke={c} strokeWidth="1.2"
                  transform={`rotate(45 ${ap.cx} ${ap.cy})`} filter="url(#ap-glow)" />
              </g>
            );
          })}

          {/* City name */}
          <text x={530} y={770} textAnchor="middle" fill="rgba(200,180,120,0.25)"
            fontSize="18" fontFamily="'Cinzel',serif" letterSpacing="6">
            NEW ELYSIUM
          </text>

          {/* Vignette */}
          <rect width={VMAP_W} height={VMAP_H} fill="url(#cityVignette)" style={{ pointerEvents: "none" }} />
        </g>
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position: "absolute", left: tooltipPos.x + 12, top: tooltipPos.y - 20,
          background: "rgba(5,8,3,0.95)", border: `1px solid ${f.color}50`,
          padding: "10px 14px", pointerEvents: "none", zIndex: 20,
          minWidth: 160, animation: "fadeIn 0.15s ease",
        }}>
          <div style={{ fontSize: 11, color: f.color, fontFamily: "'Share Tech Mono',monospace", marginBottom: 4 }}>{tooltip.name}</div>
          {!tooltip.isAP && (
            <>
              <div style={{ fontSize: 9, color: `${f.color}80`, fontFamily: "'Share Tech Mono',monospace" }}>
                CTRL: {tooltip.controlled?.toUpperCase()}
              </div>
              <div style={{ fontSize: 9, color: tooltip.currentInf > 0.7 ? "#FF4444" : tooltip.currentInf > 0.4 ? "#FFD54F" : "#81C784", fontFamily: "'Share Tech Mono',monospace", marginTop: 2 }}>
                INF: {tooltip.currentInf ? Math.round(tooltip.currentInf * 100) : Math.round(tooltip.infectionLevel * 100)}%
              </div>
              {tooltip.population > 0 && <div style={{ fontSize: 9, color: `${f.color}55`, fontFamily: "'Share Tech Mono',monospace", marginTop: 2 }}>POP: {tooltip.population.toLocaleString()}</div>}
            </>
          )}
          {tooltip.isAP && <div style={{ fontSize: 9, color: tooltip.status === "active" ? "#81C784" : "#FFD54F", fontFamily: "'Share Tech Mono',monospace" }}>STATUS: {tooltip.status?.toUpperCase()}</div>}
        </div>
      )}

      {/* Legend */}
      <div style={{ position: "absolute", bottom: 8, left: 10, display: "flex", gap: 10, flexWrap: "wrap", zIndex: 10 }}>
        {[
          { c: "rgba(200,20,20,0.7)", l: "INFECTED" },
          { c: "rgba(30,120,200,0.7)", l: "FEDRA" },
          { c: "rgba(140,160,20,0.7)", l: "FIREFLY" },
          { c: "rgba(180,140,60,0.7)", l: "SURVIVOR" },
          { c: "#60D8F8", l: "ARCADE PT" },
        ].map(x => (
          <div key={x.l} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 8, color: "rgba(220,200,150,0.55)", fontFamily: "'Share Tech Mono',monospace" }}>
            <div style={{ width: 9, height: 9, background: x.c, borderRadius: 2 }} />{x.l}
          </div>
        ))}
      </div>

      {listenMode && (
        <div style={{ position: "absolute", top: 10, left: 10, padding: "4px 10px", border: "1px solid rgba(255,50,50,0.75)", color: "#FF4444", fontSize: 8, fontFamily: "'Share Tech Mono',monospace", letterSpacing: 2, zIndex: 10, animation: "pulse-gold 1s infinite" }}>
          ● LISTEN MODE — THREATS HIGHLIGHTED
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   CHARTS
══════════════════════════════════════════════════════════════ */
function LineChart({ data, color }) {
  if (!data?.length) return null;
  const mx = Math.max(...data.map(d => d.value)), mn = Math.min(...data.map(d => d.value));
  const W = 280, H = 80, P = 10;
  const pts = data.map((d, i) => `${P + (i / (data.length - 1)) * (W - P * 2)},${P + (1 - (d.value - mn) / (mx - mn + 0.001)) * (H - P * 2)}`);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 78 }}>
      <defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.3" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>
      <path d={`M${pts[0]} L${pts.join(" L")} L${W - P},${H - P} L${P},${H - P} Z`} fill="url(#cg)" />
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="1.5" />
      {data.map((d, i) => { const x = P + (i / (data.length - 1)) * (W - P * 2), y = P + (1 - (d.value - mn) / (mx - mn + 0.001)) * (H - P * 2); return <circle key={i} cx={x} cy={y} r={2.2} fill={color} />; })}
      {data.map((d, i) => { const x = P + (i / (data.length - 1)) * (W - P * 2); return <text key={i} x={x} y={H - 1} textAnchor="middle" fill="rgba(255,255,255,0.22)" fontSize="6">{d.day}</text>; })}
    </svg>
  );
}
function DonutChart({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0); let a = -Math.PI / 2;
  const r = 28, cx = 38, cy = 35;
  const slices = data.map(d => {
    const sw = (d.value / total) * Math.PI * 2, x1 = cx + r * Math.cos(a), y1 = cy + r * Math.sin(a);
    a += sw;
    return { ...d, path: `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${sw > Math.PI ? 1 : 0} 1 ${cx + r * Math.cos(a)},${cy + r * Math.sin(a)} Z`, pct: Math.round(d.value / total * 100) };
  });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <svg viewBox="0 0 76 70" style={{ width: 76, height: 70, flexShrink: 0 }}>
        {slices.map((s, i) => <path key={i} d={s.path} fill={s.color} stroke="#060604" strokeWidth="0.5" />)}
        <circle cx={cx} cy={cy} r={12} fill="#0a0804" />
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {slices.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10 }}>
            <div style={{ width: 7, height: 7, background: s.color, flexShrink: 0 }} />
            <span style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'Share Tech Mono',monospace", fontSize: 9 }}>{s.label}</span>
            <span style={{ color: s.color, marginLeft: "auto", paddingLeft: 6, fontFamily: "'Share Tech Mono',monospace", fontSize: 9 }}>{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   LANDING PAGE
══════════════════════════════════════════════════════════════ */
function LandingPage({ onLogin }) {
  const [scrollY, setScrollY] = useState(0);
  const [showAuth, setShowAuth] = useState(false);
  const containerRef = useRef();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const h = () => setScrollY(el.scrollTop);
    el.addEventListener("scroll", h, { passive: true });
    return () => el.removeEventListener("scroll", h);
  }, []);

  const p = (f) => scrollY * f;

  if (showAuth) {
    return (
      <div style={{ minHeight: "100vh", background: "#050302", color: "#D4A853", position: "relative" }}>
        <style>{GLOBAL_CSS}</style>
        <div style={{ position: "fixed", inset: 0, backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.05) 3px,rgba(0,0,0,0.05) 4px)", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 960, margin: "0 auto", padding: "40px 20px" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ fontSize: 9, letterSpacing: 6, color: "rgba(212,168,83,0.35)", marginBottom: 8, fontFamily: "'Share Tech Mono',monospace" }}>THE CORDYCEPS ARCHIVE · FACTION ACCESS</div>
            <div style={{ width: 200, height: 1, background: "linear-gradient(90deg,transparent,rgba(212,168,83,0.4),transparent)", margin: "0 auto" }} />
          </div>
          <FactionAuth onLogin={onLogin} />
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ height: "100vh", overflowY: "auto", overflowX: "hidden", background: "#050302", color: "#D4A853", fontFamily: "'Share Tech Mono',monospace" }}>
      <style>{GLOBAL_CSS}</style>

      {/* ── HERO ── */}
      <div style={{ position: "relative", height: "100vh", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", inset: "-20%", background: "radial-gradient(ellipse 90% 70% at 50% 45%, #1c0e03 0%, #080402 55%, #010100 100%)", transform: `translateY(${p(0.25)}px)`, zIndex: 0 }} />

        {/* Fungal vines */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "120%", top: "-10%", zIndex: 1, opacity: 0.13, transform: `translateY(${p(0.15)}px)` }} viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice">
          {Array.from({ length: 14 }, (_, i) => (
            <path key={i} d={`M${500 + Math.sin(i * 0.7) * 300},700 C${460 + Math.cos(i * 1.1) * 160},${480 + Math.sin(i) * 60} ${380 + Math.sin(i * 0.9) * 220},${300 + Math.cos(i * 1.3) * 80} ${320 + Math.cos(i) * 260},${-30 + i * 4}`}
              stroke={`hsl(${25 + i * 4},${50 + i * 2}%,${18 + i * 2}%)`} strokeWidth={0.8 + i * 0.25} fill="none" strokeDasharray={`${4 + i * 2},${7 + i * 3}`} />
          ))}
        </svg>

        {/* City silhouette */}
        <svg style={{ position: "absolute", bottom: 0, left: 0, width: "100%", zIndex: 2, opacity: 0.09, transform: `translateY(${p(0.35)}px)` }} viewBox="0 0 1400 300" preserveAspectRatio="xMidYMax slice">
          <path d="M0,300 L0,200 L40,200 L40,140 L80,140 L80,180 L120,180 L120,100 L160,100 L160,150 L200,150 L200,110 L240,110 L240,60 L280,60 L280,100 L320,100 L320,120 L360,120 L360,75 L400,75 L400,130 L440,130 L440,85 L480,85 L480,145 L520,145 L520,65 L560,65 L560,110 L600,110 L600,165 L640,165 L640,115 L680,115 L680,75 L720,75 L720,125 L760,125 L760,95 L800,95 L800,155 L840,155 L840,100 L880,100 L880,145 L920,145 L920,185 L960,185 L960,135 L1000,135 L1000,175 L1040,175 L1040,155 L1080,155 L1080,200 L1120,200 L1120,175 L1160,175 L1160,215 L1200,215 L1200,190 L1240,190 L1240,220 L1280,220 L1280,200 L1320,200 L1320,230 L1400,230 L1400,300 Z" fill="rgba(200,169,110,0.25)" />
        </svg>

        <SporeField count={26} color="rgba(180,130,45,0.5)" />

        <div style={{ position: "absolute", inset: 0, zIndex: 3, background: "radial-gradient(ellipse 75% 75% at 50% 50%, transparent 25%, rgba(0,0,0,0.82) 100%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, zIndex: 4, overflow: "hidden", pointerEvents: "none" }}>
          <div style={{ width: "100%", height: 3, background: "linear-gradient(180deg,transparent,rgba(200,169,110,0.04),transparent)", animation: "scanline 9s linear infinite" }} />
        </div>

        {/* Hero text */}
        <div style={{ position: "relative", zIndex: 5, textAlign: "center", transform: `translateY(${p(0.18)}px)`, padding: "0 24px" }}>
          <div style={{ fontSize: 10, letterSpacing: 10, color: "rgba(212,168,83,0.28)", marginBottom: 20, animation: "fadeIn 2.5s ease 0.3s both", fontFamily: "'Share Tech Mono',monospace" }}>
            YEAR 2023 · CITY UNDER QUARANTINE
          </div>
          <div style={{ width: "40%", maxWidth: 200, height: 1, background: "linear-gradient(90deg,transparent,rgba(212,168,83,0.4),transparent)", margin: "0 auto 28px", animation: "fadeIn 1s ease 0.9s both" }} />
          <h1 style={{
            fontFamily: "'Cinzel Decorative',serif", fontWeight: 900,
            fontSize: "clamp(36px,8.5vw,100px)", letterSpacing: "0.06em", lineHeight: 0.94,
            color: "#D4A853", margin: "0 0 10px",
            textShadow: "0 0 60px rgba(212,168,83,0.3), 0 0 120px rgba(212,168,83,0.1), 0 6px 30px rgba(0,0,0,0.9)",
            animation: "fadeUp 1.4s cubic-bezier(0.16,1,0.3,1) 0.6s both",
          }}>
            THE<br /><span style={{ color: "#F5F0E8", textShadow: "0 0 80px rgba(255,255,255,0.12)" }}>TURNING</span><br />POINT
          </h1>
          <div style={{ width: "50%", maxWidth: 280, height: 1, background: "linear-gradient(90deg,transparent,rgba(212,168,83,0.45),transparent)", margin: "28px auto 22px", animation: "fadeIn 1s ease 1.9s both" }} />
          <p style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(14px,1.8vw,18px)", color: "rgba(212,168,83,0.5)", letterSpacing: 1.5, fontStyle: "italic", animation: "fadeIn 1s ease 2.3s both", maxWidth: 400, margin: "0 auto 32px" }}>
            "When you're lost in the darkness,<br />look for the light."
          </p>
          <div style={{ animation: "fadeIn 1s ease 3s both", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, position: "absolute", bottom: "-35vh", left: "50%", transform: "translateX(-50%)", animation: "breathe 2.5s ease infinite" }}>
            <div style={{ fontSize: 8, letterSpacing: 5, color: "rgba(212,168,83,0.28)", fontFamily: "'Share Tech Mono',monospace", whiteSpace: "nowrap" }}>SCROLL TO CONTINUE</div>
          </div>
        </div>
      </div>

      {/* ── THE FALL ── */}
      <div style={{ position: "relative", minHeight: "100vh", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", padding: "100px 24px" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #050302 0%, #0d0601 50%, #050302 100%)" }} />
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: `translate(-50%, calc(-50% + ${p(-0.1)}px))`, fontSize: "clamp(55px,14vw,160px)", fontFamily: "'Cinzel',serif", fontWeight: 900, color: "rgba(90,50,15,0.04)", letterSpacing: "-0.02em", whiteSpace: "nowrap", userSelect: "none", zIndex: 0 }}>CORDYCEPS</div>
        <div style={{ position: "relative", zIndex: 2, maxWidth: 980, width: "100%" }}>
          <ScrollReveal>
            <div style={{ textAlign: "center", marginBottom: 52 }}>
              <div style={{ fontSize: 9, letterSpacing: 7, color: "rgba(212,168,83,0.28)", marginBottom: 10, fontFamily: "'Share Tech Mono',monospace" }}>ARCHIVE ENTRY 001</div>
              <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: "clamp(24px,4vw,46px)", color: "#D4A853", letterSpacing: 3 }}>The Fall</h2>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, color: "rgba(212,168,83,0.45)", marginTop: 10, fontStyle: "italic" }}>How twenty years of civilization unraveled in twenty days.</div>
            </div>
          </ScrollReveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 20 }}>
            {[
              { date: "Sep 2003", title: "Patient Zero", icon: "◉", text: "A mutated Ophiocordyceps strain crosses the species barrier. First human cases dismissed as flu in Jakarta." },
              { date: "Oct 2003", title: "The Spread", icon: "◈", text: "Contaminated flour shipments carry the fungus globally. Containment fails. 60% of major cities compromised within weeks." },
              { date: "Nov 2003", title: "QZs Sealed", icon: "◻", text: "FEDRA declares martial law. Quarantine Zones walled off at gunpoint. Millions left outside." },
              { date: "2013", title: "A Decade Under", icon: "◆", text: "Nature reclaims the outside world. Firefly cells form. The desperate search for a vaccine begins." },
            ].map((item, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div style={{ padding: "22px 20px", border: "1px solid rgba(212,168,83,0.1)", background: "rgba(212,168,83,0.02)", position: "relative", transition: "border-color 0.3s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(212,168,83,0.2)"; AudioEngine.play("hover"); }}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(212,168,83,0.1)"}>
                  <div style={{ position: "absolute", top: 0, left: 0, width: 2, height: "100%", background: "linear-gradient(180deg, rgba(212,168,83,0.6), transparent)" }} />
                  <div style={{ fontSize: 22, color: "rgba(212,168,83,0.22)", marginBottom: 10 }}>{item.icon}</div>
                  <div style={{ fontSize: 8, letterSpacing: 3, color: "rgba(212,168,83,0.38)", marginBottom: 7, fontFamily: "'Share Tech Mono',monospace" }}>{item.date}</div>
                  <div style={{ fontSize: 15, fontFamily: "'Cinzel',serif", color: "#D4A853", marginBottom: 10, letterSpacing: 1 }}>{item.title}</div>
                  <div style={{ fontSize: 13, fontFamily: "'Playfair Display',serif", color: "rgba(212,168,83,0.55)", lineHeight: 1.85 }}>{item.text}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>

      {/* ── INFECTION STAGES ── */}
      <div style={{ position: "relative", minHeight: "100vh", overflow: "hidden", padding: "100px 24px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #050302 0%, #0f0500 50%, #050302 100%)" }} />
        <SporeField count={18} color="rgba(200,70,20,0.38)" />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 1000, width: "100%" }}>
          <ScrollReveal>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <div style={{ fontSize: 9, letterSpacing: 7, color: "rgba(212,168,83,0.28)", marginBottom: 10, fontFamily: "'Share Tech Mono',monospace" }}>FIELD MANUAL · THREAT CLASSIFICATION</div>
              <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: "clamp(22px,4vw,44px)", color: "#D4A853", letterSpacing: 3 }}>Stages of Infection</h2>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, color: "rgba(212,168,83,0.4)", marginTop: 10, fontStyle: "italic" }}>Every hour that passes changes the threat.</div>
            </div>
          </ScrollReveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 0, position: "relative" }}>
            <div style={{ position: "absolute", top: 44, left: "12.5%", right: "12.5%", height: 1, background: "linear-gradient(90deg, #FF6B35, #4A0000)", zIndex: 0, opacity: 0.5 }} />
            {INFECTION_STAGES.map((s, i) => (
              <ScrollReveal key={s.stage} delay={i * 150}>
                <div style={{ padding: "0 14px", position: "relative", zIndex: 1, textAlign: "center" }}
                  onMouseEnter={() => AudioEngine.play("hover")}>
                  <div style={{ width: 88, height: 88, borderRadius: "50%", border: `2px solid ${s.color}`, background: `radial-gradient(circle, ${s.color}18 0%, transparent 70%)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: `0 0 28px ${s.color}30`, fontFamily: "'Cinzel',serif", fontSize: 24, color: s.color, transition: "box-shadow 0.3s, transform 0.3s", cursor: "default" }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 0 48px ${s.color}65`; e.currentTarget.style.transform = "scale(1.06)"; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 0 28px ${s.color}30`; e.currentTarget.style.transform = "scale(1)"; }}
                  >{s.symbol}</div>
                  <div style={{ fontSize: 12, fontFamily: "'Cinzel',serif", color: s.color, letterSpacing: 2, marginBottom: 6 }}>{s.stage.toUpperCase()}</div>
                  <div style={{ fontSize: 9, letterSpacing: 2, color: `${s.color}70`, marginBottom: 10, fontFamily: "'Share Tech Mono',monospace" }}>{s.hours}</div>
                  <div style={{ fontSize: 12, fontFamily: "'Playfair Display',serif", color: "rgba(220,190,140,0.55)", lineHeight: 1.8 }}>{s.description}</div>
                  <div style={{ marginTop: 14, height: 2, background: `linear-gradient(90deg, ${s.color}70, transparent)`, borderRadius: 2 }} />
                </div>
              </ScrollReveal>
            ))}
          </div>
          <ScrollReveal delay={350}>
            <div style={{ marginTop: 60, padding: "22px 28px", border: "1px solid rgba(79,195,247,0.18)", background: "rgba(79,195,247,0.025)", display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 8, letterSpacing: 4, color: "rgba(79,195,247,0.45)", marginBottom: 5, fontFamily: "'Share Tech Mono',monospace" }}>PROJECT SERAPHIM</div>
                <div style={{ fontSize: 16, fontFamily: "'Cinzel',serif", color: "#60C8E8" }}>Vaccine Development</div>
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 6, fontFamily: "'Share Tech Mono',monospace" }}>
                  <span style={{ color: "rgba(255,255,255,0.25)" }}>PHASE II TRIALS</span><span style={{ color: "#81C784" }}>34%</span>
                </div>
                <div style={{ height: 5, background: "rgba(255,255,255,0.07)" }}><div style={{ width: "34%", height: "100%", background: "linear-gradient(90deg,#0288D1,#81C784)" }} /></div>
              </div>
              <div style={{ fontSize: 11, fontFamily: "'Playfair Display',serif", color: "rgba(79,195,247,0.38)", fontStyle: "italic" }}>Firefly Lab · Location: Classified</div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* ── CONFIDENTIAL DOCUMENT SECTION ── */}
      <div style={{ position: "relative", minHeight: "100vh", overflow: "hidden", padding: "60px 24px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 100% 90% at 50% 50%, #0e0904 0%, #050302 100%)" }} />
        {[{ top: 20, left: 20, borderTop: "1px solid rgba(212,168,83,0.2)", borderLeft: "1px solid rgba(212,168,83,0.2)" },
          { top: 20, right: 20, borderTop: "1px solid rgba(212,168,83,0.2)", borderRight: "1px solid rgba(212,168,83,0.2)" },
          { bottom: 20, left: 20, borderBottom: "1px solid rgba(212,168,83,0.2)", borderLeft: "1px solid rgba(212,168,83,0.2)" },
          { bottom: 20, right: 20, borderBottom: "1px solid rgba(212,168,83,0.2)", borderRight: "1px solid rgba(212,168,83,0.2)" },
        ].map((s, i) => <div key={i} style={{ position: "absolute", ...s, width: 48, height: 48, zIndex: 1 }} />)}
        <div style={{ position: "relative", zIndex: 2, width: "100%", textAlign: "center" }}>
          <ScrollReveal>
            <div style={{ marginBottom: 36 }}>
              <div style={{ fontSize: 9, letterSpacing: 7, color: "rgba(212,168,83,0.28)", marginBottom: 10, fontFamily: "'Share Tech Mono',monospace" }}>TERMINAL ACCESS REQUIRED</div>
              <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: "clamp(22px,4vw,40px)", color: "#D4A853", letterSpacing: 3, marginBottom: 8 }}>Identify & Align</h2>
              <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, color: "rgba(212,168,83,0.45)", fontStyle: "italic" }}>A classified document has been left here. Examine it.</p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <ConfidentialDoc onOpen={() => setShowAuth(true)} />
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   COMMAND CENTER
══════════════════════════════════════════════════════════════ */
function CommandCenter({ faction, username, onLogout }) {
  const f = FACTIONS[faction];
  const [selZone, setSelZone] = useState(MAP_DISTRICTS[0]);
  const [infData, setInfData] = useState(() => genHistory(MAP_DISTRICTS[0].infectionLevel));
  const [resData, setResData] = useState(() => genResources(MAP_DISTRICTS[0].id));
  const [listen, setListen] = useState(false);
  const [health] = useState(0.7 + Math.random() * 0.22);
  const [risk] = useState(Math.random() * 0.4);
  const [inv] = useState(RESOURCES.map((r, i) => ({ name: r, icon: RESOURCE_ICONS[i], qty: Math.floor(Math.random() * 20) })));
  const [clock, setClock] = useState(new Date());

  useEffect(() => { const t = setInterval(() => setClock(new Date()), 1000); return () => clearInterval(t); }, []);

  const handleZone = (id) => {
    const z = MAP_DISTRICTS.find(d => d.id === id);
    setSelZone(z); setInfData(genHistory(z.infectionLevel)); setResData(genResources(z.id));
    AudioEngine.play("click");
  };

  const riskColor = risk < 0.2 ? "#81C784" : risk < 0.5 ? "#FFD54F" : "#FF4444";
  const riskLabel = risk < 0.2 ? "LOW" : risk < 0.5 ? "MEDIUM" : "CRITICAL";

  return (
    <div style={{ minHeight: "100vh", background: f.bg, color: f.color, fontFamily: f.monoFont, position: "relative" }}>
      <style>{GLOBAL_CSS}</style>
      <style>{`* { scrollbar-width:thin; scrollbar-color:${f.border} transparent; } select option { background:${f.bg}; }`}</style>
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.06) 3px,rgba(0,0,0,0.06) 4px)" }} />

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100vh" }}>
        {/* Topbar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", padding: "8px 16px", borderBottom: `1px solid ${f.border}`, background: `${f.secondary}dd`, gap: 8, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 14, letterSpacing: 3, color: f.color }}>{f.icon} THE TURNING POINT</div>
            <div style={{ padding: "2px 9px", border: `1px solid ${f.color}80`, fontSize: 8, letterSpacing: 3, color: f.color, background: `${f.color}12`, fontFamily: "'Share Tech Mono',monospace" }}>{f.tag}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ fontSize: 10, color: `${f.color}70`, fontFamily: "'Share Tech Mono',monospace" }}>{clock.toLocaleTimeString("en-US", { hour12: false })}</div>
            <div style={{ fontSize: 10, color: `${f.color}55`, fontFamily: f.monoFont }}>{username.toUpperCase()}</div>
            <button onClick={() => { setListen(l => !l); AudioEngine.play("select"); }}
              style={{ padding: "3px 10px", background: listen ? `${f.color}18` : "transparent", border: `1px solid ${listen ? f.color : `${f.color}35`}`, color: listen ? f.color : `${f.color}55`, fontSize: 8, letterSpacing: 2, cursor: "pointer", fontFamily: f.monoFont }}>
              {listen ? "● LISTEN: ON" : "○ LISTEN"}
            </button>
            <button onClick={() => { AudioEngine.play("click"); onLogout(); }}
              style={{ padding: "3px 10px", background: "transparent", border: "1px solid rgba(255,50,50,0.35)", color: "rgba(255,80,80,0.7)", fontSize: 8, letterSpacing: 2, cursor: "pointer", fontFamily: "'Share Tech Mono',monospace" }}>DISCONNECT</button>
          </div>
        </div>

        {/* Objective */}
        <div style={{ padding: "5px 16px", background: `${f.color}09`, borderBottom: `1px solid ${f.border}`, fontSize: 9, letterSpacing: 3, color: `${f.color}80`, fontFamily: "'Share Tech Mono',monospace", flexShrink: 0 }}>
          ▸ {{ survivor: "LOCATE nearest safe Arcade Point. Avoid infected zones.", firefly: "CONNECT rebel zones. Liberate occupied territories.", fedra: "PATROL FEDRA outposts. Maintain quarantine protocols." }[faction]}
        </div>

        {/* Main grid */}
        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr 200px", gap: 8, padding: 8, flex: 1, minHeight: 0 }}>

          {/* LEFT */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, overflow: "auto" }}>
            {/* Biometric */}
            <div style={{ border: `1px solid ${f.border}`, padding: 12, background: `${f.secondary}88`, flexShrink: 0 }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: `${f.color}55`, marginBottom: 10, fontFamily: "'Share Tech Mono',monospace" }}>▸ BIOMETRIC STATUS</div>
              {[{ label: "HEALTH", v: health, c: "#81C784", g: "#388E3C,#81C784", txt: `${Math.round(health * 100)}%` },
                { label: "INFECTION RISK", v: risk, c: riskColor, g: `${riskColor}70,${riskColor}`, txt: riskLabel }].map(b => (
                <div key={b.label} style={{ marginBottom: 9 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, marginBottom: 3, fontFamily: "'Share Tech Mono',monospace" }}>
                    <span style={{ color: `${f.color}70` }}>{b.label}</span><span style={{ color: b.c }}>{b.txt}</span>
                  </div>
                  <div style={{ height: 4, background: "rgba(255,255,255,0.07)" }}><div style={{ width: `${b.v * 100}%`, height: "100%", background: `linear-gradient(90deg,${b.g})` }} /></div>
                </div>
              ))}
            </div>

            {/* Territory */}
            <div style={{ border: `1px solid ${f.border}`, padding: 12, background: `${f.secondary}88`, flexShrink: 0 }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: `${f.color}55`, marginBottom: 10, fontFamily: "'Share Tech Mono',monospace" }}>▸ TERRITORY CONTROL</div>
              {[{ l: "MILITARY", v: 35, c: "#60C8E8" }, { l: "FIREFLIES", v: 22, c: "#C8D840" }, { l: "INFECTED", v: 43, c: "#FF4444" }].map(t => (
                <div key={t.l} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, marginBottom: 3, fontFamily: "'Share Tech Mono',monospace" }}>
                    <span style={{ color: `${t.c}88` }}>{t.l}</span><span style={{ color: t.c }}>{t.v}%</span>
                  </div>
                  <div style={{ height: 3, background: "rgba(255,255,255,0.07)" }}><div style={{ width: `${t.v}%`, height: "100%", background: t.c, opacity: 0.65 }} /></div>
                </div>
              ))}
            </div>

            {/* Inventory */}
            <div style={{ border: `1px solid ${f.border}`, padding: 12, background: `${f.secondary}88`, flex: 1 }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: `${f.color}55`, marginBottom: 10, fontFamily: "'Share Tech Mono',monospace" }}>▸ INVENTORY</div>
              {inv.map(r => (
                <div key={r.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, padding: "5px 7px", border: `1px solid ${f.border}55`, background: `${f.color}04` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 13 }}>{r.icon}</span>
                    <span style={{ fontSize: 9, fontFamily: "'Share Tech Mono',monospace" }}>{r.name.toUpperCase()}</span>
                  </div>
                  <span style={{ fontSize: 10, color: r.qty < 3 ? "#FF4444" : f.color, fontFamily: f.monoFont }}>x{r.qty}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CENTER — MAP fills all available space */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, minHeight: 0 }}>
            <div style={{ border: `1px solid ${f.border}`, flex: 1, overflow: "hidden", minHeight: 300, display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "6px 12px", background: f.secondary, borderBottom: `1px solid ${f.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
                <div style={{ fontSize: 9, letterSpacing: 3, color: `${f.color}70`, fontFamily: "'Share Tech Mono',monospace" }}>▸ TACTICAL MAP — NEW ELYSIUM · LIVE</div>
                <div style={{ display: "flex", gap: 5 }}>
                  {["AP", "QZ", "INF"].map(t => <div key={t} style={{ fontSize: 7.5, padding: "1px 6px", border: `1px solid ${f.border}`, color: `${f.color}55`, fontFamily: "'Share Tech Mono',monospace" }}>{t}</div>)}
                </div>
              </div>
              <div style={{ flex: 1, minHeight: 0 }}>
                <TacticalMap faction={faction} listenMode={listen} />
              </div>
            </div>

            {/* Zone Analytics */}
            <div style={{ border: `1px solid ${f.border}`, padding: 12, background: `${f.secondary}88`, flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 6 }}>
                <div style={{ fontSize: 9, letterSpacing: 3, color: `${f.color}55`, fontFamily: "'Share Tech Mono',monospace" }}>▸ ZONE ANALYTICS</div>
                <select value={selZone.id} onChange={e => handleZone(e.target.value)}
                  style={{ padding: "4px 9px", background: f.bg, border: `1px solid ${f.border}`, color: f.color, fontFamily: "'Share Tech Mono',monospace", fontSize: 9, outline: "none" }}>
                  {MAP_DISTRICTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <div style={{ fontSize: 8, letterSpacing: 2, color: `${f.color}45`, marginBottom: 5, fontFamily: "'Share Tech Mono',monospace" }}>CHART A · INFECTION FORECAST</div>
                  <LineChart data={infData} color={selZone.infectionLevel > 0.6 ? "#FF4444" : "#FFD54F"} />
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,0.22)", marginTop: 3, fontFamily: "'Share Tech Mono',monospace" }}>
                    AVG: {Math.round(infData.reduce((s, d) => s + d.value, 0) / infData.length * 100)}% | {infData[6]?.value > infData[0]?.value ? "▲ RISING" : "▼ DECLINING"}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 8, letterSpacing: 2, color: `${f.color}45`, marginBottom: 5, fontFamily: "'Share Tech Mono',monospace" }}>CHART B · RESOURCE SCARCITY</div>
                  <DonutChart data={resData} />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, overflow: "auto" }}>
            {/* Faction Intel */}
            <div style={{ border: `1px solid ${f.border}`, padding: 12, background: `${f.secondary}88`, flexShrink: 0 }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: `${f.color}55`, marginBottom: 10, fontFamily: "'Share Tech Mono',monospace" }}>▸ FACTION INTEL</div>
              {faction === "survivor" && <div style={{ fontSize: 10, color: `${f.color}80`, lineHeight: 1.9, fontFamily: "'Playfair Display',serif" }}>
                <div style={{ color: "#81C784", marginBottom: 5, fontSize: 9, letterSpacing: 2, fontFamily: "'Share Tech Mono',monospace" }}>NEAREST SAFE POINTS:</div>
                <div>AP-077: City Hall — 0.8km</div><div>AP-034: Green Zone — 2.1km</div>
                <div style={{ marginTop: 9, padding: "7px", border: `1px solid ${f.border}`, fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "'Share Tech Mono',monospace", lineHeight: 1.6 }}>⚠ AVOID Old Quarter. Critical clicker density.</div>
              </div>}
              {faction === "firefly" && <div style={{ fontSize: 10, color: `${f.color}80`, lineHeight: 1.9, fontFamily: "'Oswald',sans-serif" }}>
                <div style={{ color: "#C8D840", marginBottom: 5, fontSize: 9, letterSpacing: 2 }}>REBEL ZONES:</div>
                <div>◈ FF Quarter — ACTIVE OPS</div><div>◈ Uni. Hill — SECURED</div><div>◈ Med. Row — ACTIVE</div>
                <div style={{ marginTop: 9, padding: "7px", border: `1px solid ${f.border}`, fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "'Share Tech Mono',monospace", lineHeight: 1.6 }}>⚡ Connect FF Quarter to Uni. Hill. Priority order.</div>
              </div>}
              {faction === "fedra" && <div style={{ fontSize: 10, color: `${f.color}80`, lineHeight: 1.9, fontFamily: "'Share Tech Mono',monospace" }}>
                <div style={{ color: "#60C8E8", marginBottom: 5, fontSize: 9, letterSpacing: 2 }}>PATROL ROUTES:</div>
                <div>▸ Green Zone → Harbor: CLEAR</div><div>▸ Harbor → Power Stn: PATROL</div><div>▸ Checkpoint: HIGH ALERT</div>
                <div style={{ marginTop: 9, padding: "7px", border: `1px solid ${f.border}`, fontSize: 10, color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>⚠ Firefly activity Uni. Hill. Lethal force auth.</div>
              </div>}
            </div>

            {/* Arcade Points */}
            <div style={{ border: `1px solid ${f.border}`, padding: 12, background: `${f.secondary}88`, flexShrink: 0 }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: `${f.color}55`, marginBottom: 10, fontFamily: "'Share Tech Mono',monospace" }}>▸ ARCADE POINTS</div>
              {ARCADE_PTS.filter(ap => ap.faction === "public" || ap.faction === "survivor" || (ap.faction === "firefly" && (faction === "firefly" || faction === "fedra")) || (ap.faction === "fedra" && faction === "fedra")).slice(0, 5).map(ap => (
                <div key={ap.id} style={{ marginBottom: 6, padding: "5px 7px", border: `1px solid ${f.border}55`, background: `${f.color}03`, display: "flex", justifyContent: "space-between", alignItems: "center" }}
                  onMouseEnter={() => AudioEngine.play("hover")}>
                  <div style={{ fontSize: 9, fontFamily: "'Share Tech Mono',monospace" }}>{ap.name}</div>
                  <div style={{ fontSize: 7.5, padding: "1px 5px", color: ap.status === "active" ? "#81C784" : ap.status === "damaged" ? "#FFD54F" : "#FF4444", border: `1px solid ${ap.status === "active" ? "#81C78430" : ap.status === "damaged" ? "#FFD54F30" : "#FF444430"}`, fontFamily: "'Share Tech Mono',monospace" }}>
                    {ap.status.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>

            {/* System Log */}
            <div style={{ border: `1px solid ${f.border}`, padding: 12, background: `${f.secondary}88`, flex: 1 }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: `${f.color}55`, marginBottom: 10, fontFamily: "'Share Tech Mono',monospace" }}>▸ SYSTEM LOG</div>
              {[
                { time: "02:41", msg: "QZ-Alpha perimeter breach — sealed", lvl: "warn" },
                { time: "02:38", msg: "AP-077 sync complete", lvl: "info" },
                { time: "02:31", msg: "Infection spike: Old Quarter +12%", lvl: "critical" },
                { time: "02:20", msg: "Resource drop: Green Zone rcvd", lvl: "info" },
                { time: "02:14", msg: "Runner group: 8 units — Harbor", lvl: "warn" },
                { time: "02:09", msg: "Firefly signal: Uni. Hill detected", lvl: "warn" },
              ].map((log, i) => (
                <div key={i} style={{ fontSize: 8.5, marginBottom: 5, padding: "3px 0", borderBottom: `1px solid ${f.border}25`, display: "flex", gap: 6, fontFamily: "'Share Tech Mono',monospace" }}>
                  <span style={{ color: `${f.color}35`, flexShrink: 0 }}>{log.time}</span>
                  <span style={{ color: log.lvl === "critical" ? "#FF4444" : log.lvl === "warn" ? "#FFD54F" : `${f.color}65` }}>{log.msg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ROOT
══════════════════════════════════════════════════════════════ */
export default function TurningPoint() {
  const [session, setSession] = useState(null);
  return session
    ? <CommandCenter faction={session.faction} username={session.username} onLogout={() => setSession(null)} />
    : <LandingPage onLogin={(faction, username) => setSession({ faction, username })} />;
}