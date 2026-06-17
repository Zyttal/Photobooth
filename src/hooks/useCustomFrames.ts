import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CustomFrame, FrameConfig } from '../types';
import {
  deleteCustomFrame,
  listCustomFrames,
  saveCustomFrame,
} from '../utils/customFrameStorage';

type LoadedFrame = {
  raw: CustomFrame;
  bgUrl: string;
  thumbUrl: string;
};

/** Delay matches useObjectUrl's StrictMode-safe revoke. */
const REVOKE_DELAY_MS = 1500;

function revokeLater(url: string): void {
  window.setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS);
}

/**
 * Loads custom frames from IndexedDB and exposes them as runtime FrameConfigs
 * with object URLs ready to use. URLs are created in the same setState as the
 * raw frames, so the first render after load already has working URLs.
 */
export function useCustomFrames(): {
  customFrames: FrameConfig[];
  rawCustomFrames: CustomFrame[];
  loading: boolean;
  refresh: () => Promise<void>;
  save: (frame: CustomFrame) => Promise<void>;
  remove: (id: string) => Promise<void>;
} {
  const [loaded, setLoaded] = useState<LoadedFrame[]>([]);
  const [loading, setLoading] = useState(true);
  const loadedRef = useRef<LoadedFrame[]>([]);

  // Mirror state into a ref so unmount cleanup can see the latest URLs.
  useEffect(() => {
    loadedRef.current = loaded;
  }, [loaded]);

  // Revoke everything on unmount.
  useEffect(
    () => () => {
      for (const l of loadedRef.current) {
        revokeLater(l.bgUrl);
        revokeLater(l.thumbUrl);
      }
    },
    [],
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const list = await listCustomFrames();
      const next = list.map((cf) => ({
        raw: cf,
        bgUrl: URL.createObjectURL(cf.background),
        thumbUrl: URL.createObjectURL(cf.thumbnail),
      }));
      setLoaded((prev) => {
        // Old URLs are no longer referenced — revoke them on a delay so any
        // in-flight image fetches finish first.
        for (const l of prev) {
          revokeLater(l.bgUrl);
          revokeLater(l.thumbUrl);
        }
        return next;
      });
    } catch (err) {
      console.error('Failed to load custom frames', err);
      setLoaded((prev) => {
        for (const l of prev) {
          revokeLater(l.bgUrl);
          revokeLater(l.thumbUrl);
        }
        return [];
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const customFrames = useMemo<FrameConfig[]>(
    () =>
      loaded.map((l) => ({
        id: l.raw.id,
        name: l.raw.name,
        thumbnail: l.thumbUrl,
        background: { image: l.bgUrl },
        output: l.raw.output,
        slots: l.raw.slots,
        revealAnimation: l.raw.revealAnimation ?? 'fade-in',
      })),
    [loaded],
  );

  const rawCustomFrames = useMemo(() => loaded.map((l) => l.raw), [loaded]);

  const save = useCallback(
    async (frame: CustomFrame) => {
      await saveCustomFrame(frame);
      await refresh();
    },
    [refresh],
  );

  const remove = useCallback(
    async (id: string) => {
      await deleteCustomFrame(id);
      await refresh();
    },
    [refresh],
  );

  return { customFrames, rawCustomFrames, loading, refresh, save, remove };
}
