import { Role } from '../types';

export interface Account {
  role: Role;
  email: string;
  password: string;
  name: string;
}

// 3 Mobile Field Accounts (Saksi TPS, Operator Lapangan, Koordinator TPS)
export const MOBILE_FIELD_ACCOUNTS: Account[] = [
  { role: 'TPS_WITNESS', email: 'saksi@saksi360.demo', password: 'saksi123', name: 'Rudi Saputra (Saksi TPS)' },
  { role: 'OPERATOR', email: 'operator@saksi360.demo', password: 'operator123', name: 'Budi Pratama (Operator Lapangan)' },
  { role: 'TPS_COORDINATOR', email: 'korlap@saksi360.demo', password: 'korlap123', name: 'Asep Ridwan (Koordinator TPS)' },
];

// 4 Web Control Tower Accounts (PAC, DPC, DPD, DPW/DPP)
export const WEB_CONTROL_ACCOUNTS: Account[] = [
  { role: 'PAC', email: 'pac@saksi360.demo', password: 'pac123', name: 'Admin PAC Ranting' },
  { role: 'DPC', email: 'dpc@saksi360.demo', password: 'dpc123', name: 'Admin DPC Kecamatan' },
  { role: 'DPD', email: 'dpd@saksi360.demo', password: 'dpd123', name: 'Admin DPD Kota Bandung' },
  { role: 'DPW', email: 'dpw@saksi360.demo', password: 'dpw123', name: 'Admin DPW Jabar' },
  { role: 'DPP', email: 'dpp@saksi360.demo', password: 'dpp123', name: 'Admin DPP Pusat' },
];

export const ACCOUNTS: Account[] = [...MOBILE_FIELD_ACCOUNTS, ...WEB_CONTROL_ACCOUNTS];

export function findAccount(email: string, password: string): Account | null {
  const normalized = email.trim().toLowerCase();
  return ACCOUNTS.find((a) => a.email === normalized && a.password === password) ?? null;
}
