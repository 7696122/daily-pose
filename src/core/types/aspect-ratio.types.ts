/**
 * Aspect Ratio Type
 */
export type AspectRatio = 'video' | 'square' | 'portrait';

/**
 * Aspect Ratio Ratio Value
 */
export const ASPECT_RATIO_VALUES = {
  video: 16 / 9,
  square: 1,
  portrait: 3 / 4,
} as const satisfies Record<AspectRatio, number>;

/**
 * Crop Region
 */
export interface CropRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Dimensions
 */
export interface Dimensions {
  width: number;
  height: number;
}
