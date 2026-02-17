import type { PhotoFilter } from '../../core/types';

/**
 * Default edit settings
 */
export const DEFAULT_EDIT_SETTINGS = {
  brightness: 0,
  contrast: 0,
  filter: 'none' as PhotoFilter,
};

/**
 * Get filter CSS string
 */
export const getFilterStyle = (
  brightness: number,
  contrast: number,
  filter: PhotoFilter
): string => {
  const filters: string[] = [];

  // Brightness: -100 to 100, default 0
  if (brightness !== 0) {
    filters.push(`brightness(${1 + brightness / 100})`);
  }

  // Contrast: -100 to 100, default 0
  if (contrast !== 0) {
    filters.push(`contrast(${1 + contrast / 100})`);
  }

  // Preset filters
  switch (filter) {
    case 'grayscale':
      filters.push('grayscale(100%)');
      break;
    case 'sepia':
      filters.push('sepia(100%)');
      break;
    case 'vivid':
      filters.push('saturate(150%)');
      break;
    case 'warm':
      filters.push('sepia(20%) saturate(110%)');
      break;
    case 'cool':
      filters.push('hue-rotate(180deg) saturate(80%)');
      break;
    case 'dramatic':
      filters.push('contrast(120%) saturate(120%) brightness(90%)');
      break;
    case 'none':
    default:
      // No additional filter
      break;
  }

  return filters.join(' ');
};

/**
 * Apply filters to canvas and return data URL
 */
export const applyFiltersToImage = async (
  dataUrl: string,
  brightness: number,
  contrast: number,
  filter: PhotoFilter
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Apply filters
      ctx.filter = getFilterStyle(brightness, contrast, filter);
      ctx.drawImage(img, 0, 0);

      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
};

/**
 * Filter options for UI
 */
export const FILTER_OPTIONS: Array<{ value: PhotoFilter; label: string; preview?: string }> = [
  { value: 'none', label: '원본' },
  { value: 'grayscale', label: '흑백' },
  { value: 'sepia', label: '세피아' },
  { value: 'vivid', label: '비비드' },
  { value: 'warm', label: '따뜻함' },
  { value: 'cool', label: '차가움' },
  { value: 'dramatic', label: '드라마틱' },
];
