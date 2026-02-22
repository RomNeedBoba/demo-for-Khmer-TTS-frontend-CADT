import styles from "./PipelinePage.module.css";
import { useTtsPipeline } from "../lib/pipeline/usePipeline";
import { Waveform } from "../ui/audio/Waveform";

export function PipelinePage() {
  const {
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
  } = useTtsPipeline();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <div className={styles.badge}>Khmer TTS Pipeline</div>
          <h1 className={styles.p1}>Text to speech</h1>
        </div>

        <div className={styles.actions}>
          <button className={styles.btnPrimary} onClick={generate} disabled={status === "loading" || !inputText.trim()}>
            {status === "loading" ? "Generating…" : "Generate"}
          </button>
        </div>
      </header>

      <section className={styles.card}>
        <div className={styles.cardTitle}>Input Text</div>
        <textarea
          className={styles.textarea}
          value={inputText}
          disabled={status === "loading"}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type Khmer text…"
        />
        {error ? <div className={styles.error}>{error}</div> : null}
      </section>

      {result ? (
        <>
          <section className={styles.card}>
            <div className={styles.cardTitle}>Stage 1 Raw (read-only)</div>
            <pre className={styles.pre}>{result.stage1_raw}</pre>
          </section>

          <section className={styles.card}>
            <div className={styles.row}>
              <div className={styles.cardTitle}>Stage 2 Normalized (editable)</div>
              <button
                className={styles.btn}
                onClick={applyNormalizedOverride}
                disabled={status === "loading" || !normalizedChanged}
                title="Regenerate Stage 3 + Stage 4 from your edited normalized text"
              >
                Apply edit & Regenerate
              </button>
            </div>

            <textarea
              className={styles.textarea}
              value={normalizedDraft}
              disabled={status === "loading"}
              onChange={(e) => setNormalizedDraft(e.target.value)}
            />

            {normalizedChanged ? <div className={styles.muted}>Edited. Click “Apply edit & Regenerate”.</div> : null}
          </section>

          <section className={styles.card}>
            <div className={styles.cardTitle}>Stage 3 Pronunciation (read-only)</div>
            <pre className={styles.pre}>{result.stage3_pronunciation}</pre>
          </section>

          <section className={styles.card}>
            <div className={styles.cardTitle}>Stage 4 Audio</div>

            <audio controls src={result.stage4_audio_url} style={{ width: "100%", marginTop: 10 }} />

            <div style={{ marginTop: 12 }}>
              <Waveform samples={result.stage4_waveform} />
            </div>

            <div className={styles.meta}>
              <div>sample_rate: {result.meta.sample_rate}</div>
              <div>device: {result.meta.device}</div>
              <div>elapsed_ms: {result.meta.elapsed_ms}</div>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}