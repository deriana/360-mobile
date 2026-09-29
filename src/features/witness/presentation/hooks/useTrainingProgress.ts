import { useCallback, useSyncExternalStore } from 'react';
import { useApp } from '../../../../context/AppContext';
import { trainingProgressRepository } from '../../dependencies';

/**
 * Materi pelatihan saksi yang sudah diselesaikan pengguna. Dipakai bersama oleh layar
 * Pelatihan Saksi dan Materi Pelatihan, sehingga progres tidak hilang saat pindah layar.
 */
export function useTrainingProgress() {
  const { currentUser } = useApp();
  const completedLessonIds = useSyncExternalStore(trainingProgressRepository.subscribe, () =>
    trainingProgressRepository.getCompletedLessonIds(currentUser.id),
  );

  const markLessonCompleted = useCallback(
    (lessonId: string) => trainingProgressRepository.markLessonCompleted(currentUser.id, lessonId),
    [currentUser.id],
  );

  return { completedLessonIds, markLessonCompleted };
}
