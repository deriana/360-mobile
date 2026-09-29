import { WitnessUseCaseDeps } from './application/witnessUseCaseTypes';
import { MockWitnessApplicationRepository } from './data/mockWitnessApplicationRepository';
import { OfflineQueueWitnessOutbox } from './data/offlineQueueWitnessOutbox';

/** Titik perakitan fitur: ganti implementasi mock ke API cukup di file ini. */
export const witnessDependencies: WitnessUseCaseDeps = {
  repository: new MockWitnessApplicationRepository(),
  outbox: new OfflineQueueWitnessOutbox(),
  now: () => new Date(),
};
