export interface KtaCardData {
  noKta: string;
  nama: string;
  nik: string;
  tempatTglLahir: string;
  jenisKelamin: string;
  alamat: string;
  dpw: string;
  dpd: string;
  dpc: string;
  dprt: string;
  tglBergabung: string;
  masaBerlaku: string;
  status: 'AKTIF_TERVERIFIKASI' | 'PROSES_VERIFIKASI' | 'NONAKTIF';
  tandaTanganKetum: string;
  tandaTanganSekjen: string;
}

export const CURRENT_KADER_KTA: KtaCardData = {
  noKta: '32.73.01.2024.08912',
  nama: 'Fajar Pratama Nugraha, S.T.',
  nik: '3273011508920005',
  tempatTglLahir: 'Bandung, 15 Agustus 1992',
  jenisKelamin: 'Laki-Laki',
  alamat: 'Jl. Cisitu Indah No. 28, RT 04/RW 08, Kel. Dago, Kec. Coblong',
  dpw: 'DPW PAN Jawa Barat',
  dpd: 'DPD PAN Kota Bandung',
  dpc: 'DPC PAN Coblong',
  dprt: 'DPRt PAN Dago',
  tglBergabung: '15 Januari 2022',
  masaBerlaku: 'Seumur Hidup',
  status: 'AKTIF_TERVERIFIKASI',
  tandaTanganKetum: 'Zulkifli Hasan',
  tandaTanganSekjen: 'Eddy Soeparno',
};

export interface PengurusOrg {
  id: string;
  nama: string;
  jabatan: string;
  periode: string;
  tingkat: 'DPP' | 'DPW' | 'DPD' | 'DPC' | 'DPRT';
  wilayah: string;
  avatarIndex: number;
  telepon?: string;
  email?: string;
}

export const STRUKTUR_PENGURUS: PengurusOrg[] = [
  // DPP Pusat
  {
    id: 'DPP-01',
    nama: 'Dr. (H.C.) Zulkifli Hasan, S.E., M.M.',
    jabatan: 'Ketua Umum DPP PAN',
    periode: '2020 – 2025',
    tingkat: 'DPP',
    wilayah: 'Tingkat Nasional (Pusat)',
    avatarIndex: 0,
    telepon: '(021) 797-4000',
    email: 'ketum@pan.or.id',
  },
  {
    id: 'DPP-02',
    nama: 'Eddy Soeparno, S.H., M.H.',
    jabatan: 'Sekretaris Jenderal DPP PAN',
    periode: '2020 – 2025',
    tingkat: 'DPP',
    wilayah: 'Tingkat Nasional (Pusat)',
    avatarIndex: 1,
    telepon: '(021) 797-4001',
    email: 'sekjen@pan.or.id',
  },
  {
    id: 'DPP-03',
    nama: 'Yandri Susanto, S.Pt., M.Pd.',
    jabatan: 'Wakil Ketua Umum / Kepala BSN PAN',
    periode: '2020 – 2025',
    tingkat: 'DPP',
    wilayah: 'Badan Saksi Nasional (BSN PAN)',
    avatarIndex: 2,
    telepon: '(021) 797-4002',
    email: 'bsn@pan.or.id',
  },

  // DPW Jawa Barat
  {
    id: 'DPW-01',
    nama: 'H. M. Hasbullah Rahmad, S.Pd., M.Hum.',
    jabatan: 'Ketua DPW PAN Jawa Barat',
    periode: '2020 – 2025',
    tingkat: 'DPW',
    wilayah: 'Provinsi Jawa Barat',
    avatarIndex: 3,
    telepon: '(022) 730-2211',
    email: 'dpw.jabar@pan.or.id',
  },
  {
    id: 'DPW-02',
    nama: 'Raden Tedi, S.T., M.Si.',
    jabatan: 'Sekretaris DPW PAN Jawa Barat',
    periode: '2020 – 2025',
    tingkat: 'DPW',
    wilayah: 'Provinsi Jawa Barat',
    avatarIndex: 4,
    telepon: '(022) 730-2212',
    email: 'sekretariat.jabar@pan.or.id',
  },

  // DPD Kota Bandung
  {
    id: 'DPD-01',
    nama: 'H. Rasyid Rajasa, B.Bus.',
    jabatan: 'Ketua DPD PAN Kota Bandung',
    periode: '2020 – 2025',
    tingkat: 'DPD',
    wilayah: 'Kota Bandung',
    avatarIndex: 5,
    telepon: '(022) 720-3344',
    email: 'dpd.bandung@pan.or.id',
  },
  {
    id: 'DPD-02',
    nama: 'Dudi Supriadi, S.H.',
    jabatan: 'Sekretaris DPD PAN Kota Bandung',
    periode: '2020 – 2025',
    tingkat: 'DPD',
    wilayah: 'Kota Bandung',
    avatarIndex: 6,
    telepon: '(022) 720-3345',
    email: 'dudi.dpdbdg@pan.or.id',
  },

  // DPC Kecamatan Coblong
  {
    id: 'DPC-01',
    nama: 'Ir. Hendra Gunawan',
    jabatan: 'Ketua DPC PAN Coblong',
    periode: '2021 – 2026',
    tingkat: 'DPC',
    wilayah: 'Kecamatan Coblong, Kota Bandung',
    avatarIndex: 7,
    telepon: '0812-9900-1122',
  },

  // DPRt Kelurahan Dago
  {
    id: 'DPRT-01',
    nama: 'Cecep Kusnadi',
    jabatan: 'Ketua DPRt PAN Dago',
    periode: '2022 – 2027',
    tingkat: 'DPRT',
    wilayah: 'Kelurahan Dago, Bandung',
    avatarIndex: 8,
    telepon: '0813-2211-4433',
  },
];

export interface KonterLayananItem {
  id: string;
  namaLayanan: string;
  loket: string;
  waktuOperasional: string;
  estimasiProses: string;
  deskripsi: string;
  status: 'BUKA' | 'SIAGA_PEMILU' | 'TUTUP';
}

export interface KantorSekretariat {
  id: string;
  tingkat: 'DPP' | 'DPW' | 'DPD' | 'DPC';
  namaKantor: string;
  alamat: string;
  kota: string;
  provinsi: string;
  kodePos: string;
  telepon: string;
  whatsapp: string;
  email: string;
  jamBuka: string;
  statusGedung: string;
  kepalaSekretariat: string;
  jabatanKepala: string;
  nipKepala?: string;
  avatarIndex?: number;
  kontakPetugasKonter: string;
  lat: number;
  lng: number;
  fasilitas: string[];
  konterLayanan: KonterLayananItem[];
}

export const KANTOR_SEKRETARIAT_LIST: KantorSekretariat[] = [
  {
    id: 'KANTOR-01',
    tingkat: 'DPP',
    namaKantor: 'Kantor DPP PAN (Pusat)',
    alamat: 'Jl. Warung Buncit Raya No. 17, Kalibata, Pancoran',
    kota: 'Jakarta Selatan',
    provinsi: 'DKI Jakarta',
    kodePos: '12740',
    telepon: '(021) 797-4000',
    whatsapp: '0811-1998-4000',
    email: 'sekretariat@pan.or.id',
    jamBuka: 'Senin - Jumat: 08.30 - 17.00 WIB (Siaga 24 Jam saat Pemilu)',
    statusGedung: 'Gedung Pusat DPP PAN Mandiri',
    kepalaSekretariat: 'Drs. H. Maman Suryaman, M.Si.',
    jabatanKepala: 'Kepala Sekretariat DPP PAN',
    nipKepala: 'PAN-DPP-SEKR-001',
    avatarIndex: 0,
    kontakPetugasKonter: '0812-1000-8801 (Sdr. Firman / Helpdesk Pusat)',
    lat: -6.2625,
    lng: 106.8312,
    fasilitas: [
      'Command Center & Tabulasi Nasional BSN PAN',
      'Ruang Rapat Pleno DPP (Kapasitas 250 Orang)',
      'Konter Pelayanan Terpadu Satu Pintu (PTSP) Kader',
      'Studio Media & Podcast Matahari Biru',
      'Ruang Vicon Interaktif 38 DPW Provinsi',
      'Aula Diklat Kaderisasi & Musholla Baitul Amanat',
    ],
    konterLayanan: [
      {
        id: 'LKT-01',
        namaLayanan: 'Penerbitan & Cetak e-KTA Fisik simPAN',
        loket: 'Loket 1 — Administrasi Kader',
        waktuOperasional: '09.00 - 16.30 WIB',
        estimasiProses: '10 Menit',
        deskripsi: 'Verifikasi identitas KTP dan pencetakan kartu anggota ber-chip/QR Code autentikasi DPP PAN.',
        status: 'BUKA',
      },
      {
        id: 'LKT-02',
        namaLayanan: 'Crisis Center & Tabulasi C1 BSN PAN',
        loket: 'Loket 2 — Komando BSN',
        waktuOperasional: '24 Jam Penuh (Masa Pemilu)',
        estimasiProses: 'Real-Time',
        deskripsi: 'Pusat pengaduan darurat saksi TPS, validasi C1 bermasalah, dan eskalasi sengketa suara nasional.',
        status: 'SIAGA_PEMILU',
      },
      {
        id: 'LKT-03',
        namaLayanan: 'Konseling Hukum & Advokasi Pemilu',
        loket: 'Loket 3 — Divisi Hukum & HAM',
        waktuOperasional: '09.00 - 17.00 WIB',
        estimasiProses: '30 Menit Konsultasi',
        deskripsi: 'Bantuan hukum sengketa hasil pemilu di Bawaslu & Mahkamah Konstitusi untuk kader & saksi PAN.',
        status: 'BUKA',
      },
      {
        id: 'LKT-04',
        namaLayanan: 'Verifikasi Berkas & Pencalegan DPR RI',
        loket: 'Loket 4 — Komite Pemenangan Pemilu (KPPN)',
        waktuOperasional: '09.00 - 17.00 WIB',
        estimasiProses: '1 Hari Kerja',
        deskripsi: 'Validasi kelengkapan 7 berkas syarat calon anggota legislatif DPR RI dari 84 daerah pemilihan.',
        status: 'BUKA',
      },
    ],
  },
  {
    id: 'KANTOR-02',
    tingkat: 'DPW',
    namaKantor: 'Kantor DPW PAN Jawa Barat',
    alamat: 'Jl. Pelajar Pejuang 45 No. 112, Turangga, Lengkong',
    kota: 'Kota Bandung',
    provinsi: 'Jawa Barat',
    kodePos: '40264',
    telepon: '(022) 730-2211',
    whatsapp: '0812-7300-2211',
    email: 'jabar@pan.or.id',
    jamBuka: 'Senin - Sabtu: 09.00 - 17.00 WIB',
    statusGedung: 'Gedung Sekretariat DPW Provinsi Jabar',
    kepalaSekretariat: 'Raden Tedi, S.T., M.Si.',
    jabatanKepala: 'Sekretaris DPW / Kepala Kantor Jabar',
    nipKepala: 'PAN-JBR-SEKR-002',
    avatarIndex: 2,
    kontakPetugasKonter: '0813-2200-4411 (Sdri. Nuraeni / Front Office Jabar)',
    lat: -6.9324,
    lng: 107.6258,
    fasilitas: [
      'Posko Komando Tabulasi Suara Wilayah Jawa Barat',
      'Ruang Rapat Koordinasi 27 DPD Kabupaten/Kota',
      'Konter Cetak e-KTA Jawa Barat',
      'Ruang Sidang Advokasi & Mediasi Partai',
      'Wisma Tamu Kader Daerah & Musholla',
    ],
    konterLayanan: [
      {
        id: 'LKT-05',
        namaLayanan: 'Layanan e-KTA & Mutasi Keanggotaan Jabar',
        loket: 'Loket 1 — Keanggotaan Wilayah',
        waktuOperasional: '09.00 - 16.00 WIB',
        estimasiProses: '15 Menit',
        deskripsi: 'Pendaftaran anggota baru domisili Jawa Barat dan proses perpindahan ranting/cabang.',
        status: 'BUKA',
      },
      {
        id: 'LKT-06',
        namaLayanan: 'Pusat Koordinasi BSN DPW Jawa Barat',
        loket: 'Loket 2 — Badan Saksi Wilayah',
        waktuOperasional: '08.30 - 20.00 WIB',
        estimasiProses: 'Langsung',
        deskripsi: 'Supervisi pengawalan 140.457 TPS se-Jawa Barat dan monitoring C1 tingkat provinsi.',
        status: 'SIAGA_PEMILU',
      },
      {
        id: 'LKT-07',
        namaLayanan: 'Legalisasi Dokumen & Rekomendasi DPRD',
        loket: 'Loket 3 — Desk Pilkada & Legislatif Jabar',
        waktuOperasional: '10.00 - 16.00 WIB',
        estimasiProses: '1 Hari Kerja',
        deskripsi: 'Penerbitan surat rekomendasi dan legalisir berkas syarat caleg DPRD Provinsi Jawa Barat.',
        status: 'BUKA',
      },
    ],
  },
  {
    id: 'KANTOR-03',
    tingkat: 'DPD',
    namaKantor: 'Kantor DPD PAN Kota Bandung',
    alamat: 'Jl. Terusan Jakarta No. 75, Antapani Tengah',
    kota: 'Kota Bandung',
    provinsi: 'Jawa Barat',
    kodePos: '40291',
    telepon: '(022) 720-3344',
    whatsapp: '0812-7200-3344',
    email: 'dpd.bandung@pan.or.id',
    jamBuka: 'Senin - Sabtu: 09.00 - 16.30 WIB',
    statusGedung: 'Sekretariat DPD Kota Bandung',
    kepalaSekretariat: 'Dudi Supriadi, S.H.',
    jabatanKepala: 'Sekretaris DPD / Penanggung Jawab Konter',
    nipKepala: 'PAN-BDG-SEKR-003',
    avatarIndex: 1,
    kontakPetugasKonter: '0811-2244-7788 (Sdr. Arianto / Staf Pelayanan Anggota)',
    lat: -6.9175,
    lng: 107.6582,
    fasilitas: [
      'Konter Pelayanan Mandiri simPAN (Cetak KTA Instan)',
      'Ruang Komando Saksi TPS 30 Kecamatan se-Kota Bandung',
      'Aula Pertemuan Kader & Rapat DPC Coblong dkk',
      'Pusat Logistik Atribut Saksi (Rompi, Topi, Id Card)',
      'Posko Pengaduan Pemilu & Bantuan Hukum Warga',
    ],
    konterLayanan: [
      {
        id: 'LKT-08',
        namaLayanan: 'Konter e-KTA & Verifikasi AI simPAN',
        loket: 'Loket 1 — Keanggotaan DPD Bandung',
        waktuOperasional: '09.00 - 16.00 WIB',
        estimasiProses: '5 Menit',
        deskripsi: 'Pencetakan fisik e-KTA, validasi data e-KTP AI, dan pembaharuan domisili anggota Kota Bandung.',
        status: 'BUKA',
      },
      {
        id: 'LKT-09',
        namaLayanan: 'Konter Pembekalan & Mandat Saksi BSN TPS',
        loket: 'Loket 2 — BSN Kota Bandung',
        waktuOperasional: '09.00 - 18.00 WIB',
        estimasiProses: '15 Menit',
        deskripsi: 'Pengambilan Surat Mandat resmi bermaterai, pembagian seragam saksi, dan panduan upload form C1.',
        status: 'SIAGA_PEMILU',
      },
      {
        id: 'LKT-10',
        namaLayanan: 'Posko Pengaduan Pemilu & Advokasi Suara',
        loket: 'Loket 3 — Advokasi & Hukum Lapangan',
        waktuOperasional: '09.00 - 17.00 WIB',
        estimasiProses: 'Langsung',
        deskripsi: 'Penerimaan laporan kecurangan TPS, intimidasi saksi, dan pendampingan plano di PPK.',
        status: 'BUKA',
      },
      {
        id: 'LKT-11',
        namaLayanan: 'Rumah PAN Aspirasi Warga Bandung',
        loket: 'Loket 4 — Pengabdian Masyarakat',
        waktuOperasional: '10.00 - 15.00 WIB',
        estimasiProses: 'Langsung',
        deskripsi: 'Penyaluran aspirasi warga Bandung kepada Fraksi PAN DPRD Kota Bandung.',
        status: 'BUKA',
      },
    ],
  },
  {
    id: 'KANTOR-04',
    tingkat: 'DPC',
    namaKantor: 'Sekretariat DPC PAN Coblong',
    alamat: 'Jl. Ir. H. Juanda No. 195, Dago',
    kota: 'Kota Bandung',
    provinsi: 'Jawa Barat',
    kodePos: '40135',
    telepon: '0812-9900-1122',
    whatsapp: '0812-9900-1122',
    email: 'dpc.coblong@pan.or.id',
    jamBuka: 'Senin - Jumat: 10.00 - 16.00 WIB (Hari H Buka Penuh)',
    statusGedung: 'Posko & Sekretariat Kecamatan Coblong',
    kepalaSekretariat: 'Ir. Hendra Gunawan',
    jabatanKepala: 'Ketua DPC / Koordinator Wilayah Coblong',
    nipKepala: 'PAN-CBL-SEKR-004',
    avatarIndex: 3,
    kontakPetugasKonter: '0813-9876-5432 (Sdr. Dani / Relawan Posko)',
    lat: -6.8856,
    lng: 107.6148,
    fasilitas: [
      'Posko Titik Kumpul Saksi TPS Kelurahan Dago & Sekitarnya',
      'Penyimpanan Logistik Konsumsi & Suplemen Saksi',
      'Akses Wi-Fi High-Speed untuk Upload C1 Saksi',
      'Ruang Koordinasi Korlap TPS Kluster',
    ],
    konterLayanan: [
      {
        id: 'LKT-12',
        namaLayanan: 'Konter Pendaftaran Kader Ranting & Saksi',
        loket: 'Loket 1 — Pendaftaran Warga Coblong',
        waktuOperasional: '10.00 - 16.00 WIB',
        estimasiProses: '10 Menit',
        deskripsi: 'Pendaftaran anggota baru dan perekrutan relawan saksi untuk wilayah Coblong.',
        status: 'BUKA',
      },
      {
        id: 'LKT-13',
        namaLayanan: 'Posko Logistik & Pendampingan Saksi TPS',
        loket: 'Loket 2 — Logistik & Darurat Saksi',
        waktuOperasional: '24 Jam (Masa Pemungutan Suara)',
        estimasiProses: 'Langsung',
        deskripsi: 'Distribusi logistik saksi, pulsa data darurat, dan koordinasi Korlap Lapangan.',
        status: 'SIAGA_PEMILU',
      },
    ],
  },
];

export interface BerkasBacalegItem {
  id: string;
  namaDokumen: string;
  status: 'TERVERIFIKASI' | 'MENUNGGU_REVIEW' | 'BELUM_UNGGAH';
  tglUpload?: string;
  catatan?: string;
}

export interface PendaftaranBacaleg {
  idRegistrasi: string;
  namaKader: string;
  noKta: string;
  tingkatPencalonan: 'DPR RI' | 'DPRD PROVINSI' | 'DPRD KAB/KOTA';
  dapil: string;
  nomorUrutRekomendasi: number;
  statusPendaftaran: 'BERKAS_LENGKAP' | 'TAHAP_VERIFIKASI' | 'PERBAIKAN_BERKAS';
  tglDaftar: string;
  berkas: BerkasBacalegItem[];
}

export const MOCK_BACALEG_DATA: PendaftaranBacaleg = {
  idRegistrasi: 'BACALEG-PAN-2024-0094',
  namaKader: 'Fajar Pratama Nugraha, S.T.',
  noKta: '32.73.01.2024.08912',
  tingkatPencalonan: 'DPR RI',
  dapil: 'Dapil Jawa Barat I (Kota Bandung & Kota Cimahi)',
  nomorUrutRekomendasi: 2,
  statusPendaftaran: 'BERKAS_LENGKAP',
  tglDaftar: '10 Februari 2024',
  berkas: [
    { id: 'B-01', namaDokumen: 'Kartu Tanda Anggota (e-KTA) PAN', status: 'TERVERIFIKASI', tglUpload: '10 Feb 2024' },
    { id: 'B-02', namaDokumen: 'KTP Elektronik Terdaftar', status: 'TERVERIFIKASI', tglUpload: '10 Feb 2024' },
    { id: 'B-03', namaDokumen: 'Ijazah Pendidikan Terakhir (Legalisir)', status: 'TERVERIFIKASI', tglUpload: '11 Feb 2024' },
    { id: 'B-04', namaDokumen: 'SKCK Mabes/Polda Jawa Barat', status: 'TERVERIFIKASI', tglUpload: '12 Feb 2024' },
    { id: 'B-05', namaDokumen: 'Surat Keterangan Bebas Narkoba (BNN)', status: 'TERVERIFIKASI', tglUpload: '12 Feb 2024' },
    { id: 'B-06', namaDokumen: 'Surat Keterangan Tidak Pernah Dipidana (PN)', status: 'TERVERIFIKASI', tglUpload: '13 Feb 2024' },
    { id: 'B-07', namaDokumen: 'Surat Kesehatan Jasmani & Rohani (RSUD)', status: 'TERVERIFIKASI', tglUpload: '13 Feb 2024' },
  ],
};

export interface WartaPartai {
  id: string;
  judul: string;
  kategori: 'INTRUKSI_KETUM' | 'KONSOLIDASI' | 'RILIS_PERS' | 'BSN_PAN';
  penulis: string;
  tanggal: string;
  ringkasan: string;
  isiLengkap: string;
  pinned?: boolean;
}

export const WARTA_DPP_LIST: WartaPartai[] = [
  {
    id: 'WARTA-01',
    judul: 'Instruksi Ketua Umum: Kawal Ketat C1 Plano & Integritas Tabulasi Suara Nasional',
    kategori: 'INTRUKSI_KETUM',
    penulis: 'Dr. (H.C.) Zulkifli Hasan, S.E., M.M.',
    tanggal: '10 September 2026',
    ringkasan: 'Seluruh struktur partai dan saksi TPS diinstruksikan menjaga suara rakyat dengan disiplin digital melalui aplikasi simPAN.',
    isiLengkap:
      'Kepada seluruh kader, pengurus DPP, DPW, DPD, DPC, DPRt, serta seluruh barisan saksi Badan Saksi Nasional (BSN) PAN di seluruh Indonesia: Kawal setiap lembar C1 Plano dengan teliti. Dokumentasikan setiap tahapan dan laporkan secara berjenjang lewat aplikasi simPAN.',
    pinned: true,
  },
  {
    id: 'WARTA-02',
    judul: 'BSN PAN Siagakan 820.000 Saksi Digital Terverifikasi di 38 Provinsi',
    kategori: 'BSN_PAN',
    penulis: 'Kepala Badan Saksi Nasional PAN',
    tanggal: '08 September 2026',
    ringkasan: 'Pemanfaatan sistem simPAN memungkinkan presensi akurat saksi berbasis GPS dan unggah hasil pemungutan suara secara instan.',
    isiLengkap:
      'Badan Saksi Nasional PAN menegaskan kesiapan penuh seluruh saksi di 38 provinsi. Dengan fitur presensi GPS dan C1 plano scanner pada platform simPAN, proses tabulasi suara menjadi lebih transparan, akurat, dan dapat dipertanggungjawabkan.',
    pinned: true,
  },
  {
    id: 'WARTA-03',
    judul: 'Digitalisasi Kader: Penerbitan e-KTA simPAN Tembus 3,5 Juta Anggota Aktif',
    kategori: 'KONSOLIDASI',
    penulis: 'Sekretariat Jenderal DPP PAN',
    tanggal: '05 September 2026',
    ringkasan: 'Modernisasi administrasi partai berjalan pesat dengan e-KTA digital yang memuat barcode autentikasi satu pintu.',
    isiLengkap:
      'Pencapaian 3,5 juta anggota terverifikasi membuktikan komitmen Partai Amanat Nasional sebagai partai modern yang adaptif terhadap transformasi digital. Setiap kader dapat mengakses kartu digital dan warta kepengurusan secara langsung.',
    pinned: false,
  },
  {
    id: 'WARTA-04',
    judul: 'Rilis Pers: PAN Dorong Kebijakan Pro-Rakyat & Pemberdayaan UMKM Daerah',
    kategori: 'RILIS_PERS',
    penulis: 'Humas & Media DPP PAN',
    tanggal: '01 September 2026',
    ringkasan: 'Fraksi PAN DPR RI dan seluruh kader legislatif berkomitmen memperkuat alokasi stimulus ekonomi untuk pedagang kecil.',
    isiLengkap:
      'Melalui perwakilan di parlemen tingkat pusat hingga daerah, Partai Amanat Nasional konsisten mengawal aspirasi pelaku usaha mikro, kecil, dan menengah demi terwujudnya kemandirian ekonomi rakyat yang berkeadilan.',
    pinned: false,
  },
];
