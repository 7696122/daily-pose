import { create } from 'zustand';
import type { Photo } from '../types';

interface AppStore {
  // 상태
  photos: Photo[];
  currentPhotoIndex: number;
  isCameraActive: boolean;
  stream: MediaStream | null;
  overlayOpacity: number;
  currentView: 'home' | 'camera' | 'gallery' | 'settings' | 'stats';
  previousView: 'home' | 'camera' | 'gallery' | 'settings' | 'stats' | null;
  isRecording: boolean;
  isTimelapsePlaying: boolean;
  facingMode: 'user' | 'environment';
  aspectRatio: 'video' | 'square' | 'portrait';

  // 액션
  addPhoto: (photo: Photo) => void;
  setPhotos: (photos: Photo[]) => void;
  setCurrentPhotoIndex: (index: number) => void;
  setCameraActive: (active: boolean) => void;
  setStream: (stream: MediaStream | null) => void;
  setOverlayOpacity: (opacity: number) => void;
  setCurrentView: (view: 'home' | 'camera' | 'gallery' | 'settings' | 'stats') => void;
  goBack: () => void;
  setRecording: (recording: boolean) => void;
  setTimelapsePlaying: (playing: boolean) => void;
  deletePhoto: (id: string) => void;
  setFacingMode: (mode: 'user' | 'environment') => void;
  setAspectRatio: (ratio: 'video' | 'square' | 'portrait') => void;
}

export const useAppStore = create<AppStore>((set) => ({
  // 초기 상태
  photos: [],
  currentPhotoIndex: 0,
  isCameraActive: false,
  stream: null,
  overlayOpacity: 0.5,
  currentView: 'home',
  previousView: null,
  isRecording: false,
  isTimelapsePlaying: false,
  facingMode: 'user',
  aspectRatio: 'video' as 'video' | 'square' | 'portrait',

  // 액션 구현
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

  setAspectRatio: (ratio) => set({ aspectRatio: ratio }),
}));
