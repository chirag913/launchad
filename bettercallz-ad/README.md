# BetterCallz — 15s Meta/Instagram Reel

A Remotion (React + TypeScript) project that renders a 1080×1920, 30fps, H.264/AAC
performance ad for BetterCallz. The finished render is at **`out/BetterCallzAd.mp4`**.

```
LEAD ARRIVES → NOBODY CALLS → BETTERCALLZ CALLS → AI QUALIFIES → SALES TEAM GETS CONTEXT → TRY IT
```

## Commands

```bash
npm install
npm run sfx        # synthesise the sound palette into public/sfx (already committed)
npm run studio     # scrub the timeline at localhost:3000
npm run stills -- 0 3.5 6.5 9.4 11.8 14.5   # stills + contact sheet in out/stills/
npm run render     # → out/BetterCallzAd.mp4 (renders, masters audio to ≈-14 LUFS)
```

Render uses `--concurrency=1`, which avoids occasional tiled frames from parallel Chromium.
If a Chromium headless shell exists at `/opt/pw-browsers`, or you set
`REMOTION_BROWSER=/path/to/headless_shell`, the scripts use it. If not, Remotion downloads
its own on the first run.

## Structure

```
src/
  config/adConfig.ts        ← ALL copy, timing, lead data, qualification values, colours, type, sound cues
  config/layout.ts          ← frame geometry + safe zones
  compositions/BetterCallzAd.tsx
  components/
    AnimatedText.tsx        headline: words rise out of per-word masks, auto-fit to width
    LeadCard.tsx            the enquiry: lands like a notification, collapses to a row when called
    CallInterface.tsx       the empty "not called yet" slot → morphs into the live AI call → call bar
    Waveform.tsx            level meter driven by the REAL call audio (RMS of the voice file)
    QualificationCard.tsx   fields appear when asked, resolve when answered
    SalesBrief.tsx          AI CALL → QUALIFIED LEAD → SALES TEAM chain + brief with next step
    FinalCTA.tsx            wordmark, one button, one URL
    Subtitles.tsx           Hindi as spoken + English beneath
    SoundTrack.tsx          voice, ducked bed, cues
    SceneTransition.tsx     scene start/end helpers
  motion.ts                 easing/spring vocabulary (adapted from agentic-product-demo, MIT)
public/audio/property-voice.wav   the supplied AI call opening
public/sfx/*.wav                  synthesised, restrained UI sounds + low music bed
scripts/                          render / stills / sfx
reference/solar-reel.mp4          the reference ad (studied, not copied)
```

## Making a variant

Everything a viewer reads or hears is in `src/config/adConfig.ts`, and all times there are in seconds.

- **New hook or script:** edit `headlines`. Each scene has two lines, and `accent: true` sets a line in teal.
  Headlines auto-fit the width, so longer lines just get smaller.
- **Different timing:** change `scenes` (start seconds). The components place their beats relative to these starts.
- **Different buyer or market:** change `lead`, `qualification`, and `handoff`. The qualification list can have any length.
- **Different voice:** drop a file in `public/audio/`, then set `call.voiceSrc`, `call.voiceAt`, and the `subtitles` times.
  The waveform follows the new file automatically.
- **Sound:** move or re-level `sound.cues`. Swapping a `.wav` in `public/sfx` keeps the timing.
- Register a second `<Composition>` in `src/Root.tsx` if you want both variants side by side.

## Final on-screen copy

| Time | Headline | Supporting UI |
|---|---|---|
| 0.0–2.5 | YOUR META LEAD / JUST CAME IN. | NEW PROPERTY ENQUIRY · via Meta lead form · Aarav Mehta · 3 BHK · ₹2–2.5 Cr · Noida · Just received · Interested |
| 2.5–4.5 | WHO'S / CALLING IT? | Not called yet · NOT CALLED YET · 0→47 min waiting · Lead is going cold. |
| 4.5–7.5 | BETTERCALLZ / CALLS AUTOMATICALLY. | AI calling · Real AI call · Calling Aarav… → Connected · AI speaking · live waveform |
| 7.5–10.5 | AI QUALIFIES / THE BUYER. | BUYER QUALIFICATION · From the live call · BUDGET ₹2–2.5 Cr · REQUIREMENT 3 BHK · TIMELINE 1–2 months · INTENT High |
| 10.5–12.5 | YOUR SALES TEAM / GETS THE CONTEXT. | AI CALL → QUALIFIED LEAD → SALES TEAM · SALES BRIEF · Qualified · ASSIGNED TO YOUR SALES TEAM · Next step: Site visit |
| 12.5–15.0 | YOU PAID FOR THE LEAD. / DON'T LET IT GO COLD. | bettercallz. · **GET A LIVE AI CALL →** · demo.bettercallz.com |

## Voice / audio script

The only voice is the supplied recording of BetterCallz's AI opening a property call.
It plays from 4.72s, and the speech runs about 5.3–9.1s:

1. *"नमस्ते, मैं BetterCallz से बोल रहा हूँ।"*: "Hi, I'm calling from BetterCallz."
2. *"क्या अभी कोई प्रॉपर्टी देख रहे हैं?"*: "Are you looking at a property right now?"

Sound cues:
- 0.18s: soft notification (lead arrives)
- 2.5–4.3s: clock ticks, one per minute change
- 4.48s: one Indian-style ringback burst
- 5.08s: connect blip
- One muted pluck per qualified field
- 10.95s: warm "confirm" at the handoff
- 13.1s: soft chime on the CTA

Under all of this is a low music bed that ducks about 7 dB while the AI speaks.
The master is loudness-normalised with a −1.5 dBTP ceiling.
