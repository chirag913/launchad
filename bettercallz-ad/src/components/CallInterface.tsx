import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { adConfig, f } from "../config/adConfig";
import {
  CONTENT_W,
  GUTTER,
  HERO_Y,
  LEAD_FULL_H,
  SLOT_BAR_H,
  SLOT_CALL_H,
  SLOT_CALL_Y,
  SLOT_WAIT_H,
  SLOT_WAIT_Y,
} from "../config/layout";
import { DUR, EASE, mix, mixToken, ramp } from "../motion";
import { Clock, Phone } from "./Icons";
import { sceneStart } from "./SceneTransition";
import { swap } from "./TextTransition";
import { Avatar, Dot, Label } from "./ui";
import { Waveform } from "./Waveform";

const C = adConfig.colors;
const L = adConfig.lead;

/** Frame the call connects (speech starts shortly after). */
export const CONNECT_AT = f(adConfig.call.voiceAt + 0.36);

/** Minutes the lead has sat uncalled at a given frame. Accelerates — time
 *  is slipping away — and lands on the configured number. Shared with the
 *  sound track so every tick lands on a digit change. */
export function minutesUncalled(frame: number): number {
  const a = sceneStart("waiting") + 8;
  const b = sceneStart("calling") - 8;
  const t = Math.min(1, Math.max(0, (frame - a) / (b - a)));
  return Math.round(adConfig.waiting.toMinutes * Math.pow(t, 1.7));
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The slot under the lead where the call *should* be. Scene 2: an empty
 * dashed slot with a clock running. Scene 3: BetterCallz fills it — the slot
 * morphs into the live call. Scene 4: the call shrinks to a bar and keeps
 * running while qualification happens underneath.
 */
export const CallInterface: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const waitAt = sceneStart("waiting");
  const callAt = sceneStart("calling");
  const qualAt = sceneStart("qualify");
  const handoffAt = sceneStart("handoff");

  if (frame < waitAt) return null;
  const out = ramp(frame, handoffAt - 4, 7, EASE.out);
  if (out >= 1) return null;

  const appear = ramp(frame, waitAt + 6, DUR.sheet);
  const morph = ramp(frame, callAt, 16, EASE.inOut);
  const toBar = ramp(frame, qualAt, 14, EASE.inOut);

  const y = mix(morph, SLOT_WAIT_Y, SLOT_CALL_Y);
  const h = mix(toBar, mix(morph, SLOT_WAIT_H, SLOT_CALL_H), SLOT_BAR_H);

  // Border: dashed amber while waiting → solid teal once the call is live.
  const solid = ramp(frame, callAt + 2, 12);
  // each layer leaves completely before the next one arrives
  const waitingOpacity = 1 - ramp(frame, callAt - 5, 4);
  const callOpacity = ramp(frame, callAt + 1, DUR.panel) * (1 - ramp(frame, qualAt - 5, 4));
  const barOpacity = ramp(frame, qualAt + 1, DUR.panel);

  const connected = frame >= CONNECT_AT;
  const connectT = ramp(frame, CONNECT_AT, 8);
  const callState = swap(frame, CONNECT_AT - 5);
  const secs = Math.max(0, Math.floor((frame - CONNECT_AT) / fps));

  // Connector from lead card to slot — only while waiting.
  const lineT = ramp(frame, waitAt + 2, DUR.sheet);

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: GUTTER + 60,
          top: HERO_Y + LEAD_FULL_H,
          width: 2,
          height: 40 * lineT,
          background: `repeating-linear-gradient(180deg, rgba(227,168,87,0.55) 0 6px, transparent 6px 12px)`,
          opacity: waitingOpacity,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: GUTTER,
          top: y,
          width: CONTENT_W,
          height: h,
          borderRadius: 32,
          opacity: appear * (1 - out),
          transform: `translateY(${(mix(appear, 14, 0) - out * 24).toFixed(2)}px)`,
          overflow: "hidden",
        }}
      >
        {/* surfaces */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 32,
            border: `2px dashed rgba(227,168,87,0.38)`,
            background: "rgba(227,168,87,0.025)",
            opacity: 1 - solid,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 32,
            background: `linear-gradient(180deg, #121B18 0%, ${C.surface} 100%)`,
            border: `1px solid ${mixToken(connectT, "rgba(255,255,255,0.10)", "rgba(63,216,177,0.34)")}`,
            boxShadow: `0 1px 0 rgba(255,255,255,0.05) inset, 0 30px 90px rgba(0,0,0,0.5), 0 0 ${80 * connectT}px rgba(31,179,145,${(0.1 * connectT).toFixed(3)})`,
            opacity: solid,
          }}
        />

        {/* ------------------------------------------------ waiting -- */}
        <div style={{ position: "absolute", inset: 0, padding: "36px 40px", opacity: waitingOpacity }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Clock size={26} color={C.warn} />
            <Label color={C.warn}>{adConfig.waiting.label}</Label>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginTop: 30 }}>
            <div
              style={{
                fontFamily: adConfig.type.display,
                fontWeight: 700,
                fontSize: 140,
                letterSpacing: "-0.05em",
                color: C.text,
                lineHeight: 0.9,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {minutesUncalled(frame)}
            </div>
            <div style={{ fontFamily: adConfig.type.display, fontWeight: 600, fontSize: 48, color: C.textDim, letterSpacing: "-0.02em" }}>
              min waiting
            </div>
          </div>
          <div style={{ fontFamily: adConfig.type.ui, fontWeight: 500, fontSize: 31, color: C.textMute, marginTop: 22 }}>
            Lead is going cold.
          </div>
        </div>

        {/* --------------------------------------------------- call -- */}
        <div style={{ position: "absolute", left: 0, top: 0, width: CONTENT_W, height: SLOT_CALL_H, padding: "36px 40px", opacity: callOpacity }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Dot color={C.accentBright} size={12} glow={10} />
            <div style={{ fontFamily: adConfig.type.ui, fontWeight: 600, fontSize: 29, color: C.accentBright, marginLeft: 12 }}>
              {adConfig.call.badge}
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ fontFamily: adConfig.type.ui, fontWeight: 500, fontSize: 29, color: C.textDim, fontVariantNumeric: "tabular-nums", opacity: connectT }}>
              {pad(Math.floor(secs / 60))}:{pad(secs % 60)}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 26, marginTop: 40 }}>
            <div style={{ position: "relative" }}>
              {!connected &&
                [0, 1].map((k) => {
                  const p = ((frame - callAt - k * 9) % 18) / 18;
                  return (
                    <div
                      key={k}
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: 200,
                        border: `2px solid ${C.accentBright}`,
                        opacity: frame - callAt - k * 9 > 0 ? (1 - p) * 0.55 : 0,
                        transform: `scale(${1 + p * 0.5})`,
                      }}
                    />
                  );
                })}
              <Avatar initials={L.initials} size={116} />
              <div
                style={{
                  position: "absolute",
                  right: -4,
                  bottom: -4,
                  width: 40,
                  height: 40,
                  borderRadius: 40,
                  background: C.accentBright,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: `3px solid ${C.surface}`,
                }}
              >
                <Phone size={20} color={C.accentInk} stroke={2.4} />
              </div>
            </div>
            <div>
              <div style={{ fontFamily: adConfig.type.ui, fontWeight: 600, fontSize: 48, letterSpacing: "-0.025em", color: C.text }}>{L.name}</div>
              <div style={{ position: "relative", height: 38, marginTop: 8 }}>
                <div style={{ position: "absolute", fontFamily: adConfig.type.ui, fontWeight: 500, fontSize: 31, color: C.textDim, opacity: 1 - callState.out, whiteSpace: "nowrap" }}>
                  {adConfig.call.calling}
                </div>
                <div
                  style={{
                    position: "absolute",
                    fontFamily: adConfig.type.ui,
                    fontWeight: 500,
                    fontSize: 31,
                    color: C.accentBright,
                    opacity: callState.in,
                    transform: `translateY(${mix(callState.in, 8, 0).toFixed(2)}px)`,
                    whiteSpace: "nowrap",
                  }}
                >
                  {adConfig.call.connected} · AI speaking
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 50 }}>
            <Waveform width={CONTENT_W - 80} height={190} bars={52} step={0.045} />
          </div>
        </div>

        {/* ---------------------------------------------------- bar -- */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: CONTENT_W,
            height: SLOT_BAR_H,
            padding: "0 36px",
            display: "flex",
            alignItems: "center",
            gap: 20,
            opacity: barOpacity,
          }}
        >
          <Dot color={C.accentBright} size={12} glow={10} />
          <div style={{ fontFamily: adConfig.type.ui, fontWeight: 600, fontSize: 29, color: C.accentBright, whiteSpace: "nowrap" }}>
            {adConfig.call.badge}
          </div>
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <Waveform width={380} height={56} bars={36} step={0.04} barWidth={4} />
          </div>
          <div style={{ fontFamily: adConfig.type.ui, fontWeight: 500, fontSize: 29, color: C.textDim, fontVariantNumeric: "tabular-nums" }}>
            {pad(Math.floor(secs / 60))}:{pad(secs % 60)}
          </div>
        </div>
      </div>
    </>
  );
};
