# BetterCallz — Meta/Instagram Reel built on a real call recording (26s)

A Remotion (React + TypeScript) project that renders a 1080×1920, 30fps, H.264/AAC
performance ad for BetterCallz. The finished render is at **`out/BetterCallzAd.mp4`**.

```
ENQUIRY ARRIVES → THE FIRST CALL STILL HASN'T → BETTERCALLZ CALLS AUTOMATICALLY
→ the real conversation (Hindi transcript, fields captured as they're said)
→ QUALIFIED brief: AI did the first call, your salesperson follows up
→ YOU PAID FOR THE LEAD. DON'T LET IT GO COLD. → GET A LIVE AI CALL →
```

The film is built **around the recording**. `public/audio/sarvam-call.wav` is the real call, and
`adConfig.call.turns` lists the spans used. Every span plays untouched. The only edit is shortening
the silences between sentences to about 0.3s. Every scene, transcript line and captured field is
timed from those spans. The whole conversation runs about 14.7s, which is why the ad is 26s and not
16s. Setting `INCLUDE_ENQUIRY_LINE = false` in `adConfig.ts` drops "आपने हाल ही में…" and makes the
ad about 2s shorter.

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

## Final timeline (26.0s)

| Time | Headline | Product UI |
|---|---|---|
| 0.0–2.2 | A NEW PROPERTY / ENQUIRY JUST / CAME IN. | NEW PROPERTY ENQUIRY · via Meta lead form · Aarav Mehta · 3 BHK · ₹1.5–2 Cr · Just received |
| 2.6–3.9 | THE FIRST CALL / STILL HASN'T. | Status: Not contacted yet · dashed FIRST CALL slot: "No one has spoken to this buyer yet" · Waiting 00:03 |
| 4.3–6.9 | BETTERCALLZ / CALLS / AUTOMATICALLY. | "BetterCallz is calling…" → the slot becomes the ringing call → the enquiry collapses to a row and the call grows |
| 4.9–19.6 | *(no headline: the conversation is the hero)* | Real AI call · live meter (AI teal, buyer white) · Hindi transcript line by line · Calling → **Engaged** on "हाँ जी" · CAPTURED FROM THIS CALL: PURPOSE **Investment** (on "Investment के लिए"), BUDGET **₹2 Cr** (on "2 करोड़") |
| 19.9–22.2 | YOUR SALESPERSON / KNOWS WHAT THE / BUYER WANTS. (from 20.5s) | SALES BRIEF · ✓ QUALIFIED · Aarav Mehta · Still looking · PURPOSE Investment · BUDGET ₹2 Cr · FIRST CALL: Done by BetterCallz AI · FOLLOW-UP: Your salesperson → |
| 22.6–26.0 | YOU PAID FOR / THE LEAD. / DON'T LET IT / GO COLD. | then below it, from 24.0s: **GET A LIVE AI CALL →** · demo.bettercallz.com (the small wordmark stays top-left) |

## The conversation (spans of the recording, untouched)

| Ad time | Source | Speaker | Transcript |
|---|---|---|---|
| 4.90 | 0.70–2.72 | AI | नमस्ते, मैं BetterCallz से बोल रहा हूँ। |
| 6.98 | 2.86–4.86 | AI | आपने हाल ही में प्रॉपर्टी के लिए पूछताछ की थी। |
| 9.04 | 5.12–7.62 | AI | क्या आप अभी भी प्रॉपर्टी देख रहे हैं? |
| 11.60 | 8.24–8.96 | Buyer | हाँ जी। |
| 12.38 | 9.22–12.92 | AI | अच्छा, तो आप अपने रहने के लिए देख रहे हैं या investment के लिए? |
| 16.14 | 13.70–14.38 | Buyer | Investment के लिए। |
| 16.88 | 14.50–16.38 | AI | अच्छा, आपका budget roughly कितना है? |
| 18.82 | 16.54–17.32 | Buyer | 2 करोड़। |

Not used: the AI's closing line after "2 करोड़" (18.6–24.7s in the source).

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
