import { RecruitmentUseCaseDeps } from './application/recruitmentUseCaseTypes';
import { MockNominationRepository } from './data/mockNominationRepository';
import { OfflineQueueNominationOutbox } from './data/offlineQueueNominationOutbox';

/** Titik perakitan fitur: ganti implementasi mock ke API cukup di file ini. */
export const recruitmentDependencies: RecruitmentUseCaseDeps = {
  repository: new MockNominationRepository(),
  outbox: new OfflineQueueNominationOutbox(),
  now: () => new Date(),
};
