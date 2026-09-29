import { AccountSnapshot, AccountType } from './account';

/**
 * Syarat relawan sebelum boleh mendaftar saksi TPS atau mengajak relawan lain.
 *
 * Asal-usul: diturunkan dari definisi "Relawan Aktif Terverifikasi" di Saksi360-Admin
 * (`src/features/command-relawan/config/activity-criteria.ts`). Di web definisi itu hanya
 * dipakai untuk angka KPI dashboard dan juga mensyaratkan aktivitas ≤30 hari + ≥1 kegiatan.
 * Keputusan 29 Sep 2026: di mobile yang dijadikan syarat cukup KTP terverifikasi + status aktif;
 * keaktifan relawan dinilai manual oleh verifikator di web.
 */
export const VOLUNTEER_ELIGIBILITY_CRITERIA = {
  requireKtpVerified: true,
  requireActiveStatus: true,
} as const;

export type EligibilityRequirementId = 'KTP_VERIFIED' | 'ACTIVE_STATUS';

export interface UnmetRequirement {
  id: EligibilityRequirementId;
  label: string;
  hint: string;
}

const REQUIREMENT_TEXT: Record<EligibilityRequirementId, Omit<UnmetRequirement, 'id'>> = {
  KTP_VERIFIED: {
    label: 'Data KTP diverifikasi tim pusat',
    hint: 'Biasanya selesai 1–3 hari kerja setelah mendaftar.',
  },
  ACTIVE_STATUS: {
    label: 'Status relawan aktif',
    hint: 'Aktifkan kembali lewat Profil → Kelola Status.',
  },
};

export function getAccountType(account: AccountSnapshot): AccountType {
  return account.isOfficialMember ? 'ANGGOTA' : 'RELAWAN';
}

/**
 * Mode Command Center (Saksi TPS & Peta Kemenangan) dan Command Center Mobile khusus
 * pengurus partai, pejabat, atau caleg — hanya untuk melihat. Peta Relawan terbuka untuk semua.
 */
export function canSeeCommandCenterModes(account: AccountSnapshot): boolean {
  return account.hasLeadershipRole;
}

/** Cek syarat relawan terverifikasi; mengembalikan syarat yang belum terpenuhi. */
export function checkVolunteerEligibility(account: AccountSnapshot): { ok: boolean; unmet: UnmetRequirement[] } {
  const unmetIds: EligibilityRequirementId[] = [];

  if (VOLUNTEER_ELIGIBILITY_CRITERIA.requireKtpVerified && account.volunteerVerification !== 'terverifikasi') {
    unmetIds.push('KTP_VERIFIED');
  }
  // "Pending" (relawan baru) sudah tercakup syarat KTP; yang dicek di sini hanya dijeda/berhenti.
  const isStopped = ['paused', 'inactive', 'none'].includes(account.volunteerStatus);
  if (VOLUNTEER_ELIGIBILITY_CRITERIA.requireActiveStatus && isStopped) {
    unmetIds.push('ACTIVE_STATUS');
  }

  const unmet = unmetIds.map((id) => ({ id, ...REQUIREMENT_TEXT[id] }));
  return { ok: unmet.length === 0, unmet };
}
