import { WitnessUseCaseDeps } from './application/witnessUseCaseTypes';
import { MockWitnessApplicationRepository } from './data/mockWitnessApplicationRepository';
import { OfflineQueueWitnessOutbox } from './data/offlineQueueWitnessOutbox';
import { MockTrainingProgressRepository } from './data/mockTrainingProgressRepository';
import { TrainingProgressRepository } from './domain/trainingProgressRepository';

/** Titik perakitan fitur: ganti implementasi mock ke API cukup di file ini. */
export const witnessDependencies: WitnessUseCaseDeps = {
  repository: new MockWitnessApplicationRepository(),
  outbox: new OfflineQueueWitnessOutbox(),
  now: () => new Date(),
};

/** Progres materi pelatihan saksi (materi yang ditandai selesai). */
export const trainingProgressRepository: TrainingProgressRepository = new MockTrainingProgressRepository();
