import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { clsx } from "clsx";
import type { PipelineMode, StageId, StageState } from "../lib/pipeline/types";
import styles from "./ui.module.css";
import { TextEditor } from "./editors/TextEditor";
import { TokensEditor } from "./editors/TokensEditor";
import { JsonEditor } from "./editors/JsonEditor";
import { PhonemesEditor } from "./editors/PhonemesEditor";

export function PipelineStageCard({
  stage,
  mode,
  activeStageId,
  running,
  onEditOutput,
  onResetOutput,
  onRerunFromHere,
}: {
  stage: StageState;
  mode: PipelineMode;
  activeStageId?: StageId;
  running: boolean;
  onEditOutput: (id: StageId, editedOutput: unknown) => void;
  onResetOutput: (id: StageId) => void;
  onRerunFromHere: (id: StageId) => void;
}) {
  const [open, setOpen] = React.useState(true);
  const isActive = stage.id === activeStageId && stage.status === "running";

  return (
    <motion.section layout className={clsx(styles.card, isActive && styles.cardActive)}>
      <div className={styles.cardHeader}>
        <div style={{ minWidth: 0 }}>
          <div className={styles.titleRow}>
            <h3 className={styles.h3}>{stage.title}</h3>
            <span className={clsx(styles.pill, pillClass(stage.status))}>{stage.status}</span>
            {stage.isDirty ? <span className={styles.pill}>edited</span> : null}
            {typeof stage.latencyMs === "number" && stage.status === "done" ? (
              <span className={styles.smallMuted}>{stage.latencyMs}ms</span>
            ) : null}
          </div>
          <p className={styles.desc}>{stage.description}</p>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button className={styles.btnSmall} onClick={() => setOpen((v) => !v)}>
            {open ? "Collapse" : "Expand"}
          </button>
          <button
            className={styles.btnSmall}
            disabled={running || stage.status !== "done"}
            onClick={() => onRerunFromHere(stage.id)}
            title="Re-run pipeline from this stage (uses your edits if present)"
          >
            Re-run
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
              <div className={styles.panel}>
                <div className={styles.smallMuted}>Input</div>
                <pre className={styles.mono} style={{ margin: "10px 0 0", whiteSpace: "pre-wrap" }}>
                  {format(stage.input)}
                </pre>
              </div>

              <div className={styles.panel}>
                <div className={styles.smallMuted}>
                  Output {stage.editable !== "none" ? "(editable)" : ""}
                </div>

                <div style={{ marginTop: 10 }}>
                  <StageEditor
                    stage={stage}
                    mode={mode}
                    disabled={running || stage.status !== "done"}
                    onEdit={(v) => onEditOutput(stage.id, v)}
                    onReset={() => onResetOutput(stage.id)}
                  />
                </div>
              </div>

              {mode === "developer" ? (
                <div className={styles.panel}>
                  <div className={styles.smallMuted}>Raw JSON</div>
                  <pre className={styles.mono} style={{ margin: "10px 0 0", whiteSpace: "pre-wrap" }}>
                    {JSON.stringify(stage.raw ?? {}, null, 2)}
                  </pre>
                </div>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.section>
  );

  function pillClass(status: StageState["status"]) {
    if (status === "running") return styles.pillRunning;
    if (status === "done") return styles.pillDone;
    if (status === "error") return styles.pillError;
    return "";
  }
}

function StageEditor({
  stage,
  mode,
  disabled,
  onEdit,
  onReset,
}: {
  stage: StageState;
  mode: PipelineMode;
  disabled: boolean;
  onEdit: (v: unknown) => void;
  onReset: () => void;
}) {
  const value = stage.editedOutput ?? stage.output;

  if (stage.status === "idle") return <div style={{ color: "var(--muted)", fontSize: 12 }}>Waiting…</div>;
  if (stage.status === "running") return <div style={{ color: "var(--muted)", fontSize: 12 }}>Processing…</div>;
  if (stage.status === "error") return <div style={{ color: "var(--rose)", fontSize: 12 }}>{stage.errorMessage ?? "Error"}</div>;

  switch (stage.editable) {
    case "text":
      return <TextEditor value={String(value ?? "")} disabled={disabled} onChange={onEdit} onReset={onReset} />;
    case "tokens":
      return <TokensEditor value={value} disabled={disabled} onChange={onEdit} onReset={onReset} />;
    case "phonemes":
      return <PhonemesEditor value={value} disabled={disabled} onChange={onEdit} onReset={onReset} />;
    case "json":
      // In User Mode we still show it but discourage edits; Dev Mode allows.
      return <JsonEditor value={value} disabled={disabled || mode !== "developer"} onChange={onEdit} onReset={onReset} />;
    default:
      return (
        <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontSize: 12 }}>
          {format(value)}
        </pre>
      );
  }
}

function format(v: unknown) {
  if (typeof v === "string") return v;
  return JSON.stringify(v ?? null, null, 2);
}