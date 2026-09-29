import { VolunteerActivityRecord } from '../domain/account';
import { VolunteerActivityRepository } from '../domain/volunteerActivityRepository';

/**
 * Data demo per akun (ID mengikuti `USER_PROFILES_BY_EMAIL` di `src/utils/userContext.ts`).
 * `USR-RELAWAN-BARU` & `USR-RELAWAN-LATIH` adalah akun demo baru yang ditambahkan di Tahap B.
 */
const SEED: VolunteerActivityRecord[] = [
  { userId: 'USR-SITI', volunteerVerification: 'terverifikasi' },
  { userId: 'USR-002', volunteerVerification: 'terverifikasi' },
  { userId: 'USR-001', volunteerVerification: 'terverifikasi' },
  { userId: 'USR-RELAWAN-LATIH', volunteerVerification: 'terverifikasi' },
  { userId: 'USR-RELAWAN-BARU', volunteerVerification: 'belum_verifikasi' },
];

/** Store in-memory; referensi objek hanya berganti saat `save`, aman untuk `useSyncExternalStore`. */
export class MockVolunteerActivityRepository implements VolunteerActivityRepository {
  private readonly records = new Map(SEED.map((record) => [record.userId, record]));
  private readonly listeners = new Set<() => void>();

  getRecord = (userId: string): VolunteerActivityRecord | null => this.records.get(userId) ?? null;

  save = (record: VolunteerActivityRecord): void => {
    this.records.set(record.userId, record);
    this.listeners.forEach((listener) => listener());
  };

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
}
