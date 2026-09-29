import React from "react";
import { adConfig } from "../config/adConfig";

/** The lowercase wordmark with its teal full stop. */
export const Wordmark: React.FC<{ size: number; style?: React.CSSProperties }> = ({ size, style }) => (
  <div
    style={{
      fontFamily: adConfig.type.display,
      fontWeight: 700,
      fontSize: size,
      letterSpacing: "-0.055em",
      color: adConfig.colors.text,
      lineHeight: 1,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {adConfig.brand.wordmark}
    <span style={{ color: adConfig.colors.accentBright }}>.</span>
  </div>
);
