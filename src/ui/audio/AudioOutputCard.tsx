import type { PipelineMode, StageId, StageState, Spectrogram } from "../../lib/pipeline/types";
import styles from "../ui.module.css";
import { SpectrogramCanvas } from "./SpectrogramCanvas";
import { Waveform } from "./Waveform";

export function AudioOutputCard({
  stage,
  spectrogramStage,
}: {
  stage?: StageState;
  spectrogramStage?: StageState;
  mode: PipelineMode;
  activeStageId?: StageId;
}) {
  const spec =
    spectrogramStage?.output && typeof spectrogramStage.output === "object"
      ? (spectrogramStage.output as Spectrogram)
      : undefined;

  const audioPayload = (stage?.output ?? {}) as any;
  const audioUrl = audioPayload?.audioUrl as string | undefined;

  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <div style={{ minWidth: 0 }}>
          <div className={styles.titleRow}>
            <h3 className={styles.h3}>Final Audio Output</h3>
            <span className={styles.pill}>{stage?.status ?? "idle"}</span>
          </div>
          <p className={styles.desc}>Waveform + spectrogram inspector. Backend can attach real audioUrl + alignment later.</p>
        </div>
      </div>

      <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
        <div className={styles.panel}>
          <div className={styles.smallMuted}>Waveform</div>
          <div style={{ marginTop: 10 }}>
            <Waveform audioUrl={audioUrl} enabled={stage?.status === "done"} />
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.smallMuted}>Spectrogram</div>
          <div style={{ marginTop: 10 }}>
            <SpectrogramCanvas spectrogram={spec} />
          </div>
        </div>
      </div>
    </section>
  );
}
