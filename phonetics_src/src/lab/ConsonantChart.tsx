import { useMemo, useRef, useState } from "react";
import { canSay, sayConsonant, useLab } from "./lab.ts";
import { MANNERS, PLACES } from "./phonetics.ts";

/**
 * The IPA pulmonic consonant chart: voiceless on the left of each pair, voiced on the right.
 * Tap a symbol to hear it, or drag the ring across the chart: each symbol it lands on is said.
 */
export function ConsonantChart() {
  const selected = useLab((s) => s.selected);
  const sel = selected?.kind === "consonant" ? selected.ipa : null;
  const dragging = useRef(false);
  const lastSaid = useRef<string | null>(null);
  const [ringDrag, setRingDrag] = useState(false);
  const sayable = useMemo(() => {
    const ok = new Set<string>();
    for (const m of MANNERS) for (const [a, b] of m.cells) for (const s of [a, b]) if (s && s !== "x" && canSay(s)) ok.add(s);
    return ok;
  }, []);

  const symAt = (x: number, y: number): string | null => {
    const el = document.elementFromPoint(x, y)?.closest("[data-sym]") as HTMLElement | null;
    return el?.dataset.sym ?? null;
  };
  const pick = (s: string | null) => {
    if (!s || !sayable.has(s) || s === lastSaid.current) return;
    lastSaid.current = s;
    void sayConsonant(s);
  };

  return (
    <div className="chart-wrap">
      <table
        className={`cons-chart ${ringDrag ? "dragging" : ""}`}
        onPointerDown={(e) => {
          const s = symAt(e.clientX, e.clientY);
          if (!s) return;
          dragging.current = true;
          setRingDrag(true);
          lastSaid.current = null;
          (e.currentTarget as Element).setPointerCapture(e.pointerId);
          pick(s);
          e.preventDefault();
        }}
        onPointerMove={(e) => dragging.current && pick(symAt(e.clientX, e.clientY))}
        onPointerUp={() => {
          dragging.current = false;
          setRingDrag(false);
        }}
        onPointerCancel={() => {
          dragging.current = false;
          setRingDrag(false);
        }}
      >
        <thead>
          <tr>
            <th />
            {PLACES.map((p) => (
              <th key={p.en} colSpan={2} title={`${p.en} ${p.zh}`}>
                <span>{p.short}</span>
                <span className="zh">{p.zh}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MANNERS.map((m) => (
            <tr key={m.en}>
              <th scope="row" title={m.en}>
                <span>{m.short}</span> <span className="zh">{m.zh}</span>
              </th>
              {m.cells.flatMap(([vl, vd], pi) =>
                [vl, vd].map((s, side) => {
                  const key = `${pi}-${side}`;
                  const edge = side === 0 ? "l" : "r";
                  if (s === "x") return <td key={key} className={`imp ${edge}`} />;
                  if (!s) return <td key={key} className={edge} />;
                  const ok = sayable.has(s);
                  return (
                    <td key={key} className={edge}>
                      <button className={`csym ipa ${sel === s ? "on" : ""}`} data-sym={s} disabled={!ok} title={ok ? undefined : "這個音引擎還不會發"} tabIndex={0} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && void sayConsonant(s)}>
                        {s}
                      </button>
                    </td>
                  );
                }),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
