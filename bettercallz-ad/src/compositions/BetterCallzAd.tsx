import React, { useEffect, useState } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { adConfig, f } from "../config/adConfig";
import { CONTENT_W, GUTTER, HEADLINE_Y, LOGO_Y } from "../config/layout";
import { loadFonts } from "../fonts";
import { ramp } from "../motion";
import { AnimatedText } from "../components/AnimatedText";
import { Background } from "../components/Background";
import { CallInterface } from "../components/CallInterface";
import { FinalCTA } from "../components/FinalCTA";
import { LeadCard } from "../components/LeadCard";
import { QualificationCard } from "../components/QualificationCard";
import { SalesBrief } from "../components/SalesBrief";
import { sceneEnd, scenes, sceneStart } from "../components/SceneTransition";
import { SoundTrack } from "../components/SoundTrack";
import { Subtitles } from "../components/Subtitles";
import { Wordmark } from "../components/Wordmark";

/** Frames the outgoing headline starts leaving before its scene ends. */
const HEADLINE_OUT_LEAD = 8;

/**
 * LEAD ARRIVES → NOBODY CALLS → BETTERCALLZ CALLS → AI QUALIFIES →
 * SALES TEAM GETS CONTEXT → TRY IT YOURSELF.
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

  const closeAt = sceneStart("close");
  const logoOut = ramp(frame, closeAt + f(adConfig.cta.at) - 6, 10);

  return (
    <AbsoluteFill style={{ background: adConfig.colors.bg }}>
      <Background />
      {ready && (
        <>
          <Wordmark size={46} style={{ position: "absolute", left: GUTTER, top: LOGO_Y, opacity: 1 - logoOut }} />

          {scenes.map((k, i) => {
            const start = sceneStart(k);
            const end = sceneEnd(k);
            const isFirst = i === 0;
            const isLast = i === scenes.length - 1;
            if (frame < start - 4 || frame > end + 2) return null;
            return (
              <div key={k} style={{ position: "absolute", left: GUTTER, top: HEADLINE_Y }}>
                <AnimatedText
                  lines={adConfig.headlines[k]}
                  // the hook is already set on frame 0 — the thumbnail must read
                  inAt={isFirst ? -30 : start}
                  outAt={isLast ? undefined : end - HEADLINE_OUT_LEAD}
                  width={CONTENT_W}
                />
              </div>
            );
          })}

          <LeadCard />
          <CallInterface />
          <QualificationCard />
          <SalesBrief />
          <Subtitles />
          <FinalCTA />
        </>
      )}
      <SoundTrack />
    </AbsoluteFill>
  );
};
