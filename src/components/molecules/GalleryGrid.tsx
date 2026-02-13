import type { Photo } from '../../types';
import { getRelativeDate } from '../../lib/utils';

interface GalleryGridProps {
  photos: Photo[];
  selectedId: string | null;
  onSelect: (photo: Photo) => void;
  onDelete: (id: string) => void;
}

export const GalleryGrid = ({ photos, selectedId, onSelect, onDelete }: GalleryGridProps) => {
  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-lg">아직 사진이 없습니다</p>
        <p className="text-sm mt-2">첫 번째 사진을 찍어보세요!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {photos.map((photo) => (
        <div
          key={photo.id}
          className={`relative group aspect-square rounded-lg overflow-hidden cursor-pointer transition-all ${
            selectedId === photo.id ? 'ring-4 ring-blue-500' : 'hover:ring-2 hover:ring-gray-500'
          }`}
          onClick={() => onSelect(photo)}
        >
          <img
            src={photo.dataUrl}
            alt={photo.date}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute bottom-0 left-0 right-0 p-2">
              <p className="text-white text-xs font-medium">{getRelativeDate(photo.timestamp)}</p>
              <p className="text-gray-300 text-xs">{photo.date}</p>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(photo.id);
            }}
            className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="사진 삭제"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
};
