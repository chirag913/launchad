import React from "react";
import { useCurrentFrame } from "remotion";
import { adConfig } from "../config/adConfig";
import { END_CARD_AT } from "../config/headlineSchedule";
import { CONTENT_W, GUTTER } from "../config/layout";
import { DUR, EASE, mix, pop, ramp } from "../motion";
import { ArrowRight } from "./Icons";
import { Wordmark } from "./Wordmark";

const C = adConfig.colors;

/** Vertically centred in the Reels safe area (≈270–1250px). */
export const CTA_Y = 560;

/** End card: wordmark, one button, one URL. Nothing else. */
export const FinalCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const at = END_CARD_AT;
  if (frame < at - 1) return null;

  const mark = ramp(frame, at, DUR.hero, EASE.word);
  const btn = pop(frame, at + 5, { damping: 17, stiffness: 150 }, DUR.hero);
  const btnOpacity = ramp(frame, at + 5, 8);
  const url = ramp(frame, at + 9, DUR.panel);
  // one slow sheen across the button, then it rests
  const sheen = ramp(frame, at + 16, 26, EASE.inOut);
  // soft breathing halo — the only thing moving once the card is set
  const breathe = 0.5 + 0.5 * Math.sin((frame - at) / 9);

  return (
    <div style={{ position: "absolute", left: GUTTER, top: CTA_Y, width: CONTENT_W }}>
      <div style={{ opacity: mark, transform: `translateY(${mix(mark, 34, 0).toFixed(2)}px)` }}>
        <Wordmark size={150} />
      </div>

      <div
        style={{
          position: "relative",
          marginTop: 64,
          height: 144,
          borderRadius: 999,
          background: `linear-gradient(180deg, ${C.accentBright} 0%, #2CC39E 100%)`,
          boxShadow: `0 0 0 1px rgba(255,255,255,0.12) inset, 0 20px 60px rgba(31,179,145,${(0.22 + 0.12 * breathe * btnOpacity).toFixed(3)})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 22,
          overflow: "hidden",
          opacity: btnOpacity,
          transform: `translateY(${mix(btn, 26, 0).toFixed(2)}px) scale(${mix(btn, 0.94, 1).toFixed(4)})`,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            width: 220,
            left: mix(sheen, -260, CONTENT_W + 40),
            background: "linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0) 100%)",
            opacity: sheen > 0 && sheen < 1 ? 1 : 0,
          }}
        />
        <div style={{ fontFamily: adConfig.type.display, fontWeight: 800, fontSize: 52, letterSpacing: "-0.03em", color: C.accentInk, whiteSpace: "nowrap" }}>
          {adConfig.cta.label}
        </div>
        <ArrowRight size={52} color={C.accentInk} stroke={2.6} style={{ transform: `translateX(${(Math.sin((frame - at) / 7) * 4 * btnOpacity).toFixed(2)}px)` }} />
      </div>

      <div
        style={{
          marginTop: 36,
          textAlign: "center",
          fontFamily: adConfig.type.ui,
          fontWeight: 500,
          fontSize: 42,
          letterSpacing: "-0.01em",
          color: C.text,
          opacity: url,
          transform: `translateY(${mix(url, 12, 0).toFixed(2)}px)`,
        }}
      >
        {adConfig.cta.url}
      </div>
    </div>
  );
};
