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

export type HeadlineLine = { text: string; accent?: boolean };

export const adConfig = {
  id: "BetterCallzAd",
  durationSec: 15,

  /* ------------------------------------------------------------ scenes -- */
  /** Scene start times (s). Each scene runs until the next one starts. */
  scenes: {
    arrive: 0,
    waiting: 2.5,
    calling: 4.5,
    qualify: 7.5,
    handoff: 10.5,
    close: 12.5,
  },

  /* --------------------------------------------------------- headlines -- */
  /** Two-line headline per scene. `accent` lines render in brand teal.
   *  A trailing "." on the last word gets the brand's teal full stop. */
  headlines: {
    arrive: [{ text: "YOUR META LEAD" }, { text: "JUST CAME IN." }],
    waiting: [{ text: "WHO'S" }, { text: "CALLING IT?", accent: true }],
    calling: [{ text: "BETTERCALLZ" }, { text: "CALLS AUTOMATICALLY.", accent: true }],
    qualify: [{ text: "AI QUALIFIES" }, { text: "THE BUYER." }],
    handoff: [{ text: "YOUR SALES TEAM" }, { text: "GETS THE CONTEXT.", accent: true }],
    close: [{ text: "YOU PAID FOR THE LEAD." }, { text: "DON'T LET IT GO COLD.", accent: true }],
  } satisfies Record<string, HeadlineLine[]>,

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
    voiceAt: 4.72,
    /** Subtitles, timed against the TIMELINE (s). Hindi as spoken, with an
     *  English line under it for viewers who don't speak Hindi. */
    subtitles: [
      { from: 5.3, to: 7.35, hi: "नमस्ते, मैं BetterCallz से बोल रहा हूँ।", en: "Hi, I'm calling from BetterCallz." },
      { from: 7.75, to: 9.25, hi: "क्या अभी कोई प्रॉपर्टी देख रहे हैं?", en: "Are you looking at a property right now?" },
    ],
  },

  /* --------------------------------------------------------- qualify -- */
  /** Resolved one after another, as if heard in the conversation. `at` is
   *  seconds after the qualify scene starts. */
  qualification: [
    { label: "BUDGET", value: "₹2–2.5 Cr", at: 0.55 },
    { label: "REQUIREMENT", value: "3 BHK", at: 1.05 },
    { label: "TIMELINE", value: "1–2 months", at: 1.55 },
    { label: "INTENT", value: "High", at: 2.05, highlight: true },
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
    /** seconds after the close scene starts */
    at: 0.6,
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
    headlineSize: 104,
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
      { at: 0.18, src: "sfx/notify.wav", volume: 0.42 },
      { at: 2.5, src: "sfx/air.wav", volume: 0.22 },
      { at: 4.48, src: "sfx/ring.wav", volume: 0.16 },
      { at: 5.08, src: "sfx/connect.wav", volume: 0.14 },
      { at: 7.5, src: "sfx/air.wav", volume: 0.16 },
      { at: 10.5, src: "sfx/air.wav", volume: 0.18 },
      { at: 10.95, src: "sfx/confirm.wav", volume: 0.22 },
      { at: 12.5, src: "sfx/air.wav", volume: 0.22 },
      { at: 13.1, src: "sfx/notify.wav", volume: 0.3 },
    ],
    /** ticks for the uncalled clock in scene 2 */
    tickVolume: 0.1,
    /** plucks as each qualification field resolves */
    resolveVolume: 0.2,
  },
} as const;

export type AdConfig = typeof adConfig;
