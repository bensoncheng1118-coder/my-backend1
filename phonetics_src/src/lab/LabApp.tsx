import { useEffect, useState } from "react";
import { useStore } from "../ui/store.ts";
import { useModel } from "../ui/useModel.ts";
import { currentPlan, onPlan } from "../ui/speech.ts";
import { planNow } from "../ui/components/ScoreView.tsx";
import { engine } from "../audio/AudioEngine.ts";
import { Head, liveArtic } from "./Head.tsx";
import { Spectrogram } from "./Spectrogram.tsx";
import { VowelChart, nearestChartVowel } from "./VowelChart.tsx";
import { ConsonantChart } from "./ConsonantChart.tsx";
import { applyVoice, rest, restArtic, sayPhone, sayText, setFolds, setLateral, setSoundOn, setTrill, setTrillRate, useLab, type Folds } from "./lab.ts";
import { consonantInfo, consonantName, vowelName, vowelSym } from "./phonetics.ts";

const FOLDS: { id: Folds; en: string; zh: string }[] = [
  { id: "closed", en: "closed", zh: "閉合" },
  { id: "voiced", en: "voiced", zh: "有聲" },
  { id: "breathy", en: "breathy", zh: "氣聲" },
  { id: "voiceless", en: "voiceless", zh: "無聲" },
];

function Controls() {
  const soundOn = useLab((s) => s.soundOn);
  const folds = useLab((s) => s.folds);
  const trill = useLab((s) => s.trill);
  const lateral = useLab((s) => s.lateral);
  const starting = useStore((s) => s.starting);
  const err = useStore((s) => s.startError);
  return (
    <div className="controls">
      <button className={`btn sound ${soundOn ? "on" : ""}`} onClick={() => void setSoundOn(!soundOn)} disabled={starting}>
        {starting ? "Starting…" : soundOn ? "Sound on 聲音開" : "Sound off 聲音關"}
      </button>
      {err && <p className="err">音訊無法啟動：{err}</p>}
      <div className="group-label">VOCAL FOLDS 聲帶</div>
      <div className="stack">
        {FOLDS.map((f) => (
          <button key={f.id} className={`btn ${folds === f.id ? "sel" : ""}`} onClick={() => setFolds(f.id)} aria-pressed={folds === f.id}>
            {f.en} <span className="zh">{f.zh}</span>
          </button>
        ))}
      </div>
      <div className="group-label">NOT IN VIEW 看不到的</div>
      <div className="stack">
        <button className={`btn ${trill ? "sel" : ""}`} onClick={() => setTrill(!trill)} aria-pressed={trill}>
          trill <span className="zh">顫音</span>
        </button>
        <button className={`btn ${lateral ? "sel" : ""}`} onClick={() => setLateral(!lateral)} aria-pressed={lateral}>
          lateral <span className="zh">邊音</span>
        </button>
      </div>
      <button className="btn rest" onClick={rest}>
        rest, <span className="ipa">[ə]</span> <span className="zh">歸位</span>
      </button>
    </div>
  );
}

/** the sound named at the top right: the chosen consonant, else the vowel the tongue makes */
function Readout() {
  const model = useModel();
  const selected = useLab((s) => s.selected);
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 120);
    return () => clearInterval(id);
  }, []);
  const m = model.current;
  if (!m) return null;
  const fm = m.transfer(liveArtic()).formants;
  let ipa = "", name = { en: "", zh: "" };
  const c = selected?.kind === "consonant" ? consonantInfo(selected.ipa) : undefined;
  if (c) {
    ipa = c.ipa;
    name = consonantName(c);
  } else {
    const v = vowelSym(selected?.kind === "vowel" ? selected.ipa : (nearestChartVowel(m) ?? "ə"));
    if (v) {
      ipa = v.ipa;
      name = vowelName(v);
    }
  }
  return (
    <div className="readout">
      <span className="bracket ipa">[{ipa}]</span>
      <div>
        <div className="name">
          {name.en} <span className="zh">{name.zh}</span>
        </div>
        <div className="formants">{fm.length >= 2 ? `F1 ${Math.round(fm[0])} Hz · F2 ${Math.round(fm[1])} Hz` : ""}</div>
      </div>
    </div>
  );
}

function Sliders() {
  const f0 = useStore((s) => s.source.f0);
  const trillRate = useLab((s) => s.trillRate);
  return (
    <div className="sliders">
      <label>
        Pitch <span className="zh">音高</span>
        <input type="range" min={70} max={330} step={1} value={f0} onChange={(e) => useStore.getState().setSource({ f0: Number(e.target.value) })} />
        <span className="val">{Math.round(f0)} Hz</span>
      </label>
      <label>
        Trill <span className="zh">顫音速率</span>
        <input type="range" min={15} max={35} step={1} value={trillRate} onChange={(e) => setTrillRate(Number(e.target.value))} />
        <span className="val">{trillRate} Hz</span>
      </label>
    </div>
  );
}

/** which chip is sounding now */
function useSounding(): number {
  const [i, setI] = useState(-1);
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const sp = currentPlan();
      const now = planNow(sp);
      let k = -1;
      if (sp && now >= 0 && engine.latest) {
        const seg = sp.plan.segments.findIndex((s) => now >= s.t0 && now < s.t1);
        k = seg;
      }
      setI((p) => (p === k ? p : k));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return i;
}

function Say() {
  const [text, setText] = useState("bedtime");
  const slow = useLab((s) => s.slow);
  const phones = useLab((s) => s.phones);
  const err = useLab((s) => s.sayError);
  const sounding = useSounding();
  const [, force] = useState(0);
  useEffect(() => onPlan(() => force((x) => x + 1)), []);
  return (
    <div className="say">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void sayText(text);
        }}
      >
        <span className="say-label">SAY 說</span>
        <input value={text} onChange={(e) => setText(e.target.value)} aria-label="要說的英文字，或用 /斜線/ 包住的 IPA" placeholder="English word, or /IPA/" />
        <button className="btn small" type="submit">
          Say it
        </button>
        <label className="slow">
          <input type="checkbox" checked={slow} onChange={(e) => useLab.setState({ slow: e.target.checked })} /> slowly 慢速
        </label>
      </form>
      {err && <p className="err">{err}</p>}
      <div className="phones">
        {phones.map((p, i) => (
          <button key={i} className={`chip ipa ${i === sounding ? "on" : ""}`} onClick={() => void sayPhone(p)}>
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

export function LabApp() {
  useEffect(() => {
    // console/debug handle, as the original app has
    (window as unknown as { __chimeraEngine: typeof engine }).__chimeraEngine = engine;
    const st = useStore.getState();
    st.setMode("play");
    st.setArtic(restArtic(), true);
    applyVoice();
  }, []);
  return (
    <div className="lab">
      <header className="masthead">
        <a className="back" href="/">
          ← 回首頁
        </a>
        <span className="title">
          <b>VOICED HEAD</b> <i>the phonetics textbook head, with a working voice</i>
          <span className="zh"> 會發聲的語音學課本頭像</span>
        </span>
        <a className="notes" href="#notes">
          Notes 說明
        </a>
      </header>
      <main className="grid">
        <section className="fig fig1">
          <div className="fig1-body">
            <Head />
            <Controls />
          </div>
          <p className="caption">
            <b>Figure 1</b> <i>The vocal tract in midsagittal section. Drag any dot.</i> <span className="zh">圖一：聲道正中矢狀切面，拖曳任一圓點。</span>
          </p>
        </section>
        <section className="fig fig3">
          <Readout />
          <VowelChart />
          <p className="caption">
            <b>Figure 3</b> <i>The vowel quadrilateral. Drag the dot, or tap a symbol.</i> <span className="zh">圖三：母音四邊形，拖曳圓點或點選符號。</span>
          </p>
        </section>
        <section className="fig fig2">
          <Spectrogram />
          <Sliders />
          <p className="caption">
            <b>Figure 2</b> <i>Spectrogram of the voice, newest at the right. The marks are the formants the shape of the tract predicts.</i>{" "}
            <span className="zh">圖二：聲音的頻譜圖，最新的在右邊；右側標記是聲道形狀預測的共振峰。</span>
          </p>
          <Say />
        </section>
        <section className="fig fig4">
          <ConsonantChart />
          <p className="caption">
            <b>Figure 4</b> <i>Pulmonic consonants, voiceless on the left of each pair. Tap a symbol, or drag the ring.</i>{" "}
            <span className="zh">圖四：肺部氣流子音，每格左清右濁。點選符號，或按住拖曳圓圈。</span>
          </p>
        </section>
      </main>
      <footer id="notes" className="notes-block">
        <h2>Notes 說明</h2>
        <ul>
          <li>
            先按左上角的 <b>Sound off</b> 打開聲音，聲音會持續發出；這時拖曳舌頭、嘴唇、下顎、軟顎或喉頭的圓點，就能即時聽到聲道形狀改變後的聲音。聲音關閉時，點母音或子音會各唸一次。
          </li>
          <li>聲帶：closed 閉合（不出聲）、voiced 有聲、breathy 氣聲、voiceless 無聲（耳語）。trill 讓舌尖以右下的速率顫動，lateral 讓氣流從舌頭兩側出去。</li>
          <li>SAY 欄可以輸入英文單字或句子，或用斜線包住 IPA，例如 /ˈbɛdtaɪm/；下面的音標可以逐一點來聽。</li>
          <li>聲音不是錄音，而是即時模擬肺、聲帶、喉、口腔與鼻腔裡的氣流（物理模型）。若沒有聲音，請確認瀏覽器沒有靜音，並使用電腦版 Chrome、Edge 或 Safari。</li>
          <li>
            聲音引擎來自開源專案 <a href="https://github.com/jamesondh/chimera-vocal-synth" target="_blank" rel="noreferrer">CHIMERA</a>（MIT 授權，作者 Jameson Hodge）。發音字典為 CMU Pronouncing Dictionary。
          </li>
        </ul>
      </footer>
    </div>
  );
}
