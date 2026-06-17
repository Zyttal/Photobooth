import { useCallback, useState } from 'react';
import { useCamera } from '../hooks/useCamera';
import { captureFromVideo } from '../utils/captureFromVideo';
import { Countdown } from './Countdown';
import { FlashOverlay } from './FlashOverlay';

type Props = {
  onCapture: (blob: Blob) => void;
  countdownSeconds?: number;
};

export function CameraView({ onCapture, countdownSeconds = 3 }: Props) {
  const { state, videoRef, switchFacing } = useCamera(true);
  const [counting, setCounting] = useState(false);
  const [flashing, setFlashing] = useState(false);

  const mirror = state.facing === 'user';

  const handleShutter = useCallback(() => {
    if (state.status !== 'ready' || counting) return;
    setCounting(true);
  }, [state.status, counting]);

  const handleCountdownDone = useCallback(async () => {
    setCounting(false);
    const video = videoRef.current;
    if (!video) return;
    setFlashing(true);
    try {
      const blob = await captureFromVideo(video, { mirror });
      onCapture(blob);
    } catch (err) {
      console.error('Capture failed', err);
    }
  }, [videoRef, mirror, onCapture]);

  if (state.status === 'denied') {
    return (
      <div className="camera-message">
        <p>Camera access was blocked.</p>
        <p className="muted">Use the Upload tab instead, or grant camera permission in your browser settings.</p>
      </div>
    );
  }

  if (state.status === 'unavailable') {
    return (
      <div className="camera-message">
        <p>No camera available on this device.</p>
        <p className="muted">Switch to the Upload tab to use a photo from your device.</p>
      </div>
    );
  }

  return (
    <div className="camera-view">
      <div className="camera-stage">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="camera-video"
          style={{ transform: mirror ? 'scaleX(-1)' : undefined }}
        />
        {counting && (
          <Countdown seconds={countdownSeconds} onComplete={handleCountdownDone} />
        )}
        {flashing && (
          <FlashOverlay duration={250} onDone={() => setFlashing(false)} />
        )}
        {state.status === 'requesting' && (
          <div className="camera-message overlay">
            <p>Starting camera…</p>
          </div>
        )}
      </div>
      <div className="camera-controls">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={switchFacing}
          aria-label="Switch camera"
          disabled={state.status !== 'ready'}
        >
          ↻
        </button>
        <button
          type="button"
          className="shutter-button"
          onClick={handleShutter}
          disabled={state.status !== 'ready' || counting}
          aria-label="Take photo"
        >
          <span className="shutter-button-inner" />
        </button>
        <span className="shutter-spacer" aria-hidden="true" />
      </div>
    </div>
  );
}
