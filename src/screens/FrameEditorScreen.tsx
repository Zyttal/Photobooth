import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { Action } from '../state/appReducer';
import type { FrameConfig, SlotConfig } from '../types';
import { frames } from '../config/frames';

type Props = {
  dispatch: React.Dispatch<Action>;
};

type Handle = 'move' | 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w';

type DragState = {
  pointerId: number;
  handle: Handle;
  startScreen: { x: number; y: number };
  startSlot: SlotConfig;
  scale: number;
};

const HANDLES_CORNER: Handle[] = ['nw', 'ne', 'sw', 'se'];
const HANDLES_EDGE: Handle[] = ['n', 's', 'e', 'w'];

export function FrameEditorScreen({ dispatch }: Props) {
  const [selectedFrameId, setSelectedFrameId] = useState<string | null>(null);

  const frame = useMemo(
    () => frames.find((f) => f.id === selectedFrameId) ?? null,
    [selectedFrameId],
  );

  if (!frame) {
    return (
      <div className="screen editor-screen">
        <header className="screen-header">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => dispatch({ type: 'goto', step: 'home' })}
          >
            ← Home
          </button>
          <span className="screen-title">Calibrate</span>
          <span />
        </header>
        <p className="muted editor-hint">
          Pick a frame to drag and resize its photo slots. Copy the output and
          paste it into <code>src/config/frames.ts</code>.
        </p>
        <ul className="editor-frame-list">
          {frames.map((f) => (
            <li key={f.id}>
              <button
                type="button"
                className="btn editor-frame-pick"
                onClick={() => setSelectedFrameId(f.id)}
              >
                <span className="editor-frame-pick-name">{f.name}</span>
                <span className="editor-frame-pick-meta">
                  {f.slots.length} {f.slots.length === 1 ? 'slot' : 'slots'} ·{' '}
                  {f.output.width}×{f.output.height}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <EditorForFrame
      frame={frame}
      onClose={() => setSelectedFrameId(null)}
      onHome={() => dispatch({ type: 'goto', step: 'home' })}
    />
  );
}

function EditorForFrame({
  frame,
  onClose,
  onHome,
}: {
  frame: FrameConfig;
  onClose: () => void;
  onHome: () => void;
}) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  const [tracked, setTracked] = useState<{ frameId: string; slots: SlotConfig[] }>(
    () => ({ frameId: frame.id, slots: frame.slots }),
  );
  const [selected, setSelected] = useState(0);
  const [copied, setCopied] = useState(false);
  const dragRef = useRef<DragState | null>(null);

  // Reset local slot state whenever the editor opens a different frame.
  if (frame.id !== tracked.frameId) {
    setTracked({ frameId: frame.id, slots: frame.slots });
    setSelected(0);
  }
  const slots = tracked.slots;
  const setSlots = useCallback(
    (next: SlotConfig[] | ((prev: SlotConfig[]) => SlotConfig[])) => {
      setTracked((prev) => ({
        ...prev,
        slots: typeof next === 'function' ? next(prev.slots) : next,
      }));
    },
    [],
  );

  useLayoutEffect(() => {
    function measure() {
      const el = stageRef.current;
      if (!el) return;
      const fit = Math.min(
        el.clientWidth / frame.output.width,
        el.clientHeight / frame.output.height,
      );
      setScale(fit > 0 ? fit : 1);
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [frame]);

  const updateSlot = useCallback(
    (index: number, patch: Partial<SlotConfig>) => {
      setSlots((prev) => {
        const next = prev.slice();
        next[index] = { ...next[index], ...patch };
        return next;
      });
    },
    [setSlots],
  );

  const startDrag = useCallback(
    (index: number, handle: Handle) => (e: React.PointerEvent<HTMLElement>) => {
      e.stopPropagation();
      (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
      setSelected(index);
      dragRef.current = {
        pointerId: e.pointerId,
        handle,
        startScreen: { x: e.clientX, y: e.clientY },
        startSlot: slots[index],
        scale,
      };
    },
    [slots, scale],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      const d = dragRef.current;
      if (!d || d.pointerId !== e.pointerId) return;
      const dx = (e.clientX - d.startScreen.x) / d.scale;
      const dy = (e.clientY - d.startScreen.y) / d.scale;
      const s = d.startSlot;
      const minSize = 20;

      let { x, y, width, height } = s;
      switch (d.handle) {
        case 'move':
          x = s.x + dx;
          y = s.y + dy;
          break;
        case 'nw':
          x = s.x + dx;
          y = s.y + dy;
          width = s.width - dx;
          height = s.height - dy;
          break;
        case 'ne':
          y = s.y + dy;
          width = s.width + dx;
          height = s.height - dy;
          break;
        case 'sw':
          x = s.x + dx;
          width = s.width - dx;
          height = s.height + dy;
          break;
        case 'se':
          width = s.width + dx;
          height = s.height + dy;
          break;
        case 'n':
          y = s.y + dy;
          height = s.height - dy;
          break;
        case 's':
          height = s.height + dy;
          break;
        case 'e':
          width = s.width + dx;
          break;
        case 'w':
          x = s.x + dx;
          width = s.width - dx;
          break;
      }
      if (width < minSize) width = minSize;
      if (height < minSize) height = minSize;
      updateSlot(selected, {
        x: Math.round(x),
        y: Math.round(y),
        width: Math.round(width),
        height: Math.round(height),
      });
    },
    [selected, updateSlot],
  );

  const endDrag = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (dragRef.current?.pointerId === e.pointerId) {
      dragRef.current = null;
    }
  }, []);

  const copyConfig = useCallback(async () => {
    const lines = slots.map((s) => {
      const rotation = s.rotation ? `, rotation: ${s.rotation}` : '';
      return `  { x: ${s.x}, y: ${s.y}, width: ${s.width}, height: ${s.height}${rotation} },`;
    });
    const text = `slots: [\n${lines.join('\n')}\n],`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Fallback: select-and-show in the inspect text box.
    }
  }, [slots]);

  return (
    <div className="screen editor-screen">
      <header className="screen-header">
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          ← Frames
        </button>
        <span className="screen-title">{frame.name}</span>
        <button type="button" className="btn btn-ghost" onClick={onHome}>
          Home
        </button>
      </header>

      <p className="muted editor-hint">
        Drag a slot to move. Drag the corner or edge handles to resize. Click a
        slot to select it, then fine-tune the values below.
      </p>

      <div ref={stageRef} className="editor-stage">
        <div
          className="editor-frame"
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
          {frame.overlay && (
            <img
              src={frame.overlay}
              alt=""
              className="frame-overlay"
              style={{
                width: frame.output.width * scale,
                height: frame.output.height * scale,
                opacity: 0.5,
              }}
            />
          )}
          {slots.map((slot, i) => (
            <div
              key={i}
              className={`editor-slot ${i === selected ? 'selected' : ''}`}
              style={{
                left: slot.x * scale,
                top: slot.y * scale,
                width: slot.width * scale,
                height: slot.height * scale,
              }}
              onPointerDown={startDrag(i, 'move')}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            >
              <span className="editor-slot-label">{i + 1}</span>
              {i === selected && (
                <>
                  {HANDLES_CORNER.map((h) => (
                    <span
                      key={h}
                      className={`editor-handle corner ${h}`}
                      onPointerDown={startDrag(i, h)}
                      onPointerMove={onPointerMove}
                      onPointerUp={endDrag}
                      onPointerCancel={endDrag}
                    />
                  ))}
                  {HANDLES_EDGE.map((h) => (
                    <span
                      key={h}
                      className={`editor-handle edge ${h}`}
                      onPointerDown={startDrag(i, h)}
                      onPointerMove={onPointerMove}
                      onPointerUp={endDrag}
                      onPointerCancel={endDrag}
                    />
                  ))}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <SlotInputs
        slots={slots}
        selected={selected}
        onSelect={setSelected}
        onChange={updateSlot}
      />

      <div className="editor-actions">
        <button type="button" className="btn btn-primary" onClick={copyConfig}>
          {copied ? '✓ Copied' : 'Copy slots config'}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setSlots(frame.slots)}
        >
          Reset
        </button>
      </div>

      <pre className="editor-output" aria-label="Slots config snippet">
        {formatSlots(slots)}
      </pre>
    </div>
  );
}

function SlotInputs({
  slots,
  selected,
  onSelect,
  onChange,
}: {
  slots: SlotConfig[];
  selected: number;
  onSelect: (i: number) => void;
  onChange: (i: number, patch: Partial<SlotConfig>) => void;
}) {
  return (
    <div className="editor-slot-inputs">
      <div className="editor-slot-tabs" role="tablist">
        {slots.map((_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === selected}
            className={`editor-slot-tab ${i === selected ? 'active' : ''}`}
            onClick={() => onSelect(i)}
          >
            Slot {i + 1}
          </button>
        ))}
      </div>
      <div className="editor-slot-fields">
        {(['x', 'y', 'width', 'height'] as const).map((key) => (
          <label key={key} className="editor-field">
            <span>{key}</span>
            <input
              type="number"
              value={slots[selected][key] ?? 0}
              onChange={(e) =>
                onChange(selected, { [key]: Number(e.target.value) })
              }
            />
          </label>
        ))}
        <label className="editor-field">
          <span>rotation</span>
          <input
            type="number"
            step="0.5"
            value={slots[selected].rotation ?? 0}
            onChange={(e) => {
              const v = Number(e.target.value);
              onChange(selected, { rotation: v || undefined });
            }}
          />
        </label>
      </div>
    </div>
  );
}

function formatSlots(slots: SlotConfig[]): string {
  const lines = slots.map((s) => {
    const r = s.rotation ? `, rotation: ${s.rotation}` : '';
    return `  { x: ${s.x}, y: ${s.y}, width: ${s.width}, height: ${s.height}${r} },`;
  });
  return `slots: [\n${lines.join('\n')}\n],`;
}
