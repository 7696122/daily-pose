import { useState } from 'react';
import { Camera, Download, Play, Trash2, Settings, X, GitCompare, Edit, MessageSquare, Sparkles } from 'lucide-react';
import { useNavigationStore, useGalleryStore, useLanguageStore } from '../../stores';
import { t } from '../../lib/i18n';
import type { Photo } from '../../types';
import { deletePhoto, clearDatabase, updatePhoto } from '../../lib/indexedDB';
import { downloadTimelapse, createTimelapse, type InterpolationMode } from '../../lib/timelapse';
import { IconButton } from '../atoms';
import { GalleryGrid, TimelapsePlayer, CalendarHeatmap, BeforeAfterSlider, PhotoEditor, PhotoMetadataEditor } from '../molecules';
import type { PhotoMetadata as PhotoMetadataType } from '../../core/types';

export const GalleryPage = () => {
  const { photos, setPhotos, deletePhoto: deletePhotoFromStore } = useGalleryStore();
  const { setCurrentView } = useNavigationStore();
  const { language } = useLanguageStore();
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isPlayingTimelapse, setIsPlayingTimelapse] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [editingMetadata, setEditingMetadata] = useState<Photo | null>(null);
  const [showInterpolationOptions, setShowInterpolationOptions] = useState(false);
  const [interpolationMode, setInterpolationMode] = useState<InterpolationMode>('crossfade');
  const [interpolationFactor, setInterpolationFactor] = useState(2);
  const [generationProgress, setGenerationProgress] = useState(0);

  // 사진 삭제
  const handleDeletePhoto = async (id: string) => {
    try {
      await deletePhoto(id);
      deletePhotoFromStore(id);
      if (selectedPhoto?.id === id) {
        setSelectedPhoto(null);
      }
    } catch {
      alert(t('deleteError', language));
    }
  };

  // 전체 삭제
  const handleDeleteAll = async () => {
    if (!confirm(t('deleteConfirm', language))) return;

    setIsDeletingAll(true);
    try {
      await clearDatabase();
      setPhotos([]);
      setSelectedPhoto(null);
    } catch {
      alert(t('deleteAllError', language));
    } finally {
      setIsDeletingAll(false);
    }
  };

  // 타임랩스 다운로드
  const handleDownloadTimelapse = async () => {
    if (photos.length === 0) {
      alert(t('noPhotosToDownload', language));
      return;
    }

    setShowInterpolationOptions(true);
  };

  // 타임랩스 생성 (보간 옵션 선택 후)
  const generateTimelapse = async () => {
    setShowInterpolationOptions(false);
    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      const blob = await createTimelapse([...photos], {
        fps: 30,
        interpolation: interpolationMode,
        interpolationFactor: interpolationFactor,
        onProgress: (progress) => {
          setGenerationProgress(progress);
        },
      });

      downloadTimelapse(blob, `daily-pose-${new Date().toISOString().split('T')[0]}.webm`);
    } catch (error) {
      console.error(error);
      alert(t('timelapseError', language));
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  // 사진 편집 저장
  const handleEditSave = async (editedImageUrl: string, settings: Photo['editSettings']) => {
    if (!editingPhoto) return;

    try {
      // Update in IndexedDB
      const updatedPhoto = {
        ...editingPhoto,
        dataUrl: editedImageUrl,
        editSettings: settings,
      };
      await updatePhoto(updatedPhoto);

      // Update in store
      setPhotos(photos.map((p) => (p.id === editingPhoto.id ? updatedPhoto : p)));
      setSelectedPhoto(null);
      setEditingPhoto(null);
    } catch {
      alert(t('photoSaveError', language));
    }
  };

  // 메타데이터 저장
  const handleMetadataSave = async (metadata: PhotoMetadataType) => {
    if (!editingMetadata) return;

    try {
      const updatedPhoto = {
        ...editingMetadata,
        metadata,
      };
      await updatePhoto(updatedPhoto);

      setPhotos(photos.map((p) => (p.id === editingMetadata.id ? updatedPhoto : p)));
      setSelectedPhoto(null);
      setEditingMetadata(null);
    } catch {
      alert(t('metadataSaveError', language));
    }
  };

  return (
    <>
      {isPlayingTimelapse && (
        <TimelapsePlayer photos={photos} onClose={() => setIsPlayingTimelapse(false)} />
      )}

      {showBeforeAfter && photos.length >= 2 && (
        <BeforeAfterSlider
          beforePhoto={photos[0]}
          afterPhoto={photos[photos.length - 1]}
          onClose={() => setShowBeforeAfter(false)}
        />
      )}

      {/* 보간 옵션 모달 */}
      {showInterpolationOptions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-primary-500" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">보간 효과</h3>
            </div>

            {/* 보간 모드 선택 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                보간 방식
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setInterpolationMode('none')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    interpolationMode === 'none'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  없음
                </button>
                <button
                  onClick={() => setInterpolationMode('crossfade')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    interpolationMode === 'crossfade'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  크로스페이드
                </button>
                <button
                  onClick={() => setInterpolationMode('mci')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    interpolationMode === 'mci'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  AI 보간
                </button>
              </div>
            </div>

            {/* 보간 강도 */}
            {interpolationMode !== 'none' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  부드러움: {interpolationFactor}x
                </label>
                <input
                  type="range"
                  min="2"
                  max="8"
                  step="2"
                  value={interpolationFactor}
                  onChange={(e) => setInterpolationFactor(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>빠름</span>
                  <span>부드러움</span>
                </div>
              </div>
            )}

            {/* 버튼 */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowInterpolationOptions(false)}
                className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium"
              >
                취소
              </button>
              <button
                onClick={generateTimelapse}
                className="flex-1 py-3 px-4 bg-primary-500 text-white rounded-xl font-medium"
              >
                생성
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col h-full bg-gray-50 dark:bg-[#0a0a0a]">
        {/* iOS 스타일 헤더 */}
        <div className="flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-black/50 backdrop-blur-lg border-b border-gray-200 dark:border-white/10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('gallery', language)}</h1>
          <div className="flex items-center gap-2">
            {photos.length > 0 && (
              <IconButton
                variant="ghost"
                size="sm"
                onClick={handleDeleteAll}
                disabled={isDeletingAll}
                aria-label={t('deleteAll', language)}
              >
                <Trash2 />
              </IconButton>
            )}
            <IconButton
              variant="ghost"
              size="sm"
              onClick={() => setCurrentView('settings')}
              aria-label={t('settings', language)}
            >
              <Settings />
            </IconButton>
          </div>
        </div>

        {/* 카운트 배지 */}
        {photos.length > 0 && (
          <div className="px-4 py-3 overflow-x-auto">
            <CalendarHeatmap
              photos={photos}
              onDateClick={(_date, dayPhotos) => {
                if (dayPhotos.length > 0) {
                  setSelectedPhoto(dayPhotos[0]);
                }
              }}
            />
          </div>
        )}

        {/* 사진 그리드 */}
        <div className="flex-1 overflow-auto px-4">
          <GalleryGrid
            photos={photos}
            selectedId={selectedPhoto?.id || null}
            onSelect={setSelectedPhoto}
            onDelete={handleDeletePhoto}
          />
        </div>

        {/* 하단 액션 바 */}
        <div className="border-t border-gray-200 dark:border-white/10 bg-white/80 dark:bg-black/50 backdrop-blur-lg">
          <div className="flex items-center justify-around py-safe-area-inset-top">
            <button
              onClick={() => setCurrentView('camera')}
              className="flex flex-col items-center gap-1 py-3 px-6 text-primary-500 active:opacity-60"
            >
              <Camera className="w-6 h-6" />
              <span className="text-xs">{t('camera', language)}</span>
            </button>

            {photos.length >= 2 && (
              <>
                <button
                  onClick={() => setShowBeforeAfter(true)}
                  className="flex flex-col items-center gap-1 py-3 px-6 text-gray-400 active:text-white active:opacity-60"
                >
                  <GitCompare className="w-6 h-6" />
                  <span className="text-xs">{t('compare', language)}</span>
                </button>

                <button
                  onClick={() => setIsPlayingTimelapse(true)}
                  className="flex flex-col items-center gap-1 py-3 px-6 text-gray-400 active:text-white active:opacity-60"
                >
                  <Play className="w-6 h-6" />
                  <span className="text-xs">{t('play', language)}</span>
                </button>

                <button
                  onClick={handleDownloadTimelapse}
                  disabled={isGenerating}
                  className="flex flex-col items-center gap-1 py-3 px-6 text-gray-400 active:text-white active:opacity-60 disabled:opacity-50 relative"
                >
                  <Download className="w-6 h-6" />
                  <span className="text-xs">
                    {isGenerating
                      ? generationProgress > 0
                        ? `${Math.round(generationProgress)}%`
                        : t('generating', language)
                      : t('download', language)}
                  </span>
                  {isGenerating && (
                    <div className="absolute inset-0 bg-primary-500/10 rounded-lg animate-pulse" />
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* 선택된 사진 미리보기 시트 */}
        {selectedPhoto && (
          <div className="fixed inset-0 z-50 flex items-end">
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setSelectedPhoto(null)}
            />
            <div className="relative bg-white dark:bg-gray-900 w-full rounded-t-3xl p-6 pb-safe-area-inset-bottom transform transition-transform">
              {/* 핸들 */}
              <div className="w-12 h-1 bg-gray-700 rounded-full mx-auto mb-6" />

              <div className="flex items-center gap-4 mb-6">
                <img
                  src={selectedPhoto.dataUrl}
                  alt={selectedPhoto.date}
                  className="w-24 h-14 object-cover rounded-2xl"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 dark:text-white font-medium text-lg truncate">{selectedPhoto.date}</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {new Date(selectedPhoto.timestamp).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <IconButton
                  variant="ghost"
                  onClick={() => setSelectedPhoto(null)}
                  aria-label={t('close', language)}
                >
                  <X />
                </IconButton>
              </div>

              {/* 액션 버튼들 */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => {
                    setEditingPhoto(selectedPhoto);
                    setSelectedPhoto(null);
                  }}
                  className="flex items-center justify-center gap-2 py-3 bg-gray-800 text-white rounded-xl font-medium active:bg-gray-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  편집
                </button>
                <button
                  onClick={() => {
                    setEditingMetadata(selectedPhoto);
                    setSelectedPhoto(null);
                  }}
                  className="flex items-center justify-center gap-2 py-3 bg-gray-800 text-white rounded-xl font-medium active:bg-gray-700 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  메모
                </button>
                <button
                  onClick={() => {
                    setSelectedPhoto(null);
                    handleDeletePhoto(selectedPhoto.id);
                  }}
                  className="flex items-center justify-center gap-2 py-3 bg-red-600/20 text-red-400 rounded-xl font-medium active:bg-red-600/30 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  삭제
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 사진 편집기 */}
        {editingPhoto && (
          <PhotoEditor
            imageUrl={editingPhoto.dataUrl}
            initialSettings={editingPhoto.editSettings}
            onSave={handleEditSave}
            onClose={() => setEditingPhoto(null)}
          />
        )}

        {/* 메타데이터 편집기 */}
        {editingMetadata && (
          <PhotoMetadataEditor
            metadata={editingMetadata.metadata}
            onSave={handleMetadataSave}
            onClose={() => setEditingMetadata(null)}
          />
        )}
      </div>
    </>
  );
};
