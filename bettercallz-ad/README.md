# BetterCallz — 16s Meta/Instagram Reel (real call recording)

A Remotion (React + TypeScript) project that renders a 1080×1920, 30fps, H.264/AAC
performance ad for BetterCallz. The finished render is at **`out/BetterCallzAd.mp4`**.

```
ENQUIRY ARRIVES → BETTERCALLZ CALLS (real Sarvam recording) → WHAT THE BUYER SAYS IS CAPTURED
→ SALES BRIEF → YOU PAID FOR THE LEAD. DON'T LET IT GO COLD. → GET A LIVE AI CALL →
```

The film is built **around the recording**. `public/audio/sarvam-call.wav` is the real call.
`adConfig.call.turns` lists which spans of it are used, and every span plays untouched. The
only edit is shorter silences between turns (about 0.26s of natural pause is kept). Every scene,
headline, caption and captured field is timed from those turns, so a new recording and its turn
list re-time the whole ad.

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
    CallInterface.tsx       the live call: rings, connects, speaker meter, one-line live transcript
    Waveform.tsx            level meter read from the real recording through the same edit (AI teal, buyer white)
    CapturePanel.tsx        a field appears when the AI asks and its value lands as the buyer answers
    SalesBrief.tsx          AI CALL → QUALIFIED LEAD → SALES TEAM chain + brief with next step
    FinalCTA.tsx            wordmark, one button, one URL
    SoundTrack.tsx          voice, ducked bed, cues
    SceneTransition.tsx     scene start/end helpers
  motion.ts                 easing/spring vocabulary (adapted from agentic-product-demo, MIT)
public/audio/sarvam-call.wav      the real call recording (Sarvam)
public/audio/property-voice.wav   the earlier AI opening line (not used in this cut)
public/sfx/*.wav                  synthesised, restrained UI sounds + low music bed
scripts/                          render / stills / sfx
reference/solar-reel.mp4          the reference ad (studied, not copied)
```

## Making a variant

Everything a viewer reads or hears is in `src/config/adConfig.ts`, and all times there are in seconds.

- **New hook or script:** edit `headlines`. Give each state an explicit `size` and its lines. `accent: true` sets a line in teal, and
  `at` sets per-line timing (as in the payoff). If a line does not fit, or the timing breaks a rule, the render fails with a message.
- **Different buyer or market:** change `lead`, `fields`, and `handoff`.
- **Different recording:** drop a file in `public/audio/`, then set `call.src` and list the spans you want in `call.turns`,
  each with speaker, source from/to, caption, and optionally `asks` / `answers` a field or `engages`.
  The scenes, headlines, transcript, captured fields, meter and audio edit all follow.
- **Sound:** move or re-level `sound.cues`. Swapping a `.wav` in `public/sfx` keeps the timing.
- Register a second `<Composition>` in `src/Root.tsx` if you want both variants side by side.

## Final on-screen copy (16.0s)

| Time | Headline | Product UI |
|---|---|---|
| 0.0–1.9 | A NEW PROPERTY / ENQUIRY JUST / CAME IN. | NEW PROPERTY ENQUIRY · Aarav Mehta · Just received → "BetterCallz is calling…" · call card rings in underneath |
| 2.0–4.0 | BETTERCALLZ / CALLS THE LEAD. | Lead collapses to a row (Calling → **Engaged** when the buyer replies) · Real AI call · live meter · transcript |
| 4.1–11.5 | AI QUALIFIES / THE BUYER. | Transcript follows each turn · CAPTURED FROM THE CALL: PURPOSE → **Investment**, BUDGET → **₹2 Crore** |
| 11.6–13.3 | YOUR SALESPERSON / KNOWS WHAT THE / BUYER WANTS. | SALES BRIEF · Qualified · Aarav Mehta · Still looking · PURPOSE Investment · BUDGET ₹2 Crore · Handed to your sales team |
| 13.5–16.0 | YOU PAID FOR / THE LEAD. / DON'T LET IT / GO COLD. | then, below it: bettercallz. · **GET A LIVE AI CALL →** · demo.bettercallz.com (on screen from 14.5s) |

## The conversation (used spans of the recording)

| Ad time | Source | Speaker | Transcript caption (English meaning) |
|---|---|---|---|
| 0.85–3.33 | 5.14–7.62 | AI | "क्या आप अभी भी प्रॉपर्टी देख रहे हैं?": *Are you still looking at properties?* |
| 3.41–4.10 | 8.26–8.95 | Buyer | *Yes.* |
| 4.18–7.88 | 9.22–12.92 | AI | *Is it for living, or for investment?* |
| 7.96–8.60 | 13.72–14.36 | Buyer | *Investment.* |
| 8.68–10.54 | 14.50–16.36 | AI | *What's your approximate budget?* |
| 10.62–11.36 | 16.56–17.30 | Buyer | *2 crore.* |

Not used, to fit 16s: the greeting (0.8–4.8s, "Namaste, I'm calling from BetterCallz…" plus the
enquiry reference) and the closing (18.6–24.7s: the AI saying it will share the details with the
sales team, who will contact the buyer soon). To include either, add its span to `call.turns`.

Captions are English meanings. They are not verbatim Hindi, because the transcription was done with a small
offline model. Confirm the wording before publishing.

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

## Sound

The recording is the only voice. Under it:
- a soft notification when the enquiry lands
- one short ringback as the call starts
- a muted pluck as each field is captured
- a warm confirm at the handoff
- a chime on the end card
- a low bed that ducks under the whole call

The master is loudness-normalised to about −14 LUFS with a −1.5 dBTP ceiling.
