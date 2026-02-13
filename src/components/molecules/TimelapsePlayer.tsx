import { useState, useRef, useEffect } from 'react';
import type { Photo } from '../../types';

interface TimelapsePlayerProps {
  photos: Photo[];
  onClose: () => void;
}

export const TimelapsePlayer = ({ photos, onClose }: TimelapsePlayerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fps, setFps] = useState(10);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const play = () => {
    setIsPlaying(true);
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= photos.length - 1) {
          setIsPlaying(false);
          return 0;
        }
        return prev + 1;
      });
    }, 1000 / fps);
  };

  const pause = () => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  if (photos.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p>재생할 사진이 없습니다</p>
      </div>
    );
  }

  const currentPhoto = photos[currentIndex];

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* 닫기 버튼 */}
        <div className="flex justify-end mb-4">
          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
          >
            닫기
          </button>
        </div>

        {/* 메인 이미지 */}
        <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
          <img
            src={currentPhoto.dataUrl}
            alt={currentPhoto.date}
            className="w-full h-full object-contain"
          />
          <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
            <p className="text-white text-sm">{currentPhoto.date}</p>
            <p className="text-gray-300 text-xs">
              {currentIndex + 1} / {photos.length}
            </p>
          </div>
        </div>

        {/* 컨트롤 */}
        <div className="mt-4 bg-gray-800 rounded-lg p-4">
          {/* 진행 바 */}
          <div className="mb-4">
            <input
              type="range"
              min={0}
              max={photos.length - 1}
              value={currentIndex}
              onChange={(e) => {
                setCurrentIndex(Number(e.target.value));
                if (isPlaying) pause();
              }}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* 재생 컨트롤 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {!isPlaying ? (
                <button
                  onClick={play}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full"
                  aria-label="재생"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={pause}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full"
                  aria-label="일시정지"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                </button>
              )}
            </div>

            <div className="flex items-center gap-4">
              <label className="text-white text-sm">속도:</label>
              <select
                value={fps}
                onChange={(e) => setFps(Number(e.target.value))}
                className="bg-gray-700 text-white rounded px-3 py-2"
              >
                <option value={5}>5 FPS (느림)</option>
                <option value={10}>10 FPS</option>
                <option value={15}>15 FPS</option>
                <option value={30}>30 FPS (빠름)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
