import { useState } from 'react';
import { Aperture, Grid3x3, Timer } from 'lucide-react';

interface CameraControlsProps {
  onToggleGrid: () => void;
  onToggleTimer: () => void;
  showGrid: boolean;
  showTimer: boolean;
  className?: string;
}

export const CameraControls = ({
  onToggleGrid,
  onToggleTimer,
  showGrid,
  showTimer,
  className = '',
}: CameraControlsProps) => {
  const [flashMode, setFlashMode] = useState<'off' | 'on' | 'auto'>('off');

  const toggleFlash = () => {
    setFlashMode((prev) => {
      if (prev === 'off') return 'on';
      if (prev === 'on') return 'auto';
      return 'off';
    });
  };

  return (
    <div className={`absolute right-4 top-4 flex flex-col gap-3 z-20 ${className}`}>
      {/* 그리드 토글 */}
      <button
        onClick={onToggleGrid}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
          showGrid
            ? 'bg-blue-600 text-white'
            : 'bg-black/50 backdrop-blur-sm text-white hover:bg-black/70'
        }`}
        aria-label="그리드 토글"
      >
        <Grid3x3 className="w-5 h-5" />
      </button>

      {/* 플래시 모드 */}
      <button
        onClick={toggleFlash}
        className="w-10 h-10 rounded-full flex items-center justify-center bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-all"
        aria-label="플래시 모드"
      >
        <Aperture className="w-5 h-5" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full text-[10px] flex items-center justify-center font-bold">
          {flashMode === 'off' ? '○' : flashMode === 'on' ? '●' : 'A'}
        </span>
      </button>

      {/* 타이머 */}
      <button
        onClick={onToggleTimer}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
          showTimer
            ? 'bg-blue-600 text-white'
            : 'bg-black/50 backdrop-blur-sm text-white hover:bg-black/70'
        }`}
        aria-label="타이머"
      >
        <Timer className="w-5 h-5" />
      </button>
    </div>
  );
};
