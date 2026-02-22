import styles from "./ui.module.css";

export function InputCard({
  value,
  disabled,
  onChange,
}: {
  value: string;
  disabled?: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <div style={{ minWidth: 0 }}>
          <div className={styles.titleRow}>
            <h3 className={styles.h3}>Input</h3>
            <span className={styles.pill}>Khmer text</span>
          </div>
          <p className={styles.desc}>This is the raw input. Generate to run the full pipeline.</p>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <textarea
          className={styles.textarea}
          style={{ height: 220 }}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </section>
  );
}