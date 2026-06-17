import { useLayoutEffect, useRef, useState } from 'react';
import type { AppState, FrameConfig } from '../types';
import type { Action } from '../state/appReducer';
import { SlotPreview } from '../components/SlotPreview';

type Props = {
  state: AppState;
  frame: FrameConfig;
  dispatch: React.Dispatch<Action>;
};

export function AdjustScreen({ state, frame, dispatch }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    function measure() {
      const el = containerRef.current;
      if (!el) return;
      const maxW = el.clientWidth;
      const maxH = el.clientHeight;
      const fit = Math.min(maxW / frame.output.width, maxH / frame.output.height);
      setScale(fit > 0 ? fit : 1);
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [frame]);

  return (
    <div className="screen adjust-screen">
      <header className="screen-header">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => dispatch({ type: 'goto', step: 'capture' })}
        >
          ← Back
        </button>
        <span className="screen-title">Adjust</span>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => dispatch({ type: 'goto', step: 'preview' })}
        >
          Done
        </button>
      </header>

      <p className="muted adjust-hint">
        Drag a photo to reposition. Pinch (or two-finger scroll) to zoom.
      </p>

      <div ref={containerRef} className="adjust-stage">
        <div
          className="adjust-frame"
          style={{
            width: frame.output.width * scale,
            height: frame.output.height * scale,
            ...(frame.background && 'color' in frame.background
              ? { backgroundColor: frame.background.color }
              : {}),
          }}
        >
          {frame.background && 'image' in frame.background && (
            <img
              src={frame.background.image}
              alt=""
              className="frame-background"
              style={{
                width: frame.output.width * scale,
                height: frame.output.height * scale,
              }}
            />
          )}
          {frame.slots.map((slot, i) => (
            <SlotPreview
              key={i}
              slot={slot}
              slotImage={state.slotImages[i]}
              scale={scale}
              interactive
              onTransformChange={(transform) =>
                dispatch({ type: 'updateSlotTransform', index: i, transform })
              }
            />
          ))}
          {frame.overlay && (
            <img
              src={frame.overlay}
              alt=""
              className="frame-overlay"
              style={{
                width: frame.output.width * scale,
                height: frame.output.height * scale,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
