import { fail, ok, Result } from '../../../core/result';
import { canTransition, WitnessApplication, WitnessApplicationStatus } from '../domain/witnessApplication';
import { WitnessUseCaseDeps, WitnessUseCaseOutput } from './witnessUseCaseTypes';

/**
 * KHUSUS DEMO (dipakai bila `FEATURE_FLAGS.demoControls`): meniru keputusan yang di dunia
 * nyata diambil verifikator/admin di Web Command Center.
 */
export type WitnessReviewDecision = 'APPROVE' | 'REQUEST_REVISION' | 'REJECT' | 'ASSIGN_TPS' | 'REVOKE';

/** Sama dengan TPS persona demo Siti di `witnessResolver` (kode lama) agar Beranda & layar Saksi konsisten. */
const DEMO_ASSIGNMENT = {
  assignedTpsId: 'TPS-018',
  assignedTpsLabel: 'TPS 018 · Kel. Braga, Kec. Sumur Bandung',
  mandateNumber: '018/MND/PAN-BDG/2026',
};

const DECISION_TARGET: Record<WitnessReviewDecision, WitnessApplicationStatus> = {
  APPROVE: 'TRAINING',
  REQUEST_REVISION: 'REVISION',
  REJECT: 'REJECTED',
  ASSIGN_TPS: 'ASSIGNED',
  REVOKE: 'REVOKED',
};

export function simulateWitnessReview(
  deps: WitnessUseCaseDeps,
  input: { userId: string; decision: WitnessReviewDecision },
): Result<WitnessUseCaseOutput> {
  const current = deps.repository.get(input.userId);
  const target = DECISION_TARGET[input.decision];
  if (!current || !canTransition(current.status, target)) {
    return fail('Keputusan ini tidak berlaku untuk status pengajuan saat ini.');
  }

  const nowIso = deps.now().toISOString();
  let application: WitnessApplication = { ...current, status: target, updatedAt: nowIso };
  let notice = { title: '', body: '' };

  switch (input.decision) {
    case 'APPROVE':
      notice = {
        title: 'Data Saksi Terverifikasi',
        body: 'Selamat, data Anda lolos. Langkah berikutnya: selesaikan pelatihan saksi.',
      };
      break;
    case 'REQUEST_REVISION':
      application = { ...application, reviewNote: 'Foto KTP kurang jelas. Mohon unggah ulang foto KTP-el yang terbaca.' };
      notice = { title: 'Data Saksi Perlu Diperbaiki', body: application.reviewNote ?? '' };
      break;
    case 'REJECT':
      application = {
        ...application,
        reviewNote: 'NIK terdaftar sebagai petugas KPPS di TPS lain, sehingga tidak dapat merangkap sebagai saksi.',
      };
      notice = { title: 'Pengajuan Saksi Ditolak', body: application.reviewNote ?? '' };
      break;
    case 'ASSIGN_TPS':
      application = {
        ...application,
        ...DEMO_ASSIGNMENT,
        mandateQrToken: `MANDAT-${input.userId}-${Date.now()}`,
        letterStatus: 'terkirim',
        revokedReason: undefined,
      };
      notice = {
        title: 'Anda Ditugaskan Sebagai Saksi',
        body: `${DEMO_ASSIGNMENT.assignedTpsLabel}. Buka menu Saksi TPS untuk menerima surat tugas.`,
      };
      break;
    case 'REVOKE':
      application = { ...application, revokedReason: 'Penugasan dialihkan oleh koordinator wilayah.' };
      notice = { title: 'Penugasan Saksi Dicabut', body: application.revokedReason ?? '' };
      break;
  }

  deps.repository.save(application);
  return ok({ application, notice });
}
