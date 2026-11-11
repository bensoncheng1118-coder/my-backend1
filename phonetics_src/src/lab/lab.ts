/**
 * The lab page's own state and its glue to the CHIMERA engine: sound on/off, the vocal-fold
 * setting, trill and lateral, the selected sound, and saying sounds and words.
 */
import { create } from "zustand";
import { useStore } from "../ui/store.ts";
import { engine } from "../audio/AudioEngine.ts";
import { DEFAULT_SOURCE, NEUTRAL, planPhrases, restTip, tokenizeIpa, type Gesture, type HumanArtic, type Segment } from "../wasm/engine.ts";
import { g2p, speakPhrases, stopSpeaking } from "../ui/speech.ts";
import { consonantInfo } from "./phonetics.ts";

export type Folds = "closed" | "voiced" | "breathy" | "voiceless";

export interface Selected {
  kind: "vowel" | "consonant";
  ipa: string;
}

interface LabState {
  soundOn: boolean;
  folds: Folds;
  trill: boolean;
  lateral: boolean;
  trillRate: number;
  slow: boolean;
  /** the sound named in the header; a vowel follows the tongue once it moves */
  selected: Selected | null;
  /** the last word said, as segments (the chips under the text box) */
  phones: string[];
  sayError: string | null;
}

export const useLab = create<LabState>(() => ({
  soundOn: false,
  folds: "voiced",
  trill: false,
  lateral: false,
  trillRate: 25,
  slow: true,
  selected: { kind: "vowel", ipa: "ə" },
  phones: [],
  sayError: null,
}));

const DICT_URL = `${import.meta.env.BASE_URL}data/cmudict.txt.gz`;

/** the resting articulation: schwa, tongue tip resting behind the lower teeth */
export function restArtic(): HumanArtic {
  const tip = restTip(NEUTRAL.jaw, NEUTRAL.tbX, NEUTRAL.tbY);
  return { ...NEUTRAL, ttX: tip.x, ttY: tip.y };
}

/** push the fold setting and the sound switch to the voice */
export function applyVoice(): void {
  const s = useLab.getState();
  const st = useStore.getState();
  const breath = s.folds === "breathy" ? 0.85 : s.folds === "voiceless" ? 0.2 : DEFAULT_SOURCE.breathiness;
  st.setSource({ voiced: s.folds !== "voiceless", breathiness: breath });
  // closed folds: the lungs push against a shut glottis and nothing sounds
  st.setHold(s.soundOn && s.folds !== "closed");
}

export async function ensureStarted(): Promise<boolean> {
  const st = useStore.getState();
  if (st.mode !== "play") st.setMode("play");
  await st.start();
  return useStore.getState().started;
}

export async function setSoundOn(on: boolean): Promise<void> {
  useLab.setState({ soundOn: on });
  if (on) await ensureStarted();
  applyVoice();
  if (on && useLab.getState().trill) startTrill();
  if (!on) stopTrill();
}

export function setFolds(f: Folds): void {
  useLab.setState({ folds: f });
  applyVoice();
}

// ------------------------------------------------------------------ consonant poses

interface Pose {
  targets: Partial<HumanArtic>;
  template: Gesture | null;
  voiceless: boolean;
}

const poseCache = new Map<string, Pose>();

/** the articulation a consonant aims for, taken from the engine's own plan of [əCə] */
export function consonantPose(c: string): Pose | null {
  const key = `${c}`;
  const hit = poseCache.get(key);
  if (hit) return hit;
  let plan;
  try {
    plan = planPhrases([{ segments: tokenizeIpa(`ə${c}ə`), intonation: "flat" }], { body: useStore.getState().body, t0: 0 });
  } catch {
    return null;
  }
  const own = plan.gestures.filter((g) => g.label === c);
  const targets: Partial<HumanArtic> = {};
  for (const g of own) for (const [k, v] of Object.entries(g.targets)) if (k in NEUTRAL) (targets as Record<string, number>)[k] = v as number;
  const voiceless = plan.gestures.some((g) => g.label === "voiceless" || g.label === "aspiration" || g.label === "h");
  const pose = { targets, template: own[0] ?? null, voiceless };
  poseCache.set(key, pose);
  return pose;
}

/** can the engine say this symbol at all? */
export function canSay(ipa: string): boolean {
  return !!consonantPose(ipa)?.template;
}

// ------------------------------------------------------------------ trill

let trillTimer: ReturnType<typeof setInterval> | null = null;
const TRILL_CHUNK = 20;

function scheduleTrill(): void {
  const pose = consonantPose("r");
  if (!pose?.template) return;
  const rate = useLab.getState().trillRate;
  const n = Math.round(TRILL_CHUNK * rate);
  const t = pose.template;
  const gestures: Gesture[] = [];
  for (let k = 0; k < n; k++) {
    const a = k / rate;
    // short ramps and no hold after release, so the tip springs back between taps (the
    // planner's ramps are longer than a 25 Hz period and would hold the tip shut)
    gestures.push({ ...t, t0: a, t1: a + 0.4 / rate, rampIn: 0.15 / rate, rampOut: 0.15 / rate, releaseHold: 0, speed: 6, targets: { ...t.targets }, label: "trill" });
  }
  engine.schedule({ gestures, segments: [], end: TRILL_CHUNK }, true);
}

export function startTrill(): void {
  stopTrill();
  if (!useLab.getState().soundOn) return;
  scheduleTrill();
  trillTimer = setInterval(scheduleTrill, (TRILL_CHUNK - 2) * 1000);
}

export function stopTrill(): void {
  if (trillTimer) clearInterval(trillTimer);
  trillTimer = null;
  engine.stopSpeech();
}

export function setTrill(on: boolean): void {
  useLab.setState({ trill: on });
  if (on) {
    void ensureStarted().then(() => {
      if (!useLab.getState().soundOn) void setSoundOn(true);
      else startTrill();
    });
  } else stopTrill();
}

export function setTrillRate(r: number): void {
  useLab.setState({ trillRate: r });
  if (useLab.getState().trill && useLab.getState().soundOn) startTrill();
}

export function setLateral(on: boolean): void {
  useLab.setState({ lateral: on });
  useStore.getState().setArtic({ lateral: on ? 1 : 0 });
}

export function rest(): void {
  stopSpeaking();
  if (useLab.getState().trill) setTrill(false);
  useLab.setState({ lateral: false, selected: { kind: "vowel", ipa: "ə" } });
  useStore.getState().setArtic(restArtic(), true);
  if (useLab.getState().folds === "closed") setFolds("voiced");
}

// ------------------------------------------------------------------ saying things

function rate(): number {
  return useLab.getState().slow ? 0.55 : 1;
}

function speakSegments(segments: Segment[]): void {
  const st = useStore.getState();
  if (useLab.getState().trill) setTrill(false);
  speakPhrases([{ segments, intonation: "flat", pause: 0.2 }], { body: st.body, rate: rate(), f0: st.source.f0 });
}

/** a consonant, between two schwas (or held, when the sound is on) */
export async function sayConsonant(c: string): Promise<void> {
  useLab.setState({ selected: { kind: "consonant", ipa: c } });
  if (!(await ensureStarted())) return;
  const lab = useLab.getState();
  const pose = consonantPose(c);
  if (lab.soundOn && pose) {
    // hold the gesture: fricatives hiss, nasals hum, stops go quiet behind the closure
    if (lab.trill) setTrill(false);
    stopSpeaking();
    useStore.getState().setArtic(pose.targets, false);
    const info = consonantInfo(c);
    setFolds(info && !info.voiced ? "voiceless" : "voiced");
    return;
  }
  speakSegments(tokenizeIpa(`ˈə${c}ə`));
}

/** a vowel: the tongue goes there; with the sound off it is said once */
export async function sayVowel(v: string, artic: Partial<HumanArtic>): Promise<void> {
  useLab.setState({ selected: { kind: "vowel", ipa: v } });
  useStore.getState().setArtic(artic, true);
  if (!(await ensureStarted())) return;
  if (useLab.getState().soundOn) {
    if (useLab.getState().folds === "closed") setFolds("voiced");
    return;
  }
  try {
    speakSegments(tokenizeIpa(`ˈ${v}ː`));
  } catch {
    speakSegments(tokenizeIpa(`ˈ${v}`));
  }
}

/** a single segment from the word's chips */
export async function sayPhone(p: string): Promise<void> {
  if (consonantInfo(p)) return sayConsonant(p);
  useLab.setState({ selected: { kind: "vowel", ipa: p } });
  if (!(await ensureStarted())) return;
  speakSegments(tokenizeIpa(`ˈ${p}`));
}

/** English text (or IPA between slashes) → speech, and the chips of what was said */
export async function sayText(text: string): Promise<void> {
  const t = text.trim();
  if (!t) return;
  useLab.setState({ sayError: null });
  if (!(await ensureStarted())) return;
  const st = useStore.getState();
  if (useLab.getState().trill) setTrill(false);
  let phrases;
  const ipa = /^\/.*\/$|^\[.*\]$/.test(t);
  try {
    if (ipa) phrases = [{ segments: tokenizeIpa(t.slice(1, -1)), intonation: "statement" as const, pause: 0.3, words: [] }];
    else {
      try {
        await g2p.load(DICT_URL);
      } catch {
        // without the dictionary the letter-to-sound rules still work
      }
      phrases = g2p.toPhrases(t);
    }
  } catch (e) {
    useLab.setState({ sayError: e instanceof Error ? e.message : String(e) });
    return;
  }
  if (!phrases.length) return;
  const phones = phrases.flatMap((p) => p.segments.map((s) => s.ipa));
  useLab.setState({ phones });
  speakPhrases(phrases, { body: st.body, rate: rate(), f0: st.source.f0 });
}
