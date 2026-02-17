import { forwardRef, useState } from 'react';
import { Grid3x3, Layers } from 'lucide-react';
import { VideoPlayer, Slider } from '../atoms';

type AspectRatio = 'video' | 'square' | 'portrait';

interface OverlayCameraProps {
  stream: MediaStream | null;
  overlayImage: string | null;
  overlayOpacity: number;
  onOpacityChange: (opacity: number) => void;
  aspectRatio?: AspectRatio;
  className?: string;
  fullscreen?: boolean;
  facingMode?: 'user' | 'environment';
  showGrid?: boolean;
  onToggleGrid?: () => void;
  onToggleOverlay?: () => void;
}

const aspectRatioClasses: Record<AspectRatio, string> = {
  video: 'aspect-video',
  square: 'aspect-square',
  portrait: 'aspect-[3/4]',
};

export const OverlayCamera = forwardRef<HTMLVideoElement, OverlayCameraProps>(({
  stream,
  overlayImage,
  overlayOpacity,
  onOpacityChange,
  aspectRatio = 'video',
  className = '',
  fullscreen = false,
  facingMode = 'user',
  showGrid = false,
  onToggleGrid,
  onToggleOverlay,
}, ref) => {
  const [showOverlay, setShowOverlay] = useState(true);

  const handleToggleOverlay = () => {
    setShowOverlay(!showOverlay);
    onToggleOverlay?.();
  };

  return (
    <div className={`${fullscreen ? 'absolute inset-0' : 'relative'} bg-gray-900 overflow-hidden ${fullscreen ? '' : `w-full rounded-lg ${aspectRatioClasses[aspectRatio]}`} ${className}`}>
      {/* 메인 카메라 피드 */}
      <VideoPlayer stream={stream} className="absolute inset-0" ref={ref} facingMode={facingMode} />

      {/* 그리드 오버레이 */}
      {showGrid && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="border border-white/20" />
            ))}
          </div>
        </div>
      )}

      {/* 비율 가이드 오버레이 (전체 화면일 때만) */}
      {fullscreen && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={`${aspectRatioClasses[aspectRatio]} w-full border-2 border-white/30`} />
        </div>
      )}

      {/* 가이드 오버레이 (항상 표시) */}
      {overlayImage && showOverlay && (
        <img
          src={overlayImage}
          alt="가이드 이미지"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ opacity: overlayOpacity }}
        />
      )}

      {/* 상단 컨트롤 툴바 */}
      {fullscreen && (
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          {/* 그리드 토글 */}
          {onToggleGrid && (
            <button
              onClick={onToggleGrid}
              className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-all ${
                showGrid ? 'bg-blue-600 text-white' : 'bg-black/50 text-white'
              }`}
              aria-label="그리드 토글"
            >
              <Grid3x3 className="w-5 h-5" />
            </button>
          )}

          {/* 오버레이 토글 */}
          {overlayImage && onToggleOverlay && (
            <button
              onClick={handleToggleOverlay}
              className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-all ${
                showOverlay ? 'bg-blue-600 text-white' : 'bg-black/50 text-white'
              }`}
              aria-label="오버레이 토글"
            >
              <Layers className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      {/* 하단 컨트롤 - 오버레이 투명도 */}
      {overlayImage && showOverlay && (
        <div className={`absolute bg-black/70 backdrop-blur-sm rounded-lg p-3 ${fullscreen ? 'bottom-4 left-4 right-4' : 'bottom-4 left-4 right-4'}`}>
          <Slider
            value={overlayOpacity}
            onChange={onOpacityChange}
            min={0}
            max={1}
            step={0.05}
            label="가이드 투명도"
          />
        </div>
      )}
    </div>
  );
});
