import { Coordinator, Role, Tps, Witness } from '../types';

export const CURRENT_WITNESS_ID = 'SAKSI-001';
export const CURRENT_COORDINATOR_ID = 'COORD-1';

// Each non-witness role is anchored to one mock home region/unit for this demo.
export const ROLE_HOME: Record<Role, { province?: string; regency?: string; district?: string; coordinatorId?: string }> = {
  DPP: {},
  DPW: { province: 'Jawa Barat' },
  DPD: { province: 'Jawa Barat', regency: 'Kota Bandung' },
  DPC: { province: 'Jawa Barat', regency: 'Kota Bandung', district: 'Coblong' },
  PAC: { province: 'Jawa Barat', regency: 'Kota Bandung', district: 'Coblong' },
  TPS_COORDINATOR: { province: 'Jawa Barat', regency: 'Kota Bandung', district: 'Coblong', coordinatorId: 'COORD-1' },
  OPERATOR: { province: 'Jawa Barat', regency: 'Kota Bandung' },
  TPS_WITNESS: {},
  RELAWAN: { province: 'Jawa Barat', regency: 'Kota Bandung', district: 'Coblong' },
  CALEG: { province: 'Jawa Barat', regency: 'Kota Bandung' },
  KADER_ANGGOTA: { province: 'Jawa Barat', regency: 'Kota Bandung' },
};

export const ROLE_LABEL: Record<Role, string> = {
  DPP: 'DPP PAN — Tingkat Nasional',
  DPW: 'DPW PAN — Provinsi Jawa Barat',
  DPD: 'DPD PAN — Kota Bandung',
  DPC: 'DPC PAN — Kecamatan Coblong',
  PAC: 'PAC PAN — Ranting Coblong',
  TPS_COORDINATOR: 'Koordinator TPS PAN Lapangan (6 TPS)',
  OPERATOR: 'Operator Lapangan PAN (Kota Bandung)',
  TPS_WITNESS: 'Saksi Resmi TPS — Partai Amanat Nasional',
  RELAWAN: 'Relawan Lapangan & Pengawal Suara — PAN 360',
  CALEG: 'Caleg DPR-RI Dapil Jabar I (No. Urut 1)',
  KADER_ANGGOTA: 'Kader & Calon Parlemen DPR-RI — Partai Amanat Nasional',
};

export const ROLE_SCOPE_DESCRIPTION: Record<Role, string> = {
  DPP: 'Cakupan Nasional — DPP PAN memantau seluruh TPS di 38 Provinsi',
  DPW: 'Cakupan DPW PAN — Memantau TPS di wilayah Provinsi Jawa Barat',
  DPD: 'Cakupan DPD PAN — Memantau TPS di Kabupaten/Kota Bandung',
  DPC: 'Cakupan DPC PAN — Memantau TPS di Kecamatan Coblong',
  PAC: 'Cakupan PAC PAN — Memantau TPS di Kelurahan & Ranting',
  TPS_COORDINATOR: 'Cakupan Kluster TPS PAN — Supervisi 6 TPS di wilayah Kelurahan Dago',
  OPERATOR: 'Cakupan Operator PAN — Memantau & Mendampingi Saksi se-Kota Bandung',
  TPS_WITNESS: 'Cakupan Saksi PAN — TPS 001 Kel. Dago, Kec. Coblong, Kota Bandung',
  RELAWAN: 'Cakupan Relawan — Mobilisasi Pemilih & Pemantauan TPS Wilayah Kelurahan Dago',
  CALEG: 'Cakupan Dapil Jabar I — Monitoring Suara Caleg, Perolehan Partai & Rekap C1',
  KADER_ANGGOTA: 'Cakupan Calon Parlemen — Monitoring Suara Pribadi Masuk, Suara Partai & e-KTA',
};

export interface UserProfile {
  name: string;
  nik: string;
  phone: string;
  email: string;
  badgeId: string;
  roleLabel: string;
  scopeLocation: string;
  avatarIndex: number;
}

export function getUserProfile(role: Role): UserProfile {
  switch (role) {
    case 'CALEG':
      return {
        name: 'Dr. H. Ahmad Fauzi, M.Si.',
        nik: '3273010505780004',
        phone: '0812-9988-7766',
        email: 'caleg@pan.go.id',
        badgeId: 'CALEG-PAN-JBR1-01',
        roleLabel: 'Caleg DPR-RI Dapil Jabar I (No. Urut 1)',
        scopeLocation: 'Dapil Jabar I (Kota Bandung & Cimahi)',
        avatarIndex: 2,
      };
    case 'KADER_ANGGOTA':
      return {
        name: 'Fajar Pratama Nugraha, S.T.',
        nik: '3273011508920005',
        phone: '0813-2211-4433',
        email: 'kader@pan.go.id',
        badgeId: 'KTA-PAN-3273-08912',
        roleLabel: 'Kader & Calon Parlemen DPR-RI Dapil Jabar 1 (No. Urut 2)',
        scopeLocation: 'Dapil Jabar I (Kota Bandung & Cimahi)',
        avatarIndex: 1,
      };
    case 'DPD':
      return {
        name: 'H. Rasyid Rajasa, B.Bus.',
        nik: '3273010101700001',
        phone: '0811-9988-1234',
        email: 'dpd@pan.go.id',
        badgeId: 'DPD-PAN-BDG-01',
        roleLabel: 'Ketua DPD PAN Kota Bandung',
        scopeLocation: 'DPD Kota Bandung, Jawa Barat',
        avatarIndex: 5,
      };
    case 'DPC':
      return {
        name: 'Ir. Hendra Gunawan',
        nik: '3273010303820003',
        phone: '0812-9900-1122',
        email: 'dpc@pan.go.id',
        badgeId: 'DPC-PAN-CBL-01',
        roleLabel: 'Ketua DPC PAN Coblong',
        scopeLocation: 'Kec. Coblong, Kota Bandung',
        avatarIndex: 7,
      };
    case 'DPW':
      return {
        name: 'H. M. Hasbullah Rahmad, M.Hum.',
        nik: '3273010202750002',
        phone: '0812-2345-6789',
        email: 'dpw@pan.go.id',
        badgeId: 'DPW-PAN-JBR-01',
        roleLabel: 'Ketua DPW PAN Jawa Barat',
        scopeLocation: 'Jawa Barat (27 Kab/Kota)',
        avatarIndex: 3,
      };
    case 'DPP':
      return {
        name: 'Dr. (H.C.) Zulkifli Hasan, S.E., M.M.',
        nik: '3171010101620001',
        phone: '0811-1000-2000',
        email: 'dpp@pan.go.id',
        badgeId: 'DPP-PAN-001',
        roleLabel: 'Ketua Umum DPP PAN',
        scopeLocation: 'Tingkat Nasional (38 Provinsi)',
        avatarIndex: 0,
      };
    case 'PAC':
      return {
        name: 'Cecep Kusnadi',
        nik: '3273010404880004',
        phone: '0813-4567-8901',
        email: 'pac@pan.go.id',
        badgeId: 'PAC-PAN-DGO-01',
        roleLabel: 'Pengurus Ranting PAN Dago',
        scopeLocation: 'Kel. Dago, Kec. Coblong',
        avatarIndex: 8,
      };
    case 'OPERATOR':
      return {
        name: 'Budi Pratama',
        nik: '3273012508880003',
        phone: '0813-8899-7711',
        email: 'operator@pan.go.id',
        badgeId: 'OPS-PAN-BANDUNG-01',
        roleLabel: 'Operator Lapangan PAN (Kota Bandung)',
        scopeLocation: 'Kota Bandung, Jawa Barat',
        avatarIndex: 1,
      };
    case 'TPS_COORDINATOR':
      return {
        name: 'Asep Ridwan',
        nik: '3273011503850002',
        phone: '0811-2233-4455',
        email: 'korlap@pan.go.id',
        badgeId: 'KORLAP-PAN-DAGO-01',
        roleLabel: 'Koordinator TPS PAN (Kluster 6)',
        scopeLocation: 'Kel. Dago, Kec. Coblong, Kota Bandung',
        avatarIndex: 3,
      };
    case 'RELAWAN':
      return {
        name: 'Siti Rahmawati',
        nik: '3273014506950002',
        phone: '0812-8877-6655',
        email: 'relawan@pan.go.id',
        badgeId: 'REL-PAN-DGO-01',
        roleLabel: 'Relawan Lapangan & Pengawal Suara — PAN 360',
        scopeLocation: 'Kel. Dago, Kec. Coblong, Kota Bandung',
        avatarIndex: 4,
      };
    case 'TPS_WITNESS':
    default:
      return {
        name: 'Rudi Saputra',
        nik: '3273011204920001',
        phone: '0812-3456-7890',
        email: 'saksi@pan.go.id',
        badgeId: 'SAKSI-PAN-001',
        roleLabel: 'Saksi Resmi TPS — Partai Amanat Nasional',
        scopeLocation: 'TPS 001 Kel. Dago, Kec. Coblong, Kota Bandung',
        avatarIndex: 0,
      };
  }
}

export interface RolePermission {
  canAccessLeadership: boolean;   // Dashboard Pimpinan & Ranking Nasional
  canAccessSecurity: boolean;     // Security, 2FA, System Audit Log
  canAccessBroadcast: boolean;    // Send Broadcast Messages
  canAccessInsights: boolean;     // AI Insights Analytics
  canAccessEmergencyList: boolean;// View all emergency reports list
  canAccessAllPayments: boolean;  // View all saksi payments & budget
  canMarkPayments: boolean;       // Authority to mark payments paid
}

export const ROLE_PERMISSIONS: Record<Role, RolePermission> = {
  DPP: {
    canAccessLeadership: true,
    canAccessSecurity: true,
    canAccessBroadcast: true,
    canAccessInsights: true,
    canAccessEmergencyList: true,
    canAccessAllPayments: true,
    canMarkPayments: true,
  },
  DPW: {
    canAccessLeadership: true,
    canAccessSecurity: false,
    canAccessBroadcast: true,
    canAccessInsights: true,
    canAccessEmergencyList: true,
    canAccessAllPayments: true,
    canMarkPayments: true,
  },
  DPD: {
    canAccessLeadership: true,
    canAccessSecurity: false,
    canAccessBroadcast: true,
    canAccessInsights: true,
    canAccessEmergencyList: true,
    canAccessAllPayments: true,
    canMarkPayments: true,
  },
  DPC: {
    canAccessLeadership: false,
    canAccessSecurity: false,
    canAccessBroadcast: true,
    canAccessInsights: true,
    canAccessEmergencyList: true,
    canAccessAllPayments: true,
    canMarkPayments: true,
  },
  PAC: {
    canAccessLeadership: false,
    canAccessSecurity: false,
    canAccessBroadcast: true,
    canAccessInsights: false,
    canAccessEmergencyList: true,
    canAccessAllPayments: true,
    canMarkPayments: false,
  },
  CALEG: {
    canAccessLeadership: true,
    canAccessSecurity: false,
    canAccessBroadcast: false,
    canAccessInsights: true,
    canAccessEmergencyList: true,
    canAccessAllPayments: false,
    canMarkPayments: false,
  },
  KADER_ANGGOTA: {
    canAccessLeadership: false,
    canAccessSecurity: false,
    canAccessBroadcast: false,
    canAccessInsights: false,
    canAccessEmergencyList: false,
    canAccessAllPayments: false,
    canMarkPayments: false,
  },
  TPS_COORDINATOR: {
    canAccessLeadership: false,
    canAccessSecurity: false,
    canAccessBroadcast: true,
    canAccessInsights: false,
    canAccessEmergencyList: true,
    canAccessAllPayments: true,
    canMarkPayments: true,
  },
  OPERATOR: {
    canAccessLeadership: false,
    canAccessSecurity: false,
    canAccessBroadcast: false,
    canAccessInsights: false,
    canAccessEmergencyList: true,
    canAccessAllPayments: false,
    canMarkPayments: false,
  },
  TPS_WITNESS: {
    canAccessLeadership: false,
    canAccessSecurity: false,
    canAccessBroadcast: false,
    canAccessInsights: false,
    canAccessEmergencyList: true,
    canAccessAllPayments: false,
    canMarkPayments: false,
  },
  RELAWAN: {
    canAccessLeadership: false,
    canAccessSecurity: false,
    canAccessBroadcast: false,
    canAccessInsights: false,
    canAccessEmergencyList: true,
    canAccessAllPayments: false,
    canMarkPayments: false,
  },
};

export function scopeTps(role: Role, tps: Tps[], witnesses: Witness[] = []): Tps[] {
  if (role === 'TPS_WITNESS') {
    const witness = witnesses.find((w) => w.id === CURRENT_WITNESS_ID);
    if (witness) {
      return tps.filter((t) => t.id === witness.assignedTpsId);
    }
    return tps.slice(0, 1);
  }

  if (role === 'RELAWAN') {
    return tps.filter((t) => t.regency === 'Kota Bandung' && t.district === 'Coblong');
  }

  if (role === 'TPS_COORDINATOR') {
    const cluster = tps.filter((t) => t.regency === 'Kota Bandung' && t.district === 'Coblong');
    return cluster.length >= 6 ? cluster.slice(0, 6) : tps.slice(0, 6);
  }

  const home = ROLE_HOME[role];
  return tps.filter((t) => {
    if (home.coordinatorId && t.coordinatorId !== home.coordinatorId) return false;
    if (home.district && t.district !== home.district) return false;
    if (home.regency && t.regency !== home.regency) return false;
    if (home.province && t.province !== home.province) return false;
    return true;
  });
}

export function scopeWitnesses(role: Role, witnesses: Witness[], tpsInScope: Tps[]): Witness[] {
  if (role === 'TPS_WITNESS') {
    return witnesses.filter((w) => w.id === CURRENT_WITNESS_ID);
  }
  const tpsIds = new Set(tpsInScope.map((t) => t.id));
  return witnesses.filter((w) => tpsIds.has(w.assignedTpsId));
}

// Only Pengawas (OPERATOR) supervises coordinators; a Koordinator's own scope is saksi-only.
export function scopeCoordinators(role: Role, coordinators: Coordinator[], tpsInScope: Tps[]): Coordinator[] {
  if (role !== 'OPERATOR') return [];
  const districtsInScope = new Set(tpsInScope.map((t) => t.district));
  return coordinators.filter((c) => districtsInScope.has(c.district));
}
