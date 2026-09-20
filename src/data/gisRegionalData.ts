/**
 * Dataset GIS Agregat Sebaran Relawan, Kader & Saksi PAN
 * Referensi Web Command Center (Privacy Compliant / UU PDP No. 27/2022)
 * Dilengkapi Caching Lokal AsyncStorage untuk Mode Blank Spot / Offline
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export const GIS_CACHE_STORAGE_KEY = '@pan_gis_regional_cache_v2';

export type AchievementStatus = 'SURPLUS' | 'TARGET_MET' | 'DEFICIT' | 'ZERO_VOLUNTEER';

export interface PoskoLocation {
  id: string;
  name: string;
  category: 'DPD_HQ' | 'DPC_SUB' | 'POSKO_WARGA' | 'RUMAH_ASPIRASI';
  categoryLabel: string;
  address: string;
  district: string;
  regency: string;
  lat: number;
  lng: number;
  activeVolunteers: number;
  picName: string;
  phone?: string;
  isMainCommandCenter?: boolean;
}

export interface RegionalCluster {
  id: string;
  name: string;
  level: 'PROVINSI' | 'KAB_KOTA' | 'KECAMATAN';
  parentRegion?: string;
  totalCadres: number;
  totalVolunteers: number;
  targetVolunteers: number;
  volunteerGap: number;
  status: AchievementStatus;
  totalTps: number;
  coveredTps: number;
  tpsCoveragePct: number;
  witnessCount: number;
  poskoCount: number;
  targetSeats: number;
  lat: number;
  lng: number;
  density: 'TINGGI' | 'SEDANG' | 'PENETRASI';
}

export interface GisNationalSummary {
  lastSyncTime: string;
  totalNationalCadres: number;
  totalNationalVolunteers: number;
  targetNationalVolunteers: number;
  totalNationalTps: number;
  nationalCoveragePct: number;
  totalPosko: number;
  totalWitnessesReady: number;
}

export const GIS_NATIONAL_SUMMARY: GisNationalSummary = {
  lastSyncTime: '19 Sep 2026, 09:00 WIB',
  totalNationalCadres: 1248900,
  totalNationalVolunteers: 458320,
  targetNationalVolunteers: 480000,
  totalNationalTps: 823220,
  nationalCoveragePct: 94.8,
  totalPosko: 7420,
  totalWitnessesReady: 1564000,
};

export const GIS_REGIONAL_CLUSTERS: RegionalCluster[] = [
  // ==========================================
  // PROVINSI (DPW)
  // ==========================================
  {
    id: 'reg-jabar',
    name: 'Jawa Barat',
    level: 'PROVINSI',
    totalCadres: 284500,
    totalVolunteers: 96400,
    targetVolunteers: 100000,
    volunteerGap: -3600,
    status: 'TARGET_MET',
    totalTps: 140457,
    coveredTps: 133500,
    tpsCoveragePct: 95.0,
    witnessCount: 267000,
    poskoCount: 1420,
    targetSeats: 18,
    lat: -6.9175,
    lng: 107.6191,
    density: 'TINGGI',
  },
  {
    id: 'reg-dki',
    name: 'DKI Jakarta',
    level: 'PROVINSI',
    totalCadres: 145200,
    totalVolunteers: 68500,
    targetVolunteers: 65000,
    volunteerGap: 3500,
    status: 'SURPLUS',
    totalTps: 30766,
    coveredTps: 29800,
    tpsCoveragePct: 96.8,
    witnessCount: 59600,
    poskoCount: 480,
    targetSeats: 8,
    lat: -6.2088,
    lng: 106.8456,
    density: 'TINGGI',
  },
  {
    id: 'reg-banten',
    name: 'Banten',
    level: 'PROVINSI',
    totalCadres: 112000,
    totalVolunteers: 48200,
    targetVolunteers: 50000,
    volunteerGap: -1800,
    status: 'TARGET_MET',
    totalTps: 33324,
    coveredTps: 31650,
    tpsCoveragePct: 95.0,
    witnessCount: 63300,
    poskoCount: 410,
    targetSeats: 6,
    lat: -6.4058,
    lng: 106.064,
    density: 'TINGGI',
  },
  {
    id: 'reg-jateng',
    name: 'Jawa Tengah',
    level: 'PROVINSI',
    totalCadres: 210000,
    totalVolunteers: 82000,
    targetVolunteers: 90000,
    volunteerGap: -8000,
    status: 'TARGET_MET',
    totalTps: 117299,
    coveredTps: 111400,
    tpsCoveragePct: 95.0,
    witnessCount: 222800,
    poskoCount: 980,
    targetSeats: 12,
    lat: -7.1509,
    lng: 110.1402,
    density: 'TINGGI',
  },
  {
    id: 'reg-jatim',
    name: 'Jawa Timur',
    level: 'PROVINSI',
    totalCadres: 265400,
    totalVolunteers: 94000,
    targetVolunteers: 95000,
    volunteerGap: -1000,
    status: 'TARGET_MET',
    totalTps: 120666,
    coveredTps: 115200,
    tpsCoveragePct: 95.5,
    witnessCount: 230400,
    poskoCount: 1150,
    targetSeats: 14,
    lat: -7.536,
    lng: 112.2384,
    density: 'TINGGI',
  },
  {
    id: 'reg-sumut',
    name: 'Sumatera Utara',
    level: 'PROVINSI',
    totalCadres: 118000,
    totalVolunteers: 41500,
    targetVolunteers: 48000,
    volunteerGap: -6500,
    status: 'DEFICIT',
    totalTps: 45875,
    coveredTps: 43100,
    tpsCoveragePct: 94.0,
    witnessCount: 86200,
    poskoCount: 520,
    targetSeats: 7,
    lat: 3.5952,
    lng: 98.6722,
    density: 'SEDANG',
  },
  {
    id: 'reg-sumbar',
    name: 'Sumatera Barat',
    level: 'PROVINSI',
    totalCadres: 95000,
    totalVolunteers: 38000,
    targetVolunteers: 36000,
    volunteerGap: 2000,
    status: 'SURPLUS',
    totalTps: 17569,
    coveredTps: 17040,
    tpsCoveragePct: 97.0,
    witnessCount: 34080,
    poskoCount: 360,
    targetSeats: 5,
    lat: -0.9471,
    lng: 100.4172,
    density: 'TINGGI',
  },
  {
    id: 'reg-sulsel',
    name: 'Sulawesi Selatan',
    level: 'PROVINSI',
    totalCadres: 88500,
    totalVolunteers: 32000,
    targetVolunteers: 35000,
    volunteerGap: -3000,
    status: 'TARGET_MET',
    totalTps: 26357,
    coveredTps: 25000,
    tpsCoveragePct: 94.8,
    witnessCount: 50000,
    poskoCount: 390,
    targetSeats: 5,
    lat: -5.1477,
    lng: 119.4327,
    density: 'SEDANG',
  },
  {
    id: 'reg-kaltim',
    name: 'Kalimantan Timur',
    level: 'PROVINSI',
    totalCadres: 62000,
    totalVolunteers: 24000,
    targetVolunteers: 25000,
    volunteerGap: -1000,
    status: 'TARGET_MET',
    totalTps: 11441,
    coveredTps: 10800,
    tpsCoveragePct: 94.4,
    witnessCount: 21600,
    poskoCount: 240,
    targetSeats: 3,
    lat: -0.5387,
    lng: 116.4194,
    density: 'SEDANG',
  },
  {
    id: 'reg-papua',
    name: 'Papua',
    level: 'PROVINSI',
    totalCadres: 28000,
    totalVolunteers: 9500,
    targetVolunteers: 15000,
    volunteerGap: -5500,
    status: 'DEFICIT',
    totalTps: 3109,
    coveredTps: 2800,
    tpsCoveragePct: 90.1,
    witnessCount: 5600,
    poskoCount: 78,
    targetSeats: 2,
    lat: -4.2699,
    lng: 138.0804,
    density: 'PENETRASI',
  },

  // ==========================================
  // KABUPATEN / KOTA (DAPIL JABAR I)
  // ==========================================
  {
    id: 'reg-bdg',
    name: 'Kota Bandung (Dapil Jabar I)',
    level: 'KAB_KOTA',
    parentRegion: 'Jawa Barat',
    totalCadres: 34200,
    totalVolunteers: 14850,
    targetVolunteers: 15000,
    volunteerGap: -150,
    status: 'TARGET_MET',
    totalTps: 7424,
    coveredTps: 7150,
    tpsCoveragePct: 96.3,
    witnessCount: 14300,
    poskoCount: 128,
    targetSeats: 7,
    lat: -6.9147,
    lng: 107.6098,
    density: 'TINGGI',
  },
  {
    id: 'reg-cimahi',
    name: 'Kota Cimahi (Dapil Jabar I)',
    level: 'KAB_KOTA',
    parentRegion: 'Jawa Barat',
    totalCadres: 11400,
    totalVolunteers: 4900,
    targetVolunteers: 5000,
    volunteerGap: -100,
    status: 'TARGET_MET',
    totalTps: 1560,
    coveredTps: 1480,
    tpsCoveragePct: 94.8,
    witnessCount: 2960,
    poskoCount: 34,
    targetSeats: 3,
    lat: -6.8722,
    lng: 107.5427,
    density: 'TINGGI',
  },
  {
    id: 'reg-kbb',
    name: 'Kab. Bandung Barat',
    level: 'KAB_KOTA',
    parentRegion: 'Jawa Barat',
    totalCadres: 8900,
    totalVolunteers: 1411,
    targetVolunteers: 1200,
    volunteerGap: 211,
    status: 'SURPLUS',
    totalTps: 286,
    coveredTps: 280,
    tpsCoveragePct: 97.9,
    witnessCount: 560,
    poskoCount: 12,
    targetSeats: 4,
    lat: -6.8435,
    lng: 107.5025,
    density: 'TINGGI',
  },

  // ==========================================
  // KECAMATAN (KOTA BANDUNG & KAB. BANDUNG BARAT)
  // ==========================================
  {
    id: 'reg-saguling',
    name: 'Kec. Saguling',
    level: 'KECAMATAN',
    parentRegion: 'Kab. Bandung Barat',
    totalCadres: 1200,
    totalVolunteers: 364,
    targetVolunteers: 320,
    volunteerGap: 44,
    status: 'SURPLUS',
    totalTps: 82,
    coveredTps: 78,
    tpsCoveragePct: 95.1,
    witnessCount: 156,
    poskoCount: 4,
    targetSeats: 1,
    lat: -6.905,
    lng: 107.412,
    density: 'TINGGI',
  },
  {
    id: 'reg-coblong',
    name: 'Kecamatan Coblong',
    level: 'KECAMATAN',
    parentRegion: 'Kota Bandung',
    totalCadres: 3820,
    totalVolunteers: 1240,
    targetVolunteers: 1200,
    volunteerGap: 40,
    status: 'SURPLUS',
    totalTps: 286,
    coveredTps: 280,
    tpsCoveragePct: 97.9,
    witnessCount: 560,
    poskoCount: 12,
    targetSeats: 2,
    lat: -6.8833,
    lng: 107.6167,
    density: 'TINGGI',
  },
  {
    id: 'reg-sukajadi',
    name: 'Kecamatan Sukajadi',
    level: 'KECAMATAN',
    parentRegion: 'Kota Bandung',
    totalCadres: 2940,
    totalVolunteers: 980,
    targetVolunteers: 1000,
    volunteerGap: -20,
    status: 'TARGET_MET',
    totalTps: 254,
    coveredTps: 242,
    tpsCoveragePct: 95.2,
    witnessCount: 484,
    poskoCount: 9,
    targetSeats: 1,
    lat: -6.8872,
    lng: 107.5958,
    density: 'SEDANG',
  },
  {
    id: 'reg-sumur-bdg',
    name: 'Kecamatan Sumur Bandung',
    level: 'KECAMATAN',
    parentRegion: 'Kota Bandung',
    totalCadres: 2150,
    totalVolunteers: 820,
    targetVolunteers: 800,
    volunteerGap: 20,
    status: 'SURPLUS',
    totalTps: 198,
    coveredTps: 190,
    tpsCoveragePct: 95.9,
    witnessCount: 380,
    poskoCount: 7,
    targetSeats: 1,
    lat: -6.9181,
    lng: 107.6186,
    density: 'SEDANG',
  },
  {
    id: 'reg-lengkong',
    name: 'Kecamatan Lengkong',
    level: 'KECAMATAN',
    parentRegion: 'Kota Bandung',
    totalCadres: 2670,
    totalVolunteers: 910,
    targetVolunteers: 950,
    volunteerGap: -40,
    status: 'TARGET_MET',
    totalTps: 232,
    coveredTps: 220,
    tpsCoveragePct: 94.8,
    witnessCount: 440,
    poskoCount: 8,
    targetSeats: 1,
    lat: -6.9328,
    lng: 107.6253,
    density: 'SEDANG',
  },
];

export const GIS_POSKO_LOCATIONS: PoskoLocation[] = [
  {
    id: 'posko-dpd-bdg',
    name: 'Markas Komando DPD PAN Kota Bandung',
    category: 'DPD_HQ',
    categoryLabel: 'Markas Komando Utama',
    address: 'Jl. Solontongan No. 8, Turangga, Lengkong',
    district: 'Lengkong',
    regency: 'Kota Bandung',
    lat: -6.9312,
    lng: 107.6241,
    activeVolunteers: 45,
    picName: 'Sekretaris DPD Kota Bandung',
    phone: '(022) 720-3344',
    isMainCommandCenter: true,
  },
  {
    id: 'posko-dago',
    name: 'Posko Aspirasi Rakyat & Pemenangan Dago',
    category: 'POSKO_WARGA',
    categoryLabel: 'Posko Lapangan Wilayah',
    address: 'Jl. Ir. H. Juanda (Dago) No. 142, Coblong',
    district: 'Coblong',
    regency: 'Kota Bandung',
    lat: -6.8845,
    lng: 107.6152,
    activeVolunteers: 28,
    picName: 'Asep Ridwan (Korlap Coblong)',
    phone: '0812-9900-1122',
  },
  {
    id: 'posko-sukajadi',
    name: 'Posko Kawal Suara Sukajadi - Setiabudi',
    category: 'POSKO_WARGA',
    categoryLabel: 'Posko Kawal Suara',
    address: 'Jl. Sukajadi No. 95, Pasteur',
    district: 'Sukajadi',
    regency: 'Kota Bandung',
    lat: -6.8891,
    lng: 107.5974,
    activeVolunteers: 18,
    picName: 'Kang Tatang',
    phone: '0813-2211-4433',
  },
  {
    id: 'posko-braga',
    name: 'Rumah Pemenangan PAN Sumur Bandung',
    category: 'RUMAH_ASPIRASI',
    categoryLabel: 'Rumah Aspirasi Pemuda',
    address: 'Jl. Braga No. 54, Kel. Braga',
    district: 'Sumur Bandung',
    regency: 'Kota Bandung',
    lat: -6.9178,
    lng: 107.6102,
    activeVolunteers: 22,
    picName: 'Siti Rahmawati (Relawan Posko)',
    phone: '0812-8877-6655',
  },
];

// ============================================================================
// OFFLINE CACHE HELPERS (ASYNCSTORAGE)
// ============================================================================

export async function saveGisDataToCache(
  clusters: RegionalCluster[],
  poskos: PoskoLocation[],
  summary: GisNationalSummary
): Promise<void> {
  try {
    const payload = {
      clusters,
      poskos,
      summary,
      cachedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(GIS_CACHE_STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn('[GisCache] Failed to save offline cache:', err);
  }
}

export async function loadGisDataFromCache(): Promise<{
  clusters: RegionalCluster[];
  poskos: PoskoLocation[];
  summary: GisNationalSummary;
  cachedAt: string;
} | null> {
  try {
    const raw = await AsyncStorage.getItem(GIS_CACHE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.clusters)) {
      parsed.clusters = parsed.clusters.map((c: any) => ({
        ...c,
        totalCadres: typeof c.totalCadres === 'number' ? c.totalCadres : 0,
        totalVolunteers: typeof c.totalVolunteers === 'number' ? c.totalVolunteers : 0,
        targetVolunteers: typeof c.targetVolunteers === 'number' ? c.targetVolunteers : 0,
        volunteerGap: typeof c.volunteerGap === 'number' ? c.volunteerGap : 0,
        totalTps: typeof c.totalTps === 'number' ? c.totalTps : 0,
        coveredTps: typeof c.coveredTps === 'number' ? c.coveredTps : 0,
        tpsCoveragePct: typeof c.tpsCoveragePct === 'number' ? c.tpsCoveragePct : 0,
        witnessCount: typeof c.witnessCount === 'number' ? c.witnessCount : 0,
        poskoCount: typeof c.poskoCount === 'number' ? c.poskoCount : 0,
      }));
    }
    return parsed;
  } catch (err) {
    console.warn('[GisCache] Failed to load offline cache:', err);
    return null;
  }
}

// ============================================================================
// LEVEL 4 (DESA / KELURAHAN - POSKO DESA) & REGIONAL LEADERS
// Sesuai Referensi Web Admin Saksi360-Admin (/command-relawan)
// ============================================================================

export interface PoskoDesaItem {
  id: string;
  villageName: string;
  districtName: string;
  regencyName: string;
  provinceName: string;
  registeredVolunteers: number;
  targetVolunteers: number;
  surplus: number;
  achievementPct: number;
  status: AchievementStatus;
  coordinatorName: string;
  coordinatorPhone?: string;
  skStatus: 'SK Mandat Aktif' | 'Proses SK';
  lat: number;
  lng: number;
}

export interface RegionalLeaderInfo {
  regionName: string;
  level: 'PROVINSI' | 'KAB_KOTA' | 'KECAMATAN';
  leaderName: string;
  roleTitle: string;
  skStatus: string;
  phone: string;
}

export const REGIONAL_LEADERS_SEED: Record<string, RegionalLeaderInfo> = {
  'jawa barat': {
    regionName: 'Jawa Barat',
    level: 'PROVINSI',
    leaderName: 'Hj. Dewi Sartika, S.E., M.B.A.',
    roleTitle: 'Ketua DPD Provinsi',
    skStatus: 'SK Mandat Aktif',
    phone: '0813-7744-3003',
  },
  'kab. bandung barat': {
    regionName: 'Kab. Bandung Barat',
    level: 'KAB_KOTA',
    leaderName: 'Drs. H. Mulyadi, M.Si.',
    roleTitle: 'Ketua DPC Kab/Kota',
    skStatus: 'SK Mandat Aktif',
    phone: '0813-5678-9012',
  },
  'kota bandung': {
    regionName: 'Kota Bandung',
    level: 'KAB_KOTA',
    leaderName: 'H. Edwin Senjaya, S.E., M.M.',
    roleTitle: 'Ketua DPC Kab/Kota',
    skStatus: 'SK Mandat Aktif',
    phone: '0812-3456-7890',
  },
  'kec. cihampelas': {
    regionName: 'Kec. Cihampelas',
    level: 'KECAMATAN',
    leaderName: 'Dadan Ramdani, S.AP.',
    roleTitle: 'Ketua PAC Kecamatan',
    skStatus: 'SK Mandat Aktif',
    phone: '0853-2233-4455',
  },
  'kec. batujajar': {
    regionName: 'Kec. Batujajar',
    level: 'KECAMATAN',
    leaderName: 'H. Iwan Setiawan',
    roleTitle: 'Ketua PAC Kecamatan',
    skStatus: 'SK Mandat Aktif',
    phone: '0812-1122-3301',
  },
  'kec. cikalongwetan': {
    regionName: 'Kec. Cikalongwetan',
    level: 'KECAMATAN',
    leaderName: 'Ade Kurniawan',
    roleTitle: 'Ketua PAC Kecamatan',
    skStatus: 'SK Mandat Aktif',
    phone: '0813-2233-4402',
  },
  'kec. saguling': {
    regionName: 'Kec. Saguling',
    level: 'KECAMATAN',
    leaderName: 'Drs. H. Mulyadi, M.Si.',
    roleTitle: 'Koordinator Wilayah PAC',
    skStatus: 'SK Mandat Aktif',
    phone: '0813-5678-9012',
  },
  'kecamatan coblong': {
    regionName: 'Kecamatan Coblong',
    level: 'KECAMATAN',
    leaderName: 'Kang Asep Supriatna',
    roleTitle: 'Ketua PAC Kecamatan',
    skStatus: 'SK Mandat Aktif',
    phone: '0812-9900-1122',
  },
};

export const POSKO_DESA_SEED: PoskoDesaItem[] = [
  // ==========================================
  // Kecamatan Saguling (Kab. Bandung Barat) - Sesuai Screenshot 4 Admin
  // ==========================================
  {
    id: 'desa-saguling-01',
    villageName: 'Desa Karanganyar',
    districtName: 'Kec. Saguling',
    regencyName: 'Kab. Bandung Barat',
    provinceName: 'Jawa Barat',
    registeredVolunteers: 50,
    targetVolunteers: 45,
    surplus: 5,
    achievementPct: 111.1,
    status: 'SURPLUS',
    coordinatorName: 'Pak RT Hendra',
    coordinatorPhone: '0813-2233-4401',
    skStatus: 'SK Mandat Aktif',
    lat: -6.905,
    lng: 107.412,
  },
  {
    id: 'desa-saguling-02',
    villageName: 'Desa Sindangasih',
    districtName: 'Kec. Saguling',
    regencyName: 'Kab. Bandung Barat',
    provinceName: 'Jawa Barat',
    registeredVolunteers: 63,
    targetVolunteers: 53,
    surplus: 10,
    achievementPct: 118.9,
    status: 'SURPLUS',
    coordinatorName: 'Kang Asep Saepudin',
    coordinatorPhone: '0812-3344-5502',
    skStatus: 'SK Mandat Aktif',
    lat: -6.918,
    lng: 107.435,
  },
  {
    id: 'desa-saguling-03',
    villageName: 'Desa Sukamaju',
    districtName: 'Kec. Saguling',
    regencyName: 'Kab. Bandung Barat',
    provinceName: 'Jawa Barat',
    registeredVolunteers: 106,
    targetVolunteers: 91,
    surplus: 15,
    achievementPct: 116.5,
    status: 'SURPLUS',
    coordinatorName: 'Mang Dadang Rohman',
    coordinatorPhone: '0819-4455-6603',
    skStatus: 'SK Mandat Aktif',
    lat: -6.892,
    lng: 107.441,
  },
  {
    id: 'desa-saguling-04',
    villageName: 'Desa Saguling',
    districtName: 'Kec. Saguling',
    regencyName: 'Kab. Bandung Barat',
    provinceName: 'Jawa Barat',
    registeredVolunteers: 120,
    targetVolunteers: 110,
    surplus: 10,
    achievementPct: 109.1,
    status: 'TARGET_MET',
    coordinatorName: 'Ust. Dedi Supriadi',
    coordinatorPhone: '0813-5566-7704',
    skStatus: 'SK Mandat Aktif',
    lat: -6.910,
    lng: 107.420,
  },
  {
    id: 'desa-saguling-05',
    villageName: 'Desa Cikande',
    districtName: 'Kec. Saguling',
    regencyName: 'Kab. Bandung Barat',
    provinceName: 'Jawa Barat',
    registeredVolunteers: 114,
    targetVolunteers: 115,
    surplus: -1,
    achievementPct: 99.1,
    status: 'TARGET_MET',
    coordinatorName: 'Kang Yayan',
    coordinatorPhone: '0812-6677-8805',
    skStatus: 'SK Mandat Aktif',
    lat: -6.925,
    lng: 107.405,
  },

  // ==========================================
  // Kecamatan Coblong (Kota Bandung) - Penugasan Default Mobile
  // ==========================================
  {
    id: 'desa-coblong-01',
    villageName: 'Kelurahan Dago',
    districtName: 'Kecamatan Coblong',
    regencyName: 'Kota Bandung',
    provinceName: 'Jawa Barat',
    registeredVolunteers: 48,
    targetVolunteers: 40,
    surplus: 8,
    achievementPct: 120.0,
    status: 'SURPLUS',
    coordinatorName: 'Kang Asep Supriatna',
    coordinatorPhone: '0812-9900-1122',
    skStatus: 'SK Mandat Aktif',
    lat: -6.8845,
    lng: 107.6152,
  },
  {
    id: 'desa-coblong-02',
    villageName: 'Kelurahan Sekeloa',
    districtName: 'Kecamatan Coblong',
    regencyName: 'Kota Bandung',
    provinceName: 'Jawa Barat',
    registeredVolunteers: 52,
    targetVolunteers: 45,
    surplus: 7,
    achievementPct: 115.5,
    status: 'SURPLUS',
    coordinatorName: 'Pak RW Bambang',
    coordinatorPhone: '0813-1122-3344',
    skStatus: 'SK Mandat Aktif',
    lat: -6.8890,
    lng: 107.6200,
  },
  {
    id: 'desa-coblong-03',
    villageName: 'Kelurahan Lebakgede',
    districtName: 'Kecamatan Coblong',
    regencyName: 'Kota Bandung',
    provinceName: 'Jawa Barat',
    registeredVolunteers: 44,
    targetVolunteers: 40,
    surplus: 4,
    achievementPct: 110.0,
    status: 'TARGET_MET',
    coordinatorName: 'Kang Deni',
    coordinatorPhone: '0812-2233-4455',
    skStatus: 'SK Mandat Aktif',
    lat: -6.8810,
    lng: 107.6110,
  },
  {
    id: 'desa-coblong-04',
    villageName: 'Kelurahan Sadang Serang',
    districtName: 'Kecamatan Coblong',
    regencyName: 'Kota Bandung',
    provinceName: 'Jawa Barat',
    registeredVolunteers: 56,
    targetVolunteers: 50,
    surplus: 6,
    achievementPct: 112.0,
    status: 'SURPLUS',
    coordinatorName: 'Teh Rina Melati',
    coordinatorPhone: '0819-3344-5566',
    skStatus: 'SK Mandat Aktif',
    lat: -6.8950,
    lng: 107.6250,
  },
];

export function getPoskoDesaByDistrict(districtQuery?: string): PoskoDesaItem[] {
  if (!districtQuery) return POSKO_DESA_SEED;
  const q = districtQuery.toLowerCase();
  const filtered = POSKO_DESA_SEED.filter((d) =>
    d.districtName.toLowerCase().includes(q) || q.includes(d.districtName.toLowerCase())
  );
  return filtered.length > 0 ? filtered : POSKO_DESA_SEED.filter(d => d.districtName.toLowerCase().includes('coblong'));
}

export function getLeaderInfo(regionName?: string): RegionalLeaderInfo | null {
  if (!regionName) return null;
  const clean = regionName.toLowerCase().trim();
  return REGIONAL_LEADERS_SEED[clean] || Object.values(REGIONAL_LEADERS_SEED).find(l => clean.includes(l.regionName.toLowerCase())) || null;
}
