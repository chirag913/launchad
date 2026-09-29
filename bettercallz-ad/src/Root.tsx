import React from "react";
import { Composition } from "remotion";
import { BetterCallzAd } from "./compositions/BetterCallzAd";
import { adConfig, FPS, HEIGHT, WIDTH } from "./config/adConfig";

export const RemotionRoot: React.FC = () => (
  <Composition
    id={adConfig.id}
    component={BetterCallzAd}
    durationInFrames={Math.round(adConfig.durationSec * FPS)}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);
