/* ---------------------------------------------------------------------------
 * The headline schedule: every headline state, in frames, with explicit
 * enter / hold / exit windows — and the rules that keep them apart.
 *
 * Derived from adConfig (which is itself timed from the call recording), so
 * a new script or recording re-times itself. Validated at module load: if a
 * rule is broken the render fails loudly instead of shipping overlapping text.
 *
 *   1. A state is completely gone before the next one starts entering,
 *      with at least TEXT_TIMING.gap empty frames in between.
 *   2. Every line is fully settled for at least minHold frames before exit.
 *   3. On scenes with product UI, the headline block ends above the UI.
 *   4. The end card sits below the payoff (never over it) and is on screen
 *      long enough to read.
 * ------------------------------------------------------------------------- */
import { TEXT_TIMING } from "../components/TextTransition";
import { adConfig, f, SceneKey } from "./adConfig";
import { HEADLINE_Y, HERO_Y } from "./layout";

export type ScheduledLine = { text: string; accent?: boolean; enterAt: number };
export type ScheduledHeadline = {
  key: string;
  scene: SceneKey;
  size: number;
  lines: ScheduledLine[];
  /** first frame any line starts entering */
  enterAt: number;
  /** frame the state starts exiting (undefined = holds to the end) */
  exitAt?: number;
  /** first frame after the exit completes */
  goneAt?: number;
};

const T = TEXT_TIMING;
const list = adConfig.headlines;

/** Frame a headline's slot opens: its scene start + offset. */
const slotAt = (i: number) => f(adConfig.scenes[list[i].scene] + (list[i].offset ?? 0));

export const headlineSchedule: ScheduledHeadline[] = list.map((h, i) => {
  // The opening state is already settled on frame 0 so the thumbnail reads.
  const base = i === 0 ? -(T.enter + T.lineStagger * h.lines.length) : slotAt(i) + T.gap;
  const lines = h.lines.map((l, li) => ({
    text: l.text,
    accent: "accent" in l ? l.accent : undefined,
    enterAt: "at" in l && l.at !== undefined ? slotAt(i) + f(l.at) : base + li * T.lineStagger,
  }));
  // Exit so the state is completely gone exactly when the next slot opens.
  const until = "until" in h ? h.until : undefined;
  const exitAt = until ? f(adConfig.scenes[until]) - T.exit : i < list.length - 1 ? slotAt(i + 1) - T.exit : undefined;
  return {
    key: `${h.scene}-${i}`,
    scene: h.scene,
    size: h.size,
    lines,
    enterAt: Math.min(...lines.map((l) => l.enterAt)),
    exitAt,
    goneAt: exitAt === undefined ? undefined : exitAt + T.exit,
  };
});

export const headlineHeight = (h: { size: number; lines: unknown[] }) =>
  Math.round(h.size * adConfig.type.headlineLineHeight) * h.lines.length;

const payoff = headlineSchedule[headlineSchedule.length - 1];
/** Bottom edge (px) of the payoff block — the end card sits below it. */
export const PAYOFF_BOTTOM = HEADLINE_Y + headlineHeight(payoff);
/** Frame the end card enters: once the last payoff line has settled. */
export const END_CARD_AT = Math.max(...payoff.lines.map((l) => l.enterAt)) + T.enter + 2;

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
  if (!isPayoff && HEADLINE_Y + headlineHeight(h) > HERO_Y - 48)
    errors.push(`${h.key} headline (${headlineHeight(h)}px tall) runs into the product UI`);
});
const total = f(adConfig.durationSec);
if (total - END_CARD_AT < 42) errors.push(`end card is on screen for only ${total - END_CARD_AT} frames (min 42)`);
if (errors.length) throw new Error("Headline schedule violates the text rules:\n  " + errors.join("\n  "));
