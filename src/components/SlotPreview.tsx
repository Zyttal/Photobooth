import type { SlotConfig, SlotImage } from '../types';
import { useSlotTransform } from '../hooks/useSlotTransform';

type Props = {
  slot: SlotConfig;
  slotImage: SlotImage | null;
  scale: number;
  interactive?: boolean;
  onTransformChange?: (next: SlotImage['transform']) => void;
  placeholder?: React.ReactNode;
};

/**
 * Renders one slot as an absolutely-positioned, clipped box containing the
 * user image. Coordinates and dimensions are given in the frame's output
 * coordinate space and multiplied by `scale` for on-screen rendering.
 */
export function SlotPreview({
  slot,
  slotImage,
  scale,
  interactive = false,
  onTransformChange,
  placeholder,
}: Props) {
  const { bind } = useSlotTransform(
    slotImage?.transform ?? { offsetX: 0, offsetY: 0, scale: 1 },
    (t) => onTransformChange?.(t),
  );

  const style: React.CSSProperties = {
    position: 'absolute',
    left: slot.x * scale,
    top: slot.y * scale,
    width: slot.width * scale,
    height: slot.height * scale,
    overflow: 'hidden',
    transform: slot.rotation ? `rotate(${slot.rotation}deg)` : undefined,
    touchAction: interactive ? 'none' : undefined,
  };

  if (!slotImage) {
    return <div className="slot-preview slot-empty" style={style}>{placeholder}</div>;
  }

  const t = slotImage.transform;
  const imgStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform: `translate(${t.offsetX * scale}px, ${t.offsetY * scale}px) scale(${t.scale})`,
    transformOrigin: 'center center',
    pointerEvents: interactive ? 'none' : 'auto',
  };

  return (
    <div
      className="slot-preview"
      style={style}
      {...(interactive
        ? {
            onPointerDown: bind.onPointerDown,
            onPointerMove: bind.onPointerMove,
            onPointerUp: bind.onPointerUp,
            onPointerCancel: bind.onPointerCancel,
            onWheel: bind.onWheel,
          }
        : {})}
    >
      <img src={slotImage.sourceUrl} alt="" style={imgStyle} draggable={false} />
    </div>
  );
}
