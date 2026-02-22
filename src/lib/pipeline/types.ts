export type StageId =
  | "raw_input"
  | "normalization"
  | "tokenization"
  | "linguistic"
  | "g2p"
  | "acoustic"
  | "audio";

export type StageStatus = "idle" | "running" | "done" | "error";
export type PipelineMode = "user" | "developer";

export type Token = { text: string; kind?: "word" | "punct" | "number" };

export type Spectrogram = {
  bins: number;
  frames: number;
  data: number[]; // 0..1
};

export type EditableKind = "text" | "tokens" | "phonemes" | "json" | "none";

export type AudioPayload = {
  audioUrl?: string;
  durationSec?: number;
  sampleRate?: number;
  note?: string;
};

export type StageState = {
  id: StageId;
  title: string;
  description?: string;

  status: StageStatus;
  editable: EditableKind;

  startedAt?: number;
  endedAt?: number;
  latencyMs?: number;

  input?: unknown;
  output?: unknown;

  editedOutput?: unknown;
  isDirty?: boolean;

  raw?: unknown;
  errorMessage?: string;
};

export type PipelineState = {
  mode: PipelineMode;
  running: boolean;
  activeStageId?: StageId;
  inputText: string;
  stages: StageState[];
};