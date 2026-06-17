import type { FrameConfig } from '../types';

type Props = {
  frame: FrameConfig;
  onSelect: (frame: FrameConfig) => void;
};

export function FrameCard({ frame, onSelect }: Props) {
  const slotCount = frame.slots.length;
  return (
    <button
      type="button"
      className="frame-card btn"
      onClick={() => onSelect(frame)}
      aria-label={`Choose ${frame.name}`}
    >
      <div className="frame-card-thumb">
        {frame.thumbnail && <img src={frame.thumbnail} alt="" />}
      </div>
      <div className="frame-card-meta">
        <span className="frame-card-name">{frame.name}</span>
        <span className="frame-card-slots">
          {slotCount} {slotCount === 1 ? 'photo' : 'photos'}
        </span>
      </div>
    </button>
  );
}
