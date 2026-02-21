import { useState, useRef, useEffect } from 'react';
import { Trash2, Info, Globe, ChevronRight, Download, Upload, Bell, BellOff, Layers, RefreshCw } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useNavigationStore, useGalleryStore, useProjectStore, useLanguageStore } from '../../stores';
import { t } from '../../lib/i18n';
import { clearDatabase, resetDatabase } from '../../lib/indexedDB';
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
  const { setPhotos, photos, addPhoto } = useGalleryStore();
  const { projects, currentProject } = useProjectStore();
  const { setCurrentView } = useNavigationStore();
  const { language, setLanguage } = useLanguageStore();
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
    if (!confirm(t('deleteAllConfirm', language))) return;

    setIsDeleting(true);
    try {
      await clearDatabase();
      setPhotos([]);
    } catch {
      alert(t('deleteAllError', language));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetDatabase = async () => {
    if (!confirm('데이터베이스를 초기화하시겠습니까?\n\n모든 데이터가 삭제되고 앱이 초기 상태로 돌아갑니다.')) return;

    setIsDeleting(true);
    try {
      await resetDatabase();
      setPhotos([]);
      alert('데이터베이스가 초기화되었습니다. 페이지를 새로고침해주세요.');
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      alert(`초기화 실패: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExport = async () => {
    if (photos.length === 0 && projects.length === 0) {
      alert(t('noPhotosToExport', language));
      return;
    }

    setIsExporting(true);
    try {
      await exportBackup(photos, projects);
      alert(`${photos.length}${t('exportSuccess', language)}`);
    } catch {
      alert(t('exportError', language));
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (file: File) => {
    setIsImporting(true);
    try {
      const { photos: importedPhotos, projects: importedProjects } = await importBackup(file);

      if (!validateBackupSize({ photos: importedPhotos, projects: importedProjects })) {
        alert(`${t('backupTooLarge', language)}${importedPhotos.length}${t('backupTooLargeEnd', language)}`);
        return;
      }

      const backupInfo = getBackupInfo({
        version: '2.0.0',
        exportDate: Date.now(),
        photos: importedPhotos,
        projects: importedProjects,
      });

      const confirmMessage =
        `${t('importConfirm', language)}\n\n` +
        `${t('photosLabel', language)}: ${backupInfo.photoCount}${t('backupTooLargeEnd', language)}\n` +
        `${t('exportedDate', language)}: ${backupInfo.exportDate}\n\n` +
        `${t('currentPhotosKept', language)}`;

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

      alert(`${importedCount}${t('importSuccess', language)}`);
    } catch (error) {
      alert(error instanceof Error ? error.message : t('importError', language));
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
      alert(t('notificationNotSupported', language));
      return;
    }

    if (notificationPermission === 'granted') {
      // Turn off notifications
      clearScheduledReminder();
      setReminderTime(null);
    } else if (notificationPermission === 'denied') {
      alert(t('notificationBlocked', language));
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
          alert(t('notificationSet', language));
        }
      } catch {
        alert(t('notificationPermissionError', language));
      }
    }
  };

  const handleNotificationPermission = async () => {
    if (notificationPermission === 'default') {
      try {
        const permission = await requestNotificationPermission();
        setNotificationPermission(permission);
      } catch {
        alert(t('notificationPermissionError', language));
      }
    }
  };

  const settingsSections: SettingSection[] = [
    {
      title: t('projects', language),
      items: [
        {
          icon: Layers,
          iconColor: 'text-purple-400',
          label: currentProject?.name || t('projects', language),
          value: `${projects.length} ${t('projects', language)}`,
          onClick: () => setCurrentView('project-select'),
        },
      ],
    },
    {
      title: t('notifications', language),
      items: [
        {
          icon: notificationPermission === 'granted' && reminderTime ? Bell : BellOff,
          iconColor: notificationPermission === 'granted' && reminderTime ? 'text-yellow-400' : 'text-gray-400',
          label: t('dailyReminder', language),
          value: reminderTime ? formatTime(reminderTime.hour, reminderTime.minute) : t('off', language),
          onClick: handleNotificationToggle,
          disabled: notificationPermission === 'denied',
        },
        {
          icon: Info,
          iconColor: 'text-gray-500',
          label: t('notificationPermission', language),
          value:
            notificationPermission === 'granted'
              ? t('granted', language)
              : notificationPermission === 'denied'
              ? t('denied', language)
              : t('default', language),
          onClick: handleNotificationPermission,
          disabled: notificationPermission !== 'default',
        },
      ],
    },
    {
      title: t('data', language),
      items: [
        {
          icon: Download,
          iconColor: 'text-green-400',
          label: t('exportBackup', language),
          value: `${photos.length}${t('photos', language)}`,
          onClick: handleExport,
          disabled: isExporting || photos.length === 0,
        },
        {
          icon: Upload,
          iconColor: 'text-blue-400',
          label: t('importBackup', language),
          value: isImporting ? t('importing', language) : t('backupFile', language),
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
          label: t('language', language),
          value: language === 'ko' ? t('korean', language) : t('english', language),
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
          label: t('deleteAllData', language),
          value: `${photos.length}${t('photos', language)}`,
          danger: true,
          onClick: handleDeleteAll,
        },
        {
          icon: RefreshCw,
          iconColor: 'text-orange-400',
          label: 'DB 초기화',
          value: '저장 오류 시',
          danger: true,
          onClick: handleResetDatabase,
        },
      ],
    },
    {
      title: t('about', language),
      items: [
        {
          icon: Info,
          iconColor: 'text-gray-400',
          label: t('version', language),
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

      <div className="flex flex-col h-full bg-gray-50 dark:bg-[#0a0a0a]">
      {/* iOS 스타일 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-black/50 backdrop-blur-lg border-b border-gray-200 dark:border-white/10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('settings', language)}</h1>
      </div>

      {/* 설정 목록 */}
      <div className="flex-1 overflow-auto">
        <div className="pt-3 pb-safe-area-inset-bottom">
          {settingsSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="px-4 mb-5">
              {section.title && (
                <h2 className="text-sm text-gray-600 dark:text-gray-500 mb-2 px-3">{section.title}</h2>
              )}
              <div className="bg-gray-100 dark:bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden">
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
                      <span className={`text-[17px] ${item.danger ? 'text-red-400' : 'text-gray-900 dark:text-white'}`}>
                        {item.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[17px] ${item.danger ? 'text-red-300' : 'text-gray-600 dark:text-gray-400'}`}>
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
              <p className="text-gray-600 dark:text-gray-500 text-sm">Daily Pose</p>
              <p className="text-gray-700 dark:text-gray-600 text-xs mt-1">{t('appTagline', language)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};
