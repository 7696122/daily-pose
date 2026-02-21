// IndexedDB module - Refactored to use service layer
import { IndexedDBPhotoStorage } from '../services';
import type { Photo } from '../core/types';

// Export class
export { IndexedDBPhotoStorage };

// Singleton instance
const photoStorageInstance = new IndexedDBPhotoStorage();

// Backward compatibility exports
export const openDB = async (): Promise<IDBDatabase> => {
  const request = indexedDB.open(
    import.meta.env.VITE_DB_NAME || 'DailyPoseDB',
    4  // Match IndexedDBPhotoStorage version
  );

  return new Promise((resolve, reject) => {
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('photos')) {
        const store = db.createObjectStore('photos', { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('projectId', 'projectId', { unique: false });
      }
    };
  });
};

export const savePhoto = async (photo: Photo): Promise<void> => {
  await photoStorageInstance.save(photo);
};

export const getAllPhotos = async (): Promise<readonly Photo[]> => {
  return photoStorageInstance.findAll();
};

export const deletePhoto = async (id: string): Promise<void> => {
  await photoStorageInstance.delete(id);
};

export const updatePhoto = async (photo: Photo): Promise<void> => {
  await photoStorageInstance.update(photo);
};

export const clearDatabase = async (): Promise<void> => {
  await photoStorageInstance.clear();
};

/**
 * Reset database by deleting and recreating
 * Use this when database structure is corrupted
 */
export const resetDatabase = async (): Promise<void> => {
  const dbName = import.meta.env.VITE_DB_NAME || 'DailyPoseDB';

  // Close all existing connections first
  const dbs = await indexedDB.databases();
  for (const db of dbs) {
    if (db.name === dbName) {
      // Close connection by opening and immediately closing
    }
  }

  // Delete database
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(dbName);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => {
      console.warn('Database delete blocked - reloading page');
      // If blocked, reload and try again via sessionStorage
      sessionStorage.setItem('resetDB', 'true');
      window.location.reload();
    };
  });

  console.log('Database reset complete');
};

// Export singleton instance for direct use
export const photoStorage = photoStorageInstance;
