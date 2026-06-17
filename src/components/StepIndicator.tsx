type Props = {
  current: number;
  total: number;
  label?: string;
};

export function StepIndicator({ current, total, label }: Props) {
  return (
    <div className="step-indicator" aria-label={`Step ${current} of ${total}`}>
      <span className="step-indicator-count">
        {current}/{total}
      </span>
      {label && <span className="step-indicator-label">{label}</span>}
    </div>
  );
}
