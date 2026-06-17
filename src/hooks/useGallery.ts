import { useCallback, useEffect, useState } from 'react';
import type { SavedPhoto } from '../types';
import {
  clearAll as clearAllStored,
  deletePhoto as deleteStored,
  estimateUsage,
  listPhotos,
} from '../utils/storage';

export type StorageUsage = { usage: number; quota: number } | null;

export function useGallery(): {
  photos: SavedPhoto[];
  loading: boolean;
  error: string | null;
  usage: StorageUsage;
  refresh: () => Promise<void>;
  remove: (id: string) => Promise<void>;
  clear: () => Promise<void>;
} {
  const [photos, setPhotos] = useState<SavedPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<StorageUsage>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [list, est] = await Promise.all([listPhotos(), estimateUsage()]);
      setPhotos(list);
      setUsage(est);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load gallery');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const remove = useCallback(
    async (id: string) => {
      await deleteStored(id);
      await refresh();
    },
    [refresh],
  );

  const clear = useCallback(async () => {
    await clearAllStored();
    await refresh();
  }, [refresh]);

  return { photos, loading, error, usage, refresh, remove, clear };
}
