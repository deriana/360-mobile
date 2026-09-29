import { WitnessApplicationStatus } from './witnessApplication';

/**
 * Nada status yang konsisten di seluruh layar (arahan "simpel tapi informatif"):
 * done = hijau, waiting = kuning, action = merah (perlu tindakan), locked = abu-abu.
 */
export type StatusTone = 'done' | 'waiting' | 'action' | 'locked';

export interface WitnessStep {
  key: 'DAFTAR' | 'VERIFIKASI' | 'PELATIHAN' | 'SIAGA' | 'BERTUGAS';
  label: string;
  description: string;
}

/** 5 langkah jalur saksi, ditampilkan sebagai "Langkah X dari 5". */
export const WITNESS_STEPS: WitnessStep[] = [
  { key: 'DAFTAR', label: 'Daftar', description: 'Isi syarat, data KTP, dan pernyataan.' },
  { key: 'VERIFIKASI', label: 'Verifikasi data', description: 'Tim pusat memeriksa data Anda.' },
  { key: 'PELATIHAN', label: 'Pelatihan saksi', description: 'Modul online atau pelatihan tatap muka.' },
  { key: 'SIAGA', label: 'Menunggu penempatan', description: 'Anda lulus dan menunggu TPS.' },
  { key: 'BERTUGAS', label: 'Bertugas di TPS', description: 'Surat mandat terbit, fitur saksi terbuka.' },
];

export interface WitnessStatusInfo {
  label: string;
  description: string;
  tone: StatusTone;
  /** Indeks langkah aktif di `WITNESS_STEPS` (0-based). */
  stepIndex: number;
}

export const WITNESS_STATUS_INFO: Record<WitnessApplicationStatus, WitnessStatusInfo> = {
  NOT_APPLIED: {
    label: 'Belum daftar',
    description: 'Daftar untuk menjadi saksi TPS resmi partai.',
    tone: 'locked',
    stepIndex: 0,
  },
  SCREENING: {
    label: 'Menunggu verifikasi',
    description: 'Tim pusat sedang memeriksa data Anda, biasanya 1–3 hari kerja.',
    tone: 'waiting',
    stepIndex: 1,
  },
  REVISION: {
    label: 'Perlu perbaikan data',
    description: 'Perbaiki data sesuai catatan tim pusat, lalu kirim ulang.',
    tone: 'action',
    stepIndex: 1,
  },
  REJECTED: {
    label: 'Pengajuan ditolak',
    description: 'Baca alasannya. Anda boleh mengajukan ulang setelah memperbaikinya.',
    tone: 'action',
    stepIndex: 1,
  },
  TRAINING: {
    label: 'Wajib pelatihan',
    description: 'Data Anda lolos. Selesaikan pelatihan saksi untuk lanjut.',
    tone: 'action',
    stepIndex: 2,
  },
  APPROVED: {
    label: 'Siaga — menunggu TPS',
    description: 'Anda lulus pelatihan. Tim pusat akan menempatkan Anda di TPS.',
    tone: 'waiting',
    stepIndex: 3,
  },
  ASSIGNED: {
    label: 'Bertugas di TPS',
    description: 'Surat mandat sudah terbit. Ikuti checklist hari pemungutan suara.',
    tone: 'done',
    stepIndex: 4,
  },
  REVOKED: {
    label: 'Penugasan dicabut',
    description: 'Penugasan Anda dicabut atau dialihkan. Hubungi koordinator.',
    tone: 'locked',
    stepIndex: 4,
  },
  COMPLETED: {
    label: 'Tugas selesai',
    description: 'Terima kasih telah mengawal suara di TPS.',
    tone: 'done',
    stepIndex: 4,
  },
};

/** Status langkah untuk timeline: selesai, sedang berjalan, atau belum. */
export function getStepState(
  status: WitnessApplicationStatus,
  stepIndex: number,
): 'done' | 'current' | 'pending' {
  const current = WITNESS_STATUS_INFO[status].stepIndex;
  const finished = status === 'ASSIGNED' || status === 'COMPLETED';
  if (stepIndex < current || (finished && stepIndex === current)) return 'done';
  if (stepIndex === current) return 'current';
  return 'pending';
}
