import { EMPTY_KTP_DATA, WitnessApplication, WitnessApplicationForm } from '../domain/witnessApplication';
import { WitnessApplicationRepository } from '../domain/witnessApplicationRepository';

const DAY_MS = 24 * 60 * 60 * 1000;
const daysAgo = (days: number) => new Date(Date.now() - days * DAY_MS).toISOString();

const seedForm = (nama: string, nik: string, noHp: string, kelurahan: string): WitnessApplicationForm => ({
  eligibility: { ageAtLeast17: true, hasKtpEl: true, notElectionOrganizer: true, notCivilServantOrSecurity: true },
  ktpData: {
    ...EMPTY_KTP_DATA,
    nik,
    nama,
    tanggalLahir: '14-08-1995',
    kelurahan,
    kecamatan: 'Coblong',
    kabupaten: 'Kota Bandung',
    provinsi: 'Jawa Barat',
  },
  noHp,
  hasFacePhoto: true,
  tpsPreference: { kelurahan },
  integrityPledgeAccepted: true,
  dataConsentAccepted: true,
});

/**
 * Data demo per tahap (ID mengikuti `USER_PROFILES_BY_EMAIL` di `src/utils/userContext.ts`):
 * - USR-002 (relawan@pan.go.id)          → menunggu verifikasi
 * - USR-RELAWAN-LATIH (akun baru Tahap B) → wajib pelatihan
 * - USR-001 (saksi@pan.go.id)             → ditugaskan di TPS 001 Dago, surat tugas terkirim
 * Pengguna lain belum punya pengajuan (status NOT_APPLIED).
 * ID TPS demo memakai awalan `TPS-BDG-` agar tidak bentrok dengan data TPS nasional (`src/data/tps.ts`).
 */
const SEED: WitnessApplication[] = [
  {
    userId: 'USR-002',
    status: 'SCREENING',
    submittedAt: daysAgo(1),
    updatedAt: daysAgo(1),
    form: seedForm('Siti Rahmawati', '3273015408950002', '081398765432', 'Dago'),
  },
  {
    userId: 'USR-RELAWAN-LATIH',
    status: 'TRAINING',
    submittedAt: daysAgo(6),
    updatedAt: daysAgo(2),
    form: seedForm('Bagas Pratama', '3273011109970007', '081277001122', 'Lebak Siliwangi'),
  },
  {
    userId: 'USR-001',
    status: 'ASSIGNED',
    submittedAt: daysAgo(30),
    updatedAt: daysAgo(10),
    trainingCompletedAt: daysAgo(14),
    form: seedForm('Rudi Saputra', '3273011204920001', '081234567890', 'Dago'),
    assignedTpsId: 'TPS-BDG-001',
    assignedTpsLabel: 'TPS 001 · Kel. Dago, Kec. Coblong',
    assignedTpsLocation: { tpsNumber: 1, village: 'Dago', district: 'Coblong', regency: 'Kota Bandung', province: 'Jawa Barat', lat: -6.8833, lng: 107.6167 },
    mandateNumber: '042/MND/PAN-BDG/2026',
    mandateQrToken: 'MANDAT-USR-001-042',
    letterStatus: 'terkirim',
  },
];

/** Store in-memory; referensi objek hanya berganti saat `save`, aman untuk `useSyncExternalStore`. */
export class MockWitnessApplicationRepository implements WitnessApplicationRepository {
  private readonly items = new Map<string, WitnessApplication>(SEED.map((app) => [app.userId, app]));
  private readonly listeners = new Set<() => void>();

  get = (userId: string): WitnessApplication | null => this.items.get(userId) ?? null;

  save = (application: WitnessApplication): void => {
    this.items.set(application.userId, application);
    this.listeners.forEach((listener) => listener());
  };

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
}
