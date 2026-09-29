import React from "react";
import { useCurrentFrame } from "remotion";
import { adConfig } from "../config/adConfig";
import { CONTENT_W, GUTTER, HERO_Y } from "../config/layout";
import { DUR, EASE, enterAt, mix, pop, ramp } from "../motion";
import { captureTimes } from "./CapturePanel";
import { ArrowRight, Check, Users } from "./Icons";
import { sceneStart } from "./SceneTransition";
import { Avatar, cardStyle, Label } from "./ui";

const C = adConfig.colors;
const H = adConfig.handoff;
const L = adConfig.lead;

/**
 * The handoff. What the call captured, condensed into the brief a
 * salesperson opens before following up — and who did what: the AI had the
 * first conversation, a person takes it from here. Only facts the buyer said.
 */
export const SalesBrief: React.FC = () => {
  const frame = useCurrentFrame();
  const at = sceneStart("handoff");
  const closeAt = sceneStart("close");
  if (frame < at) return null;
  // gone before the payoff headline (which owns the frame) enters
  const out = ramp(frame, closeAt - 8, 8, EASE.out);
  if (out >= 1) return null;

  const cardIn = ramp(frame, at + 3, DUR.hero, EASE.out);
  const badge = pop(frame, at + 8, { damping: 16 }, DUR.sheet);

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
            fontWeight: 700,
            fontSize: 26,
            letterSpacing: "0.1em",
            color: C.accentInk,
            padding: "11px 22px",
            borderRadius: 999,
            background: C.accentBright,
            opacity: Math.min(1, badge * 1.3),
            transform: `scale(${mix(badge, 0.85, 1).toFixed(4)})`,
          }}
        >
          <Check size={22} color={C.accentInk} stroke={3} />
          {H.badge}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 30, ...enterAt(frame, at + 8, 0) }}>
        <Avatar initials={L.initials} size={84} />
        <div>
          <div style={{ fontFamily: adConfig.type.ui, fontWeight: 600, fontSize: 46, letterSpacing: "-0.025em", color: C.text }}>{L.name}</div>
          <div style={{ fontFamily: adConfig.type.ui, fontWeight: 500, fontSize: 28, color: C.textMute, marginTop: 6 }}>
            {H.status} · {L.chips[0]} enquiry
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 30 }}>
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
                ...enterAt(frame, at + 10, i * 2, { y: 14 }),
              }}
            >
              <Label size={22}>{field.label}</Label>
              <div style={{ fontFamily: adConfig.type.ui, fontWeight: 600, fontSize: 50, letterSpacing: "-0.02em", color: C.text, marginTop: 14, whiteSpace: "nowrap" }}>
                {field.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* who did what */}
      <div style={{ marginTop: 26, borderRadius: 22, border: `1px solid ${C.border}`, overflow: "hidden", ...enterAt(frame, at + 15, 0, { y: 14 }) }}>
        <HandoffRow label={H.firstCall.label} value={H.firstCall.value} icon={<Check size={26} color={C.accentBright} stroke={2.6} />} />
        <div style={{ height: 1, background: C.border }} />
        <HandoffRow
          label={H.followUp.label}
          value={H.followUp.value}
          icon={<Users size={30} color={C.accentBright} />}
          trailing={<ArrowRight size={30} color={C.accentBright} />}
          highlight
        />
      </div>
    </div>
  );
};

const HandoffRow: React.FC<{ label: string; value: string; icon: React.ReactNode; trailing?: React.ReactNode; highlight?: boolean }> = ({
  label,
  value,
  icon,
  trailing,
  highlight,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 18,
      padding: "22px 26px",
      background: highlight ? "rgba(63,216,177,0.08)" : "rgba(255,255,255,0.02)",
    }}
  >
    <div style={{ width: 36, display: "flex", justifyContent: "center" }}>{icon}</div>
    <Label size={21} style={{ width: 170 }}>
      {label}
    </Label>
    <div style={{ fontFamily: adConfig.type.ui, fontWeight: 600, fontSize: 34, color: C.text, letterSpacing: "-0.01em", flex: 1, whiteSpace: "nowrap" }}>{value}</div>
    {trailing}
  </div>
);

