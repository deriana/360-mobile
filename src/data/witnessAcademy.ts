export interface AcademyLesson {
  lesson_id: string;
  title: string;
  type: 'video' | 'article' | 'quiz';
  duration: string;
  is_completed: boolean;
  videoUrl?: string;
  description: string;
  summaryPoints: string[];
}

export interface AcademyModule {
  module_id: string;
  module_title: string;
  difficulty: 'Dasar' | 'Inti' | 'Lanjutan';
  estimated_time: string;
  icon: string;
  lessons: AcademyLesson[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface WitnessCertificate {
  certificateNo: string;
  witnessName: string;
  nik: string;
  score: number;
  passedAt: string;
  assignedTps: string;
  qrToken: string;
}

export const BSN_PAN_ACADEMY_DATA: {
  academy_title: string;
  sub_title: string;
  description: string;
  syllabus_modules: AcademyModule[];
  quiz_questions: QuizQuestion[];
} = {
  academy_title: 'BSN PAN Witness Academy',
  sub_title: 'Badan Saksi Nasional Partai Amanat Nasional',
  description:
    'Program pelatihan e-learning dan sertifikasi resmi saksi TPS untuk mengawal kemurnian suara rakyat, mencegah kecurangan, dan memastikan kemenangan PAN di bilik suara.',
  syllabus_modules: [
    {
      module_id: 'mod_pkpu',
      module_title: 'Modul 1: Buku Saku PKPU Pemungutan & Penghitungan Suara',
      difficulty: 'Dasar',
      estimated_time: '90 Menit',
      icon: 'book-open',
      lessons: [
        {
          lesson_id: 'les_101',
          title: 'Hak, Kewajiban, & Larangan Saksi Resmi di TPS',
          type: 'video',
          duration: '12:00',
          is_completed: true,
          description:
            'Memahami batas kewenangan hukum saksi berdasar PKPU: hak menyaksikan persiapan, memeriksa kotak suara, mengajukan keberatan, dan larangan mengenakan atribut kampanye.',
          summaryPoints: [
            'Saksi wajib menyerahkan Surat Tugas/Mandat resmi bertanda tangan pimpinan sebelum pukul 07.00 WIB.',
            'Hak penuh menyaksikan pembukaan kotak suara, penghitungan surat suara, dan pencatatan hasil di Plano.',
            'Dilarang mengintimidasi pemilih, mempengaruhi pilihan, atau menyentuh surat suara secara langsung.',
          ],
        },
        {
          lesson_id: 'les_102',
          title: 'Klasifikasi Pemilih: DPT, DPTb, dan DPK',
          type: 'article',
          duration: '15:00',
          is_completed: true,
          description:
            'Mengetahui jadwal hak pilih bagi DPT (07.00-13.00), pemilih pindahan DPTb (Form A-Pindah Memilih), serta DPK ber-e-KTP lokal (12.00-13.00 selama surat suara cadangan tersedia).',
          summaryPoints: [
            'DPT: Pemilih tetap yang terdaftar di TPS bersangkutan, mencoblos sejak pukul 07.00 WIB.',
            'DPTb: Pemilih pindah TPS wajib membawa formulir pindah memilih resmi KPU.',
            'DPK: Pemilih lokal ber-KTP sesuai alamat TPS hanya dilayani 1 jam terakhir (12.00 - 13.00 WIB).',
          ],
        },
        {
          lesson_id: 'les_103',
          title: 'SOP Pembukaan Kotak Suara & Verifikasi Logistik',
          type: 'video',
          duration: '10:00',
          is_completed: false,
          description:
            'Pencocokan jumlah surat suara yang diterima (DPT + 2% cadangan), tinta pemilu, formulir C, serta segel keamanan kabel ties KPU.',
          summaryPoints: [
            'Pastikan segel kotak suara dalam kondisi utuh sebelum dibuka oleh Ketua KPPS.',
            'Hitung bersama jumlah fisik surat suara sebelum proses pencoblosan dimulai.',
            'Pastikan berita acara penerimaan logistik ditandatangani oleh Ketua KPPS dan para saksi.',
          ],
        },
      ],
    },
    {
      module_id: 'mod_c1',
      module_title: 'Modul 2: Teknis Pengisian & Validasi Formulir C.Hasil-KWK Plano',
      difficulty: 'Inti',
      estimated_time: '120 Menit',
      icon: 'file-text',
      lessons: [
        {
          lesson_id: 'les_201',
          title: 'Struktur C1 Plano & Parameter Suara Sah / Batal',
          type: 'video',
          duration: '18:00',
          is_completed: false,
          description:
            'Mempelajari format matriks turus tally C1 Plano dan aturan keabsahan: coblos tanda gambar partai, coblos nama caleg PAN, atau keduanya.',
          summaryPoints: [
            'Coblos pada nomor/nama caleg PAN = Sah masuk ke suara caleg bersangkutan.',
            'Coblos pada lambang matahari putih PAN saja = Sah masuk ke suara partai PAN.',
            'Coblos pada lambang PAN dan nama caleg PAN sekaligus = Sah 1 suara untuk caleg.',
          ],
        },
        {
          lesson_id: 'les_202',
          title: 'Deteksi Selisih Angka & Koreksi Tally Secara Terbuka',
          type: 'video',
          duration: '14:00',
          is_completed: false,
          description:
            'Formula matematika audit: [Suara Sah Semua Partai] + [Suara Tidak Sah] = [Total Pengguna Hak Pilih]. Jika ada selisih, wajib dihitung ulang sebelum ditandatangani.',
          summaryPoints: [
            'Total suara sah + tidak sah HARUS sama dengan total surat suara yang digunakan.',
            'Jika ditemukan salah tulis pada angka Plano, KPPS wajib mencoret dengan dua garis horizontal dan memparafnya.',
            'Saksi dilarang menandatangani plano sebelum angka tally dan penjumlahan akhir sinkron.',
          ],
        },
        {
          lesson_id: 'les_203',
          title: 'Pengawalan Salinan C.Hasil & Unggah Cepat ke Saksi 360',
          type: 'article',
          duration: '10:00',
          is_completed: false,
          description:
            'Kewajiban KPPS memberikan 1 salinan C.Hasil bersegel kepada saksi resmi dan panduan memotret C1 Plano dengan OCR Vision AI di aplikasi SAKSI 360.',
          summaryPoints: [
            'Setiap saksi berhak menerima 1 rangkap salinan C-Hasil resmi bersegel.',
            'Foto setiap lembar C1 Plano dengan posisi tegak lurus, pencahayaan merata, dan 4 sudut fiducial terlihat.',
            'Kirim segera melalui fitur Scan C1 Plano di aplikasi simPAN untuk verifikasi Sainte-Laguë.',
          ],
        },
      ],
    },
    {
      module_id: 'mod_sengketa',
      module_title: 'Modul 3: Mitigasi Kecurangan & Pengajuan Formulir Keberatan',
      difficulty: 'Lanjutan',
      estimated_time: '90 Menit',
      icon: 'shield',
      lessons: [
        {
          lesson_id: 'les_301',
          title: 'Identifikasi Modus Pelanggaran TPS & Bukti Otentik',
          type: 'video',
          duration: '15:00',
          is_completed: false,
          description:
            'Mendeteksi pemilih ganda, surat suara yang telah dicoblos sebelum dibuka, mobilisasi pemilih ilegal, serta penghitungan yang dilakukan tergesa-gesa.',
          summaryPoints: [
            'Catat waktu kejadian, identitas saksi mata, dan ambil foto/video tanpa mengganggu proses.',
            'Dokumentasikan nama anggota KPPS yang bertugas saat kejadian berlangsung.',
            'Gunakan fitur Lapor Insiden SOS di aplikasi untuk menyalakan koordinasi tim advokasi DPD.',
          ],
        },
        {
          lesson_id: 'les_302',
          title: 'Prosedur Pengisian Form Model C.Keberatan-KPU',
          type: 'article',
          duration: '16:00',
          is_completed: false,
          description:
            'KPPS wajib mencatat keberatan saksi pada Formulir Model C.Keberatan-KPU. Saksi berhak menolak tanda tangan jika keberatan tidak ditanggapi dan dicatat.',
          summaryPoints: [
            'Tuliskan fakta keberatan secara ringkas, padat, dan jelas pada Form C.Keberatan-KPU.',
            'Pastikan Ketua KPPS menandatangani dan membubuhi stempel pada lembar salinan keberatan Anda.',
            'Simpan salinan asli keberatan untuk dibawa ke rapat pleno rekapitulasi PPK kecamatan.',
          ],
        },
      ],
    },
  ],
  quiz_questions: [
    {
      id: 'q1',
      question:
        'Kapan pemilih dalam kategori DPK (Daftar Pemilih Khusus) yang membawa KTP elektronik setempat dapat dilayani untuk mencoblos di TPS?',
      options: [
        'Kapan saja sejak TPS dibuka pukul 07.00 WIB',
        'Hanya pada 1 jam terakhir (pukul 12.00 - 13.00 WIB) sepanjang surat suara cadangan tersedia',
        'Hanya jika disetujui secara tertulis oleh saksi semua partai',
        'Tidak boleh mencoblos sama sekali jika tidak terdaftar di DPT',
      ],
      correctAnswerIndex: 1,
      explanation:
        'Sesuai PKPU Pemungutan Suara, pemilih DPK ber-e-KTP lokal hanya dapat menggunakan hak pilihnya pada pukul 12.00 - 13.00 WIB dengan memanfaatkan sisa surat suara cadangan.',
    },
    {
      id: 'q2',
      question:
        'Seorang pemilih mencoblos lambang Matahari Partai Amanat Nasional (PAN) DAN juga mencoblos nama salah satu Calon Legislatif PAN. Bagaimana status suara tersebut?',
      options: [
        'Suara dinyatakan batal / tidak sah karena mencoblos dua kali',
        'Dihitung sah 1 suara untuk nama calon legislatif yang dicoblos',
        'Dihitung sah 2 suara (1 untuk partai, 1 untuk caleg)',
        'Dihitung sah hanya untuk partai politik saja',
      ],
      correctAnswerIndex: 1,
      explanation:
        'Berdasarkan regulasi KPU, jika pemilih mencoblos tanda gambar partai dan nama calon dari partai yang sama, suaranya sah dihitung 1 suara untuk calon legislatif bersangkutan.',
    },
    {
      id: 'q3',
      question:
        'Apa yang harus dilakukan saksi jika Ketua KPPS menolak memberikan salinan formulir C.Hasil Salinan bersegel setelah penghitungan suara selesai?',
      options: [
        'Menerima saja dan langsung pulang membawa foto HP',
        'Segera ajukan keberatan tertulis pada Form C.Keberatan-KPU, hubungi Korlap / Advokasi BSN PAN, dan jangan tinggalkan TPS tanpa salinan resmi',
        'Memaksa mengambil kotak suara dari tangan KPPS',
        'Mengabaikan karena hasil pemilu di TPS tidak bisa diganggu gugat',
      ],
      correctAnswerIndex: 1,
      explanation:
        'Pemberian salinan C.Hasil kepada saksi mandat adalah kewajiban mutlak KPPS berdasar undang-undang pemilu. Penolakan merupakan pelanggaran pidana pemilu yang harus dituangkan dalam formulir keberatan resmi.',
    },
    {
      id: 'q4',
      question:
        'Formula matematika audit cepat apa yang wajib dipastikan oleh saksi sebelum berita acara TPS ditandatangani?',
      options: [
        '[Suara Sah Semua Partai] + [Suara Tidak Sah] = [Total Surat Suara yang Digunakan]',
        '[Suara Sah PAN] harus selalu lebih banyak dari suara tidak sah',
        '[Jumlah DPT] harus sama dengan [Jumlah Surat Suara yang Dicetak]',
        '[Pemilih Laki-laki] harus sama dengan [Pemilih Perempuan]',
      ],
      correctAnswerIndex: 0,
      explanation:
        'Prinsip neraca surat suara: Total pengguna hak pilih yang mencoblos HARUS sama dengan penjumlahan seluruh suara sah semua kontestan ditambah seluruh surat suara tidak sah.',
    },
    {
      id: 'q5',
      question:
        'Jika saksi menemukan dugaan selisih suara atau manipulasi angka saat penjumlahan di C1 Plano, langkah pertama yang paling benar adalah:',
      options: [
        'Membubarkan penghitungan suara secara sepihak',
        'Melakukan interupsi dengan sopan, meminta pencocokan ulang turus tally di hadapan Pengawas TPS, dan memastikan koreksi dicoret dua garis serta diparaf',
        'Langsung melaporkan ke kepolisian tanpa memberitahu KPPS',
        'Menandatangani plano terlebih dahulu baru menyampaikan komplain keesokan harinya',
      ],
      correctAnswerIndex: 1,
      explanation:
        'Interupsi terbuka dan koreksi di tempat (dengan pembubuhan paraf KPPS dan saksi) adalah instrumen resmi untuk menuntaskan koreksi sebelum kotak suara disegel dan dibawa ke PPK.',
    },
  ],
};
