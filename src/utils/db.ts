export const DB_NAME = 'photobooth';
export const DB_VERSION = 2;
export const STORE_PHOTOS = 'photos';
export const STORE_FRAMES = 'frames';
export const PHOTOS_INDEX = 'by_createdAt';
export const FRAMES_INDEX = 'by_createdAt';

let dbPromise: Promise<IDBDatabase> | null = null;

export function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('IndexedDB is not available in this browser'));
  }
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_PHOTOS)) {
        const photos = db.createObjectStore(STORE_PHOTOS, { keyPath: 'id' });
        photos.createIndex(PHOTOS_INDEX, 'createdAt');
      }
      if (!db.objectStoreNames.contains(STORE_FRAMES)) {
        const frames = db.createObjectStore(STORE_FRAMES, { keyPath: 'id' });
        frames.createIndex(FRAMES_INDEX, 'createdAt');
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('IndexedDB open failed'));
  });
  return dbPromise;
}

export function withStore<T>(
  store: string,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T> | Promise<T>,
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(store, mode);
        const s = tx.objectStore(store);
        const result = fn(s);
        if (result instanceof Promise) {
          result.then(resolve, reject);
        } else {
          result.onsuccess = () => resolve(result.result);
          result.onerror = () => reject(result.error);
        }
        tx.onerror = () => reject(tx.error);
      }),
  );
}
