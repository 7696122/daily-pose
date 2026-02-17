import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Trash2, Info, Moon, Globe, ChevronRight, Download, Upload, Bell, BellOff } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import { clearDatabase } from '../../lib/indexedDB';
import { exportBackup, importBackup, validateBackupSize, getBackupInfo } from '../../lib/backup';
import { savePhoto } from '../../lib/indexedDB';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  scheduleDailyReminder,
  clearScheduledReminder,
  getScheduledReminder,
  formatTime,
} from '../../lib/notifications';

type Theme = 'light' | 'dark' | 'system';
type Language = 'ko' | 'en';

interface SettingItem {
  icon: LucideIcon;
  iconColor?: string;
  label: string;
  value: string;
  danger?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

interface SettingSection {
  title?: string;
  items: SettingItem[];
}

export const SettingsPage = () => {
  const { setPhotos, setCurrentView, photos, addPhoto } = useAppStore();
  const [theme, setTheme] = useState<Theme>('system');
  const [language, setLanguage] = useState<Language>('ko');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notification state
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [reminderTime, setReminderTime] = useState<{ hour: number; minute: number } | null>(null);

  // Load notification permission and reminder on mount
  useEffect(() => {
    if (isNotificationSupported()) {
      setNotificationPermission(getNotificationPermission());
      setReminderTime(getScheduledReminder());
    }
  }, []);

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

  const handleExport = async () => {
    if (photos.length === 0) {
      alert('내보낼 사진이 없습니다.');
      return;
    }

    setIsExporting(true);
    try {
      await exportBackup(photos);
      alert(`${photos.length}장의 사진이 내보내기 되었습니다.`);
    } catch (error) {
      alert('내보내기에 실패했습니다.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (file: File) => {
    setIsImporting(true);
    try {
      const importedPhotos = await importBackup(file);

      if (!validateBackupSize(importedPhotos)) {
        alert(`백업 파일이 너무 큽니다. (${importedPhotos.length}장)`);
        return;
      }

      const backupInfo = getBackupInfo({
        version: '1.0.0',
        exportDate: Date.now(),
        photos: importedPhotos,
      });

      const confirmMessage =
        `백업 파일을 가져오시겠습니까?\n\n` +
        `사진: ${backupInfo.photoCount}장\n` +
        `내보낸 날짜: ${backupInfo.exportDate}\n\n` +
        `현재 사진이 유지되고 추가됩니다.`;

      if (!confirm(confirmMessage)) return;

      // Import photos to IndexedDB and store
      let importedCount = 0;
      for (const photo of importedPhotos) {
        try {
          await savePhoto(photo);
          addPhoto(photo);
          importedCount++;
        } catch (error) {
          console.error('Failed to import photo:', photo.id, error);
        }
      }

      alert(`${importedCount}장의 사진이 가져오기 되었습니다.`);
    } catch (error) {
      alert(error instanceof Error ? error.message : '가져오기에 실패했습니다.');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImport(file);
    }
  };

  const handleNotificationToggle = async () => {
    if (!isNotificationSupported()) {
      alert('이 브라우저는 알림을 지원하지 않습니다.');
      return;
    }

    if (notificationPermission === 'granted') {
      // Turn off notifications
      clearScheduledReminder();
      setReminderTime(null);
    } else if (notificationPermission === 'denied') {
      alert('알림이 차단되었습니다. 브라우저 설정에서 알림을 허용해주세요.');
      return;
    } else {
      // Request permission
      try {
        const permission = await requestNotificationPermission();
        setNotificationPermission(permission);

        if (permission === 'granted') {
          // Set default reminder time (9:00 AM)
          scheduleDailyReminder(9, 0);
          setReminderTime({ hour: 9, minute: 0 });
          alert('알림이 설정되었습니다. 매일 오전 9시에 알림을 보내드립니다.');
        }
      } catch {
        alert('알림 권한을 가져오지 못했습니다.');
      }
    }
  };

  const handleNotificationPermission = async () => {
    if (notificationPermission === 'default') {
      try {
        const permission = await requestNotificationPermission();
        setNotificationPermission(permission);
      } catch {
        alert('알림 권한을 가져오지 못했습니다.');
      }
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
      title: '알림',
      items: [
        {
          icon: notificationPermission === 'granted' && reminderTime ? Bell : BellOff,
          iconColor: notificationPermission === 'granted' && reminderTime ? 'text-yellow-400' : 'text-gray-400',
          label: '데일리 리마인더',
          value: reminderTime ? formatTime(reminderTime.hour, reminderTime.minute) : '꺼짐',
          onClick: handleNotificationToggle,
          disabled: notificationPermission === 'denied',
        },
        {
          icon: Info,
          iconColor: 'text-gray-500',
          label: '알림 권한',
          value:
            notificationPermission === 'granted'
              ? '허용됨'
              : notificationPermission === 'denied'
              ? '차단됨'
              : '허용 필요',
          onClick: handleNotificationPermission,
          disabled: notificationPermission !== 'default',
        },
      ],
    },
    {
      title: '데이터',
      items: [
        {
          icon: Download,
          iconColor: 'text-green-400',
          label: '내보내기',
          value: `${photos.length}장`,
          onClick: handleExport,
          disabled: isExporting || photos.length === 0,
        },
        {
          icon: Upload,
          iconColor: 'text-blue-400',
          label: '가져오기',
          value: isImporting ? '가져오는 중...' : '백업 파일',
          onClick: handleImportClick,
          disabled: isImporting,
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
    <>
      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />

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
                    disabled={isDeleting || item.disabled}
                    className={`
                      w-full flex items-center justify-between px-4 py-3.5
                      transition-colors duration-150 active:bg-white/10
                      ${index !== section.items.length - 1 ? 'border-b border-white/10' : ''}
                      ${item.danger ? 'active:bg-red-500/20' : ''}
                      ${(isDeleting || item.disabled) ? 'opacity-50 cursor-not-allowed' : ''}
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
    </>
  );
};
