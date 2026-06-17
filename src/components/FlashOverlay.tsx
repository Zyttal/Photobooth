import { useEffect } from 'react';

type Props = {
  duration?: number;
  onDone?: () => void;
  className?: string;
};

export function FlashOverlay({ duration = 250, onDone, className }: Props) {
  useEffect(() => {
    if (!onDone) return;
    const id = window.setTimeout(onDone, duration);
    return () => window.clearTimeout(id);
  }, [duration, onDone]);

  return <div className={`flash-overlay ${className ?? ''}`} aria-hidden="true" />;
}
