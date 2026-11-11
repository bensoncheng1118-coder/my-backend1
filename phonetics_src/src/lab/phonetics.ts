/** IPA reference data for the lab page: vowel chart positions and names, the consonant chart. */

export interface VowelSym {
  ipa: string;
  /** backness 0 front … 1 back */
  b: number;
  /** height 0 close … 1 open */
  h: number;
  rounded: boolean;
}

/** the IPA vowel chart: each symbol where the chart prints it */
export const VOWEL_SYMS: VowelSym[] = [
  { ipa: "i", b: 0, h: 0, rounded: false },
  { ipa: "y", b: 0, h: 0, rounded: true },
  { ipa: "ɨ", b: 0.5, h: 0, rounded: false },
  { ipa: "ʉ", b: 0.5, h: 0, rounded: true },
  { ipa: "ɯ", b: 1, h: 0, rounded: false },
  { ipa: "u", b: 1, h: 0, rounded: true },
  { ipa: "ɪ", b: 0.2, h: 1 / 6, rounded: false },
  { ipa: "ʏ", b: 0.2, h: 1 / 6, rounded: true },
  { ipa: "ʊ", b: 0.8, h: 1 / 6, rounded: true },
  { ipa: "e", b: 0, h: 1 / 3, rounded: false },
  { ipa: "ø", b: 0, h: 1 / 3, rounded: true },
  { ipa: "ɘ", b: 0.5, h: 1 / 3, rounded: false },
  { ipa: "ɵ", b: 0.5, h: 1 / 3, rounded: true },
  { ipa: "ɤ", b: 1, h: 1 / 3, rounded: false },
  { ipa: "o", b: 1, h: 1 / 3, rounded: true },
  { ipa: "ə", b: 0.5, h: 0.5, rounded: false },
  { ipa: "ɛ", b: 0, h: 2 / 3, rounded: false },
  { ipa: "œ", b: 0, h: 2 / 3, rounded: true },
  { ipa: "ɜ", b: 0.5, h: 2 / 3, rounded: false },
  { ipa: "ɞ", b: 0.5, h: 2 / 3, rounded: true },
  { ipa: "ʌ", b: 1, h: 2 / 3, rounded: false },
  { ipa: "ɔ", b: 1, h: 2 / 3, rounded: true },
  { ipa: "æ", b: 0, h: 5 / 6, rounded: false },
  { ipa: "ɐ", b: 0.5, h: 5 / 6, rounded: false },
  { ipa: "a", b: 0, h: 1, rounded: false },
  { ipa: "ɶ", b: 0, h: 1, rounded: true },
  { ipa: "ɑ", b: 1, h: 1, rounded: false },
  { ipa: "ɒ", b: 1, h: 1, rounded: true },
];

/**
 * Calibrated vowels that anchor the chart ↔ formant mapping: one per chart position (rounded and
 * unrounded pairs share a spot, so only one of each pair anchors it).
 */
export const ANCHORS = ["i", "ɪ", "e", "ɛ", "æ", "a", "ɨ", "ə", "ɐ", "u", "ʊ", "o", "ɔ", "ɑ"];

const HEIGHT_EN = ["close", "near-close", "close-mid", "mid", "open-mid", "near-open", "open"];
const HEIGHT_ZH = ["高", "次高", "半高", "中", "半低", "次低", "低"];

function heightIndex(h: number): number {
  return Math.round(h * 6);
}

function backIndex(b: number): number {
  return b < 0.1 ? 0 : b < 0.35 ? 1 : b < 0.65 ? 2 : b < 0.9 ? 3 : 4;
}
const BACK_EN = ["front", "near-front", "central", "near-back", "back"];
const BACK_ZH = ["前", "次前", "央", "次後", "後"];

export interface SoundName {
  en: string;
  zh: string;
}

export function vowelName(v: VowelSym): SoundName {
  const hi = heightIndex(v.h), bi = backIndex(v.b);
  const mid = v.ipa === "ə";
  const en = `${HEIGHT_EN[hi]} ${BACK_EN[bi]}${mid ? "" : v.rounded ? " rounded" : " unrounded"} vowel`;
  const zh = `${BACK_ZH[bi]}${HEIGHT_ZH[hi]}${mid ? "" : v.rounded ? "圓唇" : "展唇"}母音`;
  return { en, zh };
}

export const vowelSym = (ipa: string): VowelSym | undefined => VOWEL_SYMS.find((v) => v.ipa === ipa);

// ------------------------------------------------------------------ consonants

export const PLACES: { en: string; short: string; zh: string }[] = [
  { en: "bilabial", short: "bilabial", zh: "雙唇" },
  { en: "labiodental", short: "lab.dent.", zh: "唇齒" },
  { en: "dental", short: "dental", zh: "齒間" },
  { en: "alveolar", short: "alveolar", zh: "齒槽" },
  { en: "postalveolar", short: "postalv.", zh: "齒槽後" },
  { en: "retroflex", short: "retroflex", zh: "捲舌" },
  { en: "palatal", short: "palatal", zh: "硬顎" },
  { en: "velar", short: "velar", zh: "軟顎" },
  { en: "uvular", short: "uvular", zh: "小舌" },
  { en: "pharyngeal", short: "pharyng.", zh: "咽" },
  { en: "glottal", short: "glottal", zh: "聲門" },
];

export interface MannerRow {
  en: string;
  short: string;
  zh: string;
  /** [voiceless, voiced] per place; null = no symbol; "x" = judged impossible (shaded) */
  cells: [string | null, string | null][];
}

const _ = null;
const X = "x";
export const MANNERS: MannerRow[] = [
  { en: "plosive", short: "plosive", zh: "塞音", cells: [["p", "b"], [_, _], [_, _], ["t", "d"], [_, _], ["ʈ", "ɖ"], ["c", "ɟ"], ["k", "g"], ["q", "ɢ"], [_, X], ["ʔ", X]] },
  { en: "nasal", short: "nasal", zh: "鼻音", cells: [[_, "m"], [_, "ɱ"], [_, _], [_, "n"], [_, _], [_, "ɳ"], [_, "ɲ"], [_, "ŋ"], [_, "ɴ"], [X, X], [X, X]] },
  { en: "trill", short: "trill", zh: "顫音", cells: [[_, "ʙ"], [_, _], [_, _], [_, "r"], [_, _], [_, _], [_, _], [X, X], [_, "ʀ"], [_, _], [X, X]] },
  { en: "tap", short: "tap/flap", zh: "閃音", cells: [[_, _], [_, "ⱱ"], [_, _], [_, "ɾ"], [_, _], [_, "ɽ"], [_, _], [X, X], [_, _], [_, _], [X, X]] },
  { en: "fricative", short: "fricative", zh: "擦音", cells: [["ɸ", "β"], ["f", "v"], ["θ", "ð"], ["s", "z"], ["ʃ", "ʒ"], ["ʂ", "ʐ"], ["ç", "ʝ"], ["x", "ɣ"], ["χ", "ʁ"], ["ħ", "ʕ"], ["h", "ɦ"]] },
  { en: "lateral fricative", short: "lat. fricative", zh: "邊擦音", cells: [[X, X], [X, X], [_, _], ["ɬ", "ɮ"], [_, _], [_, _], [_, _], [_, _], [_, _], [X, X], [X, X]] },
  { en: "approximant", short: "approximant", zh: "近音", cells: [[_, _], [_, "ʋ"], [_, _], [_, "ɹ"], [_, _], [_, "ɻ"], [_, "j"], [_, "ɰ"], [_, _], [_, _], [X, X]] },
  { en: "lateral approximant", short: "lat. approx.", zh: "邊近音", cells: [[X, X], [X, X], [_, _], [_, "l"], [_, _], [_, "ɭ"], [_, "ʎ"], [_, "ʟ"], [_, _], [X, X], [X, X]] },
];

export interface ConsonantInfo {
  ipa: string;
  voiced: boolean;
  place: number;
  manner: number;
}

export const CONSONANTS: ConsonantInfo[] = MANNERS.flatMap((m, mi) =>
  m.cells.flatMap(([vl, vd], pi) => [
    ...(vl && vl !== X ? [{ ipa: vl, voiced: false, place: pi, manner: mi }] : []),
    ...(vd && vd !== X ? [{ ipa: vd, voiced: true, place: pi, manner: mi }] : []),
  ]),
);

export const consonantInfo = (ipa: string): ConsonantInfo | undefined => CONSONANTS.find((c) => c.ipa === ipa);

export function consonantName(c: ConsonantInfo): SoundName {
  const p = PLACES[c.place], m = MANNERS[c.manner];
  // ʔ and h/ɦ: "voiced"/"voiceless" glottal reads oddly for ʔ, keep it plain
  const voice = c.ipa === "ʔ" ? "" : c.voiced ? "voiced " : "voiceless ";
  const voiceZh = c.ipa === "ʔ" ? "" : c.voiced ? "濁" : "清";
  return { en: `${voice}${p.en} ${m.en}`, zh: `${voiceZh}${p.zh}${m.zh}` };
}
