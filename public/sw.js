const CACHE_NAME = 'daily-pose-v2';
const RUNTIME_CACHE = 'daily-pose-runtime-v2';

// 캐싱할 정적 리소스
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/vite.svg',
  '/manifest.json'
];

// 설치 이벤트 - 정적 리소스 캐싱
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_CACHE_URLS);
    })
  );
  // 즉시 활성화
  self.skipWaiting();
});

// 활성화 이벤트 - 오래된 캐시 정리
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // 즉시 클레임
  self.clients.claim();
});

// 페치 이벤트 - 네트워크 우선 전략
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 같은 도메인만 처리 (외부 리소스는 캐시하지 않음)
  if (url.origin !== location.origin) {
    return;
  }

  // API 요청은 네트워크 우선
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // 응답이 정상이면 런타임 캐시에 저장
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // 네트워크 실패 시 캐시에서 반환
          return caches.match(request);
        })
    );
    return;
  }

  // 정적 리소스는 캐시 우선, 네트워크 폴백
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // 캐시가 있으면 백그라운드에서 최신 버전 확인
        fetch(request).then((response) => {
          if (response.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, response);
            });
          }
        }).catch(() => {
          // 네트워크 오류 무시
        });
        return cachedResponse;
      }

      // 캐시가 없으면 네트워크에서 가져오기
      return fetch(request).then((response) => {
        // 정상 응답만 캐싱
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // 응답을 캐시에 저장
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone);
        });

        return response;
      }).catch(() => {
        // 네트워크 실패 시 오프라인 페이지 반환
        return caches.match('/index.html');
      });
    })
  );
});
