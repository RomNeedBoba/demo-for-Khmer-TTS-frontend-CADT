import * as React from "react";
import styles from "../ui.module.css";

export function JsonEditor({
  value,
  disabled,
  onChange,
  onReset,
}: {
  value: unknown;
  disabled: boolean;
  onChange: (v: unknown) => void;
  onReset: () => void;
}) {
  const [draft, setDraft] = React.useState<string>(JSON.stringify(value ?? {}, null, 2));

  React.useEffect(() => {
    setDraft(JSON.stringify(value ?? {}, null, 2));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(value ?? {})]);

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
            onChange(JSON.parse(next));
          } catch {
            // ignore invalid JSON
          }
        }}
      />
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button className={styles.btnSmall} onClick={onReset} disabled={disabled}>
          Reset to auto
        </button>
        <span className={styles.smallMuted}>Dev Mode editor (invalid JSON won’t apply).</span>
      </div>
    </div>
  );
}
