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

export class MockVolunteerActivityRepository implements VolunteerActivityRepository {
  private readonly records = new Map(SEED.map((record) => [record.userId, record]));

  getRecord = (userId: string): VolunteerActivityRecord | null => this.records.get(userId) ?? null;
}
