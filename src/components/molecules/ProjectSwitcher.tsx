import { useState, useRef, useEffect } from 'react';
import type { Project } from '../../core/types';
import { t } from '../../lib/i18n';
import { useLanguageStore, useProjectStore } from '../../stores';

const PROJECT_ICONS: Record<Project['type'], string> = {
  'baby-growth': '👶',
  'fitness-diet': '💪',
  'daily-life': '📷',
  'pet': '🐾',
  'garden': '🌱',
  'construction': '🏗️',
};

interface ProjectSwitcherProps {
  readonly onManageProjects?: () => void;
}

export const ProjectSwitcher = ({ onManageProjects }: ProjectSwitcherProps) => {
  const { language } = useLanguageStore();
  const { projects, currentProjectId, setCurrentProject } = useProjectStore();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentProject = projects.find((p) => p.id === currentProjectId);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!currentProject) {
    return null;
  }

  const icon = PROJECT_ICONS[currentProject.type];

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 hover:border-gray-600 transition-all"
      >
        <span className="text-lg">{icon}</span>
        <span className="text-white font-medium text-sm truncate max-w-[120px]">
          {currentProject.name}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-gray-800 backdrop-blur-sm rounded-xl border border-gray-700 shadow-xl z-50 overflow-hidden">
          {/* Project List */}
          <div className="max-h-[300px] overflow-y-auto">
            {projects.map((project) => {
              const projectIcon = PROJECT_ICONS[project.type];
              const isActive = project.id === currentProjectId;

              return (
                <button
                  key={project.id}
                  onClick={() => {
                    setCurrentProject(project.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    isActive
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'hover:bg-gray-700/50 text-white'
                  }`}
                >
                  <span className="text-xl">{projectIcon}</span>
                  <span className="flex-1 font-medium truncate">{project.name}</span>
                  {isActive && (
                    <svg
                      className="w-5 h-5 text-primary-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          {/* Manage Button */}
          {onManageProjects && (
            <div className="border-t border-gray-700">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onManageProjects();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-300 hover:bg-gray-700/50 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="font-medium">{t('projects', language)}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
