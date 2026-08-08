export interface Insight {
  id: string;
  title: string;
  body: string;
  tone: 'danger' | 'warning' | 'info' | 'success';
}

export const aiInsights: Insight[] = [
  {
    id: 'INS-001',
    title: 'Deteksi Wilayah Berisiko Tinggi',
    body: 'Kecamatan Coblong & Kabupaten Bogor menunjukkan indikasi pelaporan melambat dengan 1 laporan insiden. Disarankan penebalan pengawasan lapangan.',
    tone: 'danger',
  },
  {
    id: 'INS-002',
    title: 'Analisis Partisipasi Pemilih Real-Time',
    body: 'Partisipasi pemilih rata-rata berada pada angka 78.4%, melampaui estimasi awal 72% pada jam penghitungan suara.',
    tone: 'info',
  },
  {
    id: 'INS-003',
    title: 'Deteksi Anomali Angka Suara C1',
    body: 'Algoritma mendeteksi 2 TPS memiliki selisih angka total suara sah melebihi pemilih hadir. Memerlukan audit fisik ulang foto C1.',
    tone: 'warning',
  },
  {
    id: 'INS-004',
    title: 'Laju Kecepatan Pelaporan Meningkat',
    body: 'Kecepatan pengiriman C1 Plano naik 24% dibanding periode jam sebelumnya. 85% Saksi di Kota Bandung telah terverifikasi hadir.',
    tone: 'success',
  },
  {
    id: 'INS-005',
    title: 'Rekomendasi Tindakan Koordinator',
    body: 'Kirim notifikasi panggil ke 3 Saksi di wilayah Kota Medan yang belum melakukan konfirmasi presensi GPS.',
    tone: 'info',
  },
];
