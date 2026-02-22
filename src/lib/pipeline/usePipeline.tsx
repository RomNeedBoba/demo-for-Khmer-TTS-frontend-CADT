import * as React from "react";
import { apiTts, type TtsResponse } from "../api/ttsClient";

type Status = "idle" | "loading" | "error" | "done";

export function useTtsPipeline() {
  const [inputText, setInputText] = React.useState<string>("សួស្តី!");
  const [status, setStatus] = React.useState<Status>("idle");
  const [error, setError] = React.useState<string | null>(null);

  const [result, setResult] = React.useState<TtsResponse | null>(null);

  // editable normalized draft
  const [normalizedDraft, setNormalizedDraft] = React.useState<string>("");

  React.useEffect(() => {
    if (result?.stage2_normalized != null) setNormalizedDraft(result.stage2_normalized);
  }, [result?.stage2_normalized]);

  const generate = React.useCallback(async () => {
    const text = inputText.trim();
    if (!text) return;

    setStatus("loading");
    setError(null);

    try {
      const data = await apiTts({ text });
      setResult(data);
      setStatus("done");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  }, [inputText]);

  const applyNormalizedOverride = React.useCallback(async () => {
    if (!result) return;

    const raw = result.stage1_raw;
    const override = normalizedDraft;

    setStatus("loading");
    setError(null);

    try {
      const data = await apiTts({ text: raw, normalized_override: override });
      setResult(data);
      setStatus("done");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  }, [result, normalizedDraft]);

  const normalizedChanged = result ? normalizedDraft !== result.stage2_normalized : false;

  return {
    inputText,
    setInputText,
    status,
    error,
    result,
    normalizedDraft,
    setNormalizedDraft,
    normalizedChanged,
    generate,
    applyNormalizedOverride,
  };
}