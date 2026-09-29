# BetterCallz — 15.5s Meta/Instagram Reel

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

- **New hook or script:** edit `headlines`. Give each state an explicit `size` and its lines. `accent: true` sets a line in teal, and
  `at` sets per-line timing (as in the payoff). If a line does not fit, or the timing breaks a rule, the render fails with a message.
- **Different timing:** change `scenes` (start seconds). The components place their beats relative to these starts.
- **Different buyer or market:** change `lead`, `qualification`, and `handoff`. The qualification list can have any length.
- **Different voice:** drop a file in `public/audio/`, then set `call.voiceSrc`, `call.voiceAt`, and the `subtitles` times.
  The waveform follows the new file automatically.
- **Sound:** move or re-level `sound.cues`. Swapping a `.wav` in `public/sfx` keeps the timing.
- Register a second `<Composition>` in `src/Root.tsx` if you want both variants side by side.

## Final on-screen copy (15.5s)

| Time | Headline | Supporting UI |
|---|---|---|
| 0.0–2.1 | YOUR META LEAD / JUST CAME IN. | NEW PROPERTY ENQUIRY · via Meta lead form · Aarav Mehta · 3 BHK · ₹2–2.5 Cr · Noida · Just received · Interested |
| 2.1–3.8 | WHO'S / CALLING IT? | Not called yet · NOT CALLED YET · 0→47 min waiting · Lead is going cold. |
| 3.8–6.7 | BETTERCALLZ / CALLS AUTOMATICALLY. | AI calling · Real AI call · Calling Aarav… → Connected · AI speaking · live waveform |
| 6.7–9.2 | AI QUALIFIES / THE BUYER. | BUYER QUALIFICATION · BUDGET ₹2–2.5 Cr · REQUIREMENT 3 BHK · TIMELINE 1–2 months · INTENT High |
| 9.2–11.0 | YOUR SALES TEAM / GETS THE CONTEXT. | AI CALL → QUALIFIED LEAD → SALES TEAM · SALES BRIEF · Next step: Site visit |
| 11.15–12.25 | YOU PAID / FOR THE LEAD. | the payoff line enters by itself, full frame |
| 12.25–13.3 | + DON'T LET IT / GO COLD. | the second line lands under the first one |
| 13.3–13.7 | exits completely, then a gap | |
| 13.7–15.5 | bettercallz. · **GET A LIVE AI CALL →** · demo.bettercallz.com | end card, fully readable for about 1.75s |

## Text transition system

All headline text goes through three explicit windows: **enter → hold → exit**. The code is in
`components/TextTransition.tsx`, with `enter` 12, `exit` 8, `gap` 4 and `minHold` 12 frames.
`config/headlineSchedule.ts` derives every headline state from `adConfig` and **throws at render
time** if any of these rules is broken:

1. A headline is completely gone before the next one begins to enter, with at least `gap` empty frames between them.
2. Every line holds still for at least `minHold` frames before it exits.
3. The end card enters only after the payoff has fully left, and it stays on screen for at least 1.5s.
4. On scenes with product UI, the headline block ends above the cards.
5. Each line has an explicit font size and fixed line height, and never wraps. A line wider than its 936px container stops the render, so long lines must be broken on purpose in `adConfig`.

Nothing is masked, so no glyph can be clipped mid-animation. UI text that swaps in place follows the
same rule (for example "Just received" → "Not called yet", "Listening…" → the answer, "Calling…" →
"Connected"): `swap()` takes the old text out, waits a short gap, then brings the new text in.

## Voice / audio script

The only voice is the supplied recording of BetterCallz's AI opening a property call.
It plays from 4.02s, and the speech runs about 4.6–8.4s:

1. *"नमस्ते, मैं BetterCallz से बोल रहा हूँ।"*: "Hi, I'm calling from BetterCallz."
2. *"क्या अभी कोई प्रॉपर्टी देख रहे हैं?"*: "Are you looking at a property right now?"

Sound cues:
- 0.05s: soft notification (lead arrives)
- 2.3–3.5s: clock ticks, one per minute change
- 3.78s: one Indian-style ringback burst
- 4.38s: connect blip
- One muted pluck per qualified field
- 9.55s: warm "confirm" at the handoff
- 13.6s: soft chime on the end card

Under all of this is a low music bed that ducks about 7 dB while the AI speaks.
The master is loudness-normalised with a −1.5 dBTP ceiling.
