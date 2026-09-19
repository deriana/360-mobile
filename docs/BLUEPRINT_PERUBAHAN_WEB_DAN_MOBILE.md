# BLUEPRINT & SPESIFIKASI PERUBAHAN SISTEM: PAN 360 (SAKSI 360)
## National Political Field Operations Platform — Partai Amanat Nasional (PAN)

---

### 1. Paradigma Utama Arsitektur (2 Kata Kunci)

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                          PAN 360 DIGITAL ECOSYSTEM                      │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                 ┌───────────────────┴───────────────────┐
                 ▼                                       ▼
     ┌───────────────────────┐               ┌───────────────────────┐
     │      MODUL WEB        │               │     MODUL MOBILE      │
     │ (Saksi360-Admin)      │               │      (360-saksi)      │
     ├───────────────────────┤               ├───────────────────────┤
     │  "MURNI MONITORING"   │               │   "BUAT TRANSAKSI"    │
     │                       │               │                       │
     │ • The Brain & Eyes    │               │ • Boots on the Ground │
     │ • Command Center      │               │ • Presensi GPS + Foto │
     │ • Tabulasi Suara      │               │ • Entri Hasil C1 TPS  │
     │ • Deteksi Anomali     │               │ • Tally Hitung Cepat  │
     │ • Verifikasi Dokumen  │               │ • Lapor Tiket Darurat │
     │ • Manajemen Wilayah   │               │ • Penerbitan e-KTA    │
     │ • Otorisasi Honor     │               │ • Bawa e-Mandat QR    │
     └───────────────────────┘               └───────────────────────┘
```

* **WEB (`Saksi360-Admin`) &rarr; MURNI BUAT MONITORING**:  
  Pusat komando eksekutif bagi DPP, DPW, DPD, Paslon, Caleg, dan BSN (Badan Saksi Nasional). Dirancang untuk menyajikan data agregasi real-time, visualisasi peta GIS, analisa disparitas suara, verifikasi bukti C1 Plano, mitigasi kecurangan, dan otorisasi finansial honorarium. **Tidak melakukan transaksi entri data lapangan primer**.
* **MOBILE (`360-saksi`) &rarr; BUAT TRANSAKSI**:  
  Instrumen kerja taktis di genggaman Saksi TPS, Koordinator Kluster, dan Relawan Lapangan. Dirancang cepat, ringan, tahan gangguan sinyal (*offline-first*), dan berorientasi pada eksekusi tugas lapangan: presensi, scan/input suara, dokumentasi visual, dan eskalasi kendala. **Bebas dari beban grafik analitik raksasa yang tidak relevan bagi petugas bilik suara**.

---

### 2. Status Repositori & Audit Terkini (Pasca Git Pull)

| Komponen | Status Git | Jumlah Modul/Layar | Kondisi Saat Ini |
| :--- | :--- | :--- | :--- |
| **Mobile (`~/coding/360-saksi`)** | Up to date (`d5e2732`) | 39 Layar (*Screens*), 5 Role Navigator | Fitur transaksi lapangan (Check-in kamera, Form C1, Tally counter, e-Mandat, e-KTA simPAN) sudah ada, namun masih memuat layar monitoring berat (Command Center, Pimpinan), OCR masih simulasi `setTimeout`, dan antrean offline masih berbasis memori RAM. |
| **Web Admin (`~/coding/admin-pak-andri/Saksi360-Admin`)** | Fast-forward 43 file (`3248b7d`) | 22 Fitur Admin, Sidebar Dinamis | Tampilan dashboard monitoring nasional/dapil, peta interaktif, dan integrasi simPAN sudah terpasang rapi. Perlu eliminasi form input langsung C1 agar fungsi web murni sebagai meja validasi (*adjudication desk*). |

---

### 3. Matriks Perubahan Penuh: Sisi Mobile (`360-saksi`) — [BUAT TRANSAKSI]

Tujuan refactoring mobile: **Mengoptimalkan kecepatan transaksi di TPS, memastikan ketahanan offline, dan membersihkan layar monitoring berat**.

| Modul Layar / Fitur | Status Saat Ini | Klasifikasi | Rencana Perubahan & Tindakan Teknis |
| :--- | :--- | :--- | :--- |
| **Check-in Presensi GPS (`CheckInScreen`)** | Kamera selfie + titik GPS Leaflet WebView sudah berjalan. Radius geofence 100m masih *soft warning*. | **Udah Pas** *(Perlu Diperbaiki)* | • Tambahkan toggle *Strict Geofence Mode* (jika saksi > 100m dari TPS, sistem meminta input alasan/konfirmasi koordinator).<br>• Simpan koordinat akurat, timestamp WIB, dan foto selfie terkompresi (< 200KB). |
| **Entri Formulir C1 (`ReportFormScreen`)** | Input suara Pilpres, DPR RI, & Partai sudah rapi. Dukungan multi-kategori dan upload foto. | **Udah Pas** | • Pertahankan alur transaksi cepat.<br>• Tambahkan validasi otomatis sebelum submit: `(Total Suara Sah Parpol + Caleg) + Suara Tidak Sah == Total Pemilih Hadir`. Jika tidak seimbang, tampilkan peringatan inkonsistensi. |
| **Hitung Cepat Bilik TPS (`QuickCountGameScreen`)** | Tally counter tap tombol suara per detik saat penghitungan suara terbuka di TPS. | **Udah Pas** | • Hubungkan tombol *"Kirim ke Laporan C1"* agar saksi tidak perlu mengetik ulang angka yang sudah di-tally saat sidang penghitungan selesai. |
| **AI OCR Scanner C1 (`C1OcrScreen`)** | Tampilan UI pemindaian C1 rapi, tetapi ekstraksi angka masih simulasi rumus matematik (`setTimeout`). | **Perlu Diperbaiki** *(Kritis)* | • Ganti simulasi dengan pemanggilan API Vision OCR (Google Cloud Vision / model OCR C1 KPU).<br>• Tampilkan side-by-side: gambar crop kotak angka vs hasil pembacaan OCR untuk verifikasi cepat saksi. |
| **AI OCR Scanner KTP (`KtpOcrScreen` & `RegisterMemberScreen`)** | Pindai e-KTP dan auto-fill formulir registrasi kader/saksi, namun masih simulasi text. | **Perlu Diperbaiki** | • Sambungkan ke endpoint ekstraksi KTP AI sungguhan.<br>• Simpan hasil registrasi anggota simPAN ke database persisten (POST ke endpoint `/api/members`). |
| **Lapor Insiden Darurat (`EmergencyFormScreen`)** | Form pengiriman laporan pelanggaran, intimidasi, politik uang, dan kekurangan surat suara. | **Udah Pas** | • Tambahkan fitur *Voice Note Emergency* (perekam suara 30 detik) dan tombol SOS cepat untuk situasi darurat intimidasi di TPS. |
| **Surat Tugas Digital (`AssignmentLetterScreen` & `VerifyLetterScreen`)** | Tampilan surat mandat resmi dengan stempel digital dan verifikator QR code. | **Udah Pas** | • Tambahkan fitur *Save to Gallery / PDF Offline* agar surat mandat tetap bisa dibuka meskipun koneksi internet terputus total saat pemeriksaan oleh KPPS/Bawaslu. |
| **Antrean Offline Transaksi (`offlineQueue.ts`)** | Menyimpan antrean transaksi saat sinyal internet putus, tetapi masih di memori RAM (`memoryQueue`). | **Belum Bagus** *(Kritis)* | • **Refactor Total**: Migrasikan penyimpanan ke `AsyncStorage` atau `expo-sqlite`.<br>• Tambahkan auto-retry background worker setiap 30 detik saat koneksi internet pulih. |
| **Layar Monitoring Berat (`CommandCenterScreen`, `LeadershipScreen`, `PartyLeaderboardScreen`)** | Menampilkan peta nasional raksasa, leaderboard partai nasional, dan matriks pimpinan di HP saksi. | **Belum Bagus** *(Salah Kamar)* | • **Hapus/Pindahkan**: Hilangkan menu Command Center dan Leadership dari tab mobile saksi.<br>• Ganti dengan layar ringan: **"Status TPS Saya & Rekap Wilayah Binaan"** yang hanya memuat progress saksi lokal. |

---

### 4. Matriks Perubahan Penuh: Sisi Web (`Saksi360-Admin`) — [MURNI MONITORING]

Tujuan refactoring web: **Memperkuat kapabilitas National Command Center, audit forensik suara, deteksi kecurangan real-time, dan manajemen hak akses terpusat**.

| Modul Fitur Web | Status Saat Ini | Klasifikasi | Rencana Perubahan & Tindakan Teknis |
| :--- | :--- | :--- | :--- |
| **National Command Center (`/command-center`, `/pimpinan`)** | Peta interaktif Leaflet/Overpass, status perolehan suara nasional, dan ringkasan wilayah. | **Udah Pas** | • Tambahkan *Live Telemetry Pulse* (indikator TPS masuk per menit).<br>• Tampilkan filter hierarki cepat: **Nasional &rarr; DPW (Provinsi) &rarr; DPD (Kab/Kota) &rarr; DPC (Kecamatan) &rarr; TPS**. |
| **Monitoring Presensi Saksi (`/check-in`)** | Tabel audit kehadiran nasional, filter status hadir/absen, dialog bukti foto selfie. | **Udah Pas** | • Tambahkan visualisasi peta sebaran kehadiran (titik hijau = saksi hadir tepat waktu, titik kuning = terlambat, titik merah = TPS kosong).<br>• Tombol aksi: *"Kirim Notifikasi Peringatan via WhatsApp/SMS"* untuk saksi yang belum check-in pada pukul 07:00 WIB. |
| **Meja Audit Laporan TPS (`/laporan-tps`)** | Menampilkan daftar C1 masuk dan review detail TPS. | **Udah Pas** | • Sediakan tampilan *Split Screen Dual-Viewer*: Sisi kiri menampilkan foto C1 Plano asli dari saksi, sisi kanan menampilkan angka yang dikirim saksi vs angka resmi Sirekap KPU.<br>• Tombol aksi operator: **Approve (Valid)**, **Flag Anomaly (Tinjau Ulang)**, atau **Dispute (Gugat ke Bawaslu)**. |
| **Form Entri Suara Web (`/input-hasil-tps`)** | Form manual untuk input suara TPS langsung dari web. | **Belum Bagus** *(Salah Kamar)* | • **Alihkan Peran**: Hapus fungsi input suara dari awal di web. Ubah modul ini menjadi **"Meja Koreksi & Sengketa C1"** yang hanya aktif jika saksi lapangan melaporkan kendala gagal kirim atau ada instruksi revisi resmi pleno PPK/KPU. |
| **Pusat Penanganan Insiden (`/darurat`)** | Tabel tiket darurat dan insiden TPS. | **Udah Pas** | • Tambahkan status SLA penanganan insiden (misal: intimidasi saksi harus direspons tim advokasi hukum DPD dalam < 15 menit).<br>• Integrasikan modul pendampingan Tim Hukum BSN PAN. |
| **Deteksi Anomali & Fraud Engine** | Belum ada dashboard khusus untuk algoritma deteksi kecurangan otomatis. | **Belum** *(Prioritas Tinggi)* | • Bangun modul **Intelligence / Deteksi Anomali**: Algoritma otomatis yang menandai TPS jika:<br>  1. Total suara melebihi 100% DPT.<br>  2. Suara PAN drop drastis di bawah basis historis tanpa alasan wajar.<br>  3. Lonjakan suara tidak wajar (> 90%) pada partai lawan di satu TPS tertentu.<br>  4. Selisih angka input saksi vs pembacaan OCR foto C1 Plano. |
| **Manajemen Honorarium (`/honorarium`)** | Tabel honor saksi, dialog invoice rekening, bukti bayar. | **Udah Pas** | • Tambahkan fitur *Batch Export Bank Disbursement File* (format CSV payroll Bank Mandiri / BCA) untuk eksekusi transfer massal ribuan saksi secara simultan. |
| **Manajemen Surat Mandat (`/surat-tugas`)** | Batch generation PDF surat tugas, digital seal, QR verification dialog. | **Udah Pas** | • Pastikan QR Code yang dihasilkan mengarah ke URL verifikasi publik yang aman dan valid (`https://saksi360.pan.or.id/verify/{token}`). |

---

### 5. Arsitektur 5 Ekosistem PAN 360

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               5 EKOSISTEM SAKSI 360 (PAN 360)                          │
├───────────────────┬──────────────────────────────────┬─────────────────────────────────┤
│ Ekosistem         │ Sisi Web (Monitoring & Kontrol)  │ Sisi Mobile (Aksi Transaksi)    │
├───────────────────┼──────────────────────────────────┼─────────────────────────────────┤
│ 1. PEOPLE         │ • Bank Data Relawan, Saksi, Kader│ • Registrasi Mandiri Scan KTP   │
│    (SDM & Kader)  │ • Verifikasi Identitas & NIK     │ • e-KTA Digital simPAN          │
│                   │ • Pemetaan Penugasan TPS         │ • Profil & Kartu Tugas Digital  │
├───────────────────┼──────────────────────────────────┼─────────────────────────────────┤
│ 2. TPS            │ • Monitoring Coverage TPS (0-100)│ • Presensi GPS Geofencing (100m)│
│    (Teritorial)   │ • Live Map Kehadiran Nasional    │ • Swafoto Petugas di TPS        │
│                   │ • Deteksi TPS Kosong Tanpa Saksi │ • Navigasi Titik Lokasi TPS     │
├───────────────────┼──────────────────────────────────┼─────────────────────────────────┤
│ 3. REPORT         │ • Meja Audit C1 Plano (Dual-View)│ • Entri Suara Pilpres/Pileg/Part│
│    (Pelaporan)    │ • Approval / Reject Berkas C1    │ • AI OCR Scan Dokumen C1        │
│                   │ • Galeri Dokumentasi Sidang TPS  │ • Tally Counter Bilik Suara     │
├───────────────────┼──────────────────────────────────┼─────────────────────────────────┤
│ 4. COMMAND        │ • National Command Center        │ • Inbox Instruksi Pimpinan      │
│    (Pusat Kendali)│ • Incident Triage & Tim Hukum    │ • Lapor Tiket Darurat & Bukti   │
│                   │ • Broadcast Komando Massal       │ • Tombol SOS Lapangan           │
├───────────────────┼──────────────────────────────────┼─────────────────────────────────┤
│ 5. INTELLIGENCE   │ • Algoritma Deteksi Kecurangan   │ • Feedback Koreksi C1 Instan    │
│    (AI & Analitik)│ • Proyeksi Kursi Sainte-Laguë    │ • Notifikasi Disparitas Data    │
│                   │ • Early Warning Threshold (4%)   │ • Cek Validasi Total Suara      │
└───────────────────┴──────────────────────────────────┴─────────────────────────────────┘
```

---

### 6. Standar Keamanan, Kepatuhan UU PDP, & Otentikasi Bukti Hukum

1. **Kepatuhan UU Pelindungan Data Pribadi (UU No. 27 Tahun 2022)**:
   * Seluruh NIK saksi dan kader wajib dienkripsi pada tingkat database (*Encryption-at-Rest* menggunakan AES-256-GCM).
   * Pada tampilan web dan mobile, nomor identitas wajib disamarkan (*masked*), misal: `327301******0005`.
   * Hak akses berbasis peran ketat (RBAC): Operator tingkat kecamatan (DPC) tidak memiliki wewenang mengunduh data KTP di luar wilayah kerjanya.
2. **Otentikasi Bukti Mahkamah Konstitusi (PHPU)**:
   * Setiap foto C1 Plano dan video insiden yang diunggah saksi melalui aplikasi mobile secara otomatis disematkan metadata digital (*tamper-proof watermark*):
     * `[Timestamp Presisi UTC+7 / WIB]`
     * `[ID Unik Saksi & Akun simPAN]`
     * `[Nomor TPS, Kelurahan, Kecamatan, Kab/Kota]`
     * `[Koordinat GPS Lat/Lng & Akurasi Meter]`
     * `[SHA-256 Checksum File Asli]`
   * Metadata ini menjadikan setiap laporan yang masuk berkekuatan hukum sah sebagai alat bukti perselisihan hasil pemilu di Mahkamah Konstitusi.

---

### 7. Action Plan & Roadmap Eksekusi

```text
SPRINT 1 (Penyelarasan & Pembersihan Kamar)
├── [Mobile] Lepaskan CommandCenterScreen & LeadershipScreen dari navigasi saksi.
├── [Mobile] Migrasikan offlineQueue.ts dari in-memory ke AsyncStorage/SQLite.
└── [Web]    Alihkan halaman /input-hasil-tps menjadi Meja Audit & Validasi C1.

SPRINT 2 (Penguatan Transaksi & Validasi)
├── [Mobile] Hubungkan tombol QuickCountGameScreen langsung ke form pengisian C1.
├── [Mobile] Tambahkan validasi kesetaraan matematika di ReportFormScreen.
└── [Web]    Bangun tampilan Split-Screen Reviewer (Foto Dokumen C1 vs Inputan Saksi).

SPRINT 3 (AI Vision & Deteksi Anomali)
├── [Mobile] Integrasikan API Vision OCR asli untuk C1 Plano dan KTP.
├── [Web]    Implementasikan modul Intelligence: Auto-flagging suara > DPT dan lonjakan suara anomali.
└── [Web]    Batch export file payroll pembayaran honorarium saksi (BCA / Bank Mandiri).
```
