import { useEffect } from 'react';
import { useAppStore } from './stores/useAppStore';
import { CameraPage, GalleryPage, SettingsPage } from './components/organisms';
import { InstallButton } from './components/molecules/InstallButton';
import { getAllPhotos } from './lib/indexedDB';

function App() {
  const { currentView, setPhotos, goBack } = useAppStore();

  // 앱 시작 시 저장된 사진 로드
  useEffect(() => {
    const loadPhotos = async () => {
      try {
        const savedPhotos = await getAllPhotos();
        setPhotos(savedPhotos);
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
      case 'camera':
        return <CameraPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <GalleryPage />;
    }
  };

  return (
    <div className="h-dvh bg-gray-950 text-white overflow-hidden">
      <InstallButton />
      {renderPage()}
    </div>
  );
}

export default App;
