/* Frame geometry. Meta Reels overlays the top ~220px (account row) and the
 * bottom of the frame (caption, CTA button), so copy lives between TOP_SAFE
 * and BOTTOM_SAFE and nothing sits closer than GUTTER to an edge. */
export const GUTTER = 72;
export const CONTENT_W = 1080 - GUTTER * 2; // 936
export const TOP_SAFE = 180;
export const BOTTOM_SAFE = 1540;

export const LOGO_Y = 196;
export const HEADLINE_Y = 282;
export const HERO_Y = 600;

/** Lead card: the full enquiry, then the compact row it collapses into. */
export const LEAD_FULL_H = 404;
export const LEAD_COMPACT_H = 136;

export const STACK_GAP = 22;
/** The live call card, under the compact lead. */
export const CALL_Y = HERO_Y + LEAD_COMPACT_H + STACK_GAP;
export const CALL_H = 420;
/** What the call captures, under the call. */
export const CAPTURE_Y = CALL_Y + CALL_H + STACK_GAP;
