import { useEffect } from 'react';
import { useAppStore } from './stores/useAppStore';
import { CameraPage, GalleryPage } from './components/organisms';
import { InstallButton } from './components/molecules/InstallButton';
import { getAllPhotos } from './lib/indexedDB';

function App() {
  const { currentView, setPhotos } = useAppStore();

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

  return (
    <div className="h-dvh bg-gray-950 text-white overflow-hidden">
      <InstallButton />
      {currentView === 'camera' ? <CameraPage /> : <GalleryPage />}
    </div>
  );
}

export default App;
