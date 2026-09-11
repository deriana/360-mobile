import { Role } from '../types';

export interface Account {
  role: Role;
  email: string;
  password: string;
  name: string;
}

// 1. Akun Saksi & Lapangan (Saksi TPS, Operator Lapangan, Koordinator TPS)
export const MOBILE_FIELD_ACCOUNTS: Account[] = [
  { role: 'TPS_WITNESS', email: 'saksi@pan.go.id', password: 'saksi123', name: 'Rudi Saputra (Saksi TPS PAN)' },
  { role: 'OPERATOR', email: 'operator@pan.go.id', password: 'operator123', name: 'Budi Pratama (Operator Lapangan PAN)' },
  { role: 'TPS_COORDINATOR', email: 'korlap@pan.go.id', password: 'korlap123', name: 'Asep Ridwan (Koordinator TPS PAN)' },
];

// 2. Akun Caleg & Kader Calon Parlemen simPAN
export const CADRE_CANDIDATE_ACCOUNTS: Account[] = [
  { role: 'KADER_ANGGOTA', email: 'kader@pan.go.id', password: 'kader123', name: 'Fajar Pratama Nugraha, S.T. (Kader / Calon Parlemen DPR-RI)' },
  { role: 'CALEG', email: 'caleg@pan.go.id', password: 'caleg123', name: 'Dr. H. Ahmad Fauzi, M.Si. (Caleg DPR-RI No. 1 Dapil Jabar 1)' },
];

// 3. Akun Pengurus Struktur Wilayah (PAC, DPC, DPD, DPW, DPP)
export const PENGURUS_ACCOUNTS: Account[] = [
  { role: 'DPD', email: 'dpd@pan.go.id', password: 'dpd123', name: 'H. Rasyid Rajasa (Ketua DPD PAN Kota Bandung)' },
  { role: 'DPC', email: 'dpc@pan.go.id', password: 'dpc123', name: 'Ir. Hendra Gunawan (Ketua DPC PAN Coblong)' },
  { role: 'PAC', email: 'pac@pan.go.id', password: 'pac123', name: 'Cecep Kusnadi (Pengurus Ranting Dago)' },
  { role: 'DPW', email: 'dpw@pan.go.id', password: 'dpw123', name: 'H. M. Hasbullah Rahmad (Ketua DPW PAN Jawa Barat)' },
  { role: 'DPP', email: 'dpp@pan.go.id', password: 'dpp123', name: 'Dr. (H.C.) Zulkifli Hasan (Ketua Umum DPP PAN)' },
];

export const WEB_CONTROL_ACCOUNTS: Account[] = PENGURUS_ACCOUNTS;

export const ACCOUNTS: Account[] = [
  ...MOBILE_FIELD_ACCOUNTS,
  ...CADRE_CANDIDATE_ACCOUNTS,
  ...PENGURUS_ACCOUNTS,
];

export function findAccount(email: string, password: string): Account | null {
  const normalized = email.trim().toLowerCase();
  return ACCOUNTS.find((a) => a.email === normalized && a.password === password) ?? null;
}
