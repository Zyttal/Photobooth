import { useEffect, useState } from 'react';

type Props = {
  seconds: number;
  onComplete: () => void;
  className?: string;
};

export function Countdown({ seconds, onComplete, className }: Props) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) {
      onComplete();
      return;
    }
    const id = window.setTimeout(() => setRemaining(remaining - 1), 1000);
    return () => window.clearTimeout(id);
  }, [remaining, onComplete]);

  if (remaining <= 0) return null;

  return (
    <div className={`countdown ${className ?? ''}`} aria-live="polite" aria-label={`${remaining} seconds`}>
      <span key={remaining} className="countdown-number">
        {remaining}
      </span>
    </div>
  );
}
