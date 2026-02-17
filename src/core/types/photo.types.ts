/**
 * Photo Edit Settings
 */
export interface PhotoEditSettings {
  readonly brightness: number;
  readonly contrast: number;
  readonly filter: PhotoFilter;
}

/**
 * Photo Filter Type
 */
export type PhotoFilter =
  | 'none'
  | 'grayscale'
  | 'sepia'
  | 'vivid'
  | 'warm'
  | 'cool'
  | 'dramatic';

/**
 * Photo Tag Type
 */
export type PhotoTag =
  | 'workout'
  | 'rest'
  | 'good'
  | 'bad'
  | 'tired'
  | 'energetic'
  | 'progress'
  | 'milestone';

/**
 * Photo Metadata
 */
export interface PhotoMetadata {
  readonly weight?: number; // kg
  readonly mood?: 1 | 2 | 3 | 4 | 5; // 1-5 scale
  readonly note?: string; // Free text
  readonly tags?: PhotoTag[];
}

/**
 * Photo Entity
 */
export interface Photo {
  readonly id: string;
  readonly dataUrl: string;
  readonly timestamp: number;
  readonly date: string;
  readonly projectId: string;
  readonly aspectRatio?: 'video' | 'square' | 'portrait';
  readonly editSettings?: PhotoEditSettings;
  readonly metadata?: PhotoMetadata;
}

/**
 * Photo DTO for creation
 */
export interface PhotoCreateDTO {
  readonly dataUrl: string;
  readonly timestamp: number;
  readonly date: string;
  readonly projectId: string;
  readonly aspectRatio: 'video' | 'square' | 'portrait';
  readonly editSettings?: PhotoEditSettings;
  readonly metadata?: PhotoMetadata;
}

/**
 * Create Photo ID
 */
export const createPhotoId = (timestamp: number): string => `photo-${timestamp}`;
