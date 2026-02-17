import { useState, useRef } from 'react';
import type { MouseEvent, TouchEvent } from 'react';
import { X } from 'lucide-react';
import type { Photo } from '../../types';
import { IconButton } from '../atoms/IconButton';

interface BeforeAfterSliderProps {
  beforePhoto: Photo;
  afterPhoto: Photo;
  onClose: () => void;
}

export const BeforeAfterSlider = ({
  beforePhoto,
  afterPhoto,
  onClose,
}: BeforeAfterSliderProps) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const daysDiff = Math.ceil(
    (afterPhoto.timestamp - beforePhoto.timestamp) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-center flex-1">
            <h2 className="text-xl font-bold text-white">비포 & 애프터</h2>
            <p className="text-sm text-gray-400">
              {daysDiff > 0 ? `${daysDiff}일의 변화` : '당일 비교'}
            </p>
          </div>
          <IconButton variant="ghost" onClick={onClose} aria-label="닫기">
            <X />
          </IconButton>
        </div>

        {/* Slider Container */}
        <div
          ref={containerRef}
          className="relative aspect-[3/4] rounded-2xl overflow-hidden select-none"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchMove={handleTouchMove}
        >
          {/* Before Image (Bottom) */}
          <img
            src={beforePhoto.dataUrl}
            alt="Before"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* After Image (Top - Clipped) */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          >
            <img
              src={afterPhoto.dataUrl}
              alt="After"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ left: `-${100 - sliderPosition}%` }}
            />
          </div>

          {/* Slider Handle */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize"
            style={{ left: `${sliderPosition}%` }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
              <div className="flex gap-0.5">
                <div className="w-0.5 h-3 bg-gray-800 rounded-sm" />
                <div className="w-0.5 h-3 bg-gray-800 rounded-sm" />
              </div>
            </div>
          </div>

          {/* Labels */}
          <div className="absolute bottom-4 left-4 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg">
            <p className="text-xs text-white font-medium">첫 사진</p>
            <p className="text-xs text-gray-300">{formatDate(beforePhoto.timestamp)}</p>
          </div>

          <div className="absolute bottom-4 right-4 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg">
            <p className="text-xs text-white font-medium">최근</p>
            <p className="text-xs text-gray-300">{formatDate(afterPhoto.timestamp)}</p>
          </div>
        </div>

        {/* Instructions */}
        <p className="text-center text-sm text-gray-500 mt-4">
          ← 스와이프해서 비교 →
        </p>
      </div>
    </div>
  );
};
