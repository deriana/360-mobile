import { AccountSnapshot } from '../domain/account';
import { VolunteerActivityRepository } from '../domain/volunteerActivityRepository';

export type AccountBaseInfo = Omit<AccountSnapshot, 'volunteerVerification'> & {
  /** Dipakai bila repository belum punya catatan untuk pengguna ini. */
  fallbackVerification: AccountSnapshot['volunteerVerification'];
};

/** Gabungkan data profil pengguna dengan catatan verifikasi dari repository. */
export function buildAccountSnapshot(
  base: AccountBaseInfo,
  repository: VolunteerActivityRepository,
): AccountSnapshot {
  const { fallbackVerification, ...rest } = base;
  const record = repository.getRecord(base.userId);
  return {
    ...rest,
    volunteerVerification: record?.volunteerVerification ?? fallbackVerification,
  };
}
