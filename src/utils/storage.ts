import type { SavedPhoto } from '../types';

const DB_NAME = 'photobooth';
const DB_VERSION = 1;
const STORE = 'photos';
const CREATED_INDEX = 'by_createdAt';

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('IndexedDB is not available in this browser'));
  }
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' });
        store.createIndex(CREATED_INDEX, 'createdAt');
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('IndexedDB open failed'));
  });
  return dbPromise;
}

function withStore<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T> | Promise<T>,
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const store = tx.objectStore(STORE);
        const result = fn(store);
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

export function savePhoto(photo: SavedPhoto): Promise<void> {
  return withStore('readwrite', (store) => store.put(photo)).then(() => undefined);
}

export function listPhotos(): Promise<SavedPhoto[]> {
  return withStore('readonly', (store) => {
    const index = store.index(CREATED_INDEX);
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
  return withStore('readonly', (store) => store.get(id) as IDBRequest<SavedPhoto | undefined>);
}

export function deletePhoto(id: string): Promise<void> {
  return withStore('readwrite', (store) => store.delete(id)).then(() => undefined);
}

export function clearAll(): Promise<void> {
  return withStore('readwrite', (store) => store.clear()).then(() => undefined);
}

export async function estimateUsage(): Promise<{ usage: number; quota: number } | null> {
  if (!navigator.storage?.estimate) return null;
  const est = await navigator.storage.estimate();
  return { usage: est.usage ?? 0, quota: est.quota ?? 0 };
}
