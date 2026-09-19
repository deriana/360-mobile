# SAKSI 360 / PAN DIGITAL
## Rancangan Role Sistem dan Konteks Penggunaan Aplikasi Mobile
### Fokus: Anggota, Relawan, Saksi TPS, dan Koordinator Lapangan

**Dokumen:** Functional & Role Blueprint  
**Versi:** 1.0  
**Tanggal:** 17 September 2026  
**Status:** Draft untuk Product, UI/UX, Backend, Security, dan Command Center

---

## 1. Ringkasan Eksekutif

SAKSI 360 dirancang sebagai bagian dari ekosistem digital PAN dengan dua kanal utama:

1. **Mobile App** — digunakan oleh orang yang melakukan aktivitas langsung: anggota, relawan, saksi TPS, dan koordinator lapangan.
2. **Web Command Center** — digunakan oleh operator dan pimpinan untuk administrasi, verifikasi, penugasan, monitoring, analitik, konfigurasi, dan audit.

Prinsip utamanya:

> **Mobile = melakukan aktivitas.**  
> **Web = mengelola dan mengawasi aktivitas.**

Aplikasi mobile tidak perlu menjadi salinan dashboard web. Mobile harus ringan, task-oriented, mudah digunakan di lapangan, dan menampilkan hanya fungsi yang relevan dengan role pengguna.

Model akses yang direkomendasikan adalah:

> **1 User → banyak Role → setiap Role memiliki Scope → setiap Scope memiliki Permission**

Dengan model ini satu orang dapat, misalnya, menjadi:

- anggota,
- relawan,
- saksi TPS,
- sekaligus koordinator,

tanpa membuat akun baru.

---

# 2. Tujuan Dokumen

Dokumen ini menjadi acuan untuk:

- menentukan siapa yang menggunakan mobile app;
- menentukan role yang dikenal sistem;
- menentukan hak akses tiap role;
- membedakan role, status, scope, dan permission;
- menentukan konteks penggunaan mobile;
- menentukan bagian yang harus dikelola melalui Web Command Center;
- menyusun navigation dan fitur mobile;
- menjadi dasar BRD/SRS;
- menjadi dasar desain UI/UX;
- menjadi dasar desain API dan database;
- menjadi dasar pengujian access control.

---

# 3. Konteks Produk

## 3.1 Mobile App

Mobile App berfungsi sebagai **Digital Field & Member App**.

Fungsi utamanya:

- identitas digital;
- aktivitas anggota;
- aktivitas relawan;
- kegiatan dan event;
- pelatihan;
- penugasan;
- check-in;
- operasional saksi;
- pelaporan lapangan;
- upload bukti;
- laporan insiden;
- komunikasi/notifikasi;
- melihat status tugas;
- melihat riwayat aktivitas.

Mobile digunakan terutama ketika pengguna berada:

- di rumah;
- di perjalanan;
- di kegiatan organisasi;
- di lokasi pelatihan;
- di lapangan;
- di TPS;
- pada lokasi penugasan.

---

## 3.2 Web Command Center

Web menjadi **Back Office, Command Center, dan Administration Console**.

Fungsi utamanya:

- pengelolaan master data;
- pengelolaan struktur organisasi;
- verifikasi anggota/relawan;
- pengelolaan TPS;
- penempatan saksi;
- pengelolaan koordinator;
- validasi laporan;
- review dokumen;
- monitoring real-time;
- incident management;
- broadcast;
- dashboard;
- analytics;
- audit log;
- konfigurasi permission;
- pengelolaan sistem.

### Prinsip pembagian

| Aktivitas | Mobile | Web |
|---|---|---|
| Melihat profil sendiri | ✅ | ✅ |
| Mengubah data diri tertentu | ✅ | ✅ |
| Verifikasi identitas | Terbatas | ✅ |
| Pendaftaran relawan | ✅ | ✅ |
| Approval relawan | ❌ | ✅ |
| Daftar kegiatan | ✅ | ✅ |
| Check-in kegiatan | ✅ | Monitoring |
| Pelatihan | ✅ | Kelola |
| Penugasan saksi | Lihat/terima | ✅ |
| Check-in TPS | ✅ | Monitoring |
| Input laporan TPS | ✅ | Review |
| Upload bukti | ✅ | Review |
| Verifikasi laporan | ❌ | ✅ |
| Incident report | ✅ | Investigasi/tindak lanjut |
| Dashboard nasional | Ringkas | ✅ |
| Konfigurasi role/permission | ❌ | ✅ |
| Audit log | Tidak | ✅ |

---

# 4. Model Identitas Sistem

Jangan menggunakan satu field `role` sederhana.

Model data perlu membedakan minimal lima konsep:

## 4.1 User Identity

Menjawab:

> Siapa orang tersebut?

Contoh:

- user_id
- nama
- nomor HP
- email
- foto
- tanggal lahir bila memang diperlukan
- status akun

---

## 4.2 Membership / Affiliation

Menjawab:

> Apa hubungan orang tersebut dengan organisasi?

Contoh:

- Member
- Non-member volunteer

Status membership:

- pending
- verified
- active
- inactive
- suspended

---

## 4.3 Operational Role

Menjawab:

> Saat ini orang tersebut melakukan fungsi apa?

Contoh:

- Volunteer
- Witness
- TPS Coordinator
- Field Coordinator
- Trainer
- Verifier
- Operator

Satu user dapat memiliki banyak operational role.

---

## 4.4 Organizational Scope

Menjawab:

> Wilayah/organisasi mana yang boleh dia akses?

Contoh:

- nasional;
- provinsi;
- kabupaten/kota;
- kecamatan;
- desa/kelurahan;
- TPS.

Contoh:

`role = Regional Admin`

tetapi:

`scope = DPW Jawa Barat`

Artinya admin tersebut tidak otomatis memiliki akses nasional.

---

## 4.5 Permission

Menjawab:

> Apa yang boleh dilakukan oleh user?

Contoh:

- `view_own_profile`
- `edit_own_profile`
- `view_assigned_task`
- `checkin_activity`
- `checkin_tps`
- `submit_witness_report`
- `upload_evidence`
- `manage_assigned_witness`
- `verify_report`
- `view_regional_dashboard`
- `send_broadcast`

---

# 5. Role Mobile

Role mobile utama direkomendasikan sebagai berikut.

## 5.1 Member

### Definisi

Pengguna yang terdaftar sebagai anggota organisasi dan menggunakan aplikasi untuk aktivitas keanggotaan.

### Tujuan penggunaan

- mengakses identitas digital;
- mengikuti kegiatan;
- membaca informasi;
- mengikuti pelatihan;
- menerima notifikasi;
- melihat riwayat aktivitas;
- mengakses tugas jika kemudian diberi role tambahan.

### Fitur utama

- Home
- Digital ID
- Profil
- Kegiatan
- Academy
- Berita/Informasi
- Notifikasi
- Riwayat Aktivitas
- Aspirasi/Feedback, bila modul diaktifkan

### Akses

Member hanya dapat melihat dan mengubah data pribadi yang memang diizinkan.

---

# 5.2 Volunteer

### Definisi

Pengguna yang terdaftar sebagai relawan dan dapat menerima aktivitas/penugasan organisasi.

### Tujuan penggunaan

- mendaftarkan diri sebagai relawan;
- menentukan minat/keahlian;
- mengikuti event;
- mengikuti training;
- menerima tugas;
- melakukan check-in;
- melaporkan aktivitas;
- berkembang menjadi calon saksi atau koordinator.

### Fitur tambahan

- Volunteer Profile
- Skills/Interest
- Opportunity/Task
- Assignment
- Check-in
- Activity History
- Training
- Volunteer Certificate

---

# 5.3 Witness / Saksi TPS

### Definisi

Pengguna yang mendapatkan penugasan resmi sebagai saksi untuk TPS tertentu.

### Catatan penting

Witness bukan identitas dasar. Witness adalah **operational role** yang dapat melekat pada Member maupun Volunteer.

### Tujuan penggunaan

- melihat TPS penugasan;
- mengetahui jadwal/tugas;
- melakukan check-in;
- mengisi laporan;
- mengunggah dokumen;
- mengirim laporan insiden;
- melihat status laporan.

### Fitur utama

- My Assignment
- My TPS
- GPS/Location Check-in
- Selfie/Identity Verification
- TPS Report
- Evidence Upload
- Incident Report
- Submission Status
- Help/Escalation
- Notification

---

# 5.4 TPS Coordinator

### Definisi

Pengguna lapangan yang bertanggung jawab mengoordinasikan satu atau beberapa saksi/TPS sesuai scope yang diberikan.

### Fitur

- melihat daftar TPS dalam scope;
- melihat daftar saksi;
- melihat status penugasan;
- melihat status check-in;
- melihat status laporan;
- mengingatkan saksi;
- melakukan eskalasi;
- menerima laporan masalah;
- monitoring ringan melalui mobile.

### Batasan

Coordinator tidak otomatis boleh:

- mengubah hasil laporan;
- melakukan approval final;
- mengubah data anggota;
- mengubah konfigurasi sistem.

Tindakan tersebut tetap berada di Web Command Center dan/atau Verifier.

---

# 5.5 Field Coordinator

Role opsional untuk wilayah yang membutuhkan satu lapisan koordinasi di atas TPS Coordinator.

Fungsinya:

- monitoring beberapa koordinator;
- melihat coverage wilayah;
- menerima eskalasi;
- menyebarkan instruksi lokal;
- memantau progress.

Role ini dapat diaktifkan hanya bila struktur organisasi membutuhkannya.

---

# 6. Role Web yang Berkaitan dengan Mobile

Walaupun fokus dokumen adalah mobile, beberapa role web harus didefinisikan karena mereka menentukan apa yang muncul di mobile.

## 6.1 Operator

Mengelola operasi administrasi harian.

Contoh:

- verifikasi data;
- membuat assignment;
- memperbaiki data administratif;
- review submission.

---

## 6.2 Verifier

Memeriksa laporan yang dikirim dari mobile.

Contoh:

- review OCR;
- membandingkan input dengan bukti;
- approve;
- reject;
- meminta revisi.

---

## 6.3 Regional Admin

Mengelola data dalam scope wilayah.

Scope dapat berupa:

- nasional;
- provinsi;
- kabupaten/kota;
- kecamatan.

Role tetap sama; yang berubah adalah scope.

---

## 6.4 Executive

Pengguna pimpinan yang terutama membutuhkan:

- dashboard;
- monitoring;
- analytics;
- ringkasan status;
- alert.

Executive sebaiknya memiliki akses baca yang luas tetapi tidak otomatis memiliki hak mengubah data operasional.

---

## 6.5 System Admin

Mengelola:

- user;
- role;
- permission;
- organization;
- konfigurasi;
- integration;
- audit;
- security.

System Admin tidak seharusnya otomatis boleh mengubah data operasional tanpa kebutuhan dan audit.

---

# 7. Role vs Status vs Scope vs Permission

Ini adalah aturan desain paling penting.

## Role

**Apa perannya?**

Contoh:

`Witness`

## Status

**Bagaimana kondisi peran tersebut?**

Contoh:

`Assigned`

## Scope

**Wilayah/objek apa yang boleh dilihat?**

Contoh:

`TPS 327301010100001`

## Permission

**Apa yang boleh dilakukan?**

Contoh:

`submit_witness_report`

### Contoh lengkap

```text
User:
Andi

Roles:
Member
Volunteer
Witness

Witness Status:
Assigned

Scope:
TPS 017

Permissions:
view_assigned_tps
checkin_tps
submit_witness_report
upload_evidence
submit_incident
```

---

# 8. Matriks Role Mobile

| Capability | Member | Volunteer | Witness | TPS Coordinator | Field Coordinator |
|---|---:|---:|---:|---:|---:|
| Profil sendiri | ✅ | ✅ | ✅ | ✅ | ✅ |
| Digital ID | ✅ | ✅ | ✅ | ✅ | ✅ |
| Berita | ✅ | ✅ | ✅ | ✅ | ✅ |
| Kegiatan | ✅ | ✅ | ✅ | ✅ | ✅ |
| Check-in kegiatan | ✅ | ✅ | ✅ | ✅ | ✅ |
| Academy | ✅ | ✅ | ✅ | ✅ | ✅ |
| Daftar relawan | Opsional | ✅ | ✅ | ✅ | ✅ |
| Tugas pribadi | Opsional | ✅ | ✅ | ✅ | ✅ |
| My TPS | ❌ | Opsional | ✅ | ✅ | ✅ |
| Check-in TPS | ❌ | Opsional | ✅ | Opsional | Opsional |
| Laporan TPS | ❌ | ❌ | ✅ | ❌* | ❌* |
| Upload evidence | ❌ | Opsional | ✅ | Opsional | Opsional |
| Incident Report | ✅* | ✅* | ✅ | ✅ | ✅ |
| Lihat status saksi | ❌ | ❌ | Diri sendiri | ✅ | ✅ |
| Monitor banyak TPS | ❌ | ❌ | ❌ | ✅ | ✅ |
| Broadcast | ❌ | ❌ | ❌ | Terbatas | Terbatas |

`*` Diaktifkan sesuai kebutuhan produk dan scope.

---

# 9. Prinsip Multi-Role

Seorang user dapat memiliki kombinasi:

```text
Member
+
Volunteer
+
Witness
```

atau:

```text
Member
+
Volunteer
+
Witness
+
TPS Coordinator
```

Mobile tidak perlu membuat akun baru.

Sistem cukup menentukan:

```text
active roles
+
active assignments
+
scope
+
permissions
```

---

# 10. Role Selector pada Mobile

Untuk user yang memiliki beberapa role, mobile dapat menampilkan:

**Mode Saya**

```text
Anggota
Relawan
Saksi TPS
Koordinator
```

Contoh:

> Anda sedang menggunakan **Mode Saksi TPS**.

Perubahan mode hanya mengubah konteks UI; identitas user tetap sama.

### Alternatif yang lebih sederhana

Daripada role selector, Home dapat menampilkan kartu berdasarkan role:

```text
MY PAN ID

MY ACTIVITIES

MY VOLUNTEER TASKS

MY TPS ASSIGNMENT

MY COORDINATION
```

Untuk MVP, pendekatan kartu ini lebih sederhana dan mengurangi kebingungan.

---

# 11. Struktur Navigasi Mobile

Rekomendasi bottom navigation:

```text
HOME | KEGIATAN | TUGAS | NOTIFIKASI | PROFIL
```

Menu dinamis berada di dalam Home.

## Home

Menampilkan:

- status anggota;
- Digital ID;
- aktivitas terbaru;
- tugas aktif;
- penugasan TPS;
- training;
- pengumuman;
- quick action.

## Kegiatan

- daftar kegiatan;
- detail event;
- daftar/RSVP;
- check-in;
- riwayat.

## Tugas

- tugas aktif;
- penugasan;
- deadline;
- status;
- bukti;
- submit.

## Notifikasi

- broadcast;
- assignment;
- reminder;
- approval;
- status submission.

## Profil

- profil;
- Digital ID;
- role;
- status;
- organisasi;
- security;
- privacy;
- logout.

---

# 12. My Digital ID

Digital ID sebaiknya menampilkan:

- foto;
- nama;
- ID anggota;
- status;
- role aktif;
- wilayah;
- QR Code.

QR Code dapat digunakan untuk:

- registrasi kegiatan;
- attendance;
- validasi identitas;
- check-in;
- kebutuhan internal lain yang ditetapkan.

QR harus menggunakan token yang dapat divalidasi server, bukan menanamkan informasi sensitif secara terbuka.

---

# 13. My Assignment

Ini adalah salah satu modul terpenting.

Contoh:

```text
PENUGASAN AKTIF

Peran:
Saksi TPS

Wilayah:
Kecamatan X

TPS:
017

Tanggal:
[date]

Status:
ASSIGNED

[ DETAIL TPS ]
[ CHECK-IN ]
```

Detail assignment menampilkan hanya informasi yang diperlukan untuk menjalankan tugas.

---

# 14. Alur Saksi Mobile

## 14.1 Sebelum penugasan

```text
Volunteer/Member
        ↓
Apply / Nominated
        ↓
Verification
        ↓
Training
        ↓
Approved
```

Sebagian proses dikelola melalui web.

---

## 14.2 Penugasan

```text
Approved
    ↓
Assignment dibuat oleh Web
    ↓
Mobile menerima Notification
    ↓
Saksi membuka My Assignment
```

---

## 14.3 Check-in

```text
Open Assignment
      ↓
Check-in
      ↓
Location
      ↓
Time
      ↓
Identity verification
      ↓
Success
```

Jika gagal:

- lokasi tidak valid;
- permission lokasi tidak diberikan;
- assignment tidak aktif;
- waktu di luar window;

maka aplikasi menampilkan alasan dan jalur eskalasi.

---

# 15. Laporan TPS

Mobile menyediakan form terstruktur.

Contoh kelompok data:

### Identitas TPS

- TPS;
- wilayah;
- assignment.

### Data proses

- field-field yang memang dibutuhkan.

### Hasil

- field hasil sesuai template yang ditetapkan.

### Evidence

- foto;
- dokumen;
- media lain jika diizinkan.

Mobile harus melakukan validasi sebelum submit.

Contoh:

```text
Jika total A + B + C ≠ total yang diharapkan
→ tampilkan warning
```

Validasi tidak menggantikan verifikasi manusia.

---

# 16. AI OCR

AI OCR berada di pipeline backend/cloud, bukan sebagai decision-maker di mobile.

Flow:

```text
Mobile
  ↓
Foto dokumen
  ↓
Upload
  ↓
OCR Service
  ↓
Extracted Data
  ↓
Validation
  ↓
Human Verification
  ↓
Approved
```

Mobile hanya menampilkan hasil OCR untuk:

- preview;
- koreksi terbatas jika diizinkan;
- konfirmasi submit.

**AI tidak boleh menjadi sumber kebenaran final.**

---

# 17. Incident Report

Mobile harus menyediakan tombol yang mudah ditemukan:

> **LAPORKAN MASALAH**

Kategori dapat dikonfigurasi melalui web.

Contoh kategori:

- masalah administratif;
- gangguan proses;
- konflik;
- keamanan;
- logistik;
- pelanggaran yang dilaporkan pengguna;
- kategori lain yang telah ditetapkan.

Data laporan:

- kategori;
- waktu;
- lokasi;
- deskripsi;
- foto;
- video;
- attachment;
- reporter;
- assignment/TPS terkait.

Laporan masuk ke Web Command Center untuk triase dan tindak lanjut.

---

# 18. Web Command Center sebagai "Dependency"

Mobile bergantung pada web/backend untuk beberapa aktivitas.

## Aktivitas yang harus dibuat/diatur dari web

- membuat organisasi;
- membuat struktur wilayah;
- import/master TPS;
- membuat role;
- membuat permission;
- approval user;
- approval volunteer;
- membuat assignment;
- menetapkan coordinator;
- menetapkan verifier;
- membuat training;
- membuat event;
- membuat broadcast;
- membuat workflow approval;
- verifikasi laporan;
- review incident;
- konfigurasi kategori.

## Aktivitas yang berasal dari mobile

- update profil yang diizinkan;
- daftar volunteer;
- daftar event;
- check-in;
- training completion;
- menerima assignment;
- check-in TPS;
- submit report;
- upload evidence;
- incident report;
- melihat status.

---

# 19. Workflow Role & Data

## 19.1 Member Registration

```text
Mobile
↓
Register
↓
Verification
↓
Web Review
↓
Active
```

## 19.2 Volunteer Registration

```text
Mobile
↓
Apply Volunteer
↓
Web Verification
↓
Volunteer Active
```

## 19.3 Witness Appointment

```text
Member / Volunteer
↓
Nominated
↓
Training
↓
Verified
↓
Assigned
↓
Mobile Notification
```

## 19.4 Report

```text
Mobile Submit
↓
Backend Validation
↓
Web Verifier
↓
Approve / Reject / Revision
↓
Status Returned to Mobile
```

---

# 20. Status Lifecycle

## 20.1 Member

```text
PENDING
→ VERIFIED
→ ACTIVE
→ INACTIVE
→ SUSPENDED
```

## 20.2 Volunteer

```text
REGISTERED
→ VERIFIED
→ ACTIVE
→ INACTIVE
```

## 20.3 Witness

```text
NOMINATED
→ SCREENING
→ TRAINING
→ APPROVED
→ ASSIGNED
→ CHECKED_IN
→ COMPLETED
```

Status tambahan:

```text
REJECTED
CANCELLED
REASSIGNED
```

---

# 21. Permission Model

Permission harus granular.

## Profile

- `view_own_profile`
- `edit_own_profile`

## Activity

- `view_activity`
- `join_activity`
- `checkin_activity`

## Volunteer

- `apply_volunteer`
- `view_volunteer_profile`
- `view_volunteer_task`

## Witness

- `view_assigned_tps`
- `checkin_tps`
- `submit_witness_report`
- `upload_evidence`
- `submit_incident`

## Coordinator

- `view_assigned_witnesses`
- `view_assigned_tps`
- `view_checkin_status`
- `send_task_reminder`
- `escalate_issue`

## Admin

- `manage_member`
- `manage_volunteer`
- `manage_assignment`
- `verify_report`
- `manage_incident`
- `send_broadcast`
- `view_dashboard`

---

# 22. Scope Model

Scope harus diterapkan pada setiap request.

Contoh:

### National

```text
scope = NATIONAL
```

### Province

```text
scope = PROVINCE:32
```

### Regency

```text
scope = REGENCY:3204
```

### District

```text
scope = DISTRICT:320401
```

### TPS

```text
scope = TPS:320401010100001
```

---

# 23. Contoh Authorization

User:

```text
Role = TPS Coordinator
Scope = District X
Permission = view_assigned_tps
```

Request:

> lihat TPS yang berada di District X.

✅ Allowed.

Request:

> lihat TPS di District Y.

❌ Denied.

Request:

> ubah hasil TPS.

❌ Denied jika permission tidak diberikan.

Request:

> kirim reminder ke saksi dalam scope.

✅ Allowed jika permission tersedia.

---

# 24. Data yang Sensitif

Mobile tidak boleh menyimpan atau menampilkan data sensitif secara berlebihan.

Prinsip:

- data minimization;
- hanya tampilkan data yang diperlukan;
- masking NIK/identitas sensitif;
- tidak menyimpan data sensitif permanen di device bila tidak perlu;
- gunakan secure storage untuk token;
- session timeout;
- device logout;
- remote session revoke;
- audit setiap aktivitas penting.

---

# 25. Login dan Security

Rekomendasi:

### Login

- nomor HP/email;
- password atau passwordless sesuai desain;
- OTP;
- optional/passive biometric unlock pada device.

### High-risk action

Untuk aktivitas tertentu dapat meminta re-authentication:

- perubahan data sensitif;
- perubahan nomor HP;
- submit laporan penting;
- pergantian device;
- tindakan approval tertentu.

---

# 26. Offline Mode

Karena pengguna mobile dapat berada di lokasi dengan koneksi buruk, modul tertentu perlu dirancang dengan offline-aware behavior.

Yang dapat dipertimbangkan:

- membaca assignment terakhir;
- menyimpan draft laporan;
- mengambil foto sebagai draft;
- antrean upload;
- retry otomatis;
- status `PENDING SYNC`.

Tetapi:

> **Data yang membutuhkan validasi server tidak boleh dianggap final hanya karena tersimpan offline.**

Contoh:

`Check-in offline` → dapat disimpan sebagai pending, tetapi status resmi harus menunggu server.

---

# 27. Notification Architecture

Notifikasi harus role-aware dan scope-aware.

## Member

- kegiatan baru;
- training;
- pengumuman.

## Volunteer

- task;
- event;
- training;
- reminder.

## Witness

- assignment;
- jadwal;
- check-in reminder;
- report status;
- revision request;
- incident update.

## Coordinator

- saksi belum check-in;
- TPS belum melapor;
- eskalasi;
- assignment update.

Web Command Center menjadi sumber konfigurasi notification rules.

---

# 28. Activity Timeline

Setiap user memiliki timeline pribadi.

Contoh:

```text
17 Sep
✓ Mengikuti Pelatihan Saksi

15 Sep
✓ Check-in Kegiatan

12 Sep
✓ Menerima Penugasan

10 Sep
✓ Menjadi Relawan Aktif
```

Timeline membantu user memahami status dirinya tanpa harus membuka banyak menu.

---

# 29. Assignment Timeline

Untuk saksi:

```text
Nominated
↓
Training
↓
Approved
↓
Assigned
↓
Check-in
↓
Report Submitted
↓
Verified
↓
Completed
```

Mobile menampilkan langkah yang sudah selesai dan langkah berikutnya.

---

# 30. Mobile UX Rules

## Prinsip 1 — One Primary Action

Setiap layar utama sebaiknya memiliki satu tindakan utama.

Contoh:

> **CHECK-IN TPS**

bukan 10 tombol.

## Prinsip 2 — Role Context

Selalu jelaskan konteks:

> Saksi TPS 017

bukan hanya:

> Saksi.

## Prinsip 3 — Minimal Input

Gunakan:

- dropdown;
- QR;
- GPS;
- camera;
- autofill;

daripada mengetik manual.

## Prinsip 4 — Status Jelas

Gunakan status seperti:

- Active
- Assigned
- Pending
- Submitted
- Verified
- Revision Required

## Prinsip 5 — Error yang Bisa Ditindaklanjuti

Jangan hanya:

> “Error.”

Gunakan:

> “Lokasi Anda berada di luar area assignment. Aktifkan lokasi atau hubungi koordinator.”

---

# 31. Home Screen berdasarkan Role

## Member

```text
Halo, Andi

Member Aktif
[ PAN DIGITAL ID ]

Agenda Terdekat
Pelatihan
Pengumuman

Quick Action:
[ Kegiatan ]
[ Academy ]
[ Profil ]
```

## Volunteer

```text
Halo, Andi

Volunteer Aktif

Tugas Hari Ini
3 kegiatan baru

Quick Action:
[ Task ]
[ Event ]
[ Check-in ]
```

## Witness

```text
Halo, Andi

SAKSI TPS 017

Assignment:
ACTIVE

Quick Action:
[ CHECK-IN ]
[ LAPORAN TPS ]
[ INSIDEN ]
```

## Coordinator

```text
Halo, Andi

KOORDINATOR TPS

12 TPS
24 Saksi

6 Checked-in
4 Pending
2 No Response

Quick Action:
[ MONITOR ]
[ REMINDER ]
[ ESCALATE ]
```

---

# 32. Dashboard Mobile untuk Coordinator

Coordinator tetap menggunakan mobile, tetapi bukan command center penuh.

Mobile coordinator hanya menampilkan:

- jumlah TPS dalam scope;
- saksi assigned;
- saksi check-in;
- TPS belum melapor;
- incident;
- reminder.

Untuk:

- peta besar;
- filter kompleks;
- analytics;
- bulk operation;
- export;

gunakan Web Command Center.

---

# 33. Apa yang Tidak Perlu Ada di Mobile

Untuk mencegah aplikasi terlalu berat, sebaiknya hal berikut hanya ada di web:

- bulk import;
- bulk assignment;
- role management;
- permission management;
- struktur organisasi;
- master TPS;
- dashboard analitik kompleks;
- export;
- reconciliation;
- audit log lengkap;
- configuration;
- workflow builder;
- OCR review dalam jumlah besar;
- dispute resolution;
- user administration.

---

# 34. Konteks Command Center

Setiap fungsi mobile yang bersifat operasional mempunyai pasangan fungsi di web.

| Mobile | Command Center |
|---|---|
| Register | Approve |
| Submit volunteer | Verify |
| Receive assignment | Create/assign |
| Check-in | Monitor |
| Report | Verify |
| Upload evidence | Review |
| Incident report | Triase |
| Training completion | Monitor |
| Activity check-in | Monitor |
| Profile change | Audit |
| Notification | Configure/broadcast |

Ini menciptakan satu workflow ujung-ke-ujung.

---

# 35. Role Assignment dari Web

Role tidak sebaiknya selalu dipilih sendiri oleh user.

Contoh:

User mendaftar sebagai volunteer.

Web melakukan:

```text
Volunteer Application
↓
Review
↓
Approve
↓
Role = Volunteer
```

Untuk Witness:

```text
Nomination
↓
Verification
↓
Training
↓
Approve
↓
Assignment
↓
Role = Witness
```

Untuk Coordinator:

```text
Appointment
↓
Admin Approval
↓
Role = TPS Coordinator
↓
Scope = District X
```

---

# 36. Rule Penting untuk Multi-Role

User dapat memiliki:

```text
roles = [
  MEMBER,
  VOLUNTEER,
  WITNESS,
  TPS_COORDINATOR
]
```

Namun role dapat memiliki status berbeda.

Contoh:

```text
MEMBER = ACTIVE
VOLUNTEER = ACTIVE
WITNESS = ASSIGNED
TPS_COORDINATOR = SUSPENDED
```

Mobile harus mengikuti role yang aktif dan valid saja.

---

# 37. Prinsip "Least Privilege"

User hanya mendapatkan akses yang dibutuhkan untuk pekerjaannya.

Contoh:

Saksi tidak perlu melihat:

- seluruh data saksi;
- NIK orang lain;
- dashboard nasional;
- laporan TPS lain;
- data keuangan seluruh wilayah.

Koordinator tidak otomatis melihat:

- data nasional;
- konfigurasi sistem;
- audit log global.

Ini mengurangi risiko kebocoran dan kesalahan akses.

---

# 38. Audit Trail

Aktivitas penting wajib dicatat.

Minimal:

- login;
- logout;
- perubahan role;
- perubahan permission;
- assignment;
- check-in;
- report submit;
- report edit;
- evidence upload;
- report approve/reject;
- incident;
- perubahan data sensitif.

Informasi audit:

- who;
- what;
- when;
- where/related object;
- before;
- after;
- source/device bila relevan.

Audit log lengkap dikelola melalui Web Command Center.

---

# 39. Acceptance Criteria Utama

## Member

- bisa login;
- bisa melihat Digital ID;
- bisa melihat status akun;
- bisa melihat kegiatan;
- bisa mengikuti pelatihan.

## Volunteer

- bisa mendaftar;
- bisa menerima status;
- bisa melihat task;
- bisa check-in.

## Witness

- hanya melihat assignment yang valid;
- hanya bisa check-in pada assignment yang valid;
- bisa submit laporan;
- bisa upload evidence;
- dapat melihat status submission.

## Coordinator

- dapat melihat anggota/tugas dalam scope;
- tidak dapat mengubah hasil final;
- dapat melakukan reminder;
- dapat melakukan eskalasi.

## Web

- dapat mengelola role;
- dapat mengelola scope;
- dapat membuat assignment;
- dapat memverifikasi submission;
- dapat melakukan audit.

---

# 40. MVP yang Direkomendasikan

Untuk tahap pertama, jangan membangun seluruh ekosistem sekaligus.

## MVP Mobile

### Core

1. Login/OTP
2. Profile
3. Digital ID
4. Member status
5. Volunteer registration
6. Event
7. Training
8. Task
9. Notification
10. Witness assignment
11. TPS check-in
12. TPS report
13. Evidence upload
14. Incident report

### MVP Web

1. User management
2. Member/volunteer verification
3. Role management
4. Organization scope
5. TPS master
6. Assignment
7. Check-in monitoring
8. Report verification
9. Incident management
10. Broadcast
11. Basic dashboard
12. Audit log

---

# 41. Phase 2

Setelah MVP stabil:

- OCR;
- offline sync;
- advanced notification;
- coordinator dashboard;
- QR workflow;
- certificate;
- advanced training;
- payment/honorarium;
- richer analytics;
- API integration;
- advanced audit.

---

# 42. Phase 3

Untuk skala nasional:

- command center nasional;
- advanced analytics;
- anomaly detection;
- AI-assisted OCR;
- intelligent routing/escalation;
- data quality engine;
- recommendation engine;
- enterprise identity management.

---

# 43. Suggested High-Level Data Model

```text
USER
 ├── PROFILE
 ├── MEMBERSHIP
 ├── ROLES
 │    ├── MEMBER
 │    ├── VOLUNTEER
 │    ├── WITNESS
 │    └── COORDINATOR
 ├── SCOPES
 ├── PERMISSIONS
 ├── ASSIGNMENTS
 ├── TRAININGS
 ├── EVENTS
 ├── CHECKINS
 ├── REPORTS
 ├── EVIDENCE
 ├── INCIDENTS
 ├── NOTIFICATIONS
 └── AUDIT EVENTS
```

Relasi utama:

```text
USER
 ↓
ROLE
 ↓
SCOPE
 ↓
ASSIGNMENT
 ↓
FIELD ACTIVITY
 ↓
REPORT
 ↓
VERIFICATION
```

---

# 44. Target Operating Model

Secara sederhana, seluruh ekosistem bekerja seperti ini:

```text
                 WEB COMMAND CENTER
                       │
          ┌────────────┼────────────┐
          │            │            │
       MASTER       ASSIGNMENT   MONITORING
          │            │            │
          └────────────┼────────────┘
                       ↓
                   MOBILE APP
                       │
      ┌────────────────┼─────────────────┐
      │                │                 │
    MEMBER          VOLUNTEER          WITNESS
      │                │                 │
      └────────────────┼─────────────────┘
                       ↓
                  FIELD ACTIVITY
                       │
            ┌──────────┼──────────┐
            ↓          ↓          ↓
         CHECK-IN    REPORT     INCIDENT
            │          │          │
            └──────────┼──────────┘
                       ↓
                 WEB VERIFICATION
                       │
                       ↓
                  COMMAND CENTER
```

---

# 45. Prinsip Arsitektur Akhir

SAKSI 360 sebaiknya dibangun dengan prinsip berikut:

### 1. One Identity

Satu orang satu akun utama.

### 2. Multi-Role

Satu akun dapat memiliki beberapa peran.

### 3. Scoped Access

Role selalu memiliki batas wilayah/objek.

### 4. Granular Permission

Hak akses tidak hanya ditentukan oleh nama role.

### 5. Mobile for Action

Mobile untuk kegiatan nyata di lapangan.

### 6. Web for Control

Web untuk administrasi, verifikasi, monitoring, dan analytics.

### 7. Human-in-the-loop

AI membantu membaca dan memeriksa, tetapi keputusan penting tetap melalui workflow yang dapat diaudit.

### 8. Auditability

Setiap tindakan kritis memiliki jejak.

### 9. Privacy by Design

Data pribadi hanya dikumpulkan, ditampilkan, dan diproses sesuai kebutuhan dan kewenangan.

### 10. Configurable

Kategori, workflow, role, scope, dan aturan operasional harus dapat dikonfigurasi tanpa membangun ulang aplikasi.

---

# 46. Kesimpulan

Model yang paling tepat untuk aplikasi ini adalah:

> **Mobile App = Digital Identity + Member App + Volunteer App + Field Operation App**

sedangkan:

> **Web Command Center = Administration + Verification + Monitoring + Analytics + Governance**

Dan fondasi sistemnya:

> **User → Membership → Role → Scope → Permission → Assignment → Activity → Verification**

Dengan pendekatan ini, satu orang dapat berkembang secara natural:

```text
Member
  ↓
Volunteer
  ↓
Trained Volunteer
  ↓
Witness
  ↓
Coordinator
```

tanpa kehilangan satu identitas pengguna.

Di sisi lain, Command Center dapat melihat aktivitas tersebut berdasarkan:

- individu;
- role;
- wilayah;
- assignment;
- TPS;
- event;
- training;
- laporan;
- incident.

Model ini juga membuat aplikasi dapat dipakai sepanjang tahun dan tidak bergantung hanya pada satu momentum pemilu.
