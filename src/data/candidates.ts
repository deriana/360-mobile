import { PASLON_AVATARS, PASLON_RUNNING_MATE_AVATARS, CALEG_AVATARS } from './images';

export interface CandidateProfile {
  name: string;
  category: 'pilpres' | 'dpr';
  numberLabel: string;
  partyOrCoalition: string;
  vision: string;
  mission: string[];
  programs: string[];
  education: string;
  experience: string;
  avatarUri: any;
  runningMateAvatarUri?: any;
  kpuVerified: boolean;
}

export const CANDIDATE_PROFILES: Record<string, CandidateProfile> = {
  "Paslon 01 — Anies & Muhaimin": {
    name: "Paslon 01 — Anies Rasyid Baswedan & Muhaimin Iskandar",
    category: "pilpres",
    numberLabel: "Pasangan Calon No. Urut 01",
    partyOrCoalition: "Koalisi Perubahan (NasDem, PKB, PKS)",
    vision: "Indonesia Adil Makmur untuk Semua",
    mission: [
      "Memastikan Ketersediaan Kebutuhan Pokok dan Biaya Hidup Murah",
      "Mengentaskan Kemiskinan dan Menciptakan Lapangan Kerja Berkualitas",
      "Menjamin Keadilan Ekologis dan Pembangunan Berkelanjutan",
      "Memperkuat Tata Kelola Pemerintahan yang Bersih dari KKN",
    ],
    programs: [
      "Bantuan Sosial Plus & Sembako Murah",
      "Pendidikan Gratis & Beasiswa Unggulan",
      "Kredit Usaha Anak Muda (KPR & Modal Usaha)",
    ],
    education: "S3 Northern Illinois University (Anies) & S2 Universitas Indonesia (Muhaimin)",
    experience: "Gubernur DKI Jakarta (2017-2022), Mendikbud & Wakil Ketua DPR RI",
    avatarUri: PASLON_AVATARS["Paslon 01 — Anies & Muhaimin"],
    runningMateAvatarUri: PASLON_RUNNING_MATE_AVATARS["Paslon 01 — Anies & Muhaimin"],
    kpuVerified: true,
  },
  "Paslon 02 — Prabowo & Gibran": {
    name: "Paslon 02 — Prabowo Subianto & Gibran Rakabuming Raka",
    category: "pilpres",
    numberLabel: "Pasangan Calon No. Urut 02",
    partyOrCoalition: "Koalisi Indonesia Maju (Gerindra, Golkar, PAN, Demokrat, PSI, Gelora, Garuda)",
    vision: "Bersama Indonesia Maju Menuju Indonesia Emas 2045",
    mission: [
      "Memperkuat Ideologi Pancasila, Demokrasi, dan HAM",
      "Pemantapan Sistem Pertahanan Keamanan Negara dan Kemandirian Bangsa",
      "Melanjutkan Hilirisasi dan Industrialisasi Berbasis Sumber Daya Alam",
      "Membangun dari Desa dan dari Bawah untuk Pemerataan Ekonomi",
    ],
    programs: [
      "Makan Siang dan Susu Gratis di Sekolah & Pesantren",
      "Pemeriksaan Kesehatan Gratis & Pemberantasan TBC",
      "Pembangunan Rumah Murah & Sanitasi Desa",
    ],
    education: "Fort Moore US Military (Prabowo) & Management Development Institute of Singapore (Gibran)",
    experience: "Menteri Pertahanan RI (2019-2024) & Wali Kota Surakarta (2021-2024)",
    avatarUri: PASLON_AVATARS["Paslon 02 — Prabowo & Gibran"],
    runningMateAvatarUri: PASLON_RUNNING_MATE_AVATARS["Paslon 02 — Prabowo & Gibran"],
    kpuVerified: true,
  },
  "Paslon 03 — Ganjar & Mahfud": {
    name: "Paslon 03 — Ganjar Pranowo & Mahfud MD",
    category: "pilpres",
    numberLabel: "Pasangan Calon No. Urut 03",
    partyOrCoalition: "Koalisi PDI Perjuangan, PPP, Perindo, Hanura",
    vision: "Menuju Indonesia Unggul: Gerak Cepat Mewujudkan Negara Maritim yang Adil dan Lestari",
    mission: [
      "Mempercepat Pembangunan Manusia Indonesia yang Unggul dan Berkualitas",
      "Mempercepat Penguasaan Sains dan Teknologi Melalui Riset Berkelanjutan",
      "Mempercepat Pembangunan Ekonomi Berdikari Berbasis Pengetahuan",
      "Mempercepat Penegakan Hukum dan Kepastian Hukum yang Adil",
    ],
    programs: [
      "1 Keluarga Miskin 1 Sarjana",
      "KTP Sakti (Satu Kartu Terintegrasi)",
      "Internet Gratis dan Cepat untuk Pelajar & UMKM",
    ],
    education: "S2 Universitas Indonesia (Ganjar) & S3 Universitas Gadjah Mada (Mahfud)",
    experience: "Gubernur Jawa Tengah (2013-2023), Menko Polhukam & Ketua Mahkamah Konstitusi",
    avatarUri: PASLON_AVATARS["Paslon 03 — Ganjar & Mahfud"],
    runningMateAvatarUri: PASLON_RUNNING_MATE_AVATARS["Paslon 03 — Ganjar & Mahfud"],
    kpuVerified: true,
  },
  "Kartika Wulandari Praditya (Partai Karya Mandiri)": {
    name: "Dr. Hj. Kartika Wulandari Praditya, S.IP., M.I.Kom.",
    category: "dpr",
    numberLabel: "Caleg DPR RI Dapil Jabar I — No. Urut 1",
    partyOrCoalition: "Partai Karya Mandiri",
    vision: "Pemberdayaan Keluarga, Kesejahteraan Perempuan & Pendidikan Anak Jawa Barat",
    mission: [
      "Peningkatan Literasi & Kualitas Pendidikan Anak",
      "Penguatan Ekonomi Keluarga & Pelatihan UMKM Perempuan",
      "Advokasi Perlindungan Anak dan Hak Perempuan",
    ],
    programs: [
      "Posyandu Digital & Gizi Anak Bebas Stunting",
      "Kredit Modal Usaha Ibu Mandiri",
    ],
    education: "S3 Universitas Padjadjaran (Cumlaude)",
    experience: "Ketua Tim Penggerak PKK Jawa Barat & Dosen Universitas Widyatama",
    avatarUri: CALEG_AVATARS["Kartika Wulandari Praditya (Partai Karya Mandiri)"],
    kpuVerified: true,
  },
  "Farida Ramadhani Azzahra (Partai Amanah Bangsa)": {
    name: "Hj. Farida Ramadhani Azzahra, S.Si., M.Psi.T.",
    category: "dpr",
    numberLabel: "Caleg DPR RI Dapil Jabar I — No. Urut 1",
    partyOrCoalition: "Partai Amanah Bangsa",
    vision: "Mewujudkan Masyarakat Mandiri, Berpendidikan, dan Berkeadilan Sosial",
    mission: [
      "Advokasi Kebijakan Perlindungan Disabilitas dan Lansia",
      "Penguatan Karakter & Anggaran Pendidikan Rakyat",
    ],
    programs: [
      "Beasiswa Pendidikan untuk Keluarga Kurang Mampu",
      "Bantuan Sarana Pendidikan Agama & Komunitas",
    ],
    education: "S2 Psikologi Universitas Indonesia",
    experience: "Anggota DPR RI Komisi X (2014-Sekarang)",
    avatarUri: CALEG_AVATARS["Farida Ramadhani Azzahra (Partai Amanah Bangsa)"],
    kpuVerified: true,
  },
  "Bima Aditya Nugraha (Partai Perjuangan Nusantara)": {
    name: "Bima Aditya Nugraha, S.E.",
    category: "dpr",
    numberLabel: "Caleg DPR RI Dapil Jabar I — No. Urut 1",
    partyOrCoalition: "Partai Perjuangan Nusantara",
    vision: "Pengembangan Ekonomi Kreatif, Kebudayaan, dan Kepemudaan Bandung",
    mission: [
      "Pemberdayaan Pelaku Ekonomi Kreatif & Seni Budaya Kota Bandung",
      "Pengawasan Beasiswa & Bantuan Kepemudaan",
    ],
    programs: [
      "Hub Ekonomi Kreatif Pemuda Bandung",
      "Pendampingan Usaha Pemula Kreatif",
    ],
    education: "S1 Ekonomi Universitas Padjadjaran",
    experience: "Anggota DPR RI Komisi X & Presenter Profesional",
    avatarUri: CALEG_AVATARS["Bima Aditya Nugraha (Partai Perjuangan Nusantara)"],
    kpuVerified: true,
  },
  "Rizky Firmansyah Malik (Partai Nusantara Bersatu)": {
    name: "H. Rizky Firmansyah Malik, S.E.",
    category: "dpr",
    numberLabel: "Caleg DPR RI Dapil Jabar I — No. Urut 1",
    partyOrCoalition: "Partai Nusantara Bersatu",
    vision: "Transformasi Digital, Penyiaran Berkualitas & Pariwisata Kota Bandung",
    mission: [
      "Pengembangan Infrastruktur Digital & Penyiaran Publik",
      "Dukungan Industri Wisata dan Kuliner Lokal",
    ],
    programs: [
      "Konektivitas Internet Komunitas Kota Bandung",
      "Festival UMKM Kreatif Nusantara",
    ],
    education: "S1 Ekonomi Universitas Padjadjaran",
    experience: "Anggota DPR RI Komisi I & Penyiar Radio / Presenter",
    avatarUri: CALEG_AVATARS["Rizky Firmansyah Malik (Partai Nusantara Bersatu)"],
    kpuVerified: true,
  },
  "Ningsih Purnama Sari (Partai Demokrasi Sejahtera)": {
    name: "Dr. Hj. Ningsih Purnama Sari",
    category: "dpr",
    numberLabel: "Caleg DPR RI Dapil Jabar I — No. Urut 1",
    partyOrCoalition: "Partai Demokrasi Sejahtera",
    vision: "Penguatan Supremasi Hukum dan Reformasi Birokrasi yang Berkeadilan",
    mission: [
      "Pengawasan Legislasi Anti-Korupsi & Reformasi Birokrasi",
      "Advokasi Kesetaraan Gender dalam Politik dan Pemerintahan",
    ],
    programs: [
      "Klinik Hukum Gratis untuk Masyarakat Kurang Mampu",
      "Pelatihan Kepemimpinan Perempuan di Legislatif",
    ],
    education: "S3 Ilmu Hukum Universitas Indonesia",
    experience: "Anggota Komisi Yudisial & Akademisi Hukum Tata Negara",
    avatarUri: CALEG_AVATARS["Ningsih Purnama Sari (Partai Demokrasi Sejahtera)"],
    kpuVerified: true,
  },
  "Solihin Maulana Ibrahim (Partai Kebangkitan Rakyat)": {
    name: "H. Solihin Maulana Ibrahim, S.Pd.",
    category: "dpr",
    numberLabel: "Caleg DPR RI Dapil Jabar I — No. Urut 1",
    partyOrCoalition: "Partai Kebangkitan Rakyat",
    vision: "Pendidikan Berkualitas dan Merata bagi Seluruh Anak Bangsa",
    mission: [
      "Peningkatan Anggaran & Kualitas Pendidikan Berbasis Pesantren",
      "Pemerataan Akses Pendidikan di Daerah Tertinggal",
    ],
    programs: [
      "Beasiswa Santri Berprestasi",
      "Bantuan Sarana Belajar Sekolah Pinggiran",
    ],
    education: "S2 Pendidikan Universitas Pendidikan Indonesia",
    experience: "Anggota DPR RI Komisi X (2009-Sekarang)",
    avatarUri: CALEG_AVATARS["Solihin Maulana Ibrahim (Partai Kebangkitan Rakyat)"],
    kpuVerified: true,
  },
};

export function getCandidateProfile(name: string): CandidateProfile {
  if (CANDIDATE_PROFILES[name]) return CANDIDATE_PROFILES[name];
  for (const [key, profile] of Object.entries(CANDIDATE_PROFILES)) {
    if (name.includes(key) || key.includes(name)) return profile;
  }
  // Generic fallback profile
  const isPilpres = name.toLowerCase().includes('paslon');
  return {
    name,
    category: isPilpres ? 'pilpres' : 'dpr',
    numberLabel: isPilpres ? 'Pasangan Calon Resmi Pemilu 2024' : 'Caleg DPR RI Terdaftar KPU',
    partyOrCoalition: isPilpres ? 'Koalisi Partai Politik Pengusung' : 'Partai Politik Peserta Pemilu 2024',
    vision: 'Mewujudkan Kesejahteraan Rakyat dan Pembangunan Berkelanjutan di Seluruh Wilayah Indonesia.',
    mission: [
      'Peningkatan Kesejahteraan Rakyat dan Layanan Publik',
      'Penguatan Ekonomi Daerah dan UMKM Masyarakat',
      'Tata Kelola Pemerintahan Bersih dan Transparan',
    ],
    programs: ['Bantuan Usaha Rakyat', 'Beasiswa Pendidikan Unggulan', 'Layanan Kesehatan Terjangkau'],
    education: 'Perguruan Tinggi Terakreditasi',
    experience: 'Tokoh Masyarakat & Pengabdi Publik',
    avatarUri: PASLON_AVATARS[name] || CALEG_AVATARS[name] || require('../../assets/avatars/witness_3.jpg'),
    kpuVerified: true,
  };
}
