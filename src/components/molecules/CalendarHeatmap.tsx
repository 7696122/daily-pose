import { useMemo } from 'react';
import { CalendarDay } from '../atoms/CalendarDay';
import { getLast365Days, groupPhotosByDate, formatDateKey } from '../../lib/utils/date.utils';
import type { Photo } from '../../types';

interface CalendarHeatmapProps {
  photos: Photo[];
  onDateClick?: (date: Date, photos: Photo[]) => void;
}

export const CalendarHeatmap = ({ photos, onDateClick }: CalendarHeatmapProps) => {
  const days = useMemo(() => getLast365Days(), []);
  const photosByDate = useMemo(() => groupPhotosByDate(photos), [photos]);

  // Group days by weeks (Sunday to Saturday)
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  for (const day of days) {
    if (day.getDay() === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [day];
    } else {
      currentWeek.push(day);
    }
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  // Track month labels
  const monthLabels: Array<{ weekIndex: number; month: string }> = [];
  let lastMonth = -1;

  weeks.forEach((week, weekIndex) => {
    if (week.length > 0) {
      const month = week[0].getMonth();
      if (month !== lastMonth) {
        monthLabels.push({ weekIndex, month: `${month + 1}월` });
        lastMonth = month;
      }
    }
  });

  const handleDateClick = (date: Date) => {
    if (onDateClick) {
      const dateKey = formatDateKey(date);
      const dayPhotos = photosByDate.get(dateKey) || [];
      onDateClick(date, dayPhotos);
    }
  };

  const totalDays = photos.length > 0
    ? Math.ceil((Date.now() - Math.min(...photos.map(p => p.timestamp))) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-lg font-semibold text-white">
            {photos.length}장
          </p>
          <p className="text-xs text-gray-500">
            최근 {totalDays > 0 ? `${totalDays}일` : '0일'} 기록
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <span>적음</span>
          <div className="w-3 h-3 rounded-sm bg-gray-800" />
          <div className="w-3 h-3 rounded-sm bg-green-900" />
          <div className="w-3 h-3 rounded-sm bg-green-700" />
          <div className="w-3 h-3 rounded-sm bg-green-500" />
          <div className="w-3 h-3 rounded-sm bg-green-400" />
          <span>많음</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-1 text-xs text-gray-600 pr-1">
          <div className="h-3" />
          <div className="h-3 leading-3">일</div>
          <div className="h-3" />
          <div className="h-3 leading-3">화</div>
          <div className="h-3" />
          <div className="h-3 leading-3">수</div>
          <div className="h-3" />
          <div className="h-3 leading-3">목</div>
          <div className="h-3" />
          <div className="h-3 leading-3">금</div>
          <div className="h-3" />
          <div className="h-3 leading-3">토</div>
        </div>

        {/* Weeks */}
        <div className="flex gap-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {/* Month label (only show for first week of month) */}
              {monthLabels.find((m) => m.weekIndex === weekIndex) && (
                <div className="h-3 text-xs text-gray-600 leading-3">
                  {monthLabels.find((m) => m.weekIndex === weekIndex)?.month}
                </div>
              )}
              {week.map((day) => {
                const dateKey = formatDateKey(day);
                const count = photosByDate.get(dateKey)?.length || 0;

                return (
                  <CalendarDay
                    key={dateKey}
                    date={day}
                    count={count}
                    onClick={onDateClick ? handleDateClick : undefined}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
