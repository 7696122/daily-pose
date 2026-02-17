import type { Photo } from './photo.types';

/**
 * Storage Result
 */
export type StorageResult<T> = [T | null, Error | null];

/**
 * Photo Storage Port (Interface)
 */
export interface IPhotoStorage {
  readonly save: (photo: Photo) => Promise<void>;
  readonly findAll: () => Promise<readonly Photo[]>;
  readonly findById: (id: string) => Promise<Photo | null>;
  readonly delete: (id: string) => Promise<void>;
  readonly clear: () => Promise<void>;
}
