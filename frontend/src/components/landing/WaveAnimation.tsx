'use client';

import React, { CSSProperties, useMemo } from 'react';

type BoxStyle = CSSProperties & {
  '--drift-x'?: string;
  '--drift-y'?: string;
  '--duration'?: string;
  '--delay'?: string;
  '--box-opacity'?: string;
  '--box-blur'?: string;
};

type FloatingBox = {
  id: string;
  className: string;
  style: BoxStyle;
};

const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);
const BOX_COUNT = 26;

const createDistributedPosition = (index: number, total: number) => {
  const columns = Math.ceil(Math.sqrt(total));
  const rows = Math.ceil(total / columns);
  const column = index % columns;
  const row = Math.floor(index / columns);
  const cellWidth = 100 / columns;
  const cellHeight = 100 / rows;

  return {
    top: row * cellHeight + randomBetween(10, 90) * (cellHeight / 100),
    left: column * cellWidth + randomBetween(10, 90) * (cellWidth / 100),
  };
};

const createBox = (index: number): FloatingBox => {
  const usePurple = index % 2 === 0;
  const delay = randomBetween(-6, 0);
  const duration = randomBetween(6, 8.5);
  const blur = index < 4 ? 0 : randomBetween(0.4, 1);
  const opacity = randomBetween(0.32, 0.4);
  const { top, left } = createDistributedPosition(index, BOX_COUNT);

  return {
    id: `box-${index}`,
    className: usePurple ? 'floating-box floating-box-purple' : 'floating-box floating-box-blue',
    style: {
      top: `${top}%`,
      left: `${left}%`,
      '--drift-x': `${randomBetween(-64, 64)}px`,
      '--drift-y': `${randomBetween(-72, 72)}px`,
      '--duration': `${duration}s`,
      '--delay': `${delay}s`,
      '--box-opacity': `${opacity}`,
      '--box-blur': `${blur}px`,
    },
  };
};

export const WaveAnimation: React.FC = () => {
  const boxes = useMemo(() => Array.from({ length: BOX_COUNT }, (_, index) => createBox(index)), []);

  return (
    <div className="floating-scene" aria-hidden="true">
      {boxes.map((box) => (
        <span key={box.id} className={box.className} style={box.style} />
      ))}
    </div>
  );
};
