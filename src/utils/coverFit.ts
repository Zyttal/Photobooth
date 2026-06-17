import type { SlotTransform } from '../types';

export type CoverRect = {
  sx: number;
  sy: number;
  sWidth: number;
  sHeight: number;
};

export const identityTransform: SlotTransform = {
  offsetX: 0,
  offsetY: 0,
  scale: 1,
};

/**
 * Compute the source rectangle on `srcW x srcH` that, when drawn into
 * `dstW x dstH`, produces a center-crop "cover" fit. Then apply the user's
 * transform on top: positive offsets pan the *image* (so the visible window
 * moves the opposite way), and scale zooms around the center.
 */
export function computeCoverSource(
  srcW: number,
  srcH: number,
  dstW: number,
  dstH: number,
  transform: SlotTransform = identityTransform,
): CoverRect {
  const srcAspect = srcW / srcH;
  const dstAspect = dstW / dstH;

  let baseW: number;
  let baseH: number;
  if (srcAspect > dstAspect) {
    baseH = srcH;
    baseW = srcH * dstAspect;
  } else {
    baseW = srcW;
    baseH = srcW / dstAspect;
  }

  const scale = Math.max(0.1, transform.scale);
  const sWidth = baseW / scale;
  const sHeight = baseH / scale;

  const cx = srcW / 2 - transform.offsetX * (sWidth / dstW);
  const cy = srcH / 2 - transform.offsetY * (sHeight / dstH);

  const sx = clamp(cx - sWidth / 2, 0, Math.max(0, srcW - sWidth));
  const sy = clamp(cy - sHeight / 2, 0, Math.max(0, srcH - sHeight));

  return { sx, sy, sWidth, sHeight };
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}
