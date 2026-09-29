/* ---------------------------------------------------------------------------
 * adConfig — the only file you should need to touch to cut a new variant.
 *
 * The ad is built AROUND a real call recording. `call.turns` lists which
 * spans of the recording are used (source seconds, untouched audio); the
 * timeline below lays them end to end with a short, natural gap and every
 * scene and headline is timed from that. Swap the recording and its turn
 * list and the whole film re-times itself.
 * ------------------------------------------------------------------------- */

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

/** seconds → frames */
export const f = (s: number) => Math.round(s * FPS);

export type HeadlineLine = {
  text: string;
  accent?: boolean;
  /** seconds after the headline's own start that this line enters. Omit
   *  and lines enter together, staggered a few frames apart. */
  at?: number;
};

export type Headline = {
  /** scene this headline belongs to, and seconds after that scene starts */
  scene: SceneKey;
  offset?: number;
  /** Explicit font size (px). Every line must fit the 936px container at
   *  this size — the render throws if one does not. Nothing wraps. */
  size: number;
  lines: HeadlineLine[];
  /** omit on the last headline to hold it to the end */
};

export type Speaker = "ai" | "buyer";

export type Turn = {
  speaker: Speaker;
  /** span of the source recording (s), with ~0.1s of room either side */
  from: number;
  to: number;
  /** English meaning of the line, shown in the call's live transcript */
  caption: string;
  /** a field the AI is asking about, or the buyer is answering */
  asks?: FieldKey;
  answers?: FieldKey;
  /** marks the buyer's first reply — the lead is engaged */
  engages?: boolean;
};

export type FieldKey = "purpose" | "budget";

/* ------------------------------------------------------------ the call -- */
const call = {
  src: "audio/sarvam-call.wav",
  badge: "Real AI call",
  /** timeline second the first used turn starts */
  startAt: 0.85,
  /** extra silence inserted between consecutive turns (s) */
  gap: 0.08,
  turns: [
    { speaker: "ai", from: 5.14, to: 7.62, caption: "Are you still looking at properties?" },
    { speaker: "buyer", from: 8.26, to: 8.95, caption: "Yes.", engages: true },
    { speaker: "ai", from: 9.22, to: 12.92, caption: "Is it for living, or for investment?", asks: "purpose" },
    { speaker: "buyer", from: 13.72, to: 14.36, caption: "Investment.", answers: "purpose" },
    { speaker: "ai", from: 14.5, to: 16.36, caption: "What's your approximate budget?", asks: "budget" },
    { speaker: "buyer", from: 16.56, to: 17.3, caption: "2 crore.", answers: "budget" },
  ] as Turn[],
};

/** Each used turn placed on the ad's timeline (seconds). */
export const dialogue = (() => {
  let t = call.startAt;
  return call.turns.map((turn, i) => {
    const start = t;
    const end = start + (turn.to - turn.from);
    t = end + call.gap;
    return { ...turn, index: i, start, end };
  });
})();

const firstTurn = dialogue[0];
const lastTurn = dialogue[dialogue.length - 1];
const firstAsk = dialogue.find((d) => d.asks)!;

const scenes = {
  arrive: 0,
  /** the call UI appears and rings just before the AI speaks */
  call: firstTurn.start - 0.42,
  qualify: firstAsk.start - 0.2,
  handoff: lastTurn.end + 0.12,
  close: lastTurn.end + 0.12 + 1.85,
};
export type SceneKey = keyof typeof scenes;

/** The full enquiry card stays up while the call rings and connects under
 *  it, then collapses to a row as the second headline arrives. */
const LEAD_COLLAPSE_OFFSET = 1.45;
export const leadCollapseAt = scenes.call + LEAD_COLLAPSE_OFFSET;

export const adConfig = {
  id: "BetterCallzAd",
  durationSec: 16,

  scenes,

  /* --------------------------------------------------------- headlines -- */
  /** In order. Each one exits completely (plus a gap) before the next
   *  enters — enforced by config/headlineSchedule.ts. */
  headlines: [
    { scene: "arrive", size: 88, lines: [{ text: "A NEW PROPERTY" }, { text: "ENQUIRY JUST" }, { text: "CAME IN." }] },
    { scene: "call", offset: LEAD_COLLAPSE_OFFSET, size: 108, lines: [{ text: "BETTERCALLZ" }, { text: "CALLS THE LEAD.", accent: true }] },
    { scene: "qualify", size: 108, lines: [{ text: "AI QUALIFIES" }, { text: "THE BUYER." }] },
    {
      scene: "handoff",
      size: 88,
      lines: [{ text: "YOUR SALESPERSON" }, { text: "KNOWS WHAT THE" }, { text: "BUYER WANTS.", accent: true }],
    },
    {
      scene: "close",
      size: 104,
      lines: [
        { text: "YOU PAID FOR", at: 0.15 },
        { text: "THE LEAD.", at: 0.25 },
        { text: "DON'T LET IT", accent: true, at: 0.6 },
        { text: "GO COLD.", accent: true, at: 0.7 },
      ],
    },
  ] satisfies Headline[],

  /* -------------------------------------------------------------- lead -- */
  /** The enquiry. Illustrative buyer — no budget or preference here: the
   *  call is what finds those out. */
  lead: {
    sourceLabel: "NEW PROPERTY ENQUIRY",
    source: "Meta lead form",
    name: "Aarav Mehta",
    initials: "AM",
    phone: "+91 98XXX XX421",
    received: "Just received",
  },

  call,

  /* ---------------------------------------------------------- capture -- */
  /** What the call captures. Values are exactly what the buyer said. */
  fields: {
    purpose: { label: "PURPOSE", value: "Investment" },
    budget: { label: "BUDGET", value: "₹2 Crore" },
  } satisfies Record<FieldKey, { label: string; value: string }>,

  /* ----------------------------------------------------------- handoff -- */
  handoff: {
    briefTitle: "SALES BRIEF",
    badge: "Qualified",
    assigned: "Handed to your sales team",
    status: "Still looking",
  },

  /* ------------------------------------------------------------- close -- */
  cta: {
    label: "GET A LIVE AI CALL",
    url: "demo.bettercallz.com",
  },

  brand: {
    wordmark: "bettercallz",
  },

  colors: {
    bg: "#090B0B",
    bgGlow: "#0D1F19",
    surface: "#101514",
    surfaceHi: "#141B19",
    border: "rgba(255,255,255,0.08)",
    borderHi: "rgba(255,255,255,0.14)",
    text: "#F2F5F4",
    textDim: "rgba(242,245,244,0.62)",
    textMute: "rgba(242,245,244,0.40)",
    accent: "#1FB391",
    accentBright: "#3FD8B1",
    accentInk: "#04120E",
    warn: "#E3A857",
  },

  type: {
    display: "'Inter Tight', sans-serif",
    ui: "'Inter Tight', sans-serif",
    hindi: "'Noto Sans Devanagari', 'Inter Tight', sans-serif",
    headlineLineHeight: 1.0,
    headlineTracking: "-0.045em",
  },

  /* ------------------------------------------------------------- sound -- */
  /** The call recording is the only voice and always dominant. Cues are
   *  soft and sit on visual events; the bed ducks under the whole call. */
  sound: {
    bedVolume: 0.1,
    bedDuck: 0.035,
    voiceVolume: 1,
    cues: [
      { at: 0.05, src: "sfx/notify.wav", volume: 0.4 },
      { at: scenes.call - 0.02, src: "sfx/ring.wav", volume: 0.14 },
      { at: scenes.handoff + 0.1, src: "sfx/confirm.wav", volume: 0.2 },
    ],
    /** a soft pluck as each field is captured */
    resolveVolume: 0.18,
    /** the end card's chime, relative to when the CTA lands */
    ctaChime: { src: "sfx/notify.wav", volume: 0.26 },
  },
} as const;

export type AdConfig = typeof adConfig;
