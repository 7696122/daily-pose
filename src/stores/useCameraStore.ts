import { create } from 'zustand';

/**
 * Camera Store
 * Single Responsibility: Manage camera-related state
 */
interface CameraState {
  // State
  isCameraActive: boolean;
  stream: MediaStream | null;
  facingMode: 'user' | 'environment';

  // Actions
  setCameraActive: (active: boolean) => void;
  setStream: (stream: MediaStream | null) => void;
  setFacingMode: (mode: 'user' | 'environment') => void;
}

export const useCameraStore = create<CameraState>((set) => ({
  // Initial state
  isCameraActive: false,
  stream: null,
  facingMode: 'user',

  // Actions
  setCameraActive: (isCameraActive) => set({ isCameraActive }),
  setStream: (stream) => set({ stream }),
  setFacingMode: (facingMode) => set({ facingMode }),
}));
