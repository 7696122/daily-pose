import { useRef, useEffect, useState } from 'react';
import { Camera, CameraOff, Image as ImageIcon } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import { startCamera, stopCamera, capturePhoto } from '../../lib/camera';
import { savePhoto } from '../../lib/indexedDB';
import { formatDate } from '../../lib/utils';
import { Button } from '../atoms';
import { OverlayCamera } from '../molecules';

export const CameraPage = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const {
    stream,
    photos,
    overlayOpacity,
    setStream,
    setCameraActive,
    setOverlayOpacity,
    addPhoto,
    setCurrentView,
  } = useAppStore();

  // 가장 최근 사진을 가이드로 사용
  const latestPhoto = photos.length > 0 ? photos[photos.length - 1] : null;

  // 카메라 시작
  const handleStartCamera = async () => {
    try {
      const mediaStream = await startCamera();
      setStream(mediaStream);
      setCameraActive(true);
    } catch (error) {
      alert(error instanceof Error ? error.message : '카메라를 시작할 수 없습니다.');
    }
  };

  // 카메라 중지
  const handleStopCamera = () => {
    if (stream) {
      stopCamera(stream);
      setStream(null);
      setCameraActive(false);
    }
  };

  // 사진 촬영
  const handleCapture = async () => {
    if (!videoRef.current) return;

    setIsCapturing(true);

    try {
      // 비디오에서 캡처
      const dataUrl = capturePhoto(videoRef.current);

      // 사진 데이터 생성
      const photo = {
        id: `photo-${Date.now()}`,
        dataUrl,
        timestamp: Date.now(),
        date: formatDate(Date.now()),
      };

      // IndexedDB에 저장
      await savePhoto(photo);

      // 상태 업데이트
      addPhoto(photo);

      // 플래시 효과
      await new Promise((resolve) => setTimeout(resolve, 200));
    } catch (error) {
      alert('사진 저장에 실패했습니다.');
      console.error(error);
    } finally {
      setIsCapturing(false);
    }
  };

  // 컴포넌트 언마운트 시 카메라 정리
  useEffect(() => {
    return () => {
      if (stream) {
        stopCamera(stream);
      }
    };
  }, [stream]);

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">📸 Daily Pose</h1>
        <div className="flex items-center gap-2">
          {stream && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleStopCamera}
            >
              <CameraOff className="w-4 h-4 mr-2" />
              카메라 끄기
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCurrentView('gallery')}
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            갤러리 ({photos.length})
          </Button>
        </div>
      </div>

      {/* 카메라 뷰 */}
      <div className="flex-1 flex items-center justify-center">
        {!stream ? (
          <div className="text-center">
            <div className="bg-gray-800 rounded-full p-8 mb-6 inline-block">
              <Camera className="w-16 h-16 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">카메라를 시작하세요</h2>
            <p className="text-gray-400 mb-6">
              {photos.length === 0
                ? '첫 번째 사진을 찍어볼까요?'
                : `${photos.length + 1}번째 사진을 찍어볼까요?`}
            </p>
            <Button onClick={handleStartCamera} size="lg">
              <Camera className="w-5 h-5 mr-2" />
              카메라 켜기
            </Button>
          </div>
        ) : (
          <div className="w-full max-w-4xl">
            <OverlayCamera
              stream={stream}
              overlayImage={latestPhoto?.dataUrl || null}
              overlayOpacity={overlayOpacity}
              onOpacityChange={setOverlayOpacity}
            />

            {/* 촬영 버튼 */}
            <div className="flex justify-center mt-6">
              <button
                onClick={handleCapture}
                disabled={isCapturing}
                className={`w-20 h-20 rounded-full border-4 border-white transition-all ${
                  isCapturing
                    ? 'bg-gray-600 scale-90'
                    : 'bg-white hover:scale-105 active:scale-95'
                }`}
                aria-label="사진 촬영"
              >
                <div className="w-16 h-16 rounded-full bg-gray-900" />
              </button>
            </div>

            {/* 팁 */}
            {latestPhoto && (
              <div className="mt-4 text-center text-sm text-gray-400">
                💡 반투명 이미지는 지난번 포 가이드예요
              </div>
            )}
          </div>
        )}
      </div>

      {/* 촬영 플래시 */}
      {isCapturing && (
        <div className="fixed inset-0 bg-white z-50 animate-pulse" />
      )}
    </div>
  );
};
