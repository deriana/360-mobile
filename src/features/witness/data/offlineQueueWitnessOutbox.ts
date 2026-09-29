import { addToOfflineQueue } from '../../../utils/offlineQueue';
import { WitnessOutbox, WitnessOutboxEvent } from '../domain/witnessOutbox';

/** Adapter ke antrean offline lama (`src/utils/offlineQueue.ts`); tersinkron otomatis saat online. */
export class OfflineQueueWitnessOutbox implements WitnessOutbox {
  enqueue = (event: WitnessOutboxEvent, payload: Record<string, unknown>): void => {
    addToOfflineQueue(event, { ...payload, timestamp: new Date().toISOString() }).catch((err: unknown) =>
      console.warn('[WitnessOutbox] Gagal menyimpan ke antrean offline:', err),
    );
  };
}
