import { create } from 'zustand';
import type { Photo } from '../core/types';

/**
 * Gallery Store
 * Single Responsibility: Manage gallery/photos state
 */
interface GalleryState {
  // State
  photos: readonly Photo[];
  currentPhotoIndex: number;

  // Actions
  addPhoto: (photo: Photo) => void;
  setPhotos: (photos: readonly Photo[]) => void;
  setCurrentPhotoIndex: (index: number) => void;
  deletePhoto: (id: string) => void;
}

export const useGalleryStore = create<GalleryState>((set) => ({
  // Initial state
  photos: [],
  currentPhotoIndex: 0,

  // Actions
  addPhoto: (photo) =>
    set((state) => ({
      photos: [...state.photos, photo].sort((a, b) => a.timestamp - b.timestamp),
    })),

  setPhotos: (photos) => set({ photos }),

  setCurrentPhotoIndex: (currentPhotoIndex) => set({ currentPhotoIndex }),

  deletePhoto: (id) =>
    set((state) => ({
      photos: state.photos.filter((photo) => photo.id !== id),
    })),
}));
