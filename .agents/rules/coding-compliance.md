---
trigger: always_on
---

# ATURAN KEPATUHAN PENGKODEAN AI AGENT (CODING COMPLIANCE RULES)
## SAKSI 360 / simPAN Mobile — Ekosistem Digital Kader, Relawan, Saksi & Caleg PAN
**Direktori Target:** `.agents/rules/coding-compliance.md`  
**Versi:** 1.0 (DPP PAN Ready & Master Multi-Role Compliant)  
**Status:** WAJIB DIPATUHI (MANDATORY ENFORCEMENT) oleh Setiap AI Agent, Developer, dan Asisten Coding.

---

## 1. Ringkasan Eksekutif & Hirarki Sumber Kebenaran (Source of Truth)

Seluruh aktivitas pengembangan, modifikasi, penambahan fitur, pembenahan antarmuka, dan refactoring pada repositori `360-mobile` **WAJIB MENGIKUTI DAN TUNDUK PADA ATURAN KEPATUHAN INI**.

### 1.1 Dokumen Rujukan Utama
1. `docs/AGENTS.md`: Cetak biru fungsional, relasi Mobile vs Web Command Center, model identitas bertingkat (*User → Membership → Role → Scope → Permission*), dan prinsip *Least Privilege*.
2. `docs/DAFTAR_TUGAS_PRESENTASI_DPP_PAN.md`: Arsitektur 2 Akun Komplementer, Model 7 Dimensi Identitas, State Presets Karir Fungsionaris vs Transisi Relawan, Gamified Level-Unlock 4 Syarat BSN, Peta GIS Eksekutif, Tata Kelola "Kelola Status Saya" (*Never Delete User Hard*), dan Kebijakan Nol Emoji (*Zero Emoji Policy*).
3. `docs/master_plan_penyelarasan_menu_multi_role.md`: Arsitektur Navigasi Tri-Layer, Kaidah Emas Nol Duplikasi (*Zero-Duplication Golden Rules*), Matriks RBAC 35+ Layanan, dan standarisasi Tepat 4 Quick Menu di Beranda.
4. `src/context/AppContext.tsx`: **Single Source of Truth (SSOT)** implementasi state reaktif lokal, mutasi akun, data transaksi lapangan, simulasi offline queue, dan notifikasi aplikasi.

### 1.2 Prinsip Inti yang Mengikat
> **"Satu Aplikasi, Satu Identitas Terpadu (One Identity), Multi-Peran Dinamis (Multi-Dimensional State), Nol Akses Duplikat (Zero Redundancy), Nol Emoji (Zero Emoji), dan Sepenuhnya Reaktif di Frontend (100% Dynamic Client State)."**

---

## 2. Kepatuhan State Global & AppContext (`src/context/AppContext.tsx`)

`AppContext.tsx` adalah **satu-satunya pusat kebenaran data dan state aplikasi**.

### 2.1 Kewajiban Konsumsi State
- Seluruh screen dan komponen **WAJIB** mengonsumsi state melalui custom hook `useApp()`:
  ```tsx
  import { useApp } from '../context/AppContext';
  
  const {
    currentUser,
    role,
    switchOperationalRoleWithGuard,
    applyCareerStatePreset,
    applyVolunteerStatePreset,
    requestMembershipResignation,
    cancelMembershipResignation,
    setVolunteerPause,
    stopVolunteer,
    completeAcademyModule,
    checkInWitness,
    submitTpsReport,
    addEmergencyReport,
    addBroadcast,
    tasks,
    events,
    notifications,
    volunteerOpportunities,
  } = useApp();
  ```
- **DILARANG KERAS** membuat `useState` mandiri/ad-hoc di level screen/komponen untuk data yang merupakan entitas global aplikasi (misal: duplikasi status login, status KTA, peran operasional aktif, daftar tugas, data kehadiran GPS, atau laporan C1).
- State lokal di dalam komponen hanya diizinkan untuk kebutuhan transient UI murni (seperti: `isModalVisible`, `searchQuery`, `activeFilterTab`, `formDraftField`).

### 2.2 Kewajiban Mutasi Melalui Dispatcher Methods
Setiap perubahan data user, status keanggotaan, peran operasional, transaksi TPS, atau antrean tugas **WAJIB** memanggil method yang disediakan oleh `AppContext`:

| Kebutuhan Aksi / Mutasi | Method Resmi di `AppContext.tsx` | Efek Samping yang Terjamin |
| :--- | :--- | :--- |
| **Ganti Peran Operasional** | `switchOperationalRoleWithGuard(role)` | Memeriksa kelayakan prasyarat via `roleUnlockRules.ts`, mengupdate permissions, dan mengirim notifikasi sistem. |
| **Simulasi Karir Kader (Ahmad Fauzan)** | `applyCareerStatePreset(presetId)` | Menyelaraskan seluruh 7 dimensi identitas kader (State 1 s.d. 6) dan mengirim maklumat DPP. |
| **Simulasi Transisi Relawan (Siti Rahmawati)** | `applyVolunteerStatePreset(presetId)` | Beralih antara State R-1 (Posko) dan State R-2 (Saksi TPS 018). |
| **Pengajuan Pengunduran Diri Anggota** | `requestMembershipResignation(payload)` | Memutasi status membership ke `resignation_requested`, memeriksa tugas aktif, dan mengirim reminder administrasi. |
| **Batal Pengunduran Diri Anggota** | `cancelMembershipResignation()` | Memulihkan status ke `active`. |
| **Jeda Sementara Relawan** | `setVolunteerPause(payload)` | Mengatur status volunteer ke `paused` atau kembali ke `active`. |
| **Berhenti Menjadi Relawan** | `stopVolunteer(payload)` | Mengatur status volunteer ke `inactive` dengan preservasi total riwayat kontribusi. |
| **Penyelesaian Bimtek Saksi BSN** | `completeAcademyModule(moduleId)` | Menuntaskan progres diklat 100%, menerbitkan nomor SK Mandat, mengirim notifikasi kelulusan, dan meng-unlock peran Saksi TPS. |
| **Presensi GPS Saksi TPS** | `checkInWitness(witnessId, override)` | Mencatat jam & lokasi bilik TPS, menandai task `TSK-01` tuntas, dan memasukkan transaksi ke antrean offline. |
| **Presensi Posko / Kegiatan** | `checkInPosko(name)` / `checkInEvent(id)` | Menambah statistik kehadiran relawan dan mencatat log kehadiran. |
| **Kirim Formulir C1 Plano** | `submitTpsReport(tpsId, payload)` | Memperbarui perolehan suara TPS, menandai task `TSK-04`, dan mengantrekan payload ke `addToOfflineQueue`. |
| **Lapor Insiden Darurat (SOS)** | `addEmergencyReport(report)` | Mendaftarkan tiket insiden berkode `EMG-xxx` ke antrean pelaporan. |
| **Ambil / Lepas Tugas Bursa** | `joinOpportunity(oppId)` | Menyesuaikan kuota relawan dan otomatis mensinkronkan item ke "Tugas Saya". |
| **Penerbitan e-KTA Baru** | `upgradeToMember(ktaNumber, details)` | Mengubah status membership non-kader menjadi `MEMBER` aktif ber-KTA. |

### 2.3 Standar Perluasan `AppContext`
Jika terdapat penambahan fitur baru yang membutuhkan state persisten:
1. Perbarui definisi interface di `src/types/index.ts` terlebih dahulu.
2. Tambahkan state dan action method di `AppContext.tsx`.
3. Daftarkan method ke interface `AppContextValue` dan array dependensi `useMemo`.
4. Pastikan data transaksi kritis dibungkus dengan `addToOfflineQueue()`.

---

## 3. Kepatuhan State Akun & Model 7 Dimensi Terkoordinasi

Sistem **TIDAK MENGGUNAKAN** enum peran tunggal flat (`role = 'ANGGOTA'`), melainkan **Model 7 Dimensi Terkoordinasi**:

### 3.1 Struktur 7 Dimensi Identitas (`currentUser.dimensions`)
1. **`membership` (Keanggotaan Partai)**:
   - Nilai: `'pending' | 'verified' | 'active' | 'inactive' | 'resignation_requested' | 'ended' | 'suspended'`
   - Menentukan keabsahan kartu e-KTA simPAN dan status legalitas kader di Mahkamah Partai.
2. **`kader` (Perkaderan Formal Sesuai AD/ART PAN)**:
   - Nilai: `'non_kader' | 'calon_kader' | 'kader_aktif'`
   - Menentukan kelulusan jenjang LKK (Latihan Kader Kepemimpinan) di Amanat Academy.
3. **`position` (Hierarki Struktur & Scope Teritorial)**:
   - Bidang: `position` ('NONE' | 'PENGURUS' | 'KOORDINATOR' | 'FUNGSIONAR' | 'ANGGOTA_LEGISLATIF'), `level` ('DPP' | 'DPW' | 'DPD' | 'DPC' | 'DPRT'), `region`, `roleTitle`, `skNumber`.
   - Mengunci hak supervisi wilayah sesuai batas teritorial mandatnya.
4. **`electoral` (Siklus Pencalegan Pemilu / Pilkada)**:
   - Bidang: `status` ('NONE' | 'BACALEG' | 'CALEG' | 'TERPILIH' | 'ANGGOTA_LEGISLATIF'), `electionYear`, `legislativeLevel`, `dapil`.
   - Menentukan pembukaan fitur monitoring elektoral KPPN dan tabulasi Dapil.
5. **`volunteer` (Partisipasi Kerelawanan)**:
   - Nilai: `'none' | 'pending' | 'active' | 'paused' | 'inactive'`
   - Mengatur akses bursa tugas posko lapangan dan sapa warga.
6. **`programs` (Ekosistem Pengembangan Khusus)**:
   - `amanatAcademy`: `'NONE' | 'ENROLLED' | 'ACTIVE' | 'GRADUATED'`
   - `pandawa`: `'NONE' | 'REGISTERED' | 'SELECTED' | 'TRAINING' | 'ACTIVE' | 'COMPLETED'`
   - `programSaksi`: `'NONE' | 'TRAINING' | 'CERTIFIED' | 'MANDATED'` (+ `skMandatNumber`, `saksiProgress`)
7. **`operationalRole` (Peran Taktis Lapangan yang Sedang Aktif)**:
   - Nilai: `'MEMBER' | 'VOLUNTEER' | 'WITNESS' | 'TPS_COORDINATOR' | 'FIELD_COORDINATOR' | 'CALEG_OPS'`
   - Mengontrol tampilan Beranda dan tombol Quick Menu secara langsung.

### 3.2 Arsitektur 2 Akun Komplementer Resmi
Aplikasi dibangun untuk melayani 2 profil pengguna nyata yang saling melengkapi:

| Parameter | 👤 Akun 1: Ahmad Fauzan (Kader Resmi) | 🤝 Akun 2: Siti Rahmawati (Relawan Murni) |
| :--- | :--- | :--- |
| **Email Login** | `ahmad.fauzan@pan.go.id` | `siti.rahmawati@relawanpan.id` |
| **Status Keanggotaan** | `membership: 'active'` (Ber-KTA simPAN Resmi) | `membership: 'pending'` / `'none'` (Bukan Anggota) |
| **Identitas Digital** | **e-KTA simPAN Resmi** (`PAN-3273-2024-00892`) | **Digital ID Relawan Simpatisan** (`REL-3273-2024-0042`) |
| **Perpindahan Akun** | Dilakukan via fitur **Login Cepat (`QuickLoginPicker`) di `LoginScreen.tsx`**. |
| **Tombol "Ganti Mode" Profil** | Memuat **6 State Presets Karir Fungsionaris** (`state_1` s.d. `state_6`). | Memuat **2 State Transisi Relawan** (`state_r1` Posko vs `state_r2` Saksi TPS 018). |
| **Fitur Kelola Status** | Pengajuan Pengunduran Diri Anggota + Jeda/Berhenti Relawan. | HANYA opsi Jeda / Berhenti Relawan. Tidak ada menu resign anggota. |

### 3.3 Gamified Level-Unlock (4 Prasyarat Resmi BSN Saksi TPS)
Peralihan ke peran `WITNESS` (Saksi TPS) **WAJIB** melalui verifikasi `checkRoleEligibility()` di `src/utils/roleUnlockRules.ts`:
1. **Syarat 1:** e-KTA simPAN Terverifikasi atau ID Relawan Terdaftar (`req_kta`).
2. **Syarat 2:** Kelulusan Diklat Pelatihan Saksi Amanat Academy 100% (`req_bimtek`).
3. **Syarat 3:** SK Mandat Resmi Penugasan TPS dari DPD/DPW (`req_mandat`).
4. **Syarat 4:** Pakta Integritas Saksi Digital bertanda tangan (`req_pact`).

> **PANTANGAN KERAS:** Dilarang meng-hardcode pembukaan peran Saksi TPS jika prasyarat di atas belum terpenuhi. Tampilkan kartu peran terkunci (*Gamified Locked Card*) dengan meteran progres (misal: "3 dari 4 syarat terpenuhi") dan tombol Call-To-Action (CTA) langsung menuju modul pemenuhannya.

### 3.4 Tata Kelola Status & Anti Hard-Delete (*Never Delete User Hard*)
Modul **"Kelola Status Saya"** (`KelolaStatusScreen.tsx`) wajib mematuhi aturan perlindungan data:
- **Zero Data Loss:** Pengunduran diri kader atau penonaktifan relawan **TIDAK BOLEH MENGHAPUS AKUN** dari database (*soft-status lifecycle only*).
- **Prosedur Administrasi Keanggotaan:** Pengunduran diri anggota tidak boleh langsung berstatus `ended`, melainkan bergeser ke `resignation_requested` untuk verifikasi administratif DPD/DPP. e-KTA digital diberi watermark transparan *"Dalam Proses Pengunduran Diri"*.
- **Active Task & Assignment Guard:** Saat relawan menekan berhenti, sistem wajib memeriksa apakah ada tugas berjalan (`tasks` in_progress) atau kegiatan terdaftar. Tampilkan konfirmasi pengalihan tugas ke Koordinator Lapangan sebelum status berubah ke `inactive`.
- **Preservasi Portofolio:** Seluruh riwayat presensi, sertifikat kelulusan Bimtek, dan piagam penghargaan masa lalu **tetap tersimpan utuh** dan dapat dilihat di profil sebagai rekam jejak kontribusi.

---

## 4. Full Frontend Implementation dengan State Dinamis

Aplikasi beroperasi secara mandiri di sisi klien (*standalone dynamic client*) untuk demonstrasi dan evaluasi eksekutif tanpa ketergantungan server backend.

### 4.1 Pantangan "Dead-End UI" (UI Palsu / Statis)
- **DILARANG** menaruh tombol mati, dummy text yang tidak merespon saat disentuh, atau link dengan `onPress={() => {}}`.
- Setiap sentuhan pengguna harus menghasilkan perubahan state yang nyata dan teramati:
  - Tombol **RSVP Kegiatan**: Memutasi state `events`, mengubah teks tombol menjadi "Batal Ikut", memperbarui badge kuota, dan menambah agenda ke Beranda.
  - Tombol **Presensi GPS**: Mengambil geolokasi perangkat (atau simulasi koordinat radius 50m TPS), mencatat timestamp `WIB`, mengubah status kehadiran saksi menjadi `checked_in`, dan menyelesaikan tugas terkait di tab Tugas.
  - Tombol **Entri C1 Plano**: Menyimpan angka perolehan suara partai dan calon legislatif ke dalam state `tps`, memperbarui status menjadi `done`, dan menandai task `TSK-04`.
  - Tombol **Selesaikan Modul Saksi**: Memanggil `completeAcademyModule()`, memicu notifikasi kelulusan resmi, menerbitkan nomor SK Mandat, dan otomatis meng-unlock peran Saksi TPS.
  - Tombol **Ambil Tugas Bursa**: Menambahkan tugas tersebut ke dalam daftar "Tugas Saya" di tab Tugas.

### 4.2 Simulasi Offline Queue & Sinkronisasi (`src/utils/offlineQueue.ts`)
- Setiap transaksi operasional lapangan (presensi kehadiran, laporan C1 Plano, tiket darurat SOS) **WAJIB** disimpan ke antrean offline lokal melalui:
  ```tsx
  await addToOfflineQueue('check_in' | 'c1_report' | 'emergency_report', payload);
  ```
- Indikator konektivitas (`isOnline`) dan jumlah antrean sinkronisasi (`unsyncedQueueCount`) harus ditampilkan di header atau bar status saat offline.
- Saat jaringan pulih (*online*), transaksi harus otomatis ter-flush ke rekapitulasi data.

---

## 5. Role-Based Access Control (RBAC): "Suatu Menu Itu Untuk Siapa"

Aplikasi mobile adalah alat kerja taktis lapangan. Setiap pengguna hanya boleh melihat menu yang menjadi wewenang dan tugas aktifnya.

### 5.1 Pemisahan Tegas: Mobile App vs Web Command Center
Sesuai Bab 1 & 3 dokumen `AGENTS.md`:

```
┌──────────────────────────────────────────┐      ┌──────────────────────────────────────────┐
│             MOBILE APP                   │      │           WEB COMMAND CENTER             │
│        (Digital Field App)               │      │      (Back Office & Governance)          │
├──────────────────────────────────────────┤      ├──────────────────────────────────────────┤
│ • Identitas Digital (e-KTA / ID Relawan) │      │ • Master Data Struktur & Wilayah TPS     │
│ • Presensi GPS Bilik & Kegiatan          │      │ • Verifikasi Dokumen & Approval Relawan  │
│ • Input Formulir C1 Plano & Bukti Foto   │      │ • Penugasan Saksi & Penetapan SK Mandat  │
│ • Pelaporan Insiden Lapangan (SOS)       │      │ • Approval & Verifikasi Akhir Laporan C1 │
│ • Pembelajaran Diklat di Amanat Academy  │      │ • Triase Insiden & Eskalasi Hukum        │
│ • Monitoring Ringkas Wilayah Koordinator │      │ • Dashboard Analitik, Peta Nasional, GIS │
│ • Bursa Tugas Posko Lapangan             │      │ • Konfigurasi Hak Akses, Role, & Audit   │
└──────────────────────────────────────────┘      └──────────────────────────────────────────┘
```

> **PANTANGAN ARSITEKTUR:** Jangan memindahkan fungsi back-office web ke dalam mobile app! Fitur seperti manipulasi master TPS nasional, pengesahan hukum laporan sengketa pemilu, konfigurasi permission sistem, dan bulk assignment saksi adalah domain mutlak Web Command Center.

### 5.2 Matriks Hak Akses Screen Resmi (Screen RBAC Matrix)
Penyaringan menu pada `ProfileScreen.tsx` (`roleAccessibleItems`) dan `DashboardScreen.tsx` (`getQuickMenuItems`) **WAJIB TUNDUK** pada matriks berikut:

| ID Layanan / Screen | Nama Fitur | VOLUNTEER (R1) | VOLUNTEER (R2) | WITNESS | COORDINATOR | MEMBER | CALEG_OPS | Lokasi Akses Resmi |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| `Dashboard` | Beranda Terpersonalisasi | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | Tab 1 Bottom Bar |
| `Tasks` | Bursa Tugas & Tugas Saya | ✔️ | ✔️ | ❌ | ❌ | ❌ | ❌ | Tab 2 Bottom Bar *(Khusus Relawan)* |
| `Activities` | Agenda Kegiatan & Baksos | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | Tab 3 Bottom Bar |
| `AmanatAcademy` | Hub Amanat Academy | ✔️ | ✔️ | ❌ | ❌ | ✔️ | ✔️ | Tab 4 Bottom Bar |
| `Profile` | Profil & Direktori Layanan| ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | Tab 5 Bottom Bar |
| `CheckIn` | Presensi GPS Bilik TPS | ❌ | ✔️ *(Hari-H)*| ✔️ *(Hari-H)*| ❌ | ❌ | ❌ | Quick Menu Saksi TPS |
| `C1Ocr` | Scan AI Vision C1 Plano | ❌ *(Terkunci)*| ✔️ *(Mandat)*| ✔️ | ❌ | ❌ | ❌ | Quick Menu & Grid Saksi |
| `ReportForm` | Formulir Entri C1 Plano | ❌ *(Terkunci)*| ✔️ *(Mandat)*| ✔️ | ❌ | ❌ | ❌ | Grid Saksi TPS |
| `TpsDetail` | Detail TPS & Data DPT | ❌ *(Terkunci)*| ✔️ | ✔️ | ✔️ *(Kluster)*| ❌ | ❌ | Grid Saksi & Supervisi |
| `AssignmentLetter`| E-Mandat Saksi KPU | ❌ *(Terkunci)*| ✔️ | ✔️ | ❌ | ❌ | ❌ | Grid Saksi & Card Beranda |
| `WitnessAcademy` | Diklat & Ujian Bimtek BSN | ❌ *(Terkunci)*| ✔️ | ✔️ | ❌ | ❌ | ❌ | Grid Saksi TPS |
| `EmergencyForm` | Lapor Insiden SOS Darurat| ❌ | ✔️ | ✔️ | ✔️ | ❌ | ❌ | Quick Menu Saksi & Korlap |
| `Supervision` | Radar Supervisi 15 TPS | ❌ | ❌ | ❌ | ✔️ | ❌ | ❌ | Quick Menu Korlap |
| `WitnessList` | Daftar Saksi Binaan | ❌ | ❌ | ❌ | ✔️ | ❌ | ❌ | Card Metrik Korlap |
| `VerifyLetter` | Validasi Barcode Mandat | ❌ | ❌ | ❌ | ✔️ | ❌ | ❌ | Grid Korlap |
| `SimpanKta` | Kartu e-KTA Digital | ❌ *(Ajukan)* | ❌ *(Ajukan)* | ❌ *(Ajukan)* | ❌ *(Ajukan)* | ✔️ | ✔️ | Grid Profil Kader |
| `SimpanStructure`| Struktur Kepengurusan | ❌ | ❌ | ❌ | ❌ | ✔️ | ✔️ | Quick Menu & Grid Kader |
| `SimpanBacaleg` | Registrasi & Berkas Caleg| ❌ | ❌ | ❌ | ❌ | ✔️ | ✔️ | Grid Profil Kader/Caleg |
| `PartyRoster` | Fraksi Anggota Legislatif | ❌ | ❌ | ❌ | ❌ | ✔️ | ✔️ | Grid Profil Kader/Caleg |
| `QuickCountGame` | Tabulasi Real Count Dapil| ❌ | ❌ | ❌ | ❌ | ❌ | ✔️ | Quick Menu & Grid Caleg |
| `MapSebaran...` | Peta Sebaran Relawan GIS | ✔️ | ✔️ | ❌ | ✔️ | ✔️ | ✔️ | Quick Menu & Grid |
| `PandawaProgram` | Satgas Muda PANdawa | ✔️ | ✔️ | ❌ | ❌ | ✔️ | ❌ | Grid Edukasi |
| `SimpanOffices` | Kantor Sekretariat DPD | ✔️ | ✔️ | ❌ | ✔️ | ✔️ | ❌ | Grid Organisasi |
| `TransparencyHub`| Transparansi & Akuntabilitas| ✔️| ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | Grid Organisasi (Semua) |
| `Broadcast` | Maklumat & Saluran Komando| ✔️| ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | Quick Menu Slot 4 (Semua) |

### 5.3 Proteksi Middleware Navigasi (`RoleGuardWrapper.tsx`)
Setiap route sensitif pada `src/navigation/DetailStack.tsx` harus dibungkus dengan komponen guard:
```tsx
<Stack.Screen name="C1Ocr">
  {(props) => (
    <RoleGuardWrapper allowedRoles={['WITNESS', 'VOLUNTEER']} requireWitnessMandate>
      <C1OcrScreen {...props} />
    </RoleGuardWrapper>
  )}
</Stack.Screen>
```
Jika pengguna mencoba mengakses rute di luar haknya (misal melalui deep link), sistem harus mencegat dan menampilkan dialog edukasi pemenuhan syarat, bukan merender layar kosong atau melempar crash.

---

## 6. Kaidah Emas Nol Duplikasi Navigasi & Elemen UI (Zero Redundancy)

Duplikasi akses, tombol kembar yang berdekatan, dan pengulangan teks adalah musuh utama estetika dan kejelasan UX.

### 6.1 Arsitektur Navigasi Tri-Layer
Sistem antarmuka dibagi menjadi 3 lapis peran yang **TIDAK BOLEH SALING TUMPANG TINDIH**:
1. **Lapis 1: Bottom Navigation Bar (Pilar Utama Aplikasi)**:
   `[ BERANDA ]  •  [ PRESENSI GPS ]  •  [ PROFIL ]` (atau tab dinamis sesuai konfigurasi).
2. **Lapis 2: Beranda (`DashboardScreen.tsx`)**:
   Dikhususkan untuk **Aksi Operasional Cepat Hari-H & Tugas Lapangan**:
   - Header salam & status peran aktif.
   - **Quick Menu Adaptif Fleksibel**:
     - *Mode 2 Seksi Berimbang:* Diterapkan saat peran memiliki modul aksi taktis lapangan yang kaya (misal: Saksi TPS Hari-H, Koordinator 15 TPS, Caleg Dapil).
     - *Mode 1 Baris Ringkas (Tepat 4 Tombol):* Diterapkan saat peran tidak memiliki aksi taktis berlebih atau untuk mencegah kehabisan menu taktis tanpa memaksakan menu statis/kembar (seperti pada **Relawan Murni State R-1 Siti Rahmawati** dan **Anggota Pemula Level 0 Ahmad Fauzan**).
   - Kartu penugasan kontekstual (hanya muncul saat ada tugas aktif).
   - Ticker maklumat resmi partai (bukan card list berita berulang).
3. **Lapis 3: Profil & Direktori Layanan (`ProfileScreen.tsx`)**:
   Dikhususkan untuk **Portofolio Identitas & Direktori Lengkap Partai**:
   - Kartu e-KTA / Digital ID & Rekam Jejak Aktivitas.
   - **Direktori Organisasi & Informasi Statis Partai**: Menjadi rumah bagi menu referensi kepartaian statis (Struktur Pengurus DPD, Fraksi DPR RI Parlemen, Pendaftaran Bacaleg KPPN, Kantor Sekretariat, Transparansi WTP) sehingga tidak mengotori Beranda.
   - **Layanan & Pengaturan**: Tata kelola status akun, legalitas SK, keamanan PIN, dan pusat bantuan.

### 6.2 Kaidah Emas Anti-Duplikasi:
1. **Aturan 1 (Tab Exclusivity):** Modul yang telah memiliki tab permanen di Bottom Bar (seperti *Presensi GPS* atau *Bursa Tugas*) **DILARANG KERAS** dijadikan item generic di Quick Menu Beranda atau icon Grid Profil.
2. **Aturan 2 (Static vs Operational Separation):** Menu yang bersifat informasi statis atau direktori kepartaian (seperti Struktur DPD, Fraksi Parlemen, Bacaleg) **DITEMPATKAN DI PROFIL**, bukan di Quick Menu Beranda. Jangan menaruh menu statis di Beranda hanya untuk memenuhi kuota tombol.
3. **Aturan 3 (Card vs Menu Exclusivity):** Modul yang telah memiliki representasi kartu utuh di Beranda (seperti Card *Agenda Kegiatan Terdekat*) **DILARANG KERAS** dibuatkan tombol kembar di Quick Menu pada layar yang sama.
4. **Aturan 4 (Single Distinct Access Path):** Pada satu layar atau viewport, **DILARANG MENAMPILKAN DUA TOMBOL BERBEDA YANG MENUJU KE SCREEN YANG SAMA**.
5. **Aturan 5 (Zero Text & News Duplication):** Gunakan format **Ticker Berita Ringkas** di Beranda, hindari pengulangan kartu berita panjang.

### 6.3 Prinsip Fleksibilitas Adaptif Quick Menu Beranda
Quick Menu di `DashboardScreen.tsx` bersifat adaptif terhadap ketersediaan aksi operasional peran aktif:

| Kondisi Peran / Jenjang | Format Quick Menu | Komposisi Menu Utama |
| :--- | :--- | :--- |
| **Relawan Murni (State R-1 Siti)** | **1 Baris Ringkas (4 Tombol)** | **Bursa Tugas** • **Amanat Academy** • **Sebaran Relawan** • **Saluran Relawan** |
| **Anggota Pemula (Level 0 Fauzan)** | **1 Baris Ringkas (4 Tombol)** | **Peta Basis GIS** • **Amanat Academy** • **Serap Aspirasi** • **Portofolio Kader** |
| **Kader & Satgas (Level 1 Fauzan)** | **2 Seksi Berimbang** | *Operasional:* **Satgas PANdawa** • **Diklat Saksi BSN** • **Tugas Lapangan** • **Lapor Insiden**<br/>*Layanan Utama:* **Peta GIS** • **Aspirasi** • **Akademi** • **Broadcast** |
| **Relawan Mandat / Saksi TPS** | **2 Seksi Berimbang** | *Operasional:* **Scan C1 AI** • **Tally Bilik** • **Lapor SOS** • **Bukti Foto**<br/>*Layanan Utama:* **Peta Wilayah** • **Aspirasi** • **Akademi** • **Broadcast** |
| **Koordinator Lapangan (Korlap)** | **2 Seksi Berimbang** | *Operasional:* **Supervisi 15 TPS** • **Validasi Mandat** • **Lapor Insiden** • **Radar Insiden**<br/>*Layanan Utama:* **Peta Wilayah** • **Aspirasi** • **Akademi** • **Broadcast** |
| **Calon Legislatif (CALEG_OPS)** | **2 Seksi Berimbang** | *Operasional:* **Real Count Kursi** • **Audit Berkas KPPN** • **Suara Warga** • **Broadcast Timses**<br/>*Layanan Utama:* **Peta Basis Dapil** • **Aspirasi** • **Akademi** • **Broadcast** |

> [!NOTE]
> **Kaidah Penyatuan Baris (Graceful Collapse):** Jika sebuah peran/state kehabisan opsi menu operasional harian yang murni dan valid, sistem **WAJIB menyatukan Quick Menu menjadi 1 baris tunggal tepat 4 tombol**, tanpa memaksakan menu statis atau tombol duplikat.

---

## 7. Profesionalitas UI/UX & Standar Desain Eksekutif

Aplikasi dipersembahkan untuk pemangku kepentingan tertinggi partai (Ketum, Sekjen, Pimpinan DPP, Caleg) serta digunakan oleh berbagai lapisan usia di lapangan.

### 7.1 Kaidah One Primary Action per Screen
Setiap screen utama harus memiliki satu fokus aksi primer yang jelas:
- Layar Saksi Hari-H $\rightarrow$ Fokus ke **CHECK-IN TPS** atau **UNGGAH C1 PLANO**.
- Layar Pendaftaran $\rightarrow$ Fokus ke **KIRIM PENGAJUAN**.
- Layar Insiden $\rightarrow$ Fokus ke **KIRIM LAPORAN SOS**.
Hindari menjejalkan lebih dari satu tombol berbobot visual setara yang membingungkan pengguna.

### 7.2 Aksesibilitas Ramah Pengguna Senior (Boomer & Saksi Senior Friendly)
- **Ukuran Area Sentuh Minimal (Touch Target):** Seluruh elemen yang dapat diklik (`TouchableOpacity`, `Pressable`) harus memiliki area sentuh minimal **$44 \times 44\text{ pt}$**.
- **Tipografi Bersih:** Gunakan font Poppins / Sans-Serif sistem dengan kontras tinggi terhadap latar belakang.
  - Body Text: Minimum `13-14 pt`.
  - Subtitle / Label: Minimum `11-12 pt` dengan `font-weight: 500` atau `600`.
  - Screen Header: `16-18 pt` (`bold`).
- **Pesan Error yang Solutif (Actionable Feedback):** Dilarang keras menampilkan alert generik seperti *"Terjadi kesalahan"* atau *"Input salah"*. Berikan penjelasan sebab dan solusi konkrit:
  - *Benar:* `"Lokasi Anda terdeteksi 85m di luar area TPS 014. Silakan mendekat ke TPS atau gunakan opsi Catatan Toleransi Lokasi."`

### 7.3 Palet Warna Resmi Partai Amanat Nasional
Konsistensi warna partai mencerminkan identitas korporat yang kokoh:
```typescript
export const PAN_COLORS = {
  primaryBlue: '#0066B3',    // Biru PAN Utama
  navyDark: '#002B52',       // Biru Tua / Header Eksekutif
  redAccent: '#E60012',      // Merah Matahari / Badge Urgent
  white: '#FFFFFF',
  backgroundLight: '#F4F6F9',// Background Abu Bersih
  borderNeutral: '#E2E8F0',  // Border Kartu
  textPrimary: '#0F172A',    // Teks Gelap
  textSecondary: '#64748B',  // Teks Keterangan
  success: '#10B981',        // Status Lolos / Selesai
  warning: '#F59E0B',        // Status Menunggu / In-Progress
};
```

---

## 8. Kebijakan Nol Emoji (*Zero Emoji Policy*) & Higienitas Ikon

Visual aplikasi harus mencerminkan platform partai profesional kelas dunia, bukan aplikasi hobi informal.

### 8.1 Aturan Wajib: ZERO EMOJI POLICY
- **DILARANG KERAS** menggunakan karakter emoji Unicode (seperti `⭐`, `📋`, `🎓`, `🏛️`, `📍`, `🚩`, `🇮🇩`, `🏆`, `🔒`, `✓`, `▲`, `▼`, dll.) pada string teks, judul kartu, tombol, badge, maupun kode program!
- Seluruh kebutuhan simbol, visualisasi status, dan indikator grafis **100% WAJIB MENGGUNAKAN VECTOR ICON** (`@expo/vector-icons`, diutamakan keluarga `Feather` atau `Ionicons`) atau `react-native-svg`.

### 8.2 Higienitas & Tujuan Kognitif Ikon
- Ikon hanya digunakan jika memiliki **tujuan bantuan kognitif yang jelas** (membantu pengguna memahami aksi lebih cepat daripada membaca teks).
- **DILARANG** menaburkan ikon dekoratif acak tanpa fungsi informatif.
- Standardisasi ukuran ikon:
  - Micro / Inline Badge: `12px` s.d. `14px`
  - List Item Trailing Icon: `16px` s.d. `18px`
  - Button Action: `18px` s.d. `20px`
  - Quick Menu & Grid Service: `22px` s.d. `24px`
  - Hero Header / Empty State: `32px` s.d. `48px`

---

## 9. Prinsip Keep It Simple (KISS) dalam Pengkodean

Kecanggihan kode diukur dari kesederhanaan, keterbacaan, dan kestabilannya, bukan kerumitan sintaksnya.

1. **Hindari Over-Engineering:** Jangan membuat lapisan abstraksi berulang-ulang jika fungsi sederhana sudah mencukupi. Gunakan TypeScript murni dan pola React yang lugas.
2. **Prioritaskan Smart Input:** Di lapangan, pengguna tidak punya waktu mengetik panjang. Prioritaskan penggunaan:
   - Dropdown pilihan terstruktur.
   - GPS Auto-Detection & Geofencing.
   - Kamera & Scanner Dokumen.
   - QR Code Pass.
   - Autofill identitas dari `currentUser`.
3. **Defensive Typing:** Manfaatkan interface dari `src/types/index.ts`. Dilarang menggunakan tipe `any` jika tipe data resminya sudah tersedia.
4. **Komponen Modular:** Pecah file screen besar menjadi sub-komponen terisolasi jika kompleksitas visual meningkat, dengan tetap mempertahankan single source of truth di `AppContext`.

---

## 10. Checklist Kepatuhan Sebelum Selesai Pengkodean (Verification Checklist)

Sebelum menandai tugas pengkodean selesai (*done*), AI Agent dan developer wajib memvalidasi daftar periksa ini:

- [ ] **State Compliance:** Seluruh data akun, peran, dan transaksi dikonsumsi dari `useApp()` di `AppContext.tsx`. Tidak ada state lokal liar.
- [ ] **Action Integrity:** Setiap tombol pada UI memiliki handler yang mengeksekusi mutasi state reaktif nyata (tidak ada dead-end `onPress`).
- [ ] **7-Dimension Check:** Status keanggotaan, perkaderan, jabatan, elektoral, relawan, program, dan operational role tersinkronisasi tanpa kontradiksi.
- [ ] **RBAC Verification:** Fitur saksi/korlap/caleg tidak bocor ke relawan murni, dan pendaftaran KTA tidak muncul untuk anggota resmi.
- [ ] **Zero Redundancy Audit:** Tidak ada tombol kembar yang mengarah ke screen yang sama pada satu layar. Grid dan List Profil bebas dari item yang tumpang tindih. Quick Menu tepat 4 tombol.
- [ ] **Zero Emoji Audit:** Bebas 100% dari karakter emoji Unicode di seluruh file kode yang diubah/dibuat.
- [ ] **Touch & Contrast Check:** Area sentuh tombol minimal $44\text{ pt}$ dan kontras teks tajam sesuai palet warna resmi PAN.
- [ ] **TypeScript Check:** Tidak ada type error, syntax error, atau broken import path.

---
*Aturan ini mengikat seluruh pengembangan repositori `360-mobile`. Setiap pelanggaran terhadap aturan kepatuhan ini wajib segera diperbaiki sebelum integrasi kode.*
