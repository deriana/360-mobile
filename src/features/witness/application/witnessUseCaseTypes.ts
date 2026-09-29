import { WitnessApplication } from '../domain/witnessApplication';
import { WitnessApplicationRepository } from '../domain/witnessApplicationRepository';
import { WitnessOutbox } from '../domain/witnessOutbox';

export interface WitnessUseCaseDeps {
  repository: WitnessApplicationRepository;
  /** Pengiriman aksi pengguna ke server (opsional agar use case tetap bisa diuji tanpa antrean). */
  outbox?: WitnessOutbox;
  now: () => Date;
}

/** Pesan singkat untuk notifikasi/dialog setelah aksi berhasil. */
export interface WitnessNotice {
  title: string;
  body: string;
}

export interface WitnessUseCaseOutput {
  application: WitnessApplication;
  notice: WitnessNotice;
}
