import type { AspectRatio, CropRegion, Dimensions } from '../../core/types';

/**
 * Calculate crop region for a given aspect ratio
 * @pure
 */
export const calculateCropRegion = (
  sourceDimensions: Dimensions,
  targetAspectRatio: AspectRatio
): CropRegion => {
  const { width, height } = sourceDimensions;
  const sourceAspect = width / height;

  const targetAspect = getAspectRatioValue(targetAspectRatio);

  if (targetAspect >= sourceAspect) {
    // Target is wider or same - use full height, crop width
    const targetHeight = height;
    const targetWidth = height * targetAspect;
    return {
      x: (width - targetWidth) / 2,
      y: 0,
      width: targetWidth,
      height: targetHeight,
    };
  } else {
    // Target is narrower - use full width, crop height
    const targetWidth = width;
    const targetHeight = width / targetAspect;
    return {
      x: 0,
      y: (height - targetHeight) / 2,
      width: targetWidth,
      height: targetHeight,
    };
  }
};

/**
 * Get aspect ratio numeric value
 * @pure
 */
export const getAspectRatioValue = (ratio: AspectRatio): number => {
  switch (ratio) {
    case 'video':
      return 16 / 9;
    case 'square':
      return 1;
    case 'portrait':
      return 3 / 4;
  }
};

/**
 * Get aspect ratio CSS class
 * @pure
 */
export const getAspectRatioClass = (ratio?: AspectRatio): string => {
  switch (ratio) {
    case 'square':
      return 'aspect-square';
    case 'portrait':
      return 'aspect-[3/4]';
    case 'video':
    default:
      return 'aspect-video';
  }
};
