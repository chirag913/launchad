import React from "react";
import { useCurrentFrame } from "remotion";
import { adConfig, dialogue, f, FieldKey } from "../config/adConfig";
import { CAPTURE_Y, CONTENT_W, GUTTER } from "../config/layout";
import { DUR, EASE, mix, pop, ramp } from "../motion";
import { Check } from "./Icons";
import { sceneStart } from "./SceneTransition";
import { swap } from "./TextTransition";
import { cardStyle, Dot, Label } from "./ui";

const C = adConfig.colors;
const ROW_H = 100;
const HEAD_H = 88;

/** For each field, in the order the call reaches it: when the AI asks
 *  (row appears, "Listening…") and when the buyer answers (value lands). */
export const captureTimes = (() => {
  const out: { key: FieldKey; ask: number; answer: number }[] = [];
  for (const d of dialogue) {
    if (d.asks) {
      const ans = dialogue.find((x) => x.answers === d.asks);
      // the value lands while the buyer is saying it
      if (ans) out.push({ key: d.asks, ask: f(d.start + 0.15), answer: f(ans.start + 0.3) });
    }
  }
  return out;
})();

/**
 * What the call has captured so far. Quiet, compact: a row only appears when
 * the AI asks about it and its value lands as the buyer answers — the panel
 * fills in the rhythm of the conversation, never all at once.
 */
export const CapturePanel: React.FC = () => {
  const frame = useCurrentFrame();
  const handoffAt = sceneStart("handoff");
  if (!captureTimes.length || frame < captureTimes[0].ask - 10) return null;
  const out = ramp(frame, handoffAt - 4, 7, EASE.out);
  if (out >= 1) return null;

  const appear = ramp(frame, captureTimes[0].ask - 10, DUR.panel);
  // The card grows to fit a row BEFORE the row enters, so nothing is clipped.
  const rowsShown = captureTimes.reduce((n, c) => n + ramp(frame, c.ask - 8, 8, EASE.inOut), 0);
  const h = HEAD_H + rowsShown * ROW_H + 12;

  return (
    <div
      style={cardStyle({
        left: GUTTER,
        top: CAPTURE_Y,
        width: CONTENT_W,
        height: h,
        opacity: appear * (1 - out),
        transform: `translateY(${(mix(appear, 14, 0) - out * 24).toFixed(2)}px)`,
      })}
    >
      <div style={{ display: "flex", alignItems: "center", height: HEAD_H, padding: "0 40px", borderBottom: `1px solid ${C.border}` }}>
        <Label>Captured from the call</Label>
        <div style={{ flex: 1 }} />
        <Dot color={C.accentBright} size={10} glow={8} />
        <div style={{ fontFamily: adConfig.type.ui, fontSize: 25, fontWeight: 500, color: C.textDim, marginLeft: 10 }}>Live</div>
      </div>

      {captureTimes.map((c, i) => {
        const field = adConfig.fields[c.key];
        const rowT = ramp(frame, c.ask, DUR.panel);
        if (rowT <= 0) return null;
        // "Listening…" leaves completely, then the answer lands.
        const sw = swap(frame, c.answer - 7, 5, 2, DUR.panel);
        const tick = pop(frame, c.answer + 2, { damping: 15 }, DUR.sheet);
        const dots = ".".repeat(1 + (Math.floor((frame - c.ask) / 5) % 3));
        return (
          <div
            key={c.key}
            style={{
              position: "absolute",
              left: 40,
              right: 40,
              top: HEAD_H + i * ROW_H,
              height: ROW_H,
              display: "flex",
              alignItems: "center",
              borderBottom: i < captureTimes.length - 1 ? `1px solid ${C.border}` : undefined,
              opacity: rowT,
              transform: `translateY(${mix(rowT, 10, 0).toFixed(2)}px)`,
            }}
          >
            <Label size={25} color={C.textDim}>
              {field.label}
            </Label>
            <div style={{ flex: 1 }} />
            <div style={{ display: "grid", justifyItems: "end", alignItems: "center" }}>
              <div
                style={{
                  gridArea: "1 / 1",
                  fontFamily: adConfig.type.ui,
                  fontWeight: 500,
                  fontSize: 32,
                  color: C.accent,
                  opacity: 1 - sw.out,
                  whiteSpace: "nowrap",
                }}
              >
                Listening{dots}
              </div>
              <div
                style={{
                  gridArea: "1 / 1",
                  fontFamily: adConfig.type.ui,
                  fontWeight: 600,
                  fontSize: 48,
                  letterSpacing: "-0.02em",
                  color: C.text,
                  whiteSpace: "nowrap",
                  opacity: sw.in,
                  transform: `translateY(${mix(sw.in, 12, 0).toFixed(2)}px)`,
                }}
              >
                {field.value}
              </div>
            </div>
            <div
              style={{
                width: 40,
                height: 40,
                marginLeft: 22,
                borderRadius: 40,
                background: "rgba(63,216,177,0.14)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: Math.min(1, tick * 1.4),
                transform: `scale(${mix(tick, 0.6, 1).toFixed(4)})`,
              }}
            >
              <Check size={24} color={C.accentBright} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
