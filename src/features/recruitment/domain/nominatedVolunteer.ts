/**
 * Pengajuan calon relawan oleh relawan aktif ("Ajak Relawan"). Status & nama field mengikuti
 * `NominatedVolunteerCandidate` yang sudah dipakai `NominateVolunteerScreen`.
 * Calon tidak perlu punya akun; tim pusat memverifikasi lalu mengirim akses via WhatsApp.
 */
export type NominatedVolunteerStatus = 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED';

export interface NominationInput {
  fullName: string;
  phone: string;
  region: string;
  interest?: string;
  note?: string;
  /** Calon sudah setuju datanya didaftarkan & dihubungi via WhatsApp (UU PDP). */
  consentGiven: boolean;
}

export interface NominatedVolunteer extends NominationInput {
  id: string;
  nominatorId: string;
  nominatorName: string;
  nominatedAt: string;
  status: NominatedVolunteerStatus;
  reviewNote?: string;
}

export const NOMINATION_STATUS_INFO: Record<
  NominatedVolunteerStatus,
  { label: string; tone: 'done' | 'waiting' | 'action' }
> = {
  PENDING_VERIFICATION: { label: 'Menunggu verifikasi', tone: 'waiting' },
  VERIFIED: { label: 'Terverifikasi', tone: 'done' },
  REJECTED: { label: 'Ditolak', tone: 'action' },
};
