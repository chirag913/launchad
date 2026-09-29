import React from "react";
import { useCurrentFrame } from "remotion";
import { adConfig, dialogue, f, leadCollapseAt } from "../config/adConfig";
import { CONTENT_W, GUTTER, HERO_Y, LEAD_COMPACT_H, LEAD_FULL_H } from "../config/layout";
import { DUR, EASE, mix, pop, ramp } from "../motion";
import { Inbox } from "./Icons";
import { sceneStart } from "./SceneTransition";
import { swap } from "./TextTransition";
import { Avatar, cardStyle, Dot, Label } from "./ui";

const C = adConfig.colors;
const L = adConfig.lead;

/** Frame the card lands — just before frame 0, so the first frame already
 *  shows the enquiry arriving rather than an empty stage. */
export const LEAD_IN = -3;

/** Frame the buyer first replies — the lead is now engaged. */
const ENGAGED_AT = f((dialogue.find((d) => d.engages) ?? dialogue[1]).start + 0.1);

/**
 * The property enquiry. Lands like a notification, then collapses into a
 * compact row once BetterCallz starts calling, and stays on screen through
 * the call so the viewer never loses whose lead this is.
 */
export const LeadCard: React.FC = () => {
  const frame = useCurrentFrame();
  const callAt = sceneStart("call");
  const handoffAt = sceneStart("handoff");

  const land = pop(frame, LEAD_IN, { damping: 16, stiffness: 140 }, DUR.hero + 4);
  const arriveOpacity = ramp(frame, LEAD_IN, 8);

  const collapseAt = f(leadCollapseAt);
  const compact = ramp(frame, collapseAt, 16, EASE.inOut);
  // "Just received" → "AI calling now" the moment the call starts
  const calling = swap(frame, callAt);
  const h = mix(compact, LEAD_FULL_H, LEAD_COMPACT_H);

  const out = ramp(frame, handoffAt - 4, 7, EASE.out);
  if (out >= 1) return null;

  // The full layout leaves completely before the compact row arrives.
  const fullOpacity = 1 - ramp(frame, collapseAt - 2, 4, EASE.out);
  const compactOpacity = ramp(frame, collapseAt + 2, 9, EASE.out);
  const status = swap(frame, ENGAGED_AT - 7);
  const pulse = 0.5 + 0.5 * Math.sin(frame / 4.2);

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
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 2,
          background: `linear-gradient(90deg, rgba(0,0,0,0), ${C.accentBright}, rgba(0,0,0,0))`,
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

        <div style={{ height: 1, background: C.border, marginTop: 40 }} />

        <div style={{ display: "flex", alignItems: "center", marginTop: 30, gap: 14, height: 36 }}>
          <div style={{ position: "relative", width: 14, height: 14 }}>
            <div
              style={{
                position: "absolute",
                inset: -9,
                borderRadius: 40,
                background: C.accentBright,
                opacity: 0.22 * pulse,
                transform: `scale(${0.6 + 0.6 * pulse})`,
              }}
            />
            <Dot color={C.accentBright} size={14} />
          </div>
          <div style={{ display: "grid", flex: 1 }}>
            <div style={{ gridArea: "1 / 1", fontFamily: adConfig.type.ui, fontWeight: 500, fontSize: 33, color: C.text, opacity: 1 - calling.out }}>
              {L.received}
            </div>
            <div
              style={{
                gridArea: "1 / 1",
                fontFamily: adConfig.type.ui,
                fontWeight: 600,
                fontSize: 33,
                color: C.accentBright,
                opacity: calling.in,
                transform: `translateY(${mix(calling.in, 8, 0).toFixed(2)}px)`,
              }}
            >
              BetterCallz is calling…
            </div>
          </div>
          <div style={{ fontFamily: adConfig.type.ui, fontWeight: 500, fontSize: 28, color: C.textDim, whiteSpace: "nowrap" }}>via {L.source}</div>
        </div>
      </div>

      {/* --------------------------------------------------- compact -- */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: LEAD_COMPACT_H,
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
            Property enquiry · {L.source}
          </div>
        </div>
        <StatusPill status={status} />
      </div>
    </div>
  );
};

/** "Calling" → "Engaged": the old label leaves before the new one lands. */
const StatusPill: React.FC<{ status: { out: number; in: number } }> = ({ status }) => {
  const engaged = status.in;
  return (
    <div
      style={{
        display: "grid",
        alignItems: "center",
        fontFamily: adConfig.type.ui,
        fontWeight: 600,
        fontSize: 26,
        padding: "11px 20px",
        borderRadius: 999,
        whiteSpace: "nowrap",
        background: engaged > 0 ? `rgba(63,216,177,${(0.1 + 0.9 * engaged).toFixed(3)})` : "rgba(63,216,177,0.10)",
        border: "1px solid rgba(63,216,177,0.30)",
      }}
    >
      <div style={{ gridArea: "1 / 1", display: "flex", alignItems: "center", gap: 10, color: C.accentBright, opacity: 1 - status.out }}>
        <Dot color={C.accentBright} size={10} glow={8} />
        Calling
      </div>
      <div
        style={{
          gridArea: "1 / 1",
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: C.accentInk,
          opacity: engaged,
          transform: `translateY(${mix(engaged, 6, 0).toFixed(2)}px)`,
        }}
      >
        <Dot color={C.accentInk} size={10} />
        Engaged
      </div>
    </div>
  );
};
