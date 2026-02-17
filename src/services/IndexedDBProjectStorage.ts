import type { IProjectStorage, Project, ProjectCreateDTO } from '../core/types';
import { createProjectId } from '../core/types/project.types';

/**
 * IndexedDB Configuration
 */
interface DBConfig {
  readonly name: string;
  readonly version: number;
  readonly storeName: string;
}

/**
 * IndexedDB Client for Projects
 * Single Responsibility: Manage IndexedDB connection for projects
 */
class IndexedDBProjectClient {
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

        // Create projects store if not exists (v3)
        if (!db.objectStoreNames.contains(this.config.storeName)) {
          const store = db.createObjectStore(this.config.storeName, { keyPath: 'id' });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
          console.log('Projects store created (v3)');
        }
      };
    });
  }

  async close(db: IDBDatabase): Promise<void> {
    db.close();
  }
}

/**
 * IndexedDB Project Storage Implementation
 * Single Responsibility: Project CRUD operations
 */
export class IndexedDBProjectStorage implements IProjectStorage {
  private readonly config: DBConfig;
  private readonly client: IndexedDBProjectClient;

  constructor(dbName?: string) {
    this.config = {
      name: dbName ?? import.meta.env.VITE_DB_NAME ?? 'DailyPoseDB',
      version: 3,
      storeName: 'projects',
    };
    this.client = new IndexedDBProjectClient(this.config);
  }

  async save(project: Project): Promise<void> {
    const db = await this.client.open();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.config.storeName], 'readwrite');
      const store = transaction.objectStore(this.config.storeName);
      const request = store.add(project);

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

  async findAll(): Promise<readonly Project[]> {
    const db = await this.client.open();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.config.storeName], 'readonly');
      const store = transaction.objectStore(this.config.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        this.client.close(db);
        const projects = request.result.sort((a, b) => a.createdAt - b.createdAt);
        resolve(projects);
      };
      request.onerror = () => {
        this.client.close(db);
        reject(request.error);
      };
    });
  }

  async findById(id: string): Promise<Project | null> {
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

  async update(project: Project): Promise<void> {
    const db = await this.client.open();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.config.storeName], 'readwrite');
      const store = transaction.objectStore(this.config.storeName);
      const request = store.put(project);

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

  async create(dto: ProjectCreateDTO): Promise<Project> {
    const now = Date.now();
    const id = createProjectId(now);

    const project: Project = {
      id,
      name: dto.name,
      type: dto.type,
      createdAt: now,
      updatedAt: now,
      coverPhotoId: dto.coverPhotoId,
      settings: {
        reminderEnabled: dto.settings?.reminderEnabled ?? false,
        reminderTime: dto.settings?.reminderTime,
      },
    };

    await this.save(project);
    return project;
  }
}

/**
 * Singleton instance
 */
export const projectStorage = new IndexedDBProjectStorage();
