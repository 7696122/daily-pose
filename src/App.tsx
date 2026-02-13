import { useEffect } from 'react';
import { useAppStore } from './stores/useAppStore';
import { CameraPage, GalleryPage } from './components/organisms';
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
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-6 h-screen max-h-screen">
        {currentView === 'camera' ? <CameraPage /> : <GalleryPage />}
      </div>
    </div>
  );
}

export default App;
