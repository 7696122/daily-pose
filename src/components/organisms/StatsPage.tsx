import { useMemo } from 'react';
import { Flame, Trophy, TrendingUp, CalendarDays, BarChart3 } from 'lucide-react';
import { useGalleryStore } from '../../stores';
import { useLanguageStore } from '../../stores';
import { t } from '../../lib/i18n';
import { formatDateKey, parseDateKey, getDayName } from '../../lib/utils/date.utils';

interface MonthData {
  month: number;
  year: number;
  label: string;
  count: number;
}

interface WeekdayData {
  day: number;
  label: string;
  count: number;
}

export const StatsPage = () => {
  const { photos } = useGalleryStore();
  const { language } = useLanguageStore();

  // 통계 계산
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 오늘 사진 여부
    const todayKey = formatDateKey(today);
    const hasPhotoToday = photos.some((p) => p.date === todayKey);

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
    const totalDays = firstPhotoDate
      ? Math.floor((today.getTime() - firstPhotoDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
      : 0;

    // 활동률
    const activityRate = totalDays > 0 ? Math.round((uniqueDays / totalDays) * 100) : 0;

    // 월별 데이터
    const monthlyData: MonthData[] = [];
    const photosByMonth = new Map<string, number>();

    for (const photo of photos) {
      const date = new Date(photo.timestamp);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      photosByMonth.set(key, (photosByMonth.get(key) || 0) + 1);
    }

    if (firstPhotoDate) {
      const currentDate = new Date(firstPhotoDate);
      currentDate.setDate(1);

      while (currentDate <= today) {
        const key = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
        monthlyData.push({
          month: currentDate.getMonth(),
          year: currentDate.getFullYear(),
          label: `${currentDate.getMonth() + 1}월`,
          count: photosByMonth.get(key) || 0,
        });
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }

    // 요일별 데이터
    const weekdayData: WeekdayData[] = [0, 1, 2, 3, 4, 5, 6].map((day) => ({
      day,
      label: getDayName(day, true),
      count: 0,
    }));

    for (const photo of photos) {
      const date = new Date(photo.timestamp);
      const day = date.getDay();
      weekdayData[day].count++;
    }

    // 최다 활동 요일
    const mostActiveDay = weekdayData.reduce((max, day) =>
      day.count > max.count ? day : max
    );

    return {
      hasPhotoToday,
      totalDays,
      uniqueDays,
      streak,
      longestStreak,
      activityRate,
      monthlyData,
      weekdayData,
      mostActiveDay,
      firstPhotoDate,
    };
  }, [photos]);

  const maxMonthlyCount = Math.max(...stats.monthlyData.map((d) => d.count), 1);
  const maxWeekdayCount = Math.max(...stats.weekdayData.map((d) => d.count), 1);

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-[#0a0a0a]">
      {/* 헤더 */}
      <div className="px-4 py-3 bg-white/80 dark:bg-black/50 backdrop-blur-lg border-b border-gray-200 dark:border-white/10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('stats', language)}</h1>
      </div>

      {/* 스크롤 가능한 콘텐츠 */}
      <div className="flex-1 overflow-auto">
        <div className="px-4 py-4 space-y-4 pb-safe-area-inset-bottom">
          {/* 주요 지표 - 큰 카드 */}
          <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 rounded-3xl p-6 border border-orange-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center">
                <Flame className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{t('currentStreak', language)}</p>
                <p className="text-gray-900 dark:text-white text-4xl font-bold">{stats.streak}<span className="text-xl text-gray-600 dark:text-gray-400 ml-1">{t('days', language)}</span></p>
              </div>
            </div>
            {stats.streak > 0 && (
              <p className="text-orange-400/80 text-sm">🔥 {t('keepGoing', language)}</p>
            )}
          </div>

          {/* 3개 지표 그리드 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-100 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-4 text-center">
              <Trophy className="w-5 h-5 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.longestStreak}</p>
              <p className="text-xs text-gray-600 dark:text-gray-500 mt-1">{t('longestStreak', language)}</p>
            </div>
            <div className="bg-gray-100 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-4 text-center">
              <CalendarDays className="w-5 h-5 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.uniqueDays}</p>
              <p className="text-xs text-gray-600 dark:text-gray-500 mt-1">{t('totalDays', language)}</p>
            </div>
            <div className="bg-gray-100 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-4 text-center">
              <TrendingUp className="w-5 h-5 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activityRate}%</p>
              <p className="text-xs text-gray-600 dark:text-gray-500 mt-1">{t('activityRate', language)}</p>
            </div>
          </div>

          {/* 요일별 패턴 */}
          {photos.length > 0 && (
            <div className="bg-gray-100 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-900 dark:text-white font-semibold">{t('weeklyActivity', language)}</h3>
                {stats.mostActiveDay.count > 0 && (
                  <span className="text-xs text-primary-400 bg-primary-500/10 px-2 py-1 rounded-full">
                    {stats.mostActiveDay.label}요일 {t('mostActive', language)}
                  </span>
                )}
              </div>
              <div className="flex items-end justify-between gap-2 h-32">
                {stats.weekdayData.map((data) => {
                  const height = data.count > 0 ? Math.max((data.count / maxWeekdayCount) * 100, 10) : 5;
                  const isMostActive = data.day === stats.mostActiveDay.day && stats.mostActiveDay.count > 0;
                  return (
                    <div key={data.day} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full relative group">
                        <div
                          className={`w-full rounded-t-lg transition-all ${
                            isMostActive ? 'bg-primary-500' : 'bg-white/20'
                          }`}
                          style={{ height: `${height}%` }}
                        />
                        {data.count > 0 && (
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                              {data.count}{t('photos', language)}
                            </div>
                          </div>
                        )}
                      </div>
                      <span className={`text-xs ${isMostActive ? 'text-primary-400 font-semibold' : 'text-gray-600 dark:text-gray-500'}`}>
                        {data.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 월별 추이 */}
          {stats.monthlyData.length > 1 && (
            <div className="bg-gray-100 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-900 dark:text-white font-semibold">{t('monthlyTrend', language)}</h3>
                <BarChart3 className="w-5 h-5 text-gray-600 dark:text-gray-500" />
              </div>
              <div className="overflow-x-auto -mx-2 px-2">
                <div className="flex items-end gap-2 h-32 min-w-max">
                  {stats.monthlyData.slice(-12).map((data) => {
                    const height = data.count > 0 ? Math.max((data.count / maxMonthlyCount) * 100, 8) : 4;
                    return (
                      <div key={`${data.year}-${data.month}`} className="flex flex-col items-center gap-2 min-w-[32px]">
                        <div className="w-full relative group">
                          <div
                            className="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-lg transition-all"
                            style={{ height: `${height}%` }}
                          />
                          {data.count > 0 && (
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                {data.label}: {data.count}{t('photos', language)}
                              </div>
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-700 dark:text-gray-600">{data.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 총 사진 수 */}
          <div className="bg-gray-100 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-5 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{t('totalPhotos', language)}</p>
            <p className="text-gray-900 dark:text-white text-5xl font-bold">{photos.length}</p>
            {stats.firstPhotoDate && (
              <p className="text-gray-600 dark:text-gray-500 text-xs mt-3">
                {stats.firstPhotoDate.getFullYear()}.{stats.firstPhotoDate.getMonth() + 1}.{stats.firstPhotoDate.getDate()} {t('started', language)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
