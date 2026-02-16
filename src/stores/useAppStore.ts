import { create } from 'zustand';
import type { Photo } from '../types';

interface AppStore {
  // 상태
  photos: Photo[];
  currentPhotoIndex: number;
  isCameraActive: boolean;
  stream: MediaStream | null;
  overlayOpacity: number;
  currentView: 'camera' | 'gallery';
  isRecording: boolean;
  isTimelapsePlaying: boolean;
  facingMode: 'user' | 'environment';
  aspectRatio: 'video' | 'square' | 'portrait' | 'fullscreen';

  // 액션
  addPhoto: (photo: Photo) => void;
  setPhotos: (photos: Photo[]) => void;
  setCurrentPhotoIndex: (index: number) => void;
  setCameraActive: (active: boolean) => void;
  setStream: (stream: MediaStream | null) => void;
  setOverlayOpacity: (opacity: number) => void;
  setCurrentView: (view: 'camera' | 'gallery') => void;
  setRecording: (recording: boolean) => void;
  setTimelapsePlaying: (playing: boolean) => void;
  deletePhoto: (id: string) => void;
  setFacingMode: (mode: 'user' | 'environment') => void;
  setAspectRatio: (ratio: 'video' | 'square' | 'portrait' | 'fullscreen') => void;
}

export const useAppStore = create<AppStore>((set) => ({
  // 초기 상태
  photos: [],
  currentPhotoIndex: 0,
  isCameraActive: false,
  stream: null,
  overlayOpacity: 0.5,
  currentView: 'camera',
  isRecording: false,
  isTimelapsePlaying: false,
  facingMode: 'user',
  aspectRatio: 'video',

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

  setCurrentView: (view) => set({ currentView: view }),

  setRecording: (recording) => set({ isRecording: recording }),

  setTimelapsePlaying: (playing) => set({ isTimelapsePlaying: playing }),

  deletePhoto: (id) =>
    set((state) => ({
      photos: state.photos.filter((photo) => photo.id !== id),
    })),

  setFacingMode: (mode) => set({ facingMode: mode }),

  setAspectRatio: (ratio) => set({ aspectRatio: ratio }),
}));
