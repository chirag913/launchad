import React from "react";

type P = { size?: number; color?: string; stroke?: number; style?: React.CSSProperties };

const svg = (size: number, children: React.ReactNode, style?: React.CSSProperties) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: "block", flexShrink: 0, ...style }}>
    {children}
  </svg>
);

export const ArrowRight: React.FC<P> = ({ size = 24, color = "currentColor", stroke = 2.2, style }) =>
  svg(size, <path d="M4 12h15m-6-6.5L19.5 12 13 18.5" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />, style);

export const ArrowDown: React.FC<P> = ({ size = 24, color = "currentColor", stroke = 2, style }) =>
  svg(size, <path d="M12 4v15m-6.5-6L12 19.5 18.5 13" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />, style);

export const Check: React.FC<P> = ({ size = 24, color = "currentColor", stroke = 2.4, style }) =>
  svg(size, <path d="M5 12.5l4.5 4.5L19 7.5" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />, style);

export const Phone: React.FC<P> = ({ size = 24, color = "currentColor", stroke = 2, style }) =>
  svg(
    size,
    <path
      d="M6.6 3.5h2.6l1.5 4-2 1.4a11 11 0 005.4 5.4l1.4-2 4 1.5v2.6a2 2 0 01-2.1 2A15.5 15.5 0 014.6 5.6a2 2 0 012-2.1z"
      stroke={color}
      strokeWidth={stroke}
      strokeLinejoin="round"
    />,
    style,
  );

export const Inbox: React.FC<P> = ({ size = 24, color = "currentColor", stroke = 2, style }) =>
  svg(
    size,
    <>
      <path d="M12 3.5v9m-3.5-3.5L12 12.5 15.5 9" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.5 13.5l2-6h2.5m8 0h2.5l2 6v5a1.5 1.5 0 01-1.5 1.5h-14a1.5 1.5 0 01-1.5-1.5v-5zm0 0h5l1 2h5l1-2h5" stroke={color} strokeWidth={stroke} strokeLinejoin="round" />
    </>,
    style,
  );

export const Calendar: React.FC<P> = ({ size = 24, color = "currentColor", stroke = 2, style }) =>
  svg(
    size,
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" stroke={color} strokeWidth={stroke} />
      <path d="M3.5 10h17M8 3v4m8-4v4" stroke={color} strokeWidth={stroke} strokeLinecap="round" />
    </>,
    style,
  );

export const Users: React.FC<P> = ({ size = 24, color = "currentColor", stroke = 2, style }) =>
  svg(
    size,
    <>
      <circle cx="9" cy="8.5" r="3.5" stroke={color} strokeWidth={stroke} />
      <path d="M2.5 20c.6-3.4 3.2-5.5 6.5-5.5s5.9 2.1 6.5 5.5" stroke={color} strokeWidth={stroke} strokeLinecap="round" />
      <path d="M15.5 5.2a3.5 3.5 0 010 6.6M18 14.8c1.9.8 3.1 2.6 3.5 5.2" stroke={color} strokeWidth={stroke} strokeLinecap="round" />
    </>,
    style,
  );

export const Clock: React.FC<P> = ({ size = 24, color = "currentColor", stroke = 2, style }) =>
  svg(
    size,
    <>
      <circle cx="12" cy="12" r="8.5" stroke={color} strokeWidth={stroke} />
      <path d="M12 7.5V12l3 2" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
    </>,
    style,
  );
