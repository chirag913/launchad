import React, { useEffect, useState } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { adConfig } from "../config/adConfig";
import { END_CARD_AT, headlineSchedule } from "../config/headlineSchedule";
import { CONTENT_W, GUTTER, HEADLINE_Y, LOGO_Y } from "../config/layout";
import { loadFonts } from "../fonts";
import { ramp } from "../motion";
import { AnimatedText } from "../components/AnimatedText";
import { Background } from "../components/Background";
import { CallInterface } from "../components/CallInterface";
import { FinalCTA } from "../components/FinalCTA";
import { LeadCard } from "../components/LeadCard";
import { CapturePanel } from "../components/CapturePanel";
import { SalesBrief } from "../components/SalesBrief";
import { SoundTrack } from "../components/SoundTrack";
import { Wordmark } from "../components/Wordmark";

/**
 * ENQUIRY ARRIVES → BETTERCALLZ CALLS (the real recording) → WHAT THE
 * BUYER SAYS IS CAPTURED → SALES BRIEF → TRY IT YOURSELF.
 *
 * One continuous stage rather than six slides: the lead card, the call and
 * the brief are the same objects changing state, so the animation itself
 * tells the story.
 */
export const BetterCallzAd: React.FC = () => {
  const frame = useCurrentFrame();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    loadFonts().then(() => setReady(true));
  }, []);

  const logoOut = ramp(frame, END_CARD_AT - 4, 8);

  return (
    <AbsoluteFill style={{ background: adConfig.colors.bg }}>
      <Background />
      {ready && (
        <>
          <Wordmark size={46} style={{ position: "absolute", left: GUTTER, top: LOGO_Y, opacity: 1 - logoOut }} />

          {/* Exactly one headline state is ever mounted — the schedule
              guarantees the previous one is gone before the next enters. */}
          {headlineSchedule
            .filter((h) => frame >= h.enterAt && (h.goneAt === undefined || frame < h.goneAt))
            .map((h) => (
              <div key={h.key} style={{ position: "absolute", left: GUTTER, top: HEADLINE_Y, width: CONTENT_W }}>
                <AnimatedText headline={h} width={CONTENT_W} />
              </div>
            ))}

          <LeadCard />
          <CallInterface />
          <CapturePanel />
          <SalesBrief />
          <FinalCTA />
        </>
      )}
      <SoundTrack />
    </AbsoluteFill>
  );
};
