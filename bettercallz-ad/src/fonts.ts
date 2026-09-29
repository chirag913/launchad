import { continueRender, delayRender, staticFile } from "remotion";

/* Fonts are bundled from @fontsource into /public/fonts so a render never
 * depends on reaching a font CDN. The unicode ranges mirror fontsource's so
 * ₹ (latin-ext) and Devanagari resolve to the right file. */
const LATIN =
  "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD";
const LATIN_EXT =
  "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF";
const DEVANAGARI = "U+0900-097F,U+1CD0-1CF9,U+200C-200D,U+20A8,U+20B9,U+20F0,U+25CC,U+A830-A839,U+A8E0-A8FF,U+11B00-11B09";

type Face = { family: string; file: string; weight: number; range: string };

const faces: Face[] = [
  ...[400, 500, 600, 700, 800].flatMap((w) => [
    { family: "Inter Tight", file: `inter-tight-latin-${w}-normal.woff2`, weight: w, range: LATIN },
    { family: "Inter Tight", file: `inter-tight-latin-ext-${w}-normal.woff2`, weight: w, range: LATIN_EXT },
  ]),
  ...[400, 500].flatMap((w) => [
    { family: "Noto Sans Devanagari", file: `noto-sans-devanagari-devanagari-${w}-normal.woff2`, weight: w, range: DEVANAGARI },
    { family: "Noto Sans Devanagari", file: `noto-sans-devanagari-latin-${w}-normal.woff2`, weight: w, range: LATIN },
  ]),
];

let loading: Promise<void> | null = null;

export function loadFonts(): Promise<void> {
  if (loading) return loading;
  const handle = delayRender("fonts");
  loading = Promise.all(
    faces.map(async (fc) => {
      const face = new FontFace(fc.family, `url(${staticFile(`fonts/${fc.file}`)}) format('woff2')`, {
        weight: String(fc.weight),
        unicodeRange: fc.range,
      });
      await face.load();
      document.fonts.add(face);
    }),
  ).then(() => {
    continueRender(handle);
  });
  return loading;
}
