/**
 * Challenge Type
 */
export type ChallengeType = '30days' | '100days' | '365days' | 'custom';

/**
 * Challenge Status
 */
export type ChallengeStatus = 'not_started' | 'in_progress' | 'completed' | 'failed';

/**
 * Challenge
 */
export interface Challenge {
  readonly id: string;
  readonly type: ChallengeType;
  readonly startDate: number;
  readonly endDate: number;
  readonly targetDays: number;
  readonly currentDays: number;
  readonly status: ChallengeStatus;
}

/**
 * Achievement
 */
export interface Achievement {
  readonly id: string;
  readonly type: 'streak' | 'total_days' | 'challenge' | 'special';
  readonly title: string;
  readonly description: string;
  readonly icon: string;
  readonly unlockedAt?: number;
}

/**
 * Create challenge
 */
export const createChallenge = (type: ChallengeType, startDate: number = Date.now()): Challenge => {
  let targetDays: number;

  switch (type) {
    case '30days':
      targetDays = 30;
      break;
    case '100days':
      targetDays = 100;
      break;
    case '365days':
      targetDays = 365;
      break;
    case 'custom':
      targetDays = 30; // Default for custom
      break;
  }

  const endDate = startDate + targetDays * 24 * 60 * 60 * 1000;

  return {
    id: `challenge-${type}-${startDate}`,
    type,
    startDate,
    endDate,
    targetDays,
    currentDays: 0,
    status: 'not_started',
  };
};

/**
 * Check if challenge is active
 */
export const isChallengeActive = (challenge: Challenge): boolean => {
  const now = Date.now();
  return challenge.status === 'in_progress' && now >= challenge.startDate && now <= challenge.endDate;
};

/**
 * Get challenge progress percentage
 */
export const getChallengeProgress = (challenge: Challenge): number => {
  return Math.min(100, Math.round((challenge.currentDays / challenge.targetDays) * 100));
};

/**
 * Available achievements
 */
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'streak-7',
    type: 'streak',
    title: '일주 연속',
    description: '7일 연속으로 사진 찍기',
    icon: '🔥',
  },
  {
    id: 'streak-30',
    type: 'streak',
    title: '한 달 승리',
    description: '30일 연속으로 사진 찍기',
    icon: '🏆',
  },
  {
    id: 'total-10',
    type: 'total_days',
    title: '첫 열 장',
    description: '10장의 사진 찍기',
    icon: '📸',
  },
  {
    id: 'total-50',
    type: 'total_days',
    title: '쉰집',
    description: '50장의 사진 찍기',
    icon: '🎨',
  },
  {
    id: 'total-100',
    type: 'total_days',
    title: '마스터',
    description: '100장의 사진 찍기',
    icon: '👑',
  },
  {
    id: 'challenge-30',
    type: 'challenge',
    title: '30일 챌린지',
    description: '30일 챌린지 완료',
    icon: '🎯',
  },
  {
    id: 'challenge-100',
    type: 'challenge',
    title: '100일 챌린지',
    description: '100일 챌린지 완료',
    icon: '💯',
  },
  {
    id: 'special-first',
    type: 'special',
    title: '시작',
    description: '첫 번째 사진 찍기',
    icon: '🌱',
  },
];

/**
 * Check achievements based on stats
 */
export const checkAchievements = (
  totalPhotos: number,
  currentStreak: number,
  longestStreak: number,
  completedChallenges: number
): Achievement[] => {
  const unlocked: Achievement[] = [];

  for (const achievement of ACHIEVEMENTS) {
    let isUnlocked = false;

    switch (achievement.id) {
      case 'streak-7':
        isUnlocked = currentStreak >= 7 || longestStreak >= 7;
        break;
      case 'streak-30':
        isUnlocked = currentStreak >= 30 || longestStreak >= 30;
        break;
      case 'total-10':
        isUnlocked = totalPhotos >= 10;
        break;
      case 'total-50':
        isUnlocked = totalPhotos >= 50;
        break;
      case 'total-100':
        isUnlocked = totalPhotos >= 100;
        break;
      case 'challenge-30':
        isUnlocked = completedChallenges >= 1;
        break;
      case 'challenge-100':
        isUnlocked = completedChallenges >= 2;
        break;
      case 'special-first':
        isUnlocked = totalPhotos >= 1;
        break;
    }

    if (isUnlocked) {
      unlocked.push(achievement);
    }
  }

  return unlocked;
};
