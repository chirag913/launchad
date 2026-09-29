import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { adConfig } from "../config/adConfig";

const C = adConfig.colors;

/** Near-black with one slow teal glow low in the frame, plus a fine grain so
 *  the gradient does not band once H.264 gets hold of it. The glow drifts a
 *  few pixels over the whole ad — enough to feel lit, never enough to notice. */
export const Background: React.FC<{ glow?: number }> = ({ glow = 1 }) => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 90) * 30;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(1100px 900px at ${220 + drift}px ${1380 - drift * 0.6}px, ${C.bgGlow} 0%, rgba(13,31,25,0.55) 38%, rgba(9,11,11,0) 72%)`,
          opacity: glow,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(900px 700px at 980px 180px, rgba(31,179,145,0.05) 0%, rgba(9,11,11,0) 70%)`,
        }}
      />
      <AbsoluteFill style={{ opacity: 0.07, mixBlendMode: "overlay" }}>
        <svg width="100%" height="100%">
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={3} stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
