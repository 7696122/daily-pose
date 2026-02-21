import type { IPhotoStorage, Photo } from '../core/types';

/**
 * IndexedDB Configuration
 */
interface DBConfig {
  readonly name: string;
  readonly version: number;
  readonly storeName: string;
}

/**
 * IndexedDB Client
 * Single Responsibility: Manage IndexedDB connection
 */
class IndexedDBClient {
  constructor(config: DBConfig) {
    this.config = config;
  }

  private config: DBConfig;

  async open(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.config.name, this.config.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const oldVersion = event.oldVersion;

        // Create store if it doesn't exist
        if (!db.objectStoreNames.contains(this.config.storeName)) {
          const store = db.createObjectStore(this.config.storeName, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('projectId', 'projectId', { unique: false });
          console.log('Photos store created (v3)');
        } else {
          // Version 2 -> 3: Ensure projectId index exists
          if (oldVersion < 3) {
            const transaction = request.transaction;
            if (transaction) {
              const store = transaction.objectStore(this.config.storeName);
              if (!store.indexNames.contains('projectId')) {
                store.createIndex('projectId', 'projectId', { unique: false });
                console.log('Added projectId index to photos store (v2->v3)');
              }
            }
          }
        }
      };
    });
  }

  async close(db: IDBDatabase): Promise<void> {
    db.close();
  }
}

/**
 * IndexedDB Photo Storage Implementation
 * Single Responsibility: Photo CRUD operations
 */
export class IndexedDBPhotoStorage implements IPhotoStorage {
  private readonly config: DBConfig;
  private readonly client: IndexedDBClient;

  constructor(dbName?: string) {
    this.config = {
      name: dbName ?? import.meta.env.VITE_DB_NAME ?? 'DailyPoseDB',
      version: 4,  // Incremented to force object store recreation
      storeName: 'photos',
    };
    this.client = new IndexedDBClient(this.config);
  }

  async save(photo: Photo): Promise<void> {
    let db: IDBDatabase | null = null;

    try {
      db = await this.client.open();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.config.storeName], 'readwrite');
        const store = transaction.objectStore(this.config.storeName);
        const request = store.add(photo);

        request.onsuccess = () => {
          resolve();
        };
        request.onerror = () => {
          const error = request.error;
          if (error?.name === 'QuotaExceededError') {
            reject(new Error('저장 공간이 부족합니다. 일부 사진을 삭제하거나 브라우저 저장 공간을 확보해주세요.'));
          } else {
            reject(error ?? new Error('사진 저장에 실패했습니다.'));
          }
        };

        transaction.oncomplete = () => {
          if (db) this.client.close(db);
          resolve();
        };

        transaction.onerror = () => {
          if (db) this.client.close(db);
          reject(transaction.error ?? new Error('트랜잭션 오류'));
        };
      });
    } catch (error) {
      if (db) this.client.close(db);
      throw error;
    }
  }

  async findAll(): Promise<readonly Photo[]> {
    const db = await this.client.open();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.config.storeName], 'readonly');
      const store = transaction.objectStore(this.config.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        this.client.close(db);
        const photos = request.result.sort((a, b) => a.timestamp - b.timestamp);
        resolve(photos);
      };
      request.onerror = () => {
        this.client.close(db);
        reject(request.error);
      };
    });
  }

  async findById(id: string): Promise<Photo | null> {
    const db = await this.client.open();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.config.storeName], 'readonly');
      const store = transaction.objectStore(this.config.storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        this.client.close(db);
        resolve(request.result ?? null);
      };
      request.onerror = () => {
        this.client.close(db);
        reject(request.error);
      };
    });
  }

  async findByProjectId(projectId: string): Promise<readonly Photo[]> {
    const db = await this.client.open();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.config.storeName], 'readonly');
      const store = transaction.objectStore(this.config.storeName);
      const index = store.index('projectId');
      const request = index.getAll(projectId);

      request.onsuccess = () => {
        this.client.close(db);
        const photos = request.result.sort((a, b) => a.timestamp - b.timestamp);
        resolve(photos);
      };
      request.onerror = () => {
        this.client.close(db);
        reject(request.error);
      };
    });
  }

  async delete(id: string): Promise<void> {
    const db = await this.client.open();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.config.storeName], 'readwrite');
      const store = transaction.objectStore(this.config.storeName);
      const request = store.delete(id);

      request.onsuccess = () => {
        this.client.close(db);
        resolve();
      };
      request.onerror = () => {
        this.client.close(db);
        reject(request.error);
      };
    });
  }

  async update(photo: Photo): Promise<void> {
    const db = await this.client.open();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.config.storeName], 'readwrite');
      const store = transaction.objectStore(this.config.storeName);
      const request = store.put(photo);

      request.onsuccess = () => {
        this.client.close(db);
        resolve();
      };
      request.onerror = () => {
        this.client.close(db);
        reject(request.error);
      };
    });
  }

  async clear(): Promise<void> {
    const db = await this.client.open();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.config.storeName], 'readwrite');
      const store = transaction.objectStore(this.config.storeName);
      const request = store.clear();

      request.onsuccess = () => {
        this.client.close(db);
        resolve();
      };
      request.onerror = () => {
        this.client.close(db);
        reject(request.error);
      };
    });
  }
}

/**
 * Singleton instance
 */
export const photoStorage = new IndexedDBPhotoStorage();
