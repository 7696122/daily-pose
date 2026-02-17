/**
 * Get week start date (Sunday)
 */
export const getWeekStartDate = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Get days in month
 */
export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

/**
 * Format date to YYYY-MM-DD
 */
export const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Parse YYYY-MM-DD to Date
 */
export const parseDateKey = (dateKey: string): Date => {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Check if two dates are same day
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * Get activity level (0-4) based on photos count
 */
export const getActivityLevel = (count: number): 0 | 1 | 2 | 3 | 4 => {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 5) return 3;
  return 4;
};

/**
 * Get last 365 days from today
 */
export const getLast365Days = (): Date[] => {
  const days: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 364; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    days.push(date);
  }

  return days;
};

/**
 * Group photos by date key
 */
export const groupPhotosByDate = <T extends { timestamp: number }>(
  photos: T[]
): Map<string, T[]> => {
  const grouped = new Map<string, T[]>();

  for (const photo of photos) {
    const dateKey = formatDateKey(new Date(photo.timestamp));
    const existing = grouped.get(dateKey) || [];
    grouped.set(dateKey, [...existing, photo]);
  }

  return grouped;
};

/**
 * Get Korean day name
 */
export const getDayName = (dayIndex: number, short = false): string => {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return short ? days[dayIndex] : days[dayIndex] + '요일';
};

/**
 * Get Korean month name
 */
export const getMonthName = (monthIndex: number): string => {
  return `${monthIndex + 1}월`;
};
