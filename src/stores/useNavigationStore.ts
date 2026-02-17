import { create } from 'zustand';

/**
 * Navigation Store
 * Single Responsibility: Manage navigation state
 */
interface NavigationState {
  // State
  currentView: 'camera' | 'gallery' | 'settings' | 'home' | 'stats' | 'project-select' | 'project-create';
  previousView: 'camera' | 'gallery' | 'settings' | 'home' | 'stats' | 'project-select' | 'project-create' | null;
  isTimelapsePlaying: boolean;
  isRecording: boolean;

  // Actions
  setCurrentView: (view: 'camera' | 'gallery' | 'settings' | 'home' | 'stats' | 'project-select' | 'project-create') => void;
  goBack: () => void;
  setTimelapsePlaying: (playing: boolean) => void;
  setRecording: (recording: boolean) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  // Initial state
  currentView: 'home',
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
      currentView: state.previousView || 'home',
      previousView: null,
    })),

  setTimelapsePlaying: (isTimelapsePlaying) => set({ isTimelapsePlaying }),
  setRecording: (isRecording) => set({ isRecording }),
}));
