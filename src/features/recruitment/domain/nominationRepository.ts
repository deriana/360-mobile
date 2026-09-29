import { NominatedVolunteer } from './nominatedVolunteer';

/** Penyimpanan pengajuan calon relawan (mock in-memory sekarang, API Web Command Center nanti). */
export interface NominationRepository {
  /** Harus mengembalikan referensi array yang sama selama data tidak berubah (`useSyncExternalStore`). */
  getAll(): NominatedVolunteer[];
  save(nomination: NominatedVolunteer): void;
  subscribe(listener: () => void): () => void;
}
