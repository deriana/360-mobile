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
    id: 'BC-003',
    title: 'Instruksi Ketua Umum: Kawal Ketat C1 Plano & Integritas Tabulasi',
    body: 'Seluruh struktur partai dan saksi TPS diinstruksikan menjaga suara rakyat dengan disiplin digital melalui aplikasi simPAN. Dokumentasikan setiap tahapan dan laporkan secara berjenjang.',
    targetRoles: ['TPS_WITNESS', 'TPS_COORDINATOR'],
    targetRegions: ['Seluruh Indonesia'],
    sentAt: '2026-09-10 08:00',
    sentBy: 'Ketua Umum DPP PAN',
  },
  {
    id: 'BC-004',
    title: 'Siaga Komando BSN PAN: Pengawalan 820.000 TPS Terverifikasi',
    body: 'Pemanfaatan sistem simPAN memungkinkan presensi akurat saksi berbasis GPS dan unggah hasil pemungutan suara instan. Pastikan formulir keberatan disiapkan bila ada selisih.',
    targetRoles: ['TPS_WITNESS', 'TPS_COORDINATOR'],
    targetRegions: ['38 Provinsi'],
    sentAt: '2026-09-12 09:30',
    sentBy: 'Kepala BSN PAN',
  },
];

