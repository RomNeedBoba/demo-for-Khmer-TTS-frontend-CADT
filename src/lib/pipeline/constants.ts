import type { StageId, StageState } from "./types";

export const STAGE_ORDER: StageId[] = ["normalization", "linguistic", "g2p", "audio"];

export function createInitialStages(): StageState[] {
  return [
    {
      id: "normalization",
      title: "Normalization",
      description: "Fix spacing/punctuation. Editable; uses khmernorm API.",
      status: "idle",
      editable: "text",
    },
    {
      id: "linguistic",
      title: "Linguistic Layer",
      description: "Optional POS/morph hints (mock for now).",
      status: "idle",
      editable: "json",
    },
    {
      id: "g2p",
      title: "Grapheme → Phoneme",
      description: "Phoneme sequence used for synthesis (mock for now).",
      status: "idle",
      editable: "phonemes",
    },
    {
      id: "audio",
      title: "Audio Output",
      description: "Playback result (mock until TTS backend exists).",
      status: "idle",
      editable: "none",
    },
  ];
}