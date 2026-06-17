import { useCallback, useEffect, useRef } from 'react';
import type { SlotTransform } from '../types';
import { identityTransform } from '../utils/coverFit';

type PointerInfo = { x: number; y: number };
type GestureState = {
  pointers: Map<number, PointerInfo>;
  start: SlotTransform;
  startCenter: PointerInfo;
  startDistance: number;
};

// Image must always cover its slot. MIN_SCALE = 1 means cover-fit (no
// shrinking below the slot). SlotPreview additionally clamps pan offsets
// so the image edges can't drift inside the slot boundary even when scaled.
const MIN_SCALE = 1;
const MAX_SCALE = 4;

export function useSlotTransform(
  transform: SlotTransform,
  onChange: (next: SlotTransform) => void,
): {
  bind: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerMove: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
    onPointerCancel: (e: React.PointerEvent) => void;
    onWheel: (e: React.WheelEvent) => void;
  };
  reset: () => void;
} {
  const transformRef = useRef(transform);
  useEffect(() => {
    transformRef.current = transform;
  }, [transform]);

  const gestureRef = useRef<GestureState | null>(null);

  const beginGesture = useCallback(() => {
    const pointers = gestureRef.current?.pointers ?? new Map();
    const points = [...pointers.values()];
    const center = averagePoint(points);
    const distance = points.length === 2 ? pointDistance(points[0], points[1]) : 0;
    gestureRef.current = {
      pointers,
      start: transformRef.current,
      startCenter: center,
      startDistance: distance,
    };
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
      if (!gestureRef.current) {
        gestureRef.current = {
          pointers: new Map(),
          start: transformRef.current,
          startCenter: { x: e.clientX, y: e.clientY },
          startDistance: 0,
        };
      }
      gestureRef.current.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      beginGesture();
    },
    [beginGesture],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const g = gestureRef.current;
      if (!g || !g.pointers.has(e.pointerId)) return;
      g.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      const points = [...g.pointers.values()];
      const center = averagePoint(points);
      const dx = center.x - g.startCenter.x;
      const dy = center.y - g.startCenter.y;

      let scale = g.start.scale;
      if (points.length === 2 && g.startDistance > 0) {
        const dist = pointDistance(points[0], points[1]);
        scale = clamp((dist / g.startDistance) * g.start.scale, MIN_SCALE, MAX_SCALE);
      }

      onChange({
        offsetX: g.start.offsetX + dx,
        offsetY: g.start.offsetY + dy,
        scale,
      });
    },
    [onChange],
  );

  const endPointer = useCallback((e: React.PointerEvent) => {
    const g = gestureRef.current;
    if (!g) return;
    g.pointers.delete(e.pointerId);
    if (g.pointers.size === 0) {
      gestureRef.current = null;
    } else {
      beginGesture();
    }
  }, [beginGesture]);

  const reset = useCallback(() => onChange(identityTransform), [onChange]);

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      // Desktop trackpad scroll / mouse wheel → zoom around the slot's center.
      const dy = e.deltaY;
      if (dy === 0) return;
      const factor = dy < 0 ? 1.1 : 1 / 1.1;
      const current = transformRef.current;
      onChange({
        ...current,
        scale: clamp(current.scale * factor, MIN_SCALE, MAX_SCALE),
      });
    },
    [onChange],
  );

  return {
    bind: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endPointer,
      onPointerCancel: endPointer,
      onWheel,
    },
    reset,
  };
}

function averagePoint(points: PointerInfo[]): PointerInfo {
  if (points.length === 0) return { x: 0, y: 0 };
  const sum = points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
  return { x: sum.x / points.length, y: sum.y / points.length };
}

function pointDistance(a: PointerInfo, b: PointerInfo): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}
