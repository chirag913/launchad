/* ---------------------------------------------------------------------------
 * adConfig — the only file you should need to touch to cut a new variant.
 *
 * Everything the viewer reads or hears, and every beat it lands on, lives
 * here. Components read from this object and never hard-code copy or timing.
 * Times are in SECONDS (converted to frames with `f()`), so a script change
 * does not require frame arithmetic.
 * ------------------------------------------------------------------------- */

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

/** seconds → frames */
export const f = (s: number) => Math.round(s * FPS);

export type HeadlineLine = {
  text: string;
  accent?: boolean;
  /** seconds after the scene starts that this line enters. Omit and the
   *  line enters with the state, staggered a few frames after the one above. */
  at?: number;
};

export type Headline = {
  /** Explicit font size (px). Every line must fit HEADLINE_W at this size —
   *  the render throws if one does not. Break long sentences into lines
   *  here; nothing ever wraps automatically. */
  size: number;
  lines: HeadlineLine[];
  /** seconds after the scene starts that the headline exits. Omit and it
   *  exits so that it is completely gone by the time the next scene starts. */
  exitAt?: number;
};

export const adConfig = {
  id: "BetterCallzAd",
  durationSec: 15.5,

  /* ------------------------------------------------------------ scenes -- */
  /** Scene start times (s). Each scene runs until the next one starts.
   *  The outgoing headline finishes leaving exactly as its scene ends; the
   *  incoming one enters after a short breathing gap. */
  scenes: {
    arrive: 0,
    waiting: 2.1,
    calling: 3.8,
    qualify: 6.7,
    handoff: 9.2,
    close: 11.0,
  },

  /* --------------------------------------------------------- headlines -- */
  /** `accent` lines render in brand teal. A trailing "." on a white line
   *  gets the brand's teal full stop. */
  headlines: {
    arrive: { size: 112, lines: [{ text: "YOUR META LEAD" }, { text: "JUST CAME IN." }] },
    waiting: { size: 112, lines: [{ text: "WHO'S" }, { text: "CALLING IT?", accent: true }] },
    calling: { size: 80, lines: [{ text: "BETTERCALLZ" }, { text: "CALLS AUTOMATICALLY.", accent: true }] },
    qualify: { size: 112, lines: [{ text: "AI QUALIFIES" }, { text: "THE BUYER." }] },
    handoff: { size: 98, lines: [{ text: "YOUR SALES TEAM" }, { text: "GETS THE CONTEXT.", accent: true }] },
    // The payoff owns the whole frame, so it is set larger, in four
    // intentional lines, and lands in two beats.
    close: {
      size: 124,
      lines: [
        { text: "YOU PAID", at: 0.15 },
        { text: "FOR THE LEAD.", at: 0.25 },
        { text: "DON'T LET IT", accent: true, at: 1.15 },
        { text: "GO COLD.", accent: true, at: 1.25 },
      ],
      exitAt: 2.2,
    },
  } satisfies Record<string, Headline>,

  /* -------------------------------------------------------------- lead -- */
  /** The enquiry the whole story follows. Illustrative buyer, not a customer. */
  lead: {
    sourceLabel: "NEW PROPERTY ENQUIRY",
    source: "Meta lead form",
    name: "Aarav Mehta",
    initials: "AM",
    phone: "+91 98XXX XX421",
    chips: ["3 BHK", "₹2–2.5 Cr", "Noida"],
    status: "Interested",
  },

  /** Scene 2: how long the lead has sat uncalled. The clock runs fast to
   *  show time passing — minutes, not seconds. */
  waiting: {
    label: "NOT CALLED YET",
    toMinutes: 47,
  },

  /* -------------------------------------------------------------- call -- */
  call: {
    badge: "Real AI call",
    calling: "Calling Aarav…",
    connected: "Connected",
    /** Voice file (in /public) and where it starts on the timeline. The
     *  speech inside the file begins ~0.62s in. */
    voiceSrc: "audio/property-voice.wav",
    voiceAt: 4.02,
    /** Subtitles, timed against the TIMELINE (s). Hindi as spoken, with an
     *  English line under it for viewers who don't speak Hindi. */
    subtitles: [
      { from: 4.6, to: 6.6, hi: "नमस्ते, मैं BetterCallz से बोल रहा हूँ।", en: "Hi, I'm calling from BetterCallz." },
      { from: 7.05, to: 8.55, hi: "क्या अभी कोई प्रॉपर्टी देख रहे हैं?", en: "Are you looking at a property right now?" },
    ],
  },

  /* --------------------------------------------------------- qualify -- */
  /** Resolved one after another, as if heard in the conversation. `at` is
   *  seconds after the qualify scene starts. */
  qualification: [
    { label: "BUDGET", value: "₹2–2.5 Cr", at: 0.5 },
    { label: "REQUIREMENT", value: "3 BHK", at: 0.92 },
    { label: "TIMELINE", value: "1–2 months", at: 1.34 },
    { label: "INTENT", value: "High", at: 1.76, highlight: true },
  ],

  /* ----------------------------------------------------------- handoff -- */
  handoff: {
    steps: ["AI CALL", "QUALIFIED LEAD", "SALES TEAM"],
    briefTitle: "SALES BRIEF",
    badge: "Qualified",
    nextStepLabel: "Next step",
    nextStep: "Site visit",
    assigned: "Assigned to your sales team",
  },

  /* ------------------------------------------------------------- close -- */
  cta: {
    label: "GET A LIVE AI CALL",
    url: "demo.bettercallz.com",
    /* Enters after the payoff headline has completely left — computed in
     * config/headlineSchedule.ts, not set here. */
  },

  /* ------------------------------------------------------------- brand -- */
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
  /** Cue sheet (timeline seconds). Voice is always dominant; everything
   *  here sits well under it. */
  sound: {
    bedVolume: 0.1,
    /** bed ducks to this while the AI voice is speaking */
    bedDuck: 0.045,
    cues: [
      { at: 0.05, src: "sfx/notify.wav", volume: 0.42 },
      { at: 2.05, src: "sfx/air.wav", volume: 0.22 },
      { at: 3.78, src: "sfx/ring.wav", volume: 0.16 },
      { at: 4.38, src: "sfx/connect.wav", volume: 0.14 },
      { at: 6.65, src: "sfx/air.wav", volume: 0.16 },
      { at: 9.15, src: "sfx/air.wav", volume: 0.18 },
      { at: 9.55, src: "sfx/confirm.wav", volume: 0.22 },
      { at: 10.95, src: "sfx/air.wav", volume: 0.22 },
      { at: 13.6, src: "sfx/notify.wav", volume: 0.3 },
    ],
    /** ticks for the uncalled clock in scene 2 */
    tickVolume: 0.1,
    /** plucks as each qualification field resolves */
    resolveVolume: 0.2,
  },
} as const;

export type AdConfig = typeof adConfig;
