/**
 * Project Type Identifier
 */
export type ProjectType =
  | 'baby-growth'
  | 'fitness-diet'
  | 'daily-life'
  | 'pet'
  | 'garden'
  | 'construction';

/**
 * Project Settings
 */
export interface ProjectSettings {
  readonly reminderEnabled: boolean;
  readonly reminderTime?: { hour: number; minute: number };
}

/**
 * Project Entity
 */
export interface Project {
  readonly id: string;
  readonly name: string;
  readonly type: ProjectType;
  readonly createdAt: number;
  readonly updatedAt: number;
  readonly coverPhotoId?: string;
  readonly settings: ProjectSettings;
}

/**
 * Project DTO for creation
 */
export interface ProjectCreateDTO {
  readonly name: string;
  readonly type: ProjectType;
  readonly coverPhotoId?: string;
  readonly settings?: Partial<ProjectSettings>;
}

/**
 * Create Project ID
 */
export const createProjectId = (timestamp: number): string => `project-${timestamp}`;
