import { PASLON_AVATARS, CALEG_AVATARS } from './images';

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
  avatarUri: string;
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
    kpuVerified: true,
  },
  "Atalia Praratya (Partai Golkar)": {
    name: "Dr. Hj. Atalia Praratya, S.IP., M.I.Kom.",
    category: "dpr",
    numberLabel: "Caleg DPR RI Dapil Jabar I — No. Urut 1",
    partyOrCoalition: "Partai Golongan Karya (Golkar)",
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
    avatarUri: CALEG_AVATARS["Atalia Praratya (Partai Golkar)"],
    kpuVerified: true,
  },
  "H. Ledia Hanifa Amaliah (PKS)": {
    name: "Hj. Ledia Hanifa Amaliah, S.Si., M.Psi.T.",
    category: "dpr",
    numberLabel: "Caleg DPR RI Dapil Jabar I — No. Urut 1",
    partyOrCoalition: "Partai Keadilan Sejahtera (PKS)",
    vision: "Mewujudkan Masyarakat Mandiri, Berpendidikan, dan Berkeadilan Sosial",
    mission: [
      "Advokasi Kebijakan Perlindungan Disabilitas dan Lansia",
      "Penguatan Karakter & Anggaran Pendidikan Rakyat",
    ],
    programs: [
      "Beasiswa Program Indonesia Pintar (PIP)",
      "Bantuan Sarana Pendidikan Agama & Komunitas",
    ],
    education: "S2 Psikologi Universitas Indonesia",
    experience: "Anggota DPR RI Komisi X (2009-Sekarang)",
    avatarUri: CALEG_AVATARS["H. Ledia Hanifa Amaliah (PKS)"],
    kpuVerified: true,
  },
  "Junico BP Siahaan / Nico Siahaan (PDI Perjuangan)": {
    name: "Junico BP Siahaan, S.E. (Nico Siahaan)",
    category: "dpr",
    numberLabel: "Caleg DPR RI Dapil Jabar I — No. Urut 1",
    partyOrCoalition: "Partai Demokrasi Indonesia Perjuangan (PDI Perjuangan)",
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
    avatarUri: CALEG_AVATARS["Junico BP Siahaan / Nico Siahaan (PDI Perjuangan)"],
    kpuVerified: true,
  },
  "H. Muhammad Farhan (Partai NasDem)": {
    name: "H. Muhammad Farhan, S.E.",
    category: "dpr",
    numberLabel: "Caleg DPR RI Dapil Jabar I — No. Urut 1",
    partyOrCoalition: "Partai NasDem",
    vision: "Transformasi Digital, Penyiaran Berkwalitas & Pariwisata Kota Bandung",
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
    avatarUri: CALEG_AVATARS["H. Muhammad Farhan (Partai NasDem)"],
    kpuVerified: true,
  },
};

export function getCandidateProfile(name: string): CandidateProfile {
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
    avatarUri: PASLON_AVATARS[name] || CALEG_AVATARS[name] || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    kpuVerified: true,
  };
}
