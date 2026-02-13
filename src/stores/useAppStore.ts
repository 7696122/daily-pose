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
}));
