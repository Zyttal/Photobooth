import { useCallback, useEffect, useRef, useState } from 'react';
import type { AppState, FrameConfig, SlotImage } from '../types';
import type { Action } from '../state/appReducer';
import { CameraView } from '../components/CameraView';
import { StepIndicator } from '../components/StepIndicator';
import { fileToImage } from '../utils/fileToImage';
import { identityTransform } from '../utils/coverFit';

type Props = {
  state: AppState;
  frame: FrameConfig;
  dispatch: React.Dispatch<Action>;
};

type Mode = 'camera' | 'upload';
type PendingPhoto = { blob: Blob; image: HTMLImageElement; sourceUrl: string } | null;

export function CaptureScreen({ state, frame, dispatch }: Props) {
  const [mode, setMode] = useState<Mode>('camera');
  const [pending, setPending] = useState<PendingPhoto>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pendingUrlRef = useRef<string | null>(null);

  const totalSlots = frame.slots.length;
  const activeSlot = state.activeSlot;
  const filledCount = state.slotImages.filter(Boolean).length;

  useEffect(() => {
    return () => {
      if (pendingUrlRef.current) {
        URL.revokeObjectURL(pendingUrlRef.current);
        pendingUrlRef.current = null;
      }
    };
  }, []);

  const setPendingFromBlob = useCallback(async (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    try {
      const img = await fileToImage(url);
      if (pendingUrlRef.current) URL.revokeObjectURL(pendingUrlRef.current);
      pendingUrlRef.current = url;
      setPending({ blob, image: img, sourceUrl: url });
    } catch (err) {
      URL.revokeObjectURL(url);
      console.error('Failed to load image', err);
    }
  }, []);

  const handleCapture = useCallback(
    (blob: Blob) => {
      void setPendingFromBlob(blob);
    },
    [setPendingFromBlob],
  );

  const handleUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const list = Array.from(files);

      if (list.length === 1) {
        await setPendingFromBlob(list[0]);
        return;
      }

      // Bulk upload distributes across remaining unfilled slots.
      let cursor = activeSlot;
      for (const file of list) {
        if (cursor >= totalSlots) break;
        try {
          const img = await fileToImage(file);
          const url = URL.createObjectURL(file);
          const slotImage: SlotImage = {
            image: img,
            sourceUrl: url,
            transform: identityTransform,
          };
          dispatch({ type: 'setSlotImage', index: cursor, image: slotImage });
          cursor += 1;
        } catch (err) {
          console.error('Failed to load uploaded image', err);
        }
      }
      const nextSlot = Math.min(cursor, totalSlots - 1);
      dispatch({ type: 'setActiveSlot', index: nextSlot });

      const allFilled = cursor >= totalSlots;
      if (allFilled) {
        dispatch({ type: 'goto', step: 'adjust' });
      }
    },
    [activeSlot, totalSlots, dispatch, setPendingFromBlob],
  );

  const confirmPending = useCallback(() => {
    if (!pending) return;
    const slotImage: SlotImage = {
      image: pending.image,
      sourceUrl: pending.sourceUrl,
      transform: identityTransform,
    };
    dispatch({ type: 'setSlotImage', index: activeSlot, image: slotImage });
    pendingUrlRef.current = null;
    setPending(null);

    // Compute the next-empty index from a hypothetical post-dispatch state
    // (the reducer hasn't applied yet, so state.slotImages is still stale).
    const projected = state.slotImages.slice();
    projected[activeSlot] = slotImage;
    const nextEmpty = projected.findIndex((s) => s === null);
    if (nextEmpty === -1) {
      dispatch({ type: 'goto', step: 'adjust' });
    } else {
      dispatch({ type: 'setActiveSlot', index: nextEmpty });
    }
  }, [pending, activeSlot, dispatch, state.slotImages]);

  const retake = useCallback(() => {
    if (pendingUrlRef.current) {
      URL.revokeObjectURL(pendingUrlRef.current);
      pendingUrlRef.current = null;
    }
    setPending(null);
  }, []);

  return (
    <div className="screen capture-screen">
      <header className="screen-header">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => dispatch({ type: 'reset' })}
        >
          ← Back
        </button>
        <StepIndicator
          current={filledCount + 1}
          total={totalSlots}
          label={`${frame.name} — slot ${activeSlot + 1}`}
        />
        <span />
      </header>

      {pending ? (
        <div className="capture-preview">
          <img src={pending.sourceUrl} alt="Preview" className="capture-preview-image" />
          <div className="capture-actions">
            <button type="button" className="btn btn-ghost" onClick={retake}>
              Retake
            </button>
            <button type="button" className="btn btn-primary" onClick={confirmPending}>
              Use this photo
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="mode-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'camera'}
              className={`mode-tab ${mode === 'camera' ? 'active' : ''}`}
              onClick={() => setMode('camera')}
            >
              Camera
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'upload'}
              className={`mode-tab ${mode === 'upload' ? 'active' : ''}`}
              onClick={() => setMode('upload')}
            >
              Upload
            </button>
          </div>

          {mode === 'camera' ? (
            <CameraView onCapture={handleCapture} />
          ) : (
            <div className="upload-area">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => void handleUpload(e.target.files)}
              />
              <button
                type="button"
                className="btn btn-primary upload-button"
                onClick={() => fileInputRef.current?.click()}
              >
                Choose photo(s)
              </button>
              <p className="muted">
                Pick {totalSlots - filledCount} more {totalSlots - filledCount === 1 ? 'photo' : 'photos'} to fill the frame.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

