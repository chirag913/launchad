import React from "react";
import { useCurrentFrame } from "remotion";
import { adConfig } from "../config/adConfig";
import { CONTENT_W, GUTTER, HERO_Y, LEAD_COMPACT_H, LEAD_FULL_H } from "../config/layout";
import { DUR, EASE, mix, mixToken, pop, ramp } from "../motion";
import { Inbox } from "./Icons";
import { sceneStart } from "./SceneTransition";
import { Avatar, cardStyle, Chip, Dot, Label } from "./ui";

const C = adConfig.colors;
const L = adConfig.lead;

/** Frame the card lands (a hair after frame 0 so the first frame already
 *  carries the headline and the notification is visibly *arriving*). */
export const LEAD_IN = -3;

/**
 * The property enquiry. Arrives like a notification, sits there uncalled,
 * then collapses into a compact row once BetterCallz picks it up — the lead
 * stays on screen the whole story, so the viewer never loses the thread.
 */
export const LeadCard: React.FC = () => {
  const frame = useCurrentFrame();
  const waitAt = sceneStart("waiting");
  const callAt = sceneStart("calling");
  const qualAt = sceneStart("qualify");
  const handoffAt = sceneStart("handoff");

  // Arrival: a spring drop with a little scale, landing once.
  const land = pop(frame, LEAD_IN, { damping: 16, stiffness: 140 }, DUR.hero + 4);
  const arriveOpacity = ramp(frame, LEAD_IN, 8);

  // Collapse into the compact row when the call starts.
  const compact = ramp(frame, callAt, 16, EASE.inOut);
  const h = mix(compact, LEAD_FULL_H, LEAD_COMPACT_H);

  // Handoff: the lead folds into the sales brief.
  const out = ramp(frame, handoffAt, 10, EASE.out);
  if (out >= 1) return null;

  // Waiting: accent cools from teal to amber.
  const cool = ramp(frame, waitAt + 4, 14, EASE.inOut);
  const statusColor = mixToken(cool, C.accentBright, C.warn);
  const pulse = cool < 1 ? 0.5 + 0.5 * Math.sin(frame / 4.2) : 0;

  const fullOpacity = 1 - ramp(frame, callAt, 4, EASE.out);
  const compactOpacity = ramp(frame, callAt + 2, 9, EASE.out);

  // Compact status: "AI calling" during the call, "Qualifying" after.
  const qualT = ramp(frame, qualAt, 8);

  return (
    <div
      style={cardStyle({
        left: GUTTER,
        top: HERO_Y,
        width: CONTENT_W,
        height: h,
        opacity: arriveOpacity * (1 - out),
        transform: `translateY(${(mix(land, -46, 0) - out * 24).toFixed(2)}px) scale(${mix(land, 0.965, 1).toFixed(4)})`,
        transformOrigin: "50% 0%",
      })}
    >
      {/* Top-edge accent — the "new" signal, cools while nobody calls. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 2,
          background: `linear-gradient(90deg, rgba(0,0,0,0), ${statusColor}, rgba(0,0,0,0))`,
          opacity: 0.8 * (1 - compact),
        }}
      />

      {/* ------------------------------------------------------ full -- */}
      <div style={{ position: "absolute", inset: 0, padding: 44, opacity: fullOpacity }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 14,
              background: "rgba(63,216,177,0.12)",
              border: "1px solid rgba(63,216,177,0.28)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Inbox size={32} color={C.accentBright} />
          </div>
          <Label>{L.sourceLabel}</Label>
          <div style={{ flex: 1 }} />
          <div style={{ fontFamily: adConfig.type.ui, fontSize: 27, fontWeight: 500, color: C.textDim, whiteSpace: "nowrap" }}>
            via {L.source}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 28, marginTop: 40 }}>
          <Avatar initials={L.initials} size={108} />
          <div>
            <div style={{ fontFamily: adConfig.type.ui, fontWeight: 600, fontSize: 56, letterSpacing: "-0.025em", color: C.text, lineHeight: 1.05 }}>
              {L.name}
            </div>
            <div style={{ fontFamily: adConfig.type.ui, fontWeight: 500, fontSize: 30, color: C.textMute, marginTop: 10, letterSpacing: "0.02em" }}>
              {L.phone}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 14, marginTop: 36 }}>
          {L.chips.map((c, i) => {
            const t = ramp(frame, LEAD_IN + 8 + i * 3, DUR.panel);
            return (
              <Chip key={c} style={{ opacity: t, transform: `translateY(${mix(t, 10, 0).toFixed(2)}px)` }}>
                {c}
              </Chip>
            );
          })}
        </div>

        <div style={{ height: 1, background: C.border, marginTop: 36 }} />

        <div style={{ display: "flex", alignItems: "center", marginTop: 28, gap: 14, position: "relative", height: 36 }}>
          <div style={{ position: "relative", width: 14, height: 14 }}>
            <div
              style={{
                position: "absolute",
                inset: -9,
                borderRadius: 40,
                background: statusColor,
                opacity: 0.22 * pulse,
                transform: `scale(${0.6 + 0.6 * pulse})`,
              }}
            />
            <Dot color={statusColor} size={14} />
          </div>
          {/* Status text crossfades: Just received → Not called yet */}
          <div style={{ position: "relative", flex: 1, height: 36 }}>
            <StatusText text="Just received" color={C.text} opacity={1 - cool} y={-cool * 12} />
            <StatusText text="Not called yet" color={C.warn} opacity={cool} y={(1 - cool) * 12} />
          </div>
          <div
            style={{
              fontFamily: adConfig.type.ui,
              fontWeight: 600,
              fontSize: 27,
              color: C.accentBright,
              padding: "10px 20px",
              borderRadius: 999,
              background: "rgba(63,216,177,0.10)",
              border: "1px solid rgba(63,216,177,0.25)",
              whiteSpace: "nowrap",
            }}
          >
            {L.status}
          </div>
        </div>
      </div>

      {/* --------------------------------------------------- compact -- */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "0 32px",
          display: "flex",
          alignItems: "center",
          gap: 22,
          opacity: compactOpacity,
          transform: `translateY(${mix(compactOpacity, 8, 0).toFixed(2)}px)`,
        }}
      >
        <Avatar initials={L.initials} size={74} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: adConfig.type.ui, fontWeight: 600, fontSize: 37, letterSpacing: "-0.015em", color: C.text, lineHeight: 1.1 }}>
            {L.name}
          </div>
          <div style={{ fontFamily: adConfig.type.ui, fontWeight: 500, fontSize: 27, color: C.textDim, marginTop: 6, whiteSpace: "nowrap" }}>
            {L.chips.join("  ·  ")}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontFamily: adConfig.type.ui,
            fontWeight: 600,
            fontSize: 26,
            color: C.accentBright,
            padding: "10px 18px",
            borderRadius: 999,
            background: "rgba(63,216,177,0.10)",
            border: "1px solid rgba(63,216,177,0.25)",
            whiteSpace: "nowrap",
            position: "relative",
          }}
        >
          <Dot color={C.accentBright} size={10} glow={8} />
          <div style={{ display: "grid" }}>
            <span style={{ gridArea: "1 / 1", opacity: 1 - qualT }}>AI calling</span>
            <span style={{ gridArea: "1 / 1", opacity: qualT }}>Qualifying</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatusText: React.FC<{ text: string; color: string; opacity: number; y: number }> = ({ text, color, opacity, y }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      top: 0,
      fontFamily: adConfig.type.ui,
      fontWeight: 500,
      fontSize: 33,
      color,
      opacity,
      transform: `translateY(${y.toFixed(2)}px)`,
      lineHeight: "36px",
      whiteSpace: "nowrap",
    }}
  >
    {text}
  </div>
);

