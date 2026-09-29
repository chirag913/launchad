import React from "react";
import { useCurrentFrame } from "remotion";
import { adConfig } from "../config/adConfig";
import { CONTENT_W, GUTTER, HERO_Y } from "../config/layout";
import { DUR, EASE, enterAt, mix, pop, ramp } from "../motion";
import { Calendar, Check, Users } from "./Icons";
import { sceneStart } from "./SceneTransition";
import { Avatar, cardStyle, Dot, Label } from "./ui";

const C = adConfig.colors;
const H = adConfig.handoff;
const L = adConfig.lead;

const CHAIN_H = 76;
const BRIEF_Y = HERO_Y + CHAIN_H + 34;

/**
 * The handoff. A three-step chain draws left to right — AI call, qualified
 * lead, sales team — and the qualification collapses into a brief the
 * salesperson can act on. The last row is the human's job: the site visit.
 */
export const SalesBrief: React.FC = () => {
  const frame = useCurrentFrame();
  const at = sceneStart("handoff");
  const closeAt = sceneStart("close");
  if (frame < at) return null;
  const out = ramp(frame, closeAt, 10, EASE.out);
  if (out >= 1) return null;

  const chainDraw = ramp(frame, at + 4, 22, EASE.inOut);
  const cardIn = ramp(frame, at + 3, DUR.hero, EASE.out);

  const facts = adConfig.qualification;

  return (
    <div style={{ opacity: 1 - out, transform: `translateY(${(-out * 24).toFixed(2)}px)` }}>
      {/* ----------------------------------------------------- chain -- */}
      <div style={{ position: "absolute", left: GUTTER, top: HERO_Y, width: CONTENT_W, height: CHAIN_H }}>
        <div style={{ position: "absolute", left: 30, right: 30, top: 24, height: 2, background: C.border }} />
        <div
          style={{
            position: "absolute",
            left: 30,
            top: 24,
            height: 2,
            width: (CONTENT_W - 60) * chainDraw,
            background: `linear-gradient(90deg, ${C.accent}, ${C.accentBright})`,
            boxShadow: `0 0 12px ${C.accent}`,
          }}
        />
        {H.steps.map((s, i) => {
          const pos = i / (H.steps.length - 1);
          const lit = ramp(frame, at + 4 + Math.round(22 * pos) - 2, 8);
          const last = i === H.steps.length - 1;
          const x = 30 + (CONTENT_W - 60) * pos;
          return (
            <div key={s} style={{ position: "absolute", left: x, top: 0, transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 50,
                  background: lit > 0.5 ? (last ? C.accentBright : "#123029") : C.surface,
                  border: `2px solid ${lit > 0.5 ? C.accentBright : C.borderHi}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: `scale(${mix(pop(frame, at + 4 + Math.round(22 * pos) - 2, { damping: 16 }, 12), 0.85, 1).toFixed(4)})`,
                }}
              >
                {last ? <Users size={26} color={lit > 0.5 ? C.accentInk : C.textMute} /> : <Check size={24} color={lit > 0.5 ? C.accentBright : C.textMute} />}
              </div>
              <Label
                size={22}
                color={lit > 0.5 ? (last ? C.accentBright : C.text) : C.textMute}
                style={{
                  marginTop: 14,
                  position: "absolute",
                  top: 50,
                  left: i === 0 ? -5 : undefined,
                  right: last ? -5 : undefined,
                  transform: i === 0 || last ? undefined : "translateX(-50%)",
                  ...(i === 1 ? { left: "50%" } : {}),
                }}
              >
                {s}
              </Label>
            </div>
          );
        })}
      </div>

      {/* ----------------------------------------------------- brief -- */}
      <div
        style={cardStyle({
          left: GUTTER,
          top: BRIEF_Y,
          width: CONTENT_W,
          padding: 40,
          opacity: cardIn,
          transform: `translateY(${mix(cardIn, 30, 0).toFixed(2)}px) scale(${mix(cardIn, 0.97, 1).toFixed(4)})`,
          transformOrigin: "50% 0%",
          border: `1px solid rgba(63,216,177,0.22)`,
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

        <div style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 30, ...enterAt(frame, at + 7, 0) }}>
          <Avatar initials={L.initials} size={84} />
          <div>
            <div style={{ fontFamily: adConfig.type.ui, fontWeight: 600, fontSize: 46, letterSpacing: "-0.025em", color: C.text }}>{L.name}</div>
            <div style={{ fontFamily: adConfig.type.ui, fontWeight: 500, fontSize: 28, color: C.textMute, marginTop: 6 }}>
              {L.source} · {L.chips[2]}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 30 }}>
          {facts.map((q, i) => (
            <div
              key={q.label}
              style={{
                borderRadius: 20,
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${C.border}`,
                padding: "20px 24px",
                ...enterAt(frame, at + 9, i, { y: 14 }),
              }}
            >
              <Label size={21}>{q.label}</Label>
              <div
                style={{
                  fontFamily: adConfig.type.ui,
                  fontWeight: 600,
                  fontSize: 42,
                  letterSpacing: "-0.02em",
                  color: "highlight" in q && q.highlight ? C.accentBright : C.text,
                  marginTop: 12,
                  whiteSpace: "nowrap",
                }}
              >
                {q.value}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginTop: 26,
            padding: "22px 26px",
            borderRadius: 20,
            background: "rgba(63,216,177,0.08)",
            border: "1px solid rgba(63,216,177,0.22)",
            ...enterAt(frame, at + 16, 0, { y: 14 }),
          }}
        >
          <Users size={40} color={C.accentBright} />
          <div style={{ marginLeft: 16 }}>
            <Label size={21} color={C.textDim}>
              {H.assigned}
            </Label>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
              <Calendar size={32} color={C.text} />
              <div style={{ fontFamily: adConfig.type.ui, fontWeight: 600, fontSize: 38, color: C.text, letterSpacing: "-0.015em" }}>
                {H.nextStepLabel}: {H.nextStep}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
