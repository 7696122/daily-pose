import { useState } from 'react';
import { Camera, Download, Play, Trash2 } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import type { Photo } from '../../types';
import { deletePhoto, clearDatabase } from '../../lib/indexedDB';
import { downloadTimelapse } from '../../lib/timelapse';
import { Button } from '../atoms';
import { GalleryGrid, TimelapsePlayer } from '../molecules';

export const GalleryPage = () => {
  const { photos, setPhotos, setCurrentView, deletePhoto: deletePhotoFromStore } = useAppStore();
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isPlayingTimelapse, setIsPlayingTimelapse] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // 사진 삭제
  const handleDeletePhoto = async (id: string) => {
    if (!confirm('이 사진을 삭제하시겠습니까?')) return;

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
      // 간단한 버전: Canvas + MediaRecorder
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('캔버스를 생성할 수 없습니다.');

      // 첫 번째 사진으로 크기 설정
      const firstImage = await loadImage(photos[0].dataUrl);
      canvas.width = firstImage.width;
      canvas.height = firstImage.height;

      // MediaRecorder 설정
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

      // 각 프레임 그리기 (초당 10프레임)
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

  return (
    <>
      {/* 타임랩스 플레이어 오버레이 */}
      {isPlayingTimelapse && (
        <TimelapsePlayer photos={photos} onClose={() => setIsPlayingTimelapse(false)} />
      )}

      <div className="flex flex-col h-full">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">🖼️ 갤러리</h1>
            <p className="text-gray-400 text-sm">{photos.length}장의 사진</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentView('camera')}
            >
              <Camera className="w-4 h-4 mr-2" />
              카메라
            </Button>
            {photos.length >= 2 && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsPlayingTimelapse(true)}
                >
                  <Play className="w-4 h-4 mr-2" />
                  타임랩스
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleDownloadTimelapse}
                  disabled={isGenerating}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isGenerating ? '생성 중...' : '다운로드'}
                </Button>
              </>
            )}
            {photos.length > 0 && (
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteAll}
                disabled={isDeletingAll}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                전체 삭제
              </Button>
            )}
          </div>
        </div>

        {/* 사진 그리드 */}
        <div className="flex-1 overflow-auto">
          <GalleryGrid
            photos={photos}
            selectedId={selectedPhoto?.id || null}
            onSelect={setSelectedPhoto}
            onDelete={handleDeletePhoto}
          />
        </div>

        {/* 선택된 사진 미리보기 */}
        {selectedPhoto && (
          <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-4">
            <div className="flex items-center gap-4 max-w-4xl mx-auto">
              <img
                src={selectedPhoto.dataUrl}
                alt={selectedPhoto.date}
                className="w-20 h-20 object-cover rounded-lg"
              />
              <div className="flex-1">
                <p className="text-white font-medium">{selectedPhoto.date}</p>
                <p className="text-gray-400 text-sm">
                  {new Date(selectedPhoto.timestamp).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedPhoto(null)}
              >
                닫기
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
