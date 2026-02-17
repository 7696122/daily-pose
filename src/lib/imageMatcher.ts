// 이미지 유사도 계산을 위한 유틸리티

/**
 * 두 이미지의 유사도를 계산합니다 (0~1 사이, 1이 완전 일치)
 */
export const calculateImageSimilarity = (
  image1DataUrl: string,
  image2DataUrl: string,
  sampleSize: number = 50 // 샘플링 크기 (성능을 위해)
): Promise<number> => {
  return new Promise((resolve, reject) => {
    const img1 = new Image();
    const img2 = new Image();

    img1.onload = () => {
      img2.onload = () => {
        try {
          const similarity = compareImages(img1, img2, sampleSize);
          resolve(similarity);
        } catch (error) {
          reject(error);
        }
      };
      img2.onerror = () => reject(new Error('Failed to load second image'));
      img2.src = image2DataUrl;
    };
    img1.onerror = () => reject(new Error('Failed to load first image'));
    img1.src = image1DataUrl;
  });
};

/**
 * 두 이미지 요소를 비교하여 유사도 계산
 */
const compareImages = (
  img1: HTMLImageElement,
  img2: HTMLImageElement,
  sampleSize: number
): number => {
  const canvas1 = document.createElement('canvas');
  const canvas2 = document.createElement('canvas');

  // 샘플링을 위한 작은 캔버스 사용
  canvas1.width = sampleSize;
  canvas1.height = sampleSize;
  canvas2.width = sampleSize;
  canvas2.height = sampleSize;

  const ctx1 = canvas1.getContext('2d');
  const ctx2 = canvas2.getContext('2d');

  if (!ctx1 || !ctx2) {
    throw new Error('Failed to get canvas context');
  }

  // 이미지를 작은 크기로 그려서 픽셀 데이터 얻기
  ctx1.drawImage(img1, 0, 0, sampleSize, sampleSize);
  ctx2.drawImage(img2, 0, 0, sampleSize, sampleSize);

  const data1 = ctx1.getImageData(0, 0, sampleSize, sampleSize).data;
  const data2 = ctx2.getImageData(0, 0, sampleSize, sampleSize).data;

  // 픽셀 단위 비교
  let totalDifference = 0;
  const pixelCount = sampleSize * sampleSize;

  for (let i = 0; i < data1.length; i += 4) {
    // RGB 차이 계산 (Alpha는 무시)
    const rDiff = data1[i] - data2[i];
    const gDiff = data1[i + 1] - data2[i + 1];
    const bDiff = data1[i + 2] - data2[i + 2];

    // 유클리드 거리
    const pixelDifference = Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
    totalDifference += pixelDifference;
  }

  // 최대 가능 차이 (255 * √3)
  const maxDifference = pixelCount * 255 * Math.sqrt(3);

  // 유사도 계산 (1 - 차이 비율)
  const similarity = 1 - totalDifference / maxDifference;

  return Math.max(0, Math.min(1, similarity));
};

/**
 * 비디오 요소와 이미지의 실시간 유사도 모니터링
 */
export const createSimilarityMonitor = (
  videoElement: HTMLVideoElement,
  targetImageDataUrl: string,
  threshold: number = 0.85, // 유사도 임계값 (0~1)
  sampleInterval: number = 500, // 체크 간격 (ms)
  onSimilarityChange?: (similarity: number) => void,
  onMatch?: () => void
) => {
  let intervalId: number | null = null;
  let isMatching = false;

  const checkSimilarity = async () => {
    try {
      // 현재 비디오 프레임 캡처
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      ctx.drawImage(videoElement, 0, 0);

      const currentFrameDataUrl = canvas.toDataURL('image/jpeg', 0.8);

      // 유사도 계산
      const similarity = await calculateImageSimilarity(currentFrameDataUrl, targetImageDataUrl, 30);

      if (onSimilarityChange) {
        onSimilarityChange(similarity);
      }

      // 임계값 이상이고 아직 매칭되지 않았으면 촬영
      if (similarity >= threshold && !isMatching) {
        isMatching = true;
        if (onMatch) {
          onMatch();
        }
      } else if (similarity < threshold) {
        isMatching = false;
      }
    } catch (error) {
      console.error('Similarity check error:', error);
    }
  };

  const start = () => {
    if (intervalId !== null) return;
    intervalId = window.setInterval(checkSimilarity, sampleInterval);
  };

  const stop = () => {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
    isMatching = false;
  };

  const updateThreshold = (newThreshold: number) => {
    threshold = newThreshold;
  };

  return {
    start,
    stop,
    updateThreshold,
    isRunning: () => intervalId !== null,
  };
};
