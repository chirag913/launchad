import { EASE, ramp } from "../motion";
import { STACK_RISE } from "../config/layout";
import { sceneStart } from "./SceneTransition";

/** Vertical offset (px, ≤ 0) of the lead/call/capture stack. It rises once
 *  the reveal headline is gone, so the conversation owns the frame. */
export function stackOffset(frame: number): number {
  return -STACK_RISE * ramp(frame, sceneStart("conversation"), 18, EASE.inOut);
}
