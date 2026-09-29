import { WitnessApplicationForm } from './witnessApplication';

export type WitnessFormField =
  | 'eligibility'
  | 'nik'
  | 'nama'
  | 'tanggalLahir'
  | 'kelurahan'
  | 'kecamatan'
  | 'kabupaten'
  | 'noHp'
  | 'hasFacePhoto'
  | 'tpsKelurahan'
  | 'integrityPledgeAccepted'
  | 'dataConsentAccepted';

export type WitnessFormErrors = Partial<Record<WitnessFormField, string>>;

export const MIN_WITNESS_AGE = 17;

/** Terima format "DD-MM-YYYY", "DD/MM/YYYY", atau "YYYY-MM-DD" (hasil OCR KTP bervariasi). */
export function parseBirthDate(value: string): Date | null {
  const text = value.trim();
  let match = text.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (match) return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
  match = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return null;
}

export function ageOn(birthDate: Date, now: Date): number {
  let age = now.getFullYear() - birthDate.getFullYear();
  const beforeBirthday =
    now.getMonth() < birthDate.getMonth() ||
    (now.getMonth() === birthDate.getMonth() && now.getDate() < birthDate.getDate());
  if (beforeBirthday) age -= 1;
  return age;
}

/** Aturan langkah 1 (cek syarat). */
export function validateEligibility(form: Pick<WitnessApplicationForm, 'eligibility'>): WitnessFormErrors {
  const e = form.eligibility;
  const allChecked = e.ageAtLeast17 && e.hasKtpEl && e.notElectionOrganizer && e.notCivilServantOrSecurity;
  return allChecked ? {} : { eligibility: 'Semua syarat wajib terpenuhi untuk menjadi saksi.' };
}

/** Aturan langkah 2 (data KTP, kontak, preferensi TPS). Field mengikuti `masterSaksiFormSchema` web. */
export function validateIdentity(form: WitnessApplicationForm, now: Date): WitnessFormErrors {
  const errors: WitnessFormErrors = {};
  const { ktpData } = form;

  if (!/^\d{16}$/.test(ktpData.nik.trim())) errors.nik = 'NIK harus 16 digit angka.';
  if (ktpData.nama.trim().length < 3) errors.nama = 'Nama lengkap wajib diisi.';

  const birthDate = parseBirthDate(ktpData.tanggalLahir);
  if (!birthDate) {
    errors.tanggalLahir = 'Tanggal lahir wajib diisi (contoh: 12-06-1998).';
  } else if (ageOn(birthDate, now) < MIN_WITNESS_AGE) {
    errors.tanggalLahir = `Usia minimal ${MIN_WITNESS_AGE} tahun untuk menjadi saksi.`;
  }

  if (!ktpData.kelurahan.trim()) errors.kelurahan = 'Kelurahan/desa wajib diisi.';
  if (!ktpData.kecamatan.trim()) errors.kecamatan = 'Kecamatan wajib diisi.';
  if (!ktpData.kabupaten.trim()) errors.kabupaten = 'Kabupaten/kota wajib diisi.';
  if (!/^08\d{8,12}$/.test(form.noHp.replace(/\D/g, ''))) {
    errors.noHp = 'Nomor HP tidak valid, contoh: 081234567890.';
  }
  if (!form.hasFacePhoto) errors.hasFacePhoto = 'Ambil foto wajah untuk verifikasi identitas.';
  if (!form.tpsPreference.kelurahan.trim()) errors.tpsKelurahan = 'Isi kelurahan TPS yang Anda inginkan.';

  return errors;
}

/** Aturan langkah 3 (pernyataan & persetujuan data). */
export function validateDeclaration(form: WitnessApplicationForm): WitnessFormErrors {
  const errors: WitnessFormErrors = {};
  if (!form.integrityPledgeAccepted) errors.integrityPledgeAccepted = 'Centang pakta integritas untuk melanjutkan.';
  if (!form.dataConsentAccepted) errors.dataConsentAccepted = 'Centang persetujuan pemrosesan data untuk melanjutkan.';
  return errors;
}

export function validateWitnessForm(form: WitnessApplicationForm, now: Date): WitnessFormErrors {
  return { ...validateEligibility(form), ...validateIdentity(form, now), ...validateDeclaration(form) };
}

export function hasErrors(errors: WitnessFormErrors): boolean {
  return Object.keys(errors).length > 0;
}
