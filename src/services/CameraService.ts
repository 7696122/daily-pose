import type { ICameraService, CameraOptions } from '../core/types';

/**
 * Camera Service Implementation
 * Single Responsibility: Manage camera stream lifecycle
 */
export class CameraService implements ICameraService {
  private readonly DEFAULT_WIDTH = 1920;
  private readonly DEFAULT_HEIGHT = 1080;

  async start(options: CameraOptions): Promise<MediaStream> {
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: options.facingMode,
          width: { ideal: options.idealWidth ?? this.DEFAULT_WIDTH },
          height: { ideal: options.idealHeight ?? this.DEFAULT_HEIGHT },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      return stream;
    } catch (error) {
      console.error('Camera access failed:', error);
      throw new Error('Cannot access camera. Please check permissions.');
    }
  }

  stop(stream: MediaStream): void {
    stream.getTracks().forEach((track) => track.stop());
  }
}

/**
 * Singleton instance
 */
export const cameraService = new CameraService();
