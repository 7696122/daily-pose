// 사진 데이터 타입
export interface Photo {
  id: string;
  dataUrl: string;      // Base64 이미지 데이터
  timestamp: number;   // 촬영 시간 (타임스탬프)
  date: string;        // 포맷된 날짜 문자열
}

// 앱 상태 타입
export interface AppState {
  photos: Photo[];
  isCameraActive: boolean;
  stream: MediaStream | null;
  overlayOpacity: number;
  currentView: 'camera' | 'gallery';
  isRecording: boolean;
}
