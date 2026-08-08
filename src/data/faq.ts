export interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-checkin-1',
    category: 'Check-in & Presensi',
    question: 'Kenapa saya harus check-in dengan lokasi GPS?',
    answer:
      'Check-in GPS memastikan saksi benar-benar hadir di lokasi TPS penugasan pada hari-H. Pastikan izin lokasi aktif di pengaturan perangkat, lalu ambil selfie dan konfirmasi presensi dari layar Check-in.',
  },
  {
    id: 'faq-checkin-2',
    category: 'Check-in & Presensi',
    question: 'Lokasi GPS saya tidak akurat / tidak terdeteksi, harus bagaimana?',
    answer:
      'Pastikan GPS ponsel dalam mode akurasi tinggi dan koneksi internet stabil. Coba keluar-masuk ulang dari layar Check-in. Jika masih gagal, hubungi Koordinator TPS atau Operator Lapangan untuk pencatatan manual.',
  },
  {
    id: 'faq-c1-1',
    category: 'Formulir C1 & Hasil Suara',
    question: 'Apa bedanya Scan OCR C1 dengan Isi Manual?',
    answer:
      'Scan OCR C1 membaca angka dari foto Formulir C1 Plano secara otomatis lalu tetap bisa dikoreksi manual sebelum dikirim. Isi Manual dipakai kalau kualitas foto formulir kurang jelas untuk dipindai atau kamu memang lebih suka mengetik langsung.',
  },
  {
    id: 'faq-c1-2',
    category: 'Formulir C1 & Hasil Suara',
    question: 'Kenapa saya wajib unggah foto formulir & papan hasil hitung?',
    answer:
      'Foto formulir C1 Plano dan papan hasil hitung adalah bukti resmi pendamping data suara yang dilaporkan. Tanpa lampiran ini laporan tidak bisa dikirim/diverifikasi, sesuai prosedur pengawasan pemilu.',
  },
  {
    id: 'faq-c1-3',
    category: 'Formulir C1 & Hasil Suara',
    question: 'Saya salah pilih TPS saat mengisi laporan, bagaimana cara membetulkannya?',
    answer:
      'Buka kembali menu Lapor Hasil C1, gunakan dropdown "Pilih TPS untuk Diisi / Di-edit" untuk berpindah ke TPS yang benar. Data yang sudah tersimpan untuk TPS lain tidak akan tertimpa.',
  },
  {
    id: 'faq-dok-1',
    category: 'Dokumentasi Kegiatan',
    question: 'Foto dokumentasi yang saya unggah bisa dilihat siapa saja?',
    answer:
      'Foto dokumentasi per TPS bisa dilihat oleh Koordinator dan Pengawas yang membina TPS tersebut lewat menu Pengawasan, untuk keperluan verifikasi kegiatan lapangan.',
  },
  {
    id: 'faq-darurat-1',
    category: 'Laporan Darurat',
    question: 'Kapan saya harus mengirim Laporan Darurat?',
    answer:
      'Segera laporkan kejadian seperti kekurangan surat suara, intimidasi, politik uang, atau pelanggaran prosedur lain lewat menu Lapor Kejadian TPS. Sertakan foto bukti jika memungkinkan agar Koordinator bisa segera menindaklanjuti.',
  },
  {
    id: 'faq-darurat-2',
    category: 'Laporan Darurat',
    question: 'Bagaimana saya tahu laporan darurat saya sudah ditindaklanjuti?',
    answer:
      'Buka menu Cek Laporan Kendala TPS untuk melihat status laporan: Terbuka, Diselidiki, atau Selesai. Status ini diperbarui oleh Koordinator/Pengawas yang menangani.',
  },
  {
    id: 'faq-honor-1',
    category: 'Honorarium',
    question: 'Kapan honorarium saksi cair?',
    answer:
      'Honorarium dicairkan setelah laporan C1 kamu diverifikasi lengkap (data suara + lampiran foto). Cek statusnya kapan saja lewat menu Status Honorarium Saksi.',
  },
  {
    id: 'faq-akun-1',
    category: 'Akun & Kartu Petugas',
    question: 'Apa fungsi Kartu Petugas / QR Code di profil saya?',
    answer:
      'Kartu Petugas adalah identitas digital resmi yang bisa ditunjukkan ke Pengawas atau KPPS untuk verifikasi identitas di lokasi TPS. Kode QR di kartu ini memvalidasi bahwa akunmu terdaftar resmi di sistem.',
  },
  {
    id: 'faq-akun-2',
    category: 'Akun & Kartu Petugas',
    question: 'Saya lupa lokasi TPS penugasan saya, cek di mana?',
    answer:
      'Lokasi TPS penugasanmu selalu tampil di halaman utama (Tugas Saya) dan di Kartu Petugas pada menu Profil.',
  },
];

export const FAQ_CATEGORIES = Array.from(new Set(FAQ_ITEMS.map((f) => f.category)));
