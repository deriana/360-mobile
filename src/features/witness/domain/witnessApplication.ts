/**
 * Siklus pengajuan saksi (AGENTS.md §20.3), dengan istilah diselaraskan ke Saksi360-Admin:
 * APPROVED = saksi "siaga" (lulus, belum dapat TPS); ASSIGNED = penugasan aktif + surat mandat.
 */
export type WitnessApplicationStatus =
  | 'NOT_APPLIED'
  | 'SCREENING'
  | 'REVISION'
  | 'REJECTED'
  | 'TRAINING'
  | 'APPROVED'
  | 'ASSIGNED'
  | 'REVOKED'
  | 'COMPLETED';

/** Sama dengan `SuratStatus` di Saksi360-Admin (`surat-tugas/data/surat.ts`). */
export type AssignmentLetterStatus = 'terbit' | 'terkirim' | 'diterima';

/** Sama dengan `ReportLifecycleStatus` di Saksi360-Admin (`command-center/types`). */
export type ReportLifecycleStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'IN_VERIFICATION'
  | 'VERIFIED'
  | 'CORRECTION_REQUESTED'
  | 'REJECTED';

/** Sama dengan `CheckinStatus` di Saksi360-Admin. */
export type CheckinStatus = 'ON_TIME' | 'LATE' | 'OUT_OF_GEOFENCE';

/** Nama field mengikuti `KtpData` / `masterSaksiFormSchema` di Saksi360-Admin. */
export interface KtpData {
  nik: string;
  nama: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: string;
  alamat: string;
  rtRw: string;
  kelurahan: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  agama: string;
  statusPerkawinan: string;
  pekerjaan: string;
}

/** Jawaban cek syarat saksi (UU 7/2017 & aturan netralitas). */
export interface WitnessEligibilityAnswers {
  ageAtLeast17: boolean;
  hasKtpEl: boolean;
  notElectionOrganizer: boolean;
  notCivilServantOrSecurity: boolean;
}

export interface TpsPreference {
  kelurahan: string;
  tpsNumber?: string;
}

export interface WitnessApplicationForm {
  eligibility: WitnessEligibilityAnswers;
  ktpData: KtpData;
  noHp: string;
  hasFacePhoto: boolean;
  tpsPreference: TpsPreference;
  integrityPledgeAccepted: boolean;
  dataConsentAccepted: boolean;
}

export interface WitnessApplication {
  userId: string;
  status: WitnessApplicationStatus;
  updatedAt: string;
  submittedAt?: string;
  form?: WitnessApplicationForm;
  /** Catatan dari verifikator Web Command Center (alasan perbaikan/penolakan). */
  reviewNote?: string;
  trainingCompletedAt?: string;
  assignedTpsId?: string;
  assignedTpsLabel?: string;
  mandateNumber?: string;
  mandateQrToken?: string;
  letterStatus?: AssignmentLetterStatus;
  revokedReason?: string;
}

export const EMPTY_KTP_DATA: KtpData = {
  nik: '',
  nama: '',
  tempatLahir: '',
  tanggalLahir: '',
  jenisKelamin: '',
  alamat: '',
  rtRw: '',
  kelurahan: '',
  kecamatan: '',
  kabupaten: '',
  provinsi: '',
  agama: '',
  statusPerkawinan: '',
  pekerjaan: '',
};

/** Transisi status yang sah. Keputusan verifikasi datang dari Web Command Center. */
const ALLOWED_TRANSITIONS: Record<WitnessApplicationStatus, WitnessApplicationStatus[]> = {
  NOT_APPLIED: ['SCREENING'],
  SCREENING: ['REVISION', 'REJECTED', 'TRAINING'],
  REVISION: ['SCREENING'],
  REJECTED: ['SCREENING'],
  TRAINING: ['APPROVED'],
  APPROVED: ['ASSIGNED'],
  ASSIGNED: ['REVOKED', 'COMPLETED'],
  REVOKED: ['ASSIGNED'],
  COMPLETED: [],
};

export function canTransition(from: WitnessApplicationStatus, to: WitnessApplicationStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}
