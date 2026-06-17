import type { SavedPhoto } from '../types';
import { PHOTOS_INDEX, STORE_PHOTOS, withStore } from './db';

export function savePhoto(photo: SavedPhoto): Promise<void> {
  return withStore(STORE_PHOTOS, 'readwrite', (s) => s.put(photo)).then(() => undefined);
}

export function listPhotos(): Promise<SavedPhoto[]> {
  return withStore(STORE_PHOTOS, 'readonly', (s) => {
    const index = s.index(PHOTOS_INDEX);
    return new Promise<SavedPhoto[]>((resolve, reject) => {
      const items: SavedPhoto[] = [];
      const cursorReq = index.openCursor(null, 'prev');
      cursorReq.onsuccess = () => {
        const cursor = cursorReq.result;
        if (cursor) {
          items.push(cursor.value as SavedPhoto);
          cursor.continue();
        } else {
          resolve(items);
        }
      };
      cursorReq.onerror = () => reject(cursorReq.error);
    });
  });
}

export function getPhoto(id: string): Promise<SavedPhoto | undefined> {
  return withStore(STORE_PHOTOS, 'readonly', (s) =>
    s.get(id) as IDBRequest<SavedPhoto | undefined>,
  );
}

export function deletePhoto(id: string): Promise<void> {
  return withStore(STORE_PHOTOS, 'readwrite', (s) => s.delete(id)).then(() => undefined);
}

export function clearAll(): Promise<void> {
  return withStore(STORE_PHOTOS, 'readwrite', (s) => s.clear()).then(() => undefined);
}

export async function estimateUsage(): Promise<{ usage: number; quota: number } | null> {
  if (!navigator.storage?.estimate) return null;
  const est = await navigator.storage.estimate();
  return { usage: est.usage ?? 0, quota: est.quota ?? 0 };
}
