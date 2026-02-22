import * as React from "react";
import styles from "../ui.module.css";

function parsePhonemes(v: unknown): string[] {
  if (Array.isArray(v)) return v as string[];
  return [];
}

export function PhonemesEditor({
  value,
  disabled,
  onChange,
  onReset,
}: {
  value: unknown;
  disabled: boolean;
  onChange: (v: string[]) => void;
  onReset: () => void;
}) {
  const phonemes = parsePhonemes(value);
  const [draft, setDraft] = React.useState<string>(phonemes.join(" "));

  React.useEffect(() => {
    setDraft(phonemes.join(" "));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phonemes.join("|")]);

  return (
    <div>
      <textarea
        className={styles.textarea}
        value={draft}
        disabled={disabled}
        onChange={(e) => {
          const next = e.target.value;
          setDraft(next);
          const arr = next.split(/\s+/).filter(Boolean);
          onChange(arr);
        }}
      />
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button className={styles.btnSmall} onClick={onReset} disabled={disabled}>
          Reset to auto
        </button>
        <span className={styles.smallMuted}>Space-separated phonemes (prod: chip/timeline editor).</span>
      </div>
    </div>
  );
}
