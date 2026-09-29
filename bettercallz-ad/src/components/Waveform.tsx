import React, { useMemo } from "react";
import { staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useAudioData } from "@remotion/media-utils";
import { adConfig } from "../config/adConfig";

const C = adConfig.colors;

type Props = {
  width: number;
  height: number;
  bars: number;
  /** seconds of voice history each bar step represents */
  step?: number;
  opacity?: number;
  barWidth?: number;
};

/**
 * A scrolling level meter driven by the REAL call audio. Each bar is the RMS
 * of the voice at a moment in the recent past, newest on the right — so the
 * bars move exactly when the AI speaks and go quiet in its pauses. Before the
 * voice starts (or after it ends) the line rests as a row of dots.
 */
export const Waveform: React.FC<Props> = ({ width, height, bars, step = 0.05, opacity = 1, barWidth }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const audio = useAudioData(staticFile(adConfig.call.voiceSrc));

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
    const max = Math.max(...out, 1e-6);
    return out.map((v) => Math.min(1, (v / max) * 1.25));
  }, [audio]);

  const tAudio = frame / fps - adConfig.call.voiceAt;
  const gap = width / bars;
  const bw = barWidth ?? Math.max(3, gap * 0.46);

  return (
    <svg width={width} height={height} style={{ display: "block", opacity }}>
      {Array.from({ length: bars }).map((_, i) => {
        const t = tAudio - (bars - 1 - i) * step;
        let level = 0;
        if (env && t >= 0) {
          const idx = Math.floor(t / 0.01);
          level = idx < env.length ? env[idx] : 0;
          // shape it so quiet parts read as quiet, speech reads as speech
          level = Math.pow(level, 0.8);
        }
        const minH = bw;
        const h = Math.max(minH, level * height * 0.96);
        const x = i * gap + (gap - bw) / 2;
        // newest bars brightest; history fades a little toward the left
        const age = (bars - 1 - i) / bars;
        const alpha = level > 0.02 ? 0.55 + 0.45 * (1 - age) : 0.35;
        return (
          <rect
            key={i}
            x={x}
            y={(height - h) / 2}
            width={bw}
            height={h}
            rx={bw / 2}
            fill={level > 0.02 ? C.accentBright : C.accent}
            opacity={alpha}
          />
        );
      })}
    </svg>
  );
};
