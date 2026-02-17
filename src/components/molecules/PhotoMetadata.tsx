import { useState } from 'react';
import { X, Smile, Hash } from 'lucide-react';
import type { PhotoMetadata, PhotoTag } from '../../core/types';
import { IconButton } from '../atoms';

interface PhotoMetadataEditorProps {
  metadata?: PhotoMetadata;
  onSave: (metadata: PhotoMetadata) => void;
  onClose: () => void;
}

const TAG_OPTIONS: Array<{ value: PhotoTag; label: string; emoji: string }> = [
  { value: 'workout', label: '운동', emoji: '💪' },
  { value: 'rest', label: '휴식', emoji: '😌' },
  { value: 'good', label: '좋음', emoji: '😊' },
  { value: 'bad', label: '안좋음', emoji: '😔' },
  { value: 'tired', label: '피로', emoji: '😴' },
  { value: 'energetic', label: '활기', emoji: '⚡' },
  { value: 'progress', label: '진전', emoji: '📈' },
  { value: 'milestone', label: '기록', emoji: '🏆' },
];

const MOOD_OPTIONS: Array<{ value: 1 | 2 | 3 | 4 | 5; label: string; emoji: string }> = [
  { value: 1, label: '별로', emoji: '😔' },
  { value: 2, label: '조금', emoji: '😐' },
  { value: 3, label: '보통', emoji: '😊' },
  { value: 4, label: '좋음', emoji: '😄' },
  { value: 5, label: '최고', emoji: '🤩' },
];

export const PhotoMetadataEditor = ({ metadata, onSave, onClose }: PhotoMetadataEditorProps) => {
  const [weight, setWeight] = useState(metadata?.weight?.toString() || '');
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5>(metadata?.mood ?? 3);
  const [note, setNote] = useState(metadata?.note || '');
  const [tags, setTags] = useState<PhotoTag[]>(metadata?.tags || []);

  const handleSave = () => {
    const newMetadata: PhotoMetadata = {
      ...(weight ? { weight: parseFloat(weight) } : {}),
      mood,
      ...(note ? { note } : {}),
      ...(tags.length > 0 ? { tags } : {}),
    };
    onSave(newMetadata);
  };

  const toggleTag = (tag: PhotoTag) => {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <div className="w-full max-w-lg bg-gray-900 rounded-2xl p-6 max-h-[90vh] overflow-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-xl font-semibold">메모 & 태그</h2>
          <IconButton variant="ghost" onClick={onClose} aria-label="닫기">
            <X />
          </IconButton>
        </div>

        {/* 기분 */}
        <div className="mb-6">
          <label className="text-gray-400 text-sm mb-2 flex items-center gap-2">
            <Smile className="w-4 h-4" />
            오늘 기분
          </label>
          <div className="flex gap-2">
            {MOOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setMood(option.value)}
                className={`flex-1 py-3 rounded-xl text-center transition-all ${
                  mood === option.value
                    ? 'bg-primary-600 text-white scale-105'
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                <div className="text-2xl mb-1">{option.emoji}</div>
                <div className="text-xs">{option.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 체중 */}
        <div className="mb-6">
          <label className="text-gray-400 text-sm mb-2 block">체중 (kg)</label>
          <input
            type="number"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="예: 70.5"
            className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* 태그 */}
        <div className="mb-6">
          <label className="text-gray-400 text-sm mb-2 flex items-center gap-2">
            <Hash className="w-4 h-4" />
            태그
          </label>
          <div className="flex flex-wrap gap-2">
            {TAG_OPTIONS.map((option) => {
              const isSelected = tags.includes(option.value);
              return (
                <button
                  key={option.value}
                  onClick={() => toggleTag(option.value)}
                  className={`px-3 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${
                    isSelected
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  <span>{option.emoji}</span>
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 메모 */}
        <div className="mb-6">
          <label className="text-gray-400 text-sm mb-2 block">메모</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="오늘 하루를 기록하세요..."
            rows={4}
            className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
        </div>

        {/* 저장 버튼 */}
        <button
          onClick={handleSave}
          className="w-full py-4 bg-primary-600 text-white rounded-xl font-medium active:scale-[0.98] transition-transform"
        >
          저장
        </button>
      </div>
    </div>
  );
};
