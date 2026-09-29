import { fail, ok, Result } from '../../../core/result';
import { AccountSnapshot } from '../../account/domain/account';
import { WitnessApplicationForm } from '../domain/witnessApplication';
import { getWitnessAccess } from '../domain/witnessAccessRules';
import { hasErrors, validateWitnessForm } from '../domain/witnessFormRules';
import { WitnessUseCaseDeps, WitnessUseCaseOutput } from './witnessUseCaseTypes';

/**
 * Kirim pengajuan saksi pertama kali, atau kirim ulang setelah "Perlu perbaikan" / "Ditolak".
 * Status berpindah ke SCREENING dan menunggu keputusan verifikator di Web Command Center.
 */
export function submitWitnessApplication(
  deps: WitnessUseCaseDeps,
  input: { account: AccountSnapshot; form: WitnessApplicationForm },
): Result<WitnessUseCaseOutput> {
  const now = deps.now();
  const current = deps.repository.get(input.account.userId);
  const access = getWitnessAccess(input.account, current);

  if (!access.canApply) {
    if (access.blockedReason) return fail(access.blockedReason);
    if (access.unmetRequirements.length > 0) {
      return fail(`Syarat belum lengkap: ${access.unmetRequirements.map((r) => r.label).join(', ')}.`);
    }
    return fail('Pengajuan Anda sedang diproses, belum bisa dikirim ulang.');
  }

  if (hasErrors(validateWitnessForm(input.form, now))) {
    return fail('Masih ada data yang belum lengkap. Periksa kembali isian Anda.');
  }

  const isResubmit = access.status === 'REVISION' || access.status === 'REJECTED';
  const application = {
    ...(current ?? { userId: input.account.userId }),
    status: 'SCREENING' as const,
    form: input.form,
    submittedAt: now.toISOString(),
    updatedAt: now.toISOString(),
    reviewNote: undefined,
  };
  deps.repository.save(application);
  deps.outbox?.enqueue('witness_application', {
    userId: application.userId,
    status: application.status,
    form: application.form,
  });

  return ok({
    application,
    notice: {
      title: isResubmit ? 'Perbaikan Data Terkirim' : 'Pengajuan Saksi Terkirim',
      body: 'Tim pusat akan memeriksa data Anda, biasanya 1–3 hari kerja. Status bisa dipantau di menu Saksi TPS.',
    },
  });
}
