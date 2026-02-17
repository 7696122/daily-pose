import { useEffect, useState } from 'react';
import { Image as ImageIcon, RotateCw, Camera as CameraIcon, Settings } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import { startCamera, stopCamera, capturePhoto } from '../../lib/camera';
import { savePhoto } from '../../lib/indexedDB';
import { formatDate } from '../../lib/utils';
import { OverlayCamera } from '../molecules';
import { Button } from '../atoms';

// Always use fullscreen video ratio
const ASPECT_RATIO = 'video' as const;

export const CameraPage = () => {
  const [isCapturing, setIsCapturing] = useState(false);

  const {
    stream,
    photos,
    overlayOpacity,
    facingMode,
    setStream,
    setCameraActive,
    setOverlayOpacity,
    addPhoto,
    setCurrentView,
    setFacingMode,
  } = useAppStore();

  const latestPhoto = photos.length > 0 ? photos[photos.length - 1] : null;

  useEffect(() => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack && videoTrack.readyState === 'ended') {
        handleRestartCamera();
      }
    }
  }, [stream]);

  const handleRestartCamera = async () => {
    try {
      const mediaStream = await startCamera(facingMode);
      setStream(mediaStream);
      setCameraActive(true);
    } catch (error) {
      console.error('카메라 재시작 실패:', error);
    }
  };

  const handleStartCamera = async () => {
    try {
      const mediaStream = await startCamera(facingMode);
      setStream(mediaStream);
      setCameraActive(true);
    } catch (error) {
      alert(error instanceof Error ? error.message : '카메라를 시작할 수 없습니다.');
    }
  };

  const handleSwitchCamera = async () => {
    if (stream) {
      stopCamera(stream);
    }

    const newFacingMode: 'user' | 'environment' = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);

    try {
      const mediaStream = await startCamera(newFacingMode);
      setStream(mediaStream);
    } catch (error) {
      alert(error instanceof Error ? error.message : '카메라를 전환할 수 없습니다.');
    }
  };

  const handleCapture = async () => {
    const videoElement = document.querySelector('video');
    if (!videoElement) return;

    setIsCapturing(true);

    try {
      const dataUrl = capturePhoto(videoElement as HTMLVideoElement, facingMode, ASPECT_RATIO);

      const photo = {
        id: `photo-${Date.now()}`,
        dataUrl,
        timestamp: Date.now(),
        date: formatDate(Date.now()),
        aspectRatio: ASPECT_RATIO,
      };

      await savePhoto(photo);
      addPhoto(photo);

      await new Promise((resolve) => setTimeout(resolve, 200));
    } catch (error) {
      alert('사진 저장에 실패했습니다.');
      console.error(error);
    } finally {
      setIsCapturing(false);
    }
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stopCamera(stream);
      }
    };
  }, [stream]);

  return (
    <div className="flex flex-col h-dvh bg-black">
      {!stream ? (
        // 초기 화면
        <div className="flex flex-col items-center justify-center h-full px-6">
          <div className="w-32 h-32 rounded-full bg-white/5 flex items-center justify-center mb-8">
            <CameraIcon className="w-16 h-16 text-gray-500" />
          </div>
          <h2 className="text-2xl font-bold mb-3">카메라</h2>
          <p className="text-gray-500 mb-8 text-center">
            {photos.length === 0 ? '첫 사진을 찍어보세요' : `${photos.length + 1}번째 사진`}
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={handleStartCamera}
          >
            카메라 시작
          </Button>
        </div>
      ) : (
        <>
          {/* 카메라 뷰 - 전체 화면 */}
          <div className="flex-1 relative overflow-hidden bg-black">
            <OverlayCamera
              stream={stream}
              overlayImage={latestPhoto?.dataUrl || null}
              overlayOpacity={overlayOpacity}
              onOpacityChange={setOverlayOpacity}
              aspectRatio={ASPECT_RATIO}
              facingMode={facingMode}
              fullscreen={true}
            />
          </div>

          {/* 하단 컨트롤 바 - iOS 카메라 스타일 */}
          <div className="bg-black/80 backdrop-blur-lg relative z-50">
            <div className="flex items-end justify-center px-6 pb-6 pt-4">
              {/* 좌측: 갤러리 */}
              <div className="flex items-center gap-4 mr-6">
                {/* 갤러리 미리보기 버튼 */}
                <button
                  onClick={() => setCurrentView('gallery')}
                  className="relative"
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-white/30">
                    {latestPhoto ? (
                      <img
                        src={latestPhoto.dataUrl}
                        alt="최근 사진"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-white/10">
                        <ImageIcon className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>
                  {photos.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 rounded-full text-[10px] flex items-center justify-center font-medium">
                      {photos.length}
                    </span>
                  )}
                </button>
              </div>

              {/* 중앙: 촬영 버튼 */}
              <button
                onClick={handleCapture}
                disabled={isCapturing}
                className={`
                  relative w-20 h-20 rounded-full
                  border-4 border-white
                  flex items-center justify-center
                  transition-all duration-100
                  ${isCapturing ? 'scale-90' : 'active:scale-90'}
                `}
                aria-label="사진 촬영"
              >
                <div className="w-16 h-16 rounded-full bg-white transition-all duration-100" />
              </button>

              {/* 우측: 카메라 전환 & 설정 */}
              <div className="ml-6 flex flex-col gap-3">
                <button
                  onClick={handleSwitchCamera}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
                >
                  <RotateCw className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentView('settings')}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 안전 영역 */}
            <div className="h-safe-area-inset-bottom" />
          </div>
        </>
      )}

      {/* 촬영 플래시 */}
      {isCapturing && (
        <div className="fixed inset-0 bg-white z-50 pointer-events-none" />
      )}
    </div>
  );
};
