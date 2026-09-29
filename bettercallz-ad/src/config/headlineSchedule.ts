/* ---------------------------------------------------------------------------
 * The headline schedule: every headline state, in frames, with explicit
 * enter / hold / exit windows — and the rules that keep them apart.
 *
 * Derived from adConfig so a new script re-times itself. Validated at module
 * load: if any rule below is broken the render fails loudly instead of
 * shipping two headlines on top of each other.
 *
 *   1. A state is completely gone before the next one starts entering,
 *      with at least TEXT_TIMING.gap empty frames in between.
 *   2. Every line is fully settled for at least minHold frames before exit.
 *   3. The end card enters only after the payoff headline has left.
 *   4. On scenes with product UI, the headline block ends above the UI.
 * ------------------------------------------------------------------------- */
import { TEXT_TIMING } from "../components/TextTransition";
import { adConfig, f, Headline } from "./adConfig";
import { HEADLINE_Y, HERO_Y } from "./layout";

type SceneKey = keyof typeof adConfig.scenes;
const order = Object.keys(adConfig.scenes) as SceneKey[];
const start = (k: SceneKey) => f(adConfig.scenes[k]);

export type ScheduledLine = { text: string; accent?: boolean; enterAt: number };
export type ScheduledHeadline = {
  key: SceneKey;
  size: number;
  lines: ScheduledLine[];
  /** first frame any line starts entering */
  enterAt: number;
  /** frame the whole state starts exiting (undefined = holds to the end) */
  exitAt?: number;
  /** first frame after the exit completes */
  goneAt?: number;
};

const T = TEXT_TIMING;

export const headlineSchedule: ScheduledHeadline[] = order.map((k, i) => {
  const h: Headline = adConfig.headlines[k];
  const next = order[i + 1];
  // First state is already settled on frame 0 so the thumbnail reads.
  const base = i === 0 ? -(T.enter + T.lineStagger * h.lines.length) : start(k) + T.gap;
  const lines = h.lines.map((l, li) => ({
    text: l.text,
    accent: l.accent,
    enterAt: l.at !== undefined ? start(k) + f(l.at) : base + li * T.lineStagger,
  }));
  const exitAt = h.exitAt !== undefined ? start(k) + f(h.exitAt) : next ? start(next) - T.exit : undefined;
  return {
    key: k,
    size: h.size,
    lines,
    enterAt: Math.min(...lines.map((l) => l.enterAt)),
    exitAt,
    goneAt: exitAt === undefined ? undefined : exitAt + T.exit,
  };
});

/** Frame the end card may start entering: payoff gone + breathing gap. */
const payoff = headlineSchedule[headlineSchedule.length - 1];
export const END_CARD_AT = (payoff.goneAt ?? f(adConfig.durationSec)) + T.gap;

export const headlineHeight = (h: { size: number; lines: unknown[] }) =>
  h.size * adConfig.type.headlineLineHeight * h.lines.length;

/* ------------------------------------------------------------ the rules -- */
const errors: string[] = [];
headlineSchedule.forEach((h, i) => {
  const prev = headlineSchedule[i - 1];
  if (prev) {
    if (prev.goneAt === undefined) errors.push(`${prev.key} never exits but ${h.key} follows it`);
    else if (h.enterAt < prev.goneAt + T.gap)
      errors.push(`${h.key} enters at f${h.enterAt}, but ${prev.key} is only gone at f${prev.goneAt} (+${T.gap} gap)`);
  }
  const settled = Math.max(...h.lines.map((l) => l.enterAt)) + T.enter;
  if (h.exitAt !== undefined && h.exitAt - settled < T.minHold)
    errors.push(`${h.key} holds only ${h.exitAt - settled} frames before exiting (min ${T.minHold})`);
  const isPayoff = i === headlineSchedule.length - 1;
  if (!isPayoff && HEADLINE_Y + headlineHeight(h) > HERO_Y - 24)
    errors.push(`${h.key} headline (${headlineHeight(h)}px tall) runs into the product UI`);
});
const total = f(adConfig.durationSec);
if (END_CARD_AT + 45 > total) errors.push(`end card is on screen for only ${total - END_CARD_AT} frames (min 45)`);
if (errors.length) throw new Error("Headline schedule violates the text rules:\n  " + errors.join("\n  "));
