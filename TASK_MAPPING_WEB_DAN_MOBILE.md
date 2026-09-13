# TASK MAPPING & WORK BREAKDOWN STRUCTURE (WBS)
## PAN 360: SAKSI 360 (Web Murni Monitoring || Mobile Buat Transaksi)

---

### 1. Diagram Aliran Data & Pemetaan Interoperabilitas

Setiap aksi transaksi di lapangan (Mobile) bermuara pada layar pemantauan dan kendali pimpinan (Web):

```text
┌──────────────────────────────────────────┐               ┌──────────────────────────────────────────┐
│        SISI MOBILE (BUAT TRANSAKSI)      │               │       SISI WEB (MURNI MONITORING)        │
│          App: 360-saksi (React Native)   │               │        App: Saksi360-Admin (Vite/React)  │
├──────────────────────────────────────────┤               ├──────────────────────────────────────────┤
│ [TX-01] Presensi GPS & Swafoto Saksi     │ ──(API/WS)──> │ [MON-01] Live Map Presensi Kehadiran TPS │
│ [TX-02] Input Hasil Perolehan Suara C1   │ ──(API)─────> │ [MON-02] Tabulasi Suara & Meja Audit C1  │
│ [TX-03] AI Scan OCR Plano C1             │ ──(AI Engine)─>│ [MON-03] Confidence Score & Cek Disparitas│
│ [TX-04] Tally Hitung Cepat Bilik Suara   │ ──(Sync)────> │ [MON-04] Real-time Quick Count Dashboard │
│ [TX-05] Tiket Laporan Darurat / Insiden  │ ──(Instant)─> │ [MON-05] Incident Command & Tim Advokasi │
│ [TX-06] Registrasi Kader Mandiri (e-KTA) │ ──(API)─────> │ [MON-06] Bank Data Relawan, Saksi, Kader │
│ [TX-07] Tunjukkan Surat Tugas (e-Mandat) │ <──(Digital)── │ [MON-07] Penerbitan Mandat & Stempel DPP │
│ [TX-08] Cek Status Pencairan Honorarium  │ <──(Disburse)─ │ [MON-08] Otorisasi Finansial & Batch Bank│
│ [TX-09] Terima Broadcast Pimpinan Partai │ <──(Push Notif)│ [MON-09] Pusat Komando Broadcast Wilayah │
└──────────────────────────────────────────┘               └──────────────────────────────────────────┘
```

---

### 2. Matriks Pemetaan Fitur & Kontrak Data (Mobile &harr; Web)

| ID Alur | Transaksi Lapangan (Mobile) | Modul Monitoring (Web) | Kontrak Data / Endpoint API | Dampak Operasional |
| :--- | :--- | :--- | :--- | :--- |
| **M-W-01** | `CheckInScreen.tsx`<br>• Lock titik GPS<br>• Selfie wajah saksi | `/check-in`<br>• Peta sebaran kehadiran<br>• Bukti foto selfie modal | `POST /api/v1/presensi/check-in`<br>`{ witnessId, tpsId, lat, lng, selfieUrl, timestamp }` | Pimpinan tahu TPS mana yang saksinya hadir atau mangkir sejak pukul 07:00 WIB. |
| **M-W-02** | `ReportFormScreen.tsx`<br>• Entri suara Pilpres & Pileg<br>• Upload foto dokumen C1 | `/laporan-tps` & `/input-hasil-tps`<br>• Meja Validasi Dual-View<br>• Approval/Reject C1 | `POST /api/v1/tps/c1-report`<br>`{ tpsId, votes: { party, caleg, invalid }, media: [...] }` | Data suara langsung masuk ke tabulasi real-time setelah diverifikasi operator. |
| **M-W-03** | `QuickCountGameScreen.tsx`<br>• Tally counter tap cepat<br>• Tombol *"Kirim ke C1"* | `/dashboard` & `/pimpinan`<br>• Live Quick Count<br>• Proyeksi Kursi Parlemen | `POST /api/v1/tps/quick-tally`<br>`{ tpsId, paslonVotes, dprVotes, partialCount: true }` | Pantauan suara masuk per menit sebelum formulir C1 fisik selesai ditulis KPPS. |
| **M-W-04** | `EmergencyFormScreen.tsx`<br>• Submit bukti intimidasi / curang<br>• Tombol SOS Cepat | `/darurat`<br>• Triage tiket insiden<br>• Dispatch tim hukum BSN | `POST /api/v1/incident/report`<br>`{ tpsId, category, severity, description, photos }` | Tim hukum BSN PAN langsung mendampingi saksi dalam hitungan menit di lapangan. |
| **M-W-05** | `RegisterMemberScreen.tsx`<br>• Scan e-KTP AI<br>• Penerbitan e-KTA digital | `/master-data-saksi` & `/akses`<br>• Approval akun saksi/kader<br>• NIK encryption | `POST /api/v1/members/register`<br>`{ nik, nama, dapil, phone, role, eKtaNumber }` | Database relawan & saksi terisi otomatis tanpa entri manual kertas formulir. |
| **M-W-06** | `AssignmentLetterScreen.tsx`<br>• Buka surat tugas offline<br>• QR verifikasi petugas | `/surat-tugas`<br>• Batch PDF generation<br>• Stempel digital DPP/DPD | `GET /api/v1/letters/verify/{token}`<br>`{ token, witnessId, verifiedByKpu: true }` | KPPS dan Bawaslu dapat memvalidasi keaslian surat saksi lewat scan QR resmi. |
| **M-W-07** | `PaymentScreen.tsx`<br>• Tinjau status honor transfer<br>• Unduh bukti invoice | `/honorarium`<br>• Batch export CSV bank<br>• Rekap budget per dapil | `POST /api/v1/finance/disburse`<br>`{ witnessBatch: [...], bankCode: "BCA", totalAmount }` | Mencegah penyelewengan dana saksi; transfer langsung ke rekening masing-masing. |

---

### 3. Task List Sisi Mobile (`360-saksi`) — [BUAT TRANSAKSI]

#### Kelompok A: Pembersihan Layar Monitoring (Uncluttering & Simplifikasi)
- [ ] **Task M-01**: Hapus / Alihkan [`CommandCenterScreen.tsx`](file:///home/deryana/coding/360-saksi/src/screens/CommandCenterScreen.tsx) dan [`LeadershipScreen.tsx`](file:///home/deryana/coding/360-saksi/src/screens/LeadershipScreen.tsx) dari stack navigasi saksi lapangan.
  - *Alasan*: Peta sebaran nasional dan grafik komparasi 18 parpol membuat aplikasi mobile berat dan tidak dibutuhkan saksi di TPS.
- [ ] **Task M-02**: Sederhanakan [`PartyLeaderboardScreen.tsx`](file:///home/deryana/coding/360-saksi/src/screens/PartyLeaderboardScreen.tsx) menjadi widget lokal ringkas *"Perolehan Suara PAN di Dapil Anda"*.
- [ ] **Task M-03**: Ganti menu Beranda Saksi di [`DashboardScreen.tsx`](file:///home/deryana/coding/360-saksi/src/screens/DashboardScreen.tsx) agar 100% berfokus pada **Checklist Hari-H**:
  1. *Step 1*: Absen Masuk TPS (GPS + Selfie).
  2. *Step 2*: Tunjukkan Surat Mandat ke KPPS.
  3. *Step 3*: Tally Suara saat Penghitungan Dimulai.
  4. *Step 4*: Foto C1 Plano & Input Angka Resmi.
  5. *Step 5*: Upload Dokumentasi TPS & Cek Status Honor.

#### Kelompok B: Peningkatan Mesin Transaksi Lapangan
- [ ] **Task M-04**: **Migrasi Offline Storage Permanen** ([`offlineQueue.ts`](file:///home/deryana/coding/360-saksi/src/utils/offlineQueue.ts)).
  - Ganti `memoryQueue` dengan `AsyncStorage` atau `expo-sqlite`.
  - Pasang event listener konektivitas jaringan (`@react-native-community/netinfo`) untuk auto-flush antrean saat sinyal kembali online.
- [ ] **Task M-05**: **Strict Geofencing & Foto Kompresi** ([`CheckInScreen.tsx`](file:///home/deryana/coding/360-saksi/src/screens/CheckInScreen.tsx)).
  - Tambahkan kalkulasi Haversine formula yang membatasi radius saksi maksimal 100 meter dari koordinat target TPS.
  - Jika di luar radius, wajibkan saksi memasukkan alasan (*override note*) yang otomatis di-flag ke web koordinator.
  - Kompresi otomatis foto selfie menjadi < 200KB sebelum diunggah untuk hemat kuota.
- [ ] **Task M-06**: **Sinkronisasi Tally Counter ke Form C1** ([`QuickCountGameScreen.tsx`](file:///home/deryana/coding/360-saksi/src/screens/QuickCountGameScreen.tsx) &rarr; [`ReportFormScreen.tsx`](file:///home/deryana/coding/360-saksi/src/screens/ReportFormScreen.tsx)).
  - Hubungkan state angka suara paslon/caleg di Tally Counter agar sekali klik tombol *"Kirim ke Formulir C1"*, seluruh input di formulir pelaporan otomatis terisi tanpa ketik ulang.
- [ ] **Task M-07**: **Validasi Keseimbangan Angka Matematika Suara** ([`ReportFormScreen.tsx`](file:///home/deryana/coding/360-saksi/src/screens/ReportFormScreen.tsx)).
  - Pasang validasi formulir: `Total Suara Sah Seluruh Partai + Suara Tidak Sah == Total Pemilih Hadir`.
  - Berikan indikator visual warna hijau jika seimbang, atau merah jika terjadi selisih (*disparitas*).
- [ ] **Task M-08**: **Watermarking Metadata Otomatis Foto C1** ([`pickImage.ts`](file:///home/deryana/coding/360-saksi/src/utils/pickImage.ts) / [`DocumentationScreen.tsx`](file:///home/deryana/coding/360-saksi/src/screens/DocumentationScreen.tsx)).
  - Sisipkan metadata teks otomatis pada sudut foto: `[PAN BSN - TPS {no} {kelurahan} - {timestamp WIB} - {lat,lng}]`.
- [ ] **Task M-09**: **Cache Surat Mandat Digital Offline** ([`AssignmentLetterScreen.tsx`](file:///home/deryana/coding/360-saksi/src/screens/AssignmentLetterScreen.tsx)).
  - Simpan berkas e-Mandat ber-QR di local cache device saat pertama kali dibuka, sehingga tetap bisa dimunculkan tanpa internet.
- [ ] **Task M-10**: **Integrasi Real AI OCR Endpoint** ([`C1OcrScreen.tsx`](file:///home/deryana/coding/360-saksi/src/screens/C1OcrScreen.tsx) & [`KtpOcrScreen.tsx`](file:///home/deryana/coding/360-saksi/src/screens/KtpOcrScreen.tsx)).
  - Hapus simulasi `setTimeout`, ganti dengan API call multipart-form ke backend Vision AI OCR untuk deteksi otomatis kotak angka formulir C1 Plano dan KTP.

---

### 4. Task List Sisi Web (`Saksi360-Admin`) — [MURNI MONITORING]

#### Kelompok A: Redesain Meja Verifikasi & Audit Suara
- [ ] **Task W-01**: **Redesain `/input-hasil-tps` Menjadi Meja Validasi & Adjudikasi C1**.
  - Nonaktifkan input manual suara baru dari web.
  - Bangun antarmuka **Dual-View Reviewer**:
    * Sisi Kiri: Foto C1 Plano resolusi tinggi hasil jepretan saksi (dengan fitur zoom/pan).
    * Sisi Kanan: Angka hasil input saksi vs Angka pembacaan OCR AI vs Angka KPU Sirekap.
  - Sediakan 3 tombol aksi bagi operator:
    1. `[Verifikasi & Setujui]` (Masuk ke tabulasi resmi PAN).
    2. `[Tandai Anomali]` (Minta verifikasi ulang koordinator lapangan).
    3. `[Ajukan Sengketa / PHPU]` (Eskalasi ke tim advokasi hukum BSN).

#### Kelompok B: National Command Center & GIS Live Map
- [ ] **Task W-02**: **Live Telemetry Dashboard** ([`src/features/command-center/index.tsx`](file:///home/deryana/coding/admin-pak-andri/Saksi360-Admin/src/features/command-center/index.tsx)).
  - Tampilkan metrik kecepatan pelaporan: *Kecepatan TPS Masuk/Menit*, *Persentase TPS Terkumpul*, *Estimasi Suara Masuk Terakhir*.
  - Sediakan filter bertingkat: **Nasional &rarr; DPW (38 Provinsi) &rarr; DPD (514 Kab/Kota) &rarr; DPC (Kecamatan) &rarr; TPS**.
- [ ] **Task W-03**: **Live Coverage & Heatmap Presensi TPS** ([`src/features/check-in/index.tsx`](file:///home/deryana/coding/admin-pak-andri/Saksi360-Admin/src/features/check-in/index.tsx)).
  - Tampilkan peta GIS sebaran saksi se-Indonesia:
    * Titik Hijau: Saksi hadir tepat waktu (sebelum 07:00 WIB).
    * Titik Kuning: Saksi hadir terlambat.
    * Titik Merah Berkedip: TPS kosong belum ada saksi check-in.
  - Tambahkan tombol aksi: *"Kirim Peringatan WhatsApp Massal"* ke saksi yang belum hadir.

#### Kelompok C: Intelligence & Deteksi Kecurangan (Fraud Engine)
- [ ] **Task W-04**: **Engine Deteksi Anomali Suara Otomatis**.
  - Pasang rule engine cerdas yang otomatis memberi peringatan bahaya (*Alert Banner*) jika:
    1. `Suara Sah + Tidak Sah > Total DPT TPS`.
    2. Suara PAN mengalami penurunan ekstrem dibanding pileg sebelumnya di basis tradisional.
    3. Lonjakan suara drastis (>90%) pada parpol/paslon tertentu di satu TPS.
    4. Selisih mencolok antara angka yang diketik saksi dengan angka OCR formulir C1 Plano.
- [ ] **Task W-05**: **Kalkulator Proyeksi Kursi Sainte-Laguë** ([`src/features/pimpinan/index.tsx`](file:///home/deryana/coding/admin-pak-andri/Saksi360-Admin/src/features/pimpinan/index.tsx)).
  - Tampilkan simulasi konversi perolehan suara partai ke kursi DPR RI (Dapil 1 s/d 8 kursi) menggunakan metode pembagi ganjil (1, 3, 5, 7).
  - Tampilkan indikator *Threshold Tracker*: Posisi suara PAN terhadap Parliamentary Threshold 4% Nasional.

#### Kelompok D: Manajemen Honorarium & Otentikasi Surat Mandat
- [ ] **Task W-06**: **Batch Export Payroll Honorarium** ([`src/features/honorarium/index.tsx`](file:///home/deryana/coding/admin-pak-andri/Saksi360-Admin/src/features/honorarium/index.tsx)).
  - Fitur ekspor berkas payroll batch kompatibel Bank Mandiri / BCA (format CSV/TXT) untuk saksi yang statusnya sudah *"Hadir & C1 Terverifikasi"*.
- [ ] **Task W-07**: **Digital Seal & QR Generator Surat Tugas** ([`src/features/surat-tugas/index.tsx`](file:///home/deryana/coding/admin-pak-andri/Saksi360-Admin/src/features/surat-tugas/index.tsx)).
  - Otomasi pembubuhan tanda tangan elektronik pimpinan DPD/DPP PAN dan stempel digital pada berkas PDF surat mandat.
- [ ] **Task W-08**: **Kepatuhan UU PDP (Masking NIK & Audit Trail)** ([`src/features/master-data-saksi/index.tsx`](file:///home/deryana/coding/admin-pak-andri/Saksi360-Admin/src/features/master-data-saksi/index.tsx)).
  - Pastikan seluruh tampilan NIK disamarkan (*masked*).
  - Catat log aktivitas operator (siapa membuka, mengunduh, atau mengubah data saksi).

---

### 5. Roadmap Eksekusi per Sprint

```text
SPRINT 1: Fondasi Pemisahan Peran (Pembersihan Kamar)
├── [Mobile] Task M-01: Bersihkan CommandCenter & Leadership dari tab saksi.
├── [Mobile] Task M-04: Migrasikan offlineQueue.ts ke AsyncStorage / SQLite.
├── [Mobile] Task M-05: Pasang strict geofencing 100m pada presensi GPS.
└── [Web]    Task W-01: Redesain /input-hasil-tps jadi Meja Validasi C1 Dual-View.

SPRINT 2: Keandalan Transaksi Bilik TPS & Live Telemetry
├── [Mobile] Task M-06: Hubungkan Tally Counter langsung ke pengisian C1.
├── [Mobile] Task M-07: Pasang validasi matematika suara C1.
├── [Mobile] Task M-09: Buat cache offline surat mandat digital.
├── [Web]    Task W-02: Pasang Live Telemetry kecepatan suara masuk per menit.
└── [Web]    Task W-03: Peta sebaran kehadiran saksi & blast WA saksi terlambat.

SPRINT 3: AI Intelligence, Deteksi Kecurangan & Finansial
├── [Mobile] Task M-08: Otomasi watermark digital pada foto C1 saksi.
├── [Mobile] Task M-10: Integrasikan API real AI OCR untuk KTP & C1 Plano.
├── [Web]    Task W-04: Implementasikan rule engine anomali & kecurangan suara.
├── [Web]    Task W-05: Pasang kalkulator kursi Sainte-Laguë & PT 4% tracker.
└── [Web]    Task W-06: Pasang batch export payroll honorarium perbankan.
```
