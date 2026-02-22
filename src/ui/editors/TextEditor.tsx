import styles from "../ui.module.css";

export function TextEditor({
  value,
  disabled,
  onChange,
  onReset,
}: {
  value: string;
  disabled: boolean;
  onChange: (v: string) => void;
  onReset: () => void;
}) {
  return (
    <div>
      <textarea
        className={styles.textarea}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button className={styles.btnSmall} onClick={onReset} disabled={disabled}>
          Reset to auto
        </button>
      </div>
    </div>
  );
}
