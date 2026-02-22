import * as React from "react";

type Props = {
  /**
   * If provided, we decode the audio file and draw an accurate full-file waveform + time axis + playhead.
   * This is the recommended mode.
   */
  audioUrl?: string;

  /**
   * If you don't have an audioUrl yet, you can pass samples directly.
   * IMPORTANT: if this array is downsampled (e.g. only 2000 points), time labels will be approximate unless you also pass durationSec.
   */
  samples?: number[];

  /**
   * Sample rate for samples-mode metadata/time estimation.
   * (Only used if `samples` is provided and `durationSec` is not.)
   */
  sampleRate?: number;

  /**
   * Optional: pass real duration (seconds) when using samples-mode and your samples are downsampled.
   * If omitted, duration is estimated as samples.length / sampleRate.
   */
  durationSec?: number;

  enabled?: boolean;
};

type WaveData = {
  peaks: Float32Array; // one peak per pixel column
  duration: number; // seconds
  sampleRate: number;
};

function pickTickStepSec(duration: number) {
  // Aim ~8 ticks across
  const candidates = [0.25, 0.5, 1, 2, 5, 10, 15, 30, 60];
  const targetTicks = 8;
  const raw = duration / targetTicks;
  return candidates.reduce(
    (best, cur) => (Math.abs(cur - raw) < Math.abs(best - raw) ? cur : best),
    candidates[0]
  );
}

function formatTime(s: number) {
  if (!Number.isFinite(s) || s < 0) return "0:00";
  const mm = Math.floor(s / 60);
  const ss = Math.floor(s % 60);
  return `${mm}:${String(ss).padStart(2, "0")}`;
}

function computePeaks(samples: Float32Array, columns: number) {
  const peaks = new Float32Array(columns);
  const blockSize = Math.floor(samples.length / columns) || 1;

  for (let i = 0; i < columns; i++) {
    const start = i * blockSize;
    const end = Math.min(samples.length, start + blockSize);
    let max = 0;
    for (let j = start; j < end; j++) {
      const v = Math.abs(samples[j]);
      if (v > max) max = v;
    }
    peaks[i] = max;
  }
  return peaks;
}

export function Waveform({
  audioUrl,
  samples,
  sampleRate,
  durationSec,
  enabled = true,
}: Props) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const rafRef = React.useRef<number | null>(null);

  const [wave, setWave] = React.useState<WaveData | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  const draw = React.useCallback(
    (opts?: { forceIdle?: boolean }) => {
      const canvas = canvasRef.current;
      const audio = audioRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      // HiDPI
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Theme colors (match your dark UI)
      const bg = "rgba(9,9,11,0.55)";
      const grid = "rgba(255,255,255,0.08)";
      const axis = "rgba(255,255,255,0.12)";
      const waveColor = "rgba(34,211,238,0.95)";
      const waveFill = "rgba(34,211,238,0.16)";
      const text = "rgba(161,161,170,0.95)";
      const playhead = "rgba(251,113,133,0.95)";

      // Plot area
      const padL = 10;
      const padR = 10;
      const padT = 12;
      const padB = 24; // time labels
      const plotW = Math.max(1, w - padL - padR);
      const plotH = Math.max(1, h - padT - padB);
      const midY = padT + plotH / 2;

      // Background
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Mid line
      ctx.strokeStyle = axis;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padL, midY);
      ctx.lineTo(padL + plotW, midY);
      ctx.stroke();

      // Idle state (no wave yet)
      if (!wave || opts?.forceIdle) {
        ctx.strokeStyle = "rgba(34,211,238,0.55)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x < plotW; x++) {
          const t = x / plotW;
          const y =
            midY +
            Math.sin(t * Math.PI * 6) *
              (plotH * 0.18) *
              (0.35 + 0.65 * Math.sin(t * Math.PI));
          const px = padL + x;
          if (x === 0) ctx.moveTo(px, y);
          else ctx.lineTo(px, y);
        }
        ctx.stroke();

        ctx.fillStyle = text;
        ctx.font = "12px ui-sans-serif, system-ui";
        ctx.textAlign = "left";
        ctx.textBaseline = "bottom";
        ctx.fillText("Waveform will appear after audio loads.", padL, h - 6);
        return;
      }

      // Grid + time labels
      const duration = Math.max(0.001, wave.duration);
      const step = pickTickStepSec(duration);

      ctx.font = "12px ui-sans-serif, system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillStyle = text;

      for (let t = 0; t <= duration + 1e-6; t += step) {
        const x = padL + (t / duration) * plotW;

        ctx.strokeStyle = grid;
        ctx.beginPath();
        ctx.moveTo(x, padT);
        ctx.lineTo(x, padT + plotH);
        ctx.stroke();

        const label = t % 1 === 0 ? `${t}s` : `${t.toFixed(1)}s`;
        ctx.fillText(label, x, padT + plotH + 4);
      }

      // Waveform
      const peaks = wave.peaks;
      const amp = plotH * 0.45;

      ctx.fillStyle = waveFill;
      ctx.strokeStyle = waveColor;
      ctx.lineWidth = 1.5;

      // filled shape
      ctx.beginPath();
      for (let i = 0; i < peaks.length; i++) {
        const x = padL + (i / (peaks.length - 1)) * plotW;
        const y = midY - peaks[i] * amp;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      for (let i = peaks.length - 1; i >= 0; i--) {
        const x = padL + (i / (peaks.length - 1)) * plotW;
        const y = midY + peaks[i] * amp;
        ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();

      // crisp top outline
      ctx.beginPath();
      for (let i = 0; i < peaks.length; i++) {
        const x = padL + (i / (peaks.length - 1)) * plotW;
        const y = midY - peaks[i] * amp;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Playhead only if we have a real audio element
      if (audioUrl && audio && Number.isFinite(audio.duration) && audio.duration > 0) {
        const cur = Math.min(audio.currentTime, audio.duration);
        const x = padL + (cur / audio.duration) * plotW;

        ctx.strokeStyle = playhead;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, padT);
        ctx.lineTo(x, padT + plotH);
        ctx.stroke();

        // time readout
        ctx.fillStyle = text;
        ctx.textAlign = "right";
        ctx.textBaseline = "bottom";
        ctx.fillText(
          `${formatTime(cur)} / ${formatTime(audio.duration)}`,
          padL + plotW,
          padT - 2
        );
      }
    },
    [wave, audioUrl]
  );

  // Build waveform from either audioUrl OR samples
  React.useEffect(() => {
    let cancelled = false;

    setWave(null);
    setErr(null);

    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!enabled) {
      draw({ forceIdle: true });
      return;
    }

    // Mode: samples provided
    if (samples && samples.length > 0) {
      const width = canvas.clientWidth || 600;
      const columns = Math.max(200, Math.min(2000, Math.floor(width)));

      const float = Float32Array.from(samples);
      const peaks = computePeaks(float, columns);

      const sr = sampleRate ?? 22050;
      const duration =
        typeof durationSec === "number" && Number.isFinite(durationSec) && durationSec > 0
          ? durationSec
          : float.length / sr;

      setWave({ peaks, duration, sampleRate: sr });
      return;
    }

    // Mode: audioUrl (accurate)
    if (!audioUrl) {
      draw({ forceIdle: true });
      return;
    }

    (async () => {
      try {
        const res = await fetch(audioUrl);
        if (!res.ok) throw new Error(`Failed to fetch audio: ${res.status}`);
        const arr = await res.arrayBuffer();

        const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
        const ac: AudioContext = new AudioContextCtor();

        const decoded = await ac.decodeAudioData(arr.slice(0));
        const ch0 = decoded.getChannelData(0);

        const width = canvas.clientWidth || 600;
        const columns = Math.max(200, Math.min(2000, Math.floor(width)));
        const peaks = computePeaks(ch0, columns);

        if (cancelled) return;
        setWave({ peaks, duration: decoded.duration, sampleRate: decoded.sampleRate });

        ac.close().catch(() => {});
      } catch (e: any) {
        if (cancelled) return;
        setErr(e?.message || String(e));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [audioUrl, samples, sampleRate, durationSec, enabled, draw]);

  // Redraw on resize (and recompute peaks for samples-mode to match new width)
  React.useEffect(() => {
    const onResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      if (samples && samples.length > 0) {
        const width = canvas.clientWidth || 600;
        const columns = Math.max(200, Math.min(2000, Math.floor(width)));
        const float = Float32Array.from(samples);
        const peaks = computePeaks(float, columns);

        setWave((prev) => {
          if (!prev) return prev;
          return { ...prev, peaks };
        });
      }

      draw();
    };

    window.addEventListener("resize", onResize);
    draw();
    return () => window.removeEventListener("resize", onResize);
  }, [draw, samples]);

  // Animate playhead while playing (audioUrl mode only)
  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!audioUrl) return;

    const tick = () => {
      draw();
      rafRef.current = requestAnimationFrame(tick);
    };

    const onPlay = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };

    const onPause = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      draw();
    };

    const onEnded = onPause;
    const onTimeUpdate = () => draw();

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("timeupdate", onTimeUpdate);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("timeupdate", onTimeUpdate);

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [draw, audioUrl]);

  const containerStyle: React.CSSProperties = {
    marginTop: 10,
    height: 140,
    width: "100%",
    overflow: "hidden",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(9,9,11,0.35)",
  };

  return (
    <div>
      {/* Only show audio controls when audioUrl exists */}
      {audioUrl ? (
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="auto"
          controls
          style={{ width: "100%", marginTop: 8 }}
        />
      ) : null}

      <div style={containerStyle}>
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
      </div>

      {!audioUrl && (!samples || samples.length === 0) ? (
        <div style={{ marginTop: 8, fontSize: 12, color: "var(--muted)" }}>
          Mock mode: no audioUrl / samples yet.
        </div>
      ) : null}

      {err ? (
        <div style={{ marginTop: 8, fontSize: 12, color: "#fecaca" }}>
          Waveform error: {err}
        </div>
      ) : null}

      {wave ? (
        <div style={{ marginTop: 8, fontSize: 12, color: "var(--muted)" }}>
          duration: {wave.duration.toFixed(2)}s · sample_rate: {wave.sampleRate}
        </div>
      ) : null}
    </div>
  );
}