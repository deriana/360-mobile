import { NominatedVolunteer } from '../domain/nominatedVolunteer';
import { NominationRepository } from '../domain/nominationRepository';

const DAY_MS = 24 * 60 * 60 * 1000;
const daysAgo = (days: number) => new Date(Date.now() - days * DAY_MS).toISOString();

/** Data demo: 2 pengajuan milik Siti Rahmawati (USR-SITI) — 1 menunggu, 1 terverifikasi. */
const SEED: NominatedVolunteer[] = [
  {
    id: 'NOM-SEED-1',
    nominatorId: 'USR-SITI',
    nominatorName: 'Siti Rahmawati',
    fullName: 'Rina Kusuma Wardani',
    phone: '081311224455',
    region: 'Kec. Sumur Bandung, Kel. Braga',
    interest: 'Dokumentasi kegiatan',
    consentGiven: true,
    nominatedAt: daysAgo(2),
    status: 'PENDING_VERIFICATION',
  },
  {
    id: 'NOM-SEED-2',
    nominatorId: 'USR-SITI',
    nominatorName: 'Siti Rahmawati',
    fullName: 'Dimas Arya Nugraha',
    phone: '085722334411',
    region: 'Kec. Coblong, Kel. Dago',
    interest: 'Logistik posko',
    consentGiven: true,
    nominatedAt: daysAgo(9),
    status: 'VERIFIED',
  },
];

/** Store in-memory; array hanya diganti saat `save`, aman untuk `useSyncExternalStore`. */
export class MockNominationRepository implements NominationRepository {
  private items: NominatedVolunteer[] = SEED;
  private readonly listeners = new Set<() => void>();

  getAll = (): NominatedVolunteer[] => this.items;

  save = (nomination: NominatedVolunteer): void => {
    const exists = this.items.some((n) => n.id === nomination.id);
    this.items = exists
      ? this.items.map((n) => (n.id === nomination.id ? nomination : n))
      : [nomination, ...this.items];
    this.listeners.forEach((listener) => listener());
  };

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
}
