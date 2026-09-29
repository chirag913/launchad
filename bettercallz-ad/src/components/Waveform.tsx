import React, { useMemo } from "react";
import { staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useAudioData } from "@remotion/media-utils";
import { adConfig, dialogue, Speaker } from "../config/adConfig";

const C = adConfig.colors;

/** What is playing at a timeline second: the source second and speaker. */
function sourceAt(t: number): { src: number; speaker: Speaker } | null {
  for (const d of dialogue) {
    if (t >= d.start && t < d.end) return { src: d.from + (t - d.start), speaker: d.speaker };
  }
  return null;
}

type Props = {
  width: number;
  height: number;
  bars: number;
  /** seconds of history per bar */
  step?: number;
};

/**
 * A scrolling level meter driven by the REAL call recording. Each bar is the
 * loudness of the call at a moment in the recent past (newest on the right),
 * read through the same edit the soundtrack plays — so bars move exactly
 * when someone speaks. The AI's voice draws in teal, the buyer's in white.
 */
export const Waveform: React.FC<Props> = ({ width, height, bars, step = 0.045 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const audio = useAudioData(staticFile(adConfig.call.src));

  const env = useMemo(() => {
    if (!audio) return null;
    const data = audio.channelWaveforms[0];
    const sr = audio.sampleRate;
    const win = Math.round(sr * 0.025);
    const hop = Math.round(sr * 0.01);
    const out: number[] = [];
    for (let i = 0; i + win < data.length; i += hop) {
      let s = 0;
      for (let j = 0; j < win; j++) s += data[i + j] * data[i + j];
      out.push(Math.sqrt(s / win));
    }
    const sorted = [...out].sort((a, b) => a - b);
    const ref = sorted[Math.floor(sorted.length * 0.98)] || 1e-6;
    return out.map((v) => Math.min(1, v / ref));
  }, [audio]);

  const now = frame / fps;
  const gap = width / bars;
  const bw = Math.max(4, gap * 0.46);

  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      {Array.from({ length: bars }).map((_, i) => {
        const t = now - (bars - 1 - i) * step;
        const at = sourceAt(t);
        let level = 0;
        if (env && at) {
          const idx = Math.floor(at.src / 0.01);
          level = idx < env.length ? Math.pow(env[idx], 0.85) : 0;
        }
        const live = level > 0.06;
        const h = Math.max(bw, level * height * 0.96);
        const age = (bars - 1 - i) / bars;
        const color = !live ? C.accent : at?.speaker === "buyer" ? C.text : C.accentBright;
        return (
          <rect
            key={i}
            x={i * gap + (gap - bw) / 2}
            y={(height - h) / 2}
            width={bw}
            height={h}
            rx={bw / 2}
            fill={color}
            opacity={live ? 0.5 + 0.5 * (1 - age) : 0.32}
          />
        );
      })}
    </svg>
  );
};
