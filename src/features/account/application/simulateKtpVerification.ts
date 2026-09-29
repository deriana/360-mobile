import { fail, ok, Result } from '../../../core/result';
import { VolunteerActivityRepository } from '../domain/volunteerActivityRepository';

/**
 * KHUSUS DEMO (dipakai bila `FEATURE_FLAGS.demoControls`): meniru tim pusat yang
 * memverifikasi data KTP relawan di Web Command Center.
 */
export function simulateKtpVerification(
  repository: VolunteerActivityRepository,
  input: { userId: string },
): Result<{ title: string; body: string }> {
  if (repository.getRecord(input.userId)?.volunteerVerification === 'terverifikasi') {
    return fail('Data KTP Anda sudah terverifikasi.');
  }
  repository.save({ userId: input.userId, volunteerVerification: 'terverifikasi' });
  return ok({
    title: 'Data KTP Terverifikasi',
    body: 'Tim pusat sudah memverifikasi data KTP Anda. Pendaftaran saksi dan Ajak Relawan kini terbuka.',
  });
}
