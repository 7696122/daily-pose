import { create } from 'zustand';

/**
 * Navigation Store
 * Single Responsibility: Manage navigation state
 */
interface NavigationState {
  // State
  currentView: 'camera' | 'gallery' | 'settings';
  previousView: 'camera' | 'gallery' | 'settings' | null;
  isTimelapsePlaying: boolean;
  isRecording: boolean;

  // Actions
  setCurrentView: (view: 'camera' | 'gallery' | 'settings') => void;
  goBack: () => void;
  setTimelapsePlaying: (playing: boolean) => void;
  setRecording: (recording: boolean) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  // Initial state
  currentView: 'camera',
  previousView: null,
  isTimelapsePlaying: false,
  isRecording: false,

  // Actions
  setCurrentView: (currentView) =>
    set((state) => {
      if (state.currentView !== currentView) {
        window.history.pushState({ view: currentView }, '');
      }
      return {
        previousView: state.currentView,
        currentView,
      };
    }),

  goBack: () =>
    set((state) => ({
      currentView: state.previousView || 'camera',
      previousView: null,
    })),

  setTimelapsePlaying: (isTimelapsePlaying) => set({ isTimelapsePlaying }),
  setRecording: (isRecording) => set({ isRecording }),
}));
