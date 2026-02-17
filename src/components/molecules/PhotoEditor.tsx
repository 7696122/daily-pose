import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Slider } from '../atoms';
import type { PhotoFilter, PhotoEditSettings } from '../../core/types';
import { getFilterStyle, FILTER_OPTIONS, applyFiltersToImage } from '../../lib/utils/image-edit.utils';

interface PhotoEditorProps {
  imageUrl: string;
  onSave: (editedImageUrl: string, settings: PhotoEditSettings) => void;
  onClose: () => void;
  initialSettings?: PhotoEditSettings;
}

export const PhotoEditor = ({ imageUrl, onSave, onClose, initialSettings }: PhotoEditorProps) => {
  const [brightness, setBrightness] = useState(initialSettings?.brightness ?? 0);
  const [contrast, setContrast] = useState(initialSettings?.contrast ?? 0);
  const [filter, setFilter] = useState<PhotoFilter>(initialSettings?.filter ?? 'none');

  const filterStyle = getFilterStyle(brightness, contrast, filter);

  const handleSave = async () => {
    try {
      const editedImageUrl = await applyFiltersToImage(imageUrl, brightness, contrast, filter);
      onSave(editedImageUrl, { brightness, contrast, filter });
    } catch (error) {
      alert('이미지 저장에 실패했습니다.');
    }
  };

  const handleReset = () => {
    setBrightness(0);
    setContrast(0);
    setFilter('none');
  };

  const hasChanges = brightness !== 0 || contrast !== 0 || filter !== 'none';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <div className="w-full max-w-lg flex flex-col max-h-[90vh]">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onClose}
            className="text-gray-400 active:text-white transition-colors"
          >
            취소
          </button>
          <h2 className="text-white font-semibold">사진 편집</h2>
          <button
            onClick={handleSave}
            className="text-primary-500 font-medium active:opacity-60 transition-opacity"
          >
            완료
          </button>
        </div>

        {/* 이미지 프리뷰 */}
        <div className="flex-1 flex items-center justify-center mb-4 overflow-hidden rounded-2xl bg-gray-900">
          <img
            src={imageUrl}
            alt="편집 중"
            className="max-w-full max-h-[50vh] object-contain"
            style={{ filter: filterStyle }}
          />
        </div>

        {/* 리셋 버튼 */}
        {hasChanges && (
          <button
            onClick={handleReset}
            className="self-end mb-3 flex items-center gap-1 text-sm text-gray-400 active:text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            초기화
          </button>
        )}

        {/* 컨트롤 패널 */}
        <div className="bg-gray-900 rounded-2xl p-4 space-y-4">
          {/* 밝기 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white text-sm font-medium">밝기</span>
              <span className="text-gray-400 text-xs">{brightness > 0 ? '+' : ''}{brightness}</span>
            </div>
            <Slider
              value={brightness}
              onChange={setBrightness}
              min={-100}
              max={100}
              step={5}
            />
          </div>

          {/* 대비 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white text-sm font-medium">대비</span>
              <span className="text-gray-400 text-xs">{contrast > 0 ? '+' : ''}{contrast}</span>
            </div>
            <Slider
              value={contrast}
              onChange={setContrast}
              min={-100}
              max={100}
              step={5}
            />
          </div>

          {/* 필터 */}
          <div>
            <span className="text-white text-sm font-medium mb-2 block">필터</span>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {FILTER_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  className={`
                    flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all
                    ${filter === option.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-800 text-gray-300 active:bg-gray-700'
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
