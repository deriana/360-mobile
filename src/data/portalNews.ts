import { IMAGES } from './images';

export type NewsCategory =
  | 'ALL'
  | 'GERAKAN_LAPANGAN'
  | 'KAWAL_PEMILU'
  | 'PARLEMEN'
  | 'KADER_BICARA';

export interface PortalNewsItem {
  id: string;
  title: string;
  slug: string;
  category: NewsCategory;
  categoryLabel: string;
  categoryColor: string;
  imageUrl: string;
  localFallbackImage: any;
  imageCaption: string;
  publishedAt: string;
  timeAgo: string;
  readTime: string;
  author: {
    name: string;
    role: string;
    avatarIndex?: number;
  };
  summary: string;
  contentParagraphs: string[];
  pullQuote?: {
    quote: string;
    author: string;
  };
  tags: string[];
  viewsCount: number;
  likesCount: number;
  isFeatured?: boolean;
}

export const PORTAL_NEWS_CATEGORIES: { key: NewsCategory; label: string; icon: string }[] = [
  { key: 'ALL', label: 'Terkini', icon: 'zap' },
  { key: 'GERAKAN_LAPANGAN', label: 'Gerakan Lapangan', icon: 'users' },
  { key: 'KAWAL_PEMILU', label: 'Kawal Pemilu', icon: 'shield' },
  { key: 'PARLEMEN', label: 'Parlemen & Kebijakan', icon: 'briefcase' },
  { key: 'KADER_BICARA', label: 'Kader Bicara', icon: 'message-circle' },
];

export const PORTAL_NEWS_LIST: PortalNewsItem[] = [
  {
    id: 'NEWS-001',
    title: 'Konsolidasi Akbar BSN PAN Jabar: 140.000 Saksi Digital Siap Amankan Formulir C1 Plano',
    slug: 'konsolidasi-akbar-bsn-pan-jabar-saksi-digital',
    category: 'KAWAL_PEMILU',
    categoryLabel: 'Kawal Pemilu',
    categoryColor: '#0066B3',
    imageUrl: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=1200&q=80',
    localFallbackImage: IMAGES.tpsHero,
    imageCaption: 'Ribuan koordinator saksi dan relawan BSN PAN memenuhi apel siaga kesiapan digital di GOR Pajajaran, Bandung.',
    publishedAt: '18 September 2026 • 10:15 WIB',
    timeAgo: '4 jam lalu',
    readTime: '3 mnt baca',
    author: {
      name: 'Rian Hidayat',
      role: 'Liputan Khusus BSN Jawa Barat',
      avatarIndex: 0,
    },
    summary: 'Badan Saksi Nasional PAN Jawa Barat menggelar apel siaga akbar memastikan 140.000 saksi telah terverifikasi dan siap mengoperasikan sistem AI C1 plano di setiap bilik suara.',
    contentParagraphs: [
      'BANDUNG — Sebanyak ribuan perwakilan koordinator saksi dari 27 kabupaten/kota se-Jawa Barat memadati apel siaga pengawalan suara yang diinisiasi Badan Saksi Nasional (BSN) PAN di Bandung. Kegiatan ini menandai fase kesiapan tertinggi dalam pengamanan suara rakyat di tingkat TPS.',
      'Kepala BSN PAN Wilayah Jawa Barat menegaskan bahwa kehadiran teknologi sistem simPAN 360 memungkinkan seluruh saksi mencatat tally perolehan dan memindai lembaran C1 plano secara langsung sesaat setelah penghitungan suara selesai.',
      'Dalam simulasi langsung di hadapan peserta, pemindaian formulir C1 beresolusi tinggi berhasil diverifikasi oleh algoritma AI OCR dalam hitungan 4 detik dengan akurasi 99,4%. Data langsung terenkripsi dan terkirim ke Tabulasi Nasional tanpa celah intervensi.',
      'Para peserta dibekali pemahaman hukum kepemiluan, tata cara pengajuan formulir keberatan resmi saksi jika terjadi perselisihan, serta protokol koordinasi berjenjang bersama Panwaslu dan KPPS setempat.'
    ],
    pullQuote: {
      quote: 'Kedaulatan suara rakyat adalah amanah suci. Saksi PAN hadir bukan hanya untuk partai, melainkan memastikan tidak ada satu suara pun milik warga yang terabaikan.',
      author: 'Pimpinan BSN PAN Jawa Barat',
    },
    tags: ['#KawalSuaraC1', '#BSNPAN', '#SaksiDigital', '#PemiluJujur'],
    viewsCount: 3840,
    likesCount: 512,
    isFeatured: true,
  },
  {
    id: 'NEWS-002',
    title: 'Aksi Nyata DPD PAN: Gelar Pasar Murah dan Pemeriksaan Kesehatan Gratis Lansia di Coblong',
    slug: 'aksi-nyata-dpd-pan-pasar-murah-kesehatan-coblong',
    category: 'GERAKAN_LAPANGAN',
    categoryLabel: 'Gerakan Lapangan',
    categoryColor: '#10B981',
    imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1200&q=80',
    localFallbackImage: IMAGES.tpsSchool,
    imageCaption: 'Antusiasme warga saat menerima layanan cek tensi dan sembako murah dari posko relawan PAN di Dago.',
    publishedAt: '17 September 2026 • 15:40 WIB',
    timeAgo: 'Kemarin',
    readTime: '2 mnt baca',
    author: {
      name: 'Siti Nurhaliza',
      role: 'Koresponden Komunitas Bandung',
      avatarIndex: 1,
    },
    summary: 'Ratusan paket minyak goreng murah dan layanan cek tensi darah gratis disalurkan ke warga lansia Dago sebagai wujud komitmen politik kepedulian yang konkret.',
    contentParagraphs: [
      'KOTA BANDUNG — Posko Relawan PAN Dago Juara bekerja sama dengan DPD PAN Kota Bandung menggelar bakti sosial sapa warga bertajuk "Aksi Nyata Matahari Biru" di kawasan Dago, Kecamatan Coblong.',
      'Kegiatan yang berlangsung sejak pagi hari ini memfasilitasi lebih dari 350 warga lansia untuk mendapatkan pemeriksaan tensi, cek gula darah berkala, serta konsultasi kesehatan ringan dengan tim medis relawan tanpa dipungut biaya.',
      'Selain posko kesehatan, panitia mendistribusikan 500 paket tebus murah minyak goreng dan kebutuhan pokok seharga Rp 10.000,- per paket guna meringankan beban pengeluaran rumah tangga warga di tengah fluktuasi harga bahan pangan.',
      'Warga setempat menyambut gembira kehadiran kader yang turun langsung berdialog dan menyerap masukan mengenai sarana penerangan jalan gang serta perbaikan posyandu lingkungan.'
    ],
    pullQuote: {
      quote: 'Politik bagi kami adalah jalan pengabdian langsung. Kehadiran kader di tengah warga saat susah maupun senang adalah esensi partai yang sebenarnya.',
      author: 'Ketua DPD PAN Kota Bandung',
    },
    tags: ['#AksiNyataPAN', '#BaksosBandung', '#PANPeduli', '#SapaWarga'],
    viewsCount: 2420,
    likesCount: 389,
    isFeatured: false,
  },
  {
    id: 'NEWS-003',
    title: 'Fraksi PAN DPR RI Dorong Insentif Bunga Nol Persen & Kuota Pupuk Subsidi Petani Rakyat',
    slug: 'fraksi-pan-dpr-dorong-insentif-umkm-pupuk-petani',
    category: 'PARLEMEN',
    categoryLabel: 'Parlemen & Kebijakan',
    categoryColor: '#F59E0B',
    imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
    localFallbackImage: IMAGES.ballotPaper,
    imageCaption: 'Sidang komisi di Senayan memperjuangkan anggaran perlindungan daya beli dan stimulus ekonomi kerakyatan.',
    publishedAt: '16 September 2026 • 13:20 WIB',
    timeAgo: '2 hari lalu',
    readTime: '4 mnt baca',
    author: {
      name: 'Dimas Wicaksono',
      role: 'Biro Parlemen Senayan',
      avatarIndex: 2,
    },
    summary: 'Melalui rapat kerja Badan Anggaran, Fraksi PAN menegaskan alokasi APBN 2027 wajib berfokus pada ketahanan pangan daerah dan permodalan pelaku usaha mikro.',
    contentParagraphs: [
      'JAKARTA — Fraksi Partai Amanat Nasional di DPR RI kembali menegaskan posisinya sebagai pembela utama ekonomi kerakyatan dalam pembahasan rancangan anggaran pendapatan dan belanja negara bersama pemerintah di Kompleks Parlemen Senayan.',
      'Juru bicara fraksi menggarisbawahi urgensi pemberian insentif bunga pinjaman ultra-mikro hingga 0% bagi pedagang pasar tradisional serta penambahan alokasi pupuk bersubsidi langsung ke kelompok tani tanpa rantai distribusi yang berbelit.',
      'Fraksi PAN menilai bahwa fondasi ketahanan ekonomi nasional berakar pada daya beli masyarakat akar rumput. Kenaikan biaya produksi tani dan keterbatasan modal kerja pedagang kecil harus diselesaikan dengan kebijakan fiskal yang berpihak nyata.',
      'Rekomendasi strategis tersebut disambut positif oleh berbagai asosiasi UMKM daerah dan ditargetkan masuk dalam poin kesepakatan akhir rapat kerja komisi.'
    ],
    pullQuote: {
      quote: 'Suara rakyat di pasar dan di sawah adalah kompas Fraksi PAN di parlemen. Anggaran negara harus kembali dirasakan manfaatnya secara konkret oleh mereka.',
      author: 'Pimpinan Fraksi PAN DPR RI',
    },
    tags: ['#FraksiPANDPR', '#EkonomiKerakyatan', '#BelaUMKM', '#KedaulatanPangan'],
    viewsCount: 1980,
    likesCount: 275,
    isFeatured: false,
  },
  {
    id: 'NEWS-004',
    title: 'Tajuk Opini: Mengapa Integritas Saksi TPS Menentukan Kualitas Demokrasi Masa Depan?',
    slug: 'tajuk-opini-integritas-saksi-tps-kualitas-demokrasi',
    category: 'KADER_BICARA',
    categoryLabel: 'Kader Bicara',
    categoryColor: '#8B5CF6',
    imageUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80',
    localFallbackImage: IMAGES.idCard,
    imageCaption: 'Refleksi kader mengenai peran strategis benteng pertahanan demokrasi di tingkat akar rumput.',
    publishedAt: '15 September 2026 • 09:00 WIB',
    timeAgo: '3 hari lalu',
    readTime: '5 mnt baca',
    author: {
      name: 'Fajar Pratama Nugraha, S.T.',
      role: 'Kader Simpatisan & Pemerhati Kebijakan Publik',
      avatarIndex: 3,
    },
    summary: 'Bilik suara adalah titik temu antara harapan jutaan rakyat dan masa depan bangsa. Keberadaan saksi yang terlatih, jujur, dan berdaya digital adalah benteng moral demokrasi.',
    contentParagraphs: [
      'Ketika bilik suara ditutup pada pukul 13.00 waktu setempat, proses demokrasi sesungguhnya baru saja dimulai. Di atas meja penghitungan KPPS, di bawah tatapan warga dan pengawas, setiap garis tally yang ditorehkan adalah cermin kehendak rakyat.',
      'Sering kali publik memandang saksi hanya sebagai pelengkap administratif seremoni pemilu. Padahal, tanpa saksi yang memiliki ketajaman melihat lembar plano, ketenangan menghadapi dinamika lapangan, dan kepatuhan pada regulasi, legitimasi pemilu rentan tercederai.',
      'Transformasi simPAN 360 membawa kabar gembira bagi pejuang demokrasi di bilik suara. Verifikasi digital bukan sekadar mempercepat pelaporan, melainkan memberikan rasa aman bagi para saksi bahwa hasil kerja keras mereka terkawal secara transparan hingga penetapan nasional.',
      'Menjadi saksi TPS bukan sekadar tugas politik praktis, melainkan panggilan kehormatan bagi generasi muda untuk menjaga kejujuran bangsanya sendiri.'
    ],
    pullQuote: {
      quote: 'Keberanian menegakkan kejujuran di bilik suara terkecil adalah batu bata penyusun tegaknya keadilan di sebuah negara besar.',
      author: 'Fajar Pratama Nugraha, S.T.',
    },
    tags: ['#OpiniKader', '#KaderBicara', '#DemokrasiBersih', '#IntegritasSaksi'],
    viewsCount: 3120,
    likesCount: 640,
    isFeatured: false,
  },
  {
    id: 'NEWS-005',
    title: 'Jelang Penetapan DPT: DPC PAN Coblong Gelar Bimtek Simulasi Hitung C1 bagi 180 Calon Saksi',
    slug: 'dpc-pan-coblong-bimtek-simulasi-hitung-c1',
    category: 'KAWAL_PEMILU',
    categoryLabel: 'Kawal Pemilu',
    categoryColor: '#0066B3',
    imageUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80',
    localFallbackImage: IMAGES.c1Form,
    imageCaption: 'Calon saksi TPS mempraktikkan pengisian formulir keberatan dan pemindaian QR code sistem di sekretariat DPC.',
    publishedAt: '14 September 2026 • 16:15 WIB',
    timeAgo: '4 hari lalu',
    readTime: '3 mnt baca',
    author: {
      name: 'Cecep Kusnadi',
      role: 'Ketua Ranting Dago / Koordinator Wilayah',
      avatarIndex: 4,
    },
    summary: 'Pelatihan teknis intensif digelar di Coblong guna memastikan setiap saksi TPS memahami 11 item potensi sengketa perolehan suara di TPS.',
    contentParagraphs: [
      'KOTA BANDUNG — Sebanyak 180 calon saksi TPS yang meliputi 6 kelurahan di Kecamatan Coblong mengikuti bimbingan teknis intensif pembedahan alur sidang KPPS di Sekretariat DPC PAN Coblong, Jl. Ir. H. Juanda.',
      'Materi bimtek berfokus pada penguasaan regulasi pemungutan dan penghitungan suara, simulasi pengenalan surat suara sah vs tidak sah, serta prosedur verifikasi daftar pemilih tambahan (DPTb) dan pemilih khusus (DPK).',
      'Setiap peserta diwajibkan melakukan uji coba pemindaian mandiri lembar C1 mockup menggunakan fitur kamera AI pada aplikasi mobile simPAN untuk membiasakan kecepatan dan ketepatan pelaporan di hari-H.',
      'Sesi ditutup dengan pembagian buku saku panduan saksi dan penandatanganan pakta integritas pengawalan suara secara profesional, tertib, dan berlandaskan kejujuran.'
    ],
    tags: ['#BimtekSaksi', '#CoblongBandung', '#BSNKotaBandung', '#SiapKawalTPS'],
    viewsCount: 1650,
    likesCount: 210,
    isFeatured: false,
  },
];

export function getNewsById(id: string): PortalNewsItem | undefined {
  return PORTAL_NEWS_LIST.find((item) => item.id === id);
}

export function getNewsBySlug(slug: string): PortalNewsItem | undefined {
  return PORTAL_NEWS_LIST.find((item) => item.slug === slug);
}

