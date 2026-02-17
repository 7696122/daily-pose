// Individual stores following Single Responsibility Principle
export { useCameraStore } from './useCameraStore';
export { useGalleryStore } from './useGalleryStore';
export { useNavigationStore } from './useNavigationStore';
export { useOverlayStore } from './useOverlayStore';

// Legacy store for backward compatibility (can be deprecated)
import { create } from 'zustand';
import type { Photo } from '../core/types';

interface AppStore {
  photos: Photo[];
  currentPhotoIndex: number;
  isCameraActive: boolean;
  stream: MediaStream | null;
  overlayOpacity: number;
  currentView: 'camera' | 'gallery' | 'settings';
  previousView: 'camera' | 'gallery' | 'settings' | null;
  isRecording: boolean;
  isTimelapsePlaying: boolean;
  facingMode: 'user' | 'environment';
  addPhoto: (photo: Photo) => void;
  setPhotos: (photos: Photo[]) => void;
  setCurrentPhotoIndex: (index: number) => void;
  setCameraActive: (active: boolean) => void;
  setStream: (stream: MediaStream | null) => void;
  setOverlayOpacity: (opacity: number) => void;
  setCurrentView: (view: 'camera' | 'gallery' | 'settings') => void;
  goBack: () => void;
  setRecording: (recording: boolean) => void;
  setTimelapsePlaying: (playing: boolean) => void;
  deletePhoto: (id: string) => void;
  setFacingMode: (mode: 'user' | 'environment') => void;
}

export const useAppStore = create<AppStore>((set) => ({
  photos: [],
  currentPhotoIndex: 0,
  isCameraActive: false,
  stream: null,
  overlayOpacity: 0.5,
  currentView: 'camera',
  previousView: null,
  isRecording: false,
  isTimelapsePlaying: false,
  facingMode: 'user',
  addPhoto: (photo) =>
    set((state) => ({
      photos: [...state.photos, photo].sort((a, b) => a.timestamp - b.timestamp),
    })),
  setPhotos: (photos) => set({ photos }),
  setCurrentPhotoIndex: (index) => set({ currentPhotoIndex: index }),
  setCameraActive: (active) => set({ isCameraActive: active }),
  setStream: (stream) => set({ stream }),
  setOverlayOpacity: (opacity) => set({ overlayOpacity: opacity }),
  setCurrentView: (view) =>
    set((state) => {
      if (state.currentView !== view) {
        window.history.pushState({ view }, '');
      }
      return {
        previousView: state.currentView,
        currentView: view,
      };
    }),
  goBack: () =>
    set((state) => ({
      currentView: state.previousView || 'camera',
      previousView: null,
    })),
  setRecording: (recording) => set({ isRecording: recording }),
  setTimelapsePlaying: (playing) => set({ isTimelapsePlaying: playing }),
  deletePhoto: (id) =>
    set((state) => ({
      photos: state.photos.filter((photo) => photo.id !== id),
    })),
  setFacingMode: (mode) => set({ facingMode: mode }),
}));
