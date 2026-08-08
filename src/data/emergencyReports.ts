import { EmergencyCategory, EmergencyReport, EmergencySeverity } from '../types';
import { tpsList } from './tps';
import { witnesses } from './witnesses';
import { IMAGES } from './images';
import { pick } from './seed';

const bandungTps = tpsList.filter((t) => t.regency === 'Kota Bandung');
const witnessFor = (tpsId: string) => witnesses.find((w) => w.assignedTpsId === tpsId)?.id ?? 'OPS-01';

const HANDCRAFTED: EmergencyReport[] = [
  {
    id: 'EMG-001',
    category: 'ballot_shortage',
    description: 'Surat suara kurang 15 lembar dari jumlah DPT terdaftar. Panitia TPS sudah mengajukan permintaan surat suara cadangan ke PPS setempat, namun hingga pukul 07.45 belum ada kepastian waktu pengiriman. Antrean pemilih mulai mengular di depan bilik.',
    tpsId: tpsList[2].id,
    reportedBy: witnessFor(tpsList[2].id),
    severity: 'high',
    status: 'investigating',
    createdAt: '2026-08-08 07:45',
    photos: [IMAGES.ballotPaper, IMAGES.tpsSchool],
  },
  {
    id: 'EMG-002',
    category: 'intimidation',
    description: 'Oknum tidak dikenal mendekati pemilih di area TPS, diduga mengarahkan pilihan. Sudah dilaporkan ke Linmas setempat untuk diawasi lebih lanjut.',
    tpsId: tpsList[5].id,
    reportedBy: witnessFor(tpsList[5].id),
    severity: 'medium',
    status: 'open',
    createdAt: '2026-08-08 08:20',
  },
  {
    id: 'EMG-003',
    category: 'security_disturbance',
    description: 'Keributan kecil antar simpatisan di luar area TPS, sudah dibubarkan aparat setempat. Situasi kembali kondusif dan proses pemungutan suara berjalan normal kembali.',
    tpsId: tpsList[9].id,
    reportedBy: witnessFor(tpsList[9].id),
    severity: 'low',
    status: 'resolved',
    createdAt: '2026-08-08 09:05',
  },
  {
    id: 'EMG-004',
    category: 'vote_buying',
    description: 'Dugaan pembagian uang kepada pemilih di sekitar lokasi TPS oleh orang tidak dikenal menjelang jam buka TPS. Saksi sempat mengambil dokumentasi dari kejauhan.',
    tpsId: tpsList[1].id,
    reportedBy: witnessFor(tpsList[1].id),
    severity: 'high',
    status: 'open',
    createdAt: '2026-08-08 09:30',
  },
  {
    id: 'EMG-005',
    category: 'violation',
    description: 'Petugas KPPS kedapatan membantu salah satu pemilih lansia mencoblos tanpa didampingi sesuai prosedur pendampingan resmi. Sudah diingatkan ketua KPPS.',
    tpsId: tpsList[0].id,
    reportedBy: witnessFor(tpsList[0].id),
    severity: 'medium',
    status: 'investigating',
    createdAt: '2026-08-08 08:05',
    photos: [IMAGES.tpsCommunity],
  },
  {
    id: 'EMG-006',
    category: 'unrest',
    description: 'Sempat terjadi perdebatan antar saksi partai terkait penghitungan suara ulang di salah satu meja, namun berhasil dimediasi ketua KPPS tanpa eskalasi lebih lanjut.',
    tpsId: tpsList[0].id,
    reportedBy: witnessFor(tpsList[0].id),
    severity: 'low',
    status: 'resolved',
    createdAt: '2026-08-08 06:50',
  },
  {
    id: 'EMG-010',
    category: 'ballot_shortage',
    description: 'Formulir C1 Plano sempat sobek kecil di bagian sudut saat proses rekapitulasi, sudah difoto sebelum dan sesudah untuk dokumentasi ke Panwaslu.',
    tpsId: tpsList[0].id,
    reportedBy: witnessFor(tpsList[0].id),
    severity: 'low',
    status: 'open',
    createdAt: '2026-08-08 11:20',
  },
  {
    id: 'EMG-007',
    category: 'ballot_shortage',
    description: 'Tinta pemilu di salah satu bilik suara hampir habis, berpotensi menyulitkan verifikasi jari pemilih berikutnya. Sudah dikoordinasikan penggantian ke PPK.',
    tpsId: tpsList[4].id,
    reportedBy: witnessFor(tpsList[4].id),
    severity: 'low',
    status: 'open',
    createdAt: '2026-08-08 10:15',
  },
  {
    id: 'EMG-008',
    category: 'security_disturbance',
    description: 'Akses jalan menuju TPS sempat macet total akibat parkir liar simpatisan, menghambat mobilitas petugas dan pemilih lansia. Sudah dikoordinasikan dengan aparat lalu lintas.',
    tpsId: bandungTps[0]?.id ?? tpsList[3].id,
    reportedBy: 'OPS-01',
    severity: 'medium',
    status: 'investigating',
    createdAt: '2026-08-08 07:10',
    photos: [IMAGES.tpsOutdoor, IMAGES.tpsHero],
  },
  {
    id: 'EMG-009',
    category: 'violation',
    description: 'Ditemukan alat peraga kampanye masih terpasang tepat di depan pintu masuk TPS, melanggar radius zona netral 500 meter. Sudah diminta dicopot oleh Panwaslu setempat.',
    tpsId: bandungTps[3]?.id ?? tpsList[6].id,
    reportedBy: 'OPS-01',
    severity: 'low',
    status: 'resolved',
    createdAt: '2026-08-08 06:40',
  },
];

const CATEGORY_TEMPLATES: Record<EmergencyCategory, string[]> = {
  ballot_shortage: [
    'Jumlah surat suara di TPS ini tercatat lebih sedikit dari DPT terdaftar. Panitia sudah mengajukan permintaan surat suara cadangan ke PPS setempat.',
    'Tinta pemilu di bilik suara mulai menipis, berpotensi menyulitkan verifikasi jari pemilih berikutnya. Sudah dikoordinasikan penggantian ke PPK.',
    'Formulir C1 Plano sedikit rusak saat proses rekapitulasi, sudah difoto sebelum dan sesudah untuk dokumentasi ke Panwaslu.',
  ],
  intimidation: [
    'Oknum tidak dikenal mendekati pemilih di area TPS, diduga mengarahkan pilihan. Sudah dilaporkan ke Linmas setempat untuk diawasi lebih lanjut.',
    'Beberapa pemilih mengaku merasa tidak nyaman akibat kehadiran simpatisan yang berkerumun terlalu dekat dengan bilik suara.',
  ],
  security_disturbance: [
    'Keributan kecil antar simpatisan di luar area TPS, sudah dibubarkan aparat setempat. Situasi kembali kondusif.',
    'Akses jalan menuju TPS sempat macet akibat parkir liar simpatisan, menghambat mobilitas petugas dan pemilih lansia.',
  ],
  vote_buying: [
    'Dugaan pembagian uang kepada pemilih di sekitar lokasi TPS menjelang jam buka. Saksi sempat mengambil dokumentasi dari kejauhan.',
    'Ditemukan indikasi pembagian sembako dengan embel-embel dukungan ke salah satu paslon di dekat pintu masuk TPS.',
  ],
  violation: [
    'Petugas KPPS kedapatan membantu pemilih lansia mencoblos tanpa didampingi sesuai prosedur resmi. Sudah diingatkan ketua KPPS.',
    'Ditemukan alat peraga kampanye masih terpasang di radius zona netral 500 meter. Sudah diminta dicopot oleh Panwaslu setempat.',
  ],
  unrest: [
    'Sempat terjadi perdebatan antar saksi partai terkait penghitungan suara ulang, namun berhasil dimediasi ketua KPPS tanpa eskalasi.',
    'Kerumunan warga sempat menumpuk di luar TPS menjelang penghitungan suara, sudah diarahkan oleh petugas keamanan setempat.',
  ],
};

const CATEGORIES = Object.keys(CATEGORY_TEMPLATES) as EmergencyCategory[];
const SEVERITY_WEIGHTS: EmergencySeverity[] = ['low', 'low', 'low', 'medium', 'medium', 'high'];
const STATUS_WEIGHTS: Array<EmergencyReport['status']> = ['open', 'open', 'investigating', 'investigating', 'resolved'];
const HOURS = ['06:35', '07:05', '07:40', '08:15', '08:50', '09:25', '10:10', '11:30'];

const handcraftedTpsIds = new Set(HANDCRAFTED.map((r) => r.tpsId));

// One auto-generated report per additional "problem" status TPS nationwide,
// so the emergency feed reflects the whole country instead of just Kota Bandung.
const AUTO_GENERATED: EmergencyReport[] = tpsList
  .filter((t) => t.status === 'problem' && !handcraftedTpsIds.has(t.id))
  .map((t, idx) => {
    const category = pick(CATEGORIES);
    return {
      id: `EMG-AUTO-${String(idx + 1).padStart(4, '0')}`,
      category,
      description: pick(CATEGORY_TEMPLATES[category]),
      tpsId: t.id,
      reportedBy: witnessFor(t.id),
      severity: pick(SEVERITY_WEIGHTS),
      status: pick(STATUS_WEIGHTS),
      createdAt: `2026-08-08 ${pick(HOURS)}`,
    };
  });

export const emergencyReports: EmergencyReport[] = [...HANDCRAFTED, ...AUTO_GENERATED];
