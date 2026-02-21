/**
 * Stores Index
 * Exports all Zustand stores following Single Responsibility Principle
 */

// Individual stores
export { useCameraStore } from './useCameraStore';
export { useGalleryStore } from './useGalleryStore';
export { useLanguageStore } from './useLanguageStore';
export { useNavigationStore } from './useNavigationStore';
export { useOverlayStore } from './useOverlayStore';
export { useProjectStore } from './useProjectStore';

// Legacy store - use individual stores instead
// TODO: Deprecate after migrating all components to individual stores
export { useAppStore } from './useAppStore';
