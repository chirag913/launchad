import React from "react";
import { adConfig } from "../config/adConfig";

const C = adConfig.colors;

/** Small tracked uppercase label — the product's field-label style. */
export const Label: React.FC<{ children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties }> = ({
  children,
  color = C.textMute,
  size = 24,
  style,
}) => (
  <div
    style={{
      fontFamily: adConfig.type.ui,
      fontWeight: 600,
      fontSize: size,
      letterSpacing: "0.16em",
      textTransform: "uppercase",
      color,
      lineHeight: 1,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Dot: React.FC<{ color: string; size?: number; glow?: number }> = ({ color, size = 12, glow = 0 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size,
      background: color,
      boxShadow: glow ? `0 0 ${glow}px ${color}` : undefined,
      flexShrink: 0,
    }}
  />
);

export const Avatar: React.FC<{ initials: string; size: number }> = ({ initials, size }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size,
      background: "linear-gradient(145deg, #1D2B27 0%, #121917 100%)",
      border: `1px solid ${C.borderHi}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: adConfig.type.ui,
      fontWeight: 600,
      fontSize: size * 0.34,
      letterSpacing: "0.02em",
      color: C.text,
      flexShrink: 0,
    }}
  >
    {initials}
  </div>
);

export const Chip: React.FC<{ children: React.ReactNode; size?: number; style?: React.CSSProperties }> = ({
  children,
  size = 34,
  style,
}) => (
  <div
    style={{
      fontFamily: adConfig.type.ui,
      fontWeight: 500,
      fontSize: size,
      color: C.text,
      padding: `${size * 0.36}px ${size * 0.66}px`,
      borderRadius: 999,
      border: `1px solid ${C.borderHi}`,
      background: "rgba(255,255,255,0.03)",
      lineHeight: 1,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </div>
);

/** Card surface: thin border, faint top highlight, soft long shadow. */
export const cardStyle = (extra: React.CSSProperties = {}): React.CSSProperties => ({
  position: "absolute",
  borderRadius: 32,
  background: `linear-gradient(180deg, ${C.surfaceHi} 0%, ${C.surface} 100%)`,
  border: `1px solid ${C.border}`,
  boxShadow: "0 1px 0 rgba(255,255,255,0.05) inset, 0 30px 80px rgba(0,0,0,0.45)",
  overflow: "hidden",
  ...extra,
});
