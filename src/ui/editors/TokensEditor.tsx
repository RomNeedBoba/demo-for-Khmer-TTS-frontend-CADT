import * as React from "react";
import styles from "../ui.module.css";
import type { Token } from "../../lib/pipeline/types";

function parseTokens(v: unknown): Token[] {
  if (Array.isArray(v)) return v as Token[];
  return [];
}

export function TokensEditor({
  value,
  disabled,
  onChange,
  onReset,
}: {
  value: unknown;
  disabled: boolean;
  onChange: (v: Token[]) => void;
  onReset: () => void;
}) {
  const tokens = parseTokens(value);
  const [draft, setDraft] = React.useState<string>(JSON.stringify(tokens, null, 2));

  React.useEffect(() => {
    setDraft(JSON.stringify(tokens, null, 2));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(tokens)]);

  return (
    <div>
      <textarea
        className={styles.textarea}
        value={draft}
        disabled={disabled}
        onChange={(e) => {
          const next = e.target.value;
          setDraft(next);
          try {
            const parsed = JSON.parse(next);
            if (Array.isArray(parsed)) onChange(parsed as Token[]);
          } catch {
            // keep draft; don't update pipeline until JSON valid
          }
        }}
      />
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button className={styles.btnSmall} onClick={onReset} disabled={disabled}>
          Reset to auto
        </button>
        <span className={styles.smallMuted}>Edit as JSON array of tokens (prod: replace with chip editor).</span>
      </div>
    </div>
  );
}
