import type { FrameConfig } from '../types';
import stripOverlay from '../assets/frames/strip-classic.svg';
import stripThumb from '../assets/frames/strip-classic-thumb.svg';
import polaroidOverlay from '../assets/frames/polaroid.svg';
import polaroidThumb from '../assets/frames/polaroid-thumb.svg';
import collageOverlay from '../assets/frames/collage-3.svg';
import collageThumb from '../assets/frames/collage-3-thumb.svg';

export const frames: FrameConfig[] = [
  {
    id: 'strip-classic',
    name: 'Classic Strip',
    thumbnail: stripThumb,
    overlay: stripOverlay,
    output: { width: 600, height: 1800 },
    background: { color: '#ffffff' },
    revealAnimation: 'strip-print',
    slots: [
      { x: 40, y: 40, width: 520, height: 390 },
      { x: 40, y: 460, width: 520, height: 390 },
      { x: 40, y: 880, width: 520, height: 390 },
      { x: 40, y: 1300, width: 520, height: 390 },
    ],
  },
  {
    id: 'polaroid',
    name: 'Single Polaroid',
    thumbnail: polaroidThumb,
    overlay: polaroidOverlay,
    output: { width: 800, height: 960 },
    background: { color: '#f4f1ea' },
    revealAnimation: 'polaroid-develop',
    slots: [{ x: 60, y: 60, width: 680, height: 680 }],
  },
  {
    id: 'collage-3',
    name: 'Trio Collage',
    thumbnail: collageThumb,
    overlay: collageOverlay,
    output: { width: 1200, height: 800 },
    background: { color: '#1e1e26' },
    revealAnimation: 'fade-in',
    slots: [
      { x: 40, y: 40, width: 560, height: 720 },
      { x: 620, y: 40, width: 540, height: 350, rotation: -2 },
      { x: 620, y: 410, width: 540, height: 350, rotation: 1.5 },
    ],
  },
];
