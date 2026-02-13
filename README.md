# 📸 Daily Pose

매일 동일한 포즈로 사진을 찍어 변화를 타임랩스로 보여주는 웹 앱

## 🎯 주요 기능

1. **가이드 오버레이** - 이전에 찍은 사진을 반투명하게 겹쳐서 동일한 위치와 포즈 유지
2. **카메라 촬영** - 웹캠/모바일 카메라로 실시간 촬영
3. **사진 저장** - IndexedDB에 날짜별로 로컬 저장
4. **갤러리 뷰** - 찍은 사진들을 날짜순으로 확인
5. **타임랩스 생성** - 저장된 사진들을 동영상으로 변환

## 🚀 시작하기

### Devbox 사용 (권장)

```bash
# Devbox 설치
curl -fsSL https://get.jetify.com/devbox | bash

# 환경 설정
devbox shell

# 의존성 설치
npm install

# 개발 서버 시작
npm run dev
```

### 일반 시작

```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm run dev
```

## 🔧 기술 스택

- **프레임워크**: Vite + React 18
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **상태관리**: Zustand
- **동영상 변환**: FFmpeg.wasm
- **저장소**: IndexedDB (브라우저 로컬)

## 📁 프로젝트 구조

```
daily-pose/
├── src/
│   ├── components/           # Atomic Design 컴포넌트
│   │   ├── atoms/           # 버튼, 카메라 뷰어 등
│   │   ├── molecules/       # 오버레이 카메라, 갤러리 아이템
│   │   └── organisms/       # 촬영 페이지, 갤러리 페이지
│   ├── stores/              # Zustand 상태관리
│   ├── lib/                 # 유틸리티
│   ├── types/               # 타입 정의
│   └── App.tsx              # 메인 앱
├── public/                  # 정적 리소스
└── devbox.json             # Devbox 설정
```

## 📱 사용법

1. **첫 번째 사진 찍기**: 가이드 없이 자유롭게 촬영
2. **두 번째부터**: 이전 사진이 반투명 가이드로 표시
3. **갤러리 확인**: 저장된 사진들을 날짜순으로 확인
4. **타임랩스 생성**: 사진들을 순서대로 재생하는 동영상 생성

## 🎨 UI/UX 특징

- 반응형 디자인 (모바일/데스크톱)
- 어두운 테마 지원
- 실시간 카메라 피드
- 투명도 조절 가능한 오버레이
- 한번에 모든 사진을 볼 수 있는 그리드 뷰

## 🛠️ 개발

```bash
# 개발 서버
npm run dev

# 빌드
npm run build

# 프리뷰
npm run preview

# 린트
npm run lint
```

## 📄 라이선스

MIT
