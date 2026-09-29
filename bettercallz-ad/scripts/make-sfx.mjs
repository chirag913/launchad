// Synthesises the ad's sound palette into public/sfx/*.wav.
//
//   node scripts/make-sfx.mjs
//
// Pure JS, no dependencies, deterministic output. Every sound is designed to
// sit *under* the voice: short, soft attack-free transients and a low bed.
// Swap any file for a licensed library sound with the same name and every
// cue in src/config/adConfig.ts still lines up.
import fs from "node:fs";
import path from "node:path";

const SR = 48000;
const OUT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../public/sfx");
fs.mkdirSync(OUT, { recursive: true });

// Seeded noise so a regenerated file is byte-identical.
let seed = 1337;
const rand = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};

function writeWav(name, samples, channels = 1) {
  const n = samples.length;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + n * 2, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(channels, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 2 * channels, 28);
  buf.writeUInt16LE(2 * channels, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const v = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(v * 32767), 44 + i * 2);
  }
  fs.writeFileSync(path.join(OUT, `${name}.wav`), buf);
  console.log(`  ${name}.wav  ${(n / SR / channels).toFixed(2)}s`);
}

const make = (dur, fn) => {
  const n = Math.round(dur * SR);
  const a = new Float32Array(n);
  for (let i = 0; i < n; i++) a[i] = fn(i / SR, i);
  return a;
};

// Short raised-cosine fade in/out so nothing clicks at its edges.
const edges = (a, inS = 0.004, outS = 0.02) => {
  const ni = Math.round(inS * SR);
  const no = Math.round(outS * SR);
  for (let i = 0; i < ni && i < a.length; i++) a[i] *= 0.5 - 0.5 * Math.cos((Math.PI * i) / ni);
  for (let i = 0; i < no && i < a.length; i++) a[a.length - 1 - i] *= 0.5 - 0.5 * Math.cos((Math.PI * i) / no);
  return a;
};

const onePole = (a, cutoff) => {
  const k = 1 - Math.exp((-2 * Math.PI * cutoff) / SR);
  let y = 0;
  for (let i = 0; i < a.length; i++) a[i] = y += k * (a[i] - y);
  return a;
};

const bell = (t, f, decay) =>
  Math.exp(-t * decay) * (Math.sin(2 * Math.PI * f * t) + 0.18 * Math.sin(2 * Math.PI * f * 2.01 * t) * Math.exp(-t * decay * 2));

const normalize = (a, peak) => {
  let m = 0;
  for (const v of a) m = Math.max(m, Math.abs(v));
  for (let i = 0; i < a.length; i++) a[i] *= peak / (m || 1);
  return a;
};

console.log("sfx →", OUT);

// Lead notification — two soft glass notes, a fifth apart, the second a hair late.
writeWav(
  "notify",
  normalize(
    edges(make(0.9, (t) => bell(t, 1174.66, 7) + (t > 0.085 ? 0.8 * bell(t - 0.085, 1760, 6.5) : 0))),
    0.7,
  ),
);

// Timer tick — a dry, tiny mechanical click. Waiting, not alarming.
writeWav(
  "tick",
  normalize(edges(make(0.05, (t) => (0.6 * Math.sin(2 * Math.PI * 2600 * t) + 0.4 * (rand() * 2 - 1)) * Math.exp(-t * 180)), 0.001, 0.01), 0.5),
);

// Outbound call — one short Indian-style ringback burst (400 Hz x 25 Hz), band-limited like a phone line.
writeWav(
  "ring",
  normalize(
    onePole(
      edges(
        make(0.42, (t) => {
          const gate = t < 0.36 ? 1 : 0;
          return gate * Math.sin(2 * Math.PI * 400 * t) * (0.55 + 0.45 * Math.sin(2 * Math.PI * 25 * t));
        }),
        0.01,
        0.05,
      ),
      2600,
    ),
    0.45,
  ),
);

// Call connected — a quiet two-step up.
writeWav(
  "connect",
  normalize(
    edges(make(0.32, (t) => (t < 0.09 ? bell(t, 880, 30) : bell(t - 0.09, 1318.5, 16)))),
    0.5,
  ),
);

// Field resolved — a soft muted pluck. Pitched per field by the composition.
writeWav("resolve", normalize(edges(make(0.35, (t) => bell(t, 1567.98, 18) * 0.9 + bell(t, 783.99, 22) * 0.4)), 0.55));

// Handoff confirmed — a warm major triad, rolled.
writeWav(
  "confirm",
  normalize(
    edges(
      make(1.2, (t) =>
        [523.25, 659.25, 783.99, 1046.5].reduce(
          (s, f, i) => s + (t > i * 0.045 ? bell(t - i * 0.045, f, 4.5) * (i === 3 ? 0.5 : 1) : 0),
          0,
        ),
      ),
    ),
    0.6,
  ),
);

// Scene change — a short, low air-move. Deliberately NOT a corporate whoosh.
{
  const d = 0.55;
  const a = make(d, (t) => {
    const env = Math.sin(Math.PI * Math.min(1, t / d)) ** 2;
    return (rand() * 2 - 1) * env;
  });
  onePole(a, 900);
  onePole(a, 1400);
  writeWav("air", normalize(edges(a), 0.35));
}

// Music bed — a slow, low A-minor-add9 pad with a gentle pulse that lifts
// at the product reveal. Sits roughly 20 dB under the voice.
{
  const d = 15.2;
  const notes = [55, 82.41, 110, 130.81, 164.81, 246.94];
  const a = make(d, (t) => {
    let s = 0;
    notes.forEach((f, i) => {
      const detune = 1 + (i % 2 ? 0.0012 : -0.0009);
      s += (Math.sin(2 * Math.PI * f * t) + 0.5 * Math.sin(2 * Math.PI * f * detune * t)) / (1 + i * 0.35);
    });
    // Pulse at 100 BPM, soft; stronger once BetterCallz takes over (4.5s).
    const beat = (t * 100) / 60;
    const ph = beat - Math.floor(beat);
    const pulseDepth = t < 4.5 ? 0.18 : 0.32;
    const pulse = 1 - pulseDepth + pulseDepth * Math.exp(-ph * 5);
    const swell = Math.min(1, t / 0.6) * Math.min(1, (d - t) / 1.2);
    return s * pulse * swell;
  });
  onePole(a, 700);
  writeWav("bed", normalize(a, 0.5));
}
