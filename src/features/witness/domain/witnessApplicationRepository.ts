import { WitnessApplication } from './witnessApplication';

/** Penyimpanan pengajuan saksi (mock in-memory sekarang, API Web Command Center nanti). */
export interface WitnessApplicationRepository {
  /** Harus mengembalikan referensi yang sama selama data tidak berubah (dipakai `useSyncExternalStore`). */
  get(userId: string): WitnessApplication | null;
  save(application: WitnessApplication): void;
  subscribe(listener: () => void): () => void;
}
