import { create } from 'zustand';

/**
 * Overlay Store
 * Single Responsibility: Manage overlay settings state
 */
interface OverlayState {
  // State
  overlayOpacity: number;

  // Actions
  setOverlayOpacity: (opacity: number) => void;
}

export const useOverlayStore = create<OverlayState>((set) => ({
  // Initial state
  overlayOpacity: 0.5,

  // Actions
  setOverlayOpacity: (overlayOpacity) => set({ overlayOpacity }),
}));
