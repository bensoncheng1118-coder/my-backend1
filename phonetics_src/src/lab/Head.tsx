import { useEffect, useRef, useState } from "react";
import { useStore } from "../ui/store.ts";
import { engine } from "../audio/AudioEngine.ts";
import { sameBody } from "../ui/body.ts";
import { VoiceModel } from "../ui/analysis.ts";
import { useModel } from "../ui/useModel.ts";
import { buildProfile } from "../ui/render/profile.ts";
import { faceHandles, type HandleId } from "../ui/render/anatomy.ts";
import type { HumanArtic, HumanFrame, Vec } from "../wasm/types.ts";
import { useLab } from "./lab.ts";

/** the part of the head shown (body cm, y up) */
const BOX = { x0: -4.6, x1: 10.6, y0: -3.2, y1: 14.2 };
/** room around the head for the labels (cm) */
const PAD_L = 4.0, PAD_R = 3.4, PAD_T = 1.3;

const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));

/** the voice's articulation now (what the engine reports), else what the page asked for */
export function liveArtic(): HumanArtic {
  const st = useStore.getState();
  const tele = engine.latest && sameBody(engine.latest.body, st.body) ? engine.latest : null;
  return tele ? VoiceModel.articFromArray(tele.t.artic) : st.artic;
}

function path(pts: Vec[], close = false): string {
  if (!pts.length) return "";
  let d = `M${pts[0].x.toFixed(3)},${(-pts[0].y).toFixed(3)}`;
  for (let i = 1; i < pts.length; i++) d += `L${pts[i].x.toFixed(3)},${(-pts[i].y).toFixed(3)}`;
  return close ? d + "Z" : d;
}

/** a smooth path through the points (Catmull-Rom as cubic Béziers) */
function smooth(pts: Vec[], close = false): string {
  const n = pts.length;
  if (n < 3) return path(pts, close);
  const P = (i: number) => (close ? pts[(i + n) % n] : pts[clamp(i, 0, n - 1)]);
  let d = `M${pts[0].x.toFixed(3)},${(-pts[0].y).toFixed(3)}`;
  const last = close ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += `C${c1.x.toFixed(3)},${(-c1.y).toFixed(3)} ${c2.x.toFixed(3)},${(-c2.y).toFixed(3)} ${p2.x.toFixed(3)},${(-p2.y).toFixed(3)}`;
  }
  return close ? d + "Z" : d;
}

const mid = (pts: Vec[], t = 0.5): Vec => pts[clamp(Math.round((pts.length - 1) * t), 0, pts.length - 1)];
const centroid = (pts: Vec[]): Vec => {
  let x = 0, y = 0;
  for (const p of pts) (x += p.x), (y += p.y);
  return { x: x / pts.length, y: y / pts.length };
};

interface Label {
  text: string;
  zh: string;
  at: Vec;
  /** where the text sits (body cm) */
  tx: number;
  ty: number;
  anchor: "start" | "end" | "middle";
}

function labels(f: HumanFrame, G: ReturnType<typeof buildProfile>, a: HumanArtic, model: VoiceModel): Label[] {
  const pal = G.palOral;
  const velum = f.velum;
  const tongue = f.tongue;
  // the tongue root: its outline point furthest back and low
  let root = tongue[0];
  for (const p of tongue) if (p.x + 0.6 * p.y < root.x + 0.6 * root.y) root = p;
  const h = faceHandles(model, f, a);
  const jaw = h.find((x) => x.id === "jaw")!.pos;
  const lips = h.find((x) => x.id === "lips")!.pos;
  const front = pal.reduce((m, p) => (p.x > m.x ? p : m), pal[0]);
  const epi = f.epiglottis[1] ?? f.epiglottis[0];
  const uv = velum[velum.length - 1];
  // the back wall of the throat, halfway between the uvula and the epiglottis
  const wy = (uv.y + epi.y) / 2;
  const wall = G.outerWall.reduce((m, p) => (Math.abs(p.y - wy) < Math.abs(m.y - wy) ? p : m), G.outerWall[0]);
  const top = BOX.y1 + 0.55;
  const L = BOX.x0 - 0.35, R = BOX.x1 + 0.35;
  const side = (list: { text: string; zh: string; at: Vec; y: number }[], x: number, anchor: "start" | "end"): Label[] => {
    // keep the labels in their anchors' order, at least a line apart
    const s = list.slice().sort((p, q) => q.y - p.y);
    for (let i = 1; i < s.length; i++) if (s[i - 1].y - s[i].y < 0.95) s[i].y = s[i - 1].y - 0.95;
    return s.map((l) => ({ text: l.text, zh: l.zh, at: l.at, tx: x, ty: l.y, anchor }));
  };
  return [
    { text: "hard palate", zh: "硬顎", at: mid(pal, 0.4), tx: mid(pal, 0.4).x - 0.6, ty: top, anchor: "middle" },
    { text: "alveolar ridge", zh: "齒槽", at: front, tx: front.x + 2.4, ty: top, anchor: "middle" },
    ...side(
      [
        { text: "velum", zh: "軟顎", at: mid(velum, 0.3), y: mid(velum, 0.3).y + 1.2 },
        { text: "uvula", zh: "小舌", at: velum[velum.length - 1], y: velum[velum.length - 1].y },
        { text: "pharynx", zh: "咽", at: wall, y: wall.y },
        { text: "epiglottis", zh: "會厭", at: epi, y: epi.y },
        { text: "larynx", zh: "喉", at: { x: f.glottis.x, y: f.glottis.y + 0.6 }, y: f.glottis.y + 0.4 },
      ],
      L,
      "end",
    ),
    ...side(
      [
        { text: "nasal cavity", zh: "鼻腔", at: centroid(G.nasal), y: centroid(G.nasal).y + 0.8 },
        { text: "teeth", zh: "牙齒", at: mid(f.upperTeeth, 0.5), y: mid(f.upperTeeth, 0.5).y + 0.4 },
        { text: "lips", zh: "唇", at: lips, y: lips.y - 0.3 },
        { text: "jaw", zh: "下顎", at: jaw, y: jaw.y - 0.6 },
      ],
      R,
      "start",
    ),
    { text: "tongue body", zh: "舌體", at: f.tongueCenter, tx: f.tongueCenter.x, ty: f.tongueCenter.y - 1.3, anchor: "middle" },
    { text: "root", zh: "舌根", at: root, tx: root.x + 0.9, ty: root.y - 1.1, anchor: "start" },
  ];
}

const HANDLE_IDS: HandleId[] = ["tongue", "tip", "jaw", "lips", "velum", "larynx"];

export function Head() {
  const model = useModel();
  const svgRef = useRef<SVGSVGElement>(null);
  const [, setTick] = useState(0);
  const drag = useRef<{ id: HandleId; start: Vec; artic: HumanArtic } | null>(null);
  const [hover, setHover] = useState<HandleId | null>(null);
  const folds = useLab((s) => s.folds);
  const soundOn = useLab((s) => s.soundOn);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      setTick((t) => (t + 1) % 1e6);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const m = model.current;
  if (!m) return <div className="head" />;
  const a = liveArtic();
  const f = m.frame(a);
  const G = buildProfile(m, f, a);
  const handles = faceHandles(m, f, a).filter((h) => HANDLE_IDS.includes(h.id));
  const L = labels(f, G, a, m);

  const toBody = (e: React.PointerEvent): Vec => {
    const svg = svgRef.current!;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const q = pt.matrixTransform(svg.getScreenCTM()!.inverse());
    return { x: q.x, y: -q.y };
  };

  const pick = (p: Vec): HandleId | null => {
    let best: HandleId | null = null, bd = 0.9;
    for (const h of handles) {
      const d = Math.hypot(h.pos.x - p.x, h.pos.y - p.y);
      if (d < bd) (bd = d), (best = h.id);
    }
    return best;
  };

  const onDown = (e: React.PointerEvent) => {
    const p = toBody(e);
    const id = pick(p);
    if (!id) return;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    drag.current = { id, start: p, artic: { ...useStore.getState().artic } };
    e.preventDefault();
  };

  const onMove = (e: React.PointerEvent) => {
    const p = toBody(e);
    const d = drag.current;
    if (!d) {
      const id = pick(p);
      if (id !== hover) setHover(id);
      return;
    }
    const t = m.tract;
    const k = t.scale;
    const dx = (p.x - d.start.x) / k, dy = (p.y - d.start.y) / k;
    const set = useStore.getState().setArtic;
    const a0 = d.artic;
    switch (d.id) {
      case "tongue": {
        const q = t.unP(p.x, p.y);
        set({ tbX: q.x, tbY: q.y });
        break;
      }
      case "tip": {
        const q = t.unP(p.x, p.y);
        set({ ttX: q.x, ttY: q.y }, false);
        break;
      }
      case "jaw":
        set({ jaw: clamp(a0.jaw - dy, -0.1, 2.6) });
        break;
      case "lips":
        set({ lipAp: clamp(a0.lipAp - dy * 1.2, -0.4, 2.4), lipProt: clamp(a0.lipProt + dx, -0.2, 1.5) });
        break;
      case "velum":
        set({ velum: clamp(a0.velum - dy * 0.9, 0, 1.4) });
        break;
      case "larynx":
        set({ larynx: clamp(a0.larynx + dy, -1.6, 1.6) });
        break;
    }
    // the header then names whatever vowel the tract now makes
    if (useLab.getState().selected) useLab.setState({ selected: null });
  };

  const onUp = (e: React.PointerEvent) => {
    if (drag.current) (e.currentTarget as Element).releasePointerCapture?.(e.pointerId);
    drag.current = null;
  };

  const vb = `${BOX.x0 - PAD_L} ${-BOX.y1 - PAD_T} ${BOX.x1 - BOX.x0 + PAD_L + PAD_R} ${BOX.y1 - BOX.y0 + PAD_T}`;
  const tongue = smooth(f.tongue, true);
  const foldLabel = folds === "closed" ? "closed" : folds;
  const playing = soundOn && folds !== "closed";
  return (
    <div className="head">
      <svg
        ref={svgRef}
        viewBox={vb}
        preserveAspectRatio="xMidYMid meet"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        data-hover={hover ?? undefined}
        role="img"
        aria-label="聲道正中矢狀切面。拖曳任一圓點：舌體、舌尖、下顎、嘴唇、軟顎、喉。"
      >
        <defs>
          <clipPath id="head-clip">
            <rect x={BOX.x0} y={-BOX.y1} width={BOX.x1 - BOX.x0} height={BOX.y1 - BOX.y0} />
          </clipPath>
        </defs>
        <rect className="panel" x={BOX.x0} y={-BOX.y1} width={BOX.x1 - BOX.x0} height={BOX.y1 - BOX.y0} />
        <g clipPath="url(#head-clip)">
          {/* the head: skin, the nasal cavity, palate, the throat's back wall */}
          <path className="tissue" d={smooth(G.skinUpper) + " " + smooth(G.skinLower)} />
          <path className="nasal" d={smooth(G.nasal, true)} />
          {G.turbinates.map((tb, i) => (
            <path key={i} className="faint" d={smooth(tb)} />
          ))}
          <path className="line" d={smooth(G.palOral)} />
          <path className="faint" d={smooth(G.palNasal)} />
          <path className="line" d={smooth(G.outerWall)} />
          <path className="faint" d={smooth(f.inner)} />
          {G.vertebrae.map((v, i) => (
            <path key={i} className="bone" d={path(v, true)} />
          ))}
          {G.trachea.map((tr, i) => (
            <path key={i} className="line" d={smooth(tr)} />
          ))}
          <path className="faint" d={smooth(G.thyroid)} />
          <path className="faint" d={smooth(G.hyoid)} />
          <path className="line" d={smooth(G.glottisWall)} />
          {G.folds.map((fo, i) => (
            <path key={i} className={`fold ${playing ? "on" : ""}`} d={smooth(fo)} />
          ))}
          <path className="line thick" d={smooth(f.epiglottis.slice(0, 3))} />
          {/* articulators */}
          <path className="tongue" d={tongue} />
          <path className="jaw" d={smooth(G.jawLower)} />
          <path className="teeth" d={path(f.upperTeeth, true)} />
          <path className="teeth" d={path(G.lowerTeeth)} />
          <path className="lip" d={smooth(f.upperLip)} />
          <path className="lip" d={smooth(f.lowerLip)} />
          <path className="velum" d={smooth(f.velum)} />
        </g>
        {/* labels with leader lines */}
        {L.map((l) => (
          <g key={l.text} className="label">
            <line x1={l.tx + (l.anchor === "end" ? 0.15 : l.anchor === "start" ? -0.15 : 0)} y1={-l.ty + (l.anchor === "middle" ? (l.ty > BOX.y1 ? 0.2 : -0.55) : -0.15)} x2={l.at.x} y2={-l.at.y} />
            <text x={l.tx} y={-l.ty} textAnchor={l.anchor}>
              {l.text}
              <tspan className="zh"> {l.zh}</tspan>
            </text>
          </g>
        ))}
        {handles.map((h) => (
          <circle key={h.id} className={`handle ${hover === h.id || drag.current?.id === h.id ? "hot" : ""}`} cx={h.pos.x} cy={-h.pos.y} r={h.id === "tongue" ? 0.32 : 0.26} />
        ))}
        <g className="fold-tag" transform={`translate(${f.glottis.x + 1.0},${-f.glottis.y + 0.2})`}>
          <rect x={0} y={-0.55} width={3.8} height={1.0} rx={0.08} />
          <path d={playing ? "M0.25,-0.05 q0.15,-0.35 0.3,0 t0.3,0 t0.3,0" : "M0.25,-0.05 h0.9"} />
          <text x={1.35} y={0.17}>
            {foldLabel}
          </text>
        </g>
      </svg>
    </div>
  );
}
