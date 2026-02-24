export type TtsRequest = {
  text: string;
  normalized_override?: string;
  pronunciation_override?: string;
};

export type TtsResponse = {
  stage1_raw: string;
  stage2_normalized: string;
  stage3_pronunciation: string;
  stage4_audio_url: string;
  stage4_waveform: number[];
  meta: {
    sample_rate: number;
    device: string;
    elapsed_ms: number;
  };
};

export async function apiTts(req: TtsRequest): Promise<TtsResponse> {
  const baseUrl = import.meta.env.VITE_TTS_BASE_URL ?? "https://notre-newest-vary-invite.trycloudflare.com";

  const res = await fetch(`${baseUrl}/api/tts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`TTS failed: ${res.status} ${t}`);
  }

  const data = (await res.json()) as TtsResponse;

  // Minimal runtime validation (guaranteed keys per your contract, but protect UI)
  if (!data.stage4_audio_url || !Array.isArray(data.stage4_waveform)) {
    throw new Error("Invalid TTS response payload.");
  }

  return data;
}