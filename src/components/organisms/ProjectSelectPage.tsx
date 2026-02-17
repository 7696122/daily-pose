import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useNavigationStore, useProjectStore, useGalleryStore } from '../../stores';
import { t } from '../../lib/i18n';
import { useLanguageStore } from '../../stores/useLanguageStore';
import type { Project } from '../../core/types';
import { ProjectCard } from '../atoms/ProjectCard';

export const ProjectSelectPage = () => {
  const { language } = useLanguageStore();
  const { projects, setCurrentProject } = useProjectStore();
  const { photos } = useGalleryStore();
  const { setCurrentView } = useNavigationStore();
  const [photoCounts, setPhotoCounts] = useState<Record<string, number>>({});
  const [coverImages, setCoverImages] = useState<Record<string, string>>({});

  // Calculate photo counts per project
  useEffect(() => {
    const counts: Record<string, number> = {};
    const covers: Record<string, string> = {};

    projects.forEach((project) => {
      const projectPhotos = photos.filter((p) => p.projectId === project.id);
      counts[project.id] = projectPhotos.length;

      // Get most recent photo as cover
      if (projectPhotos.length > 0) {
        const sortedPhotos = [...projectPhotos].sort((a, b) => b.timestamp - a.timestamp);
        covers[project.id] = sortedPhotos[0].dataUrl;
      }
    });

    setPhotoCounts(counts);
    setCoverImages(covers);
  }, [projects, photos]);

  const handleProjectClick = (project: Project) => {
    setCurrentProject(project.id);
    setCurrentView('home');
  };

  const handleCreateProject = () => {
    setCurrentView('project-create');
  };

  const handleBack = () => {
    setCurrentView('home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <button onClick={handleBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <X className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">{t('selectProject', language)}</h1>
        <div className="w-10" /> {/* Spacer for center alignment */}
      </div>

      {/* Project Grid */}
      <div className="p-4">
        {projects.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-6">{t('noPhotosYet', language)}</p>
            <button
              onClick={handleCreateProject}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 rounded-full font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              {t('createProject', language)}
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  photoCount={photoCounts[project.id] || 0}
                  coverImageUrl={coverImages[project.id]}
                  onClick={() => handleProjectClick(project)}
                />
              ))}
            </div>

            {/* Create Project Button */}
            <button
              onClick={handleCreateProject}
              className="mt-6 w-full flex items-center justify-center gap-3 px-6 py-4 bg-gray-800/50 backdrop-blur-sm border-2 border-dashed border-gray-600 hover:border-gray-500 rounded-2xl transition-all"
            >
              <Plus className="w-6 h-6 text-gray-400" />
              <span className="text-gray-300 font-medium">{t('createProject', language)}</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
