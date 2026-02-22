import type { PipelineMode, StageId, StageState } from "../lib/pipeline/types";
import styles from "./ui.module.css";
import { Waveform } from "./audio/Waveform";

export function AudioOutputCard({
  stage,
}: {
  stage?: StageState;
  mode: PipelineMode;
  activeStageId?: StageId;
}) {
  const payload = (stage?.output ?? {}) as any;

  // Support either backend shape:
  // - stage4_audio_url (my earlier backend)
  // - audioUrl (your older UI mock)
  const audioUrl = (payload?.stage4_audio_url ?? payload?.audioUrl) as string | undefined;

  // Optional fallback samples mode
  const samples = (payload?.stage4_waveform ?? payload?.samples) as number[] | undefined;
  const sampleRate = (payload?.meta?.sample_rate ?? payload?.sampleRate) as number | undefined;

  const enabled = stage?.status === "done" || Boolean(audioUrl) || Boolean(samples);

  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <div style={{ minWidth: 0 }}>
          <div className={styles.titleRow}>
            <h3 className={styles.h3}>Audio Output</h3>
            <span className={styles.pill}>{stage?.status ?? "idle"}</span>
          </div>
          <p className={styles.desc}>Waveform preview (audioUrl preferred, samples fallback).</p>
        </div>
      </div>

      <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
        <div className={styles.panel}>
          <div className={styles.smallMuted}>Waveform</div>
          <div style={{ marginTop: 10 }}>
            {audioUrl ? (
              <Waveform audioUrl={audioUrl} enabled={enabled} />
            ) : samples ? (
              <Waveform samples={samples} sampleRate={sampleRate} enabled={enabled} />
            ) : (
              <div className={styles.smallMuted} style={{ marginTop: 8 }}>
                No audio yet.
              </div>
            )}
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.smallMuted}>Payload</div>
          <pre className={styles.mono} style={{ margin: "10px 0 0", whiteSpace: "pre-wrap" }}>
            {JSON.stringify(payload, null, 2)}
          </pre>
        </div>
      </div>
    </section>
  );
}