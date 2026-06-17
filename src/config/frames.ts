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

/**
 * Three-photo Snoopy strip slot layouts (in the 707×2000 frame's pixel space).
 *
 * The frame artwork IS the background — slot rects line up with the
 * "sky+grass" windows in each PNG. User photos draw on top of those.
 *
 * Slot dimensions detected from the source PNGs; tweak here to fine-tune.
 */
const SNOOPY_SLOTS_STANDARD = [
  { x: 34, y: 148, width: 640, height: 470 },
  { x: 34, y: 680, width: 640, height: 470 },
  { x: 34, y: 1212, width: 640, height: 470 },
];

const SNOOPY_SLOTS_STARS = [
  { x: 34, y: 145, width: 640, height: 472 },
  { x: 34, y: 686, width: 640, height: 472 },
  { x: 34, y: 1227, width: 640, height: 472 },
];

const SNOOPY_SLOTS_SPACE = [
  { x: 35, y: 147, width: 637, height: 468 },
  { x: 35, y: 688, width: 637, height: 468 },
  { x: 35, y: 1229, width: 637, height: 468 },
];

export const frames: FrameConfig[] = [
  {
    id: 'snoopy-tiles',
    name: 'Snoopy Diner',
    thumbnail: snoopyTiles,
    output: { width: 707, height: 2000 },
    background: { image: snoopyTiles },
    revealAnimation: 'strip-print',
    slots: SNOOPY_SLOTS_STANDARD,
  },
  {
    id: 'snoopy-tiles-shadow',
    name: 'Snoopy Café',
    thumbnail: snoopyTilesShadow,
    output: { width: 707, height: 2000 },
    background: { image: snoopyTilesShadow },
    revealAnimation: 'strip-print',
    slots: SNOOPY_SLOTS_STANDARD,
  },
  {
    id: 'snoopy-stars',
    name: 'Snoopy Stars',
    thumbnail: snoopyStars,
    output: { width: 707, height: 2000 },
    background: { image: snoopyStars },
    revealAnimation: 'strip-print',
    slots: SNOOPY_SLOTS_STARS,
  },
  {
    id: 'snoopy-space',
    name: 'Snoopy Space',
    thumbnail: snoopySpace,
    output: { width: 707, height: 2000 },
    background: { image: snoopySpace },
    revealAnimation: 'strip-print',
    slots: SNOOPY_SLOTS_SPACE,
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
      { x: 40, y: 40, width: 520, height: 390 },
      { x: 40, y: 460, width: 520, height: 390 },
      { x: 40, y: 880, width: 520, height: 390 },
      { x: 40, y: 1300, width: 520, height: 390 },
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
    slots: [
      { x: 40, y: 40, width: 560, height: 720 },
      { x: 620, y: 40, width: 540, height: 350, rotation: -2 },
      { x: 620, y: 410, width: 540, height: 350, rotation: 1.5 },
    ],
  },
];
