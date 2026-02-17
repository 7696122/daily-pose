/**
 * Facing Mode
 */
export type FacingMode = 'user' | 'environment';

/**
 * Camera Options
 */
export interface CameraOptions {
  readonly facingMode: FacingMode;
  readonly idealWidth?: number;
  readonly idealHeight?: number;
}

/**
 * Capture Options
 */
export interface CaptureOptions {
  readonly aspectRatio: 'video' | 'square' | 'portrait';
  readonly facingMode: FacingMode;
  readonly quality?: number;
}
