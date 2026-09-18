export interface FinancialReportItem {
  id: string;
  category: 'PENERIMAAN' | 'PENGELUARAN';
  subCategory: string;
  title: string;
  amount: number;
  percentage: number;
  description: string;
  isMandatoryPublicAid?: boolean;
}

export interface FinancialAnnualReport {
  fiscalYear: number;
  totalIncome: number;
  totalExpense: number;
  endingBalance: number;
  auditOpinion: 'WTP' | 'WDP' | 'TMP';
  auditOpinionLabel: string;
  auditorFirm: string;
  auditDate: string;
  auditNumber: string;
  breakdown: FinancialReportItem[];
}

export interface PublicAidItem {
  id: string;
  title: string;
  allocationCategory: 'PENDIDIKAN_POLITIK' | 'OPERASIONAL_SEKRETARIAT';
  amount: number;
  percentageOfAid: number;
  targetParticipants?: number;
  realizedParticipants?: number;
  executionDate: string;
  location: string;
  status: 'TEREALISASI' | 'BERJALAN' | 'TERVERIFIKASI_BPK';
  evidenceDocumentName: string;
}

export interface PublicAidReport {
  fiscalYear: number;
  source: string;
  legalBasis: string;
  totalReceived: number;
  totalRealized: number;
  absorptionRate: number; // percentage
  politicalEducationPercentage: number; // minimum 60% by law
  operationalPercentage: number; // maximum 40% by law
  bpkAuditStatus: 'SESUAI_KRITERIA' | 'DALAM_REVIEW' | 'REKOMENDASI_TINDAK_LANJUT';
  bpkAuditNumber: string;
  bpkAuditDate: string;
  activities: PublicAidItem[];
}

export interface StrategicProgramItem {
  id: string;
  title: string;
  field: 'Kaderisasi & Pelatihan' | 'Advokasi Kebijakan' | 'Pemberdayaan Masyarakat' | 'Teknologi & Transformasi';
  pic: string;
  budgetAllocated: number;
  budgetRealized: number;
  progressPercentage: number;
  targetOutput: string;
  realizedOutput: string;
  status: 'SELESAI' | 'BERLANGSUNG' | 'TERENCANA';
  startDate: string;
  endDate: string;
}

export interface PolicyDocumentItem {
  id: string;
  title: string;
  codeNumber: string;
  category: 'AD_ART' | 'PERATURAN_ORGANISASI' | 'PAKTA_INTEGRITAS' | 'KEBIJAKAN_PUBLIK' | 'PEDOMAN_AKUNTANSI';
  categoryLabel: string;
  year: number;
  effectiveDate: string;
  signedBy: string;
  fileSize: string;
  summary: string;
  keyArticles: Array<{ articleNumber: string; title: string; content: string }>;
}

// ---------------------------------------------------------------------------
// 1. DATA LAPORAN KEUANGAN TAHUNAN (TERAUDIT KAP INDEPENDEN)
// ---------------------------------------------------------------------------
export const FINANCIAL_REPORT_2024: FinancialAnnualReport = {
  fiscalYear: 2024,
  totalIncome: 14850000000, // Rp 14.85 Miliar
  totalExpense: 13920000000, // Rp 13.92 Miliar
  endingBalance: 930000000, // Rp 930 Juta
  auditOpinion: 'WTP',
  auditOpinionLabel: 'Wajar Tanpa Pengecualian (WTP)',
  auditorFirm: 'Kantor Akuntan Publik (KAP) Aryanto, Amir Jusuf, Mawar & Saptoto',
  auditDate: '28 Mei 2025',
  auditNumber: '00142/2.1090/AU.1/07/0411-1/1/V/2025',
  breakdown: [
    // Penerimaan
    {
      id: 'INC-01',
      category: 'PENERIMAAN',
      subCategory: 'Iuran Wajib & Sukarela Anggota',
      title: 'Iuran Fraksi DPR RI & Kader Legislatif',
      amount: 6850000000,
      percentage: 46.1,
      description: 'Iuran bulanan anggota legislatif Fraksi PAN DPR RI dan DPRD Provinsi/Kabupaten/Kota.',
    },
    {
      id: 'INC-02',
      category: 'PENERIMAAN',
      subCategory: 'Bantuan Keuangan Partai Politik',
      title: 'Bantuan Keuangan Negara (APBN & APBD)',
      amount: 4500000000,
      percentage: 30.3,
      description: 'Penyaluran bantuan keuangan berdasarkan perolehan suara sah pemilu sesuai PP No. 1 Tahun 2018.',
      isMandatoryPublicAid: true,
    },
    {
      id: 'INC-03',
      category: 'PENERIMAAN',
      subCategory: 'Sumbangan Sah Non-Pemerintah',
      title: 'Sumbangan Pihak Ketiga & Simpatisan',
      amount: 3500000000,
      percentage: 23.6,
      description: 'Sumbangan badan usaha dan perorangan non-anggota yang sah dan tidak mengikat sesuai batas undang-undang.',
    },
    // Pengeluaran
    {
      id: 'EXP-01',
      category: 'PENGELUARAN',
      subCategory: 'Operasional & BSN Saksi TPS',
      title: 'Operasional Badan Saksi Nasional (BSN PAN)',
      amount: 5200000000,
      percentage: 37.4,
      description: 'Honorarium saksi TPS, suplemen transport, perlengkapan mandat, dan verifikasi C1 plano digital.',
    },
    {
      id: 'EXP-02',
      category: 'PENGELUARAN',
      subCategory: 'Pendidikan Politik & Kaderisasi',
      title: 'Bimtek Saksi, Diklat Kader & Sekolah Kebangsaan',
      amount: 4120000000,
      percentage: 29.6,
      description: 'Pelatihan saksi TPS berjenjang, workshop perempuan politik, dan pendidikan pemilih muda milenial.',
    },
    {
      id: 'EXP-03',
      category: 'PENGELUARAN',
      subCategory: 'Kesekretariatan & Administrasi',
      title: 'Sewa Kantor, Utilitas & Administrasi simPAN',
      amount: 2750000000,
      percentage: 19.8,
      description: 'Operasional kantor DPP, 38 DPW, utilitas kantor, pemeliharaan server cloud simPAN, dan staf sekretariat.',
    },
    {
      id: 'EXP-04',
      category: 'PENGELUARAN',
      subCategory: 'Advokasi Kebijakan & Pengabdian Warga',
      title: 'Bantuan Sosial Tanggap Bencana & Rumah Aspirasi',
      amount: 1850000000,
      percentage: 13.2,
      description: 'Penyaluran bantuan kemanusiaan darurat baksos, bantuan UMKM daerah, dan advokasi hukum kader.',
    },
  ],
};

// ---------------------------------------------------------------------------
// 2. DATA PENGGUNAAN BANTUAN PUBLIK (BANPAR APBN/APBD)
// ---------------------------------------------------------------------------
export const PUBLIC_AID_REPORT_2024: PublicAidReport = {
  fiscalYear: 2024,
  source: 'APBN Kementerian Dalam Negeri & APBD Provinsi Jawa Barat',
  legalBasis: 'Permendagri No. 78 Tahun 2020 jo. PP No. 1 Tahun 2018 tentang Bantuan Keuangan Partai Politik',
  totalReceived: 4500000000, // Rp 4.5 Miliar
  totalRealized: 4428000000, // Rp 4.428 Miliar
  absorptionRate: 98.4,
  politicalEducationPercentage: 62.5, // Wajib minimal 60%
  operationalPercentage: 37.5, // Wajib maksimal 40%
  bpkAuditStatus: 'SESUAI_KRITERIA',
  bpkAuditNumber: 'BPK-RI/LHP-BANPAR/VI/2025/089',
  bpkAuditDate: '12 Juni 2025',
  activities: [
    {
      id: 'BAN-01',
      title: 'Bimtek Integritas Saksi & Pengawasan Suara BSN PAN',
      allocationCategory: 'PENDIDIKAN_POLITIK',
      amount: 1450000000,
      percentageOfAid: 32.7,
      targetParticipants: 12500,
      realizedParticipants: 12640,
      executionDate: '15 - 22 Juli 2024',
      location: 'Bandung, Bekasi, Bogor, Cirebon & Hybrid simPAN',
      status: 'TERVERIFIKASI_BPK',
      evidenceDocumentName: 'SPJ-BSN-DIKLAT-2024.pdf',
    },
    {
      id: 'BAN-02',
      title: 'Sekolah Politik Kebangsaan & Literasi Pemilih Pemula',
      allocationCategory: 'PENDIDIKAN_POLITIK',
      amount: 820000000,
      percentageOfAid: 18.5,
      targetParticipants: 6000,
      realizedParticipants: 6210,
      executionDate: '10 - 18 Agustus 2024',
      location: 'Universitas & Pusat Komunitas Jawa Barat',
      status: 'TERVERIFIKASI_BPK',
      evidenceDocumentName: 'SPJ-SEKOLAH-POLITIK-2024.pdf',
    },
    {
      id: 'BAN-03',
      title: 'Pelatihan Kepemimpinan Perempuan Politik Matahari',
      allocationCategory: 'PENDIDIKAN_POLITIK',
      amount: 500000000,
      percentageOfAid: 11.3,
      targetParticipants: 2500,
      realizedParticipants: 2530,
      executionDate: '02 - 04 Oktober 2024',
      location: 'Hotel Grand Preanger Bandung',
      status: 'TERVERIFIKASI_BPK',
      evidenceDocumentName: 'SPJ-PUAN-JABAR-2024.pdf',
    },
    {
      id: 'BAN-04',
      title: 'Sewa Kantor & Pemeliharaan Sekretariat DPD/DPC',
      allocationCategory: 'OPERASIONAL_SEKRETARIAT',
      amount: 980000000,
      percentageOfAid: 22.1,
      executionDate: 'Januari - Desember 2024',
      location: 'Sekretariat DPW Jabar & DPD se-Jawa Barat',
      status: 'TERVERIFIKASI_BPK',
      evidenceDocumentName: 'SPJ-SEWA-KANTOR-DPD.pdf',
    },
    {
      id: 'BAN-05',
      title: 'Langganan Daya Listrik, Internet Fiber & Cloud simPAN',
      allocationCategory: 'OPERASIONAL_SEKRETARIAT',
      amount: 678000000,
      percentageOfAid: 15.4,
      executionDate: 'Januari - Desember 2024',
      location: 'Infrastruktur Data Center simPAN',
      status: 'TERVERIFIKASI_BPK',
      evidenceDocumentName: 'SPJ-UTILITAS-CLOUD-2024.pdf',
    },
  ],
};

// ---------------------------------------------------------------------------
// 3. DATA PROGRAM & KEGIATAN STRATEGIS PARTAI
// ---------------------------------------------------------------------------
export const STRATEGIC_PROGRAMS: StrategicProgramItem[] = [
  {
    id: 'PROG-01',
    title: 'Penguatan 820.000 Saksi Digital BSN PAN Berbasis GPS & Vision AI',
    field: 'Teknologi & Transformasi',
    pic: 'Kepala Badan Saksi Nasional (BSN) PAN',
    budgetAllocated: 5200000000,
    budgetRealized: 5080000000,
    progressPercentage: 97.6,
    targetOutput: 'Terlatihnya saksi TPS di 38 provinsi dengan verifikasi e-KTP & Plano C1',
    realizedOutput: '802.410 saksi terverifikasi dan terekam di sistem simPAN',
    status: 'SELESAI',
    startDate: 'Januari 2024',
    endDate: 'Oktober 2024',
  },
  {
    id: 'PROG-02',
    title: 'Inkubasi & Pendampingan 10.000 Pelaku UMKM Binaan Matahari Biru',
    field: 'Pemberdayaan Masyarakat',
    pic: 'Bidang Koperasi & UMKM DPP PAN',
    budgetAllocated: 1800000000,
    budgetRealized: 1650000000,
    progressPercentage: 91.6,
    targetOutput: 'Fasilitasi sertifikasi halal & permodalan usaha ultra mikro di 27 Kab/Kota',
    realizedOutput: '9.240 pelaku usaha mendapatkan mentoring dan bantuan sarana',
    status: 'SELESAI',
    startDate: 'Maret 2024',
    endDate: 'Desember 2024',
  },
  {
    id: 'PROG-03',
    title: 'Sekolah Kepemimpinan Muda & Kaderisasi Utama Lintas Kampus',
    field: 'Kaderisasi & Pelatihan',
    pic: 'Barisan Muda Penegak Amanat Nasional (BM PAN)',
    budgetAllocated: 1200000000,
    budgetRealized: 1100000000,
    progressPercentage: 88.0,
    targetOutput: 'Mencetak 5.000 kader penggerak digital anti-hoaks dan melek kebijakan publik',
    realizedOutput: '4.420 alumni diklat aktif di platform simPAN Academy',
    status: 'SELESAI',
    startDate: 'Mei 2024',
    endDate: 'November 2024',
  },
  {
    id: 'PROG-04',
    title: 'Posko Bantuan Hukum & Advokasi Kebijakan Publik Gratis',
    field: 'Advokasi Kebijakan',
    pic: 'Divisi Hukum & HAM DPW PAN Jawa Barat',
    budgetAllocated: 950000000,
    budgetRealized: 680000000,
    progressPercentage: 71.5,
    targetOutput: 'Layanan konsultasi sengketa warga, perburuhan, dan perlindungan saksi',
    realizedOutput: '312 perkara masyarakat terselesaikan melalui mediasi dan advokasi',
    status: 'BERLANGSUNG',
    startDate: 'Juli 2024',
    endDate: 'Juli 2025',
  },
  {
    id: 'PROG-05',
    title: 'Digitalisasi Satu Pintu Administrasi Keanggotaan (simPAN 2.0)',
    field: 'Teknologi & Transformasi',
    pic: 'Tim Pengembang Teknologi Informasi DPP PAN',
    budgetAllocated: 1400000000,
    budgetRealized: 980000000,
    progressPercentage: 70.0,
    targetOutput: 'Penerbitan 5 juta e-KTA digital ber-chip & sistem transparansi publik',
    realizedOutput: '3.520.000 e-KTA aktif terbit dengan sistem presensi GPS terintegrasi',
    status: 'BERLANGSUNG',
    startDate: 'Agustus 2024',
    endDate: 'Desember 2025',
  },
];

// ---------------------------------------------------------------------------
// 4. DATA KEBIJAKAN & DOKUMEN RESMI PARTAI
// ---------------------------------------------------------------------------
export const POLICY_DOCUMENTS: PolicyDocumentItem[] = [
  {
    id: 'DOC-01',
    title: 'Anggaran Dasar & Anggaran Rumah Tangga (AD/ART) PAN',
    codeNumber: 'KEP-KONGRES-V/PAN/2020',
    category: 'AD_ART',
    categoryLabel: 'AD / ART Partai',
    year: 2020,
    effectiveDate: '12 Februari 2020',
    signedBy: 'Dr. (H.C.) Zulkifli Hasan, S.E., M.M. & Eddy Soeparno, S.H., M.H.',
    fileSize: '3.8 MB',
    summary:
      'Landasan konstitusional dan tata kelola organisasi Partai Amanat Nasional yang memuat asas moral agama, kemanusiaan, kemajemukan, dan kedaulatan rakyat.',
    keyArticles: [
      {
        articleNumber: 'Pasal 3 AD',
        title: 'Asas & Sifat Partai',
        content:
          'Partai Amanat Nasional berasaskan Akhlak Politik Berlandaskan Agama yang Membawa Rahmat bagi Sekaligus Terbuka bagi Seluruh Warga Negara Indonesia.',
      },
      {
        articleNumber: 'Pasal 8 ART',
        title: 'Hak & Kewajiban Anggota',
        content:
          'Setiap anggota berhak memperoleh informasi mengenai kebijakan partai, pembelaan organisasi, dan wajib menjunjung tinggi etika integritas moral.',
      },
      {
        articleNumber: 'Pasal 42 ART',
        title: 'Pengelolaan Keuangan Partai',
        content:
          'Keuangan partai dikelola secara transparan, tertib, dan diaudit secara berkala oleh kantor akuntan publik independen serta dilaporkan ke KPU/BPK.',
      },
    ],
  },
  {
    id: 'DOC-02',
    title: 'Peraturan Organisasi (PO) Tata Kelola & Pengawasan Badan Saksi Nasional (BSN)',
    codeNumber: 'PO-DPP-PAN/BSN/004/2023',
    category: 'PERATURAN_ORGANISASI',
    categoryLabel: 'Peraturan Organisasi',
    year: 2023,
    effectiveDate: '15 September 2023',
    signedBy: 'Kepala BSN PAN & Sekretaris Jenderal',
    fileSize: '1.9 MB',
    summary:
      'Pedoman teknis penugasan saksi TPS, integritas pelaporan plano C1, pemanfaatan presensi GPS simPAN, dan mekanisme honorarium non-tunai.',
    keyArticles: [
      {
        articleNumber: 'Pasal 5 PO',
        title: 'Netralitas & Disiplin Saksi TPS',
        content:
          'Saksi TPS dilarang memanipulasi angka perolehan suara dalam bentuk apa pun dan wajib mengunggah bukti otentik C1 plano secara langsung di lokasi TPS.',
      },
      {
        articleNumber: 'Pasal 11 PO',
        title: 'Presensi Kehadiran Geotagging',
        content:
          'Setiap saksi wajib melakukan check-in radius GPS maksimum 100 meter dari koordinat TPS penugasan sebagai syarat validasi surat tugas dan honorarium.',
      },
    ],
  },
  {
    id: 'DOC-03',
    title: 'Pakta Integritas Anti-Korupsi & Kode Etik Kader Parlemen',
    codeNumber: 'MAK-DPP-PAN/INTEGRITAS/01/2024',
    category: 'PAKTA_INTEGRITAS',
    categoryLabel: 'Pakta Integritas',
    year: 2024,
    effectiveDate: '05 Januari 2024',
    signedBy: 'Dewan Kehormatan Partai & Seluruh Caleg Terpilih',
    fileSize: '850 KB',
    summary:
      'Komitmen tertulis tanpa toleransi (zero tolerance) terhadap suap, gratifikasi, dan penyalahgunaan wewenang publik bagi seluruh fungsionaris dan legislator PAN.',
    keyArticles: [
      {
        articleNumber: 'Poin 2 Pakta',
        title: 'Kewajiban Pelaporan LHKPN',
        content:
          'Seluruh kader yang menjabat jabatan publik wajib melaporkan Laporan Harta Kekayaan Penyelenggara Negara (LHKPN) ke KPK secara tepat waktu.',
      },
      {
        articleNumber: 'Poin 5 Pakta',
        title: 'Sanksi Pemberhentian Seketika',
        content:
          'Kader yang terbukti melakukan tindak pidana korupsi berkekuatan hukum tetap akan langsung diberhentikan seketika dan diusulkan PAW.',
      },
    ],
  },
  {
    id: 'DOC-04',
    title: 'Pedoman Standar Akuntansi Keuangan Partai Politik (PSAK 45 / ISAK 35)',
    codeNumber: 'JUKNIS-BENDAHARA-DPP/2023/11',
    category: 'PEDOMAN_AKUNTANSI',
    categoryLabel: 'Pedoman Akuntansi',
    year: 2023,
    effectiveDate: '01 Desember 2023',
    signedBy: 'Bendahara Umum DPP PAN',
    fileSize: '2.4 MB',
    summary:
      'Prosedur pencatatan iuran, pembukuan kas masuk/keluar, penerbitan tanda terima resmi sumbangan, dan pelaporan bantuan keuangan partai politik (Banpar).',
    keyArticles: [
      {
        articleNumber: 'Bab III Juknis',
        title: 'Pemisahan Rekening Khusus Banpar',
        content:
          'Dana bantuan keuangan dari APBN/APBD wajib ditempatkan pada rekening giro terpisah dari dana umum partai dan dilarang digunakan di luar pos yang diatur undang-undang.',
      },
    ],
  },
  {
    id: 'DOC-05',
    title: 'Maklumat Layanan Keterbukaan Informasi Publik (UU KIP No. 14 Tahun 2008)',
    codeNumber: 'MAKLUMAT-PPID-PAN/03/2024',
    category: 'KEBIJAKAN_PUBLIK',
    categoryLabel: 'Kebijakan Publik',
    year: 2024,
    effectiveDate: '20 Maret 2024',
    signedBy: 'Pejabat Pengelola Informasi & Dokumentasi (PPID) PAN',
    fileSize: '620 KB',
    summary:
      'Komitmen pemberian akses informasi publik yang akurat, cepat, dan transparan mengenai program partai, anggaran bantuan, dan kepengurusan berjenjang.',
    keyArticles: [
      {
        articleNumber: 'Prinsip PPID',
        title: 'Akses Informasi Satu Pintu Digital',
        content:
          'Setiap kader dan warga berhak mengajukan permohonan informasi publik secara daring melalui aplikasi simPAN dengan standar respon maksimal 3 hari kerja.',
      },
    ],
  },
];
