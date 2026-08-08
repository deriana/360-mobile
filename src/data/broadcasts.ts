import { Broadcast } from '../types';

export const broadcasts: Broadcast[] = [
  {
    id: 'BC-001',
    title: 'Pengingat Check-In Saksi',
    body: 'Seluruh saksi wajib check-in maksimal pukul 06:30 waktu setempat.',
    targetRoles: ['TPS_WITNESS', 'TPS_COORDINATOR'],
    targetRegions: ['Jawa Barat', 'Jawa Timur', 'Sumatera Utara'],
    sentAt: '2026-08-07 20:00',
    sentBy: 'DPP',
  },
  {
    id: 'BC-002',
    title: 'Prosedur Pelaporan Formulir C.Hasil',
    body: 'Pastikan foto formulir C.Hasil diambil dalam kondisi terang dan tidak buram sebelum diunggah.',
    targetRoles: ['TPS_WITNESS'],
    targetRegions: ['Jawa Barat'],
    sentAt: '2026-08-08 06:00',
    sentBy: 'DPW',
  },
];
