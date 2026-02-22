import type { Spectrogram, Token } from "./types";

export function jitter(minMs: number, maxMs: number) {
  return Math.floor(minMs + Math.random() * (maxMs - minMs + 1));
}

export function normalizeKhmer(text: string) {
  const trimmed = text.trim();
  const collapsed = trimmed.replace(/\s+/g, " ");
  const punct = collapsed.replace(/\s([។!?])/g, "$1");
  return punct;
}

export function tokenizeKhmer(text: string): Token[] {
  const parts = text.split(/(\s+|[។,.!?])/).filter((p) => p && !/^\s+$/.test(p));
  return parts.map((p) => ({ text: p, kind: /^[។,.!?]$/.test(p) ? "punct" : "word" }));
}

export function mockLinguistic(tokens: Token[]) {
  return tokens.map((t) => ({
    ...t,
    pos: t.kind === "punct" ? "PUNCT" : t.text.length <= 2 ? "PART" : "NOUN",
  }));
}

export function mockG2P(tokens: Token[]) {
  const phonemes: string[] = [];
  for (const t of tokens) {
    if (t.kind === "punct") {
      phonemes.push("|");
      continue;
    }
    const count = Math.max(2, Math.min(5, Math.floor(t.text.length / 2)));
    for (let i = 0; i < count; i++) phonemes.push(`PH${(t.text.charCodeAt(0) + i) % 17}`);
  }
  return phonemes;
}

export function mockSpectrogram(frames = 110, bins = 72): Spectrogram {
  const data = new Array(bins * frames).fill(0).map((_, idx) => {
    const f = Math.floor(idx / bins);
    const b = idx % bins;
    const ridge = Math.exp(-Math.pow((b - (bins * 0.22 + (f / frames) * bins * 0.55)) / 10, 2));
    const harmonics = 0.35 * Math.exp(-Math.pow((b - (bins * 0.63 + Math.sin(f / 7) * 6)) / 14, 2));
    const noise = (Math.random() - 0.5) * 0.08;
    return Math.max(0, Math.min(1, 0.06 + 0.78 * ridge + harmonics + noise));
  });
  return { bins, frames, data };
}