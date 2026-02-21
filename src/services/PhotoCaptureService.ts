import type { CaptureOptions } from '../core/types';
import { calculateCropRegion } from '../lib/utils/aspect-ratio.utils';
import {
  createCanvas,
  getCanvasContext,
  drawImageFromVideo,
  drawImageFromCanvas,
  applyHorizontalFlip,
  canvasToDataURL,
  getVideoDimensions,
  limitDimensions,
} from '../lib/utils/canvas.utils';

// Maximum image dimension to reduce storage size
const MAX_IMAGE_DIMENSION = 1920; // Full HD

/**
 * Photo Capture Service
 * Single Responsibility: Capture photos from video with transformations
 */
export class PhotoCaptureService {
  capture(video: HTMLVideoElement, options: CaptureOptions): string {
    const videoDimensions = getVideoDimensions(video);

    const crop = calculateCropRegion(videoDimensions, options.aspectRatio);

    // Limit output dimensions to reduce storage size
    const limitedDimensions = limitDimensions(
      { width: crop.width, height: crop.height },
      MAX_IMAGE_DIMENSION
    );

    const canvas = createCanvas(limitedDimensions);
    const context = getCanvasContext(canvas);

    if (options.facingMode === 'user') {
      this.captureWithMirror(video, context, videoDimensions, crop, limitedDimensions);
    } else {
      drawImageFromVideo(context, video, crop, limitedDimensions);
    }

    return canvasToDataURL(canvas, options.quality ?? 0.8);
  }

  private captureWithMirror(
    video: HTMLVideoElement,
    context: CanvasRenderingContext2D,
    videoDimensions: { width: number; height: number },
    crop: { x: number; y: number; width: number; height: number },
    destination: { width: number; height: number }
  ): void {
    const tempCanvas = createCanvas(videoDimensions);
    const tempContext = getCanvasContext(tempCanvas);

    applyHorizontalFlip(tempContext, videoDimensions.width);
    tempContext.drawImage(video, 0, 0, videoDimensions.width, videoDimensions.height);

    drawImageFromCanvas(context, tempCanvas, crop, destination);
  }
}

/**
 * Singleton instance
 */
export const photoCaptureService = new PhotoCaptureService();
