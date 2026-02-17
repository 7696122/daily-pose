import { useEffect } from 'react';
import { Home, Camera, Image as ImageIcon, Settings } from 'lucide-react';
import { useAppStore } from './stores/useAppStore';
import { CameraPage, GalleryPage, SettingsPage, HomePage, StatsPage } from './components/organisms';
import { InstallButton } from './components/molecules/InstallButton';
import { getAllPhotos } from './lib/indexedDB';

function App() {
  const { currentView, setPhotos, goBack, setCurrentView } = useAppStore();

  // 앱 시작 시 저장된 사진 로드
  useEffect(() => {
    const loadPhotos = async () => {
      try {
        const savedPhotos = await getAllPhotos();
        setPhotos([...savedPhotos]);
      } catch (error) {
        console.error('Failed to load photos:', error);
      }
    };

    loadPhotos();
  }, [setPhotos]);

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
      default:
        return <GalleryPage />;
    }
  };

  // 네비게이션 탭 아이템
  const tabs = [
    { id: 'home' as const, icon: Home, label: '홈' },
    { id: 'camera' as const, icon: Camera, label: '카메라' },
    { id: 'gallery' as const, icon: ImageIcon, label: '갤러리' },
  ];

  return (
    <div className="h-dvh bg-gray-950 text-white overflow-hidden flex flex-col">
      <InstallButton />

      {/* 페이지 내용 */}
      <div className="flex-1 overflow-hidden">
        {renderPage()}
      </div>

      {/* 바텀 탭 네비게이션 - 카메라 페이지일 때 숨김 */}
      {currentView !== 'camera' && (
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
            <span className="text-[11px] font-medium">설정</span>
          </button>
        </div>
      </nav>
      )}
    </div>
  );
}

export default App;
