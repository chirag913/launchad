import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { adConfig, dialogue, f, leadCollapseAt } from "../config/adConfig";
import { CALL_H, CALL_Y, CONTENT_W, GUTTER, HERO_Y, LEAD_FULL_H, STACK_GAP } from "../config/layout";
import { DUR, EASE, mix, mixToken, ramp } from "../motion";
import { Phone } from "./Icons";
import { sceneStart } from "./SceneTransition";
import { transitionStyle } from "./TextTransition";
import { Dot, Label } from "./ui";
import { Waveform } from "./Waveform";

const C = adConfig.colors;

/** Frame the call connects — the moment the first turn starts. */
export const CONNECT_AT = f(dialogue[0].start);

const pad = (n: number) => String(n).padStart(2, "0");

/** Caption windows for the live transcript: each turn's caption holds from
 *  its start until the next turn begins, and never overlaps the next one —
 *  it exits over its own window first (TextTransition rules). */
const CAPTION_EXIT = 5;
const captionWindows = dialogue.map((d, i) => {
  const next = dialogue[i + 1];
  const enterAt = f(d.start) + 1;
  const hardEnd = next ? f(next.start) : sceneStart("handoff");
  return { turn: d, enterAt, exitAt: hardEnd - CAPTION_EXIT - 1 };
});

/**
 * The live call. Rings in under the lead, connects, then shows who is
 * speaking, a level meter driven by the real recording, and a one-line live
 * transcript (English meaning of what is being said).
 */
export const CallInterface: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const callAt = sceneStart("call");
  const handoffAt = sceneStart("handoff");
  if (frame < callAt) return null;
  const out = ramp(frame, handoffAt - 4, 7, EASE.out);
  if (out >= 1) return null;

  const appear = ramp(frame, callAt + 4, DUR.sheet);
  // rings in under the full enquiry, then rises as the lead collapses
  const rise = ramp(frame, f(leadCollapseAt), 16, EASE.inOut);
  const y = mix(rise, HERO_Y + LEAD_FULL_H + STACK_GAP, CALL_Y);
  const connectT = ramp(frame, CONNECT_AT, 8);
  const secs = Math.max(0, Math.floor((frame - CONNECT_AT) / fps));
  const ringing = frame < CONNECT_AT;

  return (
    <div
      style={{
        position: "absolute",
        left: GUTTER,
        top: y,
        width: CONTENT_W,
        height: CALL_H,
        borderRadius: 32,
        background: `linear-gradient(180deg, #121B18 0%, ${C.surface} 100%)`,
        border: `1px solid ${mixToken(connectT, "rgba(255,255,255,0.10)", "rgba(63,216,177,0.34)")}`,
        boxShadow: `0 1px 0 rgba(255,255,255,0.05) inset, 0 30px 90px rgba(0,0,0,0.5), 0 0 ${80 * connectT}px rgba(31,179,145,${(0.1 * connectT).toFixed(3)})`,
        opacity: appear * (1 - out),
        transform: `translateY(${(mix(appear, 18, 0) - out * 24).toFixed(2)}px)`,
        overflow: "hidden",
        padding: "34px 40px",
      }}
    >
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", height: 40 }}>
        <div style={{ position: "relative", width: 40, height: 40, marginRight: 16 }}>
          {ringing &&
            [0, 1].map((k) => {
              const p = ((frame - callAt - k * 7) % 14) / 14;
              return (
                <div
                  key={k}
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 40,
                    border: `2px solid ${C.accentBright}`,
                    opacity: frame - callAt - k * 7 > 0 ? (1 - p) * 0.6 : 0,
                    transform: `scale(${1 + p * 0.7})`,
                  }}
                />
              );
            })}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 40,
              background: C.accentBright,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Phone size={20} color={C.accentInk} stroke={2.4} />
          </div>
        </div>
        <div style={{ fontFamily: adConfig.type.ui, fontWeight: 600, fontSize: 29, color: C.accentBright }}>{adConfig.call.badge}</div>
        <div style={{ flex: 1 }} />
        <div style={{ fontFamily: adConfig.type.ui, fontWeight: 500, fontSize: 29, color: C.textDim, fontVariantNumeric: "tabular-nums" }}>
          {ringing ? "Calling…" : `${pad(Math.floor(secs / 60))}:${pad(secs % 60)}`}
        </div>
      </div>

      {/* meter */}
      <div style={{ marginTop: 34 }}>
        <Waveform width={CONTENT_W - 80} height={120} bars={48} />
      </div>

      <div style={{ height: 1, background: C.border, marginTop: 30 }} />

      {/* live transcript */}
      <div style={{ position: "relative", marginTop: 26, height: 116 }}>
        {captionWindows.map(({ turn, enterAt, exitAt }) => {
          const s = transitionStyle(frame, { enterAt, exitAt, enterDur: 7, exitDur: CAPTION_EXIT, enterY: 12, exitY: -8 });
          if (!s) return null;
          const ai = turn.speaker === "ai";
          return (
            <div key={turn.index} style={{ position: "absolute", inset: 0, ...s }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Dot color={ai ? C.accentBright : C.text} size={10} glow={ai ? 8 : 0} />
                <Label size={21} color={ai ? C.accentBright : C.textDim}>
                  {ai ? "BetterCallz AI" : `${adConfig.lead.name.split(" ")[0]} · buyer`}
                </Label>
              </div>
              <div
                style={{
                  fontFamily: adConfig.type.ui,
                  fontWeight: 600,
                  fontSize: 42,
                  letterSpacing: "-0.015em",
                  color: C.text,
                  marginTop: 16,
                  whiteSpace: "nowrap",
                }}
              >
                {ai ? turn.caption : `“${turn.caption}”`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
