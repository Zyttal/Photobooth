import type { CustomFrame } from '../types';
import { FRAMES_INDEX, STORE_FRAMES, withStore } from './db';

export function saveCustomFrame(frame: CustomFrame): Promise<void> {
  return withStore(STORE_FRAMES, 'readwrite', (s) => s.put(frame)).then(() => undefined);
}

export function listCustomFrames(): Promise<CustomFrame[]> {
  return withStore(STORE_FRAMES, 'readonly', (s) => {
    const index = s.index(FRAMES_INDEX);
    return new Promise<CustomFrame[]>((resolve, reject) => {
      const items: CustomFrame[] = [];
      const cursorReq = index.openCursor(null, 'prev');
      cursorReq.onsuccess = () => {
        const cursor = cursorReq.result;
        if (cursor) {
          items.push(cursor.value as CustomFrame);
          cursor.continue();
        } else {
          resolve(items);
        }
      };
      cursorReq.onerror = () => reject(cursorReq.error);
    });
  });
}

export function getCustomFrame(id: string): Promise<CustomFrame | undefined> {
  return withStore(STORE_FRAMES, 'readonly', (s) =>
    s.get(id) as IDBRequest<CustomFrame | undefined>,
  );
}

export function deleteCustomFrame(id: string): Promise<void> {
  return withStore(STORE_FRAMES, 'readwrite', (s) => s.delete(id)).then(() => undefined);
}
