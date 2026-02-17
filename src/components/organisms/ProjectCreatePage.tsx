import { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { useNavigationStore, useProjectStore } from '../../stores';
import { t } from '../../lib/i18n';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { projectStorage } from '../../services';
import type { ProjectType } from '../../core/types';

const PROJECT_TYPES: Array<{ type: ProjectType; icon: string; labelKey: keyof typeof import('../../lib/i18n').translations.ko }> = [
  { type: 'baby-growth', icon: '👶', labelKey: 'babyGrowth' },
  { type: 'fitness-diet', icon: '💪', labelKey: 'fitnessDiet' },
  { type: 'daily-life', icon: '📷', labelKey: 'dailyLife' },
  { type: 'pet', icon: '🐾', labelKey: 'pet' },
  { type: 'garden', icon: '🌱', labelKey: 'garden' },
  { type: 'construction', icon: '🏗️', labelKey: 'construction' },
];

export const ProjectCreatePage = () => {
  const { language } = useLanguageStore();
  const { setCurrentProject, addProject } = useProjectStore();
  const { setCurrentView, goBack } = useNavigationStore();
  const [projectName, setProjectName] = useState('');
  const [selectedType, setSelectedType] = useState<ProjectType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTypeSelect = (type: ProjectType) => {
    setSelectedType(type);
  };

  const handleCreate = async () => {
    if (!projectName.trim() || !selectedType || isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      console.log('프로젝트 생성 시작:', { name: projectName.trim(), type: selectedType });

      const project = await projectStorage.create({
        name: projectName.trim(),
        type: selectedType,
        settings: {
          reminderEnabled: false,
        },
      });

      console.log('프로젝트 생성 완료:', project);

      // Update store
      addProject(project);
      setCurrentProject(project.id);

      // Navigate to home
      setCurrentView('home');
    } catch (error) {
      console.error('Failed to create project:', error);
      alert(`프로젝트 생성 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    goBack();
  };

  const isValid = projectName.trim() && selectedType;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <button onClick={handleBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">{t('createProject', language)}</h1>
        <div className="w-10" />
      </div>

      {/* Form */}
      <div className="p-4 space-y-6">
        {/* Project Name Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {t('projectName', language)}
          </label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder={t('myPhotos', language)}
            className="w-full px-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
            maxLength={50}
          />
        </div>

        {/* Project Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            {t('projectType', language)}
          </label>
          <div className="grid grid-cols-2 gap-3">
            {PROJECT_TYPES.map(({ type, icon, labelKey }) => {
              const isSelected = selectedType === type;

              return (
                <button
                  key={type}
                  onClick={() => handleTypeSelect(type)}
                  className={`relative p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-primary-500 bg-primary-500/20'
                      : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                  }`}
                >
                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}

                  {/* Icon */}
                  <div className="text-4xl mb-2">{icon}</div>
                  <div className="text-sm font-medium text-left">
                    {t(labelKey, language)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Create Button */}
        <button
          onClick={handleCreate}
          disabled={!isValid || isLoading}
          className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
            isValid && !isLoading
              ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25 active:scale-[0.98]'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isLoading ? t('generating', language) : t('save', language)}
        </button>
      </div>
    </div>
  );
};
