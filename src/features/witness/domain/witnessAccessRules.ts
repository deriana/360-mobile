import { AccountSnapshot, AccountType } from '../../account/domain/account';
import {
  checkVolunteerEligibility,
  getAccountType,
  UnmetRequirement,
} from '../../account/domain/volunteerActivityRules';
import { WitnessApplication, WitnessApplicationStatus } from './witnessApplication';

export type WitnessNextAction =
  | 'COMPLETE_REQUIREMENTS'
  | 'APPLY'
  | 'WAIT_REVIEW'
  | 'FIX_DATA'
  | 'REAPPLY'
  | 'START_TRAINING'
  | 'WAIT_ASSIGNMENT'
  | 'OPEN_ASSIGNMENT'
  | 'CONTACT_COORDINATOR'
  | 'NONE';

export interface WitnessAccess {
  accountType: AccountType;
  status: WitnessApplicationStatus;
  /** Fitur saksi (C1, check-in TPS, surat mandat, dst.) hanya terbuka saat true. */
  isUnlocked: boolean;
  /** Boleh mengirim (atau mengirim ulang) pengajuan saksi sekarang. */
  canApply: boolean;
  unmetRequirements: UnmetRequirement[];
  nextAction: WitnessNextAction;
  /** Alasan singkat bila pengguna tidak punya jalur saksi sama sekali. */
  blockedReason?: string;
}

const NEXT_ACTION_BY_STATUS: Record<WitnessApplicationStatus, WitnessNextAction> = {
  NOT_APPLIED: 'APPLY',
  SCREENING: 'WAIT_REVIEW',
  REVISION: 'FIX_DATA',
  REJECTED: 'REAPPLY',
  TRAINING: 'START_TRAINING',
  APPROVED: 'WAIT_ASSIGNMENT',
  ASSIGNED: 'OPEN_ASSIGNMENT',
  REVOKED: 'CONTACT_COORDINATOR',
  COMPLETED: 'NONE',
};

/**
 * Satu-satunya sumber jawaban "apakah pengguna ini boleh memakai fitur saksi?".
 * Aturan: saksi khusus Relawan; Anggota tidak punya jalur saksi di aplikasi.
 */
export function getWitnessAccess(
  account: AccountSnapshot,
  application: WitnessApplication | null,
): WitnessAccess {
  const accountType = getAccountType(account);
  const status = application?.status ?? 'NOT_APPLIED';

  if (accountType === 'ANGGOTA') {
    return {
      accountType,
      status,
      isUnlocked: false,
      canApply: false,
      unmetRequirements: [],
      nextAction: 'NONE',
      blockedReason: 'Jalur saksi TPS di aplikasi ini khusus untuk relawan.',
    };
  }

  const requirements = checkVolunteerEligibility(account);
  const isApplyStage = status === 'NOT_APPLIED' || status === 'REVISION' || status === 'REJECTED';
  const canApply = isApplyStage && requirements.ok;

  let nextAction = NEXT_ACTION_BY_STATUS[status];
  if (status === 'NOT_APPLIED' && !requirements.ok) nextAction = 'COMPLETE_REQUIREMENTS';

  return {
    accountType,
    status,
    isUnlocked: status === 'ASSIGNED',
    canApply,
    unmetRequirements: isApplyStage ? requirements.unmet : [],
    nextAction,
  };
}
