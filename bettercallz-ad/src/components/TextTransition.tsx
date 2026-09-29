import React from "react";
import { useCurrentFrame } from "remotion";
import { EASE, mix, ramp } from "../motion";

/* ---------------------------------------------------------------------------
 * TextTransition — every piece of text on screen goes through three explicit
 * windows, in frames:
 *
 *     enter [enterAt, enterAt + enterDur)   rise + fade in
 *     hold  [enterAt + enterDur, exitAt)    perfectly still
 *     exit  [exitAt, exitAt + exitDur)      lift + fade out
 *
 * Nothing is masked, so no glyph is ever clipped mid-move, and nothing
 * outside these windows is drawn at all. Sequencing between states (old
 * exits completely → breathing gap → new enters) is enforced by the
 * schedule in config/headlineSchedule.ts, which throws if it is violated.
 * ------------------------------------------------------------------------- */

export const TEXT_TIMING = {
  /** frames a line takes to rise in */
  enter: 12,
  /** frames a state takes to leave */
  exit: 8,
  /** frames of empty space between one state leaving and the next entering */
  gap: 4,
  /** frames between lines of the same state entering */
  lineStagger: 3,
  /** minimum frames a state must sit fully settled before it may exit */
  minHold: 12,
  /** px travelled on enter / exit */
  enterY: 34,
  exitY: -22,
} as const;

export type TransitionWindow = {
  enterAt: number;
  /** omit to hold until the end */
  exitAt?: number;
  enterDur?: number;
  exitDur?: number;
  enterY?: number;
  exitY?: number;
};

/** Opacity/transform for a window at `frame`, or null when not on screen. */
export function transitionStyle(frame: number, w: TransitionWindow): React.CSSProperties | null {
  const enterDur = w.enterDur ?? TEXT_TIMING.enter;
  const exitDur = w.exitDur ?? TEXT_TIMING.exit;
  if (frame < w.enterAt) return null;
  if (w.exitAt !== undefined && frame >= w.exitAt + exitDur) return null;
  const tIn = ramp(frame, w.enterAt, enterDur, EASE.word);
  const tOut = w.exitAt === undefined ? 0 : ramp(frame, w.exitAt, exitDur, EASE.inOut);
  const y = mix(tIn, w.enterY ?? TEXT_TIMING.enterY, 0) + mix(tOut, 0, w.exitY ?? TEXT_TIMING.exitY);
  return {
    opacity: tIn * (1 - tOut),
    transform: `translateY(${y.toFixed(2)}px)`,
  };
}

/** Wrapper form of the same thing. */
export const TextTransition: React.FC<TransitionWindow & { style?: React.CSSProperties; children: React.ReactNode }> = ({
  children,
  style,
  ...w
}) => {
  const frame = useCurrentFrame();
  const s = transitionStyle(frame, w);
  if (!s) return null;
  return <div style={{ ...style, ...s }}>{children}</div>;
};

/**
 * Two states that share one spot (a status label, a value replacing
 * "Listening…"): the old one leaves completely, a short gap, then the new
 * one arrives. Returns 0→1 progress for each so the caller can style them.
 */
export function swap(frame: number, at: number, outDur = 5, gap = 2, inDur = 8) {
  const out = ramp(frame, at, outDur, EASE.inOut);
  const inn = ramp(frame, at + outDur + gap, inDur, EASE.out);
  return { out, in: inn };
}
