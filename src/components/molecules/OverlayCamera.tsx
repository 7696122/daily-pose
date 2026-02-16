import { forwardRef } from 'react';
import { VideoPlayer, Slider } from '../atoms';

type AspectRatio = 'video' | 'square' | 'portrait';

interface OverlayCameraProps {
  stream: MediaStream | null;
  overlayImage: string | null;
  overlayOpacity: number;
  onOpacityChange: (opacity: number) => void;
  aspectRatio: AspectRatio;
  className?: string;
  fullscreen?: boolean;
  facingMode?: 'user' | 'environment';
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
}, ref) => {
  return (
    <div className={`relative bg-gray-900 overflow-hidden ${fullscreen ? 'w-full h-full rounded-none' : `w-full rounded-lg ${aspectRatioClasses[aspectRatio]}`} ${className}`}>
      {/* 메인 카메라 피드 */}
      <VideoPlayer stream={stream} className="absolute inset-0" ref={ref} facingMode={facingMode} />

      {/* 가이드 오버레이 */}
      {overlayImage && !fullscreen && (
        <img
          src={overlayImage}
          alt="가이드 이미지"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ opacity: overlayOpacity }}
        />
      )}

      {/* 오버레이 투명도 컨트롤 (전체 화면 아닐 때만) */}
      {overlayImage && !fullscreen && (
        <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3">
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
