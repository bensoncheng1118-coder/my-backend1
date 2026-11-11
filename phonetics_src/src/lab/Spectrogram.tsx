import { useEffect, useRef } from "react";
import { engine } from "../audio/AudioEngine.ts";
import { useStore } from "../ui/store.ts";
import { useModel } from "../ui/useModel.ts";
import { liveArtic } from "./Head.tsx";

const FMAX = 6000;
/** px the picture moves left each frame */
const STEP = 2;

/** colour for a level 0..1: dark slate → teal → pale */
function shade(v: number): [number, number, number] {
  const t = Math.max(0, Math.min(1, v));
  const stops: [number, number, number][] = [
    [22, 30, 36],
    [30, 70, 84],
    [70, 160, 180],
    [200, 236, 240],
  ];
  const x = t * (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(x));
  const u = x - i;
  const a = stops[i], b = stops[i + 1];
  return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
}

/** Scrolling spectrogram (0–6 kHz, newest at the right) with the tract's predicted formants marked. */
export function Spectrogram() {
  const ref = useRef<HTMLCanvasElement>(null);
  const marks = useRef<HTMLDivElement>(null);
  const model = useModel();
  const started = useStore((s) => s.started);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    let bins: Float32Array | null = null;
    let raf = 0;
    let w = 0, h = 0;
    const fit = () => {
      const r = canvas.getBoundingClientRect();
      w = Math.max(1, Math.round(r.width));
      h = Math.max(1, Math.round(r.height));
      canvas.width = w;
      canvas.height = h;
      ctx.fillStyle = "rgb(22,30,36)";
      ctx.fillRect(0, 0, w, h);
    };
    const ro = new ResizeObserver(fit);
    ro.observe(canvas);
    fit();
    let tick = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const an = engine.analyserFast;
      const m = model.current;
      // predicted formants of the tract's shape, as marks on the right edge
      let formants: number[] = [];
      if (m && ++tick % 3 === 0) {
        formants = m.transfer(liveArtic()).formants.slice(0, 3);
        const el = marks.current;
        if (el)
          formants.forEach((fq, i) => {
            const mk = el.children[i] as HTMLElement | undefined;
            if (mk) {
              mk.style.top = `${(1 - fq / FMAX) * 100}%`;
              mk.style.display = fq < FMAX ? "" : "none";
            }
          });
      }
      if (!an || !useStore.getState().started) return;
      // scroll left, then paint the newest column at the right edge
      ctx.drawImage(canvas, STEP, 0, w - STEP, h, 0, 0, w - STEP, h);
      const n = an.frequencyBinCount;
      if (!bins || bins.length !== n) bins = new Float32Array(n);
      an.getFloatFrequencyData(bins as Float32Array<ArrayBuffer>);
      const binHz = engine.sampleRate / an.fftSize;
      const img = ctx.createImageData(STEP, h);
      for (let y = 0; y < h; y++) {
        const f0 = (1 - (y + 1) / h) * FMAX, f1 = (1 - y / h) * FMAX;
        let db = -Infinity;
        for (let k = Math.max(1, Math.floor(f0 / binHz)); k <= Math.min(n - 1, Math.ceil(f1 / binHz)); k++) db = Math.max(db, bins[k]);
        // a little pre-emphasis so the upper formants show
        const fc = (f0 + f1) / 2;
        const v = Math.pow(Math.max(0, (db + 6 * Math.log2(1 + fc / 500) + 92) / 62), 1.3);
        const [r, g, b] = shade(v);
        for (let x = 0; x < STEP; x++) {
          const o = (y * STEP + x) * 4;
          img.data[o] = r;
          img.data[o + 1] = g;
          img.data[o + 2] = b;
          img.data[o + 3] = 255;
        }
      }
      ctx.putImageData(img, w - STEP, 0);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [model]);

  return (
    <div className="spectro">
      <span className="axis top">6 kHz</span>
      <span className="axis bottom">0</span>
      <canvas ref={ref} aria-label="聲音的頻譜圖，最新的在右邊" role="img" />
      {!started && <div className="spectro-hint">Turn sound on to draw the spectrogram. 打開聲音即可繪製頻譜圖。</div>}
      <div className="marks" ref={marks}>
        <span>F1</span>
        <span>F2</span>
        <span>F3</span>
      </div>
    </div>
  );
}
