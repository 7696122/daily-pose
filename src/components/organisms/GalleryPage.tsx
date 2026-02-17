import { useState } from 'react';
import { Camera, Download, Play, Trash2, Settings, X, GitCompare, Edit, MessageSquare } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import type { Photo } from '../../types';
import { deletePhoto, clearDatabase, updatePhoto } from '../../lib/indexedDB';
import { downloadTimelapse } from '../../lib/timelapse';
import { IconButton } from '../atoms';
import { GalleryGrid, TimelapsePlayer, CalendarHeatmap, BeforeAfterSlider, PhotoEditor, PhotoMetadataEditor } from '../molecules';
import type { PhotoMetadata as PhotoMetadataType } from '../../core/types';

export const GalleryPage = () => {
  const { photos, setPhotos, setCurrentView, deletePhoto: deletePhotoFromStore } = useAppStore();
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isPlayingTimelapse, setIsPlayingTimelapse] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [editingMetadata, setEditingMetadata] = useState<Photo | null>(null);

  // 사진 삭제
  const handleDeletePhoto = async (id: string) => {
    try {
      await deletePhoto(id);
      deletePhotoFromStore(id);
      if (selectedPhoto?.id === id) {
        setSelectedPhoto(null);
      }
    } catch (error) {
      alert('사진 삭제에 실패했습니다.');
    }
  };

  // 전체 삭제
  const handleDeleteAll = async () => {
    if (!confirm('모든 사진을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;

    setIsDeletingAll(true);
    try {
      await clearDatabase();
      setPhotos([]);
      setSelectedPhoto(null);
    } catch (error) {
      alert('삭제에 실패했습니다.');
    } finally {
      setIsDeletingAll(false);
    }
  };

  // 타임랩스 다운로드
  const handleDownloadTimelapse = async () => {
    if (photos.length === 0) {
      alert('다운로드할 사진이 없습니다.');
      return;
    }

    setIsGenerating(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('캔버스를 생성할 수 없습니다.');

      const firstImage = await loadImage(photos[0].dataUrl);
      canvas.width = firstImage.width;
      canvas.height = firstImage.height;

      const stream = canvas.captureStream(10);
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        downloadTimelapse(blob, `daily-pose-${new Date().toISOString().split('T')[0]}.webm`);
        setIsGenerating(false);
      };

      mediaRecorder.start();

      const frameDuration = 100;
      for (const photo of photos) {
        const img = await loadImage(photo.dataUrl);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        await new Promise((resolve) => setTimeout(resolve, frameDuration));
      }

      mediaRecorder.stop();
    } catch (error) {
      console.error(error);
      alert('타임랩스 생성에 실패했습니다.');
      setIsGenerating(false);
    }
  };

  const loadImage = (dataUrl: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = dataUrl;
    });
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
    } catch (error) {
      alert('사진 저장에 실패했습니다.');
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
    } catch (error) {
      alert('메타데이터 저장에 실패했습니다.');
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

      <div className="flex flex-col h-full bg-[#0a0a0a]">
        {/* iOS 스타일 헤더 */}
        <div className="flex items-center justify-between px-4 py-3 bg-black/50 backdrop-blur-lg border-b border-white/10">
          <h1 className="text-3xl font-bold">갤러리</h1>
          <div className="flex items-center gap-2">
            {photos.length > 0 && (
              <IconButton
                variant="ghost"
                size="sm"
                onClick={handleDeleteAll}
                disabled={isDeletingAll}
                aria-label="전체 삭제"
              >
                <Trash2 />
              </IconButton>
            )}
            <IconButton
              variant="ghost"
              size="sm"
              onClick={() => setCurrentView('settings')}
              aria-label="설정"
            >
              <Settings />
            </IconButton>
          </div>
        </div>

        {/* 카운트 배지 */}
        {photos.length > 0 && (
          <div className="px-4 py-3">
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
        <div className="border-t border-white/10 bg-black/50 backdrop-blur-lg">
          <div className="flex items-center justify-around py-safe-area-inset-top">
            <button
              onClick={() => setCurrentView('camera')}
              className="flex flex-col items-center gap-1 py-3 px-6 text-primary-500 active:opacity-60"
            >
              <Camera className="w-6 h-6" />
              <span className="text-xs">카메라</span>
            </button>

            {photos.length >= 2 && (
              <>
                <button
                  onClick={() => setShowBeforeAfter(true)}
                  className="flex flex-col items-center gap-1 py-3 px-6 text-gray-400 active:text-white active:opacity-60"
                >
                  <GitCompare className="w-6 h-6" />
                  <span className="text-xs">비교</span>
                </button>

                <button
                  onClick={() => setIsPlayingTimelapse(true)}
                  className="flex flex-col items-center gap-1 py-3 px-6 text-gray-400 active:text-white active:opacity-60"
                >
                  <Play className="w-6 h-6" />
                  <span className="text-xs">재생</span>
                </button>

                <button
                  onClick={handleDownloadTimelapse}
                  disabled={isGenerating}
                  className="flex flex-col items-center gap-1 py-3 px-6 text-gray-400 active:text-white active:opacity-60 disabled:opacity-50"
                >
                  <Download className="w-6 h-6" />
                  <span className="text-xs">{isGenerating ? '생성 중' : '다운로드'}</span>
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
            <div className="relative bg-gray-900 w-full rounded-t-3xl p-6 pb-safe-area-inset-bottom transform transition-transform">
              {/* 핸들 */}
              <div className="w-12 h-1 bg-gray-700 rounded-full mx-auto mb-6" />

              <div className="flex items-center gap-4 mb-6">
                <img
                  src={selectedPhoto.dataUrl}
                  alt={selectedPhoto.date}
                  className="w-24 h-14 object-cover rounded-2xl"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-lg truncate">{selectedPhoto.date}</p>
                  <p className="text-gray-400 text-sm">
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
                  aria-label="닫기"
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
