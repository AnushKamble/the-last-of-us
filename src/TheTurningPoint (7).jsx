import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════
   AUDIO ENGINE
═══════════════════════════════════════════════ */
const SFX = (() => {
  let ctx = null;
  const gc = () => { try { if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)(); return ctx; } catch(e){ return null; } };
  const play = (type) => {
    const ac = gc(); if (!ac) return;
    try {
      const now = ac.currentTime;
      if (type === "click") {
        const o = ac.createOscillator(), g = ac.createGain();
        o.connect(g); g.connect(ac.destination);
        o.type = "square"; o.frequency.setValueAtTime(660, now); o.frequency.exponentialRampToValueAtTime(220, now + 0.07);
        g.gain.setValueAtTime(0.18, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        o.start(now); o.stop(now + 0.1);
      } else if (type === "select") {
        [440, 660].forEach((f, i) => {
          const o = ac.createOscillator(), g = ac.createGain();
          o.connect(g); g.connect(ac.destination); const t = now + i * 0.07;
          o.type = "sine"; o.frequency.setValueAtTime(f, t);
          g.gain.setValueAtTime(0.18, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
          o.start(t); o.stop(t + 0.17);
        });
      } else if (type === "confirm") {
        [330, 392, 523, 659].forEach((f, i) => {
          const o = ac.createOscillator(), g = ac.createGain();
          o.connect(g); g.connect(ac.destination); const t = now + i * 0.07;
          o.type = "triangle"; o.frequency.setValueAtTime(f, t);
          g.gain.setValueAtTime(0.2, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
          o.start(t); o.stop(t + 0.22);
        });
      } else if (type === "error") {
        const o = ac.createOscillator(), g = ac.createGain();
        o.connect(g); g.connect(ac.destination);
        o.type = "sawtooth"; o.frequency.setValueAtTime(200, now); o.frequency.exponentialRampToValueAtTime(60, now + 0.25);
        g.gain.setValueAtTime(0.22, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        o.start(now); o.stop(now + 0.28);
      } else if (type === "alert") {
        [880, 660, 880].forEach((f, i) => {
          const o = ac.createOscillator(), g = ac.createGain();
          o.connect(g); g.connect(ac.destination); const t = now + i * 0.12;
          o.type = "square"; o.frequency.setValueAtTime(f, t);
          g.gain.setValueAtTime(0.14, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
          o.start(t); o.stop(t + 0.12);
        });
      } else if (type === "unlock") {
        [330, 392, 494, 659, 880].forEach((f, i) => {
          const o = ac.createOscillator(), g = ac.createGain();
          o.connect(g); g.connect(ac.destination); const t = now + i * 0.065;
          o.type = "sine"; o.frequency.setValueAtTime(f, t);
          g.gain.setValueAtTime(0.2, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
          o.start(t); o.stop(t + 0.2);
        });
      } else if (type === "paper") {
        const buf = ac.createBuffer(1, ac.sampleRate * 0.18, ac.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random()*2-1) * Math.pow(1 - i/d.length, 0.5) * 0.35;
        const src = ac.createBufferSource(), bpf = ac.createBiquadFilter();
        bpf.type = "bandpass"; bpf.frequency.value = 3500; bpf.Q.value = 0.8;
        src.buffer = buf; src.connect(bpf); bpf.connect(ac.destination); src.start(now);
      } else if (type === "hover") {
        const o = ac.createOscillator(), g = ac.createGain();
        o.connect(g); g.connect(ac.destination);
        o.type = "sine"; o.frequency.setValueAtTime(1200, now);
        g.gain.setValueAtTime(0.03, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        o.start(now); o.stop(now + 0.05);
      } else if (type === "mapclick") {
        const o = ac.createOscillator(), g = ac.createGain();
        o.connect(g); g.connect(ac.destination);
        o.type = "sine"; o.frequency.setValueAtTime(800, now); o.frequency.exponentialRampToValueAtTime(400, now + 0.06);
        g.gain.setValueAtTime(0.1, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        o.start(now); o.stop(now + 0.08);
      } else if (type === "threat") {
        [440, 880, 440, 880].forEach((f, i) => {
          const o = ac.createOscillator(), g = ac.createGain();
          o.connect(g); g.connect(ac.destination); const t = now + i * 0.08;
          o.type = "sawtooth"; o.frequency.setValueAtTime(f, t);
          g.gain.setValueAtTime(0.12, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
          o.start(t); o.stop(t + 0.09);
        });
      }
    } catch(e){}
  };
  return { play };
})();

/* ═══════════════════════════════════════════════
   GLOBAL CSS
═══════════════════════════════════════════════ */
const G = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Cinzel:wght@400;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Special+Elite&family=Share+Tech+Mono&family=Oswald:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html,body{background:#060402;font-size:14px;overflow:hidden;}
::-webkit-scrollbar{width:4px;height:4px;}
::-webkit-scrollbar-track{background:#0a0704;}
::-webkit-scrollbar-thumb{background:#3d2a10;border-radius:2px;}
.lp-scroll{height:100vh;overflow-y:auto;overflow-x:hidden;}
.lp-scroll::-webkit-scrollbar{width:3px;}
.lp-scroll::-webkit-scrollbar-thumb{background:#3d2a10;}
@keyframes scanline{0%{transform:translateY(-100%)}100%{transform:translateY(100vh)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes fadeInScale{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}
@keyframes pulseGold{0%,100%{box-shadow:0 0 8px rgba(212,168,83,0.2)}50%{box-shadow:0 0 28px rgba(212,168,83,0.65)}}
@keyframes floatUp{0%{transform:translateY(100vh) rotate(0deg);opacity:0}5%{opacity:1}90%{opacity:0.5}100%{transform:translateY(-12vh) rotate(720deg);opacity:0}}
@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}
@keyframes stampIn{0%{opacity:0;transform:rotate(-12deg) scale(1.7)}60%{transform:rotate(2deg) scale(0.96)}100%{opacity:1;transform:rotate(-8deg) scale(1)}}
@keyframes paperJitter{0%,100%{transform:rotate(-1.5deg)}25%{transform:rotate(-1.1deg) translateX(1px)}75%{transform:rotate(-1.9deg) translateX(-1px)}}
@keyframes infectionPulse{0%{transform:scale(0);opacity:0.8}100%{transform:scale(6);opacity:0}}
@keyframes threatBlink{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.3;transform:scale(1.3)}}
@keyframes threatRing{0%{transform:scale(0.5);opacity:0.9}100%{transform:scale(2.5);opacity:0}}
@keyframes slideRight{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:translateX(0)}}
@keyframes successRing{0%{transform:scale(0.4);opacity:1}100%{transform:scale(2.2);opacity:0}}
@keyframes mapLoad{from{opacity:0;transform:scale(0.97)}to{opacity:1;transform:scale(1)}}
@keyframes routePulse{0%,100%{stroke-opacity:0.8;stroke-width:3}50%{stroke-opacity:0.3;stroke-width:1.5}}
@keyframes factionReveal{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0% 0 0)}}
@keyframes cardEntrance{0%{opacity:0;transform:translateY(40px) scale(0.95)}100%{opacity:1;transform:translateY(0) scale(1)}}
@keyframes glowPulse{0%,100%{filter:drop-shadow(0 0 4px currentColor)}50%{filter:drop-shadow(0 0 16px currentColor)}}
@keyframes breatheBtn{0%,100%{transform:scale(1)}50%{transform:scale(1.015)}}
@keyframes rotateSlow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
`;

/* ═══════════════════════════════════════════════
   FACTION DATA
═══════════════════════════════════════════════ */
const FACTIONS = {
  survivor: {
    id:"survivor", name:"Survivors", color:"#D4A853", accent:"#F0C070",
    bg:"#0f0b05", secondary:"#1d1508", border:"#6B4C1E", tag:"CIVILIAN",
    description:"Navigate the infected world. Find safety. Stay alive.",
    lore:"No allegiance. No army. Just the will to endure.",
    icon:"⚒", glow:"rgba(212,168,83,0.5)",
    headFont:"'Special Elite',cursive", bodyFont:"'Playfair Display',serif", monoFont:"'Share Tech Mono',monospace",
    cardBorder:"#8B6914", mapTint:"rgba(212,168,83,0.07)"
  },
  firefly: {
    id:"firefly", name:"Fireflies", color:"#C8D840", accent:"#E8F060",
    bg:"#070900", secondary:"#0f1200", border:"#3A4000", tag:"REBEL",
    description:"Fight for freedom. Liberate the zones. Find the cure.",
    lore:"When you're lost in the darkness, look for the light.",
    icon:"✦", glow:"rgba(200,216,64,0.5)",
    headFont:"'Oswald',sans-serif", bodyFont:"'Oswald',sans-serif", monoFont:"'Share Tech Mono',monospace",
    cardBorder:"#5A6400", mapTint:"rgba(200,216,64,0.06)"
  },
  fedra: {
    id:"fedra", name:"FEDRA Military", color:"#60C8E8", accent:"#80E0FF",
    bg:"#010810", secondary:"#021020", border:"#0A3050", tag:"MILITARY",
    description:"Maintain order. Secure the QZs. Eliminate threats.",
    lore:"Order is the only thing keeping humanity alive.",
    icon:"◈", glow:"rgba(96,200,232,0.5)",
    headFont:"'Oswald',sans-serif", bodyFont:"'Share Tech Mono',monospace", monoFont:"'Share Tech Mono',monospace",
    cardBorder:"#0A4060", mapTint:"rgba(60,160,220,0.07)"
  }
};

/* ═══════════════════════════════════════════════
   MAP DATA — "NEW ELYSIUM CITY"
═══════════════════════════════════════════════ */
const VMAP_W = 1000, VMAP_H = 780;

// City districts — organic irregular shapes like a real city map (no uniform pentagons)
const DISTRICTS = [
  // Downtown Core — large sprawling central borough
  { id:"d1", name:"Downtown Core", short:"Downtown", cx:490, cy:368,
    poly:"448,298 512,290 558,300 572,328 568,362 554,398 528,422 492,430 458,424 434,402 428,370 432,332",
    infLvl:0.82, ctrl:"infected", type:"urban", pop:42000, fedraBase:false, fireflyBase:false },
  // Harbor District — irregular coastal notch to the north-east
  { id:"d2", name:"Harbor District", short:"Harbor", cx:710, cy:215,
    poly:"648,168 698,158 748,162 778,178 792,210 788,248 762,268 726,272 692,264 664,244 644,216 642,186",
    infLvl:0.28, ctrl:"fedra", type:"port", pop:18000, fedraBase:true, fireflyBase:false },
  // Old Quarter — narrow winding historic district west
  { id:"d3", name:"Old Quarter", short:"Old Qtr", cx:228, cy:430,
    poly:"168,392 218,378 268,382 298,402 306,432 298,462 272,482 232,488 192,482 162,460 158,432 162,408",
    infLvl:0.91, ctrl:"infected", type:"historic", pop:31000, fedraBase:false, fireflyBase:false },
  // Green Zone — large fortified QZ rectangle south-center (FEDRA stronghold)
  { id:"d4", name:"Green Zone", short:"Green Zone", cx:598, cy:554,
    poly:"534,508 624,504 668,514 676,542 674,578 658,608 618,618 568,614 534,598 522,572 524,540",
    infLvl:0.07, ctrl:"fedra", type:"qz", pop:24000, fedraBase:true, fireflyBase:false },
  // University Hill — sloped campus district north-west
  { id:"d5", name:"University Hill", short:"Uni Hill", cx:355, cy:172,
    poly:"298,136 352,124 406,130 432,152 438,180 428,210 402,228 358,232 318,224 292,202 284,174 286,150",
    infLvl:0.50, ctrl:"firefly", type:"campus", pop:15000, fedraBase:false, fireflyBase:true },
  // Industrial Belt — wide sprawling east factory zone
  { id:"d6", name:"Industrial Belt", short:"Industrial", cx:808, cy:428,
    poly:"742,388 810,378 862,386 888,408 892,444 882,474 852,492 802,494 762,484 732,462 724,436 728,404",
    infLvl:0.43, ctrl:"mixed", type:"industrial", pop:22000, fedraBase:false, fireflyBase:false },
  // Northside Suburbs — wide low-density residential spread north
  { id:"d7", name:"Northside Suburbs", short:"Suburbs", cx:292, cy:82,
    poly:"228,52 302,44 362,50 388,68 392,94 378,118 344,132 298,136 256,128 226,108 218,82 220,62",
    infLvl:0.17, ctrl:"survivor", type:"residential", pop:12000, fedraBase:false, fireflyBase:false },
  // Medical Row — narrow elongated west district
  { id:"d8", name:"Medical Row", short:"Med Row", cx:138, cy:292,
    poly:"82,258 138,248 192,254 218,272 224,300 218,328 196,348 144,354 94,346 68,326 62,298 66,272",
    infLvl:0.61, ctrl:"firefly", type:"medical", pop:9000, fedraBase:false, fireflyBase:true },
  // Westgate Markets — commercial district south-west, irregular shape
  { id:"d9", name:"Westgate Markets", short:"Westgate", cx:152, cy:532,
    poly:"88,494 148,484 212,490 242,512 248,542 240,572 218,590 168,596 112,588 78,568 72,540 76,514",
    infLvl:0.74, ctrl:"infected", type:"commercial", pop:17000, fedraBase:false, fireflyBase:false },
  // Chapel District — compact north-east residential
  { id:"d10", name:"Chapel District", short:"Chapel", cx:628, cy:112,
    poly:"578,76 634,68 678,76 702,100 704,128 690,152 656,164 614,160 582,144 566,118 568,92",
    infLvl:0.20, ctrl:"survivor", type:"residential", pop:8000, fedraBase:false, fireflyBase:false },
  // Eastern Slums — sprawling poor district east
  { id:"d11", name:"Eastern Slums", short:"E Slums", cx:862, cy:294,
    poly:"804,254 856,244 912,250 938,272 944,304 936,334 912,352 864,358 818,348 790,322 784,292 790,264",
    infLvl:0.69, ctrl:"infected", type:"slum", pop:27000, fedraBase:false, fireflyBase:false },
  // Power Station — compact industrial south-east
  { id:"d12", name:"Power Station", short:"Power Stn", cx:712, cy:638,
    poly:"662,604 714,596 758,606 778,628 778,658 762,680 720,688 676,682 648,660 646,632",
    infLvl:0.33, ctrl:"fedra", type:"utility", pop:4000, fedraBase:true, fireflyBase:false },
  // Firefly Quarter — organic rebel territory south-center
  { id:"d13", name:"Firefly Quarter", short:"FF Quarter", cx:418, cy:508,
    poly:"362,472 422,462 474,470 494,494 496,526 482,552 452,568 412,566 376,554 354,528 352,500",
    infLvl:0.45, ctrl:"firefly", type:"rebel", pop:11000, fedraBase:false, fireflyBase:true },
  // Collapsed Zone — small ruined rubble zone center
  { id:"d14", name:"Collapsed Zone", short:"Collapsed", cx:544, cy:282,
    poly:"508,250 552,244 590,254 606,278 602,310 580,330 540,332 506,318 490,296 494,266",
    infLvl:0.97, ctrl:"infected", type:"ruins", pop:0, fedraBase:false, fireflyBase:false },
  // Border Checkpoint — fortified military post south-east
  { id:"d15", name:"Border Checkpoint", short:"Checkpoint", cx:888, cy:568,
    poly:"848,538 900,530 942,542 956,566 952,598 930,616 888,618 852,606 832,584 836,556",
    infLvl:0.11, ctrl:"fedra", type:"military", pop:2000, fedraBase:true, fireflyBase:false },
  // Airport — large elongated shape south-west
  { id:"d16", name:"International Airport", short:"Airport", cx:338, cy:658,
    poly:"238,622 342,612 434,618 462,642 464,674 446,704 392,716 318,718 258,706 224,680 222,650",
    infLvl:0.22, ctrl:"fedra", type:"airport", pop:6000, fedraBase:true, fireflyBase:false },
  // Docklands — elongated south coastal strip
  { id:"d17", name:"Docklands", short:"Docklands", cx:592, cy:688,
    poly:"532,658 608,650 658,660 672,686 666,716 638,730 580,732 534,718 516,694 518,668",
    infLvl:0.38, ctrl:"mixed", type:"port", pop:8000, fedraBase:false, fireflyBase:false },
];

// Road network segments [x1,y1,x2,y2]
const ROAD_NETWORK = [
  // Main arteries
  [490,370, 700,220], [490,370, 240,430], [490,370, 590,560],
  [490,370, 360,175], [490,370, 800,430], [490,370, 145,295],
  [490,370, 545,285], [490,370, 420,510],
  // Secondary
  [700,220, 620,115], [700,220, 860,295], [700,220, 800,430],
  [590,560, 800,430], [590,560, 710,640], [590,560, 885,570], [590,560, 590,690],
  [360,175, 300,85], [360,175, 145,295], [360,175, 240,430],
  [240,430, 160,530], [240,430, 420,510], [145,295, 160,530],
  [420,510, 590,560], [420,510, 340,660],
  [860,295, 800,430], [590,690, 340,660], [800,430, 885,570],
];

// Arcade points placed on the map
const ARCADE_PTS = [
  { id:"ap1", cx:490, cy:370, name:"AP-077: City Hall", status:"active", faction:"public" },
  { id:"ap2", cx:700, cy:220, name:"AP-023: Harbor Gate", status:"active", faction:"fedra" },
  { id:"ap3", cx:360, cy:175, name:"AP-091: Uni Campus", status:"damaged", faction:"firefly" },
  { id:"ap4", cx:590, cy:560, name:"AP-034: Green HQ", status:"active", faction:"fedra" },
  { id:"ap5", cx:160, cy:530, name:"AP-055: Old Market", status:"offline", faction:"public" },
  { id:"ap6", cx:800, cy:430, name:"AP-012: Warehouse", status:"active", faction:"public" },
  { id:"ap7", cx:300, cy:85,  name:"AP-108: North Gate", status:"active", faction:"survivor" },
  { id:"ap8", cx:145, cy:295, name:"AP-067: Med Center", status:"active", faction:"firefly" },
];

const QZ_RECTS = [
  { id:"qz1", x:525,y:505, w:140,h:115, name:"QZ-Alpha" },
  { id:"qz2", x:625,y:160, w:150,h:120, name:"QZ-Bravo" },
  { id:"qz3", x:225,y:610, w:230,h:105, name:"QZ-Charlie" },
];

// Patrol routes (faction-specific path segments)
const FEDRA_ROUTES = [[700,220,590,560],[590,560,885,570],[590,560,710,640],[700,220,800,430]];
const FIREFLY_ROUTES = [[360,175,145,295],[145,295,420,510],[420,510,360,175]];
const SURVIVOR_ROUTES = [[300,85,490,370],[490,370,590,560]];

function genHistory(base){ return Array.from({length:7},(_,i)=>({ day:`D${i+1}`, value: Math.max(0.05,Math.min(0.99, base+(Math.random()-0.48)*0.28-(6-i)*0.014)) })); }
function genResources(id){ const s=id.charCodeAt(1); return [{label:"Ammo",value:20+(s*7)%30,color:"#FF6B35"},{label:"Medical",value:15+(s*11)%25,color:"#60C8E8"},{label:"Food",value:10+(s*5)%20,color:"#81C784"},{label:"Crafting",value:5+(s*3)%15,color:"#FFD54F"},{label:"Misc",value:5+(s*9)%10,color:"#CE93D8"}]; }

/* ═══════════════════════════════════════════════
   UTILITIES
═══════════════════════════════════════════════ */
function SporeField({ count=20, color="rgba(190,140,50,0.5)" }) {
  const pts = useRef(Array.from({length:count},(_,i)=>({ left:Math.random()*100, delay:Math.random()*15, dur:10+Math.random()*14, size:1+Math.random()*2.5, id:i }))).current;
  return <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none",zIndex:2}}>
    {pts.map(p=><div key={p.id} style={{position:"absolute",bottom:-10,left:`${p.left}%`,width:p.size,height:p.size,borderRadius:"50%",background:color,animation:`floatUp ${p.dur}s ${p.delay}s ease-in infinite`}}/>)}
  </div>;
}
function ScrollReveal({ children, delay=0 }) {
  const ref=useRef(); const [v,setV]=useState(false);
  useEffect(()=>{ const o=new IntersectionObserver(([e])=>{if(e.isIntersecting)setV(true)},{threshold:0.1}); if(ref.current)o.observe(ref.current); return()=>o.disconnect(); },[]);
  return <div ref={ref} style={{opacity:v?1:0,transform:v?"translateY(0)":"translateY(32px)",transition:`opacity 0.85s ease ${delay}ms, transform 0.85s ease ${delay}ms`}}>{children}</div>;
}

/* ═══════════════════════════════════════════════
   GTA5-STYLE TACTICAL MAP
═══════════════════════════════════════════════ */
function TacticalMap({ faction, listenMode }) {
  const svgRef = useRef();
  const containerRef = useRef();
  const [pan, setPan] = useState({x:0,y:0});
  const [zoom, setZoom] = useState(1);
  const [isDrag, setIsDrag] = useState(false);
  const [dragOrig, setDragOrig] = useState(null);
  const [tooltip, setTooltip] = useState(null);
  const [tipPos, setTipPos] = useState({x:0,y:0});
  const [liveInf, setLiveInf] = useState(()=>Object.fromEntries(DISTRICTS.map(d=>[d.id,d.infLvl])));
  const [ripples, setRipples] = useState([]);
  // Layer toggles — null means ALL on. When a layer key is set, ONLY that layer is shown
  const [activeLayer, setActiveLayer] = useState(null); // null = all shown
  const [threats, setThreats] = useState([]);
  const threatTimer = useRef(null);
  const firstThreat = useRef(false);

  const f = FACTIONS[faction];
  // STRICT ROLE RULES:
  // survivor  → public/global only. NO fedraBase, NO fireflyBase, NO faction APs
  // firefly   → global + fireflyBase zones + firefly APs. NO fedraBase
  // fedra     → everything: fedraBase + fireflyBase + all APs
  const canFF = faction==="firefly" || faction==="fedra";
  const canFD = faction==="fedra";

  const districtVisible = (d) => {
    if (d.fedraBase   && !canFD) return false; // survivors & fireflies can't see FEDRA bases
    if (d.fireflyBase && !canFF) return false; // survivors can't see Firefly bases
    return true;
  };
  const apVisible = (ap) => {
    if (ap.faction === "fedra"   && !canFD) return false;
    if (ap.faction === "firefly" && !canFF) return false;
    if (ap.faction === "survivor" && faction === "fedra") return true; // fedra sees all
    return true;
  };

  // Derived layer visibility
  const showAP  = activeLayer===null || activeLayer==="AP";
  const showQZ  = activeLayer===null || activeLayer==="QZ";
  const showINF = activeLayer===null || activeLayer==="INF";

  // Infection simulation every 2s
  useEffect(()=>{
    const iv = setInterval(()=>{
      setLiveInf(prev=>{
        const next={...prev};
        DISTRICTS.forEach(d=>{ next[d.id]=Math.max(0.03,Math.min(0.99,prev[d.id]+(Math.random()-0.47)*0.009)); });
        return next;
      });
      if(Math.random()<0.35){
        const d=DISTRICTS[Math.floor(Math.random()*DISTRICTS.length)];
        const id=Date.now();
        setRipples(r=>[...r.slice(-10),{id,cx:d.cx+(Math.random()-0.5)*50,cy:d.cy+(Math.random()-0.5)*50}]);
        setTimeout(()=>setRipples(r=>r.filter(x=>x.id!==id)),2200);
      }
    },2000);
    return ()=>clearInterval(iv);
  },[]);

  // Listen mode threat spawner — first at 60s, then every 8–22s
  useEffect(()=>{
    if(!listenMode){ clearTimeout(threatTimer.current); firstThreat.current=false; setThreats([]); return; }
    const spawnThreat=()=>{
      const pool=DISTRICTS.filter(x=>(liveInf[x.id]||x.infLvl)>0.35);
      const d=pool[Math.floor(Math.random()*pool.length)];
      if(!d)return;
      const id=Date.now();
      SFX.play("threat");
      setThreats(t=>[...t.slice(-4),{id,cx:d.cx+(Math.random()-0.5)*38,cy:d.cy+(Math.random()-0.5)*38,name:d.name,inf:liveInf[d.id]||d.infLvl}]);
    };
    const scheduleNext=()=>{ threatTimer.current=setTimeout(()=>{ spawnThreat(); scheduleNext(); }, 8000+Math.random()*14000); };
    threatTimer.current=setTimeout(()=>{ spawnThreat(); firstThreat.current=true; scheduleNext(); }, 60000);
    return ()=>clearTimeout(threatTimer.current);
  },[listenMode]);

  const ackThreat=(id)=>{ SFX.play("click"); setThreats(t=>t.filter(x=>x.id!==id)); };

  const toggleLayer=k=>{
    SFX.play("click");
    setActiveLayer(prev=> prev===k ? null : k);
  };

  // Wheel zoom — scale from center of visible area
  const onWheel=useCallback((e)=>{
    e.preventDefault();
    const factor=e.deltaY<0?1.13:0.89;
    setZoom(z=>Math.max(0.3,Math.min(5,z*factor)));
  },[]);
  useEffect(()=>{
    const el=containerRef.current; if(!el)return;
    el.addEventListener("wheel",onWheel,{passive:false});
    return()=>el.removeEventListener("wheel",onWheel);
  },[onWheel]);

  const onMouseDown=e=>{ if(e.button!==0)return; setIsDrag(true); setDragOrig({mx:e.clientX,my:e.clientY,px:pan.x,py:pan.y}); };
  const onMouseMove=useCallback(e=>{ if(!isDrag||!dragOrig)return; setPan({x:dragOrig.px+(e.clientX-dragOrig.mx),y:dragOrig.py+(e.clientY-dragOrig.my)}); },[isDrag,dragOrig]);
  const onMouseUp=()=>{ setIsDrag(false); setDragOrig(null); };

  const distColor=(ctrl,inf)=>{
    if(ctrl==="fedra") return `rgba(20,90,180,${0.55+inf*0.1})`;
    if(ctrl==="firefly") return `rgba(100,130,10,${0.5+inf*0.12})`;
    if(ctrl==="survivor") return `rgba(160,120,40,${0.5})`;
    if(inf>0.8) return `rgba(220,10,10,${0.72})`;
    if(inf>0.55) return `rgba(200,65,10,${0.65})`;
    if(inf>0.35) return `rgba(200,130,10,${0.55})`;
    return `rgba(50,140,50,${0.45})`;
  };
  const distStroke=(ctrl,inf)=>{
    if(ctrl==="fedra") return "#2880E0";
    if(ctrl==="firefly") return "#90C010";
    if(ctrl==="survivor") return "#C89040";
    if(inf>0.75) return "#EE1010";
    if(inf>0.45) return "#E07010";
    return "#50B050";
  };

  const showRoutes = faction==="fedra"?FEDRA_ROUTES : faction==="firefly"?FIREFLY_ROUTES : SURVIVOR_ROUTES;

  // Layer button config
  const LAYER_BTNS = [
    {k:"AP", label:"AP", color:"#60D8F8", desc:"ARCADE PTS"},
    {k:"QZ", label:"QZ", color:"#2880E0", desc:"QUARANTINE"},
    {k:"INF",label:"INF",color:"#FF3333", desc:"HEATMAP"},
  ];

  return (
    <div ref={containerRef} style={{position:"relative",width:"100%",height:"100%",background:"#0b1208",overflow:"hidden",cursor:isDrag?"grabbing":"grab"}}
      onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
      <style>{`
        .map-district:hover polygon { stroke-width:2px !important; filter:url(#distGlow) !important; }
        .map-district:hover text { fill:rgba(255,255,255,0.98) !important; }
        .ap-marker:hover rect { stroke-width:2.5px !important; }
        @keyframes apPing { 0%{r:8;opacity:0.7} 100%{r:28;opacity:0} }
      `}</style>

      {/* ── LAYER TOGGLE BUTTONS ── */}
      <div style={{position:"absolute",top:8,left:8,zIndex:25,display:"flex",gap:5}}>
        {LAYER_BTNS.map(({k,label,color,desc})=>{
          const isActive = activeLayer===k;
          const isDimmed = activeLayer!==null && !isActive;
          return (
            <button key={k} onClick={()=>toggleLayer(k)}
              title={desc}
              style={{
                padding:"4px 11px 4px 9px",
                background: isActive ? `${color}22` : "rgba(4,6,3,0.88)",
                border: `1px solid ${isActive ? color : isDimmed ? `${color}25` : `${color}55`}`,
                color: isActive ? color : isDimmed ? `${color}30` : `${color}70`,
                fontSize:9, letterSpacing:2, cursor:"pointer",
                fontFamily:"'Share Tech Mono',monospace",
                transition:"all 0.18s",
                boxShadow: isActive ? `0 0 12px ${color}50, inset 0 0 10px ${color}14` : "none",
                opacity: isDimmed ? 0.4 : 1,
                position:"relative",
              }}
              onMouseEnter={e=>{if(!isDimmed)e.currentTarget.style.opacity="1"; SFX.play("hover");}}
              onMouseLeave={e=>{e.currentTarget.style.opacity = isDimmed?"0.4":"1";}}
            >
              {isActive && <span style={{position:"absolute",top:3,right:3,width:4,height:4,borderRadius:"50%",background:color,boxShadow:`0 0 6px ${color}`,display:"block"}}/>}
              {label}
            </button>
          );
        })}
      </div>

      {/* ── ZOOM CONTROLS TOP-RIGHT ── */}
      <div style={{position:"absolute",top:8,right:8,zIndex:25,display:"flex",flexDirection:"column",gap:3}}>
        {[{lbl:"+",fn:()=>{SFX.play("mapclick");setZoom(z=>Math.min(5,z*1.3));}},
          {lbl:"−",fn:()=>{SFX.play("mapclick");setZoom(z=>Math.max(0.3,z*0.77));}},
          {lbl:"⌂",fn:()=>{SFX.play("mapclick");setZoom(1);setPan({x:0,y:0});}}
        ].map(b=>(
          <button key={b.lbl} onClick={b.fn}
            style={{width:30,height:30,background:"rgba(4,6,3,0.9)",border:`1px solid ${f.border}`,color:f.color,
              fontSize:b.lbl==="⌂"?13:18,cursor:"pointer",fontFamily:"'Share Tech Mono',monospace",
              display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s"}}
            onMouseEnter={e=>{e.currentTarget.style.background=`${f.color}22`;e.currentTarget.style.borderColor=f.color;SFX.play("hover");}}
            onMouseLeave={e=>{e.currentTarget.style.background="rgba(4,6,3,0.9)";e.currentTarget.style.borderColor=f.border;}}
          >{b.lbl}</button>
        ))}
      </div>

      {/* ── ZOOM LEVEL HINT ── */}
      <div style={{position:"absolute",bottom:32,right:8,fontSize:8,color:`${f.color}45`,fontFamily:"'Share Tech Mono',monospace",zIndex:10,pointerEvents:"none"}}>
        {Math.round(zoom*100)}% · SCROLL · DRAG
      </div>

      {/* ── THREAT PANEL (bottom-left) — only when listen mode active ── */}
      {listenMode && threats.length>0 && (
        <>
          {/* Dark overlay dims map so threats pop */}
          <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.44)",zIndex:18,pointerEvents:"none"}}/>
          <div style={{position:"absolute",bottom:36,left:8,zIndex:35,display:"flex",flexDirection:"column",gap:5,maxWidth:240}}>
            {threats.map(t=>(
              <div key={t.id} style={{
                background:"rgba(10,0,0,0.97)",border:"1px solid #FF2222",borderLeft:"3px solid #FF0000",
                padding:"8px 10px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,
                animation:"slideRight 0.3s ease",boxShadow:"0 0 20px rgba(255,20,20,0.38), 0 4px 16px rgba(0,0,0,0.9)"
              }}>
                <div>
                  <div style={{fontSize:8,color:"#FF5555",fontFamily:"'Share Tech Mono',monospace",letterSpacing:2,marginBottom:2,animation:"routePulse 0.9s infinite"}}>⚠ THREAT DETECTED</div>
                  <div style={{fontSize:11,color:"#FFB0B0",fontFamily:"'Share Tech Mono',monospace",fontWeight:"bold",marginBottom:2}}>{t.name}</div>
                  <div style={{fontSize:8,color:"rgba(255,100,100,0.55)",fontFamily:"'Share Tech Mono',monospace"}}>INF {Math.round((t.inf||0)*100)}% · HOSTILE MOVEMENT</div>
                </div>
                <button onClick={()=>ackThreat(t.id)} style={{
                  padding:"5px 10px",background:"rgba(255,30,30,0.15)",border:"1px solid #FF3333",
                  color:"#FF8888",fontSize:8,cursor:"pointer",fontFamily:"'Share Tech Mono',monospace",
                  letterSpacing:1,flexShrink:0,transition:"all 0.15s"
                }}
                  onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,30,30,0.35)";e.currentTarget.style.color="#FFC0C0";SFX.play("hover");}}
                  onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,30,30,0.15)";e.currentTarget.style.color="#FF8888";}}>
                  ACK
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── SVG MAP — fills container with preserveAspectRatio=none so no blank space ── */}
      <svg ref={svgRef} width="100%" height="100%"
        viewBox={`0 0 ${VMAP_W} ${VMAP_H}`}
        preserveAspectRatio="xMidYMid slice"
        style={{display:"block",animation:"mapLoad 0.5s ease",position:"absolute",inset:0}}>
        <defs>
          <filter id="distGlow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="threatGlow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="heatGlow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="18"/></filter>

          {/* Fine street grid */}
          <pattern id="finegrid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M10 0L0 0 0 10" fill="none" stroke="rgba(255,255,255,0.013)" strokeWidth="0.3"/>
          </pattern>
          {/* City block grid */}
          <pattern id="cityGrid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M30 0L0 0 0 30" fill="none" stroke="rgba(255,255,255,0.024)" strokeWidth="0.5"/>
          </pattern>
          {/* Dense urban block pattern */}
          <pattern id="urbanBlocks" width="28" height="26" patternUnits="userSpaceOnUse">
            <rect width="28" height="26" fill="none"/>
            <rect x="2" y="2" width="11" height="9" fill="rgba(30,40,22,0.3)" rx="0.5"/>
            <rect x="15" y="2" width="11" height="9" fill="rgba(30,40,22,0.25)" rx="0.5"/>
            <rect x="2" y="14" width="7" height="8" fill="rgba(30,40,22,0.2)" rx="0.5"/>
            <rect x="11" y="14" width="15" height="8" fill="rgba(30,40,22,0.28)" rx="0.5"/>
          </pattern>

          <radialGradient id="cityVig" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="transparent"/>
            <stop offset="100%" stopColor="rgba(4,6,3,0.8)"/>
          </radialGradient>
          <radialGradient id="outerFade" cx="50%" cy="50%" r="50%">
            <stop offset="60%" stopColor="transparent"/>
            <stop offset="100%" stopColor="rgba(2,4,2,0.92)"/>
          </radialGradient>
        </defs>

        <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}
           style={{transformOrigin:`${VMAP_W/2}px ${VMAP_H/2}px`}}>

          {/* ═══ TERRAIN LAYER 0 — countryside base ═══ */}
          {/* Far outer dark countryside */}
          <rect x="-9000" y="-9000" width={VMAP_W+18000} height={VMAP_H+18000} fill="#0b1208"/>
          {/* Main map canvas */}
          <rect width={VMAP_W} height={VMAP_H} fill="#141d0e"/>
          {/* Fine grid overlay */}
          <rect width={VMAP_W} height={VMAP_H} fill="url(#finegrid)"/>

          {/* ═══ TERRAIN LAYER 1 — city density ═══ */}
          {/* Dense city center radial fill */}
          <radialGradient id="cityDensity" cx="50%" cy="49%" r="45%">
            <stop offset="0%" stopColor="rgba(22,30,15,0.9)"/>
            <stop offset="60%" stopColor="rgba(18,24,12,0.6)"/>
            <stop offset="100%" stopColor="transparent"/>
          </radialGradient>
          <rect width={VMAP_W} height={VMAP_H} fill="url(#cityDensity)"/>
          {/* City block pattern in dense center area */}
          <ellipse cx={500} cy={395} rx={380} ry={305} fill="url(#urbanBlocks)"/>
          <rect width={VMAP_W} height={VMAP_H} fill="url(#cityGrid)"/>

          {/* Outer countryside gradient (darker edges) */}
          <ellipse cx={500} cy={390} rx={492} ry={392} fill="none" stroke="rgba(8,12,6,0.7)" strokeWidth="80"/>

          {/* ═══ TERRAIN LAYER 2 — water bodies ═══ */}
          {/* North-east ocean */}
          <path d="M790,0 Q860,40 920,120 Q965,200 975,280 Q985,340 970,380 L1000,360 L1000,0 Z" fill="rgba(6,18,42,0.95)"/>
          <path d="M790,0 Q860,40 920,120 Q965,200 975,280" stroke="rgba(15,45,110,0.45)" strokeWidth="2.5" fill="none"/>
          <path d="M830,0 Q895,55 940,145 Q975,225 968,295" stroke="rgba(20,55,130,0.25)" strokeWidth="1.5" fill="none"/>
          <path d="M870,0 Q920,70 948,165 Q975,245 960,305" stroke="rgba(25,65,145,0.15)" strokeWidth="1" fill="none"/>
          {/* Wave texture */}
          {[[855,62],[900,110],[930,165],[945,215],[940,265]].map(([wx,wy],i)=>(
            <path key={i} d={`M${wx-15},${wy} Q${wx},${wy-6} ${wx+15},${wy}`} fill="none" stroke="rgba(30,70,160,0.22)" strokeWidth="1"/>
          ))}
          <text x={918} y={95} fill="rgba(35,75,155,0.38)" fontSize="9" fontFamily="'Share Tech Mono',monospace" transform="rotate(-22,918,95)" letterSpacing="2">ELYSIAN SEA</text>

          {/* River cutting through city */}
          <path d="M 385,0 Q 405,95 395,172 Q 378,218 352,258 Q 332,298 342,358 Q 352,418 322,478 Q 292,538 302,618 Q 312,678 282,780" fill="none" stroke="rgba(10,32,78,0.85)" strokeWidth="16"/>
          <path d="M 385,0 Q 405,95 395,172 Q 378,218 352,258 Q 332,298 342,358 Q 352,418 322,478 Q 292,538 302,618 Q 312,678 282,780" fill="none" stroke="rgba(15,45,108,0.55)" strokeWidth="10"/>
          <path d="M 385,0 Q 405,95 395,172 Q 378,218 352,258 Q 332,298 342,358 Q 352,418 322,478 Q 292,538 302,618 Q 312,678 282,780" fill="none" stroke="rgba(22,60,140,0.2)" strokeWidth="5"/>

          {/* ═══ TERRAIN LAYER 3 — parks & green blobs ═══ */}
          {[
            [410,148,42,26,0.6],[622,418,32,20,0.55],[182,382,26,18,0.5],
            [722,528,28,18,0.52],[462,618,35,20,0.58],[545,185,20,13,0.45],[280,265,18,12,0.4]
          ].map(([cx,cy,rx,ry,op],i)=>(
            <g key={i}>
              <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`rgba(20,48,14,${op})`}/>
              <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke="rgba(30,65,18,0.4)" strokeWidth="0.8"/>
              {/* Park texture dots */}
              {[0,1,2].map(j=><circle key={j} cx={cx+(j-1)*rx*0.4} cy={cy+(j%2===0?-1:1)*ry*0.3} r={1.5} fill={`rgba(25,58,16,0.6)`}/>)}
            </g>
          ))}

          {/* ═══ TERRAIN LAYER 4 — roads (3-tier) ═══ */}
          {/* Tier 1: wide tarmac base */}
          {ROAD_NETWORK.map(([x1,y1,x2,y2],i)=>(
            <line key={`r1${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(44,50,34,0.95)" strokeWidth="9" strokeLinecap="round"/>
          ))}
          {/* Tier 2: mid lane */}
          {ROAD_NETWORK.map(([x1,y1,x2,y2],i)=>(
            <line key={`r2${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(90,98,62,0.5)" strokeWidth="5" strokeLinecap="round"/>
          ))}
          {/* Tier 3: center dashes */}
          {ROAD_NETWORK.map(([x1,y1,x2,y2],i)=>(
            <line key={`r3${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(175,168,118,0.1)" strokeWidth="1.2" strokeDasharray="7,11"/>
          ))}

          {/* ═══ FACTION PATROL ROUTES ═══ */}
          {showRoutes.map(([x1,y1,x2,y2],i)=>(
            <g key={`route${i}`}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={f.color} strokeWidth="2.5" opacity="0.22" strokeDasharray="12,8" style={{animation:"routePulse 2.5s ease-in-out infinite"}}/>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={f.color} strokeWidth="1" opacity="0.55" strokeDasharray="4,16"/>
            </g>
          ))}

          {/* ═══ INF HEATMAP LAYER (visible when all layers on OR INF selected) ═══ */}
          {showINF && DISTRICTS.map(d=>{
            const inf=liveInf[d.id]||d.infLvl;
            if(inf<0.12) return null; // show for any zone 12%+ infection
            const r=inf>0.7?80:inf>0.5?65:50;
            const red=inf>0.7?230:inf>0.5?210:185;
            const grn=inf>0.7?8:inf>0.5?40:95;
            return (
              <g key={`heat${d.id}`}>
                {/* Outer soft glow */}
                <ellipse cx={d.cx} cy={d.cy} rx={r*1.6} ry={r*1.2}
                  fill={`rgba(${red},${grn},8,${(inf-0.1)*0.32})`} filter="url(#heatGlow)" style={{pointerEvents:"none"}}/>
                {/* Inner hot core */}
                <ellipse cx={d.cx} cy={d.cy} rx={r} ry={r*0.75}
                  fill={`rgba(${red},${grn},8,${(inf-0.1)*0.44})`} filter="url(#softGlow)" style={{pointerEvents:"none"}}/>
              </g>
            );
          })}

          {/* ═══ DISTRICT POLYGONS — role-filtered, no deco rings ═══ */}
          {DISTRICTS.map(d=>{
            if (!districtVisible(d)) return null;
            const inf=liveInf[d.id]||d.infLvl;
            const fill=distColor(d.ctrl,inf);
            const stroke=distStroke(d.ctrl,inf);
            const isListenDanger=listenMode && inf>0.5;
            // Dim polygons slightly in INF-only mode so heatmap dominates
            const distOpacity = activeLayer==="INF" ? 0.3 : (listenMode&&!isListenDanger?0.35:1);
            return (
              <g key={d.id} className="map-district" style={{cursor:"pointer"}}
                onMouseEnter={(e)=>{
                  SFX.play("hover");
                  setTooltip({...d,currentInf:inf});
                  const rect=svgRef.current.getBoundingClientRect();
                  setTipPos({x:e.clientX-rect.left,y:e.clientY-rect.top});
                }}
                onMouseLeave={()=>setTooltip(null)}
                onClick={()=>SFX.play("mapclick")}
              >
                {/* Clean polygon fill — NO outer deco rings */}
                <polygon points={d.poly} fill={fill} stroke={stroke} strokeWidth={isListenDanger?2:0.8}
                  opacity={distOpacity}
                  style={{transition:"fill 1.8s ease, opacity 0.4s ease", filter:isListenDanger?"url(#distGlow)":"none"}}/>
                {/* Animated danger ring ONLY for very high infection */}
                {inf>0.72 && !listenMode && <polygon points={d.poly} fill="none"
                  stroke={`rgba(220,10,10,${(inf-0.7)*0.9})`} strokeWidth="1.5"
                  style={{animation:"routePulse 2s ease-in-out infinite"}}/>}
                {/* District name — large enough to read at a glance */}
                <text x={d.cx} y={d.cy-4} textAnchor="middle"
                  fill="rgba(255,252,235,0.97)" fontSize={11} fontWeight="700"
                  fontFamily="'Share Tech Mono',monospace"
                  style={{pointerEvents:"none",textShadow:"0 0 10px rgba(0,0,0,1),0 0 4px rgba(0,0,0,1)"}}>{d.short}</text>
                <text x={d.cx} y={d.cy+11} textAnchor="middle" fill={stroke} fontSize={9.5} fontWeight="600"
                  fontFamily="'Share Tech Mono',monospace"
                  style={{pointerEvents:"none",textShadow:"0 0 8px rgba(0,0,0,1)"}}>
                  {Math.round(inf*100)}%
                </text>
              </g>
            );
          })}

          {/* ═══ SPREAD RIPPLES ═══ */}
          {ripples.map(r=>(
            <circle key={r.id} cx={r.cx} cy={r.cy} r={3} fill="none" stroke="rgba(220,30,30,0.75)" strokeWidth="1.5"
              style={{animation:"infectionPulse 2s ease-out forwards", transformOrigin:`${r.cx}px ${r.cy}px`, transformBox:"fill-box"}}/>
          ))}

          {/* ═══ QZ OVERLAYS (wall-enclosed boxes) ═══ */}
          {showQZ && QZ_RECTS.map(qz=>(
            <g key={qz.id}>
              {/* Outer glow wall */}
              <rect x={qz.x-3} y={qz.y-3} width={qz.w+6} height={qz.h+6}
                fill="none" stroke="rgba(40,120,240,0.18)" strokeWidth="8"/>
              {/* Main QZ border — thick dashed "wall" */}
              <rect x={qz.x} y={qz.y} width={qz.w} height={qz.h}
                fill="rgba(15,80,180,0.08)" stroke="rgba(50,150,250,0.65)"
                strokeWidth="2" strokeDasharray="10,5"/>
              {/* Corner markers */}
              {[[qz.x,qz.y],[qz.x+qz.w,qz.y],[qz.x,qz.y+qz.h],[qz.x+qz.w,qz.y+qz.h]].map(([cx,cy],i)=>(
                <g key={i}>
                  <line x1={cx-(i%2===0?0:-6)} y1={cy} x2={cx+(i%2===0?6:0)} y2={cy} stroke="rgba(60,160,255,0.8)" strokeWidth="2"/>
                  <line x1={cx} y1={cy-(i<2?0:-6)} x2={cx} y2={cy+(i<2?6:0)} stroke="rgba(60,160,255,0.8)" strokeWidth="2"/>
                </g>
              ))}
              {/* Shield icon + label */}
              <text x={qz.x+qz.w/2} y={qz.y+qz.h/2-6} textAnchor="middle" fill="rgba(60,160,240,0.75)"
                fontSize="14" fontFamily="'Share Tech Mono',monospace">⬡</text>
              <text x={qz.x+qz.w/2} y={qz.y+qz.h/2+9} textAnchor="middle" fill="rgba(60,160,240,0.7)"
                fontSize="9" fontFamily="'Share Tech Mono',monospace" letterSpacing="1">{qz.name}</text>
              <text x={qz.x+qz.w/2} y={qz.y+qz.h/2+20} textAnchor="middle" fill="rgba(60,160,240,0.45)"
                fontSize="7" fontFamily="'Share Tech Mono',monospace" letterSpacing="2">SECURED ZONE</text>
            </g>
          ))}

          {/* ═══ LISTEN MODE THREAT MARKERS ═══ */}
          {listenMode && threats.map(t=>(
            <g key={`tm${t.id}`}>
              {/* Expanding danger ring */}
              <circle cx={t.cx} cy={t.cy} r={32} fill="none" stroke="rgba(255,30,30,0.5)" strokeWidth="1.2"
                style={{animation:"threatRing 1.4s ease-out infinite", transformOrigin:`${t.cx}px ${t.cy}px`, transformBox:"fill-box"}}/>
              <circle cx={t.cx} cy={t.cy} r={22} fill="none" stroke="rgba(255,30,30,0.3)" strokeWidth="0.8"
                style={{animation:"threatRing 1.4s ease-out 0.5s infinite", transformOrigin:`${t.cx}px ${t.cy}px`, transformBox:"fill-box"}}/>
              {/* Core blink */}
              <circle cx={t.cx} cy={t.cy} r={16} fill="rgba(220,0,0,0.15)" stroke="rgba(255,40,40,0.95)"
                strokeWidth="2.5" style={{animation:"threatBlink 0.55s ease-in-out infinite",filter:"url(#threatGlow)"}}/>
              <text x={t.cx} y={t.cy+5} textAnchor="middle" fill="#FF3333" fontSize="13"
                fontFamily="'Share Tech Mono',monospace" fontWeight="bold"
                style={{animation:"threatBlink 0.55s ease-in-out infinite",pointerEvents:"none"}}>!</text>
            </g>
          ))}

          {/* ═══ FIREFLY BASE MARKERS — visible to firefly/fedra only ═══ */}
          {canFF && DISTRICTS.filter(d=>d.fireflyBase).map(d=>(
            <g key={`ffbase${d.id}`} style={{cursor:"pointer"}}
              onMouseEnter={(e)=>{
                SFX.play("hover");
                setTooltip({name:`FF BASE: ${d.name}`, isAP:true, status:"active", faction:"firefly"});
                const rect=svgRef.current.getBoundingClientRect();
                setTipPos({x:e.clientX-rect.left,y:e.clientY-rect.top});
              }}
              onMouseLeave={()=>setTooltip(null)}>
              {/* Base glow ring */}
              <circle cx={d.cx} cy={d.cy} r={22} fill="none" stroke="rgba(200,216,64,0.18)" strokeWidth="8" filter="url(#softGlow)"/>
              <circle cx={d.cx} cy={d.cy} r={16} fill="rgba(200,216,64,0.08)" stroke="rgba(200,216,64,0.55)" strokeWidth="1.5" strokeDasharray="4,3" style={{animation:"routePulse 2s ease-in-out infinite"}}/>
              {/* FF symbol */}
              <text x={d.cx} y={d.cy+5} textAnchor="middle" fill="rgba(200,216,64,0.85)" fontSize="14"
                fontFamily="'Share Tech Mono',monospace" style={{filter:"url(#softGlow)"}}>✦</text>
              <text x={d.cx} y={d.cy+20} textAnchor="middle" fill="rgba(200,216,64,0.5)"
                fontSize="6" fontFamily="'Share Tech Mono',monospace" letterSpacing="1">FF-BASE</text>
            </g>
          ))}

          {/* ═══ ARCADE POINT MARKERS ═══ */}
          {showAP && ARCADE_PTS.filter(ap => apVisible(ap)).map(ap=>{
            const ac=ap.status==="active"?"#60D8F8":ap.status==="damaged"?"#FFD54F":"#888";
            return (
              <g key={ap.id} className="ap-marker" style={{cursor:"pointer"}}
                onMouseEnter={(e)=>{
                  SFX.play("hover");
                  setTooltip({name:ap.name,status:ap.status,faction:ap.faction,isAP:true});
                  const rect=svgRef.current.getBoundingClientRect();
                  setTipPos({x:e.clientX-rect.left,y:e.clientY-rect.top});
                }}
                onMouseLeave={()=>setTooltip(null)}
                onClick={()=>SFX.play("mapclick")}>
                {/* Ping ring for active */}
                {ap.status==="active" && <>
                  <circle cx={ap.cx} cy={ap.cy} r={8} fill="none" stroke={ac} strokeWidth="1">
                    <animate attributeName="r" values="8;26;8" dur="2.8s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.5;0;0.5" dur="2.8s" repeatCount="indefinite"/>
                  </circle>
                </>}
                {/* Diamond body */}
                <rect x={ap.cx-7} y={ap.cy-7} width={14} height={14}
                  fill={`${ac}22`} stroke={ac} strokeWidth="1.8"
                  transform={`rotate(45 ${ap.cx} ${ap.cy})`} style={{filter:"url(#softGlow)"}}/>
                {/* Center dot */}
                <circle cx={ap.cx} cy={ap.cy} r={2} fill={ac} opacity="0.9"/>
                {/* Status label below */}
                <text x={ap.cx} y={ap.cy+20} textAnchor="middle" fill={ac}
                  fontSize="6.5" fontFamily="'Share Tech Mono',monospace" opacity="0.75" letterSpacing="1">
                  {ap.id.toUpperCase()}
                </text>
              </g>
            );
          })}

          {/* ═══ LISTEN MODE OVERLAY — dims non-threat areas ═══ */}
          {listenMode && threats.length===0 && <rect x="-9000" y="-9000" width={VMAP_W+18000} height={VMAP_H+18000} fill="rgba(0,0,0,0.2)" style={{pointerEvents:"none"}}/>}

          {/* City vignette fade */}
          <rect width={VMAP_W} height={VMAP_H} fill="url(#cityVig)" style={{pointerEvents:"none"}}/>

          {/* City watermark */}
          <text x={500} y={752} textAnchor="middle" fill="rgba(200,180,120,0.1)" fontSize="22"
            fontFamily="'Cinzel',serif" letterSpacing="8">NEW ELYSIUM</text>
        </g>
      </svg>

      {/* ── RICH HOVER TOOLTIP ── */}
      {tooltip && (
        <div style={{
          position:"absolute",
          left: Math.min(tipPos.x+14, containerRef.current ? containerRef.current.offsetWidth-175 : tipPos.x+14),
          top: Math.max(tipPos.y-40, 4),
          background:"rgba(3,5,2,0.97)",
          border:`1px solid ${f.color}60`,
          borderTop:`2px solid ${f.color}`,
          padding:"10px 14px",pointerEvents:"none",zIndex:50,minWidth:168,
          animation:"fadeIn 0.12s ease",
          boxShadow:`0 4px 24px rgba(0,0,0,0.9), 0 0 12px ${f.color}18`
        }}>
          <div style={{fontSize:11,color:f.color,fontFamily:"'Share Tech Mono',monospace",marginBottom:5,fontWeight:"bold",letterSpacing:1}}>{tooltip.name}</div>
          {tooltip.isAP ? <>
            <div style={{fontSize:8.5,color:`${f.color}70`,fontFamily:"'Share Tech Mono',monospace",marginBottom:2,letterSpacing:1}}>TYPE: ARCADE POINT</div>
            <div style={{fontSize:8.5,color:`${f.color}70`,fontFamily:"'Share Tech Mono',monospace",marginBottom:2,letterSpacing:1}}>FACTION: {tooltip.faction?.toUpperCase()}</div>
            <div style={{fontSize:8.5,fontFamily:"'Share Tech Mono',monospace",marginTop:4,
              color:tooltip.status==="active"?"#81C784":tooltip.status==="damaged"?"#FFD54F":"#FF4444",
              border:`1px solid ${tooltip.status==="active"?"#81C78440":tooltip.status==="damaged"?"#FFD54F40":"#FF444440"}`,
              padding:"2px 6px",display:"inline-block"
            }}>● {tooltip.status?.toUpperCase()}</div>
          </> : <>
            <div style={{display:"flex",gap:8,marginBottom:4}}>
              <div style={{fontSize:8.5,color:`${f.color}70`,fontFamily:"'Share Tech Mono',monospace",letterSpacing:1}}>CTRL</div>
              <div style={{fontSize:8.5,color:f.color,fontFamily:"'Share Tech Mono',monospace",fontWeight:"bold"}}>{tooltip.ctrl?.toUpperCase()||"—"}</div>
            </div>
            <div style={{display:"flex",gap:8,marginBottom:4}}>
              <div style={{fontSize:8.5,color:`${f.color}70`,fontFamily:"'Share Tech Mono',monospace",letterSpacing:1}}>INF</div>
              <div style={{fontSize:8.5,fontFamily:"'Share Tech Mono',monospace",fontWeight:"bold",
                color:tooltip.currentInf>0.75?"#FF3333":tooltip.currentInf>0.45?"#FFD54F":"#81C784"}}>
                {Math.round((tooltip.currentInf||0)*100)}%
              </div>
            </div>
            {/* Infection bar */}
            <div style={{height:3,background:"rgba(255,255,255,0.08)",marginBottom:4,overflow:"hidden"}}>
              <div style={{width:`${Math.round((tooltip.currentInf||0)*100)}%`,height:"100%",
                background:tooltip.currentInf>0.75?"#FF3333":tooltip.currentInf>0.45?"#FFD54F":"#81C784",
                transition:"width 0.3s"}}/>
            </div>
            {tooltip.pop>0 && <div style={{display:"flex",gap:8,marginBottom:2}}>
              <div style={{fontSize:8.5,color:`${f.color}70`,fontFamily:"'Share Tech Mono',monospace",letterSpacing:1}}>POP</div>
              <div style={{fontSize:8.5,color:`${f.color}80`,fontFamily:"'Share Tech Mono',monospace"}}>{tooltip.pop?.toLocaleString()}</div>
            </div>}
            {tooltip.type && <div style={{display:"flex",gap:8}}>
              <div style={{fontSize:8.5,color:`${f.color}70`,fontFamily:"'Share Tech Mono',monospace",letterSpacing:1}}>TYPE</div>
              <div style={{fontSize:8.5,color:`${f.color}55`,fontFamily:"'Share Tech Mono',monospace"}}>{tooltip.type?.toUpperCase()}</div>
            </div>}
          </>}
        </div>
      )}

      {/* ── LEGEND BAR ── */}
      <div style={{position:"absolute",bottom:8,left:8,display:"flex",gap:10,flexWrap:"wrap",zIndex:15,background:"rgba(2,4,2,0.75)",padding:"4px 8px"}}>
        {[
          {c:"rgba(200,10,10,0.75)",l:"INFECTED"},
          {c:"rgba(20,90,180,0.75)",l:"FEDRA"},
          {c:"rgba(100,140,10,0.75)",l:"FIREFLY"},
          {c:"rgba(160,120,40,0.75)",l:"SURVIVOR"},
          {c:"#60D8F8",l:"AP"},
          {c:"rgba(50,140,240,0.75)",l:"QZ"},
        ].map(x=>(
          <div key={x.l} style={{display:"flex",alignItems:"center",gap:3,fontSize:7.5,color:"rgba(220,200,150,0.5)",fontFamily:"'Share Tech Mono',monospace"}}>
            <div style={{width:7,height:7,background:x.c,borderRadius:1}}/>{x.l}
          </div>
        ))}
      </div>

      {/* ── LISTEN ACTIVE BADGE ── */}
      {listenMode && <div style={{position:"absolute",top:36,left:8,padding:"3px 10px",border:"1px solid rgba(255,50,50,0.8)",color:"#FF4444",fontSize:8,fontFamily:"'Share Tech Mono',monospace",letterSpacing:2,zIndex:15,animation:"routePulse 1s infinite",background:"rgba(35,0,0,0.75)"}}>● LISTEN ACTIVE</div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   CHARTS
═══════════════════════════════════════════════ */
function LineChart({ data, color }) {
  const mx=Math.max(...data.map(d=>d.value)), mn=Math.min(...data.map(d=>d.value));
  const W=280,H=82,P=10;
  const pts=data.map((d,i)=>`${P+(i/(data.length-1))*(W-P*2)},${P+(1-(d.value-mn)/(mx-mn+0.001))*(H-P*2)}`);
  return <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:80}}>
    <defs><linearGradient id="lcg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.3"/><stop offset="100%" stopColor={color} stopOpacity="0"/></linearGradient></defs>
    <path d={`M${pts[0]} L${pts.join(" L")} L${W-P},${H-P} L${P},${H-P} Z`} fill="url(#lcg)"/>
    <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="1.5"/>
    {data.map((d,i)=>{ const x=P+(i/(data.length-1))*(W-P*2),y=P+(1-(d.value-mn)/(mx-mn+0.001))*(H-P*2); return <circle key={i} cx={x} cy={y} r={2.2} fill={color}/>; })}
    {data.map((d,i)=>{ const x=P+(i/(data.length-1))*(W-P*2); return <text key={i} x={x} y={H-1} textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="6">{d.day}</text>; })}
  </svg>;
}
function DonutChart({ data }) {
  const total=data.reduce((s,d)=>s+d.value,0); let a=-Math.PI/2;
  const r=28,cx=36,cy=35;
  const slices=data.map(d=>{ const sw=(d.value/total)*Math.PI*2,x1=cx+r*Math.cos(a),y1=cy+r*Math.sin(a); a+=sw; return {...d,path:`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${sw>Math.PI?1:0} 1 ${cx+r*Math.cos(a)},${cy+r*Math.sin(a)} Z`,pct:Math.round(d.value/total*100)}; });
  return <div style={{display:"flex",alignItems:"center",gap:10}}>
    <svg viewBox="0 0 72 70" style={{width:72,height:70,flexShrink:0}}>
      {slices.map((s,i)=><path key={i} d={s.path} fill={s.color} stroke="#060404" strokeWidth="0.5"/>)}
      <circle cx={cx} cy={cy} r={12} fill="#0a0804"/>
    </svg>
    <div style={{display:"flex",flexDirection:"column",gap:3}}>
      {slices.map((s,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:5,fontSize:9}}>
        <div style={{width:7,height:7,background:s.color,flexShrink:0}}/>
        <span style={{color:"rgba(255,255,255,0.45)",fontFamily:"'Share Tech Mono',monospace",fontSize:8.5}}>{s.label}</span>
        <span style={{color:s.color,marginLeft:"auto",paddingLeft:4,fontFamily:"'Share Tech Mono',monospace",fontSize:8.5}}>{s.pct}%</span>
      </div>)}
    </div>
  </div>;
}


/* ═══════════════════════════════════════════════
   HACK MINIGAME
═══════════════════════════════════════════════ */
function HackMinigame({ onSuccess, fc, bg, border }) {
  const SYMS = ["◈","△","◻","⬡","⊕"];
  const [seq,setSeq]=useState([]);
  const [hl,setHl]=useState(-1);
  const [inp,setInp]=useState([]);
  const [phase,setPhase]=useState("showing");
  const [attempts,setAttempts]=useState(5);
  const [shake,setShake]=useState(false);

  const startNew=()=>{
    const s=Array.from({length:3},()=>SYMS[Math.floor(Math.random()*SYMS.length)]);
    setSeq(s); setInp([]); setHl(-1); setPhase("showing");
    s.forEach((_,i)=>setTimeout(()=>{setHl(i);SFX.play("click");},600+i*800));
    setTimeout(()=>{setHl(-1);setPhase("input");},600+3*800+400);
  };
  useEffect(()=>{startNew();},[]);

  const pick=sym=>{
    if(phase!=="input")return;
    SFX.play("click");
    const next=[...inp,sym]; setInp(next);
    if(next.length===3){
      if(next.every((s,i)=>s===seq[i])){ setPhase("success"); SFX.play("confirm"); setTimeout(onSuccess,900); }
      else{ SFX.play("error"); setShake(true); setTimeout(()=>setShake(false),500); const r=attempts-1; setAttempts(r); setInp([]); if(r<=0)setTimeout(()=>{startNew();setAttempts(5);},700); }
    }
  };

  return <div style={{background:`${bg}cc`,border:`1px solid ${border}`,padding:"28px 24px",textAlign:"center"}}>
    <div style={{fontSize:8,letterSpacing:5,color:`${fc}50`,marginBottom:6,fontFamily:"'Share Tech Mono',monospace"}}>ARCADE CALIBRATION PROTOCOL</div>
    <div style={{fontSize:11,letterSpacing:3,color:"#FFD54F",marginBottom:24,fontFamily:"'Share Tech Mono',monospace"}}>
      {phase==="showing"?"MEMORIZE SEQUENCE":phase==="input"?"REPRODUCE PATTERN":phase==="success"?"✓ IDENTITY CONFIRMED":"WRONG — RETRY"}
    </div>
    <div style={{display:"flex",justifyContent:"center",gap:18,marginBottom:28,animation:shake?"shake 0.45s ease":"none"}}>
      {[0,1,2].map(i=>{
        const isH=hl===i,filled=phase==="input"&&inp[i],done=phase==="success";
        return <div key={i} style={{width:60,height:60,border:`2px solid ${isH||done?fc:filled?"#FFD54F":`${fc}20`}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,transition:"all 0.25s",background:isH||done?`${fc}15`:filled?"rgba(255,213,79,0.08)":"transparent",boxShadow:isH?`0 0 24px ${fc}65`:done?`0 0 16px ${fc}45`:"none",color:isH||done?fc:filled?"#FFD54F":`${fc}22`,fontFamily:"'Share Tech Mono',monospace"}}>
          {isH||done?seq[i]:(phase==="input"&&inp[i])?inp[i]:"·"}
        </div>;
      })}
    </div>
    {phase==="input"&&<>
      <div style={{display:"flex",justifyContent:"center",gap:12,marginBottom:16,flexWrap:"wrap"}}>
        {SYMS.map(sym=><button key={sym} onClick={()=>pick(sym)} style={{width:62,height:62,border:`1px solid ${fc}45`,background:`${fc}07`,color:fc,fontSize:26,cursor:"pointer",fontFamily:"'Share Tech Mono',monospace",transition:"all 0.15s"}} onMouseEnter={e=>{e.currentTarget.style.background=`${fc}1e`;e.currentTarget.style.boxShadow=`0 0 16px ${fc}45`;SFX.play("hover");}} onMouseLeave={e=>{e.currentTarget.style.background=`${fc}07`;e.currentTarget.style.boxShadow="none";}}>{sym}</button>)}
      </div>
      <div style={{display:"flex",gap:12,justifyContent:"center",alignItems:"center"}}>
        <button onClick={()=>{setInp([]);SFX.play("click");}} style={{padding:"4px 14px",background:"transparent",border:"1px solid rgba(255,100,50,0.35)",color:"rgba(255,120,70,0.8)",cursor:"pointer",fontSize:8,letterSpacing:2,fontFamily:"'Share Tech Mono',monospace"}}>CLEAR</button>
        <span style={{fontSize:8,color:`${fc}40`,fontFamily:"'Share Tech Mono',monospace"}}>ATTEMPTS: {attempts}</span>
      </div>
    </>}
    {phase==="success"&&<div style={{position:"relative"}}>
      <div style={{color:"#81C784",fontSize:13,letterSpacing:4,fontFamily:"'Share Tech Mono',monospace",animation:"fadeIn 0.5s ease"}}>ACCESS GRANTED</div>
      <div style={{position:"absolute",inset:"-18px",border:"2px solid #81C784",borderRadius:"50%",animation:"successRing 1s ease forwards"}}/>
    </div>}
  </div>;
}

/* ═══════════════════════════════════════════════
   CONFIDENTIAL DOCUMENT
═══════════════════════════════════════════════ */
function ConfidentialDoc({ onOpen }) {
  const [pos,setPos]=useState({x:0,y:0});
  const [isDrag,setIsDrag]=useState(false);
  const [revealed,setRevealed]=useState(false);
  const [tilt,setTilt]=useState({x:0,y:0});
  const [hovered,setHovered]=useState(false);
  const dragOrig=useRef(null);
  const docRef=useRef();

  const onMouseDown=e=>{SFX.play("paper");setIsDrag(true);dragOrig.current={x:e.clientX-pos.x,y:e.clientY-pos.y};};
  const onMouseMove=useCallback(e=>{
    if(isDrag&&dragOrig.current){
      const nx=e.clientX-dragOrig.current.x,ny=e.clientY-dragOrig.current.y;
      setPos({x:nx,y:ny});
      if(!revealed&&(Math.abs(nx)>45||Math.abs(ny)>45)){setRevealed(true);SFX.play("unlock");}
    }
    if(!isDrag&&docRef.current){
      const r=docRef.current.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
      setTilt({x:(e.clientY-cy)/(r.height/2)*7,y:-(e.clientX-cx)/(r.width/2)*7});
    }
  },[isDrag,revealed]);
  const onMouseUp=()=>{setIsDrag(false);dragOrig.current=null;};
  useEffect(()=>{window.addEventListener("mousemove",onMouseMove);window.addEventListener("mouseup",onMouseUp);return()=>{window.removeEventListener("mousemove",onMouseMove);window.removeEventListener("mouseup",onMouseUp);};},[onMouseMove]);

  return <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"55vh",padding:"40px 20px",position:"relative"}}>
    {!revealed&&<div style={{textAlign:"center",marginBottom:28,animation:"fadeIn 1s ease"}}>
      <div style={{fontSize:10,letterSpacing:6,color:"rgba(212,168,83,0.35)",marginBottom:8,fontFamily:"'Share Tech Mono',monospace"}}>CLASSIFIED DOCUMENT DETECTED</div>
      <div style={{fontSize:14,color:"rgba(212,168,83,0.5)",fontFamily:"'Playfair Display',serif",fontStyle:"italic"}}>Drag the document to unseal its contents</div>
    </div>}

    <div ref={docRef} onMouseDown={onMouseDown} onMouseEnter={()=>{setHovered(true);SFX.play("hover");}} onMouseLeave={()=>setHovered(false)}
      style={{position:"relative",transform:`translate(${pos.x}px,${pos.y}px) perspective(800px) rotateX(${isDrag?0:tilt.x}deg) rotateY(${isDrag?0:tilt.y}deg) rotate(-1.5deg)`,transition:isDrag?"none":"transform 0.3s ease",cursor:isDrag?"grabbing":"grab",userSelect:"none",animation:isDrag?"none":"paperJitter 4s ease-in-out infinite",zIndex:10,filter:`drop-shadow(0 ${hovered?"20px 32px":"8px 18px"} rgba(0,0,0,0.85))`}}>
      <div style={{position:"absolute",inset:-3,background:"#c8b898",zIndex:-1,transform:"rotate(1deg) translate(2px,2px)",opacity:0.55}}/>
      <div style={{position:"absolute",inset:-2,background:"#d4c4a4",zIndex:-1,transform:"rotate(-0.5deg) translate(-1px,1px)",opacity:0.65}}/>
      <div style={{width:"clamp(270px,36vw,430px)",background:"linear-gradient(160deg,#e8dcc0 0%,#d4c4a0 30%,#c8b888 60%,#d0c095 100%)",padding:"36px 30px",position:"relative",overflow:"hidden",border:"1px solid rgba(100,70,20,0.35)"}}>
        {/* Grain */}
        <div style={{position:"absolute",inset:0,opacity:0.07,zIndex:0,backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`}}/>
        {/* Stains */}
        <div style={{position:"absolute",top:18,right:28,width:38,height:38,borderRadius:"50%",background:"rgba(80,40,10,0.07)",zIndex:0}}/>
        <div style={{position:"absolute",bottom:55,left:18,width:22,height:22,borderRadius:"50%",background:"rgba(80,40,10,0.05)",zIndex:0}}/>
        {/* Fold lines */}
        <div style={{position:"absolute",top:"33%",left:0,right:0,height:1,background:"rgba(100,70,20,0.1)",zIndex:0}}/>
        <div style={{position:"absolute",top:"66%",left:0,right:0,height:1,background:"rgba(100,70,20,0.1)",zIndex:0}}/>
        <div style={{position:"relative",zIndex:1}}>
          <div style={{textAlign:"center",marginBottom:16,borderBottom:"2px solid rgba(80,40,10,0.22)",paddingBottom:12}}>
            <div style={{fontSize:8,letterSpacing:5,color:"rgba(80,40,10,0.55)",fontFamily:"'Share Tech Mono',monospace",marginBottom:6}}>FEDERAL DISASTER RESPONSE AUTHORITY</div>
            <div style={{fontSize:"clamp(13px,2.5vw,16px)",fontFamily:"'Cinzel',serif",fontWeight:700,color:"#2a1800",letterSpacing:2,lineHeight:1.3}}>THE CORDYCEPS ARCHIVE<br/><span style={{fontSize:"0.7em",fontWeight:400,letterSpacing:4,color:"rgba(80,40,10,0.65)"}}>INFORMATION NETWORK</span></div>
          </div>
          {[0,1].map(i=><div key={i} style={{background:"rgba(120,20,20,0.82)",padding:"4px 8px",marginBottom:i===0?5:14,textAlign:"center",fontSize:9,fontFamily:"'Oswald',sans-serif",letterSpacing:6,color:"#ffcccc",fontWeight:600}}>███ TOP SECRET ███</div>)}
          <div style={{fontSize:11,fontFamily:"'Special Elite',cursive",color:"#2a1800",lineHeight:1.9,marginBottom:14}}>
            <p style={{marginBottom:9}}>This document contains classified tactical data pertaining to the Cordyceps outbreak, quarantine zone operations, and active faction movements within New Elysium City limits.</p>
            <p style={{opacity:0.68}}><span style={{textDecoration:"line-through",opacity:0.4}}>VACCINE PROGRAM: PHASE II</span><br/>Distribution to civilian personnel is punishable under <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10}}>FEDRA EP-7C</span>.</p>
          </div>
          {[...Array(3)].map((_,i)=><div key={i} style={{height:10,background:"#1a0800",marginBottom:5,width:`${70+i*10}%`,opacity:0.82}}/>)}
          <div style={{marginTop:14,fontSize:8,fontFamily:"'Share Tech Mono',monospace",color:"rgba(80,40,10,0.45)",letterSpacing:2}}>DOC REF: TCA-2023-0087 · EYES ONLY</div>
        </div>
        {/* Stamp */}
        <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%) rotate(-18deg)",border:"3px solid rgba(120,20,20,0.52)",padding:"6px 14px",fontFamily:"'Oswald',sans-serif",fontWeight:700,fontSize:"clamp(20px,4vw,27px)",letterSpacing:5,color:"rgba(120,20,20,0.43)",whiteSpace:"nowrap",animation:"stampIn 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.4s both",zIndex:5,pointerEvents:"none"}}>CONFIDENTIAL</div>
        {/* Tape */}
        <div style={{position:"absolute",top:-8,left:"50%",transform:"translateX(-50%)",width:76,height:15,background:"rgba(220,200,140,0.65)",border:"1px solid rgba(180,150,80,0.45)",zIndex:6}}/>
      </div>
    </div>

    {revealed&&<div style={{marginTop:30,textAlign:"center",animation:"fadeUp 0.7s ease"}}>
      <div style={{fontSize:10,letterSpacing:4,color:"rgba(212,168,83,0.45)",marginBottom:12,fontFamily:"'Share Tech Mono',monospace"}}>DOCUMENT UNSEALED — CONTENTS ACCESSIBLE</div>
      <button onClick={()=>{SFX.play("confirm");onOpen();}} style={{padding:"14px 44px",background:"rgba(212,168,83,0.07)",border:"1px solid rgba(212,168,83,0.6)",color:"#D4A853",fontFamily:"'Cinzel',serif",fontSize:13,letterSpacing:4,cursor:"pointer",transition:"all 0.3s",animation:"pulseGold 2.5s ease infinite"}}
        onMouseEnter={e=>{e.currentTarget.style.background="rgba(212,168,83,0.17)";SFX.play("hover");}}
        onMouseLeave={e=>e.currentTarget.style.background="rgba(212,168,83,0.07)"}>ENTER THE ARCHIVE ▸</button>
    </div>}
  </div>;
}

/* ═══════════════════════════════════════════════
   FACTION AUTH
═══════════════════════════════════════════════ */
function FactionAuth({ onLogin }) {
  const [form,setForm]=useState({username:"",faction:"",location:"",secretCode:""});
  const [step,setStep]=useState("select");
  const [prevLoc,setPrevLoc]=useState("");
  const [vis,setVis]=useState(false);
  const [codeErr,setCodeErr]=useState(false);
  const [showCode,setShowCode]=useState(false);
  useEffect(()=>{setTimeout(()=>setVis(true),80);},[]);
  const fc=form.faction?FACTIONS[form.faction]:null;

  // Faction secret codes — firefly and fedra require these to proceed
  const SECRET = { firefly:"LOOKFORTHELIGHT", fedra:"FEDRA-0451" };
  const needsCode = form.faction==="firefly"||form.faction==="fedra";
  const formReady = form.username && form.location && (!needsCode || form.secretCode);

  const selectFaction=id=>{ SFX.play("select"); setForm(f=>({...f,faction:id,secretCode:""})); setCodeErr(false); };
  const proceed=()=>{if(form.faction){SFX.play("confirm");setStep("form");}};
  const auth=()=>{
    if(!form.username||!form.location)return;
    if(needsCode){
      if(form.secretCode.trim().toUpperCase()!==SECRET[form.faction]){
        setCodeErr(true); SFX.play("error");
        setTimeout(()=>setCodeErr(false),2500);
        return;
      }
    }
    SFX.play("confirm");
    const ret=localStorage.getItem(`tcp_${form.username}`);
    if(ret){setStep("travel");}else{localStorage.setItem(`tcp_${form.username}`,"1");setStep("hack");}
  };

  return <div style={{opacity:vis?1:0,transition:"opacity 0.6s ease",padding:"40px 20px 60px",maxWidth:940,margin:"0 auto",animation:vis?"fadeInScale 0.7s ease":"none"}}>

    {step==="select"&&<>
      <div style={{textAlign:"center",marginBottom:40}}>
        <div style={{fontSize:9,letterSpacing:7,color:"rgba(212,168,83,0.32)",marginBottom:10,fontFamily:"'Share Tech Mono',monospace"}}>STEP 1 OF 3 — FACTION DECLARATION</div>
        <h2 style={{fontFamily:"'Cinzel',serif",fontSize:"clamp(22px,4vw,38px)",color:"#D4A853",letterSpacing:3,marginBottom:8}}>Choose Your Allegiance</h2>
        <p style={{fontFamily:"'Playfair Display',serif",fontSize:15,color:"rgba(212,168,83,0.48)",fontStyle:"italic"}}>Your faction determines what you see, what you fight for, and who trusts you.</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:36}}>
        {Object.values(FACTIONS).map((f,i)=>{
          const sel=form.faction===f.id;
          return <div key={f.id} onClick={()=>selectFaction(f.id)} style={{padding:"28px 20px 22px",cursor:"pointer",border:`2px solid ${sel?f.color:`${f.cardBorder}50`}`,background:sel?`radial-gradient(ellipse at 40% 30%, ${f.color}12 0%, ${f.bg} 70%)`:`linear-gradient(160deg, ${f.bg} 0%, ${f.secondary} 100%)`,position:"relative",overflow:"hidden",transition:"all 0.35s cubic-bezier(0.16,1,0.3,1)",transform:sel?"translateY(-5px) scale(1.02)":"translateY(0) scale(1)",boxShadow:sel?`0 14px 40px ${f.glow}, 0 0 0 1px ${f.color}20`:"none",animation:`cardEntrance 0.5s ease ${i*0.1}s both`}}
            onMouseEnter={e=>{if(!sel){SFX.play("hover");e.currentTarget.style.borderColor=`${f.cardBorder}aa`;e.currentTarget.style.transform="translateY(-3px)";}}}
            onMouseLeave={e=>{if(!sel){e.currentTarget.style.borderColor=`${f.cardBorder}50`;e.currentTarget.style.transform="translateY(0)";}}}
          >
            {sel&&<div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse 60% 50% at 35% 25%, ${f.color}10, transparent)`,pointerEvents:"none"}}/>}
            {sel&&<div style={{position:"absolute",top:10,right:12,width:10,height:10,borderRadius:"50%",background:f.color,boxShadow:`0 0 12px ${f.color}`,animation:"pulseGold 1.5s infinite"}}/>}
            <div style={{fontSize:42,color:f.color,opacity:sel?1:0.45,marginBottom:14,textShadow:sel?`0 0 30px ${f.color}90`:"none",fontFamily:"'Share Tech Mono',monospace",transition:"all 0.3s"}}>{f.icon}</div>
            <div style={{fontSize:9,letterSpacing:5,color:`${f.color}70`,marginBottom:6,fontFamily:"'Share Tech Mono',monospace"}}>{f.tag}</div>
            <div style={{fontFamily:f.headFont,fontSize:17,color:sel?f.color:`${f.color}bb`,marginBottom:10,fontWeight:f.id!=="survivor"?600:400,transition:"color 0.3s"}}>{f.name}</div>
            <div style={{fontSize:12,fontFamily:f.bodyFont,color:`${f.color}65`,lineHeight:1.8}}>{f.description}</div>
            <div style={{marginTop:14,paddingTop:12,borderTop:`1px solid ${f.color}18`,fontSize:11,fontFamily:"'Playfair Display',serif",color:`${f.color}45`,fontStyle:"italic"}}>"{f.lore}"</div>
            <div style={{marginTop:14,height:2,background:`linear-gradient(90deg, ${f.color}, transparent)`,opacity:sel?0.9:0.22,transition:"opacity 0.3s"}}/>
          </div>;
        })}
      </div>
      <div style={{textAlign:"center",paddingBottom:20}}>
        <button onClick={proceed} disabled={!form.faction} style={{padding:"13px 48px",background:form.faction?`${fc?.color}0f`:"transparent",border:`1px solid ${form.faction?fc?.color:"rgba(212,168,83,0.15)"}`,color:form.faction?fc?.color:"rgba(212,168,83,0.2)",fontFamily:"'Cinzel',serif",fontSize:12,letterSpacing:4,cursor:form.faction?"pointer":"not-allowed",transition:"all 0.3s",animation:form.faction?"breatheBtn 2s ease infinite":"none"}}
          onMouseEnter={e=>{if(form.faction){SFX.play("hover");e.currentTarget.style.background=`${fc?.color}1e`;}}}
          onMouseLeave={e=>{if(form.faction)e.currentTarget.style.background=`${fc?.color}0f`;}}>
          DECLARE ALLEGIANCE ▸
        </button>
      </div>
    </>}

    {step==="form"&&fc&&<div style={{maxWidth:560,margin:"0 auto",animation:"slideRight 0.5s ease",paddingBottom:20}}>
      <div style={{textAlign:"center",marginBottom:36}}>
        <div style={{fontSize:9,letterSpacing:5,color:`${fc.color}50`,marginBottom:8,fontFamily:"'Share Tech Mono',monospace"}}>STEP 2 OF 3 — IDENTITY REGISTRATION</div>
        <div style={{fontSize:30,color:fc.color,marginBottom:8,fontFamily:fc.headFont}}>{fc.icon} {fc.name}</div>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:14,color:`${fc.color}52`,fontStyle:"italic"}}>"{fc.lore}"</div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div>
          <label style={{display:"block",fontSize:9,letterSpacing:3,color:`${fc.color}55`,marginBottom:8,fontFamily:"'Share Tech Mono',monospace"}}>CALLSIGN / IDENTIFIER</label>
          <input value={form.username} onChange={e=>setForm(f=>({...f,username:e.target.value}))} placeholder="Enter your callsign..."
            style={{width:"100%",padding:"12px 16px",background:fc.bg,border:`1px solid ${form.username?fc.color+"60":fc.border}`,color:fc.color,fontFamily:fc.monoFont,fontSize:12,outline:"none"}}
            onFocus={e=>{e.target.style.borderColor=`${fc.color}90`;SFX.play("click");}} onBlur={e=>e.target.style.borderColor=form.username?`${fc.color}60`:fc.border}/>
        </div>
        <div>
          <label style={{display:"block",fontSize:9,letterSpacing:3,color:`${fc.color}55`,marginBottom:8,fontFamily:"'Share Tech Mono',monospace"}}>CURRENT LOCATION</label>
          <select value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))}
            style={{width:"100%",padding:"12px 16px",background:fc.bg,border:`1px solid ${form.location?fc.color+"60":fc.border}`,color:form.location?fc.color:`${fc.color}50`,fontFamily:"'Share Tech Mono',monospace",fontSize:11,outline:"none",cursor:"pointer"}}
            onFocus={e=>e.target.style.borderColor=`${fc.color}90`} onBlur={e=>e.target.style.borderColor=form.location?`${fc.color}60`:fc.border}>
            <option value="">— SELECT SECTOR —</option>
            {DISTRICTS.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        {needsCode && (
          <div style={{position:"relative"}}>
            <label style={{display:"block",fontSize:9,letterSpacing:3,color:`${fc.color}55`,marginBottom:8,fontFamily:"'Share Tech Mono',monospace"}}>
              {fc.id==="fedra" ? "FEDRA CLEARANCE CODE" : "FIREFLY RECOGNITION PHRASE"}
              <span style={{marginLeft:8,fontSize:7.5,color:"#FF6B35",letterSpacing:2,border:"1px solid #FF6B3540",padding:"1px 5px"}}>CLASSIFIED</span>
            </label>
            <div style={{position:"relative"}}>
              <input
                type={showCode?"text":"password"}
                value={form.secretCode}
                placeholder={fc.id==="fedra"?"Enter FEDRA clearance code...":"Enter Firefly recognition phrase..."}
                onChange={e=>{setForm(f=>({...f,secretCode:e.target.value}));setCodeErr(false);}}
                style={{width:"100%",padding:"12px 44px 12px 16px",
                  background:codeErr?"rgba(80,0,0,0.5)":fc.bg,
                  border:`1px solid ${codeErr?"#FF4444":form.secretCode?fc.color+"60":fc.border}`,
                  color:fc.color, fontFamily:fc.monoFont, fontSize:12, outline:"none",
                  letterSpacing:showCode?1:4, transition:"border-color 0.2s, background 0.2s",
                  animation:codeErr?"shake 0.4s ease":"none"}}
                onFocus={e=>{e.target.style.borderColor=`${fc.color}90`;SFX.play("click");}}
                onBlur={e=>e.target.style.borderColor=form.secretCode?`${fc.color}60`:fc.border}
              />
              <button onClick={()=>setShowCode(s=>!s)}
                style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",
                  background:"none",border:"none",cursor:"pointer",fontSize:14,
                  color:`${fc.color}55`,lineHeight:1}}>
                {showCode?"🙈":"👁"}
              </button>
            </div>
            {codeErr && (
              <div style={{marginTop:6,fontSize:8.5,color:"#FF4444",fontFamily:"'Share Tech Mono',monospace",letterSpacing:1,animation:"fadeIn 0.2s ease"}}>
                ⚠ AUTHENTICATION FAILED — ACCESS DENIED
              </div>
            )}
            <div style={{marginTop:5,fontSize:8,color:`${fc.color}28`,fontFamily:"'Share Tech Mono',monospace",letterSpacing:1}}>
              {fc.id==="fedra" ? "Hint: Standard FEDRA protocol identifier + unit 0451" : "Hint: The Firefly motto, no spaces, all caps"}
            </div>
          </div>
        )}
        <div style={{display:"flex",gap:12,marginTop:8}}>
          <button onClick={()=>{setStep("select");SFX.play("click");}} style={{flex:1,padding:13,background:"transparent",border:`1px solid ${fc.border}`,color:`${fc.color}60`,fontFamily:"'Share Tech Mono',monospace",fontSize:10,letterSpacing:3,cursor:"pointer"}} onMouseEnter={e=>SFX.play("hover")}>← BACK</button>
          <button onClick={auth} disabled={!formReady}
            style={{flex:2,padding:13,background:formReady?`${fc.color}10`:"transparent",border:`1px solid ${formReady?fc.color:fc.border}`,color:formReady?fc.color:`${fc.color}30`,fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:4,cursor:formReady?"pointer":"not-allowed",animation:formReady?"breatheBtn 2s ease infinite":"none"}}
            onMouseEnter={e=>{if(formReady)SFX.play("hover");}}>INITIATE HANDSHAKE ▸</button>
        </div>
      </div>
    </div>}

    {step==="travel"&&fc&&<div style={{maxWidth:520,margin:"0 auto",textAlign:"center",animation:"slideRight 0.5s ease",paddingBottom:20}}>
      <div style={{fontSize:9,letterSpacing:5,color:`${fc.color}50`,marginBottom:8,fontFamily:"'Share Tech Mono',monospace"}}>STEP 2 OF 3 — TRAVEL VERIFICATION</div>
      <h3 style={{fontFamily:fc.headFont,fontSize:28,color:fc.color,marginBottom:8}}>Travel Log</h3>
      <p style={{fontFamily:"'Playfair Display',serif",fontSize:14,color:`${fc.color}52`,marginBottom:32,fontStyle:"italic"}}>Welcome back, {form.username}. Confirm your route.</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 28px 1fr",gap:8,alignItems:"end",marginBottom:20}}>
        <div>
          <label style={{display:"block",fontSize:8,letterSpacing:3,color:`${fc.color}50`,marginBottom:7,fontFamily:"'Share Tech Mono',monospace"}}>PREVIOUS LOCATION</label>
          <select value={prevLoc} onChange={e=>setPrevLoc(e.target.value)} style={{width:"100%",padding:"11px 12px",background:fc.bg,border:`1px solid ${fc.border}`,color:prevLoc?fc.color:`${fc.color}50`,fontFamily:"'Share Tech Mono',monospace",fontSize:10,outline:"none"}}>
            <option value="">— SELECT —</option>
            {DISTRICTS.filter(d=>d.id!==form.location).map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div style={{textAlign:"center",color:`${fc.color}50`,fontSize:18,paddingBottom:2}}>→</div>
        <div>
          <label style={{display:"block",fontSize:8,letterSpacing:3,color:`${fc.color}50`,marginBottom:7,fontFamily:"'Share Tech Mono',monospace"}}>CURRENT LOCATION</label>
          <div style={{padding:"11px 12px",border:`1px solid ${fc.border}`,color:`${fc.color}70`,fontSize:10,fontFamily:"'Share Tech Mono',monospace",textAlign:"left"}}>{DISTRICTS.find(d=>d.id===form.location)?.name||"Unknown"}</div>
        </div>
      </div>
      <button onClick={()=>{if(prevLoc){SFX.play("confirm");setStep("hack");}}} disabled={!prevLoc}
        style={{width:"100%",padding:13,background:prevLoc?`${fc.color}10`:"transparent",border:`1px solid ${prevLoc?fc.color:fc.border}`,color:prevLoc?fc.color:`${fc.color}30`,fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:4,cursor:prevLoc?"pointer":"not-allowed"}}>
        CONFIRM ROUTE ▸
      </button>
    </div>}

    {step==="hack"&&fc&&<div style={{maxWidth:500,margin:"0 auto",animation:"slideRight 0.5s ease",paddingBottom:20}}>
      <div style={{textAlign:"center",marginBottom:22}}>
        <div style={{fontSize:9,letterSpacing:5,color:`${fc.color}50`,marginBottom:8,fontFamily:"'Share Tech Mono',monospace"}}>STEP 3 OF 3 — SYSTEM VERIFICATION</div>
        <h3 style={{fontFamily:fc.headFont,fontSize:28,color:fc.color,marginBottom:6}}>Pattern Lock</h3>
        <p style={{fontFamily:"'Playfair Display',serif",fontSize:13,color:`${fc.color}50`,fontStyle:"italic"}}>Watch the 3-symbol sequence, then reproduce it.</p>
      </div>
      <HackMinigame onSuccess={()=>{SFX.play("unlock");setTimeout(()=>onLogin(form.faction,form.username),600);}} fc={fc.color} bg={fc.bg} border={fc.border}/>
    </div>}
  </div>;
}


/* ═══════════════════════════════════════════════
   LANDING PAGE — full cinematic scroll
═══════════════════════════════════════════════ */
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

  const p = (factor) => scrollY * factor;

  if (showAuth) {
    return (
      <div style={{ minHeight: "100vh", background: "#060402", color: "#D4A853", position: "relative", overflowY: "auto", overflowX: "hidden" }}>
        <style>{G}</style>
        <div style={{ position: "fixed", inset: 0, backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.05) 3px,rgba(0,0,0,0.05) 4px)", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 980, margin: "0 auto", padding: "40px 20px 60px" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 9, letterSpacing: 6, color: "rgba(212,168,83,0.32)", marginBottom: 8, fontFamily: "'Share Tech Mono',monospace" }}>THE CORDYCEPS ARCHIVE · FACTION ACCESS</div>
            <div style={{ width: 200, height: 1, background: "linear-gradient(90deg,transparent,rgba(212,168,83,0.4),transparent)", margin: "0 auto" }} />
          </div>
          <FactionAuth onLogin={onLogin} />
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="lp-scroll" style={{ background: "#060402", color: "#D4A853", fontFamily: "'Share Tech Mono',monospace" }}>
      <style>{G}</style>

      {/* ══ HERO ══ */}
      <div style={{ position: "relative", height: "100vh", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", inset: "-20%", background: "radial-gradient(ellipse 90% 70% at 50% 45%, #1c0e03 0%, #080402 55%, #010100 100%)", transform: `translateY(${p(0.25)}px)`, zIndex: 0 }} />
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "120%", top: "-10%", zIndex: 1, opacity: 0.12, transform: `translateY(${p(0.14)}px)` }} viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice">
          {Array.from({ length: 14 }, (_, i) => (
            <path key={i} d={`M${500 + Math.sin(i * 0.7) * 300},700 C${460 + Math.cos(i * 1.1) * 160},${480 + Math.sin(i) * 60} ${380 + Math.sin(i * 0.9) * 220},${300 + Math.cos(i * 1.3) * 80} ${320 + Math.cos(i) * 260},${-30 + i * 4}`}
              stroke={`hsl(${25 + i * 4},${50 + i * 2}%,${18 + i * 2}%)`} strokeWidth={0.8 + i * 0.24} fill="none" strokeDasharray={`${4 + i * 2},${7 + i * 3}`} />
          ))}
        </svg>
        {/* City silhouette */}
        <svg style={{ position: "absolute", bottom: 0, left: 0, width: "100%", zIndex: 2, opacity: 0.09, transform: `translateY(${p(0.35)}px)` }} viewBox="0 0 1400 300" preserveAspectRatio="xMidYMax slice">
          <path d="M0,300 L0,200 L40,200 L40,140 L80,140 L80,180 L120,180 L120,100 L160,100 L160,150 L200,150 L200,110 L240,110 L240,60 L280,60 L280,100 L320,100 L320,120 L360,120 L360,75 L400,75 L400,130 L440,130 L440,85 L480,85 L480,145 L520,145 L520,65 L560,65 L560,110 L600,110 L600,165 L640,165 L640,115 L680,115 L680,75 L720,75 L720,125 L760,125 L760,95 L800,95 L800,155 L840,155 L840,100 L880,100 L880,145 L920,145 L920,185 L960,185 L960,135 L1000,135 L1000,175 L1040,175 L1040,155 L1080,155 L1080,200 L1120,200 L1120,175 L1160,175 L1160,215 L1200,215 L1200,190 L1240,190 L1240,220 L1280,220 L1280,200 L1320,200 L1320,230 L1400,230 L1400,300 Z" fill="rgba(212,168,83,0.22)" />
        </svg>
        <SporeField count={26} color="rgba(180,130,45,0.5)" />
        <div style={{ position: "absolute", inset: 0, zIndex: 3, background: "radial-gradient(ellipse 75% 75% at 50% 50%, transparent 25%, rgba(0,0,0,0.82) 100%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, zIndex: 4, overflow: "hidden", pointerEvents: "none" }}>
          <div style={{ width: "100%", height: 3, background: "linear-gradient(180deg,transparent,rgba(212,168,83,0.04),transparent)", animation: "scanline 9s linear infinite" }} />
        </div>
        <div style={{ position: "relative", zIndex: 5, textAlign: "center", transform: `translateY(${p(0.18)}px)`, padding: "0 24px" }}>
          <div style={{ fontSize: 10, letterSpacing: 10, color: "rgba(212,168,83,0.27)", marginBottom: 20, animation: "fadeIn 2.5s ease 0.3s both" }}>YEAR 2023 · CITY UNDER QUARANTINE</div>
          <div style={{ width: "40%", maxWidth: 200, height: 1, background: "linear-gradient(90deg,transparent,rgba(212,168,83,0.38),transparent)", margin: "0 auto 28px", animation: "fadeIn 1s ease 0.9s both" }} />
          <h1 style={{ fontFamily: "'Cinzel Decorative',serif", fontWeight: 900, fontSize: "clamp(36px,8.5vw,100px)", letterSpacing: "0.06em", lineHeight: 0.94, color: "#D4A853", margin: "0 0 10px", textShadow: "0 0 60px rgba(212,168,83,0.3),0 0 120px rgba(212,168,83,0.1),0 6px 30px rgba(0,0,0,0.9)", animation: "fadeUp 1.4s cubic-bezier(0.16,1,0.3,1) 0.6s both" }}>
            THE<br /><span style={{ color: "#F5F0E8", textShadow: "0 0 80px rgba(255,255,255,0.12)" }}>TURNING</span><br />POINT
          </h1>
          <div style={{ width: "50%", maxWidth: 280, height: 1, background: "linear-gradient(90deg,transparent,rgba(212,168,83,0.4),transparent)", margin: "28px auto 22px", animation: "fadeIn 1s ease 1.9s both" }} />
          <p style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(14px,1.8vw,18px)", color: "rgba(212,168,83,0.48)", letterSpacing: 1.5, fontStyle: "italic", animation: "fadeIn 1s ease 2.3s both", maxWidth: 400, margin: "0 auto" }}>
            "When you're lost in the darkness,<br />look for the light."
          </p>
          <div style={{ marginTop: 40, fontSize: 8, letterSpacing: 5, color: "rgba(212,168,83,0.25)", animation: "fadeIn 1s ease 3.2s both" }}>↓ SCROLL TO CONTINUE ↓</div>
        </div>
      </div>

      {/* ══ THE FALL ══ */}
      <div style={{ position: "relative", minHeight: "100vh", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", padding: "100px 24px" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,#060402 0%,#0d0601 50%,#060402 100%)" }} />
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: `translate(-50%,calc(-50% + ${p(-0.1)}px))`, fontSize: "clamp(55px,14vw,160px)", fontFamily: "'Cinzel',serif", fontWeight: 900, color: "rgba(90,50,15,0.04)", whiteSpace: "nowrap", userSelect: "none", zIndex: 0 }}>CORDYCEPS</div>
        <div style={{ position: "relative", zIndex: 2, maxWidth: 980, width: "100%" }}>
          <ScrollReveal>
            <div style={{ textAlign: "center", marginBottom: 52 }}>
              <div style={{ fontSize: 9, letterSpacing: 7, color: "rgba(212,168,83,0.27)", marginBottom: 10 }}>ARCHIVE ENTRY 001</div>
              <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: "clamp(24px,4vw,46px)", color: "#D4A853", letterSpacing: 3 }}>The Fall</h2>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, color: "rgba(212,168,83,0.43)", marginTop: 10, fontStyle: "italic" }}>How twenty years of civilization unraveled in twenty days.</div>
            </div>
          </ScrollReveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 20 }}>
            {[
              { date: "Sep 2003", title: "Patient Zero", icon: "◉", text: "A mutated Ophiocordyceps strain crosses the species barrier. First human cases dismissed as flu in Jakarta." },
              { date: "Oct 2003", title: "The Spread", icon: "◈", text: "Contaminated flour shipments carry the fungus globally. Containment fails. 60% of major cities compromised within weeks." },
              { date: "Nov 2003", title: "QZs Sealed", icon: "◻", text: "FEDRA declares martial law. Quarantine Zones walled off at gunpoint. Millions left outside." },
              { date: "2013", title: "A Decade Under", icon: "◆", text: "Nature reclaims the outside world. Firefly resistance cells form. The desperate search for a vaccine begins." },
            ].map((item, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div style={{ padding: "22px 20px", border: "1px solid rgba(212,168,83,0.1)", background: "rgba(212,168,83,0.02)", position: "relative", transition: "border-color 0.3s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(212,168,83,0.22)"; SFX.play("hover"); }}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(212,168,83,0.1)"}>
                  <div style={{ position: "absolute", top: 0, left: 0, width: 2, height: "100%", background: "linear-gradient(180deg,rgba(212,168,83,0.6),transparent)" }} />
                  <div style={{ fontSize: 22, color: "rgba(212,168,83,0.22)", marginBottom: 10 }}>{item.icon}</div>
                  <div style={{ fontSize: 8, letterSpacing: 3, color: "rgba(212,168,83,0.38)", marginBottom: 7 }}>{item.date}</div>
                  <div style={{ fontSize: 15, fontFamily: "'Cinzel',serif", color: "#D4A853", marginBottom: 10, letterSpacing: 1 }}>{item.title}</div>
                  <div style={{ fontSize: 13, fontFamily: "'Playfair Display',serif", color: "rgba(212,168,83,0.54)", lineHeight: 1.85 }}>{item.text}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>

      {/* ══ FIELD MANUAL + VACCINE ══ */}
      <div style={{ position: "relative", minHeight: "100vh", overflow: "hidden", padding: "100px 24px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,#060402 0%,#100500 50%,#060402 100%)" }} />
        <SporeField count={18} color="rgba(200,70,20,0.36)" />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 1000, width: "100%" }}>
          <ScrollReveal>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <div style={{ fontSize: 9, letterSpacing: 7, color: "rgba(212,168,83,0.27)", marginBottom: 10 }}>FIELD MANUAL · THREAT CLASSIFICATION</div>
              <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: "clamp(22px,4vw,44px)", color: "#D4A853", letterSpacing: 3 }}>Stages of Infection</h2>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, color: "rgba(212,168,83,0.4)", marginTop: 10, fontStyle: "italic" }}>Every hour that passes changes the threat.</div>
            </div>
          </ScrollReveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 0, position: "relative" }}>
            <div style={{ position: "absolute", top: 44, left: "12.5%", right: "12.5%", height: 1, background: "linear-gradient(90deg,#FF6B35,#4A0000)", zIndex: 0, opacity: 0.5 }} />
            {[
              { stage: "Runner", hours: "0–48 Hours", color: "#FF6B35", symbol: "I", desc: "Fully mobile, erratic aggression. Partial consciousness remains. The most unpredictable." },
              { stage: "Stalker", hours: "2 Weeks–1 Year", color: "#CC4400", symbol: "II", desc: "Sight fading. Fungal plates forming. Begins ambushing rather than charging." },
              { stage: "Clicker", hours: "1–10 Years", color: "#8B0000", symbol: "III", desc: "Fully blind. Echolocates via clicks. Armored skull. Lethal at close range." },
              { stage: "Bloater", hours: "10+ Years", color: "#4A0000", symbol: "IV", desc: "Fungal mass overwhelms host. Throws acid pods. Near-invulnerable." },
            ].map((s, i) => (
              <ScrollReveal key={s.stage} delay={i * 150}>
                <div style={{ padding: "0 14px", position: "relative", zIndex: 1, textAlign: "center" }} onMouseEnter={() => SFX.play("hover")}>
                  <div style={{ width: 88, height: 88, borderRadius: "50%", border: `2px solid ${s.color}`, background: `radial-gradient(circle,${s.color}18 0%,transparent 70%)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: `0 0 28px ${s.color}30`, fontFamily: "'Cinzel',serif", fontSize: 24, color: s.color, transition: "box-shadow 0.3s,transform 0.3s", cursor: "default" }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 0 48px ${s.color}65`; e.currentTarget.style.transform = "scale(1.07)"; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 0 28px ${s.color}30`; e.currentTarget.style.transform = "scale(1)"; }}>
                    {s.symbol}
                  </div>
                  <div style={{ fontSize: 12, fontFamily: "'Cinzel',serif", color: s.color, letterSpacing: 2, marginBottom: 6 }}>{s.stage.toUpperCase()}</div>
                  <div style={{ fontSize: 9, letterSpacing: 2, color: `${s.color}70`, marginBottom: 10 }}>{s.hours}</div>
                  <div style={{ fontSize: 12, fontFamily: "'Playfair Display',serif", color: "rgba(220,190,140,0.52)", lineHeight: 1.8 }}>{s.desc}</div>
                  <div style={{ marginTop: 14, height: 2, background: `linear-gradient(90deg,${s.color}70,transparent)`, borderRadius: 2 }} />
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Vaccine bar */}
          <ScrollReveal delay={350}>
            <div style={{ marginTop: 64, padding: "22px 28px", border: "1px solid rgba(79,195,247,0.18)", background: "rgba(79,195,247,0.025)", display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 8, letterSpacing: 4, color: "rgba(79,195,247,0.45)", marginBottom: 5 }}>PROJECT SERAPHIM</div>
                <div style={{ fontSize: 16, fontFamily: "'Cinzel',serif", color: "#60C8E8" }}>Vaccine Development</div>
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, marginBottom: 6 }}>
                  <span style={{ color: "rgba(255,255,255,0.24)" }}>PHASE II TRIALS</span>
                  <span style={{ color: "#81C784" }}>34%</span>
                </div>
                <div style={{ height: 5, background: "rgba(255,255,255,0.07)" }}>
                  <div style={{ width: "34%", height: "100%", background: "linear-gradient(90deg,#0288D1,#81C784)", animation: "fadeIn 2s ease" }} />
                </div>
              </div>
              <div style={{ fontSize: 11, fontFamily: "'Playfair Display',serif", color: "rgba(79,195,247,0.36)", fontStyle: "italic" }}>Firefly Lab · Location: Classified</div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* ══ CONFIDENTIAL DOC SECTION ══ */}
      <div style={{ position: "relative", minHeight: "100vh", overflow: "hidden", padding: "60px 24px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 100% 90% at 50% 50%,#0e0904 0%,#060402 100%)" }} />
        <div style={{ position: "absolute", top: 20, left: 20, width: 48, height: 48, zIndex: 1, borderTop: "1px solid rgba(212,168,83,0.18)", borderLeft: "1px solid rgba(212,168,83,0.18)" }} />
        <div style={{ position: "absolute", top: 20, right: 20, width: 48, height: 48, zIndex: 1, borderTop: "1px solid rgba(212,168,83,0.18)", borderRight: "1px solid rgba(212,168,83,0.18)" }} />
        <div style={{ position: "absolute", bottom: 20, left: 20, width: 48, height: 48, zIndex: 1, borderBottom: "1px solid rgba(212,168,83,0.18)", borderLeft: "1px solid rgba(212,168,83,0.18)" }} />
        <div style={{ position: "absolute", bottom: 20, right: 20, width: 48, height: 48, zIndex: 1, borderBottom: "1px solid rgba(212,168,83,0.18)", borderRight: "1px solid rgba(212,168,83,0.18)" }} />
        <div style={{ position: "relative", zIndex: 2, width: "100%", textAlign: "center" }}>
          <ScrollReveal>
            <div style={{ marginBottom: 36 }}>
              <div style={{ fontSize: 9, letterSpacing: 7, color: "rgba(212,168,83,0.27)", marginBottom: 10 }}>TERMINAL ACCESS REQUIRED</div>
              <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: "clamp(22px,4vw,40px)", color: "#D4A853", letterSpacing: 3, marginBottom: 8 }}>{"Identify & Align"}</h2>
              <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, color: "rgba(212,168,83,0.43)", fontStyle: "italic" }}>A classified document has been left here. Examine it.</p>
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

/* ═══════════════════════════════════════════════
   SURVIVOR LOGBOOK — terminal-style shared notes
═══════════════════════════════════════════════ */
function SurvivorLogbook({ username, onClose }) {
  const [entries, setEntries] = useState([]);
  const [draft, setDraft] = useState("");
  const [tag, setTag] = useState("sighting");
  const [loaded, setLoaded] = useState(false);
  const [posting, setPosting] = useState(false);
  const scrollRef = useRef();

  // Load from shared storage
  useEffect(() => {
    const load = async () => {
      try {
        const res = await window.storage.get("survivor_logbook", true);
        if (res) setEntries(JSON.parse(res.value));
      } catch(e) { setEntries([]); }
      setLoaded(true);
    };
    load();
  }, []);

  const post = async () => {
    if (!draft.trim()) return;
    setPosting(true);
    SFX.play("confirm");
    const now = new Date();
    const entry = {
      id: Date.now(),
      author: username,
      text: draft.trim(),
      tag,
      time: now.toLocaleString("en-US", { month:"short", day:"2-digit", hour:"2-digit", minute:"2-digit", hour12:false }),
    };
    const next = [entry, ...entries].slice(0, 40);
    setEntries(next);
    setDraft("");
    try { await window.storage.set("survivor_logbook", JSON.stringify(next), true); } catch(e) {}
    setPosting(false);
    setTimeout(() => scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" }), 100);
  };

  const TAG_COLORS = { sighting:"#FF6B35", safe:"#81C784", cache:"#FFD54F", route:"#60C8E8", warning:"#FF4444" };
  const TAG_ICONS  = { sighting:"👁", safe:"🛡", cache:"📦", route:"🗺", warning:"⚠" };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.88)", animation:"fadeIn 0.2s ease" }}>
      <div style={{ width:"min(760px,95vw)", height:"min(600px,90vh)", background:"#0a0702", border:"1px solid #6B4C1E", display:"flex", flexDirection:"column", position:"relative", boxShadow:"0 0 80px rgba(212,168,83,0.12), 0 0 0 1px rgba(212,168,83,0.06)" }}>
        {/* Terminal header */}
        <div style={{ background:"#140d04", borderBottom:"1px solid #6B4C1E44", padding:"10px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:"#D4A853", boxShadow:"0 0 8px #D4A853" }}/>
            <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:11, color:"#D4A85390", letterSpacing:3 }}>SURVIVOR LOGBOOK</span>
            <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:"#D4A85340", letterSpacing:2, border:"1px solid #D4A85325", padding:"1px 6px" }}>SHARED · COMMUNITY</span>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"1px solid #6B4C1E", color:"#D4A85380", cursor:"pointer", fontSize:12, width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Share Tech Mono',monospace" }}
            onMouseEnter={e=>{ e.currentTarget.style.background="#D4A85315"; e.currentTarget.style.color="#D4A853"; }}
            onMouseLeave={e=>{ e.currentTarget.style.background="none"; e.currentTarget.style.color="#D4A85380"; }}>✕</button>
        </div>

        {/* Scan-line effect */}
        <div style={{ position:"absolute", inset:0, background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.06) 2px,rgba(0,0,0,0.06) 4px)", pointerEvents:"none", zIndex:1 }}/>

        <div style={{ display:"flex", flex:1, minHeight:0, position:"relative", zIndex:2 }}>
          {/* LEFT — entry list */}
          <div ref={scrollRef} style={{ flex:1, overflowY:"auto", padding:"12px 14px", display:"flex", flexDirection:"column", gap:8, borderRight:"1px solid #6B4C1E22" }}>
            {!loaded && <div style={{ color:"#D4A85340", fontFamily:"'Share Tech Mono',monospace", fontSize:9, letterSpacing:2, padding:10 }}>LOADING LOGBOOK...</div>}
            {loaded && entries.length === 0 && (
              <div style={{ color:"#D4A85330", fontFamily:"'Special Elite',cursive", fontSize:13, padding:"20px 10px", lineHeight:2, textAlign:"center" }}>
                <div style={{ fontSize:24, marginBottom:10, opacity:0.4 }}>📖</div>
                No entries yet. Be the first to post a clue for other survivors.
              </div>
            )}
            {entries.map((e, i) => (
              <div key={e.id} style={{ padding:"10px 12px", border:`1px solid ${TAG_COLORS[e.tag]}22`, background:`${TAG_COLORS[e.tag]}06`, animation: i===0 ? "fadeIn 0.4s ease" : "none" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                  <span style={{ fontSize:10 }}>{TAG_ICONS[e.tag]}</span>
                  <span style={{ fontSize:8, letterSpacing:2, color:TAG_COLORS[e.tag], fontFamily:"'Share Tech Mono',monospace", border:`1px solid ${TAG_COLORS[e.tag]}40`, padding:"1px 5px" }}>{e.tag.toUpperCase()}</span>
                  <span style={{ fontSize:8, color:"#D4A85340", fontFamily:"'Share Tech Mono',monospace", marginLeft:"auto" }}>{e.time}</span>
                </div>
                <div style={{ fontSize:11.5, fontFamily:"'Special Elite',cursive", color:"rgba(220,200,155,0.88)", lineHeight:1.7 }}>{e.text}</div>
                <div style={{ fontSize:8, color:"#D4A85335", fontFamily:"'Share Tech Mono',monospace", marginTop:5 }}>— {e.author}</div>
              </div>
            ))}
          </div>

          {/* RIGHT — compose panel */}
          <div style={{ width:220, padding:"14px 12px", display:"flex", flexDirection:"column", gap:10, flexShrink:0 }}>
            <div style={{ fontSize:8, letterSpacing:3, color:"#D4A85550", fontFamily:"'Share Tech Mono',monospace", marginBottom:2 }}>NEW ENTRY</div>

            {/* Tag selector */}
            <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
              <div style={{ fontSize:7.5, color:"#D4A85540", fontFamily:"'Share Tech Mono',monospace", letterSpacing:2 }}>CATEGORY</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                {Object.entries(TAG_ICONS).map(([t, icon]) => (
                  <button key={t} onClick={() => { setTag(t); SFX.play("click"); }}
                    style={{ padding:"3px 7px", fontSize:8, fontFamily:"'Share Tech Mono',monospace", cursor:"pointer", letterSpacing:1, transition:"all 0.15s",
                      background: tag===t ? `${TAG_COLORS[t]}18` : "transparent",
                      border: `1px solid ${tag===t ? TAG_COLORS[t] : `${TAG_COLORS[t]}30`}`,
                      color: tag===t ? TAG_COLORS[t] : `${TAG_COLORS[t]}60` }}>
                    {icon} {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Text area */}
            <textarea
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => e.key==="Enter" && e.ctrlKey && post()}
              placeholder="Write your clue here... Describe what you saw, where it is safe, or where danger lurks."
              style={{ flex:1, minHeight:120, background:"rgba(212,168,83,0.04)", border:"1px solid #6B4C1E55", color:"rgba(220,195,140,0.9)", fontFamily:"'Special Elite',cursive", fontSize:11.5, padding:"10px", outline:"none", resize:"none", lineHeight:1.6 }}
              onFocus={e => { e.target.style.borderColor="#D4A85370"; SFX.play("click"); }}
              onBlur={e => e.target.style.borderColor="#6B4C1E55"}
            />

            <div style={{ fontSize:7.5, color:"#D4A85325", fontFamily:"'Share Tech Mono',monospace", letterSpacing:1 }}>CTRL+ENTER to post</div>

            <button onClick={post} disabled={!draft.trim() || posting}
              style={{ padding:"10px", background: draft.trim() ? "rgba(212,168,83,0.1)" : "transparent",
                border:`1px solid ${draft.trim() ? "#D4A853" : "#6B4C1E44"}`,
                color: draft.trim() ? "#D4A853" : "#6B4C1E66",
                fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:3, cursor: draft.trim() ? "pointer" : "not-allowed",
                transition:"all 0.2s" }}
              onMouseEnter={e => { if(draft.trim()){ e.currentTarget.style.background="rgba(212,168,83,0.18)"; SFX.play("hover"); }}}
              onMouseLeave={e => { e.currentTarget.style.background="rgba(212,168,83,0.1)"; }}>
              {posting ? "POSTING..." : "POST ENTRY ▸"}
            </button>

            <div style={{ marginTop:"auto", padding:"8px", border:"1px solid #6B4C1E22", background:"rgba(212,168,83,0.03)" }}>
              <div style={{ fontSize:7.5, color:"#D4A85540", fontFamily:"'Share Tech Mono',monospace", letterSpacing:1, marginBottom:4 }}>YOUR CALLSIGN</div>
              <div style={{ fontSize:10, color:"#D4A853", fontFamily:"'Special Elite',cursive" }}>{username}</div>
              <div style={{ fontSize:7, color:"#D4A85330", fontFamily:"'Share Tech Mono',monospace", marginTop:2 }}>{entries.filter(e=>e.author===username).length} entries posted</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   FIREFLY ARCADE — bases with minigames & ops log
═══════════════════════════════════════════════ */
function FireflyArcade({ username, onClose }) {
  const [tab, setTab] = useState("arcade"); // "arcade" | "log"
  const [game, setGame] = useState(null);   // null | "cipher" | "runner"
  const [logEntries, setLogEntries] = useState([]);
  const [logDraft, setLogDraft] = useState("");
  const [logTag, setLogTag] = useState("mission");
  const [logLoaded, setLogLoaded] = useState(false);
  const fc = "#C8D840";

  const FF_BASES = [
    { id:"b1", name:"Uni Hill Safehouse", code:"FF-ALPHA", status:"ACTIVE", district:"University Hill", icon:"🎓", clearance:"OPS-1" },
    { id:"b2", name:"Med Row Underground", code:"FF-BETA", status:"ACTIVE", district:"Medical Row", icon:"💊", clearance:"OPS-2" },
    { id:"b3", name:"Quarter Arcade", code:"FF-GAMMA", status:"SECURED", district:"Firefly Quarter", icon:"✦", clearance:"ALL" },
  ];

  useEffect(() => {
    if (tab !== "log") return;
    const load = async () => {
      try {
        const res = await window.storage.get("firefly_ops_log", true);
        if (res) setLogEntries(JSON.parse(res.value));
      } catch(e) { setLogEntries([]); }
      setLogLoaded(true);
    };
    load();
  }, [tab]);

  const postLog = async () => {
    if (!logDraft.trim()) return;
    SFX.play("confirm");
    const now = new Date();
    const entry = { id:Date.now(), author:username, text:logDraft.trim(), tag:logTag,
      time:now.toLocaleString("en-US",{month:"short",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:false}) };
    const next = [entry, ...logEntries].slice(0, 40);
    setLogEntries(next);
    setLogDraft("");
    try { await window.storage.set("firefly_ops_log", JSON.stringify(next), true); } catch(e) {}
  };

  const TAG_COLORS = { mission:"#C8D840", intel:"#60C8E8", threat:"#FF6B35", asset:"#81C784", classified:"#FF4444" };

  // ── Cipher Minigame ──
  function CipherGame({ onWin }) {
    const WORDS = ["CICADA","CORDYCEPS","LOOKFORTHELIGHT","ELYSIUM","VACCINE","RUNNERS","FREEDOM"];
    const [word] = useState(() => WORDS[Math.floor(Math.random()*WORDS.length)]);
    const [guessed, setGuessed] = useState(new Set());
    const [wrong, setWrong] = useState(0);
    const MAX_WRONG = 6;
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const won = word.split("").every(c => guessed.has(c));
    const lost = wrong >= MAX_WRONG;
    useEffect(() => { if (won) { SFX.play("unlock"); setTimeout(onWin, 800); } }, [won]);

    const guess = (l) => {
      if (guessed.has(l) || won || lost) return;
      SFX.play("click");
      const ng = new Set(guessed); ng.add(l); setGuessed(ng);
      if (!word.includes(l)) setWrong(w => w+1);
    };

    return (
      <div style={{ padding:"20px", fontFamily:"'Share Tech Mono',monospace" }}>
        <div style={{ fontSize:9, letterSpacing:3, color:`${fc}50`, marginBottom:16, textAlign:"center" }}>CIPHER PROTOCOL — HANGMAN</div>
        <div style={{ display:"flex", justifyContent:"center", gap:6, marginBottom:20, flexWrap:"wrap" }}>
          {word.split("").map((c, i) => (
            <div key={i} style={{ width:22, height:26, borderBottom:`2px solid ${fc}60`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, color:fc, fontWeight:"bold" }}>
              {guessed.has(c) ? c : " "}
            </div>
          ))}
        </div>
        <div style={{ textAlign:"center", marginBottom:16, fontSize:10, color:wrong>=MAX_WRONG?"#FF4444":"#FFD54F" }}>
          {lost ? "SIGNAL LOST — TOO MANY ERRORS" : won ? "✓ CIPHER CRACKED" : `ERRORS: ${wrong}/${MAX_WRONG}`}
        </div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:4, justifyContent:"center" }}>
          {letters.split("").map(l => {
            const used = guessed.has(l);
            const correct = used && word.includes(l);
            const miss = used && !word.includes(l);
            return <button key={l} onClick={() => guess(l)} disabled={used || won || lost}
              style={{ width:26, height:26, fontSize:10, cursor:used?"not-allowed":"pointer", fontFamily:"'Share Tech Mono',monospace",
                background: correct?`${fc}20`:miss?"rgba(255,50,50,0.1)":"rgba(200,216,64,0.05)",
                border:`1px solid ${correct?fc:miss?"rgba(255,50,50,0.3)":`${fc}25`}`,
                color: correct?fc:miss?"rgba(255,80,80,0.4)":`${fc}70` }}>{l}</button>;
          })}
        </div>
        {(won||lost) && <button onClick={() => { SFX.play("select"); setGame(null); }} style={{ marginTop:16, padding:"8px 20px", background:`${fc}10`, border:`1px solid ${fc}`, color:fc, cursor:"pointer", fontFamily:"'Share Tech Mono',monospace", fontSize:9, letterSpacing:2, display:"block", margin:"16px auto 0" }}>← BACK</button>}
      </div>
    );
  }

  // ── Runner Dodge Minigame ──
  function RunnerGame({ onWin }) {
    const [px, setPx] = useState(3);
    const [runners, setRunners] = useState([]);
    const [score, setScore] = useState(0);
    const [alive, setAlive] = useState(true);
    const [won, setWon] = useState(false);
    const COLS = 7, WIN_SCORE = 20;
    const interval = useRef(null);
    const pxRef = useRef(3);
    pxRef.current = px;

    useEffect(() => {
      const h = (e) => {
        if (!alive) return;
        if (e.key === "ArrowLeft" || e.key === "a") setPx(p => Math.max(0, p-1));
        if (e.key === "ArrowRight" || e.key === "d") setPx(p => Math.min(COLS-1, p+1));
      };
      window.addEventListener("keydown", h);
      return () => window.removeEventListener("keydown", h);
    }, [alive]);

    useEffect(() => {
      if (!alive || won) return;
      interval.current = setInterval(() => {
        setRunners(prev => {
          const moved = prev.map(r => ({...r, y: r.y+1})).filter(r => r.y < 8);
          const hit = moved.some(r => r.y === 7 && r.x === pxRef.current);
          if (hit) { clearInterval(interval.current); SFX.play("error"); setAlive(false); return prev; }
          if (Math.random() < 0.55) moved.push({ x: Math.floor(Math.random()*COLS), y:0, id:Date.now() });
          setScore(s => {
            if (s+1 >= WIN_SCORE) { clearInterval(interval.current); SFX.play("unlock"); setWon(true); setTimeout(onWin, 600); }
            return s+1;
          });
          return moved;
        });
      }, 220);
      return () => clearInterval(interval.current);
    }, [alive, won]);

    const grid = Array.from({ length:8 }, (_, y) => Array.from({ length:COLS }, (_, x) => {
      if (y === 7 && x === pxRef.current) return "player";
      const r = runners.find(r => r.x===x && r.y===y);
      return r ? "runner" : "empty";
    }));

    return (
      <div style={{ padding:"16px", fontFamily:"'Share Tech Mono',monospace", textAlign:"center" }}>
        <div style={{ fontSize:9, letterSpacing:3, color:`${fc}50`, marginBottom:8 }}>RUNNER ESCAPE — USE ← → KEYS</div>
        <div style={{ fontSize:9, color:`${fc}70`, marginBottom:12 }}>SCORE: {score} / {WIN_SCORE} {won?"✓ ESCAPED!":!alive?"✗ CAUGHT":""}</div>
        <div style={{ display:"inline-flex", flexDirection:"column", gap:2, marginBottom:12 }}>
          {grid.map((row, y) => (
            <div key={y} style={{ display:"flex", gap:2 }}>
              {row.map((cell, x) => (
                <div key={x} style={{ width:24, height:18, background:
                  cell==="player"?`${fc}30`:cell==="runner"?"rgba(255,50,50,0.3)":"rgba(200,216,64,0.04)",
                  border:`1px solid ${cell==="player"?fc:cell==="runner"?"#FF3333":`${fc}18`}`,
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:9 }}>
                  {cell==="player"?"▲":cell==="runner"?"✕":""}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
          <button onMouseDown={() => setPx(p=>Math.max(0,p-1))} style={{ padding:"6px 16px", background:`${fc}10`, border:`1px solid ${fc}50`, color:fc, cursor:"pointer", fontFamily:"'Share Tech Mono',monospace", fontSize:12 }}>◀</button>
          <button onMouseDown={() => setPx(p=>Math.min(COLS-1,p+1))} style={{ padding:"6px 16px", background:`${fc}10`, border:`1px solid ${fc}50`, color:fc, cursor:"pointer", fontFamily:"'Share Tech Mono',monospace", fontSize:12 }}>▶</button>
        </div>
        {(!alive||won) && <button onClick={() => { SFX.play("select"); setGame(null); }} style={{ marginTop:12, padding:"7px 18px", background:`${fc}10`, border:`1px solid ${fc}`, color:fc, cursor:"pointer", fontFamily:"'Share Tech Mono',monospace", fontSize:9, letterSpacing:2 }}>← BACK</button>}
      </div>
    );
  }

  return (
    <div style={{ position:"fixed", inset:0, zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.9)", animation:"fadeIn 0.2s ease" }}>
      <div style={{ width:"min(820px,96vw)", height:"min(620px,92vh)", background:"#060900", border:`1px solid ${fc}30`, display:"flex", flexDirection:"column", boxShadow:`0 0 80px ${fc}12, 0 0 0 1px ${fc}08` }}>
        {/* Header */}
        <div style={{ background:"#0a0d00", borderBottom:`1px solid ${fc}22`, padding:"10px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:fc, boxShadow:`0 0 8px ${fc}` }}/>
            <span style={{ fontFamily:"'Oswald',sans-serif", fontSize:13, color:`${fc}90`, letterSpacing:3 }}>FIREFLY OPERATIONS</span>
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            {["arcade","log"].map(t => (
              <button key={t} onClick={() => { setTab(t); setGame(null); SFX.play("select"); }}
                style={{ padding:"4px 14px", background:tab===t?`${fc}15`:"transparent", border:`1px solid ${tab===t?fc:`${fc}25`}`, color:tab===t?fc:`${fc}45`, fontFamily:"'Share Tech Mono',monospace", fontSize:9, letterSpacing:2, cursor:"pointer" }}>
                {t === "arcade" ? "🎮 ARCADE" : "📋 OPS LOG"}
              </button>
            ))}
            <button onClick={onClose} style={{ background:"none", border:`1px solid ${fc}30`, color:`${fc}60`, cursor:"pointer", width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontFamily:"'Share Tech Mono',monospace" }}
              onMouseEnter={e=>{ e.currentTarget.style.background=`${fc}15`; e.currentTarget.style.color=fc; }}
              onMouseLeave={e=>{ e.currentTarget.style.background="none"; e.currentTarget.style.color=`${fc}60`; }}>✕</button>
          </div>
        </div>

        {tab === "arcade" && !game && (
          <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
            {/* Bases list */}
            <div style={{ width:220, borderRight:`1px solid ${fc}18`, padding:"14px", display:"flex", flexDirection:"column", gap:8, flexShrink:0 }}>
              <div style={{ fontSize:8, letterSpacing:3, color:`${fc}40`, fontFamily:"'Share Tech Mono',monospace", marginBottom:4 }}>FIREFLY BASES</div>
              {FF_BASES.map(b => (
                <div key={b.id} style={{ padding:"10px", border:`1px solid ${fc}20`, background:`${fc}05`, cursor:"default" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:5 }}>
                    <span style={{ fontSize:14 }}>{b.icon}</span>
                    <div>
                      <div style={{ fontSize:9, color:fc, fontFamily:"'Share Tech Mono',monospace", fontWeight:"bold" }}>{b.name}</div>
                      <div style={{ fontSize:7.5, color:`${fc}50`, fontFamily:"'Share Tech Mono',monospace", letterSpacing:1 }}>{b.code}</div>
                    </div>
                  </div>
                  <div style={{ fontSize:7.5, color:`${fc}60`, fontFamily:"'Share Tech Mono',monospace", marginBottom:3 }}>📍 {b.district}</div>
                  <div style={{ display:"inline-block", fontSize:7, letterSpacing:1, color:"#81C784", border:"1px solid #81C78430", padding:"1px 5px", fontFamily:"'Share Tech Mono',monospace" }}>● {b.status}</div>
                </div>
              ))}
            </div>

            {/* Games panel */}
            <div style={{ flex:1, padding:"20px", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16 }}>
              <div style={{ textAlign:"center", marginBottom:8 }}>
                <div style={{ fontSize:9, letterSpacing:4, color:`${fc}40`, fontFamily:"'Share Tech Mono',monospace", marginBottom:8 }}>QUARTER ARCADE · FF-GAMMA</div>
                <div style={{ fontSize:22, fontFamily:"'Oswald',sans-serif", color:fc, letterSpacing:2, marginBottom:4 }}>FIREFLY ARCADE</div>
                <div style={{ fontSize:11, color:`${fc}55`, fontFamily:"'Share Tech Mono',monospace" }}>Training games for active operatives</div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, width:"100%", maxWidth:380 }}>
                {[
                  { id:"cipher", title:"CIPHER PROTOCOL", desc:"Crack the encrypted word before signal loss. Hangman for operatives.", icon:"🔐", diff:"EASY" },
                  { id:"runner", title:"RUNNER ESCAPE", desc:"Navigate through a runner swarm. Arrow keys to dodge.", icon:"🏃", diff:"MEDIUM" },
                ].map(g => (
                  <button key={g.id} onClick={() => { setGame(g.id); SFX.play("select"); }}
                    style={{ padding:"18px 14px", background:`${fc}07`, border:`1px solid ${fc}30`, cursor:"pointer", textAlign:"left", transition:"all 0.2s" }}
                    onMouseEnter={e=>{ e.currentTarget.style.background=`${fc}14`; e.currentTarget.style.borderColor=fc; SFX.play("hover"); }}
                    onMouseLeave={e=>{ e.currentTarget.style.background=`${fc}07`; e.currentTarget.style.borderColor=`${fc}30`; }}>
                    <div style={{ fontSize:22, marginBottom:8 }}>{g.icon}</div>
                    <div style={{ fontSize:10, color:fc, fontFamily:"'Share Tech Mono',monospace", fontWeight:"bold", marginBottom:4 }}>{g.title}</div>
                    <div style={{ fontSize:8.5, color:`${fc}60`, fontFamily:"'Share Tech Mono',monospace", lineHeight:1.5, marginBottom:8 }}>{g.desc}</div>
                    <div style={{ fontSize:7.5, color:`${fc}80`, fontFamily:"'Share Tech Mono',monospace", letterSpacing:2, border:`1px solid ${fc}30`, padding:"2px 6px", display:"inline-block" }}>DIFF: {g.diff}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "arcade" && game === "cipher" && <CipherGame onWin={() => { SFX.play("confirm"); setGame(null); }}/>}
        {tab === "arcade" && game === "runner" && <RunnerGame onWin={() => { SFX.play("confirm"); setGame(null); }}/>}

        {tab === "log" && (
          <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
            {/* Log feed */}
            <div style={{ flex:1, overflowY:"auto", padding:"12px", display:"flex", flexDirection:"column", gap:7, borderRight:`1px solid ${fc}15` }}>
              {!logLoaded && <div style={{ color:`${fc}30`, fontFamily:"'Share Tech Mono',monospace", fontSize:9, padding:10 }}>LOADING OPS LOG...</div>}
              {logLoaded && logEntries.length === 0 && <div style={{ color:`${fc}25`, fontFamily:"'Oswald',sans-serif", fontSize:13, padding:20, textAlign:"center" }}>No ops logged yet. Post your first intel.</div>}
              {logEntries.map((e, i) => (
                <div key={e.id} style={{ padding:"9px 11px", border:`1px solid ${TAG_COLORS[e.tag]}20`, background:`${TAG_COLORS[e.tag]}05`, animation:i===0?"fadeIn 0.35s ease":"none" }}>
                  <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:5 }}>
                    <span style={{ fontSize:8, letterSpacing:2, color:TAG_COLORS[e.tag], border:`1px solid ${TAG_COLORS[e.tag]}35`, padding:"1px 5px", fontFamily:"'Share Tech Mono',monospace" }}>{e.tag.toUpperCase()}</span>
                    <span style={{ fontSize:7.5, color:`${fc}35`, fontFamily:"'Share Tech Mono',monospace", marginLeft:"auto" }}>{e.time} · {e.author}</span>
                  </div>
                  <div style={{ fontSize:11, fontFamily:"'Oswald',sans-serif", color:`${fc}88`, lineHeight:1.6 }}>{e.text}</div>
                </div>
              ))}
            </div>
            {/* Compose */}
            <div style={{ width:210, padding:"12px", display:"flex", flexDirection:"column", gap:8, flexShrink:0 }}>
              <div style={{ fontSize:8, letterSpacing:3, color:`${fc}40`, fontFamily:"'Share Tech Mono',monospace" }}>NEW INTEL</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:3 }}>
                {Object.entries(TAG_COLORS).map(([t, col]) => (
                  <button key={t} onClick={() => { setLogTag(t); SFX.play("click"); }}
                    style={{ padding:"2px 6px", fontSize:7.5, cursor:"pointer", fontFamily:"'Share Tech Mono',monospace", letterSpacing:1, background:logTag===t?`${col}15`:"transparent", border:`1px solid ${logTag===t?col:`${col}30`}`, color:logTag===t?col:`${col}55` }}>{t}</button>
                ))}
              </div>
              <textarea value={logDraft} onChange={e => setLogDraft(e.target.value)}
                placeholder="Report field intel, missions, threats..."
                style={{ flex:1, minHeight:100, background:`${fc}04`, border:`1px solid ${fc}25`, color:`${fc}88`, fontFamily:"'Share Tech Mono',monospace", fontSize:10, padding:8, outline:"none", resize:"none", lineHeight:1.5 }}
                onFocus={e => { e.target.style.borderColor=`${fc}60`; SFX.play("click"); }}
                onBlur={e => e.target.style.borderColor=`${fc}25`}/>
              <button onClick={postLog} disabled={!logDraft.trim()}
                style={{ padding:9, background:logDraft.trim()?`${fc}10`:"transparent", border:`1px solid ${logDraft.trim()?fc:`${fc}20`}`, color:logDraft.trim()?fc:`${fc}30`, fontFamily:"'Share Tech Mono',monospace", fontSize:9, letterSpacing:2, cursor:logDraft.trim()?"pointer":"not-allowed" }}
                onMouseEnter={e=>{if(logDraft.trim()){e.currentTarget.style.background=`${fc}20`;SFX.play("hover");}}}
                onMouseLeave={e=>{e.currentTarget.style.background=logDraft.trim()?`${fc}10`:"transparent";}}>
                FILE INTEL ▸
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MILITARY BRIEFING — top-secret infographic + ops schedule
═══════════════════════════════════════════════ */
function MilitaryBriefing({ username, onClose }) {
  const [unlocked, setUnlocked] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [codeErr, setCodeErr] = useState(false);
  const [blink, setBlink] = useState(true);
  const fc = "#60C8E8";
  const SECRET = "FEDRA-0451";

  useEffect(() => {
    const t = setInterval(() => setBlink(b => !b), 600);
    return () => clearInterval(t);
  }, []);

  const verify = () => {
    if (codeInput.trim().toUpperCase() === SECRET) {
      SFX.play("unlock"); setUnlocked(true);
    } else {
      SFX.play("error"); setCodeErr(true); setCodeInput("");
      setTimeout(() => setCodeErr(false), 2000);
    }
  };

  const SCHEDULE = [
    { time:"00:00–04:00", op:"SILENT WATCH", zone:"QZ-Alpha perimeter", status:"ONGOING", level:"STANDARD", icon:"🌙" },
    { time:"04:00–06:00", op:"DAWN SWEEP", zone:"Harbor District → Industrial Belt", status:"ACTIVE", level:"ELEVATED", icon:"🔦" },
    { time:"06:00–09:00", op:"CHECKPOINT DRILL", zone:"Border Checkpoint", status:"COMPLETED", level:"STANDARD", icon:"✓" },
    { time:"09:00–12:00", op:"QZ INTEGRITY SCAN", zone:"All QZ perimeters", status:"ACTIVE", level:"STANDARD", icon:"📡" },
    { time:"12:00–15:00", op:"FIREFLY SUPPRESSION", zone:"University Hill sector", status:"CLASSIFIED", level:"LETHAL AUTH", icon:"🔴" },
    { time:"15:00–18:00", op:"SUPPLY CONVOY", zone:"Green Zone ↔ Airport", status:"SCHEDULED", level:"STANDARD", icon:"🚛" },
    { time:"18:00–21:00", op:"HUNTER PATROL", zone:"Eastern Slums", status:"SCHEDULED", level:"ELEVATED", icon:"⚡" },
    { time:"21:00–24:00", op:"LOCKDOWN PROTOCOL", zone:"Downtown Core quarantine", status:"ON STANDBY", level:"EXTREME", icon:"🔒" },
  ];

  const THREAT_MATRIX = [
    { type:"CLICKER DENSITY", downtown:92, harbor:18, slums:74, industrial:45 },
    { type:"FIREFLY ACTIVITY", downtown:34, harbor:8, slums:12, industrial:28 },
    { type:"QZ BREACH RISK", downtown:88, harbor:22, slums:66, industrial:40 },
    { type:"PATROL COVERAGE", downtown:42, harbor:95, slums:38, industrial:62 },
  ];

  const LEVEL_COLORS = { "STANDARD":"#60C8E8", "ELEVATED":"#FFD54F", "LETHAL AUTH":"#FF6B35", "EXTREME":"#FF4444", "CLASSIFIED":"#CE93D8" };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.92)", animation:"fadeIn 0.2s ease" }}>
      <div style={{ width:"min(900px,97vw)", height:"min(640px,93vh)", background:"#010810", border:`1px solid ${fc}25`, display:"flex", flexDirection:"column", boxShadow:`0 0 80px ${fc}10` }}>
        {/* Header */}
        <div style={{ background:"#021020", borderBottom:`1px solid ${fc}22`, padding:"10px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:fc, boxShadow:`0 0 8px ${fc}` }}/>
            <span style={{ fontFamily:"'Oswald',sans-serif", fontSize:13, color:`${fc}90`, letterSpacing:3 }}>FEDRA OPERATIONS BRIEF</span>
            <span style={{ fontSize:8, color:"#FF444480", border:"1px solid #FF444430", padding:"1px 6px", fontFamily:"'Share Tech Mono',monospace", letterSpacing:2 }}>TOP SECRET</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ fontSize:9, color:`${fc}50`, fontFamily:"'Share Tech Mono',monospace" }}>{username.toUpperCase()} · CLEARANCE L4</div>
            <button onClick={onClose} style={{ background:"none", border:`1px solid ${fc}30`, color:`${fc}60`, cursor:"pointer", width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontFamily:"'Share Tech Mono',monospace" }}
              onMouseEnter={e=>{ e.currentTarget.style.background=`${fc}15`; e.currentTarget.style.color=fc; }}
              onMouseLeave={e=>{ e.currentTarget.style.background="none"; e.currentTarget.style.color=`${fc}60`; }}>✕</button>
          </div>
        </div>

        {/* Lock screen */}
        {!unlocked && (
          <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:20 }}>
            <div style={{ width:80, height:80, border:`2px solid ${fc}40`, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, animation:"pulseGold 2s infinite", color:fc }}>◈</div>
            <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:20, color:fc, letterSpacing:4 }}>LEVEL 4 CLEARANCE REQUIRED</div>
            <div style={{ fontSize:11, color:`${fc}50`, fontFamily:"'Share Tech Mono',monospace" }}>Enter FEDRA operational clearance code</div>
            <div style={{ display:"flex", gap:8 }}>
              <input value={codeInput} onChange={e => { setCodeInput(e.target.value); setCodeErr(false); }}
                onKeyDown={e => e.key==="Enter" && verify()}
                type="password" placeholder="CLEARANCE CODE..."
                style={{ padding:"10px 16px", background:"rgba(96,200,232,0.06)", border:`1px solid ${codeErr?"#FF4444":`${fc}40`}`, color:fc, fontFamily:"'Share Tech Mono',monospace", fontSize:12, outline:"none", width:240, letterSpacing:3, animation:codeErr?"shake 0.4s ease":"none" }}
                onFocus={e => SFX.play("click")}/>
              <button onClick={verify} style={{ padding:"10px 20px", background:`${fc}10`, border:`1px solid ${fc}`, color:fc, cursor:"pointer", fontFamily:"'Share Tech Mono',monospace", fontSize:10, letterSpacing:2 }}>VERIFY ▸</button>
            </div>
            {codeErr && <div style={{ fontSize:9, color:"#FF4444", fontFamily:"'Share Tech Mono',monospace", letterSpacing:2 }}>⚠ ACCESS DENIED — INCORRECT CODE</div>}
            <div style={{ fontSize:8, color:`${fc}28`, fontFamily:"'Share Tech Mono',monospace" }}>HINT: Standard FEDRA protocol + unit 0451</div>
          </div>
        )}

        {/* Classified content */}
        {unlocked && (
          <div style={{ flex:1, display:"grid", gridTemplateColumns:"1fr 280px", overflow:"hidden" }}>
            {/* LEFT — schedule */}
            <div style={{ overflowY:"auto", padding:"14px", borderRight:`1px solid ${fc}15` }}>
              <div style={{ fontSize:8, letterSpacing:4, color:`${fc}40`, fontFamily:"'Share Tech Mono',monospace", marginBottom:12 }}>◈ DAILY OPERATIONS SCHEDULE — NEW ELYSIUM</div>
              <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                {SCHEDULE.map((s, i) => {
                  const lc = LEVEL_COLORS[s.level] || fc;
                  return (
                    <div key={i} style={{ display:"grid", gridTemplateColumns:"100px 1fr 80px", gap:8, padding:"8px 10px", border:`1px solid ${fc}12`, background:`${fc}04`, alignItems:"center", animation:`cardEntrance 0.4s ease ${i*0.04}s both` }}>
                      <div>
                        <div style={{ fontSize:8, color:`${fc}60`, fontFamily:"'Share Tech Mono',monospace" }}>{s.time}</div>
                        <div style={{ fontSize:11, color:`${fc}`, fontFamily:"'Share Tech Mono',monospace", fontWeight:"bold", marginTop:2 }}>{s.icon} {s.op}</div>
                      </div>
                      <div style={{ fontSize:9, color:`${fc}70`, fontFamily:"'Share Tech Mono',monospace" }}>{s.zone}</div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontSize:7, color:lc, border:`1px solid ${lc}30`, padding:"1px 5px", fontFamily:"'Share Tech Mono',monospace", letterSpacing:1, marginBottom:2, display:"inline-block" }}>{s.level}</div>
                        <div style={{ fontSize:7.5, color:s.status==="ACTIVE"||s.status==="ONGOING"?"#81C784":s.status==="COMPLETED"?`${fc}50`:s.status==="CLASSIFIED"?"#CE93D8":"#FFD54F", fontFamily:"'Share Tech Mono',monospace" }}>{s.status}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT — threat matrix + codes */}
            <div style={{ padding:"14px", display:"flex", flexDirection:"column", gap:12, overflowY:"auto" }}>
              {/* Threat matrix */}
              <div>
                <div style={{ fontSize:8, letterSpacing:3, color:`${fc}40`, fontFamily:"'Share Tech Mono',monospace", marginBottom:8 }}>THREAT MATRIX</div>
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  {THREAT_MATRIX.map((tm, i) => (
                    <div key={i} style={{ padding:"8px", border:`1px solid ${fc}12`, background:`${fc}03` }}>
                      <div style={{ fontSize:7.5, color:`${fc}60`, fontFamily:"'Share Tech Mono',monospace", marginBottom:5, letterSpacing:1 }}>{tm.type}</div>
                      {[["Downtown",tm.downtown,"#FF4444"],["Harbor",tm.harbor,fc],["Slums",tm.slums,"#FF6B35"],["Industrial",tm.industrial,"#FFD54F"]].map(([n,v,c]) => (
                        <div key={n} style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
                          <span style={{ fontSize:7.5, color:`${fc}45`, fontFamily:"'Share Tech Mono',monospace", width:56 }}>{n}</span>
                          <div style={{ flex:1, height:3, background:"rgba(255,255,255,0.05)" }}>
                            <div style={{ width:`${v}%`, height:"100%", background:c, opacity:0.8 }}/>
                          </div>
                          <span style={{ fontSize:7.5, color:c, fontFamily:"'Share Tech Mono',monospace", width:24, textAlign:"right" }}>{v}%</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Classified comm codes */}
              <div style={{ padding:"10px", border:"1px solid #CE93D825", background:"rgba(206,147,216,0.04)" }}>
                <div style={{ fontSize:7.5, letterSpacing:3, color:"#CE93D880", fontFamily:"'Share Tech Mono',monospace", marginBottom:8 }}>CLASSIFIED COMM CODES</div>
                {[
                  { code:"ECHO-7", meaning:"Firefly contact — lethal force authorized" },
                  { code:"SIERRA-4", meaning:"QZ lockdown initiated — seal all gates" },
                  { code:"TANGO-9", meaning:"Clicker swarm — evacuate sector immediately" },
                  { code:"ALPHA-1", meaning:"Commander override — all units respond" },
                ].map((c, i) => (
                  <div key={i} style={{ display:"flex", gap:8, marginBottom:5, padding:"4px 0", borderBottom:"1px solid rgba(206,147,216,0.08)" }}>
                    <span style={{ fontSize:9, color:"#CE93D8", fontFamily:"'Share Tech Mono',monospace", fontWeight:"bold", width:70, flexShrink:0 }}>{c.code}</span>
                    <span style={{ fontSize:8.5, color:`${fc}55`, fontFamily:"'Share Tech Mono',monospace" }}>{c.meaning}</span>
                  </div>
                ))}
              </div>

              {/* Status */}
              <div style={{ padding:"8px 10px", border:`1px solid ${fc}15`, background:`${fc}05`, marginTop:"auto" }}>
                <div style={{ fontSize:7.5, color:`${fc}40`, fontFamily:"'Share Tech Mono',monospace", marginBottom:4, letterSpacing:2 }}>ACTIVE DUTY</div>
                <div style={{ fontSize:11, color:fc, fontFamily:"'Oswald',sans-serif", letterSpacing:1 }}>{username.toUpperCase()}</div>
                <div style={{ fontSize:7.5, color:`${fc}50`, fontFamily:"'Share Tech Mono',monospace", marginTop:2 }}>CLEARANCE L4 · ON DUTY</div>
                <div style={{ display:"flex", gap:4, marginTop:6 }}>
                  {["GREEN ZONE","HARBOR","CHECKPOINT"].map(z => (
                    <span key={z} style={{ fontSize:7, color:"#81C784", border:"1px solid #81C78430", padding:"1px 4px", fontFamily:"'Share Tech Mono',monospace" }}>{z}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CommandCenter({ faction, username, onLogout }) {
  const f = FACTIONS[faction];
  const [selZone, setSelZone] = useState(DISTRICTS[0]);
  const [infData, setInfData] = useState(() => genHistory(DISTRICTS[0].infLvl));
  const [resData, setResData] = useState(() => genResources(DISTRICTS[0].id));
  const [listen, setListen] = useState(false);
  const [health] = useState(0.7 + Math.random() * 0.22);
  const [risk] = useState(Math.random() * 0.4);
  const [inv, setInv] = useState(() =>
    ["Medkits","Ammo","Rags","Alcohol","Trading Cards"].map((r,i) => ({
      name:r, icon:["🩹","🔫","🧣","🍶","🃏"][i], qty: 6+Math.floor(Math.random()*14)
    }))
  );
  // Resources deplete over time — random item drops every ~10s
  useEffect(() => {
    const iv = setInterval(() => {
      setInv(prev => prev.map(item =>
        Math.random() < 0.4 ? {...item, qty: Math.max(0, item.qty - 1)} : item
      ));
    }, 10000);
    return () => clearInterval(iv);
  }, []);
  const [clock, setClock] = useState(new Date());
  const [showLogbook, setShowLogbook] = useState(false);
  const [showArcade, setShowArcade] = useState(false);
  const [showBrief, setShowBrief] = useState(false);

  // Live system log feed
  const LOG_POOL = [
    { m:"QZ-Alpha perimeter sensor triggered — investigating", l:"warn" },
    { m:"AP-077 sync heartbeat confirmed", l:"info" },
    { m:`Infection spike: ${DISTRICTS[Math.floor(Math.random()*DISTRICTS.length)].short} +${Math.floor(Math.random()*15+3)}%`, l:"critical" },
    { m:"Resource drone inbound — ETA 8 min", l:"info" },
    { m:`Runner cluster: ${3+Math.floor(Math.random()*12)} units spotted near Harbor`, l:"warn" },
    { m:"Firefly signal intercepted — Uni Hill sector", l:"warn" },
    { m:"Clicker echolocation pattern: Downtown Core", l:"critical" },
    { m:"AP-034 Green HQ uplink restored", l:"info" },
    { m:"QZ-Bravo gate malfunction — manual override", l:"warn" },
    { m:"Bloater signature confirmed — Old Quarter", l:"critical" },
    { m:"Med supply drop: QZ-Charlie received", l:"info" },
    { m:"FEDRA patrol route deviation detected", l:"warn" },
    { m:`Infection pressure rising: ${DISTRICTS[Math.floor(Math.random()*DISTRICTS.length)].short}`, l:"critical" },
    { m:"Network node AP-108 offline — node failure", l:"warn" },
    { m:"Survivor convoy: 3 vehicles — inbound north", l:"info" },
    { m:"Spore density elevated — Industrial Belt", l:"warn" },
    { m:"AP-023 Harbor Gate accessed by unknown party", l:"critical" },
    { m:"QZ wall integrity scan: nominal", l:"info" },
    { m:"Clicker migration pattern shift — east corridor", l:"warn" },
    { m:"Vaccine trial data uplinked from Firefly Lab", l:"info" },
  ];
  const [sysLog, setSysLog] = useState(()=>{
    const now = new Date();
    return Array.from({length:7},(_,i)=>{
      const t = new Date(now - (7-i)*3*60000);
      const entry = LOG_POOL[Math.floor(Math.random()*LOG_POOL.length)];
      return { id:i, t:t.toLocaleTimeString("en-US",{hour12:false,hour:"2-digit",minute:"2-digit"}), ...entry };
    });
  });
  const logIdRef = useRef(100);

  // Append new log entry every 5–12 seconds
  useEffect(()=>{
    let timer;
    const addLog=()=>{
      const entry = LOG_POOL[Math.floor(Math.random()*LOG_POOL.length)];
      const now = new Date();
      // Refresh infection message dynamically
      const msg = entry.m.includes("Infection spike") || entry.m.includes("Infection pressure")
        ? `${entry.m.split(":")[0]}: ${DISTRICTS[Math.floor(Math.random()*DISTRICTS.length)].short} +${Math.floor(Math.random()*15+3)}%`
        : entry.m;
      setSysLog(prev=>[
        {id:logIdRef.current++, t:now.toLocaleTimeString("en-US",{hour12:false,hour:"2-digit",minute:"2-digit"}), m:msg, l:entry.l, fresh:true},
        ...prev.slice(0,9)
      ]);
      timer = setTimeout(addLog, 5000+Math.random()*7000);
    };
    timer = setTimeout(addLog, 5000+Math.random()*7000);
    return ()=>clearTimeout(timer);
  },[]);

  // Live forecast refresh every 2s
  useEffect(() => {
    const iv = setInterval(() => {
      setInfData(prev => {
        const last = prev[prev.length - 1]?.value ?? selZone.infLvl;
        const next = [...prev.slice(1), { day: `D${prev.length + 1}`, value: Math.max(0.05, Math.min(0.99, last + (Math.random() - 0.47) * 0.06)) }];
        return next;
      });
    }, 2000);
    return () => clearInterval(iv);
  }, [selZone]);

  useEffect(() => { const t = setInterval(() => setClock(new Date()), 1000); return () => clearInterval(t); }, []);

  const handleZone = (id) => {
    const z = DISTRICTS.find(d => d.id === id);
    setSelZone(z);
    setInfData(genHistory(z.infLvl));
    setResData(genResources(z.id));
    SFX.play("click");
  };

  const riskColor = risk < 0.2 ? "#81C784" : risk < 0.5 ? "#FFD54F" : "#FF4444";
  const riskLabel = risk < 0.2 ? "LOW" : risk < 0.5 ? "MEDIUM" : "CRITICAL";
  const territory = { military: 35, firefly: 22, infected: 43 };

  const objective = {
    survivor: "LOCATE nearest safe Arcade Point. Avoid infected zones.",
    firefly: "CONNECT rebel zones. Liberate occupied territories.",
    fedra: "PATROL FEDRA outposts. Maintain quarantine protocols.",
  }[faction];

  const factionIntelItems = {
    survivor: [
      { label: "NEAREST SAFE POINTS", color: "#81C784", items: ["AP-077: City Hall — 0.8km", "AP-034: Green Zone — 2.1km", "AP-108: North Gate — 3.4km"], warn: "⚠ AVOID Old Quarter. Critical clicker density." },
    ],
    firefly: [
      { label: "REBEL ZONES", color: "#C8D840", items: ["FF Quarter — ACTIVE OPS", "Uni Hill — SECURED", "Med Row — ACTIVE"], warn: "⚡ Connect FF Quarter→Uni Hill. Priority order." },
    ],
    fedra: [
      { label: "PATROL ROUTES", color: "#60C8E8", items: ["Green Zone→Harbor: CLEAR", "Harbor→Power Stn: PATROL", "Checkpoint: HIGH ALERT"], warn: "⚠ Firefly activity Uni Hill. Lethal force auth." },
    ],
  }[faction];

  return (
    <div style={{ width: "100vw", height: "100vh", background: f.bg, color: f.color, fontFamily: f.monoFont, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <style>{G}</style>
      <style>{`
        * { scrollbar-width:thin; scrollbar-color:${f.border} transparent; }
        select option { background:${f.bg}; color:${f.color}; }
        .cc-panel { overflow-y:auto; }
        .cc-panel::-webkit-scrollbar { width:3px; }
        .cc-panel::-webkit-scrollbar-thumb { background:${f.border}; }
        @keyframes logSlideIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
      {/* Faction-specific modal overlays */}
      {showLogbook && faction==="survivor" && <SurvivorLogbook username={username} onClose={()=>setShowLogbook(false)}/>}
      {showArcade  && faction==="firefly"  && <FireflyArcade  username={username} onClose={()=>setShowArcade(false)}/>}
      {showBrief   && faction==="fedra"    && <MilitaryBriefing username={username} onClose={()=>setShowBrief(false)}/>}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.055) 3px,rgba(0,0,0,0.055) 4px)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100vh" }}>
        {/* ── TOP BAR ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", padding: "7px 16px", borderBottom: `1px solid ${f.border}`, background: `${f.secondary}ee`, gap: 8, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 14, letterSpacing: 3, color: f.color }}>{f.icon} THE TURNING POINT</div>
            <div style={{ padding: "2px 9px", border: `1px solid ${f.color}80`, fontSize: 8, letterSpacing: 3, color: f.color, background: `${f.color}12` }}>{f.tag}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ fontSize: 10, color: `${f.color}70`, fontFamily: "'Share Tech Mono',monospace" }}>{clock.toLocaleTimeString("en-US", { hour12: false })}</div>
            <div style={{ fontSize: 10, color: `${f.color}55` }}>{username.toUpperCase()}</div>
            <button onClick={() => { setListen(l => !l); SFX.play("select"); }}
              style={{ padding: "3px 10px", background: listen ? `${f.color}20` : "transparent", border: `1px solid ${listen ? f.color : `${f.color}35`}`, color: listen ? f.color : `${f.color}55`, fontSize: 8, letterSpacing: 2, cursor: "pointer", fontFamily: f.monoFont, transition: "all 0.2s", animation: listen ? "pulseGold 2s infinite" : "none" }}>
              {listen ? "● LISTEN: ON" : "○ LISTEN"}
            </button>
            <button onClick={() => { SFX.play("click"); onLogout(); }}
              style={{ padding: "3px 10px", background: "transparent", border: "1px solid rgba(255,50,50,0.35)", color: "rgba(255,80,80,0.7)", fontSize: 8, letterSpacing: 2, cursor: "pointer", fontFamily: "'Share Tech Mono',monospace" }}>DISCONNECT</button>
          </div>
        </div>
        {/* Objective bar */}
        <div style={{ padding: "4px 16px", background: `${f.color}09`, borderBottom: `1px solid ${f.border}`, fontSize: 9, letterSpacing: 3, color: `${f.color}80`, flexShrink: 0 }}>▸ {objective}</div>

        {/* ── MAIN GRID ── */}
        <div style={{ display: "grid", gridTemplateColumns: "190px 1fr 190px", gap: 7, padding: 7, flex: 1, minHeight: 0, overflow: "hidden" }}>

          {/* LEFT PANEL */}
          <div className="cc-panel" style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {/* Biometric */}
            <div style={{ border: `1px solid ${f.border}`, padding: 11, background: `${f.secondary}88`, flexShrink: 0 }}>
              <div style={{ fontSize: 8.5, letterSpacing: 3, color: `${f.color}52`, marginBottom: 10 }}>▸ BIOMETRIC STATUS</div>
              {[{ l: "HEALTH", v: health, c: "#81C784", g: "#388E3C,#81C784", t: `${Math.round(health * 100)}%` },
              { l: "INFECTION RISK", v: risk, c: riskColor, g: `${riskColor}70,${riskColor}`, t: riskLabel }].map(b => (
                <div key={b.l} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, marginBottom: 3 }}>
                    <span style={{ color: `${f.color}70` }}>{b.l}</span><span style={{ color: b.c }}>{b.t}</span>
                  </div>
                  <div style={{ height: 4, background: "rgba(255,255,255,0.07)" }}><div style={{ width: `${b.v * 100}%`, height: "100%", background: `linear-gradient(90deg,${b.g})` }} /></div>
                </div>
              ))}
            </div>
            {/* Territory */}
            <div style={{ border: `1px solid ${f.border}`, padding: 11, background: `${f.secondary}88`, flexShrink: 0 }}>
              <div style={{ fontSize: 8.5, letterSpacing: 3, color: `${f.color}52`, marginBottom: 10 }}>▸ TERRITORY CONTROL</div>
              {[{ l: "MILITARY", v: 35, c: "#60C8E8" }, { l: "FIREFLIES", v: 22, c: "#C8D840" }, { l: "INFECTED", v: 43, c: "#FF4444" }].map(t => (
                <div key={t.l} style={{ marginBottom: 7 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, marginBottom: 3 }}>
                    <span style={{ color: `${t.c}88` }}>{t.l}</span><span style={{ color: t.c }}>{t.v}%</span>
                  </div>
                  <div style={{ height: 3, background: "rgba(255,255,255,0.07)" }}><div style={{ width: `${t.v}%`, height: "100%", background: t.c, opacity: 0.65 }} /></div>
                </div>
              ))}
            </div>
            {/* Inventory */}
            <div style={{ border: `1px solid ${f.border}`, padding: 11, background: `${f.secondary}88`, flex: 1 }}>
              <div style={{ fontSize: 8.5, letterSpacing: 3, color: `${f.color}52`, marginBottom: 10 }}>▸ INVENTORY</div>
              {inv.map(r => (
                <div key={r.name} style={{
                  display:"flex", alignItems:"center", justifyContent:"space-between",
                  marginBottom:5, padding:"4px 7px", transition:"all 0.5s",
                  border:`1px solid ${r.qty===0?"#FF444455":r.qty<3?"#FFD54F44":f.border+"44"}`,
                  background:r.qty===0?"rgba(60,0,0,0.35)":r.qty<3?"rgba(50,35,0,0.3)":`${f.color}04`
                }}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontSize:12,opacity:r.qty===0?0.25:1}}>{r.icon}</span>
                    <span style={{fontSize:8.5,opacity:r.qty===0?0.4:1,textDecoration:r.qty===0?"line-through":"none"}}>{r.name.toUpperCase()}</span>
                  </div>
                  <span style={{fontSize:r.qty===0?8:10,letterSpacing:r.qty===0?1:0,
                    color:r.qty===0?"#FF4444":r.qty<3?"#FFD54F":f.color,
                    animation:r.qty===0?"routePulse 1.2s infinite":"none"}}>
                    {r.qty===0?"DEPLETED":`x${r.qty}`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* CENTER PANEL — MAP + ANALYTICS */}
          <div style={{ display: "flex", flexDirection: "column", gap: 7, minHeight: 0 }}>
            {/* Map box */}
            <div style={{ border: `1px solid ${f.border}`, flex: "1 1 0", minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{ padding: "5px 12px", background: f.secondary, borderBottom: `1px solid ${f.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
                <div style={{ fontSize: 8.5, letterSpacing: 3, color: `${f.color}70` }}>▸ NEW ELYSIUM · TACTICAL MAP · LIVE</div>
                <div style={{ fontSize: 8, color: `${f.color}45` }}>DRAG · SCROLL ZOOM</div>
              </div>
              <div style={{ flex: 1, minHeight: 0 }}>
                <TacticalMap faction={faction} listenMode={listen} />
              </div>
            </div>
            {/* Zone analytics */}
            <div style={{ border: `1px solid ${f.border}`, padding: 11, background: `${f.secondary}88`, flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 6 }}>
                <div style={{ fontSize: 8.5, letterSpacing: 3, color: `${f.color}52` }}>▸ ZONE ANALYTICS <span style={{ color: `${f.color}35`, fontSize: 7 }}>— AUTO-REFRESH 2s</span></div>
                <select value={selZone.id} onChange={e => handleZone(e.target.value)}
                  style={{ padding: "4px 9px", background: f.bg, border: `1px solid ${f.border}`, color: f.color, fontFamily: "'Share Tech Mono',monospace", fontSize: 8.5, outline: "none" }}>
                  {DISTRICTS.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name}{d.fedraBase&&faction!=="fedra"?" ⬡ RESTRICTED":""}{d.fireflyBase&&faction==="survivor"?" ✦ UNKNOWN":""}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 7.5, letterSpacing: 2, color: `${f.color}45`, marginBottom: 4 }}>CHART A · INFECTION FORECAST</div>
                  <LineChart data={infData} color={selZone.infLvl > 0.6 ? "#FF4444" : "#FFD54F"} />
                  <div style={{ fontSize: 7.5, color: "rgba(255,255,255,0.2)", marginTop: 2 }}>
                    AVG {Math.round(infData.reduce((s, d) => s + d.value, 0) / infData.length * 100)}% · {infData[infData.length - 1]?.value > infData[0]?.value ? "▲ RISING" : "▼ DECLINING"}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 7.5, letterSpacing: 2, color: `${f.color}45`, marginBottom: 4 }}>CHART B · RESOURCE SCARCITY</div>
                  <DonutChart data={resData} />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="cc-panel" style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {/* Faction Intel */}
            <div style={{ border: `1px solid ${f.border}`, padding: 11, background: `${f.secondary}88`, flexShrink: 0 }}>
              <div style={{ fontSize: 8.5, letterSpacing: 3, color: `${f.color}52`, marginBottom: 10 }}>▸ FACTION INTEL</div>
              {factionIntelItems.map((item, i) => (
                <div key={i}>
                  <div style={{ color: item.color, fontSize: 8.5, letterSpacing: 2, marginBottom: 6 }}>{item.label}:</div>
                  {item.items.map((it, j) => <div key={j} style={{ fontSize: 9.5, color: `${f.color}80`, fontFamily: f.monoFont, marginBottom: 4, paddingLeft: 8 }}>{it}</div>)}
                  {item.warn && <div style={{ marginTop: 8, padding: "6px 8px", border: `1px solid ${f.border}`, fontSize: 9, color: "rgba(255,255,255,0.32)", lineHeight: 1.6 }}>{item.warn}</div>}
                </div>
              ))}
            </div>
            {/* Arcade Points */}
            <div style={{ border: `1px solid ${f.border}`, padding: 11, background: `${f.secondary}88`, flexShrink: 0 }}>
              <div style={{ fontSize: 8.5, letterSpacing: 3, color: `${f.color}52`, marginBottom: 10 }}>▸ ARCADE POINTS</div>
              {ARCADE_PTS.filter(ap => ap.faction === "public" || ap.faction === "survivor" || (ap.faction === "firefly" && (faction === "firefly" || faction === "fedra")) || (ap.faction === "fedra" && faction === "fedra")).slice(0, 6).map(ap => (
                <div key={ap.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5, padding: "4px 7px", border: `1px solid ${f.border}55`, background: `${f.color}04`, transition: "background 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${f.color}10`; SFX.play("hover"); }}
                  onMouseLeave={e => e.currentTarget.style.background = `${f.color}04`}>
                  <div style={{ fontSize: 8.5 }}>{ap.name}</div>
                  <div style={{ fontSize: 7.5, padding: "1px 5px", color: ap.status === "active" ? "#81C784" : ap.status === "damaged" ? "#FFD54F" : "#FF4444", border: `1px solid ${ap.status === "active" ? "#81C78428" : ap.status === "damaged" ? "#FFD54F28" : "#FF444428"}` }}>
                    {ap.status.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
            {/* Faction Special Action */}
            <div style={{ border:`1px solid ${f.border}`, padding:11, background:`${f.secondary}88`, flexShrink:0 }}>
              <div style={{ fontSize:8.5, letterSpacing:3, color:`${f.color}52`, marginBottom:10 }}>
                {faction==="survivor"?"▸ SURVIVAL TOOLS":faction==="firefly"?"▸ FIREFLY HQ":faction==="fedra"?"▸ FEDRA COMMAND":"▸ TOOLS"}
              </div>
              {faction==="survivor" && (
                <button onClick={()=>{ setShowLogbook(true); SFX.play("select"); }}
                  style={{ width:"100%", padding:"11px 10px", background:"rgba(212,168,83,0.07)", border:"1px solid #D4A85340", color:"#D4A853", fontFamily:"'Special Elite',cursive", fontSize:12, cursor:"pointer", letterSpacing:1, display:"flex", alignItems:"center", gap:8, transition:"all 0.2s" }}
                  onMouseEnter={e=>{ e.currentTarget.style.background="rgba(212,168,83,0.16)"; e.currentTarget.style.borderColor="#D4A85390"; SFX.play("hover"); }}
                  onMouseLeave={e=>{ e.currentTarget.style.background="rgba(212,168,83,0.07)"; e.currentTarget.style.borderColor="#D4A85340"; }}>
                  <span style={{ fontSize:16 }}>📖</span>
                  <div style={{ textAlign:"left" }}>
                    <div style={{ fontSize:10, fontFamily:"'Special Elite',cursive", color:"#D4A853" }}>SURVIVOR LOGBOOK</div>
                    <div style={{ fontSize:7.5, fontFamily:"'Share Tech Mono',monospace", color:"#D4A85355", letterSpacing:1, marginTop:2 }}>LEAVE CLUES FOR OTHER SURVIVORS</div>
                  </div>
                </button>
              )}
              {faction==="firefly" && (
                <button onClick={()=>{ setShowArcade(true); SFX.play("select"); }}
                  style={{ width:"100%", padding:"11px 10px", background:"rgba(200,216,64,0.07)", border:"1px solid #C8D84040", color:"#C8D840", fontFamily:"'Oswald',sans-serif", fontSize:12, cursor:"pointer", letterSpacing:1, display:"flex", alignItems:"center", gap:8, transition:"all 0.2s" }}
                  onMouseEnter={e=>{ e.currentTarget.style.background="rgba(200,216,64,0.16)"; e.currentTarget.style.borderColor="#C8D84090"; SFX.play("hover"); }}
                  onMouseLeave={e=>{ e.currentTarget.style.background="rgba(200,216,64,0.07)"; e.currentTarget.style.borderColor="#C8D84040"; }}>
                  <span style={{ fontSize:16 }}>🎮</span>
                  <div style={{ textAlign:"left" }}>
                    <div style={{ fontSize:10, fontFamily:"'Oswald',sans-serif", color:"#C8D840" }}>FIREFLY OPERATIONS</div>
                    <div style={{ fontSize:7.5, fontFamily:"'Share Tech Mono',monospace", color:"#C8D84055", letterSpacing:1, marginTop:2 }}>ARCADE · OPS LOG · BASES</div>
                  </div>
                </button>
              )}
              {faction==="fedra" && (
                <button onClick={()=>{ setShowBrief(true); SFX.play("select"); }}
                  style={{ width:"100%", padding:"11px 10px", background:"rgba(96,200,232,0.07)", border:"1px solid #60C8E840", color:"#60C8E8", fontFamily:"'Oswald',sans-serif", fontSize:12, cursor:"pointer", letterSpacing:1, display:"flex", alignItems:"center", gap:8, transition:"all 0.2s" }}
                  onMouseEnter={e=>{ e.currentTarget.style.background="rgba(96,200,232,0.16)"; e.currentTarget.style.borderColor="#60C8E890"; SFX.play("hover"); }}
                  onMouseLeave={e=>{ e.currentTarget.style.background="rgba(96,200,232,0.07)"; e.currentTarget.style.borderColor="#60C8E840"; }}>
                  <span style={{ fontSize:16 }}>📋</span>
                  <div style={{ textAlign:"left" }}>
                    <div style={{ fontSize:10, fontFamily:"'Oswald',sans-serif", color:"#60C8E8" }}>OPERATIONS BRIEF</div>
                    <div style={{ fontSize:7.5, fontFamily:"'Share Tech Mono',monospace", color:"#60C8E855", letterSpacing:1, marginTop:2 }}>TOP SECRET · SCHEDULE · THREAT MATRIX</div>
                  </div>
                </button>
              )}
            </div>
            {/* System Log — LIVE FEED */}
            <div style={{ border: `1px solid ${f.border}`, padding: 11, background: `${f.secondary}88`, flex: 1, overflow:"hidden", display:"flex", flexDirection:"column" }}>
              <div style={{ fontSize: 8.5, letterSpacing: 3, color: `${f.color}52`, marginBottom: 10, display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
                <span>▸ SYSTEM LOG</span>
                <span style={{fontSize:7, color:`${f.color}30`, letterSpacing:1}}>● LIVE</span>
              </div>
              <div style={{flex:1, overflow:"hidden", display:"flex", flexDirection:"column", gap:0}}>
                {sysLog.slice(0,8).map((log, i) => (
                  <div key={log.id} style={{
                    fontSize: 8.5, padding: "3px 0", borderBottom: `1px solid ${f.border}22`,
                    display: "flex", gap: 6, alignItems:"flex-start",
                    animation: i===0 && log.fresh ? "logSlideIn 0.4s ease" : "none",
                    opacity: 1 - i*0.08,
                  }}>
                    <span style={{ color: `${f.color}32`, flexShrink: 0, fontSize:7.5 }}>{log.t}</span>
                    <span style={{
                      color: log.l === "critical" ? "#FF4444" : log.l === "warn" ? "#FFD54F" : `${f.color}65`,
                      lineHeight: 1.4,
                      borderLeft: log.l==="critical"?"2px solid #FF444455":log.l==="warn"?"2px solid #FFD54F44":"none",
                      paddingLeft: (log.l==="critical"||log.l==="warn") ? 4 : 0,
                    }}>{log.m}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════════ */
export default function App() {
  const [session, setSession] = useState(null);
  return session
    ? <CommandCenter faction={session.faction} username={session.username} onLogout={() => setSession(null)} />
    : <LandingPage onLogin={(faction, username) => setSession({ faction, username })} />;
}
