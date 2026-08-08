export interface Insight {
  id: string;
  title: string;
  body: string;
  tone: 'danger' | 'warning' | 'info' | 'success';
}

export const insightsList: Insight[] = [
  {
    id: 'INS-001',
    title: 'Wilayah Perhatian Khusus',
    body: 'Kecamatan Coblong & Kabupaten Bogor menunjukkan pelaporan melambat dengan 1 laporan kendala. Disarankan pengawasan tambahan.',
    tone: 'danger',
  },
  {
    id: 'INS-002',
    title: 'Tingkat Partisipasi Pemilih',
    body: 'Partisipasi pemilih rata-rata berada pada angka 78.4%, melampaui estimasi awal 72% pada jam penghitungan suara.',
    tone: 'info',
  },
  {
    id: 'INS-003',
    title: 'Pemeriksaan Selisih Suara C1',
    body: 'Terdeteksi 2 TPS memiliki selisih angka total suara sah melebihi pemilih hadir. Perlu konfirmasi ulang lampiran C1.',
    tone: 'warning',
  },
  {
    id: 'INS-004',
    title: 'Laju Kecepatan Pelaporan',
    body: 'Kecepatan pengiriman C1 Plano naik 24% dibanding periode jam sebelumnya. 85% Saksi di Kota Bandung telah terverifikasi hadir.',
    tone: 'success',
  },
  {
    id: 'INS-005',
    title: 'Rekomendasi Tindakan Lapangan',
    body: 'Kirim notifikasi panggil ke 3 Saksi di wilayah Kota Medan yang belum melakukan konfirmasi presensi GPS.',
    tone: 'info',
  },
];
