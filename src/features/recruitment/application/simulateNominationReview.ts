import { fail, ok, Result } from '../../../core/result';
import { RecruitmentUseCaseDeps, RecruitmentUseCaseOutput } from './recruitmentUseCaseTypes';

/** KHUSUS DEMO (`FEATURE_FLAGS.demoControls`): meniru keputusan verifikasi relawan di Web Command Center. */
export function simulateNominationReview(
  deps: RecruitmentUseCaseDeps,
  input: { nominationId: string; verdict: 'VERIFIED' | 'REJECTED' },
): Result<RecruitmentUseCaseOutput> {
  const current = deps.repository.getAll().find((n) => n.id === input.nominationId);
  if (!current || current.status !== 'PENDING_VERIFICATION') {
    return fail('Pengajuan ini sudah diputuskan sebelumnya.');
  }

  const verified = input.verdict === 'VERIFIED';
  const nomination = {
    ...current,
    status: input.verdict,
    reviewNote: verified ? undefined : 'Nomor WhatsApp tidak dapat dihubungi. Periksa kembali nomornya.',
  };
  deps.repository.save(nomination);

  return ok({
    nomination,
    notice: verified
      ? { title: 'Calon Relawan Terverifikasi', body: `${nomination.fullName} resmi menjadi relawan. Terima kasih sudah mengajak!` }
      : { title: 'Pengajuan Calon Relawan Ditolak', body: nomination.reviewNote ?? '' },
  });
}
