import { Tooltip } from './Tooltip';

interface CalendarDayProps {
  date: Date;
  count: number;
  onClick?: (date: Date) => void;
}

export const CalendarDay = ({ date, count, onClick }: CalendarDayProps) => {
  const activityLevel = count === 0 ? 0 : count === 1 ? 1 : count <= 3 ? 2 : count <= 5 ? 3 : 4;

  const colors = {
    0: 'bg-gray-800',
    1: 'bg-green-900',
    2: 'bg-green-700',
    3: 'bg-green-500',
    4: 'bg-green-400',
  };

  const formatDate = (d: Date): string => {
    return d.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  return (
    <Tooltip content={`${formatDate(date)}${count > 0 ? ` - ${count}장` : ''}`}>
      <button
        onClick={() => onClick?.(date)}
        className={`
          w-3 h-3 rounded-sm transition-all duration-150
          ${colors[activityLevel]}
          ${count > 0 ? 'hover:ring-1 hover:ring-green-300 hover:scale-110' : ''}
          ${onClick ? 'cursor-pointer' : 'cursor-default'}
        `}
        aria-label={`${date.toLocaleDateString('ko-KR')} - ${count}장`}
      />
    </Tooltip>
  );
};
