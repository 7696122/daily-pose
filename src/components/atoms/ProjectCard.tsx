import type { Project } from '../../core/types';
import { t } from '../../lib/i18n';
import { useLanguageStore } from '../../stores';

interface ProjectCardProps {
  readonly project: Project;
  readonly photoCount: number;
  readonly coverImageUrl?: string;
  readonly onClick: () => void;
}

const PROJECT_ICONS: Record<Project['type'], string> = {
  'baby-growth': '👶',
  'fitness-diet': '💪',
  'daily-life': '📷',
  'pet': '🐾',
  'garden': '🌱',
  'construction': '🏗️',
};

export const ProjectCard = ({ project, photoCount, coverImageUrl, onClick }: ProjectCardProps) => {
  const { language } = useLanguageStore();
  const icon = PROJECT_ICONS[project.type];

  return (
    <button
      onClick={onClick}
      className="group relative bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700 hover:border-gray-600 transition-all duration-200 active:scale-[0.98]"
    >
      {/* Cover Image */}
      {coverImageUrl ? (
        <div className="aspect-square w-full relative">
          <img
            src={coverImageUrl}
            alt={project.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>
      ) : (
        <div className="aspect-square w-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
          <span className="text-5xl opacity-50">{icon}</span>
        </div>
      )}

      {/* Project Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">{icon}</span>
          <h3 className="text-white font-semibold text-lg truncate flex-1">
            {project.name}
          </h3>
        </div>
        <p className="text-gray-300 text-sm">
          {photoCount} {t('photosInProject', language)}
        </p>
      </div>
    </button>
  );
};
