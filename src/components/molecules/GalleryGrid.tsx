import type { Photo } from '../../core/types';
import { X } from 'lucide-react';
import { IconButton } from '../atoms';

interface GalleryGridProps {
  photos: readonly Photo[];
  selectedId: string | null;
  onSelect: (photo: Photo) => void;
  onDelete: (id: string) => void;
}

export const GalleryGrid = ({ photos, selectedId, onSelect, onDelete }: GalleryGridProps) => {
  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-lg font-medium mb-2">아직 사진이 없습니다</p>
        <p className="text-sm">첫 번째 사진을 찍어보세요!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1 -mx-4">
      {photos.map((photo) => (
        <div
          key={photo.id}
          className="aspect-video relative cursor-pointer active:opacity-70"
          onClick={() => onSelect(photo)}
        >
          <img
            src={photo.dataUrl}
            alt={photo.date}
            className="w-full h-full object-cover"
          />
          {selectedId === photo.id && (
            <div className="absolute inset-0 bg-primary-500/30 border-4 border-primary-500" />
          )}
          <IconButton
            variant="glass"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(photo.id);
            }}
            aria-label="사진 삭제"
            className="absolute top-1 right-1 bg-black/50 hover:bg-black/70"
          >
            <X />
          </IconButton>
        </div>
      ))}
    </div>
  );
};
