import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { adConfig, dialogue, f } from "../config/adConfig";
import { CALL_H, CALL_Y, CONTENT_W, GUTTER, SLOT_H, SLOT_Y } from "../config/layout";
import { DUR, EASE, mix, mixToken, ramp } from "../motion";
import { Clock, Phone } from "./Icons";
import { COLLAPSE_AT } from "./LeadCard";
import { sceneStart } from "./SceneTransition";
import { stackOffset } from "./stack";
import { swap, transitionStyle } from "./TextTransition";
import { Dot, Label } from "./ui";
import { Waveform } from "./Waveform";

const C = adConfig.colors;

/** Frame the call connects — the first span of the recording starts. */
export const CONNECT_AT = f(dialogue[0].start);

const pad = (n: number) => String(n).padStart(2, "0");
const mmss = (s: number) => `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;

/** Transcript windows: each line holds from its span's start until the next
 *  span begins, and fully exits first — never two lines on screen at once. */
const CAPTION_EXIT = 5;
const captionWindows = dialogue.map((d, i) => {
  const next = dialogue[i + 1];
  const enterAt = f(d.start) + 1;
  const hardEnd = next ? f(next.start) : sceneStart("handoff") - 4;
  return { turn: d, enterAt, exitAt: hardEnd - CAPTION_EXIT - 1 };
});

/**
 * Where the first call should be. Scene 2: an empty, dashed "first call"
 * slot — nobody has spoken to the buyer. At the reveal BetterCallz fills it:
 * the slot turns into the ringing call, then grows into the live call with a
 * meter read from the real recording and a transcript of exactly what is said.
 */
export const CallInterface: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const waitAt = sceneStart("waiting");
  const callAt = sceneStart("calling");
  const handoffAt = sceneStart("handoff");
  if (frame < waitAt) return null;
  const out = ramp(frame, handoffAt - 4, 7, EASE.out);
  if (out >= 1) return null;

  const appear = ramp(frame, waitAt + 10, DUR.sheet);
  const solid = ramp(frame, callAt, 12);
  const grow = ramp(frame, COLLAPSE_AT, 16, EASE.inOut);
  const y = mix(grow, SLOT_Y, CALL_Y) + stackOffset(frame);
  const h = mix(grow, SLOT_H, CALL_H);

  const waiting = swap(frame, callAt - 5, 5, 2, DUR.panel); // waiting content → call content
  const connectT = ramp(frame, CONNECT_AT, 8);
  const ringing = frame < CONNECT_AT;
  const callSecs = Math.max(0, Math.floor((frame - CONNECT_AT) / fps));
  const waitSecs = Math.max(0, Math.floor(frame / fps));

  return (
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
      {/* surfaces: dashed empty slot → solid live call */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 32,
          border: "2px dashed rgba(255,255,255,0.16)",
          background: "rgba(255,255,255,0.015)",
          opacity: 1 - solid,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 32,
          background: `linear-gradient(180deg, #121B18 0%, ${C.surface} 100%)`,
          border: `1px solid ${mixToken(connectT, "rgba(63,216,177,0.22)", "rgba(63,216,177,0.34)")}`,
          boxShadow: `0 1px 0 rgba(255,255,255,0.05) inset, 0 30px 90px rgba(0,0,0,0.5), 0 0 ${80 * solid}px rgba(31,179,145,${(0.1 * solid).toFixed(3)})`,
          opacity: solid,
        }}
      />

      {/* ------------------------------------------- waiting (scene 2) -- */}
      <div style={{ position: "absolute", inset: 0, padding: "40px 40px", opacity: 1 - waiting.out }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Label color={C.textDim}>{adConfig.waiting.label}</Label>
          <div style={{ flex: 1 }} />
          <Clock size={26} color={C.textMute} />
          <div style={{ fontFamily: adConfig.type.ui, fontWeight: 500, fontSize: 27, color: C.textMute, marginLeft: 10, fontVariantNumeric: "tabular-nums" }}>
            Waiting · {mmss(waitSecs)}
          </div>
        </div>
        <div style={{ fontFamily: adConfig.type.ui, fontWeight: 600, fontSize: 40, letterSpacing: "-0.015em", color: C.text, marginTop: 34 }}>
          {adConfig.waiting.text}
        </div>
      </div>

      {/* ------------------------------------------------ the call -- */}
      <div style={{ position: "absolute", left: 0, top: 0, width: CONTENT_W, height: CALL_H, padding: "34px 40px", opacity: waiting.in }}>
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
            {ringing ? `Calling ${adConfig.lead.name.split(" ")[0]}…` : mmss(callSecs)}
          </div>
        </div>

        <div style={{ marginTop: 30 }}>
          <Waveform width={CONTENT_W - 80} height={130} bars={48} />
        </div>

        <div style={{ height: 1, background: C.border, marginTop: 26 }} />

        {/* live transcript — exactly what is said, in the language it is said */}
        <div style={{ position: "relative", marginTop: 24, height: 180 }}>
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
                <div style={{ marginTop: 14 }}>
                  {turn.caption.split("\n").map((line, li) => (
                    <div
                      key={li}
                      style={{
                        fontFamily: adConfig.type.hindi,
                        fontWeight: 500,
                        fontSize: 50,
                        lineHeight: "70px",
                        height: 70,
                        color: ai ? C.text : C.text,
                        whiteSpace: "pre",
                      }}
                    >
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
