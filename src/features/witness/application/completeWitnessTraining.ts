import { fail, ok, Result } from '../../../core/result';
import { canTransition } from '../domain/witnessApplication';
import { WitnessUseCaseDeps, WitnessUseCaseOutput } from './witnessUseCaseTypes';

/** Tandai pelatihan saksi selesai → status "Siaga" (APPROVED), menunggu penempatan TPS. */
export function completeWitnessTraining(
  deps: WitnessUseCaseDeps,
  input: { userId: string },
): Result<WitnessUseCaseOutput> {
  const current = deps.repository.get(input.userId);
  if (!current || !canTransition(current.status, 'APPROVED')) {
    return fail('Pelatihan saksi hanya bisa diselesaikan setelah data Anda lolos verifikasi.');
  }

  const nowIso = deps.now().toISOString();
  const application = { ...current, status: 'APPROVED' as const, trainingCompletedAt: nowIso, updatedAt: nowIso };
  deps.repository.save(application);

  return ok({
    application,
    notice: {
      title: 'Pelatihan Saksi Selesai',
      body: 'Anda berstatus Siaga. Tim pusat akan menempatkan Anda di TPS dan mengirim surat mandat.',
    },
  });
}
