/**
 * Notification permission status
 */
export type NotificationPermission = 'granted' | 'denied' | 'default';

/**
 * Check if notifications are supported
 */
export const isNotificationSupported = (): boolean => {
  return 'Notification' in window;
};

/**
 * Get current notification permission status
 */
export const getNotificationPermission = (): NotificationPermission => {
  if (!isNotificationSupported()) return 'default';
  return Notification.permission as NotificationPermission;
};

/**
 * Request notification permission
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!isNotificationSupported()) {
    throw new Error('알림이 지원되지 않는 브라우저입니다.');
  }

  const permission = await Notification.requestPermission();
  return permission as NotificationPermission;
};

/**
 * Show a notification
 */
export const showNotification = (title: string, options?: NotificationOptions): void => {
  if (!isNotificationSupported() || getNotificationPermission() !== 'granted') {
    return;
  }

  // Service Worker is active, use it for notifications
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, {
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        ...options,
      });
    });
  } else {
    // Fallback to regular notification
    new Notification(title, {
      icon: '/icon-192.png',
      ...options,
    });
  }
};

/**
 * Show daily reminder notification
 */
export const showDailyReminder = (): void => {
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? '좋은 아침입니다!' : hour < 18 ? '좋은 오후입니다!' : '좋은 저녁입니다!';

  showNotification(`${greeting} 오늘 사진 찍으셨나요?`, {
    body: 'Daily Pose에서 오늘의 순간을 기록하세요.',
    tag: 'daily-reminder',
    requireInteraction: false,
  });
};

/**
 * Schedule daily reminder (using local storage to track)
 */
export const scheduleDailyReminder = (hour: number, minute: number): void => {
  const scheduleData = {
    hour,
    minute,
    lastShown: null,
  };

  localStorage.setItem('daily-pose-reminder', JSON.stringify(scheduleData));
};

/**
 * Get scheduled reminder time
 */
export const getScheduledReminder = (): { hour: number; minute: number } | null => {
  const data = localStorage.getItem('daily-pose-reminder');
  if (!data) return null;

  try {
    const parsed = JSON.parse(data);
    return { hour: parsed.hour, minute: parsed.minute };
  } catch {
    return null;
  }
};

/**
 * Clear scheduled reminder
 */
export const clearScheduledReminder = (): void => {
  localStorage.removeItem('daily-pose-reminder');
};

/**
 * Check if reminder should be shown today
 */
export const shouldShowReminderToday = (): boolean => {
  const data = localStorage.getItem('daily-pose-reminder');
  if (!data) return false;

  try {
    const parsed = JSON.parse(data);
    if (!parsed.lastShown) return true;

    const lastShown = new Date(parsed.lastShown);
    const today = new Date();

    return (
      lastShown.getDate() !== today.getDate() ||
      lastShown.getMonth() !== today.getMonth() ||
      lastShown.getFullYear() !== today.getFullYear()
    );
  } catch {
    return true;
  }
};

/**
 * Mark reminder as shown for today
 */
export const markReminderShown = (): void => {
  const data = localStorage.getItem('daily-pose-reminder');
  if (!data) return;

  try {
    const parsed = JSON.parse(data);
    parsed.lastShown = new Date().toISOString();
    localStorage.setItem('daily-pose-reminder', JSON.stringify(parsed));
  } catch {
    // Ignore
  }
};

/**
 * Format time for display
 */
export const formatTime = (hour: number, minute: number): string => {
  const period = hour >= 12 ? '오후' : '오전';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${period} ${displayHour}:${String(minute).padStart(2, '0')}`;
};
