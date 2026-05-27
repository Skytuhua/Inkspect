// Small inline SVG icons (stroke-based, inherit currentColor). No icon-font dep.
import React from 'react';

type P = { size?: number };
const base = (size = 18): React.SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export const IconLogo = ({ size = 22 }: P) => (
  <svg {...base(size)}>
    <path d="M3 17.5C3 17.5 7 7 12 7s9 10.5 9 10.5" />
    <circle cx="12" cy="13" r="2.4" fill="currentColor" stroke="none" />
    <path d="M12 3v2M5 5l1.4 1.4M19 5l-1.4 1.4" />
  </svg>
);
export const IconFile = ({ size }: P) => (
  <svg {...base(size)}><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M5 3h9l5 5v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" /></svg>
);
export const IconSparkle = ({ size }: P) => (
  <svg {...base(size)}><path d="M12 3l1.8 4.7L18.5 9l-4.7 1.8L12 15l-1.8-4.2L5.5 9l4.7-1.3z" /><path d="M19 14l.8 2 .2.8-2-.8-2 .8.8-2-.8-2 2 .8 2-.8z" /></svg>
);
export const IconTrash = ({ size }: P) => (
  <svg {...base(size)}><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" /></svg>
);
export const IconCopy = ({ size }: P) => (
  <svg {...base(size)}><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h8" /></svg>
);
export const IconDownload = ({ size }: P) => (
  <svg {...base(size)}><path d="M12 4v11m0 0l4-4m-4 4l-4-4M4 19h16" /></svg>
);
export const IconChevron = ({ size }: P) => (
  <svg {...base(size)}><path d="M9 6l6 6-6 6" /></svg>
);
export const IconUp = ({ size }: P) => (
  <svg {...base(size)}><path d="M6 15l6-6 6 6" /></svg>
);
export const IconDown = ({ size }: P) => (
  <svg {...base(size)}><path d="M6 9l6 6 6-6" /></svg>
);
export const IconSun = ({ size }: P) => (
  <svg {...base(size)}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" /></svg>
);
export const IconMoon = ({ size }: P) => (
  <svg {...base(size)}><path d="M21 12.5A8.5 8.5 0 1 1 11.5 3a6.5 6.5 0 0 0 9.5 9.5z" /></svg>
);
export const IconShield = ({ size = 14 }: P) => (
  <svg {...base(size)}><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" /><path d="M9 12l2 2 4-4" /></svg>
);
