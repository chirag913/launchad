import React, { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import { measureText } from "@remotion/layout-utils";
import { adConfig } from "../config/adConfig";
import { ScheduledHeadline } from "../config/headlineSchedule";
import { transitionStyle } from "./TextTransition";

const T = adConfig.type;
const C = adConfig.colors;

/** Negative tracking tightens spaces too; this restores a deliberate word gap. */
const WORD_SPACING_EM = 0.12;

/** Throw if any line is wider than the container at its explicit size.
 *  Headlines never wrap and are never auto-shrunk: a line that does not fit
 *  is a copy decision (break it into another line in adConfig). */
function assertFits(h: ScheduledHeadline, width: number) {
  for (const l of h.lines) {
    const w = measureText({
      text: l.text,
      fontFamily: "Inter Tight",
      fontWeight: 800,
      fontSize: h.size,
      letterSpacing: T.headlineTracking,
    }).width + (l.text.split(" ").length - 1) * WORD_SPACING_EM * h.size;
    if (w > width) {
      throw new Error(`Headline line "${l.text}" is ${Math.ceil(w)}px wide at ${h.size}px; the container is ${width}px.`);
    }
  }
}

/**
 * One headline state. Fixed size, fixed line height, explicit width, one
 * line per configured line — nothing wraps. Each line goes through its own
 * enter window (TextTransition) and the state exits as one block.
 */
export const AnimatedText: React.FC<{ headline: ScheduledHeadline; width: number }> = ({ headline, width }) => {
  const frame = useCurrentFrame();
  useMemo(() => assertFits(headline, width), [headline, width]);
  const lineH = Math.round(headline.size * T.headlineLineHeight);

  return (
    <div
      style={{
        width,
        fontFamily: T.display,
        fontWeight: 800,
        fontSize: headline.size,
        letterSpacing: T.headlineTracking,
        wordSpacing: `${WORD_SPACING_EM}em`,
        lineHeight: `${lineH}px`,
      }}
    >
      {headline.lines.map((line, li) => {
        const s = transitionStyle(frame, { enterAt: line.enterAt, exitAt: headline.exitAt });
        const isLast = li === headline.lines.length - 1;
        const trailingDot = !line.accent && line.text.endsWith(".") && (isLast || headline.lines[li + 1]?.accent);
        const body = trailingDot ? line.text.slice(0, -1) : line.text;
        return (
          <div
            key={li}
            style={{
              height: lineH,
              whiteSpace: "pre",
              color: line.accent ? C.accentBright : C.text,
              ...(s ?? { opacity: 0 }),
            }}
          >
            {body}
            {trailingDot ? <span style={{ color: C.accentBright }}>.</span> : null}
          </div>
        );
      })}
    </div>
  );
};
