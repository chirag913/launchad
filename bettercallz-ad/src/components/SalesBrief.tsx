import React from "react";
import { useCurrentFrame } from "remotion";
import { adConfig } from "../config/adConfig";
import { CONTENT_W, GUTTER, HERO_Y } from "../config/layout";
import { DUR, EASE, enterAt, mix, ramp } from "../motion";
import { captureTimes } from "./CapturePanel";
import { Users } from "./Icons";
import { sceneStart } from "./SceneTransition";
import { Avatar, cardStyle, Dot, Label } from "./ui";

const C = adConfig.colors;
const H = adConfig.handoff;
const L = adConfig.lead;

/**
 * The handoff: what the call captured, condensed into the brief a
 * salesperson opens before calling back. Only facts the buyer said.
 */
export const SalesBrief: React.FC = () => {
  const frame = useCurrentFrame();
  const at = sceneStart("handoff");
  const closeAt = sceneStart("close");
  if (frame < at) return null;
  // gone before the payoff headline (which owns the frame) enters
  const out = ramp(frame, closeAt - 8, 8, EASE.out);
  if (out >= 1) return null;

  const cardIn = ramp(frame, at + 5, DUR.hero, EASE.out);

  return (
    <div
      style={cardStyle({
        left: GUTTER,
        top: HERO_Y,
        width: CONTENT_W,
        padding: 44,
        opacity: cardIn * (1 - out),
        transform: `translateY(${(mix(cardIn, 30, 0) - out * 24).toFixed(2)}px) scale(${mix(cardIn, 0.97, 1).toFixed(4)})`,
        transformOrigin: "50% 0%",
        border: `1px solid rgba(63,216,177,0.24)`,
      })}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <Label>{H.briefTitle}</Label>
        <div style={{ flex: 1 }} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontFamily: adConfig.type.ui,
            fontWeight: 600,
            fontSize: 27,
            color: C.accentBright,
            padding: "10px 20px",
            borderRadius: 999,
            background: "rgba(63,216,177,0.10)",
            border: "1px solid rgba(63,216,177,0.28)",
          }}
        >
          <Dot color={C.accentBright} size={10} glow={8} />
          {H.badge}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 32, ...enterAt(frame, at + 9, 0) }}>
        <Avatar initials={L.initials} size={84} />
        <div>
          <div style={{ fontFamily: adConfig.type.ui, fontWeight: 600, fontSize: 46, letterSpacing: "-0.025em", color: C.text }}>{L.name}</div>
          <div style={{ fontFamily: adConfig.type.ui, fontWeight: 500, fontSize: 28, color: C.textMute, marginTop: 6 }}>
            {H.status} · {L.source}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 32 }}>
        {captureTimes.map((c, i) => {
          const field = adConfig.fields[c.key];
          return (
            <div
              key={c.key}
              style={{
                borderRadius: 22,
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${C.border}`,
                padding: "24px 28px",
                ...enterAt(frame, at + 12, i * 2, { y: 14 }),
              }}
            >
              <Label size={22}>{field.label}</Label>
              <div style={{ fontFamily: adConfig.type.ui, fontWeight: 600, fontSize: 48, letterSpacing: "-0.02em", color: C.text, marginTop: 14, whiteSpace: "nowrap" }}>
                {field.value}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginTop: 26,
          padding: "24px 28px",
          borderRadius: 22,
          background: "rgba(63,216,177,0.08)",
          border: "1px solid rgba(63,216,177,0.22)",
          ...enterAt(frame, at + 18, 0, { y: 14 }),
        }}
      >
        <Users size={38} color={C.accentBright} />
        <div style={{ fontFamily: adConfig.type.ui, fontWeight: 600, fontSize: 34, color: C.text, letterSpacing: "-0.01em" }}>{H.assigned}</div>
      </div>
    </div>
  );
};
