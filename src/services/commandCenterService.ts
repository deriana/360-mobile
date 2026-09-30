/**
 * Command Center Mobile — Data Model & Layanan
 * Platform Operasional & Pengawasan Teritorial PAN 360 (Saksi 360)
 *
 * Direstrukturisasi mengikuti ANALISA_MOBILE_COMMAND_CENTER.md (Revisi 2, 2026-09-28)
 * di repo Saksi360-Admin. Command Center web BUKAN dashboard multi-tab
 * (KPI + funnel + insiden + verifikasi C1), melainkan SATU PETA TAKTIS
 * (`src/features/peta/index.tsx` -> `IndonesiaMap`) dengan 3 mode data:
 * Peta Relawan, Saksi Mandat (TPS), dan Peta Kemenangan — drill-down
 * Nasional -> Provinsi (38) -> Kabupaten/Kota -> Kecamatan -> Desa.
 *
 * KONFIRMASI SUMBER (2026-09-28) — hasil telusur langsung kode web oleh
 * tim Saksi360-Admin: SELURUH angka Command Center web adalah data
 * sintetis/dummy, bukan data KPU/Situng asli. Formula generatornya SUDAH
 * dikonfirmasi dan file ini SENGAJA meniru formula tsb persis (bukan
 * formula bebas) demi "Parity by Design" (Bagian 5 dokumen), walau kedua
 * sisi sama-sama dummy:
 *  - Threshold tier identik di semua level: <25% / 25–79.9% / 80–99.9% /
 *    ≥100% (`getVolunteerAchievementCategory`, volunteer-color-helper.ts).
 *  - Aturan waris: provinsi induk merah (<25%) → semua kab/kec di
 *    bawahnya dipaksa ikut merah (volunteer-map-service.ts:448-457).
 *    Direplikasi di `buildRegencyBreakdown` lewat `inheritRedTier`.
 *  - Saksi Hadir → C1 Masuk berjenjang murni rasio dari hadirCount
 *    (bukan angka independen): c1PlanoCount ≈ hadirCount × 0.95–0.96,
 *    sirekapOcrCount ≈ hadirCount × 0.90–0.92 (saksi-anomaly-service.ts:832-895).
 *  - kursiEstimasi = Math.round(panPercent / 6); partyRank dipetakan dari
 *    tier performa (bukan perbandingan suara 18 partai aktual)
 *    (pan-kemenangan-service.ts:306-510).
 *  - totalParties tetap 18 di semua cabang.
 *  - Web sendiri TIDAK konsisten soal total TPS nasional (823.236 di satu
 *    tempat vs jumlah provinces.ts yang jauh lebih kecil di tempat lain).
 *    Mobile SENGAJA tidak meniru bug ini — NATIONAL_SUMMARY di bawah selalu
 *    dijumlah dari data provinsi sendiri agar internally consistent.
 *  - SLA verifikasi relawan: tidak ada di kode manapun — ini kebijakan
 *    bisnis yang belum didefinisikan, bukan nilai teknis yang bisa ditiru.
 *
 * Nilai di bawah tetap placeholder deterministik (bukan Math.random acak
 * tiap render) sampai layanan agregasi web (region-filter.ts /
 * volunteer-map-service.ts / saksi-anomaly-service.ts /
 * pan-kemenangan-service.ts) diekspos lewat API dan dikonsumsi ulang oleh
 * mobile — bukan ditulis ulang logikanya (Bagian 9 Roadmap, Fase 1).
 *
 * SINKRONISASI PERSENTASE (2026-09-30) — persentase Relawan, Saksi Mandat
 * TPS, dan Kemenangan PAN di level Provinsi & Kabupaten/Kota TIDAK lagi
 * di-generate dari formula seeded-random di file ini, melainkan diambil
 * langsung dari PERSENTASE_COMMAND_CENTER.md (repo Saksi360-Admin) lewat
 * `commandCenterPercentages.ts` — hasil ekstraksi langsung fungsi data
 * asli web, sehingga nilainya identik dengan Command Center web saat ini
 * (bukan cuma meniru formula). Kuantitas turunan (target, active, tpsCount,
 * poskoCount, dll.) tetap dihitung sintetis dari sizeFactor seperti semula
 * karena web tidak mengeksop angka absolut tsb, hanya persentasenya.
 */

import { normalizeProvinceSlug } from '../utils/geoRegistry';
import { PROVINCE_PERCENTAGE_DATA, REGENCY_PERCENTAGE_DATA, RegencyPercentageEntry } from '../data/commandCenterPercentages';

export type CommandMode = 'relawan' | 'saksi_tps' | 'kemenangan';

export const COMMAND_MODE_TABS: { mode: CommandMode; label: string; sublabel: string }[] = [
  { mode: 'relawan', label: 'Peta Relawan', sublabel: 'Target & Posko' },
  { mode: 'saksi_tps', label: 'Saksi Mandat (TPS)', sublabel: 'Presensi, C1 & Anomali' },
  { mode: 'kemenangan', label: 'Peta Kemenangan', sublabel: 'Perolehan Suara & Caleg' },
];

// -------------------------------------------------------------
// TIER / CHOROPLETH — identik dengan ACHIEVEMENT_STATUS_MAP dan
// PAN_VICTORY_CONFIG di web (indonesia-map.tsx & pan-kemenangan-service.ts)
// -------------------------------------------------------------

export type AchievementTier = 'TARGET_MET' | 'NEAR_TARGET' | 'LOW' | 'ZERO_VOLUNTEER' | 'NO_DATA';

export interface TierMeta {
  tier: AchievementTier;
  label: string;
  rangeLabel: string;
  color: string;
}

export const ACHIEVEMENT_STATUS_MAP: Record<AchievementTier, TierMeta> = {
  TARGET_MET: { tier: 'TARGET_MET', label: 'Optimal / Target Terpenuhi', rangeLabel: '≥ 100%', color: '#1D4ED8' },
  NEAR_TARGET: { tier: 'NEAR_TARGET', label: 'Mendekati Kuota Target', rangeLabel: '80% – 99.9%', color: '#60A5FA' },
  LOW: { tier: 'LOW', label: 'Capaian Parsial', rangeLabel: '25% – 79.9%', color: '#EAB308' },
  ZERO_VOLUNTEER: { tier: 'ZERO_VOLUNTEER', label: 'Capaian Rendah', rangeLabel: '< 25%', color: '#EF4444' },
  NO_DATA: { tier: 'NO_DATA', label: 'Belum Ada Data', rangeLabel: 'Nihil / 0%', color: '#64748B' },
};

export function getAchievementTier(percent: number): TierMeta {
  if (percent <= 0) return ACHIEVEMENT_STATUS_MAP.NO_DATA;
  if (percent >= 100) return ACHIEVEMENT_STATUS_MAP.TARGET_MET;
  if (percent >= 80) return ACHIEVEMENT_STATUS_MAP.NEAR_TARGET;
  if (percent >= 25) return ACHIEVEMENT_STATUS_MAP.LOW;
  return ACHIEVEMENT_STATUS_MAP.ZERO_VOLUNTEER;
}

export interface VictoryTierMeta {
  label: string;
  shortLabel: string;
  rangeLabel: string;
  color: string;
}

export const PAN_VICTORY_CONFIG: VictoryTierMeta[] = [
  { label: 'Unggul Mutlak', shortLabel: 'Unggul', rangeLabel: '> 40%', color: '#1D4ED8' },
  { label: 'Pas-pasan', shortLabel: 'Pas-pasan', rangeLabel: '25% – 40%', color: '#38BDF8' },
  { label: 'Setengah', shortLabel: 'Setengah', rangeLabel: '15% – 24.9%', color: '#EAB308' },
  { label: 'Sedikit', shortLabel: 'Sedikit', rangeLabel: '1% – 14.9%', color: '#EF4444' },
  { label: 'Nihil', shortLabel: 'Nihil', rangeLabel: '0%', color: '#64748B' },
];

export function getVictoryTier(percent: number): VictoryTierMeta {
  if (percent > 40) return PAN_VICTORY_CONFIG[0];
  if (percent >= 25) return PAN_VICTORY_CONFIG[1];
  if (percent >= 15) return PAN_VICTORY_CONFIG[2];
  if (percent >= 1) return PAN_VICTORY_CONFIG[3];
  return PAN_VICTORY_CONFIG[4];
}

// Peringkat partai web TIDAK membandingkan suara 18 partai aktual — hanya
// dipetakan dari tier performa PAN (dikonfirmasi dari pan-kemenangan-service.ts
// baris 306-510: DOMINANT→1, LEAN→2, MODERATE→3/4, LOW→6/7/8/12).
export function getPartyRankForVictoryTier(tier: VictoryTierMeta): number {
  switch (tier.label) {
    case 'Unggul Mutlak':
      return 1;
    case 'Pas-pasan':
      return 2;
    case 'Setengah':
      return 4;
    case 'Sedikit':
      return 7;
    default:
      return 12;
  }
}

// Highlight wilayah terpilih — replika styleCell/isSelected (Bagian 4.4)
export const SELECTED_REGION_STYLE = {
  borderWidth: 3.5,
  borderColor: '#00529C',
  borderStyle: 'solid' as const,
  fillOpacityMin: 0.88,
};
export const UNSELECTED_REGION_STYLE = {
  borderWidth: 1,
  borderStyle: 'dashed' as const,
  fillOpacityRange: [0.65, 0.78] as const,
};

// -------------------------------------------------------------
// WILAYAH — 38 Provinsi (konsisten dengan Bagian 1.3 dokumen)
// -------------------------------------------------------------

export interface ProvinceRegion {
  id: string;
  code: string;
  name: string;
  island: string;
}

export const PROVINCES: ProvinceRegion[] = [
  // SUMATERA (10)
  { id: 'aceh', code: '11', name: 'Aceh', island: 'Sumatera' },
  { id: 'sumut', code: '12', name: 'Sumatera Utara', island: 'Sumatera' },
  { id: 'sumbar', code: '13', name: 'Sumatera Barat', island: 'Sumatera' },
  { id: 'riau', code: '14', name: 'Riau', island: 'Sumatera' },
  { id: 'jambi', code: '15', name: 'Jambi', island: 'Sumatera' },
  { id: 'sumsel', code: '16', name: 'Sumatera Selatan', island: 'Sumatera' },
  { id: 'bengkulu', code: '17', name: 'Bengkulu', island: 'Sumatera' },
  { id: 'lampung', code: '18', name: 'Lampung', island: 'Sumatera' },
  { id: 'babel', code: '19', name: 'Kep. Bangka Belitung', island: 'Sumatera' },
  { id: 'kepri', code: '21', name: 'Kepulauan Riau', island: 'Sumatera' },
  // JAWA (6)
  { id: 'dki', code: '31', name: 'DKI Jakarta', island: 'Jawa' },
  { id: 'jabar', code: '32', name: 'Jawa Barat', island: 'Jawa' },
  { id: 'jateng', code: '33', name: 'Jawa Tengah', island: 'Jawa' },
  { id: 'diy', code: '34', name: 'DI Yogyakarta', island: 'Jawa' },
  { id: 'jatim', code: '35', name: 'Jawa Timur', island: 'Jawa' },
  { id: 'banten', code: '36', name: 'Banten', island: 'Jawa' },
  // BALI & NUSA TENGGARA (3)
  { id: 'bali', code: '51', name: 'Bali', island: 'Bali & Nusa Tenggara' },
  { id: 'ntb', code: '52', name: 'Nusa Tenggara Barat', island: 'Bali & Nusa Tenggara' },
  { id: 'ntt', code: '53', name: 'Nusa Tenggara Timur', island: 'Bali & Nusa Tenggara' },
  // KALIMANTAN (5)
  { id: 'kalbar', code: '61', name: 'Kalimantan Barat', island: 'Kalimantan' },
  { id: 'kalteng', code: '62', name: 'Kalimantan Tengah', island: 'Kalimantan' },
  { id: 'kalsel', code: '63', name: 'Kalimantan Selatan', island: 'Kalimantan' },
  { id: 'kaltim', code: '64', name: 'Kalimantan Timur', island: 'Kalimantan' },
  { id: 'kalut', code: '65', name: 'Kalimantan Utara', island: 'Kalimantan' },
  // SULAWESI (6)
  { id: 'sulut', code: '71', name: 'Sulawesi Utara', island: 'Sulawesi' },
  { id: 'sulteng', code: '72', name: 'Sulawesi Tengah', island: 'Sulawesi' },
  { id: 'sulsel', code: '73', name: 'Sulawesi Selatan', island: 'Sulawesi' },
  { id: 'sultra', code: '74', name: 'Sulawesi Tenggara', island: 'Sulawesi' },
  { id: 'gorontalo', code: '75', name: 'Gorontalo', island: 'Sulawesi' },
  { id: 'sulbar', code: '76', name: 'Sulawesi Barat', island: 'Sulawesi' },
  // MALUKU (2)
  { id: 'maluku', code: '81', name: 'Maluku', island: 'Maluku' },
  { id: 'malut', code: '82', name: 'Maluku Utara', island: 'Maluku' },
  // PAPUA (6)
  { id: 'papuabarat', code: '91', name: 'Papua Barat', island: 'Papua' },
  { id: 'papua', code: '94', name: 'Papua', island: 'Papua' },
  { id: 'papuaselatan', code: '95', name: 'Papua Selatan', island: 'Papua' },
  { id: 'papuatengah', code: '96', name: 'Papua Tengah', island: 'Papua' },
  { id: 'papuapegunungan', code: '97', name: 'Papua Pegunungan', island: 'Papua' },
  { id: 'papuabaratdaya', code: '98', name: 'Papua Barat Daya', island: 'Papua' },
];

// -------------------------------------------------------------
// KARTU KPI PER MODE — field disamakan dengan Bagian 5 (Matriks
// Kesesuaian Nilai) dokumen di atas, bukan struktur bebas.
// -------------------------------------------------------------

export interface RelawanStats {
  target: number;
  active: number;
  percent: number;
  statusMeta: TierMeta;
  poskoCount: number;
}

export interface SaksiTpsStats {
  saksiMandat: number;
  tpsCount: number;
  saksiHadirCount: number;
  saksiPercent: number;
  saksiStatusMeta: TierMeta;
  tpsStats: { selesai: number; selesaiPercent: number };
  saksiAnomaliCount: number;
}

export interface KemenanganStats {
  panVotes: number;
  panPercent: number;
  tierConfig: VictoryTierMeta;
  partyRank: number;
  totalParties: number;
  kursiEstimasi: number;
  kursiLabel: 'DPR RI' | 'DPRD';
}

export interface ProvinceCommandItem extends ProvinceRegion {
  relawan: RelawanStats;
  saksi_tps: SaksiTpsStats;
  kemenangan: KemenanganStats;
}

// Deterministic pseudo-random generator (bukan Math.random) agar nilai
// stabil antar render sampai diganti sumber data API riil.
function seeded(seed: string, salt: string): number {
  let h = 0;
  const s = `${seed}::${salt}`;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h % 10000) / 10000;
}

function buildProvinceStats(region: ProvinceRegion): ProvinceCommandItem {
  const sizeFactor = 0.15 + seeded(region.id, 'size') * 0.85; // wilayah besar vs kecil
  const totalTps = Math.max(600, Math.round(sizeFactor * 140000));

  // Persentase resmi (Relawan, Saksi Mandat TPS, Kemenangan PAN) diambil
  // dari PERSENTASE_COMMAND_CENTER.md (lihat catatan header file), bukan
  // formula seeded-random lagi — hanya kuantitas turunan yang masih sintetis.
  const percentEntry = PROVINCE_PERCENTAGE_DATA[region.id];

  // Mode Relawan
  const target = Math.max(300, Math.round(totalTps * (0.25 + seeded(region.id, 'target') * 0.15)));
  const relawanPercent = percentEntry ? percentEntry.relawanPercent : Math.round((55 + seeded(region.id, 'relawan') * 55) * 10) / 10;
  const active = Math.round(target * (relawanPercent / 100));
  const poskoCount = Math.max(3, Math.round(target / (180 + seeded(region.id, 'posko') * 220)));

  // Mode Saksi Mandat (TPS)
  const tpsCount = totalTps;
  const saksiMandat = Math.round(tpsCount * (1 + seeded(region.id, 'mandat') * 0.1));
  const saksiPercent = percentEntry ? percentEntry.saksiPercent : Math.round((70 + seeded(region.id, 'saksi') * 30) * 10) / 10;
  const saksiHadirCount = Math.round(saksiMandat * (saksiPercent / 100));
  // C1 Masuk berjenjang murni dari saksiHadirCount (bukan independen dari
  // tpsCount) — rasio 0.90–0.96 meniru c1PlanoCount/sirekapOcrCount web
  // (saksi-anomaly-service.ts:832-895), sehingga selesai <= saksiHadirCount.
  const c1Ratio = 0.9 + seeded(region.id, 'c1') * 0.06;
  const selesai = Math.round(saksiHadirCount * c1Ratio);
  const selesaiPercent = tpsCount > 0 ? Math.round((selesai / tpsCount) * 1000) / 10 : 0;
  const saksiAnomaliCount = Math.round(seeded(region.id, 'anomali') * 6);

  // Mode Kemenangan
  const panPercent = percentEntry ? percentEntry.panPercent : Math.round((3 + seeded(region.id, 'menang') * 40) * 10) / 10;
  const totalValidVotes = Math.round(totalTps * (280 + seeded(region.id, 'dpt') * 80));
  const panVotes = Math.round(totalValidVotes * (panPercent / 100));
  const victoryTier = getVictoryTier(panPercent);
  // partyRank & kursiEstimasi meniru heuristik web persis (bukan acak):
  // partyRank dari tier performa, kursiEstimasi = round(panPercent / 6)
  // (dikonfirmasi pan-kemenangan-service.ts:306-510).
  const partyRank = getPartyRankForVictoryTier(victoryTier);
  const kursiEstimasi = Math.max(0, Math.round(panPercent / 6));

  return {
    ...region,
    relawan: {
      target,
      active,
      percent: relawanPercent,
      statusMeta: getAchievementTier(relawanPercent),
      poskoCount,
    },
    saksi_tps: {
      saksiMandat,
      tpsCount,
      saksiHadirCount,
      saksiPercent,
      saksiStatusMeta: getAchievementTier(saksiPercent),
      tpsStats: { selesai, selesaiPercent },
      saksiAnomaliCount,
    },
    kemenangan: {
      panVotes,
      panPercent,
      tierConfig: victoryTier,
      partyRank,
      totalParties: 18,
      kursiEstimasi,
      kursiLabel: 'DPRD',
    },
  };
}

const PROVINCES_DATA: ProvinceCommandItem[] = PROVINCES.map(buildProvinceStats);

// -------------------------------------------------------------
// AGREGAT NASIONAL (dipakai tab Ringkasan saat level = Nasional)
// -------------------------------------------------------------

export interface NationalModeSummary {
  relawan: RelawanStats;
  saksi_tps: SaksiTpsStats;
  kemenangan: KemenanganStats & { kursiLabel: 'DPR RI' };
}

function sumBy<T>(items: T[], pick: (item: T) => number): number {
  return items.reduce((total, item) => total + pick(item), 0);
}

function buildNationalSummary(provinces: ProvinceCommandItem[]): NationalModeSummary {
  const target = sumBy(provinces, (p) => p.relawan.target);
  const active = sumBy(provinces, (p) => p.relawan.active);
  const relawanPercent = target > 0 ? Math.round((active / target) * 1000) / 10 : 0;
  const poskoCount = sumBy(provinces, (p) => p.relawan.poskoCount);

  const saksiMandat = sumBy(provinces, (p) => p.saksi_tps.saksiMandat);
  const tpsCount = sumBy(provinces, (p) => p.saksi_tps.tpsCount);
  const saksiHadirCount = sumBy(provinces, (p) => p.saksi_tps.saksiHadirCount);
  const saksiPercent = saksiMandat > 0 ? Math.round((saksiHadirCount / saksiMandat) * 1000) / 10 : 0;
  const selesai = sumBy(provinces, (p) => p.saksi_tps.tpsStats.selesai);
  const selesaiPercent = tpsCount > 0 ? Math.round((selesai / tpsCount) * 1000) / 10 : 0;
  const saksiAnomaliCount = sumBy(provinces, (p) => p.saksi_tps.saksiAnomaliCount);

  const panVotes = sumBy(provinces, (p) => p.kemenangan.panVotes);
  const totalAllVotes = Math.round(panVotes / 0.18); // proporsi PAN nasional perkiraan
  const panPercent = totalAllVotes > 0 ? Math.round((panVotes / totalAllVotes) * 1000) / 10 : 0;
  const nationalVictoryTier = getVictoryTier(panPercent);
  const kursiEstimasi = sumBy(provinces, (p) => p.kemenangan.kursiEstimasi);

  return {
    relawan: {
      target,
      active,
      percent: relawanPercent,
      statusMeta: getAchievementTier(relawanPercent),
      poskoCount,
    },
    saksi_tps: {
      saksiMandat,
      tpsCount,
      saksiHadirCount,
      saksiPercent,
      saksiStatusMeta: getAchievementTier(saksiPercent),
      tpsStats: { selesai, selesaiPercent },
      saksiAnomaliCount,
    },
    kemenangan: {
      panVotes,
      panPercent,
      tierConfig: nationalVictoryTier,
      partyRank: getPartyRankForVictoryTier(nationalVictoryTier),
      totalParties: 18,
      kursiEstimasi,
      kursiLabel: 'DPR RI',
    },
  };
}

const NATIONAL_SUMMARY = buildNationalSummary(PROVINCES_DATA);

// -------------------------------------------------------------
// FORMAT ANGKA — locale id-ID, identik `.toLocaleString('id-ID')` di web
// -------------------------------------------------------------

export function formatNumberID(value: number): string {
  return value.toLocaleString('id-ID');
}

export function formatPercent(value: number): string {
  return `${value.toLocaleString('id-ID', { maximumFractionDigits: 1 })}%`;
}

// -------------------------------------------------------------
// PETA SEBARAN — bridge slug/warna untuk gisHtmlBuilder (Peta Sebaran &
// Command Center kini satu layar; lihat MapSebaranRelawanAnggotaScreen).
// `slug` memakai algoritma yang identik dengan normalizeProvinceSlug JS
// yang di-inline ke dalam WebView, sehingga key selalu cocok dengan
// properti PROVINSI pada GeoJSON.
// -------------------------------------------------------------

export function getProvinceSlug(provinceName: string): string {
  return normalizeProvinceSlug(provinceName);
}

export function getTierColorForMode(province: ProvinceCommandItem, mode: CommandMode): string {
  if (mode === 'relawan') return province.relawan.statusMeta.color;
  if (mode === 'saksi_tps') return province.saksi_tps.saksiStatusMeta.color;
  return province.kemenangan.tierConfig.color;
}

export function getTierValueLabelForMode(province: ProvinceCommandItem, mode: CommandMode): string {
  if (mode === 'relawan') return formatPercent(province.relawan.percent);
  if (mode === 'saksi_tps') return formatPercent(province.saksi_tps.saksiPercent);
  return formatPercent(province.kemenangan.panPercent);
}

export interface RegionColorMap {
  colors: Record<string, string>;
  labels: Record<string, string>;
}

// -------------------------------------------------------------
// RINCIAN KABUPATEN/KOTA PER PROVINSI — dipakai modal Ringkasan saat
// sebuah provinsi dipilih di peta: setiap kab/kota menampilkan 3
// persentase sekaligus (Relawan, Saksi Mandat TPS, Kemenangan), bukan
// cuma mode yang sedang aktif di peta. Nama kab/kota diambil dari
// GeoJSON batas wilayah ASLI yang sudah dipakai peta (bukan nama
// karangan) — screen memberikan geojson provinsi yang sudah dimuatnya
// lewat getProvinceKabupatenGeoJson(). Angkanya sendiri tetap data
// placeholder deterministik (lihat catatan Fase 1 di header file ini)
// sampai tersedia API agregasi per kab/kota.
// -------------------------------------------------------------

export interface RegencyBreakdownItem {
  name: string;
  relawanPercent: number;
  relawanTier: TierMeta;
  saksiPercent: number;
  saksiTier: TierMeta;
  kemenanganPercent: number;
  kemenanganTier: VictoryTierMeta;
}

// Aturan waris (dikonfirmasi volunteer-map-service.ts:448-457): kalau
// wilayah induk merah (<25%, tier ZERO_VOLUNTEER), semua anaknya dipaksa
// ikut merah juga — bukan hasil generate independen.
function inheritRedTier(childPercent: number, parentTier: TierMeta): number {
  if (parentTier.tier === 'ZERO_VOLUNTEER' && childPercent >= 25) {
    return Math.round((childPercent % 25) * 10) / 10;
  }
  return childPercent;
}

// PERSENTASE_COMMAND_CENTER.md menamai kab/kota "Kab. X" / "Kota X", sedang
// properti `kabupaten` pada geojson batas wilayah cuma "X" (tanpa prefix
// "Kab. ") untuk kabupaten, dan "Kota X" (prefix dipertahankan) untuk kota —
// dikonfirmasi langsung dari data geojson (mis. jawa-barat.json: "Bandung"
// vs "Kota Bandung"). Ejaan keduanya juga kadang beda spasi/kapitalisasi
// (mis. "Gunungkidul" vs "Gunung Kidul", "Pangkajene dan Kepulauan" vs
// "Pangkajene Dan Kepulauan") — dicocokkan via `normalizeRegencyKey`
// (lowercase, buang semua non-alfanumerik). Sebagian kecil kab/kota di
// geojson masih pakai nama lama dari sebelum pemekaran/ganti nama
// administratif (mis. "Mamuju Utara" utk "Pasangkayu") — dipetakan manual
// lewat `REGENCY_NAME_ALIASES`.
function toGeoJsonRegencyName(docName: string): string {
  return docName.startsWith('Kab. ') ? docName.slice(5) : docName;
}

function normalizeRegencyKey(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// key = normalizeRegencyKey(nama di PERSENTASE_COMMAND_CENTER.md, setelah toGeoJsonRegencyName)
// value = nama sesuai geojson batas wilayah
const REGENCY_NAME_ALIASES: Record<string, string> = {
  [normalizeRegencyKey('Toba')]: 'Toba Samosir',
  [normalizeRegencyKey('OKU Timur')]: 'Ogan Komering Ulu Timur',
  [normalizeRegencyKey('OKU Selatan')]: 'Ogan Komering Ulu Selatan',
  [normalizeRegencyKey('Mahakam Ulu')]: 'Mahakam Hulu',
  [normalizeRegencyKey('Kepulauan Siau Tagulandang Biaro')]: 'Siau Tagulandang Biaro',
  [normalizeRegencyKey('Pasangkayu')]: 'Mamuju Utara',
  [normalizeRegencyKey('Kepulauan Tanimbar')]: 'Maluku Tenggara Barat',
};

function buildRegencyPercentageLookup(provinceId: string): Map<string, RegencyPercentageEntry> {
  const entries = REGENCY_PERCENTAGE_DATA[provinceId] || [];
  const map = new Map<string, RegencyPercentageEntry>();
  entries.forEach((entry) => {
    const geoName = toGeoJsonRegencyName(entry.name);
    map.set(normalizeRegencyKey(geoName), entry);
    const alias = REGENCY_NAME_ALIASES[normalizeRegencyKey(geoName)];
    if (alias) map.set(normalizeRegencyKey(alias), entry);
  });
  return map;
}

export function buildRegencyBreakdown(province: ProvinceCommandItem, regencyGeoJson: any): RegencyBreakdownItem[] {
  const features = regencyGeoJson && Array.isArray(regencyGeoJson.features) ? regencyGeoJson.features : [];
  const seenNames = new Set<string>();
  const percentageLookup = buildRegencyPercentageLookup(province.id);

  return features
    .map((feature: any): RegencyBreakdownItem | null => {
      const name = feature?.properties?.kabupaten || feature?.properties?.name || '';
      if (!name || seenNames.has(name)) return null;
      seenNames.add(name);

      const seed = `${province.name}::${name}`;
      const fixedEntry = percentageLookup.get(normalizeRegencyKey(name));

      const relawanPercent = fixedEntry
        ? fixedEntry.relawanPercent
        : inheritRedTier(Math.round((55 + seeded(seed, 'relawan') * 55) * 10) / 10, province.relawan.statusMeta);
      const saksiPercent = fixedEntry
        ? fixedEntry.saksiPercent
        : inheritRedTier(Math.round((70 + seeded(seed, 'saksi') * 30) * 10) / 10, province.saksi_tps.saksiStatusMeta);
      const kemenanganPercent = fixedEntry ? fixedEntry.panPercent : Math.round(seeded(seed, 'menang') * 45 * 10) / 10;

      return {
        name,
        relawanPercent,
        relawanTier: getAchievementTier(relawanPercent),
        saksiPercent,
        saksiTier: getAchievementTier(saksiPercent),
        kemenanganPercent,
        kemenanganTier: getVictoryTier(kemenanganPercent),
      };
    })
    .filter((item: RegencyBreakdownItem | null): item is RegencyBreakdownItem => item !== null)
    .sort((a: RegencyBreakdownItem, b: RegencyBreakdownItem) => a.name.localeCompare(b.name));
}

// -------------------------------------------------------------
// LAYANAN COMMAND CENTER MOBILE
// -------------------------------------------------------------

export const commandCenterService = {
  getModeTabs() {
    return COMMAND_MODE_TABS;
  },

  getProvinces(): ProvinceCommandItem[] {
    return PROVINCES_DATA;
  },

  getProvinceById(provinceId: string): ProvinceCommandItem | undefined {
    return PROVINCES_DATA.find((p) => p.id === provinceId || p.code === provinceId);
  },

  getProvinceBySlug(slug: string): ProvinceCommandItem | undefined {
    return PROVINCES_DATA.find((p) => getProvinceSlug(p.name) === slug);
  },

  getNationalSummary(): NationalModeSummary {
    return NATIONAL_SUMMARY;
  },

  getRegencyBreakdown(province: ProvinceCommandItem, regencyGeoJson: any): RegencyBreakdownItem[] {
    return buildRegencyBreakdown(province, regencyGeoJson);
  },

  getRegionColorMap(mode: CommandMode): RegionColorMap {
    const colors: Record<string, string> = {};
    const labels: Record<string, string> = {};
    PROVINCES_DATA.forEach((province) => {
      const slug = getProvinceSlug(province.name);
      colors[slug] = getTierColorForMode(province, mode);
      labels[slug] = getTierValueLabelForMode(province, mode);
    });
    return { colors, labels };
  },
};
