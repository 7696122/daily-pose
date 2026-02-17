import type { Photo } from '../../core/types';

/**
 * Create GIF from photos
 */
export const createGIF = async (photos: Photo[], duration = 500): Promise<Blob> => {
  if (photos.length === 0) throw new Error('No photos to create GIF');

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }

    // Load first image to get dimensions
    const firstImage = new Image();
    firstImage.onload = () => {
      canvas.width = firstImage.width;
      canvas.height = firstImage.height;

      // Use a simple approach - create a video from frames
      const stream = canvas.captureStream(10); // 10 FPS

      // For now, we'll create a WebM video (better browser support than GIF)
      // GIF creation typically requires external libraries like gif.js
      const videoChunks: Blob[] = [];
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
      });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) videoChunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(videoChunks, { type: 'video/webm' });
        resolve(blob);
      };

      mediaRecorder.start();

      // Draw each frame
      let index = 0;
      const drawFrame = () => {
        if (index >= photos.length) {
          mediaRecorder.stop();
          return;
        }

        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          index++;
          setTimeout(drawFrame, duration);
        };
        img.onerror = () => {
          index++;
          setTimeout(drawFrame, duration);
        };
        img.src = photos[index].dataUrl;
      };

      drawFrame();
    };

    firstImage.onerror = () => reject(new Error('Failed to load first image'));
    firstImage.src = photos[0].dataUrl;
  });
};

/**
 * Share to social media
 */
export const shareToSocial = async (blob: Blob, filename: string) => {
  // Check if Web Share API is supported
  if (navigator.share) {
    const file = new File([blob], filename, { type: blob.type });

    try {
      await navigator.share({
        files: [file],
        title: 'Daily Pose',
        text: '나의 변화를 기록한 타임랩스입니다!',
      });
      return true;
    } catch (error) {
      // User cancelled or error
      return false;
    }
  }

  // Fallback: Download the file
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
  return true;
};

/**
 * Download blob as file
 */
export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
