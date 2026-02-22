import * as React from "react";

export function Waveform({ samples }: { samples: number[] }) {
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
    ctx.fillStyle = "rgba(255,255,255,0.03)";
    ctx.fillRect(0, 0, w, h);

    if (!samples?.length) return;

    const mid = h / 2;
    ctx.strokeStyle = "rgba(34,211,238,0.95)";
    ctx.lineWidth = 2;
    ctx.beginPath();

    // downsample to canvas width
    const step = Math.max(1, Math.floor(samples.length / w));
    let x = 0;
    for (let i = 0; i < samples.length; i += step) {
      const s = samples[i] ?? 0;
      const y = mid - s * (h * 0.42);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      x++;
      if (x >= w) break;
    }
    ctx.stroke();
  }, [samples]);

  return (
    <div style={{ height: 110, width: "100%", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 14, overflow: "hidden" }}>
      <canvas ref={ref} style={{ width: "100%", height: "100%", display: "block" }} />
    </div>
  );
}