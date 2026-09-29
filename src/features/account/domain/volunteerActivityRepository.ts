import { VolunteerActivityRecord } from './account';

/** Sumber catatan verifikasi relawan (mock sekarang, API Web Command Center nanti). */
export interface VolunteerActivityRepository {
  getRecord(userId: string): VolunteerActivityRecord | null;
}
