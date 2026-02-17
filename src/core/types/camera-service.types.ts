import type { CameraOptions } from './camera.types';

/**
 * Camera Service Port (Interface)
 */
export interface ICameraService {
  readonly start: (options: CameraOptions) => Promise<MediaStream>;
  readonly stop: (stream: MediaStream) => void;
}
