import { TrainingProgressRepository } from '../domain/trainingProgressRepository';

const EMPTY: readonly string[] = [];

export class MockTrainingProgressRepository implements TrainingProgressRepository {
  private readonly items = new Map<string, readonly string[]>();
  private readonly listeners = new Set<() => void>();

  getCompletedLessonIds(userId: string): readonly string[] {
    return this.items.get(userId) ?? EMPTY;
  }

  markLessonCompleted(userId: string, lessonId: string): void {
    const current = this.getCompletedLessonIds(userId);
    if (current.includes(lessonId)) return;
    this.items.set(userId, [...current, lessonId]);
    this.listeners.forEach((listener) => listener());
  }

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
}
