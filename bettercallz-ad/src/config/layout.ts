/* Frame geometry. Meta Reels overlays the top ~220px (account row) and the
 * bottom ~380px (caption, CTA button), so every piece of copy lives between
 * TOP_SAFE and BOTTOM_SAFE, and nothing sits closer than GUTTER to an edge. */
export const GUTTER = 72;
export const CONTENT_W = 1080 - GUTTER * 2; // 936
export const TOP_SAFE = 180;
export const BOTTOM_SAFE = 1540;

export const LOGO_Y = 196;
export const HEADLINE_Y = 282;
export const HERO_Y = 572;
export const SUBTITLE_Y = 1432;

/** Lead card sizes: full enquiry card, then the compact row it collapses to. */
export const LEAD_FULL_H = 506;
export const LEAD_COMPACT_H = 136;

/** The action slot below the lead: an empty "waiting" slot, then the call. */
export const SLOT_GAP = 22;
export const SLOT_WAIT_Y = HERO_Y + LEAD_FULL_H + 40;
export const SLOT_WAIT_H = 290;
export const SLOT_CALL_Y = HERO_Y + LEAD_COMPACT_H + SLOT_GAP;
export const SLOT_CALL_H = 556;
export const SLOT_BAR_H = 108;

export const QUAL_Y = SLOT_CALL_Y + SLOT_BAR_H + SLOT_GAP;
