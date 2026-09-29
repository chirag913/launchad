import React from "react";
import { useCurrentFrame } from "remotion";
import { adConfig, f } from "../config/adConfig";
import { CONTENT_W, GUTTER, SUBTITLE_Y } from "../config/layout";
import { EASE, mix, ramp } from "../motion";

const C = adConfig.colors;

/** What the AI is saying, as it says it: Hindi as spoken, English beneath. */
export const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {adConfig.call.subtitles.map((s) => {
        const a = f(s.from);
        const b = f(s.to);
        if (frame < a - 1 || frame > b + 8) return null;
        const tin = ramp(frame, a, 8, EASE.out);
        const tout = ramp(frame, b, 7, EASE.out);
        return (
          <div
            key={s.from}
            style={{
              position: "absolute",
              left: GUTTER,
              top: SUBTITLE_Y,
              width: CONTENT_W,
              textAlign: "center",
              opacity: tin * (1 - tout),
              transform: `translateY(${(mix(tin, 10, 0) - tout * 6).toFixed(2)}px)`,
            }}
          >
            <div style={{ fontFamily: adConfig.type.hindi, fontWeight: 500, fontSize: 46, color: C.text, lineHeight: 1.35 }}>“{s.hi}”</div>
            <div style={{ fontFamily: adConfig.type.ui, fontWeight: 500, fontSize: 31, color: C.textDim, marginTop: 10 }}>{s.en}</div>
          </div>
        );
      })}
    </>
  );
};
