import type { FrameConfig } from '../types';
import stripOverlay from '../assets/frames/strip-classic.svg';
import stripThumb from '../assets/frames/strip-classic-thumb.svg';
import polaroidOverlay from '../assets/frames/polaroid.svg';
import polaroidThumb from '../assets/frames/polaroid-thumb.svg';
import collageOverlay from '../assets/frames/collage-3.svg';
import collageThumb from '../assets/frames/collage-3-thumb.svg';
import snoopyTiles from '../assets/frames/snoopy-tiles.png';
import snoopyTilesShadow from '../assets/frames/snoopy-tiles-shadow.png';
import snoopyStars from '../assets/frames/snoopy-stars.png';
import snoopySpace from '../assets/frames/snoopy-space.png';

export const frames: FrameConfig[] = [
  {
    id: 'snoopy-tiles',
    name: 'Snoopy Diner',
    thumbnail: snoopyTiles,
    output: { width: 707, height: 2000 },
    background: { image: snoopyTiles },
    revealAnimation: 'strip-print',
    slots: [
      { x: 33, y: 148, width: 641, height: 470 },
      { x: 33, y: 680, width: 641, height: 470 },
      { x: 33, y: 1212, width: 641, height: 470 },
    ],
  },
  {
    id: 'snoopy-tiles-shadow',
    name: 'Snoopy Café',
    thumbnail: snoopyTilesShadow,
    output: { width: 707, height: 2000 },
    background: { image: snoopyTilesShadow },
    revealAnimation: 'strip-print',
    slots: [
      { x: 33, y: 148, width: 641, height: 470 },
      { x: 33, y: 680, width: 641, height: 470 },
      { x: 33, y: 1212, width: 641, height: 470 },
    ],
  },
  {
    id: 'snoopy-stars',
    name: 'Snoopy Stars',
    thumbnail: snoopyStars,
    output: { width: 707, height: 2000 },
    background: { image: snoopyStars },
    revealAnimation: 'strip-print',
    slots: [
      { x: 33, y: 145, width: 641, height: 472 },
      { x: 33, y: 686, width: 641, height: 472 },
      { x: 33, y: 1227, width: 641, height: 472 },
    ],
  },
  {
    id: 'snoopy-space',
    name: 'Snoopy Space',
    thumbnail: snoopySpace,
    output: { width: 707, height: 2000 },
    background: { image: snoopySpace },
    revealAnimation: 'strip-print',
    slots: [
      { x: 35, y: 147, width: 637, height: 468 },
      { x: 35, y: 688, width: 637, height: 468 },
      { x: 35, y: 1229, width: 637, height: 468 },
    ],
  },
  {
    id: 'strip-classic',
    name: 'Classic Strip',
    thumbnail: stripThumb,
    overlay: stripOverlay,
    output: { width: 600, height: 1800 },
    background: { color: '#ffffff' },
    revealAnimation: 'strip-print',
    slots: [
      { x: 40, y: 44, width: 513, height: 390 },
      { x: 40, y: 463, width: 515, height: 387 },
      { x: 40, y: 879, width: 515, height: 388 },
      { x: 40, y: 1296, width: 515, height: 390 },
    ],
  },
  {
    id: 'polaroid',
    name: 'Polaroid',
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
    // Slots clear the top title band (y < 92) and bottom credit (y > 760).
    slots: [
      { x: 40, y: 100, width: 560, height: 660 },
      { x: 620, y: 100, width: 540, height: 310, rotation: -2 },
      { x: 620, y: 440, width: 540, height: 320, rotation: 1.5 },
    ],
  },
];
