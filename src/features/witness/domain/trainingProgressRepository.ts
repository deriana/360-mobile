/** Materi pelatihan yang sudah diselesaikan per pengguna (mock in-memory sekarang, API nanti). */
export interface TrainingProgressRepository {
  /** Harus mengembalikan referensi yang sama selama data tidak berubah (dipakai `useSyncExternalStore`). */
  getCompletedLessonIds(userId: string): readonly string[];
  markLessonCompleted(userId: string, lessonId: string): void;
  subscribe(listener: () => void): () => void;
}
