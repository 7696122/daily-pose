import { useEffect, useState, useRef } from 'react';
import { Camera, CameraOff, Image as ImageIcon, RefreshCw, Maximize2, X, Crop } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import { startCamera, stopCamera, capturePhoto } from '../../lib/camera';
import { savePhoto } from '../../lib/indexedDB';
import { formatDate } from '../../lib/utils';
import { OverlayCamera } from '../molecules';

type AspectRatio = 'video' | 'square' | 'portrait';

const aspectRatioLabels: Record<AspectRatio, string> = {
  video: '16:9',
  square: '1:1',
  portrait: '3:4',
};

const aspectRatios: AspectRatio[] = ['video', 'square', 'portrait'];

export const CameraPage = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fullscreenRef = useRef<HTMLDivElement>(null);

  const {
    stream,
    photos,
    overlayOpacity,
    facingMode,
    aspectRatio,
    setStream,
    setCameraActive,
    setOverlayOpacity,
    addPhoto,
    setCurrentView,
    setFacingMode,
    setAspectRatio,
  } = useAppStore();

  // 가장 최근 사진을 가이드로 사용
  const latestPhoto = photos.length > 0 ? photos[photos.length - 1] : null;

  // stream이 유효한지 확인하고, 유효하지 않으면 다시 시작
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

  const handleStopCamera = () => {
    if (stream) {
      stopCamera(stream);
      setStream(null);
      setCameraActive(false);
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

  const toggleFullscreen = async () => {
    if (!fullscreenRef.current) return;

    try {
      if (isFullscreen) {
        await document.exitFullscreen();
      } else {
        await fullscreenRef.current.requestFullscreen();
      }
    } catch (error) {
      console.error('전체 화면 전환 실패:', error);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleCapture = async () => {
    const videoElement = document.querySelector('video');
    if (!videoElement) return;

    setIsCapturing(true);

    try {
      const dataUrl = capturePhoto(videoElement as HTMLVideoElement);

      const photo = {
        id: `photo-${Date.now()}`,
        dataUrl,
        timestamp: Date.now(),
        date: formatDate(Date.now()),
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
    <div className="flex flex-col h-dvh bg-black" ref={fullscreenRef}>
      {/* 상단 바 */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/80 backdrop-blur-sm z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('gallery')}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
          >
            <ImageIcon className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full text-xs flex items-center justify-center">
              {photos.length}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {stream && (
            <button
              onClick={handleStopCamera}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
            >
              <CameraOff className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* 카메라 뷰 */}
      <div className="flex-1 relative overflow-hidden">
        {!stream ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center">
              <div className="bg-gray-900 rounded-full p-6 mb-6 inline-block">
                <Camera className="w-12 h-12 text-gray-500" />
              </div>
              <h2 className="text-lg font-medium mb-3 text-white">카메라 시작</h2>
              <p className="text-gray-400 mb-6 text-sm">
                {photos.length === 0 ? '첫 사진을 찍어보세요' : `${photos.length + 1}번째 사진`}
              </p>
              <button
                onClick={handleStartCamera}
                className="px-8 py-3 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition-all"
              >
                시작하기
              </button>
            </div>
          </div>
        ) : (
          <>
            {isFullscreen ? (
              <>
                {/* 전체 화면 카메라 */}
                <div className="absolute inset-0">
                  <OverlayCamera
                    stream={stream}
                    overlayImage={latestPhoto?.dataUrl || null}
                    overlayOpacity={overlayOpacity}
                    onOpacityChange={setOverlayOpacity}
                    aspectRatio={aspectRatio}
                    fullscreen={true}
                    facingMode={facingMode}
                  />
                </div>

                {/* 상단 컨트롤 */}
                <div className="absolute top-0 left-0 right-0 flex justify-between items-start p-6 z-10">
                  <button
                    onClick={toggleFullscreen}
                    className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-black/60"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>

                  <button
                    onClick={handleSwitchCamera}
                    className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-black/60"
                  >
                    <RefreshCw className="w-6 h-6 text-white" />
                  </button>
                </div>

                {/* 하단 촬영 버튼 */}
                <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center pb-12 z-10" style={{ paddingBottom: 'max(3rem, env(safe-area-inset-bottom) + 1.5rem)' }}>
                  <button
                    onClick={handleCapture}
                    disabled={isCapturing}
                    className={`relative transition-all ${
                      isCapturing ? 'scale-90' : 'hover:scale-105 active:scale-95'
                    }`}
                    aria-label="사진 촬영"
                  >
                    <div className="w-24 h-24 rounded-full border-4 border-white bg-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full bg-white" />
                    </div>
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* 일반 모드 - fixed로 화면 꽉 차게 */}
                <div className="absolute inset-0 bg-black flex flex-col">
                  {/* 카메라 영역 */}
                  <div className="flex-1 flex items-center justify-center p-4">
                    <div className="w-full max-w-2xl">
                      <OverlayCamera
                        stream={stream}
                        overlayImage={latestPhoto?.dataUrl || null}
                        overlayOpacity={overlayOpacity}
                        onOpacityChange={setOverlayOpacity}
                        aspectRatio={aspectRatio}
                        facingMode={facingMode}
                      />
                    </div>
                  </div>

                  {/* 컨트롤 바 */}
                  <div className="bg-black/80 backdrop-blur-sm">
                    <div className="flex items-center justify-between px-6 py-4">
                      {/* 왼쪽: 비율 & 전체 화면 */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const currentIndex = aspectRatios.indexOf(aspectRatio);
                            const nextIndex = (currentIndex + 1) % aspectRatios.length;
                            setAspectRatio(aspectRatios[nextIndex]);
                          }}
                          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                          title={aspectRatioLabels[aspectRatio]}
                        >
                          <Crop className="w-5 h-5" />
                        </button>

                        <button
                          onClick={toggleFullscreen}
                          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                        >
                          <Maximize2 className="w-5 h-5" />
                        </button>
                      </div>

                      {/* 중앙: 촬영 버튼 */}
                      <button
                        onClick={handleCapture}
                        disabled={isCapturing}
                        className={`relative transition-all ${
                          isCapturing ? 'scale-90' : 'hover:scale-105 active:scale-95'
                        }`}
                        aria-label="사진 촬영"
                      >
                        <div className="w-16 h-16 rounded-full border-4 border-white bg-transparent" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-white" />
                        </div>
                      </button>

                      {/* 오른쪽: 카메라 전환 */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleSwitchCamera}
                          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                        >
                          <RefreshCw className="w-5 h-5" />
                        </button>

                        <div className="w-10 h-10" />
                      </div>
                    </div>

                    {/* 안전 영역 (하단 홈 인디케이터) */}
                    <div className="h-safe-area-inset-bottom" />
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* 촬영 플래시 */}
      {isCapturing && (
        <div className="fixed inset-0 bg-white z-50 animate-pulse pointer-events-none" />
      )}
    </div>
  );
};
