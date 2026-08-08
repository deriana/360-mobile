import { Role, Tps, Witness } from '../types';

export const CURRENT_WITNESS_ID = 'SAKSI-001';

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
};

export const ROLE_LABEL: Record<Role, string> = {
  DPP: 'DPP — Tingkat Nasional',
  DPW: 'DPW — Provinsi Jawa Barat',
  DPD: 'DPD — Kota Bandung',
  DPC: 'DPC — Kecamatan Coblong',
  PAC: 'PAC — Ranting Coblong',
  TPS_COORDINATOR: 'Koordinator TPS Lapangan (6 TPS)',
  OPERATOR: 'Operator Lapangan (Kota Bandung)',
  TPS_WITNESS: 'Saksi Resmi TPS',
};

export const ROLE_SCOPE_DESCRIPTION: Record<Role, string> = {
  DPP: 'Cakupan Nasional — Memantau seluruh TPS di 38 Provinsi',
  DPW: 'Cakupan DPW — Memantau TPS di wilayah Provinsi Jawa Barat',
  DPD: 'Cakupan DPD — Memantau TPS di Kabupaten/Kota Bandung',
  DPC: 'Cakupan DPC — Memantau TPS di Kecamatan Coblong',
  PAC: 'Cakupan PAC — Memantau TPS di Kelurahan & Ranting',
  TPS_COORDINATOR: 'Cakupan Kluster TPS — Supervisi 6 TPS di wilayah Kelurahan Dago',
  OPERATOR: 'Cakupan Operator Lapangan — Memantau & Mendampingi Saksi se-Kota Bandung',
  TPS_WITNESS: 'Cakupan Saksi — TPS 001 Kel. Dago, Kec. Coblong',
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
    case 'OPERATOR':
      return {
        name: 'Budi Pratama',
        nik: '3273012508880003',
        phone: '0813-8899-7711',
        email: 'operator@saksi360.demo',
        badgeId: 'OPS-360-BANDUNG-01',
        roleLabel: 'Operator Lapangan (Kota Bandung)',
        scopeLocation: 'Kota Bandung, Jawa Barat',
        avatarIndex: 1,
      };
    case 'TPS_COORDINATOR':
      return {
        name: 'Asep Ridwan',
        nik: '3273011503850002',
        phone: '0811-2233-4455',
        email: 'korlap@saksi360.demo',
        badgeId: 'KORLAP-360-DAGO-01',
        roleLabel: 'Koordinator TPS Lapangan (Kluster 6)',
        scopeLocation: 'Kel. Dago, Kec. Coblong, Kota Bandung',
        avatarIndex: 3,
      };
    case 'TPS_WITNESS':
    default:
      return {
        name: 'Rudi Saputra',
        nik: '3273011204920001',
        phone: '0812-3456-7890',
        email: 'saksi@saksi360.demo',
        badgeId: 'SAKSI-360-001',
        roleLabel: 'Saksi Resmi TPS Mandiri',
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
};

export function scopeTps(role: Role, tps: Tps[], witnesses: Witness[] = []): Tps[] {
  if (role === 'TPS_WITNESS') {
    const witness = witnesses.find((w) => w.id === CURRENT_WITNESS_ID);
    if (witness) {
      return tps.filter((t) => t.id === witness.assignedTpsId);
    }
    return tps.slice(0, 1);
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
