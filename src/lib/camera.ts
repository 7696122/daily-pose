// Camera module - Refactored to use service layer
import { CameraService, PhotoCaptureService } from '../services';
import type { CaptureOptions } from '../core/types';

// Export classes
export { CameraService, PhotoCaptureService };

// Singleton instances
const cameraServiceInstance = new CameraService();
const photoCaptureServiceInstance = new PhotoCaptureService();

// Backward compatibility exports
export const startCamera = (facingMode: 'user' | 'environment' = 'user') =>
  cameraServiceInstance.start({ facingMode });

export const stopCamera = (stream: MediaStream) => cameraServiceInstance.stop(stream);

export const capturePhoto = (
  videoElement: HTMLVideoElement,
  facingMode: 'user' | 'environment' = 'user',
  aspectRatio: 'video' | 'square' | 'portrait' = 'video'
): string =>
  photoCaptureServiceInstance.capture(videoElement, {
    aspectRatio,
    facingMode,
    quality: 0.95,
  } as CaptureOptions);

// Export singleton instances for direct use
export const cameraService = cameraServiceInstance;
export const photoCaptureService = photoCaptureServiceInstance;
