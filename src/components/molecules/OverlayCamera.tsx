import { useRef } from 'react';
import { VideoPlayer, Slider } from '../atoms';

interface OverlayCameraProps {
  stream: MediaStream | null;
  overlayImage: string | null;
  overlayOpacity: number;
  onOpacityChange: (opacity: number) => void;
  className?: string;
}

export const OverlayCamera = ({
  stream,
  overlayImage,
  overlayOpacity,
  onOpacityChange,
  className = '',
}: OverlayCameraProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className={`relative aspect-video bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      {/* 메인 카메라 피드 */}
      <VideoPlayer stream={stream} className="absolute inset-0" />

      {/* 가이드 오버레이 */}
      {overlayImage && (
        <img
          src={overlayImage}
          alt="가이드 이미지"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ opacity: overlayOpacity }}
        />
      )}

      {/* 오버레이 투명도 컨트롤 */}
      {overlayImage && (
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
};
