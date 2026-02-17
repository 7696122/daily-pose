import { useMemo } from 'react';
import { Camera, Flame, Calendar, TrendingUp, ArrowRight } from 'lucide-react';
import { useNavigationStore, useGalleryStore, useLanguageStore } from '../../stores';
import { t } from '../../lib/i18n';
import { CalendarHeatmap } from '../molecules/CalendarHeatmap';
import { formatDateKey, parseDateKey, isSameDay } from '../../lib/utils/date.utils';
import { ProjectSwitcher } from '../molecules/ProjectSwitcher';

export const HomePage = () => {
  const { photos } = useGalleryStore();
  const { setCurrentView } = useNavigationStore();
  const { language } = useLanguageStore();

  // 통계 계산
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 오늘 사진 여부
    const todayKey = formatDateKey(today);
    const hasPhotoToday = photos.some((p) => {
      const photoDate = parseDateKey(p.date);
      return isSameDay(photoDate, today);
    });

    // 총 기록 일수
    const uniqueDays = new Set(photos.map((p) => p.date)).size;

    // 스트릭 계산
    let streak = 0;
    const checkDate = new Date(today);

    while (true) {
      const checkKey = formatDateKey(checkDate);
      const hasPhoto = photos.some((p) => p.date === checkKey);

      if (hasPhoto) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // 오늘 사진이 없으면 어제부터 체크
        if (checkKey === todayKey && !hasPhotoToday) {
          checkDate.setDate(checkDate.getDate() - 1);
          continue;
        }
        break;
      }
    }

    // 최장 스트릭
    let longestStreak = 0;
    let currentStreak = 0;
    const sortedDates = Array.from(new Set(photos.map((p) => p.date))).sort();

    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        currentStreak = 1;
      } else {
        const prevDate = parseDateKey(sortedDates[i - 1]);
        const currDate = parseDateKey(sortedDates[i]);
        const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          currentStreak++;
        } else {
          longestStreak = Math.max(longestStreak, currentStreak);
          currentStreak = 1;
        }
      }
    }
    longestStreak = Math.max(longestStreak, currentStreak);

    // 첫 사진 날짜
    const firstPhotoDate = photos.length > 0 ? new Date(photos[0].timestamp) : null;

    return {
      hasPhotoToday,
      totalDays: uniqueDays,
      streak,
      longestStreak,
      firstPhotoDate,
    };
  }, [photos]);

  // 최근 사진 3장
  const recentPhotos = useMemo(() => {
    return [...photos].reverse().slice(0, 3);
  }, [photos]);

  // 비포/애프터 사진 (첫 번째와 마지막)
  const beforeAfterPhotos = useMemo(() => {
    if (photos.length < 2) return null;
    return {
      before: photos[0],
      after: photos[photos.length - 1],
    };
  }, [photos]);

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-[#0a0a0a]">
      {/* 헤더 */}
      <div className="px-4 pt-12 pb-4 bg-gradient-to-b from-white/80 dark:from-black/50 to-transparent">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Daily Pose</h1>
          <ProjectSwitcher onManageProjects={() => setCurrentView('project-select')} />
        </div>
        <p className="text-gray-600 dark:text-gray-500 text-sm">{t('gallery', language)}</p>
      </div>

      {/* 스크롤 가능한 콘텐츠 */}
      <div className="flex-1 overflow-auto px-4 pb-safe-area-inset-bottom">
        {/* 오늘의 상태 카드 */}
        <div className="mb-4">
          <button
            onClick={() => setCurrentView('camera')}
            className="w-full bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-6 text-left transition-all active:scale-[0.98]"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-primary-100 text-sm mb-1">{t('home', language)}</p>
                <p className="text-white text-xl font-semibold">
                  {stats.hasPhotoToday ? t('photoComplete', language) : t('takePhoto', language)}
                </p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            {!stats.hasPhotoToday && (
              <div className="flex items-center gap-2 text-primary-100 text-sm">
                <span>{t('recordNow', language)}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            )}
          </button>
        </div>

        {/* 스트릭 카드 */}
        {stats.streak > 0 && (
          <div className="mb-4 bg-gray-100 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <Flame className="w-6 h-6 text-orange-500" />
              </div>
              <div className="flex-1">
                <p className="text-gray-900 dark:text-white text-2xl font-bold">{stats.streak}{t('days', language)}</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">연속 기록 중</p>
              </div>
              <div className="text-right">
                <p className="text-gray-700 dark:text-gray-500 text-xs">최장</p>
                <p className="text-gray-700 dark:text-gray-300 text-sm font-medium">{stats.longestStreak}{t('days', language)}</p>
              </div>
            </div>
          </div>
        )}

        {/* 요약 통계 */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="bg-gray-100 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <p className="text-gray-600 dark:text-gray-500 text-xs">{t('totalRecords', language)}</p>
            </div>
            <p className="text-gray-900 dark:text-white text-2xl font-bold">{stats.totalDays}{t('days', language)}</p>
          </div>
          <div className="bg-gray-100 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <p className="text-gray-600 dark:text-gray-500 text-xs">{t('totalPhotos', language)}</p>
            </div>
            <p className="text-gray-900 dark:text-white text-2xl font-bold">{photos.length}{t('photos', language)}</p>
          </div>
        </div>

        {/* 캘린더 히트맵 */}
        {photos.length > 0 && (
          <div className="mb-4 bg-gray-100 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-4 overflow-x-auto">
            <CalendarHeatmap photos={photos} />
          </div>
        )}

        {/* 비포/애프터 프리뷰 */}
        {beforeAfterPhotos && (
          <div className="mb-4 bg-gray-100 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-4">
            <p className="text-gray-900 dark:text-white font-semibold mb-3">변화 비교</p>
            <div className="flex gap-2">
              <div className="flex-1 aspect-[3/4] rounded-xl overflow-hidden relative">
                <img
                  src={beforeAfterPhotos.before.dataUrl}
                  alt="첫 사진"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                  <p className="text-white text-xs font-medium">첫 사진</p>
                  <p className="text-gray-300 text-[10px]">
                    {new Date(beforeAfterPhotos.before.timestamp).toLocaleDateString('ko-KR', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <span className="text-white text-sm">→</span>
                </div>
              </div>
              <div className="flex-1 aspect-[3/4] rounded-xl overflow-hidden relative">
                <img
                  src={beforeAfterPhotos.after.dataUrl}
                  alt="최근 사진"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                  <p className="text-white text-xs font-medium">최근</p>
                  <p className="text-gray-300 text-[10px]">
                    {new Date(beforeAfterPhotos.after.timestamp).toLocaleDateString('ko-KR', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 최근 사진 */}
        {recentPhotos.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-900 dark:text-white font-semibold">최근 사진</p>
              <button
                onClick={() => setCurrentView('gallery')}
                className="text-primary-500 text-sm"
              >
                {t('gallery', language)}
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {recentPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="flex-shrink-0 w-24 h-32 rounded-xl overflow-hidden"
                >
                  <img
                    src={photo.dataUrl}
                    alt={photo.date}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 시작 가이드 (사진 없을 때) */}
        {photos.length === 0 && (
          <div className="bg-gray-100 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 text-center">
            <div className="w-16 h-16 bg-gray-200 dark:bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="w-8 h-8 text-gray-600 dark:text-gray-400" />
            </div>
            <p className="text-gray-900 dark:text-white font-semibold mb-2">{t('takeFirstPhotoQuestion', language)}</p>
            <p className="text-gray-600 dark:text-gray-500 text-sm mb-4">
              {t('emptyMessage', language)}<br />
              {t('emptyMessage2', language)}
            </p>
            <button
              onClick={() => setCurrentView('camera')}
              className="w-full bg-primary-600 text-white font-medium py-3 rounded-xl active:scale-[0.98] transition-transform"
            >
              {t('getStarted', language)}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
