import { addToOfflineQueue } from '../../../utils/offlineQueue';
import { NominatedVolunteer } from '../domain/nominatedVolunteer';
import { NominationOutbox } from '../domain/nominationOutbox';

/** Adapter ke antrean offline lama (`src/utils/offlineQueue.ts`); tersinkron otomatis saat online. */
export class OfflineQueueNominationOutbox implements NominationOutbox {
  enqueue = (nomination: NominatedVolunteer): void => {
    addToOfflineQueue('volunteer_nomination', { ...nomination, timestamp: new Date().toISOString() }).catch(
      (err: unknown) => console.warn('[NominationOutbox] Gagal menyimpan ke antrean offline:', err),
    );
  };
}
