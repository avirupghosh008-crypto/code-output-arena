export const ROUND_SECONDS = 60;
export const BASE_XP = 100;
export const STREAK_TRIGGER = 3;
export const COMBO_MULTIPLIER = 2;

export function speedBonus(remainingSeconds: number): number {
  return Math.max(0, Math.round(remainingSeconds * 2));
}

export function awardXp(correct: boolean, remainingSeconds: number, streakAfter: number): number {
  if (!correct) return 0;
  const raw = BASE_XP + speedBonus(remainingSeconds);
  const combo = streakAfter >= STREAK_TRIGGER ? COMBO_MULTIPLIER : 1;
  return raw * combo;
}
