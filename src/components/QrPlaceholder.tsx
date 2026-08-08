import React from 'react';
import Svg, { Rect } from 'react-native-svg';
import { colors } from '../theme';

// Deterministic pseudo-QR pattern derived from a seed string — visual placeholder only, not a scannable code.
export default function QrPlaceholder({ seed, size = 120 }: { seed: string; size?: number }) {
  const grid = 9;
  const cell = size / grid;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) & 0xffffffff;

  const cells: boolean[] = [];
  let h = hash;
  for (let i = 0; i < grid * grid; i++) {
    h = (h * 1103515245 + 12345) & 0x7fffffff;
    cells.push(h % 3 !== 0);
  }

  return (
    <Svg width={size} height={size}>
      <Rect x={0} y={0} width={size} height={size} fill={colors.surface} />
      {cells.map((filled, i) => {
        if (!filled) return null;
        const x = (i % grid) * cell;
        const y = Math.floor(i / grid) * cell;
        return <Rect key={i} x={x} y={y} width={cell} height={cell} fill={colors.text} />;
      })}
    </Svg>
  );
}
