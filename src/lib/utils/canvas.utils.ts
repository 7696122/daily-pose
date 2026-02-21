import type { CropRegion, Dimensions } from '../../core/types';

/**
 * Create a canvas with specified dimensions
 * @pure
 */
export const createCanvas = (dimensions: Dimensions): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;
  return canvas;
};

/**
 * Get 2D context from canvas
 * @pure
 */
export const getCanvasContext = (canvas: HTMLCanvasElement): CanvasRenderingContext2D => {
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Failed to get 2D context from canvas');
  }
  return context;
};

/**
 * Draw image from video element with crop region
 * @pure (except for canvas side effect)
 */
export const drawImageFromVideo = (
  context: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  crop: CropRegion,
  destination: Dimensions
): void => {
  context.drawImage(
    video,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    destination.width,
    destination.height
  );
};

/**
 * Draw image from canvas with crop region
 * @pure (except for canvas side effect)
 */
export const drawImageFromCanvas = (
  context: CanvasRenderingContext2D,
  sourceCanvas: HTMLCanvasElement,
  crop: CropRegion,
  destination: Dimensions
): void => {
  context.drawImage(
    sourceCanvas,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    destination.width,
    destination.height
  );
};

/**
 * Apply horizontal flip transformation to context
 * @pure (except for context side effect)
 */
export const applyHorizontalFlip = (
  context: CanvasRenderingContext2D,
  width: number
): void => {
  context.translate(width, 0);
  context.scale(-1, 1);
};

/**
 * Convert canvas to data URL
 * @pure
 */
export const canvasToDataURL = (
  canvas: HTMLCanvasElement,
  quality: number = 0.95
): string => {
  return canvas.toDataURL('image/jpeg', quality);
};

/**
 * Get video dimensions
 * @pure
 */
export const getVideoDimensions = (video: HTMLVideoElement): Dimensions => ({
  width: video.videoWidth,
  height: video.videoHeight,
});

/**
 * Limit dimensions to max size while maintaining aspect ratio
 * @pure
 */
export const limitDimensions = (
  dimensions: Dimensions,
  maxSize: number = 1920
): Dimensions => {
  const { width, height } = dimensions;

  // If both dimensions are within limit, return as-is
  if (width <= maxSize && height <= maxSize) {
    return { width, height };
  }

  // Calculate scale factor
  const scale = Math.min(maxSize / width, maxSize / height);
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
};
