import type { Photo } from './photo.types';
import type { Project, ProjectCreateDTO } from './project.types';

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
  readonly findByProjectId: (projectId: string) => Promise<readonly Photo[]>;
  readonly update: (photo: Photo) => Promise<void>;
}

/**
 * Project Storage Port (Interface)
 */
export interface IProjectStorage {
  readonly save: (project: Project) => Promise<void>;
  readonly findAll: () => Promise<readonly Project[]>;
  readonly findById: (id: string) => Promise<Project | null>;
  readonly delete: (id: string) => Promise<void>;
  readonly update: (project: Project) => Promise<void>;
  readonly create: (dto: ProjectCreateDTO) => Promise<Project>;
}
