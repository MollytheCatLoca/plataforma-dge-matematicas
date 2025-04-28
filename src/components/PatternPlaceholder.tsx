// src/components/PatternPlaceholder.tsx
import React from 'react';

type PatternPlaceholderProps = {
  width?: number;
  height?: number;
};

export default function PatternPlaceholder({ width = 200, height = 200 }: PatternPlaceholderProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="placeholder"
      style={{ display: 'block' }}
    >
      <defs>
        <pattern id="crossPattern" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M0,0 L20,20 M20,0 L0,20" stroke="#ccc" strokeWidth={0.5} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="#eee" />
      <rect width="100%" height="100%" fill="url(#crossPattern)" />
    </svg>
  );
}