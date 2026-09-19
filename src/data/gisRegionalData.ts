/**
 * Dataset GIS Agregat Sebaran Relawan, Kader & Saksi PAN
 * Referensi Web Command Center (Privacy Compliant / No Raw NIK/HP)
 */

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
  isMainCommandCenter?: boolean;
}

export interface RegionalCluster {
  id: string;
  name: string;
  level: 'PROVINSI' | 'KAB_KOTA' | 'KECAMATAN';
  parentRegion?: string;
  totalCadres: number;
  totalVolunteers: number;
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
  totalNationalTps: number;
  nationalCoveragePct: number;
  totalPosko: number;
  totalWitnessesReady: number;
}

export const GIS_NATIONAL_SUMMARY: GisNationalSummary = {
  lastSyncTime: '19 Sep 2026, 09:00 WIB',
  totalNationalCadres: 1248900,
  totalNationalVolunteers: 458320,
  totalNationalTps: 823220,
  nationalCoveragePct: 94.8,
  totalPosko: 7420,
  totalWitnessesReady: 1564000,
};

export const GIS_REGIONAL_CLUSTERS: RegionalCluster[] = [
  {
    id: 'reg-jabar',
    name: 'Jawa Barat',
    level: 'PROVINSI',
    totalCadres: 284500,
    totalVolunteers: 96400,
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
    id: 'reg-bdg',
    name: 'Kota Bandung (Dapil Jabar I)',
    level: 'KAB_KOTA',
    parentRegion: 'Jawa Barat',
    totalCadres: 34200,
    totalVolunteers: 14850,
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
    id: 'reg-coblong',
    name: 'Kecamatan Coblong',
    level: 'KECAMATAN',
    parentRegion: 'Kota Bandung',
    totalCadres: 3820,
    totalVolunteers: 1240,
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
    name: 'Command Center DPD PAN Kota Bandung',
    category: 'DPD_HQ',
    categoryLabel: 'Sekretariat Utama DPD',
    address: 'Jl. Pelajar Pejuang 45 No. 88, Kota Bandung',
    district: 'Lengkong',
    regency: 'Kota Bandung',
    lat: -6.9312,
    lng: 107.6241,
    activeVolunteers: 45,
    picName: 'Sekretaris DPD Kota Bandung',
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
  },
];
