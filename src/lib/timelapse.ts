import type { Photo } from '../types';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

// 보간 모드 타입
export type InterpolationMode = 'none' | 'crossfade' | 'mci';

// Canvas와 MediaRecorder를 사용한 타임랩스 생성
export const createTimelapse = async (
  photos: Photo[],
  options: {
    fps?: number;
    interpolation?: InterpolationMode;
    interpolationFactor?: number; // 2 = 2배 프레임, 4 = 4배 프레임
    onProgress?: (progress: number) => void;
  } = {}
): Promise<Blob> => {
  const {
    fps = 30,
    interpolation = 'crossfade',
    interpolationFactor = 2,
    onProgress,
  } = options;

  // 보간이 없으면 기존 방식 사용
  if (interpolation === 'none') {
    return createBasicTimelapse(photos, fps, onProgress);
  }

  // 크로스페이드 보간 사용
  return createCrossfadeTimelapse(photos, fps, interpolationFactor, onProgress);
};

// 기본 타임랩스 (보간 없음)
const createBasicTimelapse = async (
  photos: Photo[],
  fps: number,
  onProgress?: (progress: number) => void
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    (async () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('캔버스 컨텍스트를 생성할 수 없습니다.'));
          return;
        }

        const firstImage = await loadImage(photos[0].dataUrl);
        canvas.width = firstImage.width;
        canvas.height = firstImage.height;

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

        mediaRecorder.start();

        const frameDuration = 1000 / fps;

        for (let i = 0; i < photos.length; i++) {
          const img = await loadImage(photos[i].dataUrl);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          if (onProgress) {
            onProgress(((i + 1) / photos.length) * 100);
          }

          await new Promise((resolve) => setTimeout(resolve, frameDuration));
        }

        mediaRecorder.stop();
      } catch (error) {
        reject(error);
      }
    })();
  });
};

// 크로스페이드 보간 타임랩스
const createCrossfadeTimelapse = async (
  photos: Photo[],
  fps: number,
  interpolationFactor: number,
  onProgress?: (progress: number) => void
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    (async () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('캔버스 컨텍스트를 생성할 수 없습니다.'));
          return;
        }

        const firstImage = await loadImage(photos[0].dataUrl);
        canvas.width = firstImage.width;
        canvas.height = firstImage.height;

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

        mediaRecorder.start();

        const frameDuration = 1000 / fps;
        const totalFrames = photos.length + (photos.length - 1) * interpolationFactor;
        let currentFrame = 0;

        // 각 사진과 다음 사진 사이에 보간 프레임 생성
        for (let i = 0; i < photos.length - 1; i++) {
          const img1 = await loadImage(photos[i].dataUrl);
          const img2 = await loadImage(photos[i + 1].dataUrl);

          // 현재 프레임 그리기
          ctx.drawImage(img1, 0, 0, canvas.width, canvas.height);
          currentFrame++;
          if (onProgress) {
            onProgress((currentFrame / totalFrames) * 100);
          }
          await new Promise((resolve) => setTimeout(resolve, frameDuration));

          // 보간 프레임 그리기 (크로스페이드)
          for (let j = 1; j <= interpolationFactor; j++) {
            const alpha = j / (interpolationFactor + 1);

            // 크로스페이드 효과
            ctx.globalAlpha = 1;
            ctx.drawImage(img1, 0, 0, canvas.width, canvas.height);
            ctx.globalAlpha = alpha;
            ctx.drawImage(img2, 0, 0, canvas.width, canvas.height);
            ctx.globalAlpha = 1;

            currentFrame++;
            if (onProgress) {
              onProgress((currentFrame / totalFrames) * 100);
            }
            await new Promise((resolve) => setTimeout(resolve, frameDuration));
          }
        }

        // 마지막 프레임
        const lastImage = await loadImage(photos[photos.length - 1].dataUrl);
        ctx.drawImage(lastImage, 0, 0, canvas.width, canvas.height);
        await new Promise((resolve) => setTimeout(resolve, frameDuration));

        mediaRecorder.stop();
      } catch (error) {
        reject(error);
      }
    })();
  });
};

// FFmpeg를 사용한 고급 보간 (mci 모드)
export const createTimelapseWithFFmpeg = async (
  photos: Photo[],
  options: {
    fps?: number;
    interpolationFactor?: number;
    onProgress?: (progress: number) => void;
  } = {}
): Promise<Blob> => {
  const { fps = 30, interpolationFactor = 2, onProgress } = options;

  try {
    const ffmpeg = new FFmpeg();

    ffmpeg.on('log', ({ message }) => {
      console.log(message);
    });

    ffmpeg.on('progress', ({ progress }) => {
      if (onProgress) {
        onProgress(progress * 100);
      }
    });

    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    // 이미지 파일들을 FFmpeg에 쓰기
    for (let i = 0; i < photos.length; i++) {
      const data = await fetchFile(photos[i].dataUrl);
      await ffmpeg.writeFile(`input_${i.toString().padStart(4, '0')}.jpg`, data);
    }

    // FFmpeg 명령: minterpolate 필터 사용
    // fps=60: 60fps로 보간
    // mi_mode=mci: Motion Compensated Interpolation
    // mc_mode=aobmc: Adaptive Overlapped Block Motion Compensation
    await ffmpeg.exec([
      '-framerate', fps.toString(),
      '-i', 'input_%04d.jpg',
      '-vf', `minterpolate=fps=${fps * interpolationFactor}:mi_mode=mci:mc_mode=aobmc:me_mode=bidir`,
      '-c:v', 'libx264',
      '-preset', 'medium',
      '-crf', '23',
      '-pix_fmt', 'yuv420p',
      'output.mp4'
    ]);

    const data = await ffmpeg.readFile('output.mp4') as Uint8Array;
    const blob = new Blob([new Uint8Array(data)], { type: 'video/mp4' });

    // 정리
    for (let i = 0; i < photos.length; i++) {
      await ffmpeg.deleteFile(`input_${i.toString().padStart(4, '0')}.jpg`);
    }
    await ffmpeg.deleteFile('output.mp4');

    return blob;
  } catch (error) {
    throw new Error(`FFmpeg 처리 실패: ${error}`);
  }
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
