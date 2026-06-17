import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CustomFrame, FrameConfig } from '../types';
import {
  deleteCustomFrame,
  listCustomFrames,
  saveCustomFrame,
} from '../utils/customFrameStorage';

type UrlPair = { bg: string; thumb: string };

/**
 * Loads custom frames from IndexedDB and exposes them as runtime FrameConfigs
 * (Blob refs swapped for object URLs). Manages URL lifecycle so old URLs are
 * revoked when frames change or unmount.
 */
export function useCustomFrames(): {
  customFrames: FrameConfig[];
  rawCustomFrames: CustomFrame[];
  loading: boolean;
  refresh: () => Promise<void>;
  save: (frame: CustomFrame) => Promise<void>;
  remove: (id: string) => Promise<void>;
} {
  const [raw, setRaw] = useState<CustomFrame[]>([]);
  const [loading, setLoading] = useState(true);
  const urlMapRef = useRef<Map<string, UrlPair>>(new Map());

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const list = await listCustomFrames();
      setRaw(list);
    } catch (err) {
      console.error('Failed to load custom frames', err);
      setRaw([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Maintain object URLs in lockstep with `raw`.
  useEffect(() => {
    const map = urlMapRef.current;
    const liveIds = new Set(raw.map((f) => f.id));

    // Revoke URLs for frames that disappeared.
    for (const [id, pair] of map.entries()) {
      if (!liveIds.has(id)) {
        URL.revokeObjectURL(pair.bg);
        URL.revokeObjectURL(pair.thumb);
        map.delete(id);
      }
    }

    // Create URLs for new frames.
    for (const f of raw) {
      if (!map.has(f.id)) {
        map.set(f.id, {
          bg: URL.createObjectURL(f.background),
          thumb: URL.createObjectURL(f.thumbnail),
        });
      }
    }
  }, [raw]);

  useEffect(
    () => () => {
      // Revoke everything on unmount.
      for (const pair of urlMapRef.current.values()) {
        URL.revokeObjectURL(pair.bg);
        URL.revokeObjectURL(pair.thumb);
      }
      urlMapRef.current.clear();
    },
    [],
  );

  const customFrames = useMemo<FrameConfig[]>(() => {
    return raw.map((cf) => {
      const urls = urlMapRef.current.get(cf.id);
      return {
        id: cf.id,
        name: cf.name,
        thumbnail: urls?.thumb ?? '',
        background: { image: urls?.bg ?? '' },
        output: cf.output,
        slots: cf.slots,
        revealAnimation: cf.revealAnimation ?? 'fade-in',
      };
    });
  }, [raw]);

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

  return { customFrames, rawCustomFrames: raw, loading, refresh, save, remove };
}
