import { Role } from '../types';

export interface Account {
  role: Role;
  email: string;
  password: string;
  name: string;
}

// ================================================================
// AKUN MOBILE LAPANGAN RESMI (Sesuai Bab 5 AGENTS.md)
// 1. Saksi TPS (WITNESS)
// 2. Relawan Lapangan (VOLUNTEER)
// 3. Koordinator TPS / Lapangan (TPS_COORDINATOR / FIELD_COORDINATOR)
// 4. Kader & Anggota Partai (MEMBER)
// ================================================================

export const WITNESS_ACCOUNTS: Account[] = [
  {
    role: 'WITNESS',
    email: 'saksi@pan.go.id',
    password: 'saksi123',
    name: 'Rudi Saputra (Relawan + Mandat Saksi TPS 001)',
  },
];

export const VOLUNTEER_ACCOUNTS: Account[] = [
  {
    role: 'VOLUNTEER',
    email: 'relawan@pan.go.id',
    password: 'relawan123',
    name: 'Siti Rahmawati (Relawan Simpatisan)',
  },
];

export const COORDINATOR_ACCOUNTS: Account[] = [
  {
    role: 'TPS_COORDINATOR',
    email: 'korlap@pan.go.id',
    password: 'korlap123',
    name: 'Asep Ridwan (Koordinator TPS Kluster 6)',
  },
  {
    role: 'FIELD_COORDINATOR',
    email: 'korlap.wilayah@pan.go.id',
    password: 'korlap123',
    name: 'Asep Ridwan (Koordinator Lapangan Coblong)',
  },
];

export const MEMBER_ACCOUNTS: Account[] = [
  {
    role: 'MEMBER',
    email: 'kader@pan.go.id',
    password: 'kader123',
    name: 'Fajar Pratama Nugraha, S.T. (Kader simPAN)',
  },
  {
    role: 'MEMBER',
    email: 'anggota@pan.go.id',
    password: 'anggota123',
    name: 'Dina Permata (Anggota Partai)',
  },
];

// Akun pendukung & legacy untuk verifikasi form login manual
export const LEGACY_AND_WEB_ACCOUNTS: Account[] = [
  { role: 'TPS_WITNESS', email: 'saksi.lama@pan.go.id', password: 'saksi123', name: 'Rudi Saputra (Legacy Saksi)' },
  { role: 'RELAWAN', email: 'relawan.lama@pan.go.id', password: 'relawan123', name: 'Siti Rahmawati (Legacy Relawan)' },
  { role: 'OPERATOR', email: 'operator@pan.go.id', password: 'operator123', name: 'Budi Pratama (Operator Lapangan)' },
  { role: 'CALEG', email: 'caleg@pan.go.id', password: 'caleg123', name: 'Dr. H. Ahmad Fauzi (Caleg DPR-RI Jabar 1)' },
  { role: 'DPD', email: 'dpd@pan.go.id', password: 'dpd123', name: 'H. Rasyid Rajasa (DPD Kota Bandung)' },
  { role: 'DPC', email: 'dpc@pan.go.id', password: 'dpc123', name: 'Ir. Hendra Gunawan (DPC Coblong)' },
  { role: 'PAC', email: 'pac@pan.go.id', password: 'pac123', name: 'Cecep Kusnadi (PAC Ranting Dago)' },
  { role: 'DPW', email: 'dpw@pan.go.id', password: 'dpw123', name: 'H. M. Hasbullah Rahmad (DPW Jawa Barat)' },
  { role: 'DPP', email: 'dpp@pan.go.id', password: 'dpp123', name: 'Dr. (H.C.) Zulkifli Hasan (DPP PAN)' },
];

export const MOBILE_FIELD_ACCOUNTS: Account[] = [
  ...WITNESS_ACCOUNTS,
  ...VOLUNTEER_ACCOUNTS,
  ...COORDINATOR_ACCOUNTS,
  ...MEMBER_ACCOUNTS,
];

export const ACCOUNTS: Account[] = [
  ...MOBILE_FIELD_ACCOUNTS,
  ...LEGACY_AND_WEB_ACCOUNTS,
];

export function findAccount(email: string, password: string): Account | null {
  const normalized = email.trim().toLowerCase();
  return ACCOUNTS.find((a) => a.email === normalized && a.password === password) ?? null;
}
