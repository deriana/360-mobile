/**
 * Dataset Resmi Sebaran Anggota & Kader Partai Amanat Nasional (simPAN)
 * Kepatuhan UU No. 27/2022 (UU PDP): Disajikan dalam Agregat Kuantitas Wilayah
 * Terintegrasi dengan Kantor Sekretariat & Struktur Organisasi
 */

export interface PanMemberCluster {
  id: string;
  name: string;
  level: 'PROVINSI' | 'KAB_KOTA' | 'KECAMATAN';
  parentRegion?: string;
  totalMembers: number;
  verifiedKta: number;
  pendingKta: number;
  verificationPct: number;
  targetMembers: number;
  achievementPct: number;
  femaleRatio: number; // Persentase keterwakilan perempuan (UU Pemilu >= 30%)
  youthRatio: number;  // Persentase kader muda / BM PAN (< 35 tahun)
  officeCount: number;
  lat: number;
  lng: number;
}

export interface PanMemberNationalSummary {
  totalNationalMembers: number;
  activeKtaMembers: number;
  pendingVerification: number;
  verificationRatePct: number;
  totalNationalOffices: number;
  femaleCadreRatioPct: number;
  youthCadreRatioPct: number;
  lastSyncTime: string;
}

export const PAN_MEMBER_NATIONAL_SUMMARY: PanMemberNationalSummary = {
  totalNationalMembers: 1248900,
  activeKtaMembers: 1186450,
  pendingVerification: 62450,
  verificationRatePct: 95.0,
  totalNationalOffices: 7420,
  femaleCadreRatioPct: 31.8,
  youthCadreRatioPct: 43.5,
  lastSyncTime: '19 Sep 2026, 09:00 WIB',
};

export const PAN_MEMBER_CLUSTERS: PanMemberCluster[] = [
  // 1. Jawa Barat (DPW Basis Utama)
  {
    id: 'pan-prov-jabar',
    name: 'Jawa Barat',
    level: 'PROVINSI',
    totalMembers: 284500,
    verifiedKta: 271600,
    pendingKta: 12900,
    verificationPct: 95.5,
    targetMembers: 300000,
    achievementPct: 94.8,
    femaleRatio: 32.4,
    youthRatio: 44.1,
    officeCount: 654,
    lat: -6.9175,
    lng: 107.6191,
  },
  // 2. DKI Jakarta
  {
    id: 'pan-prov-dki',
    name: 'DKI Jakarta',
    level: 'PROVINSI',
    totalMembers: 145200,
    verifiedKta: 140800,
    pendingKta: 4400,
    verificationPct: 97.0,
    targetMembers: 150000,
    achievementPct: 96.8,
    femaleRatio: 34.0,
    youthRatio: 48.2,
    officeCount: 268,
    lat: -6.2088,
    lng: 106.8456,
  },
  // 3. Jawa Timur
  {
    id: 'pan-prov-jatim',
    name: 'Jawa Timur',
    level: 'PROVINSI',
    totalMembers: 265400,
    verifiedKta: 252100,
    pendingKta: 13300,
    verificationPct: 95.0,
    targetMembers: 280000,
    achievementPct: 94.8,
    femaleRatio: 31.2,
    youthRatio: 42.0,
    officeCount: 612,
    lat: -7.536,
    lng: 112.2384,
  },
  // 4. Jawa Tengah
  {
    id: 'pan-prov-jateng',
    name: 'Jawa Tengah',
    level: 'PROVINSI',
    totalMembers: 210000,
    verifiedKta: 198400,
    pendingKta: 11600,
    verificationPct: 94.5,
    targetMembers: 225000,
    achievementPct: 93.3,
    femaleRatio: 30.8,
    youthRatio: 41.5,
    officeCount: 520,
    lat: -7.1509,
    lng: 110.1402,
  },
  // 5. Banten
  {
    id: 'pan-prov-banten',
    name: 'Banten',
    level: 'PROVINSI',
    totalMembers: 112000,
    verifiedKta: 106400,
    pendingKta: 5600,
    verificationPct: 95.0,
    targetMembers: 120000,
    achievementPct: 93.3,
    femaleRatio: 31.5,
    youthRatio: 43.8,
    officeCount: 198,
    lat: -6.4058,
    lng: 106.064,
  },
  // 6. Sumatera Utara
  {
    id: 'pan-prov-sumut',
    name: 'Sumatera Utara',
    level: 'PROVINSI',
    totalMembers: 118000,
    verifiedKta: 110900,
    pendingKta: 7100,
    verificationPct: 94.0,
    targetMembers: 130000,
    achievementPct: 90.8,
    femaleRatio: 30.5,
    youthRatio: 40.2,
    officeCount: 310,
    lat: 3.5952,
    lng: 98.6722,
  },
  // 7. Sumatera Barat (Basis Kuat PAN)
  {
    id: 'pan-prov-sumbar',
    name: 'Sumatera Barat',
    level: 'PROVINSI',
    totalMembers: 95000,
    verifiedKta: 92150,
    pendingKta: 2850,
    verificationPct: 97.0,
    targetMembers: 98000,
    achievementPct: 96.9,
    femaleRatio: 33.2,
    youthRatio: 45.6,
    officeCount: 245,
    lat: -0.9471,
    lng: 100.4172,
  },
  // 8. Sulawesi Selatan
  {
    id: 'pan-prov-sulsel',
    name: 'Sulawesi Selatan',
    level: 'PROVINSI',
    totalMembers: 88500,
    verifiedKta: 83900,
    pendingKta: 4600,
    verificationPct: 94.8,
    targetMembers: 95000,
    achievementPct: 93.2,
    femaleRatio: 31.0,
    youthRatio: 42.4,
    officeCount: 228,
    lat: -5.1477,
    lng: 119.4327,
  },
  // 9. DI Yogyakarta
  {
    id: 'pan-prov-diy',
    name: 'DI Yogyakarta',
    level: 'PROVINSI',
    totalMembers: 54200,
    verifiedKta: 52500,
    pendingKta: 1700,
    verificationPct: 96.9,
    targetMembers: 55000,
    achievementPct: 98.5,
    femaleRatio: 35.1,
    youthRatio: 49.0,
    officeCount: 92,
    lat: -7.7956,
    lng: 110.3695,
  },
  // 10. Lampung
  {
    id: 'pan-prov-lampung',
    name: 'Lampung',
    level: 'PROVINSI',
    totalMembers: 76500,
    verifiedKta: 72600,
    pendingKta: 3900,
    verificationPct: 94.9,
    targetMembers: 80000,
    achievementPct: 95.6,
    femaleRatio: 31.0,
    youthRatio: 41.8,
    officeCount: 184,
    lat: -5.45,
    lng: 105.2667,
  },

  // ==========================================
  // TINGKAT KABUPATEN / KOTA (DAPIL JABAR I)
  // ==========================================
  {
    id: 'pan-kab-bdg',
    name: 'Kota Bandung (Dapil Jabar I)',
    level: 'KAB_KOTA',
    parentRegion: 'Jawa Barat',
    totalMembers: 34200,
    verifiedKta: 32800,
    pendingKta: 1400,
    verificationPct: 95.9,
    targetMembers: 35000,
    achievementPct: 97.7,
    femaleRatio: 33.5,
    youthRatio: 46.2,
    officeCount: 32,
    lat: -6.9147,
    lng: 107.6098,
  },
  {
    id: 'pan-kab-cimahi',
    name: 'Kota Cimahi (Dapil Jabar I)',
    level: 'KAB_KOTA',
    parentRegion: 'Jawa Barat',
    totalMembers: 11400,
    verifiedKta: 10920,
    pendingKta: 480,
    verificationPct: 95.8,
    targetMembers: 12000,
    achievementPct: 95.0,
    femaleRatio: 32.0,
    youthRatio: 44.5,
    officeCount: 12,
    lat: -6.8722,
    lng: 107.5427,
  },

  // ==========================================
  // TINGKAT KECAMATAN (KOTA BANDUNG)
  // ==========================================
  {
    id: 'pan-kec-coblong',
    name: 'Kecamatan Coblong',
    level: 'KECAMATAN',
    parentRegion: 'Kota Bandung',
    totalMembers: 3820,
    verifiedKta: 3710,
    pendingKta: 110,
    verificationPct: 97.1,
    targetMembers: 4000,
    achievementPct: 95.5,
    femaleRatio: 34.2,
    youthRatio: 49.5,
    officeCount: 4,
    lat: -6.8833,
    lng: 107.6167,
  },
  {
    id: 'pan-kec-sukajadi',
    name: 'Kecamatan Sukajadi',
    level: 'KECAMATAN',
    parentRegion: 'Kota Bandung',
    totalMembers: 2940,
    verifiedKta: 2810,
    pendingKta: 130,
    verificationPct: 95.6,
    targetMembers: 3100,
    achievementPct: 94.8,
    femaleRatio: 32.8,
    youthRatio: 45.0,
    officeCount: 3,
    lat: -6.8872,
    lng: 107.5958,
  },
  {
    id: 'pan-kec-sumurbdg',
    name: 'Kecamatan Sumur Bandung',
    level: 'KECAMATAN',
    parentRegion: 'Kota Bandung',
    totalMembers: 2150,
    verifiedKta: 2060,
    pendingKta: 90,
    verificationPct: 95.8,
    targetMembers: 2200,
    achievementPct: 97.7,
    femaleRatio: 33.0,
    youthRatio: 46.8,
    officeCount: 3,
    lat: -6.9181,
    lng: 107.6186,
  },
  {
    id: 'pan-kec-lengkong',
    name: 'Kecamatan Lengkong',
    level: 'KECAMATAN',
    parentRegion: 'Kota Bandung',
    totalMembers: 2670,
    verifiedKta: 2540,
    pendingKta: 130,
    verificationPct: 95.1,
    targetMembers: 2800,
    achievementPct: 95.4,
    femaleRatio: 33.6,
    youthRatio: 44.9,
    officeCount: 3,
    lat: -6.9328,
    lng: 107.6253,
  },
];
