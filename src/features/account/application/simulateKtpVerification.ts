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
    return fail('Data pendaftaran Anda sudah divalidasi oleh admin DPD.');
  }
  repository.save({ userId: input.userId, volunteerVerification: 'terverifikasi' });
  return ok({
    title: 'Data Berhasil Divalidasi DPD',
    body: 'Admin DPD telah memvalidasi berkas pendaftaran Anda. Status kartu menjadi AKTIF & SAH, penugasan saksi dan fitur Ajak Relawan kini terbuka.',
  });
}
