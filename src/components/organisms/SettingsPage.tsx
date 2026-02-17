import { useState } from 'react';
import { ChevronLeft, Trash2, Info, Moon, Globe, ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import { clearDatabase } from '../../lib/indexedDB';

type Theme = 'light' | 'dark' | 'system';
type Language = 'ko' | 'en';

interface SettingItem {
  icon: LucideIcon;
  iconColor?: string;
  label: string;
  value: string;
  danger?: boolean;
  onClick: () => void;
}

interface SettingSection {
  title?: string;
  items: SettingItem[];
}

export const SettingsPage = () => {
  const { setPhotos, setCurrentView, photos } = useAppStore();
  const [theme, setTheme] = useState<Theme>('system');
  const [language, setLanguage] = useState<Language>('ko');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAll = async () => {
    if (!confirm('모든 사진과 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;

    setIsDeleting(true);
    try {
      await clearDatabase();
      setPhotos([]);
    } catch (error) {
      alert('삭제에 실패했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  const settingsSections: SettingSection[] = [
    {
      items: [
        {
          icon: Moon,
          iconColor: 'text-purple-400',
          label: '테마',
          value: theme === 'light' ? '밝게' : theme === 'dark' ? '어둡게' : '자동',
          onClick: () => {
            const themes: Theme[] = ['system', 'dark', 'light'];
            const currentIndex = themes.indexOf(theme);
            const nextTheme = themes[(currentIndex + 1) % themes.length];
            setTheme(nextTheme);
          },
        },
      ],
    },
    {
      items: [
        {
          icon: Globe,
          iconColor: 'text-blue-400',
          label: '언어',
          value: language === 'ko' ? '한국어' : 'English',
          onClick: () => {
            setLanguage(language === 'ko' ? 'en' : 'ko');
          },
        },
      ],
    },
    {
      items: [
        {
          icon: Trash2,
          iconColor: 'text-red-400',
          label: '모든 사진 삭제',
          value: `${photos.length}장`,
          danger: true,
          onClick: handleDeleteAll,
        },
      ],
    },
    {
      title: '정보',
      items: [
        {
          icon: Info,
          iconColor: 'text-gray-400',
          label: '버전',
          value: '1.0.0',
          onClick: () => {},
        },
      ],
    },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      {/* iOS 스타일 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/50 backdrop-blur-lg border-b border-white/10">
        <button
          onClick={() => setCurrentView('gallery')}
          className="text-primary-500 text-[17px] font-medium flex items-center gap-1 active:opacity-60 transition-opacity"
        >
          <ChevronLeft className="w-5 h-5" />
          갤러리
        </button>
        <h1 className="text-lg font-semibold">설정</h1>
        <div className="w-16" /> {/* 중앙 정렬용 */}
      </div>

      {/* 설정 목록 */}
      <div className="flex-1 overflow-auto">
        <div className="pt-3 pb-safe-area-inset-bottom">
          {settingsSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="px-4 mb-5">
              {section.title && (
                <h2 className="text-sm text-gray-500 mb-2 px-3">{section.title}</h2>
              )}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden">
                {section.items.map((item, index) => (
                  <button
                    key={item.label}
                    onClick={item.onClick}
                    disabled={isDeleting}
                    className={`
                      w-full flex items-center justify-between px-4 py-3.5
                      transition-colors duration-150 active:bg-white/10
                      ${index !== section.items.length - 1 ? 'border-b border-white/10' : ''}
                      ${item.danger ? 'active:bg-red-500/20' : ''}
                      ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.iconColor || 'text-gray-400'}`}>
                        <item.icon className="w-4.5 h-4.5" />
                      </div>
                      <span className={`text-[17px] ${item.danger ? 'text-red-400' : 'text-white'}`}>
                        {item.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[17px] ${item.danger ? 'text-red-300' : 'text-gray-400'}`}>
                        {item.value}
                      </span>
                      {!item.danger && <ChevronRight className="w-5 h-5 text-gray-600" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* 앱 정보 카드 */}
          <div className="px-4 mt-6">
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm">Daily Pose</p>
              <p className="text-gray-600 text-xs mt-1">매일의 순간을 기록하세요</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
