import { AccountSnapshot } from '../../account/domain/account';
import { checkVolunteerEligibility, getAccountType } from '../../account/domain/volunteerActivityRules';
import { NominationInput } from './nominatedVolunteer';

/** Batas wajar pengajuan per hari agar tidak ada input massal asal-asalan. */
export const DAILY_NOMINATION_LIMIT = 10;

export interface RecruitAccess {
  allowed: boolean;
  /** Alasan singkat + langkah berikutnya bila belum boleh mengajak. */
  reason?: string;
  remainingToday: number;
}

/** Hanya relawan terverifikasi (KTP) dengan status aktif yang boleh mendaftarkan calon relawan. */
export function canRecruit(account: AccountSnapshot, nominationsToday: number): RecruitAccess {
  const remainingToday = Math.max(0, DAILY_NOMINATION_LIMIT - nominationsToday);

  if (getAccountType(account) !== 'RELAWAN') {
    return { allowed: false, reason: 'Fitur Ajak Relawan khusus untuk relawan aktif.', remainingToday };
  }
  const requirements = checkVolunteerEligibility(account);
  if (!requirements.ok) {
    const first = requirements.unmet[0];
    return {
      allowed: false,
      reason: `Selesaikan verifikasi relawan dulu — ${first.label}. ${first.hint}`,
      remainingToday,
    };
  }
  if (remainingToday === 0) {
    return {
      allowed: false,
      reason: `Batas ${DAILY_NOMINATION_LIMIT} pengajuan per hari sudah tercapai. Lanjutkan besok.`,
      remainingToday,
    };
  }
  return { allowed: true, remainingToday };
}

/** Samakan format nomor: "+62 812-3456" / "0812 3456" → "08123456". */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.startsWith('62') ? `0${digits.slice(2)}` : digits;
}

export function maskPhone(phone: string): string {
  const digits = normalizePhone(phone);
  if (digits.length < 8) return digits;
  return `${digits.slice(0, 4)}-****-${digits.slice(-3)}`;
}

export type NominationField = 'fullName' | 'phone' | 'region' | 'consentGiven';
export type NominationErrors = Partial<Record<NominationField, string>>;

export function validateNomination(input: NominationInput, existingPhones: string[]): NominationErrors {
  const errors: NominationErrors = {};
  const phone = normalizePhone(input.phone);

  if (input.fullName.trim().length < 3) errors.fullName = 'Nama lengkap wajib diisi.';
  if (!/^08\d{8,12}$/.test(phone)) {
    errors.phone = 'Nomor WhatsApp tidak valid, contoh: 081234567890.';
  } else if (existingPhones.map(normalizePhone).includes(phone)) {
    errors.phone = 'Nomor ini sudah terdaftar atau sudah diajukan sebelumnya.';
  }
  if (!input.region.trim()) errors.region = 'Wilayah (kecamatan/kelurahan) wajib diisi.';
  if (!input.consentGiven) errors.consentGiven = 'Pastikan calon sudah setuju datanya didaftarkan.';

  return errors;
}

export function isSameDay(isoDate: string, now: Date): boolean {
  const date = new Date(isoDate);
  return (
    date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate()
  );
}
