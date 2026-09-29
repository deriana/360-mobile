import { NominatedVolunteer } from './nominatedVolunteer';

/** Port pengiriman pengajuan calon relawan ke server (implementasi di `data/`, via antrean offline). */
export interface NominationOutbox {
  enqueue(nomination: NominatedVolunteer): void;
}
