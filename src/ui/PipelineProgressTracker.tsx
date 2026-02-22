import { clsx } from "clsx";
import type { StageId, StageState } from "../lib/pipeline/types";
import styles from "./ui.module.css";

export function PipelineProgressTracker({
  stages,
  activeStageId,
}: {
  stages: StageState[];
  activeStageId?: StageId;
}) {
  return (
    <div className={styles.tracker}>
      <div className={styles.trackerGrid}>
        {stages.map((s) => {
          const isActive = s.id === activeStageId && s.status === "running";
          const isDone = s.status === "done";
          const isError = s.status === "error";
          return (
            <div
              key={s.id}
              className={clsx(
                styles.trackerItem,
                isActive && styles.trackerItemActive,
                isDone && styles.trackerItemDone,
                isError && styles.trackerItemError
              )}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div style={{ fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {s.title}
                </div>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 999,
                    background:
                      isActive ? "var(--cyan)" : isDone ? "var(--emerald)" : isError ? "var(--rose)" : "rgba(113,113,122,1)",
                  }}
                />
              </div>
              <div style={{ marginTop: 6, fontSize: 11, color: "var(--muted)" }}>
                {s.status === "done" ? `${s.latencyMs ?? 0}ms` : s.status}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}