import type { Photo } from '../types';

// Canvas와 MediaRecorder를 사용한 타임랩스 생성
export const createTimelapse = async (
  photos: Photo[],
  fps: number = 30,
  onProgress?: (progress: number) => void
): Promise<Blob> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Canvas 생성
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('캔버스 컨텍스트를 생성할 수 없습니다.'));
        return;
      }

      // 첫 번째 사진으로 크기 설정
      const firstImage = await loadImage(photos[0].dataUrl);
      canvas.width = firstImage.width;
      canvas.height = firstImage.height;

      // MediaRecorder 설정
      const stream = canvas.captureStream(fps);
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 5000000,
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        resolve(blob);
      };

      mediaRecorder.onerror = (event) => {
        reject(event.error);
      };

      // 녹화 시작
      mediaRecorder.start();

      // 각 프레임 그리기
      const frameDuration = 1000 / fps; // ms per frame

      for (let i = 0; i < photos.length; i++) {
        const img = await loadImage(photos[i].dataUrl);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // 진행률 콜백
        if (onProgress) {
          onProgress(((i + 1) / photos.length) * 100);
        }

        // 프레임 지연
        await new Promise((resolve) => setTimeout(resolve, frameDuration));
      }

      // 녹화 중지
      mediaRecorder.stop();
    } catch (error) {
      reject(error);
    }
  });
};

// 이미지 로드 헬퍼
const loadImage = (dataUrl: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
};

// 다운로드 트리거
export const downloadTimelapse = (blob: Blob, filename: string = 'timelapse.webm'): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
