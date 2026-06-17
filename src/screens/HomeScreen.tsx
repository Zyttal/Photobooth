import { useEffect, useState } from 'react';
import type { Action } from '../state/appReducer';
import { frames } from '../config/frames';
import { FrameCard } from '../components/FrameCard';
import { listPhotos } from '../utils/storage';

type Props = {
  dispatch: React.Dispatch<Action>;
};

const PRIVACY_DISMISSED_KEY = 'photobooth.privacyDismissed';

export function HomeScreen({ dispatch }: Props) {
  const [privacyOpen, setPrivacyOpen] = useState(
    () => typeof window !== 'undefined' && localStorage.getItem(PRIVACY_DISMISSED_KEY) !== '1',
  );
  const [galleryCount, setGalleryCount] = useState<number | null>(null);

  useEffect(() => {
    listPhotos()
      .then((photos) => setGalleryCount(photos.length))
      .catch(() => setGalleryCount(0));
  }, []);

  function dismissPrivacy() {
    localStorage.setItem(PRIVACY_DISMISSED_KEY, '1');
    setPrivacyOpen(false);
  }

  return (
    <div className="screen home-screen">
      <header className="home-header">
        <div>
          <h1 className="home-title">Photobooth</h1>
          <p className="home-subtitle">Pick a frame. Strike a pose.</p>
        </div>
        <button
          type="button"
          className="btn btn-ghost gallery-link"
          onClick={() => dispatch({ type: 'goto', step: 'gallery' })}
        >
          Gallery
          {galleryCount !== null && galleryCount > 0 && (
            <span className="badge">{galleryCount}</span>
          )}
        </button>
      </header>

      {privacyOpen && (
        <div className="privacy-banner" role="note">
          <span>
            Your photos stay on this device. Nothing is uploaded — no servers, no tracking.
          </span>
          <button
            type="button"
            className="btn btn-ghost btn-small"
            onClick={dismissPrivacy}
            aria-label="Dismiss privacy notice"
          >
            ✕
          </button>
        </div>
      )}

      <section className="frame-grid" aria-label="Choose a frame">
        {frames.map((frame) => (
          <FrameCard
            key={frame.id}
            frame={frame}
            onSelect={() =>
              dispatch({
                type: 'selectFrame',
                frameId: frame.id,
                slotCount: frame.slots.length,
              })
            }
          />
        ))}
      </section>

      <footer className="home-footer">
        <button
          type="button"
          className="text-link"
          onClick={() => dispatch({ type: 'goto', step: 'edit' })}
        >
          Calibrate frame slots
        </button>
      </footer>
    </div>
  );
}
