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
  /** leave so the headline is completely gone when this scene starts.
   *  Omit and it leaves just before the next headline's slot. */
  until?: SceneKey;
};

export type Speaker = "ai" | "buyer";

export type Turn = {
  speaker: Speaker;
  /** span of the source recording (s), with ~0.1s of room either side.
   *  The audio inside a span is never altered. */
  from: number;
  to: number;
  /** exactly what is said, as shown in the live transcript. `\n` marks an
   *  intentional line break — transcript lines never wrap on their own. */
  caption: string;
  /** a field the AI is asking about, or the buyer is answering */
  asks?: FieldKey;
  answers?: FieldKey;
  /** marks the buyer's first reply — the lead is engaged */
  engages?: boolean;
  /** optional line: set INCLUDE_ENQUIRY_LINE=false for a ~2s shorter cut */
  optional?: boolean;
};

export type FieldKey = "purpose" | "budget";

/** The AI's second sentence ("you enquired recently…"). Keeping it makes the
 *  call feel unmistakably real; dropping it gives a ~2s shorter ad. */
const INCLUDE_ENQUIRY_LINE = true;

/* ------------------------------------------------------------ the call -- */
const call = {
  src: "audio/sarvam-call.wav",
  badge: "Real AI call",
  /** extra silence added between consecutive spans (s). Each span already
   *  carries ~0.1–0.15s of its own room, so pauses stay natural (~0.3s). */
  gap: 0.06,
  turns: (
    [
      { speaker: "ai", from: 0.7, to: 2.72, caption: "नमस्ते, मैं BetterCallz से बोल रहा हूँ।" },
      { speaker: "ai", from: 2.86, to: 4.86, caption: "आपने हाल ही में प्रॉपर्टी के लिए\nपूछताछ की थी।", optional: true },
      { speaker: "ai", from: 5.12, to: 7.62, caption: "क्या आप अभी भी\nप्रॉपर्टी देख रहे हैं?" },
      { speaker: "buyer", from: 8.24, to: 8.96, caption: "हाँ जी।", engages: true },
      {
        speaker: "ai",
        from: 9.22,
        to: 12.92,
        caption: "अच्छा, तो आप अपने रहने के लिए\nदेख रहे हैं या investment के लिए?",
        asks: "purpose",
      },
      { speaker: "buyer", from: 13.7, to: 14.38, caption: "Investment के लिए।", answers: "purpose" },
      { speaker: "ai", from: 14.5, to: 16.38, caption: "अच्छा, आपका budget\nroughly कितना है?", asks: "budget" },
      { speaker: "buyer", from: 16.54, to: 17.32, caption: "2 करोड़।", answers: "budget" },
    ] as Turn[]
  ).filter((t) => INCLUDE_ENQUIRY_LINE || !t.optional),
};

/* ------------------------------------------------------------ timeline -- */
/** Beats before the call, in seconds. */
const ARRIVE = 0;
const WAITING = 2.5; // "THE FIRST CALL STILL HASN'T."
const CALLING = 4.2; // "BETTERCALLZ CALLS AUTOMATICALLY." — the reveal
/** the AI starts speaking this long after the reveal (ring, connect) */
const CONNECT_DELAY = 0.7;

/** Each used span placed on the ad's timeline (seconds). */
export const dialogue = (() => {
  let t = CALLING + CONNECT_DELAY;
  return call.turns.map((turn, i) => {
    const start = t;
    const end = start + (turn.to - turn.from);
    t = end + call.gap;
    return { ...turn, index: i, start, end };
  });
})();

const lastTurn = dialogue[dialogue.length - 1];

const scenes = {
  arrive: ARRIVE,
  waiting: WAITING,
  calling: CALLING,
  /** the reveal headline leaves as the greeting finishes; from here the
   *  conversation is the hero — no marketing headline over it */
  conversation: dialogue[0].end + 0.25,
  handoff: lastTurn.end + 0.2,
  close: lastTurn.end + 0.2 + 2.6,
};
export type SceneKey = keyof typeof scenes;

export const adConfig = {
  id: "BetterCallzAd",
  durationSec: Math.ceil((scenes.close + 3.6) * 10) / 10,

  scenes,

  /* --------------------------------------------------------- headlines -- */
  /** In order. Each one exits completely (plus a gap) before the next
   *  enters — enforced by config/headlineSchedule.ts. */
  headlines: [
    { scene: "arrive", size: 88, lines: [{ text: "A NEW PROPERTY" }, { text: "ENQUIRY JUST" }, { text: "CAME IN." }] },
    { scene: "waiting", size: 112, lines: [{ text: "THE FIRST CALL" }, { text: "STILL HASN'T.", accent: true }] },
    {
      scene: "calling",
      until: "conversation",
      size: 88,
      lines: [{ text: "BETTERCALLZ" }, { text: "CALLS" , accent: true }, { text: "AUTOMATICALLY.", accent: true }],
    },
    // (no headline during the conversation)
    {
      scene: "handoff",
      offset: 0.55, // the qualified brief lands first, then this line
      size: 88,
      lines: [{ text: "YOUR SALESPERSON" }, { text: "KNOWS WHAT THE" }, { text: "BUYER WANTS.", accent: true }],
    },
    {
      scene: "close",
      size: 104,
      lines: [
        { text: "YOU PAID FOR", at: 0.15 },
        { text: "THE LEAD.", at: 0.25 },
        { text: "DON'T LET IT", accent: true, at: 1.0 },
        { text: "GO COLD.", accent: true, at: 1.1 },
      ],
    },
  ] satisfies Headline[],

  /* -------------------------------------------------------------- lead -- */
  /** The enquiry, as a form lead arrives: illustrative buyer and example
   *  requirement only. */
  lead: {
    sourceLabel: "NEW PROPERTY ENQUIRY",
    source: "Meta lead form",
    name: "Aarav Mehta",
    initials: "AM",
    phone: "+91 98XXX XX421",
    chips: ["3 BHK", "₹1.5–2 Cr"],
    received: "Just received",
    notContacted: "Not contacted yet",
    calling: "BetterCallz is calling…",
  },

  /** Scene 2: the empty slot where the first call should be. */
  waiting: {
    label: "FIRST CALL",
    text: "No one has spoken to this buyer yet",
  },

  call,

  /* ---------------------------------------------------------- capture -- */
  /** What the call captures. Values are exactly what the buyer said. */
  fields: {
    purpose: { label: "PURPOSE", value: "Investment" },
    budget: { label: "BUDGET", value: "₹2 Cr" },
  } satisfies Record<FieldKey, { label: string; value: string }>,

  /* ----------------------------------------------------------- handoff -- */
  handoff: {
    briefTitle: "SALES BRIEF",
    badge: "QUALIFIED",
    status: "Still looking",
    /** who did what — the AI had the first conversation, a person follows up */
    firstCall: { label: "FIRST CALL", value: "Done by BetterCallz AI" },
    followUp: { label: "FOLLOW-UP", value: "Your salesperson" },
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
      { at: scenes.calling + 0.1, src: "sfx/ring.wav", volume: 0.14 },
      { at: scenes.handoff + 0.15, src: "sfx/confirm.wav", volume: 0.2 },
    ],
    /** a soft pluck as each field is captured */
    resolveVolume: 0.18,
    /** the end card's chime, relative to when the CTA lands */
    ctaChime: { src: "sfx/notify.wav", volume: 0.26 },
  },
} as const;

export type AdConfig = typeof adConfig;
