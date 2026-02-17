import { useMemo } from 'react';
import { CalendarDay } from '../atoms/CalendarDay';
import { getDaysFromFirstPhoto, groupPhotosByDate, formatDateKey } from '../../lib/utils/date.utils';
import type { Photo } from '../../types';

interface CalendarHeatmapProps {
  photos: readonly Photo[];
  onDateClick?: (date: Date, photos: readonly Photo[]) => void;
}

export const CalendarHeatmap = ({ photos, onDateClick }: CalendarHeatmapProps) => {
  const firstPhotoTimestamp = photos.length > 0 ? Math.min(...photos.map(p => p.timestamp)) : undefined;
  const days = useMemo(() => getDaysFromFirstPhoto(firstPhotoTimestamp), [firstPhotoTimestamp]);
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

  const handleDateClick = (date: Date) => {
    if (onDateClick) {
      const dateKey = formatDateKey(date);
      const dayPhotos = photosByDate.get(dateKey) || [];
      onDateClick(date, dayPhotos);
    }
  };

  return (
    <div className="w-full">
      {/* Simple Grid */}
      <div className="flex gap-[2px]">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-[2px]">
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
  );
};
