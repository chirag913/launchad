import React from "react";
import { Audio, interpolate, Sequence, staticFile } from "remotion";
import { adConfig, f } from "../config/adConfig";
import { minutesUncalled } from "./CallInterface";
import { fieldTimes } from "./QualificationCard";
import { sceneStart } from "./SceneTransition";

const S = adConfig.sound;

/** Frames where the uncalled clock's digits change, thinned so the ticks
 *  never exceed ~one every 3 frames. */
function tickFrames(): number[] {
  const out: number[] = [];
  let last = -99;
  for (let fr = sceneStart("waiting"); fr < sceneStart("calling"); fr++) {
    if (minutesUncalled(fr) !== minutesUncalled(fr - 1) && fr - last >= 3) {
      out.push(fr);
      last = fr;
    }
  }
  return out;
}

/**
 * Voice first. The AI's real call audio is the only voice; the bed ducks
 * under it and every effect is a short, soft cue on a visual event.
 */
export const SoundTrack: React.FC = () => {
  const voiceFrom = f(adConfig.call.voiceAt);
  const speechA = voiceFrom + f(0.55);
  const speechB = voiceFrom + f(4.45);
  const total = f(adConfig.durationSec);

  return (
    <>
      <Audio
        src={staticFile("sfx/bed.wav")}
        volume={(fr) =>
          interpolate(
            fr,
            [0, speechA - 6, speechA, speechB, speechB + 12, total - 20, total],
            [S.bedVolume, S.bedVolume, S.bedDuck, S.bedDuck, S.bedVolume, S.bedVolume, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          )
        }
      />

      <Sequence from={voiceFrom} layout="none">
        <Audio src={staticFile(adConfig.call.voiceSrc)} volume={1} />
      </Sequence>

      {S.cues.map((c, i) => (
        <Sequence key={`cue-${i}`} from={f(c.at)} layout="none">
          <Audio src={staticFile(c.src)} volume={c.volume} />
        </Sequence>
      ))}

      {tickFrames().map((fr, i, arr) => (
        <Sequence key={`tick-${fr}`} from={fr} layout="none">
          <Audio src={staticFile("sfx/tick.wav")} volume={S.tickVolume * (0.6 + 0.4 * (i / Math.max(1, arr.length - 1)))} />
        </Sequence>
      ))}

      {adConfig.qualification.map((_, i) => (
        <Sequence key={`res-${i}`} from={fieldTimes(i).answer} layout="none">
          <Audio src={staticFile("sfx/resolve.wav")} volume={S.resolveVolume} />
        </Sequence>
      ))}
    </>
  );
};
