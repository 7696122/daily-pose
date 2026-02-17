import { useMemo } from 'react';
import { Flame, Calendar, Trophy, TrendingUp, CalendarDays, BarChart3 } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
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
  const { photos } = useAppStore();

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
    let checkDate = new Date(today);

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
      let currentDate = new Date(firstPhotoDate);
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
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      {/* 헤더 */}
      <div className="px-4 pt-12 pb-4 bg-black/50">
        <h1 className="text-3xl font-bold text-white mb-1">📈 통계</h1>
        <p className="text-gray-500 text-sm">기록을 분석하세요</p>
      </div>

      {/* 스크롤 가능한 콘텐츠 */}
      <div className="flex-1 overflow-auto px-4 pb-safe-area-inset-bottom">
        {/* 메트릭 카드 그리드 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* 현재 스트릭 */}
          <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 rounded-2xl p-4 border border-orange-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <p className="text-gray-400 text-xs">연속 기록</p>
            </div>
            <p className="text-white text-3xl font-bold">{stats.streak}</p>
            <p className="text-gray-500 text-xs mt-1">일</p>
          </div>

          {/* 최장 스트릭 */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <p className="text-gray-400 text-xs">최장 기록</p>
            </div>
            <p className="text-white text-3xl font-bold">{stats.longestStreak}</p>
            <p className="text-gray-500 text-xs mt-1">일</p>
          </div>

          {/* 총 기록 일수 */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CalendarDays className="w-5 h-5 text-blue-400" />
              <p className="text-gray-400 text-xs">총 기록</p>
            </div>
            <p className="text-white text-3xl font-bold">{stats.uniqueDays}</p>
            <p className="text-gray-500 text-xs mt-1">일</p>
          </div>

          {/* 활동률 */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <p className="text-gray-400 text-xs">활동률</p>
            </div>
            <p className="text-white text-3xl font-bold">{stats.activityRate}</p>
            <p className="text-gray-500 text-xs mt-1">%</p>
          </div>
        </div>

        {/* 월별 차트 */}
        {stats.monthlyData.length > 0 && (
          <div className="mb-4 bg-white/5 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-white font-semibold">월별 기록</p>
              <BarChart3 className="w-5 h-5 text-gray-500" />
            </div>
            <div className="flex items-end gap-1 h-32">
              {stats.monthlyData.map((data) => {
                const height = data.count > 0 ? Math.max((data.count / maxMonthlyCount) * 100, 5) : 0;
                return (
                  <div key={`${data.year}-${data.month}`} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full relative group">
                      <div
                        className="w-full bg-primary-600 rounded-t-sm transition-all"
                        style={{ height: `${height}%` }}
                      />
                      {/* Tooltip */}
                      {data.count > 0 && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {data.label}: {data.count}장
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] text-gray-600">{data.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 요일별 패턴 */}
        <div className="mb-4 bg-white/5 backdrop-blur-sm rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-white font-semibold">요일별 패턴</p>
            {stats.mostActiveDay.count > 0 && (
              <span className="text-xs text-gray-500">
                {stats.mostActiveDay.label}에 가장 활발
              </span>
            )}
          </div>
          <div className="flex items-end gap-2 h-20">
            {stats.weekdayData.map((data) => {
              const height = data.count > 0 ? Math.max((data.count / maxWeekdayCount) * 100, 10) : 5;
              const isMostActive = data.day === stats.mostActiveDay.day && stats.mostActiveDay.count > 0;
              return (
                <div key={data.day} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full relative group">
                    <div
                      className={`w-full rounded-t-sm transition-all ${
                        isMostActive ? 'bg-primary-500' : 'bg-primary-600/50'
                      }`}
                      style={{ height: `${height}%` }}
                    />
                    {data.count > 0 && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {data.count}장
                      </div>
                    )}
                  </div>
                  <span className={`text-[10px] ${isMostActive ? 'text-primary-500 font-medium' : 'text-gray-600'}`}>
                    {data.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 시작일 정보 */}
        {stats.firstPhotoDate && (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              <p className="text-gray-400 text-sm">기록 시작일</p>
            </div>
            <p className="text-white text-lg font-semibold">
              {stats.firstPhotoDate.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <p className="text-gray-500 text-xs mt-1">
              {stats.totalDays}일째 기록 중
            </p>
          </div>
        )}

        {/* 데이터 없음 */}
        {photos.length === 0 && (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 text-center">
            <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500">아직 기록이 없습니다</p>
            <p className="text-gray-600 text-sm mt-2">첫 사진을 찍고 통계를 확인해보세요</p>
          </div>
        )}
      </div>
    </div>
  );
};
