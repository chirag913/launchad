import React from "react";
import { Audio, interpolate, Sequence, staticFile } from "remotion";
import { adConfig, dialogue, f, FPS } from "../config/adConfig";
import { END_CARD_AT } from "../config/headlineSchedule";
import { captureTimes } from "./CapturePanel";

const S = adConfig.sound;

/**
 * The real call recording is the only voice. Each turn is an untouched span
 * of the recording, placed on the timeline by adConfig's dialogue — only
 * the silences between turns are shortened. The bed ducks under the whole
 * call; cues are short and soft.
 */
export const SoundTrack: React.FC = () => {
  const callFrom = f(dialogue[0].start);
  const callTo = f(dialogue[dialogue.length - 1].end);
  const total = f(adConfig.durationSec);

  return (
    <>
      <Audio
        src={staticFile("sfx/bed.wav")}
        volume={(fr) =>
          interpolate(
            fr,
            [0, callFrom - 8, callFrom, callTo, callTo + 15, total - 20, total],
            [S.bedVolume, S.bedVolume, S.bedDuck, S.bedDuck, S.bedVolume, S.bedVolume, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          )
        }
      />

      {dialogue.map((d) => (
        <Sequence key={`turn-${d.index}`} from={f(d.start)} durationInFrames={f(d.end) - f(d.start)} layout="none">
          <Audio
            src={staticFile(adConfig.call.src)}
            startFrom={Math.round(d.from * FPS)}
            volume={(fr) => {
              // 2-frame fades so no clip ever clicks at its edges
              const len = f(d.end) - f(d.start);
              return S.voiceVolume * Math.min(1, (fr + 1) / 2, (len - fr) / 2);
            }}
          />
        </Sequence>
      ))}

      {S.cues.map((c, i) => (
        <Sequence key={`cue-${i}`} from={f(c.at)} layout="none">
          <Audio src={staticFile(c.src)} volume={c.volume} />
        </Sequence>
      ))}

      {captureTimes.map((c) => (
        <Sequence key={`cap-${c.key}`} from={c.answer + 4} layout="none">
          <Audio src={staticFile("sfx/resolve.wav")} volume={S.resolveVolume} />
        </Sequence>
      ))}

      <Sequence from={END_CARD_AT + 5} layout="none">
        <Audio src={staticFile(S.ctaChime.src)} volume={S.ctaChime.volume} />
      </Sequence>
    </>
  );
};
