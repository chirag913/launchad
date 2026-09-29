import { adConfig, f } from "../config/adConfig";

export type SceneKey = keyof typeof adConfig.scenes;
const order = Object.keys(adConfig.scenes) as SceneKey[];

/** Frame a scene starts on. */
export const sceneStart = (k: SceneKey) => f(adConfig.scenes[k]);

/** Frame a scene ends on (the next scene's start, or the end of the ad). */
export const sceneEnd = (k: SceneKey) => {
  const i = order.indexOf(k);
  return i < order.length - 1 ? sceneStart(order[i + 1]) : f(adConfig.durationSec);
};

export const sceneAt = (frame: number): SceneKey => {
  let cur: SceneKey = order[0];
  for (const k of order) if (frame >= sceneStart(k)) cur = k;
  return cur;
};

export const scenes = order;
