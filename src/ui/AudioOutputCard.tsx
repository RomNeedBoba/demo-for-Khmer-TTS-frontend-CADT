import type { PipelineMode, StageId, StageState } from "../lib/pipeline/types";
import styles from "./ui.css";
import { Waveform } from "./audio/Waveform";

export function AudioOutputCard({
  stage,
}: {
  stage?: StageState;
  mode: PipelineMode;
  activeStageId?: StageId;
}) {
  const payload = (stage?.output ?? {}) as any;

  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <div style={{ minWidth: 0 }}>
          <div className={styles.titleRow}>
            <h3 className={styles.h3}>Audio Output</h3>
            <span className={styles.pill}>{stage?.status ?? "idle"}</span>
          </div>
          <p className={styles.desc}>
            This will become real once your TTS backend returns audioUrl.
          </p>
        </div>
      </div>

      <div style={{ marginTop: 12 }} className={styles.panel}>
        <div className={styles.smallMuted}>Result</div>
        <pre className={styles.mono} style={{ margin: "10px 0 0", whiteSpace: "pre-wrap" }}>
          {JSON.stringify(payload, null, 2)}
        </pre>
      </div>
    </section>
  );
}