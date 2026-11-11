import { useEffect, useRef, useState } from "react";
import { useStore } from "../ui/store.ts";
import { useModel } from "../ui/useModel.ts";
import type { VoiceModel } from "../ui/analysis.ts";
import type { HumanArtic } from "../wasm/types.ts";
import { liveArtic } from "./Head.tsx";
import { sayVowel, useLab } from "./lab.ts";
import { ANCHORS, VOWEL_SYMS, vowelSym, type VowelSym } from "./phonetics.ts";

// chart geometry (SVG units): the trapezoid's top runs X0..X0+W, its bottom is shifted by S
const X0 = 16, Y0 = 10, W = 100, H = 62, S = 46;
const VB = "0 0 128 80";

const pos = (b: number, h: number) => ({ x: X0 + h * S + b * (W - h * S), y: Y0 + h * H });
const unpos = (x: number, y: number) => {
  const h = Math.max(0, Math.min(1, (y - Y0) / H));
  const b = Math.max(0, Math.min(1, (x - X0 - h * S) / (W - h * S)));
  return { b, h };
};

interface Anchor {
  b: number;
  h: number;
  l1: number;
  l2: number;
}

function anchors(m: VoiceModel): Anchor[] {
  const out: Anchor[] = [];
  for (const ipa of ANCHORS) {
    const s = vowelSym(ipa), v = m.vowels.find((x) => x.ipa === ipa);
    if (s && v) out.push({ b: s.b, h: s.h, l1: Math.log(v.F1), l2: Math.log(v.F2) });
  }
  return out;
}

/** chart position → (F1, F2): inverse-distance blend of the anchors */
function toFormants(an: Anchor[], b: number, h: number): { F1: number; F2: number } {
  let s1 = 0, s2 = 0, sw = 0;
  for (const p of an) {
    const d = Math.hypot(p.b - b, (p.h - h) * 1.2);
    if (d < 1e-4) return { F1: Math.exp(p.l1), F2: Math.exp(p.l2) };
    const w = 1 / d ** 3;
    (s1 += w * p.l1), (s2 += w * p.l2), (sw += w);
  }
  return { F1: Math.exp(s1 / sw), F2: Math.exp(s2 / sw) };
}

/** (F1, F2) → chart position: the same blend the other way round */
function toChart(an: Anchor[], F1: number, F2: number): { b: number; h: number } {
  const l1 = Math.log(F1), l2 = Math.log(F2);
  let sb = 0, sh = 0, sw = 0;
  for (const p of an) {
    const d = Math.hypot((p.l1 - l1) * 2.2, p.l2 - l2);
    if (d < 1e-4) return { b: p.b, h: p.h };
    const w = 1 / d ** 3;
    (sb += w * p.b), (sh += w * p.h), (sw += w);
  }
  return { b: sb / sw, h: sh / sw };
}

/** the articulation for a vowel symbol: calibrated if the voice knows it, else blended */
function articFor(m: VoiceModel, an: Anchor[], v: VowelSym): Partial<HumanArtic> {
  const cal = m.vowels.find((x) => x.ipa === v.ipa);
  if (cal) return cal.artic;
  const { F1, F2 } = toFormants(an, v.b, v.h);
  const a = m.articForFormants(F1, F2);
  // rounding the blend may have lost (or added): borrow lips from a calibrated vowel of that rounding
  const lipsFrom = m.vowels.find((x) => x.ipa === (v.rounded ? (v.h < 0.4 ? "y" : "ø") : v.h < 0.4 ? "i" : "ɛ"));
  if (lipsFrom) for (const k of ["lipAp", "lipProt", "lipWidth"] as const) if (lipsFrom.artic[k] !== undefined) a[k] = lipsFrom.artic[k];
  return a;
}

export function VowelChart() {
  const model = useModel();
  const svgRef = useRef<SVGSVGElement>(null);
  const [, setTick] = useState(0);
  const dragPos = useRef<{ x: number; y: number } | null>(null);
  const selected = useLab((s) => s.selected);
  useStore((s) => s.body);

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
  if (!m) return null;
  const an = anchors(m);
  const fm = m.transfer(liveArtic()).formants;
  const live = dragPos.current ?? (fm.length >= 2 ? (({ b, h }) => pos(b, h))(toChart(an, fm[0], fm[1])) : null);

  const toSvg = (e: React.PointerEvent) => {
    const svg = svgRef.current!;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const q = pt.matrixTransform(svg.getScreenCTM()!.inverse());
    return { x: q.x, y: q.y };
  };
  const apply = (e: React.PointerEvent) => {
    const p = toSvg(e);
    const { b, h } = unpos(p.x, p.y);
    dragPos.current = pos(b, h);
    const { F1, F2 } = toFormants(an, b, h);
    useStore.getState().setArtic(m.articForFormants(F1, F2), true);
    if (useLab.getState().selected) useLab.setState({ selected: null });
  };

  const corners = [pos(0, 0), pos(1, 0), pos(1, 1), pos(0, 1)];
  const rows = [0, 1 / 3, 2 / 3, 1];
  const rowNames = ["close", "close-mid", "open-mid", "open"];
  const rowZh = ["高", "半高", "半低", "低"];
  return (
    <svg
      ref={svgRef}
      className="vowel-chart"
      viewBox={VB}
      onPointerDown={(e) => {
        const tgt = e.target as Element;
        if (tgt.closest(".vsym")) return;
        (e.currentTarget as Element).setPointerCapture(e.pointerId);
        apply(e);
      }}
      onPointerMove={(e) => dragPos.current && apply(e)}
      onPointerUp={() => (dragPos.current = null)}
      onPointerCancel={() => (dragPos.current = null)}
      role="application"
      aria-label="母音四邊形。拖曳圓點，或點選一個符號。"
    >
      <polygon className="trap" points={corners.map((c) => `${c.x},${c.y}`).join(" ")} />
      {rows.slice(1, 3).map((h) => {
        const a = pos(0, h), b = pos(1, h);
        return <line key={h} className="grid" x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;
      })}
      {(() => {
        const a = pos(0.5, 0), b = pos(0.5, 1);
        return <line className="grid" x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;
      })()}
      {rows.map((h, i) => (
        <text key={h} className="axis-label" x={2} y={pos(0, h).y + 1}>
          {rowNames[i]} <tspan className="zh">{rowZh[i]}</tspan>
        </text>
      ))}
      {(["front 前", "central 央", "back 後"] as const).map((t, i) => (
        <text key={t} className="axis-label" x={pos(i / 2, 0).x} y={Y0 - 5} textAnchor="middle">
          {t}
        </text>
      ))}
      {VOWEL_SYMS.map((v) => {
        const p = pos(v.b, v.h);
        const paired = VOWEL_SYMS.some((o) => o !== v && o.b === v.b && o.h === v.h);
        const dx = paired ? (v.rounded ? 3.2 : -3.2) : v.b > 0.6 ? -3.2 : v.b < 0.4 && v.h > 0 && v.h < 1 ? 3.2 : 0;
        const on = selected?.kind === "vowel" && selected.ipa === v.ipa;
        return (
          <g key={v.ipa}>
            {(!paired || !v.rounded) && <circle className="vdot" cx={p.x} cy={p.y} r={0.7} />}
            <text
              className={`vsym ipa ${on ? "on" : ""}`}
              x={p.x + dx}
              y={p.y + 1.6}
              textAnchor="middle"
              onPointerDown={(e) => {
                e.stopPropagation();
                void sayVowel(v.ipa, articFor(m, an, v));
              }}
            >
              {v.ipa}
            </text>
          </g>
        );
      })}
      {live && <circle className="vowel-dot" cx={live.x} cy={live.y} r={1.8} />}
    </svg>
  );
}

/** the vowel symbol the voice's (F1, F2) is closest to on the chart */
export function nearestChartVowel(m: VoiceModel): string | null {
  const fm = m.transfer(liveArtic()).formants;
  if (fm.length < 2) return null;
  let best = "", bd = Infinity;
  for (const v of m.vowels) {
    const d = Math.hypot(Math.log(fm[0] / v.F1) * 2.2, Math.log(fm[1] / v.F2));
    if (d < bd) (bd = d), (best = v.ipa);
  }
  return best || null;
}
