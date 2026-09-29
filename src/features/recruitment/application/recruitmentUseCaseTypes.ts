import { NominatedVolunteer } from '../domain/nominatedVolunteer';
import { NominationOutbox } from '../domain/nominationOutbox';
import { NominationRepository } from '../domain/nominationRepository';

export interface RecruitmentUseCaseDeps {
  repository: NominationRepository;
  /** Pengiriman ke server (opsional agar use case tetap bisa diuji tanpa antrean). */
  outbox?: NominationOutbox;
  now: () => Date;
}

export interface RecruitmentUseCaseOutput {
  nomination: NominatedVolunteer;
  notice: { title: string; body: string };
}
