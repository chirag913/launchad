import React, { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import { measureText } from "@remotion/layout-utils";
import { adConfig, HeadlineLine } from "../config/adConfig";
import { DUR, EASE, mix, ramp } from "../motion";

const T = adConfig.type;
const C = adConfig.colors;

const MAX_SIZE = T.headlineSize;
const MIN_SIZE = 64;

/** Largest size at which every line fits `width`. */
function fitSize(lines: readonly HeadlineLine[], width: number): number {
  let size: number = MAX_SIZE;
  for (const l of lines) {
    const w = measureText({
      text: l.text,
      fontFamily: "Inter Tight",
      fontWeight: 800,
      fontSize: 100,
      letterSpacing: T.headlineTracking,
    }).width;
    size = Math.min(size, Math.floor((width / w) * 100));
  }
  return Math.max(MIN_SIZE, size);
}

type Props = {
  lines: readonly HeadlineLine[];
  /** frame the words start rising */
  inAt: number;
  /** frame the words start leaving (omit to hold) */
  outAt?: number;
  width: number;
  /** extra frames between words */
  stagger?: number;
};

/**
 * Headline whose words rise out of per-word masks and leave the same way,
 * upward. The mask (overflow: hidden on each word) is what makes it read as
 * type being set rather than a text box fading.
 */
export const AnimatedText: React.FC<Props> = ({ lines, inAt, outAt, width, stagger = 2 }) => {
  const frame = useCurrentFrame();
  const size = useMemo(() => fitSize(lines, width), [lines, width]);

  let wordIndex = 0;
  return (
    <div style={{ width, fontFamily: T.display, fontWeight: 800, fontSize: size, letterSpacing: T.headlineTracking, lineHeight: 0.98 }}>
      {lines.map((line, li) => {
        const words = line.text.split(" ");
        return (
          <div key={li} style={{ display: "flex", flexWrap: "nowrap", whiteSpace: "nowrap" }}>
            {words.map((w, wi) => {
              const i = wordIndex++;
              const tIn = ramp(frame, inAt + i * stagger, DUR.word, EASE.word);
              const tOut = outAt === undefined ? 0 : ramp(frame, outAt, 7, EASE.inOut);
              const y = mix(tIn, 108, 0) + mix(tOut, 0, -108);
              const isLastWord = li === lines.length - 1 && wi === words.length - 1;
              const trailingDot = !line.accent && isLastWord && w.endsWith(".");
              const body = trailingDot ? w.slice(0, -1) : w;
              return (
                <span
                  key={wi}
                  style={{
                    display: "inline-block",
                    overflow: "hidden",
                    paddingBottom: "0.06em",
                    marginBottom: "-0.06em",
                    marginRight: wi < words.length - 1 ? "0.24em" : 0,
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      transform: `translateY(${y.toFixed(2)}%)`,
                      color: line.accent ? C.accentBright : C.text,
                    }}
                  >
                    {body}
                    {trailingDot ? <span style={{ color: C.accentBright }}>.</span> : null}
                  </span>
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
