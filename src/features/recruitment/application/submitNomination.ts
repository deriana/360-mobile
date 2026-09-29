import { fail, ok, Result } from '../../../core/result';
import { AccountSnapshot } from '../../account/domain/account';
import { NominationInput } from '../domain/nominatedVolunteer';
import { canRecruit, isSameDay, normalizePhone, validateNomination } from '../domain/recruitmentRules';
import { RecruitmentUseCaseDeps, RecruitmentUseCaseOutput } from './recruitmentUseCaseTypes';

/**
 * Relawan mendaftarkan calon relawan. Calon masuk antrean verifikasi tim pusat;
 * akses akun dikirim backend via WhatsApp setelah terverifikasi.
 */
export function submitNomination(
  deps: RecruitmentUseCaseDeps,
  input: { account: AccountSnapshot; form: NominationInput; knownPhones?: string[] },
): Result<RecruitmentUseCaseOutput> {
  const now = deps.now();
  const all = deps.repository.getAll();
  const mineToday = all.filter((n) => n.nominatorId === input.account.userId && isSameDay(n.nominatedAt, now)).length;

  const access = canRecruit(input.account, mineToday);
  if (!access.allowed) return fail(access.reason ?? 'Belum bisa mengajukan calon relawan.');

  const existingPhones = [...all.map((n) => n.phone), input.account.phone, ...(input.knownPhones ?? [])];
  const errors = validateNomination(input.form, existingPhones);
  const firstError = Object.values(errors)[0];
  if (firstError) return fail(firstError);

  const nomination = {
    ...input.form,
    fullName: input.form.fullName.trim(),
    phone: normalizePhone(input.form.phone),
    region: input.form.region.trim(),
    interest: input.form.interest?.trim() || undefined,
    note: input.form.note?.trim() || undefined,
    id: `NOM-${now.getTime()}`,
    nominatorId: input.account.userId,
    nominatorName: input.account.name,
    nominatedAt: now.toISOString(),
    status: 'PENDING_VERIFICATION' as const,
  };
  deps.repository.save(nomination);
  deps.outbox?.enqueue(nomination);

  return ok({
    nomination,
    notice: {
      title: 'Pengajuan Calon Relawan Terkirim',
      body: `Data ${nomination.fullName} dikirim ke tim pusat untuk verifikasi. Akses akun akan dikirim via WhatsApp setelah diverifikasi.`,
    },
  });
}
