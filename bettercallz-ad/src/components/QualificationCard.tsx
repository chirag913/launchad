import React from "react";
import { useCurrentFrame } from "remotion";
import { adConfig, f } from "../config/adConfig";
import { CONTENT_W, GUTTER, QUAL_Y } from "../config/layout";
import { DUR, EASE, mix, pop, ramp } from "../motion";
import { Check } from "./Icons";
import { sceneStart } from "./SceneTransition";
import { swap } from "./TextTransition";
import { cardStyle, Dot, Label } from "./ui";

const C = adConfig.colors;
const ROW_H = 104;
const HEAD_H = 96;

/** Frame a field is asked (row appears) and answered (value lands). */
export const fieldTimes = (i: number) => {
  const q = adConfig.qualification[i];
  const answer = sceneStart("qualify") + f(q.at);
  return { ask: answer - 11, answer };
};

/**
 * Qualification, extracted field by field. A row only appears when the AI
 * asks about it ("Listening…"), and its value lands when the buyer answers —
 * so the panel fills in the rhythm of a conversation, never all at once.
 */
export const QualificationCard: React.FC = () => {
  const frame = useCurrentFrame();
  const qualAt = sceneStart("qualify");
  const handoffAt = sceneStart("handoff");
  if (frame < qualAt) return null;

  const rows = adConfig.qualification;
  const appear = ramp(frame, qualAt + 1, DUR.panel);
  const out = ramp(frame, handoffAt - 4, 7, EASE.out);
  if (out >= 1) return null;

  // The card grows as rows are asked, so there is never an empty box waiting.
  // The card grows to make room first; the row only enters once it fits,
  // so no row is ever cut off by the card edge.
  const visibleRows = rows.reduce((n, _, i) => n + ramp(frame, fieldTimes(i).ask - 8, 8, EASE.inOut), 0);
  const h = HEAD_H + 12 + visibleRows * ROW_H + 18;

  return (
    <div
      style={cardStyle({
        left: GUTTER,
        top: QUAL_Y,
        width: CONTENT_W,
        height: h,
        opacity: appear * (1 - out),
        transform: `translateY(${(mix(appear, 16, 0) - out * 24).toFixed(2)}px)`,
      })}
    >
      <div style={{ display: "flex", alignItems: "center", height: HEAD_H, padding: "0 40px", borderBottom: `1px solid ${C.border}` }}>
        <Label>Buyer qualification</Label>
        <div style={{ flex: 1 }} />
        <Dot color={C.accentBright} size={10} glow={8} />
        <div style={{ fontFamily: adConfig.type.ui, fontSize: 26, fontWeight: 500, color: C.textDim, marginLeft: 10, whiteSpace: "nowrap" }}>
          From the live call
        </div>
      </div>

      {rows.map((r, i) => {
        const { ask, answer } = fieldTimes(i);
        const rowT = ramp(frame, ask, DUR.panel);
        if (rowT <= 0) return null;
        // "Listening…" leaves completely, then the answer lands
        const sw = swap(frame, answer - 7, 5, 2, DUR.panel);
        const ans = sw.in;
        const tick = pop(frame, answer + 2, { damping: 15 }, DUR.sheet);
        const dots = ".".repeat(1 + (Math.floor((frame - ask) / 5) % 3));
        const highlight = "highlight" in r && r.highlight;
        return (
          <div
            key={r.label}
            style={{
              position: "absolute",
              left: 40,
              right: 40,
              top: HEAD_H + 12 + i * ROW_H,
              height: ROW_H,
              display: "flex",
              alignItems: "center",
              borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : undefined,
              opacity: rowT,
              transform: `translateY(${mix(rowT, 12, 0).toFixed(2)}px)`,
            }}
          >
            <Label size={25} color={C.textDim}>
              {r.label}
            </Label>
            <div style={{ flex: 1 }} />
            <div style={{ position: "relative", height: 60, minWidth: 320, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
              {/* listening… */}
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  fontFamily: adConfig.type.ui,
                  fontWeight: 500,
                  fontSize: 33,
                  color: C.accent,
                  opacity: 1 - sw.out,
                  transform: `translateY(${mix(sw.out, 0, -10).toFixed(2)}px)`,
                  whiteSpace: "nowrap",
                }}
              >
                Listening{dots}
              </div>
              {/* the answer */}
              <div
                style={{
                  transform: `translateY(${mix(ans, 14, 0).toFixed(2)}px)`,
                  opacity: ans,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {highlight ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      fontFamily: adConfig.type.ui,
                      fontWeight: 700,
                      fontSize: 44,
                      color: C.accentInk,
                      background: C.accentBright,
                      padding: "8px 24px 8px 20px",
                      borderRadius: 999,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    <Dot color={C.accentInk} size={12} />
                    {r.value}
                  </div>
                ) : (
                  <div style={{ fontFamily: adConfig.type.ui, fontWeight: 600, fontSize: 52, letterSpacing: "-0.02em", color: C.text, whiteSpace: "nowrap" }}>
                    {r.value}
                  </div>
                )}
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
