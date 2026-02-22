import * as React from "react";
import type { Spectrogram } from "../../lib/pipeline/types";

export function SpectrogramCanvas({ spectrogram }: { spectrogram?: Spectrogram }) {
  const ref = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    const resize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "rgba(255,255,255,0.02)";
    ctx.fillRect(0, 0, w, h);

    if (!spectrogram) {
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const x = (w / 6) * i + 0.5;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (let i = 0; i < 4; i++) {
        const y = (h / 4) * i + 0.5;
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();
      return;
    }

    const { bins, frames, data } = spectrogram;
    const cellW = w / frames;
    const cellH = h / bins;

    for (let f = 0; f < frames; f++) {
      for (let b = 0; b < bins; b++) {
        const v = data[f * bins + b] ?? 0;
        const r = Math.floor(30 + v * 40);
        const g = Math.floor(20 + v * 160);
        const bl = Math.floor(60 + v * 190);
        ctx.fillStyle = `rgba(${r},${g},${bl},0.95)`;

        const x = f * cellW;
        const y = (bins - 1 - b) * cellH;
        ctx.fillRect(x, y, Math.ceil(cellW), Math.ceil(cellH));
      }
    }

    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fillRect(0, 0, w, h);
  }, [spectrogram]);

  return (
    <div style={{ height: 220, width: "100%", overflow: "hidden", borderRadius: 14, border: "1px solid rgba(255,255,255,0.10)" }}>
      <canvas ref={ref} style={{ width: "100%", height: "100%", display: "block" }} />
    </div>
  );
}
