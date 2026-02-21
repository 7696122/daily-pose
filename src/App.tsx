import { useEffect, useRef } from 'react';
import { Home, Camera, Image as ImageIcon, Settings } from 'lucide-react';
import { useNavigationStore, useProjectStore, useGalleryStore, useLanguageStore } from './stores';
import { t } from './lib/i18n';
import { CameraPage, GalleryPage, SettingsPage, HomePage, StatsPage, ProjectSelectPage, ProjectCreatePage } from './components/organisms';
import { InstallButton } from './components/molecules/InstallButton';
import { photoStorage, projectStorage } from './services';
import type { Photo } from './core/types';

// Database version for migration detection
const DB_VERSION = 4;
const MIGRATION_KEY = 'dailypose_db_version';

function App() {
  const { currentView, goBack, setCurrentView } = useNavigationStore();
  const { setProjects, currentProjectId, setCurrentProject } = useProjectStore();
  const { setPhotos } = useGalleryStore();
  const { language } = useLanguageStore();
  const hasInitialized = useRef(false);

  // 앱 시작 시 다크 모드 고정
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // DB 초기화 체크 (다른 탭 닫기 후 리로드 시)
  useEffect(() => {
    const shouldResetDB = sessionStorage.getItem('resetDB');
    if (shouldResetDB === 'true') {
      const dbName = import.meta.env.VITE_DB_NAME || 'DailyPoseDB';
      sessionStorage.removeItem('resetDB');

      // Delete database before app initializes
      indexedDB.deleteDatabase(dbName).onsuccess = () => {
        console.log('Database deleted, reloading...');
        window.location.reload();
      };
    }
  }, []);

  // 앱 시작 시 데이터 로드 및 마이그레이션
  useEffect(() => {
    if (hasInitialized.current) return;

    const initializeApp = async () => {
      try {
        // Check if migration is needed
        const currentDbVersion = localStorage.getItem(MIGRATION_KEY);
        const needsMigration = !currentDbVersion || parseInt(currentDbVersion, 10) < DB_VERSION;

        if (needsMigration) {
          await migrateToV2();
          localStorage.setItem(MIGRATION_KEY, String(DB_VERSION));
        }

        // Load projects
        const savedProjects = await projectStorage.findAll();
        setProjects(savedProjects);

        // Set current project (first project or null)
        if (savedProjects.length > 0) {
          setCurrentProject(savedProjects[0].id);
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
      } finally {
        hasInitialized.current = true;
      }
    };

    initializeApp();
  }, [setProjects, setCurrentProject]);

  // Load photos when project changes
  useEffect(() => {
    if (!hasInitialized.current || !currentProjectId) return;

    const loadProjectPhotos = async () => {
      try {
        const projectPhotos = await photoStorage.findByProjectId(currentProjectId);
        setPhotos(projectPhotos);
      } catch (error) {
        console.error('Failed to load project photos:', error);
      }
    };

    loadProjectPhotos();
  }, [currentProjectId, setPhotos]);

  // 브라우저 뒤로가기 처리
  useEffect(() => {
    const handlePopState = () => {
      goBack();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [goBack]);

  const renderPage = () => {
    switch (currentView) {
      case 'home':
        return <HomePage />;
      case 'camera':
        return <CameraPage />;
      case 'settings':
        return <SettingsPage />;
      case 'stats':
        return <StatsPage />;
      case 'project-select':
        return <ProjectSelectPage />;
      case 'project-create':
        return <ProjectCreatePage />;
      default:
        return <GalleryPage />;
    }
  };

  // 네비게이션 탭 아이템
  const tabs = [
    { id: 'home' as const, icon: Home, label: t('home', language) },
    { id: 'camera' as const, icon: Camera, label: t('camera', language) },
    { id: 'gallery' as const, icon: ImageIcon, label: t('gallery', language) },
  ];

  return (
    <div className="h-dvh bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white overflow-hidden flex flex-col">
      <InstallButton />

      {/* 페이지 내용 */}
      <div className="flex-1 overflow-hidden">
        {renderPage()}
      </div>

      {/* 바텀 탭 네비게이션 - 카메라 페이지일 때 숨김 */}
      {currentView !== 'camera' && currentView !== 'project-select' && currentView !== 'project-create' && (
        <nav className="bg-black/90 backdrop-blur-lg border-t border-white/10 pb-safe-area-inset-bottom">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => {
            const isActive = currentView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentView(tab.id)}
                className={`
                  flex flex-col items-center gap-1 py-2 px-4 min-w-0
                  transition-all duration-200
                  ${isActive ? 'text-primary-500' : 'text-gray-500'}
                `}
              >
                <tab.icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} />
                <span className="text-[11px] font-medium">{tab.label}</span>
              </button>
            );
          })}

          {/* 설정 버튼 (오른쪽) */}
          <button
            onClick={() => setCurrentView('settings')}
            className={`
              flex flex-col items-center gap-1 py-2 px-4
              transition-all duration-200
              ${currentView === 'settings' ? 'text-primary-500' : 'text-gray-500'}
            `}
          >
            <Settings className={`w-6 h-6 ${currentView === 'settings' ? 'fill-current' : ''}`} />
            <span className="text-[11px] font-medium">{t('settings', language)}</span>
          </button>
        </div>
      </nav>
      )}
    </div>
  );
}

/**
 * Migration from v1 to v2
 * Creates default project and assigns all existing photos to it
 */
async function migrateToV2(): Promise<void> {
  try {
    // Open database to check version
    const dbName = import.meta.env.VITE_DB_NAME ?? 'DailyPoseDB';

    // Get all existing photos before migration
    const request = indexedDB.open(dbName, 1);

    const allPhotos: Photo[] = await new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['photos'], 'readonly');
        const store = transaction.objectStore('photos');
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = () => {
          resolve(getAllRequest.result || []);
        };
        getAllRequest.onerror = () => reject(getAllRequest.error);
      };
      request.onerror = () => reject(request.error);
    });

    // If no photos, create default project without photos
    if (allPhotos.length === 0) {
      await projectStorage.create({
        name: '내 포토',
        type: 'daily-life',
        settings: { reminderEnabled: false },
      });
      return;
    }

    // Create default project
    const defaultProject = await projectStorage.create({
      name: '내 포토',
      type: 'daily-life',
      settings: { reminderEnabled: false },
    });

    // Update all photos with projectId
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open(dbName, 2);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    const transaction = db.transaction(['photos'], 'readwrite');
    const store = transaction.objectStore('photos');

    for (const photo of allPhotos) {
      const updatedPhoto: Photo = {
        ...photo,
        projectId: defaultProject.id,
      };
      store.put(updatedPhoto);
    }

    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });

    db.close();

    console.log('Migration to v2 complete');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

export default App;
