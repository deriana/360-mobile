import { fail, ok, Result } from '../../../core/result';
import { WitnessUseCaseDeps, WitnessUseCaseOutput } from './witnessUseCaseTypes';

/**
 * Saksi menyatakan surat tugas sudah diterima → status surat di web menjadi `diterima`
 * (StatusStepper di Saksi360-Admin: terbit → terkirim → diterima).
 */
export function acceptAssignmentLetter(
  deps: WitnessUseCaseDeps,
  input: { userId: string },
): Result<WitnessUseCaseOutput> {
  const current = deps.repository.get(input.userId);
  if (!current || current.status !== 'ASSIGNED') {
    return fail('Surat tugas hanya tersedia setelah Anda ditugaskan di TPS.');
  }
  if (current.letterStatus === 'diterima') {
    return fail('Surat tugas sudah Anda terima sebelumnya.');
  }

  const application = { ...current, letterStatus: 'diterima' as const, updatedAt: deps.now().toISOString() };
  deps.repository.save(application);
  deps.outbox?.enqueue('assignment_letter', {
    userId: application.userId,
    mandateNumber: application.mandateNumber,
    letterStatus: application.letterStatus,
  });

  return ok({
    application,
    notice: {
      title: 'Surat Tugas Diterima',
      body: 'Tunjukkan surat mandat beserta KTP-el kepada KPPS saat tiba di TPS.',
    },
  });
}
