import { usePWAInstall } from '../../hooks/usePWAInstall';

export function InstallButton() {
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall();

  // 안드로이드에서만 표시하고, 이미 설치되었거나 설치 불가능하면 숨김
  if (!isInstallable || isInstalled) {
    return null;
  }

  return (
    <button
      onClick={promptInstall}
      className="fixed top-4 right-4 z-50 flex items-center gap-3 px-[3rem] py-7 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-full shadow-lg transition-colors"
      aria-label="앱 설치"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
      <span className="text-base font-medium">앱 설치</span>
    </button>
  );
}
