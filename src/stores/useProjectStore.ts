import { create } from 'zustand';
import type { Project } from '../core/types';

/**
 * Project Store
 * Single Responsibility: Manage projects state
 */
interface ProjectState {
  // State
  readonly projects: readonly Project[];
  readonly currentProjectId: string | null;
  readonly currentProject: Project | null;

  // Actions
  setProjects: (projects: readonly Project[]) => void;
  setCurrentProject: (id: string) => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  deleteProject: (id: string) => void;

  // Selectors
  readonly getProjectById: (id: string) => Project | null;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  // Initial state
  projects: [],
  currentProjectId: null,
  currentProject: null,

  // Actions
  setProjects: (projects) => set({ projects }),

  setCurrentProject: (currentProjectId) => {
    const currentProject = get().projects.find((p) => p.id === currentProjectId) ?? null;
    set({ currentProjectId, currentProject });
  },

  addProject: (project) =>
    set((state) => ({
      projects: [...state.projects, project].sort((a, b) => a.createdAt - b.createdAt),
    })),

  updateProject: (project) =>
    set((state) => ({
      projects: state.projects.map((p) => (p.id === project.id ? project : p)),
      currentProject: state.currentProject?.id === project.id ? project : state.currentProject,
    })),

  deleteProject: (id) =>
    set((state) => {
      const newProjects = state.projects.filter((p) => p.id !== id);
      const newCurrentProjectId = state.currentProjectId === id ? null : state.currentProjectId;
      const newCurrentProject = state.currentProject?.id === id ? null : state.currentProject;
      return {
        projects: newProjects,
        currentProjectId: newCurrentProjectId,
        currentProject: newCurrentProject,
      };
    }),

  // Selectors
  getProjectById: (id) => {
    const { projects } = get();
    return projects.find((p) => p.id === id) ?? null;
  },
}));
