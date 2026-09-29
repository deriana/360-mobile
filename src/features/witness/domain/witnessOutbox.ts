/**
 * Port pengiriman aksi saksi ke server (Web Command Center). Implementasinya di `data/`
 * memakai antrean offline, sehingga aksi tetap tersimpan saat sinyal di TPS buruk.
 */
export type WitnessOutboxEvent = 'witness_application' | 'assignment_letter';

export interface WitnessOutbox {
  enqueue(event: WitnessOutboxEvent, payload: Record<string, unknown>): void;
}
