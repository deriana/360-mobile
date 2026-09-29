/** Aturan pelatihan saksi (materi Academy). TS murni. */

/** Kuis akreditasi terbuka setelah minimal separuh materi pelatihan selesai dipelajari. */
export const QUIZ_MIN_PROGRESS_PERCENT = 50;

export function getTrainingProgressPercent(completedLessons: number, totalLessons: number): number {
  if (totalLessons <= 0) return 0;
  return Math.round((completedLessons / totalLessons) * 100);
}

export function canTakeWitnessQuiz(completedLessons: number, totalLessons: number): boolean {
  return getTrainingProgressPercent(completedLessons, totalLessons) >= QUIZ_MIN_PROGRESS_PERCENT;
}
