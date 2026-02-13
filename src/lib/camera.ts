// 카메라 스트림 시작
export const startCamera = async (
  constraints: MediaStreamConstraints = {
    video: {
      facingMode: 'user', // 모바일에서 전면 카메라 사용
      width: { ideal: 1920 },
      height: { ideal: 1080 },
    },
    audio: false,
  }
): Promise<MediaStream> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    return stream;
  } catch (error) {
    console.error('카메라 접근 실패:', error);
    throw new Error('카메라에 접근할 수 없습니다. 권한을 확인해주세요.');
  }
};

// 카메라 스트림 중지
export const stopCamera = (stream: MediaStream): void => {
  stream.getTracks().forEach((track) => {
    track.stop();
  });
};

// 비디오 요소에서 캡처
export const capturePhoto = (videoElement: HTMLVideoElement): string => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('캔버스 컨텍스트를 생성할 수 없습니다.');
  }

  // 비디오와 같은 크기로 캔버스 설정
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;

  // 현재 비디오 프레임을 캔버스에 그리기
  context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

  // Base64 데이터 URL로 변환
  return canvas.toDataURL('image/jpeg', 0.95);
};
