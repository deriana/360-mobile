# PAN MOBILE — ENRICHMENT ECOSYSTEM
## Rancangan Mobile Experience untuk Amanat Academy & PANdawa

**Dokumen:** Product Enrichment Blueprint  
**Fokus:** Aplikasi Mobile PAN  
**Versi:** 1.0  
**Tanggal:** 18 September 2026  
**Status:** Draft Konseptual untuk Product, UI/UX, Backend, dan Stakeholder

---

## 0. Ringkasan Eksekutif

Dokumen ini merancang pengayaan ekosistem aplikasi mobile PAN melalui dua program utama:

1. **Amanat Academy** — diposisikan sebagai pusat pembelajaran dan pengembangan kompetensi pengguna.
2. **PANdawa** — diposisikan sebagai program/komunitas dengan status keikutsertaan, pelatihan, aktivitas, dan credential tersendiri.

Situs resmi PAN saat ini menampilkan Amanat Academy sebagai program pelatihan yang ditujukan untuk kader dan masyarakat umum untuk menambah wawasan dan kemampuan. Karena itu, Amanat Academy cocok ditempatkan sebagai salah satu pilar pengalaman mobile, bukan sekadar submenu tambahan.  
Sumber resmi PAN: https://www.pan.or.id/amanat-academy/

Untuk PANdawa, sumber publik mengenai program pelatihan DPP PAN pada Januari 2025 menjelaskan PANdawa sebagai “Pasukan Muda Tangguh dan Waspada” dan mengaitkannya dengan kesiapsiagaan, pengamanan, dan pengawalan PAN. Detail operasional, struktur keanggotaan, dan kewenangan PANdawa harus dikonfirmasi dengan pengelola resmi program sebelum diterjemahkan menjadi aturan sistem.  
Sumber: https://news.detik.com/berita/d-7752452/siapkan-satgas-pengamanan-dpp-pan-gelar-pelatihan-pandawa

> **Catatan:** Dokumen ini adalah rancangan produk mobile. Ia tidak menetapkan struktur resmi organisasi PANdawa, syarat keanggotaan, atau kewenangan operasional. Hal-hal tersebut perlu divalidasi dengan pemilik program.

---

# 1. Tujuan Enrichment

Pengayaan Amanat Academy dan PANdawa bertujuan membuat mobile app tidak berhenti sebagai:

> “aplikasi relawan untuk mengambil tugas”

tetapi berkembang menjadi:

> **Digital Member & Volunteer Experience Platform**

yang menghubungkan:

**Identitas → Belajar → Beraktivitas → Mendapat Credential → Berkontribusi → Berkembang**

Tujuan produk:

- meningkatkan frekuensi penggunaan aplikasi;
- memberi alasan relawan membuka aplikasi sepanjang tahun;
- membangun learning journey;
- mencatat kompetensi dan sertifikasi;
- menyediakan jalur program khusus;
- membangun personal activity history;
- menyiapkan pipeline kompetensi untuk program tertentu;
- membuat pengalaman anggota dan relawan lebih personal.

---

# 2. Prinsip Product Architecture

## 2.1 One Identity

Satu orang memiliki satu akun utama.

Contoh:

```text
USER
└── Andi
```

Akun dapat mempunyai:

```text
Membership
├── Member PAN
└── Non-Member

Volunteer
└── Active

Program Participation
├── Amanat Academy
├── PANdawa
└── Program Saksi

Operational Role
├── Volunteer
├── Witness
└── Coordinator
```

## 2.2 Program bukan Role

Amanat Academy dan PANdawa **jangan otomatis dianggap sebagai role RBAC**.

Lebih sehat menggunakan model:

```text
USER
│
├── MEMBERSHIP
├── OPERATIONAL ROLES
└── PROGRAM PARTICIPATION
      ├── Amanat Academy
      ├── PANdawa
      └── Program Saksi
```

Alasannya:

- seseorang dapat ikut Amanat Academy tanpa menjadi anggota;
- seseorang dapat mengikuti kelas tertentu tanpa menjadi PANdawa;
- seseorang dapat menjadi PANdawa tanpa otomatis menjadi saksi;
- seseorang dapat menjadi anggota dan relawan sekaligus.

---

# 3. Positioning Amanat Academy

Amanat Academy diposisikan sebagai:

> **Learning & Competency Hub di dalam PAN Mobile.**

Empat fungsi utama:

1. **Discover** — menemukan program belajar.
2. **Learn** — mengikuti materi.
3. **Assess** — evaluasi/quiz.
4. **Credential** — sertifikat atau bukti penyelesaian.

---

# 4. Struktur Amanat Academy di Mobile

```text
AMANAT ACADEMY
│
├── Untuk Saya
├── Katalog
├── Kelas Saya
├── Progress Belajar
├── Program Saksi
├── PANdawa
├── Sertifikat
└── Riwayat Belajar
```

**Program Saksi** dan **PANdawa** tampil sebagai learning track/program khusus, bukan hanya kursus biasa.

---

# 5. Home Amanat Academy

Home Academy harus bersifat personal.

Contoh:

```text
AMANAT ACADEMY

Halo, Andi 👋

Lanjutkan Belajar
──────────────────
Leadership Fundamental
████████░░ 80%

[ LANJUTKAN ]

Rekomendasi Untuk Anda
──────────────────────
• Public Speaking
• Community Organizing
• Digital Communication

Program Khusus
────────────────────
🛡 PANdawa
🗳 Program Saksi

Progress Anda
─────────────
8 Kelas selesai
3 Sertifikat
```

---

# 6. Katalog Pembelajaran

Katalog dapat dibagi berdasarkan:

- topik;
- level;
- durasi;
- format;
- status pengguna;
- rekomendasi;
- program.

Filter:

- online/offline;
- wajib/opsional;
- belum dimulai;
- sedang berjalan;
- selesai.

---

# 7. Tipe Konten

Academy sebaiknya mendukung:

- Video
- Article
- PDF
- Quiz
- Assignment
- Simulation
- Live Session
- Certificate

---

# 8. Learning Journey

Setiap program mempunyai progress.

Contoh:

```text
PROGRAM SAKSI

01 Pengenalan
✓

02 Peran & Tanggung Jawab
✓

03 Simulasi TPS
✓

04 Pelaporan Digital
███████░░░ 70%

05 Evaluasi
○

06 Completion
○
```

> **Lulus kelas ≠ otomatis menjadi saksi resmi.**

Status legal/formal seperti mandat harus berasal dari workflow yang berwenang.

---

# 9. Readiness Profile

Fitur penghubung Academy dengan program lain.

```text
READINESS PROFILE

Program Saksi
──────────────
Materi Dasar        ✓
Simulasi             ✓
Evaluasi             ✓
Training Completion  ✓
Verification         ○
Mandate              ○
Assignment           ○
```

Status yang dapat digunakan:

- Not Started
- In Progress
- Completed
- Ready for Review
- Under Verification
- Needs Action

**Readiness bukan status hukum/mandat.**

---

# 10. Sertifikat

Menu:

> **Sertifikat Saya**

Contoh:

```text
Leadership Fundamental
✓ Completed
17 Sep 2026

[ LIHAT ]
```

Sertifikat dapat memiliki:

- nama;
- program;
- tanggal;
- nomor sertifikat;
- QR verification;
- issuer;
- masa berlaku bila ada;
- status validasi.

---

# 11. PANdawa — Positioning Mobile

Berdasarkan informasi publik yang tersedia, PANdawa diperkenalkan PAN sebagai “Pasukan Muda Tangguh dan Waspada”, dengan pelatihan yang berkaitan dengan kesiapsiagaan, pengamanan, dan pengawalan. Pada pelatihan Januari 2025, kegiatan melibatkan peserta dari berbagai wilayah di Indonesia.  
Sumber publik: https://news.detik.com/berita/d-7752452/siapkan-satgas-pengamanan-dpp-pan-gelar-pelatihan-pandawa

Dalam aplikasi mobile, PANdawa sebaiknya diperlakukan sebagai:

> **Dedicated Program Experience**

bukan sekadar satu kursus.

---

# 12. Struktur PANdawa di Mobile

```text
PANDAWA
│
├── Tentang PANdawa
├── Status Saya
├── Program & Training
├── Jadwal
├── Tugas / Aktivitas
├── Credential
├── Riwayat Aktivitas
├── Pengumuman
└── Kontak Program
```

Ketersediaan menu bergantung pada status pengguna.

---

# 13. PANdawa — Halaman Overview

Contoh:

```text
PANDAWA

Pasukan Muda Tangguh dan Waspada

STATUS ANDA
🟢 Peserta Aktif

PROGRAM BERJALAN
Basic Readiness Training
████████░░ 80%

AGENDA BERIKUTNYA
Minggu, 09.00
Pelatihan ...

[ LIHAT DETAIL ]
```

---

# 14. PANdawa Status

Lifecycle produk yang diusulkan:

```text
INTERESTED
   ↓
REGISTERED
   ↓
SELECTED
   ↓
TRAINING
   ↓
COMPLETED
   ↓
ACTIVE
   ↓
INACTIVE
```

Tahapan final harus disesuaikan dengan SOP resmi PANdawa.

Aplikasi **tidak boleh menciptakan status resmi organisasi hanya berdasarkan asumsi produk**.

---

# 15. PANdawa Training

Mobile menyediakan training experience khusus.

Contoh:

```text
PANDAWA TRAINING

Basic Readiness
✓

Discipline & Teamwork
✓

Safety Awareness
██████░░░░ 60%

Scenario Training
○
```

Setiap training dapat mempunyai:

- materi;
- attendance;
- quiz;
- assignment;
- completion;
- certificate/credential.

---

# 16. PANdawa Activity

Jika pengguna telah berstatus aktif dan diberi aktivitas, mobile menampilkan:

```text
AKTIVITAS PANDAWA

Aktivitas Program
20 September
08.00–13.00

Lokasi:
...

Role:
...

Status:
Assigned

[ LIHAT DETAIL ]
```

Aktivitas operasional hanya muncul jika user memiliki status dan assignment yang sah.

---

# 17. PANdawa Credential

Profil pengguna dapat memiliki:

```text
PANDAWA CREDENTIAL

Status:
ACTIVE

Since:
2026

Training:
6 Completed

Certificate:
3

[ DIGITAL CARD ]
[ SHOW QR ]
```

Credential harus dapat diverifikasi server.

QR tidak sebaiknya membawa seluruh data pribadi di dalam payload.

---

# 18. Hubungan Amanat Academy dan PANdawa

```text
AMANAT ACADEMY
       │
       ├── Learning
       ├── Assessment
       └── Credential
             │
             ▼
          PROGRAM
             │
       ┌─────┴──────┐
       ▼            ▼
    PANDAWA     PROGRAM SAKSI
```

Academy menjadi **mesin pembelajaran dan kompetensi**.

PANdawa menjadi **program khusus**.

Program Saksi menjadi **jalur persiapan menuju aktivitas saksi**.

---

# 19. User Journey Relawan

## Kondisi awal

```text
REGISTER AS VOLUNTEER
        ↓
VOLUNTEER ACTIVE
        ↓
OPEN HOME
```

Mobile menampilkan:

- Bursa Tugas;
- Kegiatan;
- Academy;
- Posko;
- QR Pass;
- Presensi.

## Relawan mulai belajar

```text
Home
 ↓
Academy
 ↓
Amanat Academy
 ↓
Enroll
 ↓
Learn
 ↓
Quiz
 ↓
Completion
 ↓
Certificate
```

## Relawan tertarik PANdawa

```text
Academy
 ↓
PANdawa
 ↓
Read About Program
 ↓
Apply / Register
 ↓
Program Status
```

Tahapan approval mengikuti mekanisme resmi program.

## Relawan mengikuti Program Saksi

```text
Academy
 ↓
Program Saksi
 ↓
Training
 ↓
Simulation
 ↓
Evaluation
 ↓
Ready / Training Completed
```

Tetap belum menjadi saksi resmi.

---

# 20. User Journey PANdawa

```text
Volunteer
   ↓
Discover PANdawa
   ↓
Register
   ↓
Selection / Verification
   ↓
Selected
   ↓
Training
   ↓
Completion
   ↓
Active
   ↓
Activity / Assignment
   ↓
Completion / History
```

---

# 21. My PAN Passport

Direkomendasikan sebagai ringkasan journey pengguna.

```text
PAN DIGITAL PASSPORT

ANDI PRATAMA

RELATIONSHIP
Volunteer Active

PROGRAM
✓ Amanat Academy
✓ PANdawa
✓ Program Saksi

LEARNING
8 courses

CERTIFICATES
3

ACTIVITIES
27

CURRENT STATUS
Volunteer Active
```

Passport merangkum data lintas program, tetapi tidak menjadi sumber kewenangan baru.

---

# 22. Home Mobile yang Baru

```text
─────────────────────────────
Halo, Andi 👋

Relawan Aktif
─────────────────────────────

TUGAS ANDA
1 tugas aktif

KEGIATAN
2 agenda terdekat

ACADEMY
Lanjutkan: Leadership 80%

PROGRAM
🛡 PANdawa — Active
🗳 Program Saksi — Training Complete

QUICK ACTION
[ QR PASS ]
[ PRESENSI ]
[ BURSA TUGAS ]

PENGUMUMAN
2 pesan baru
─────────────────────────────
```

---

# 23. Bottom Navigation Final

Rekomendasi:

```text
┌────────┬────────┬──────────┬─────────┬────────┐
│  HOME  │  TUGAS │ KEGIATAN │ ACADEMY │ PROFIL │
└────────┴────────┴──────────┴─────────┴────────┘
```

Tidak perlu membuat PANdawa, QR Pass, Presensi, Posko, atau Kontak Korlap sebagai bottom menu.

Semua dapat ditempatkan secara kontekstual.

---

# 24. Penempatan Fitur PANdawa

### Academy

Untuk:

- belajar;
- training;
- quiz;
- materi;
- readiness.

### Profile / Passport

Untuk:

- status PANdawa;
- credential;
- sertifikat;
- riwayat.

### Tasks

Untuk:

- aktivitas yang benar-benar ditugaskan.

### Home

Untuk:

- status;
- reminder;
- upcoming activity.

---

# 25. Penempatan Fitur Amanat Academy

```text
Academy
├── Amanat Academy
├── PANdawa
├── Program Saksi
├── Kelas Saya
├── Progress
└── Sertifikat
```

---

# 26. Mobile Permissions

Akses menu ditentukan oleh:

```text
Role
+
Program Status
+
Assignment
+
Permission
```

### Relawan aktif, bukan PANdawa

Bisa melihat:

- Amanat Academy;
- halaman informasi PANdawa;
- mekanisme pendaftaran jika dibuka.

Tidak bisa melihat:

- aktivitas internal PANdawa;
- assignment PANdawa;
- credential PANdawa internal.

### Peserta PANdawa aktif

Tambahan:

- status PANdawa;
- training;
- agenda;
- credential;
- activity.

### Relawan dengan Program Saksi

Tambahan:

- Program Saksi;
- readiness;
- training;
- status proses.

Tetap belum mendapatkan modul operasional TPS sebelum role/assignment saksi aktif.

---

# 27. Recommended Notification

## Amanat Academy

- kelas baru;
- kelas hampir selesai;
- reminder;
- quiz;
- sertifikat;
- live session.

## PANdawa

- status pendaftaran;
- training;
- jadwal;
- perubahan jadwal;
- assignment;
- reminder;
- status credential.

## Program Saksi

- training;
- evaluasi;
- status proses;
- permintaan data;
- assignment resmi.

---

# 28. Gamification

Gamification dapat digunakan secara ringan:

```text
BADGES

🎓 Fast Learner
🏅 Training Complete
📚 5 Courses
🤝 Active Volunteer
🛡 PANdawa
```

Prinsip:

- fokus pada progress pribadi;
- hindari leaderboard yang mendorong kompetisi tidak perlu;
- badge harus memiliki definisi jelas;
- status resmi tidak boleh ditentukan hanya oleh badge.

---

# 29. Personal Recommendation

Mobile dapat menampilkan:

> **Rekomendasi Untuk Anda**

Berdasarkan, bila sesuai kebijakan produk:

- bidang minat yang dipilih;
- course yang pernah diambil;
- program yang diikuti;
- tugas sebelumnya;
- availability.

Contoh:

```text
Karena Anda pernah mengikuti:
Digital Communication

Rekomendasi:
→ Content Production
→ Public Speaking
→ Event Documentation
```

Rekomendasi bersifat informatif/operasional dan tidak boleh disalahartikan sebagai keputusan penerimaan program.

---

# 30. Program Discovery

Relawan yang belum mengikuti PANdawa dapat melihat:

```text
PROGRAM UNTUK ANDA

PANdawa
Program khusus ...
[ PELAJARI ]

Program Saksi
Persiapan kompetensi ...
[ PELAJARI ]

Amanat Academy
Belajar & berkembang ...
[ JELAJAHI ]
```

Membuka informasi program tidak sama dengan status pendaftaran.

---

# 31. Program Card

Semua program menggunakan pola UI konsisten:

```text
┌─────────────────────────┐
│ PANDAWA                 │
│                         │
│ Program khusus          │
│                         │
│ Status: ACTIVE          │
│ Training: 80%           │
│                         │
│ [ BUKA PROGRAM ]        │
└─────────────────────────┘
```

---

# 32. Detail Program

Setiap program mempunyai:

### Overview
Apa program ini.

### Eligibility
Siapa yang dapat mengikuti.

### Journey
Tahapan.

### Schedule
Jadwal.

### Learning
Materi/pelatihan.

### Activity
Aktivitas aktif.

### Credential
Status/sertifikat.

---

# 33. Struktur Role / Status / Program

Gunakan pemisahan berikut:

```text
USER
│
├── MEMBERSHIP STATUS
│   ├── Active Member
│   └── Non-Member
│
├── OPERATIONAL ROLE
│   ├── Volunteer
│   ├── Witness
│   └── Coordinator
│
├── PROGRAM PARTICIPATION
│   ├── Amanat Academy
│   ├── PANdawa
│   └── Program Saksi
│
└── CREDENTIALS
    ├── Academy Certificate
    ├── PANdawa Credential
    └── Witness Mandate / Credential
```

**Role** menjawab fungsi pengguna.  
**Status** menjawab kondisi.  
**Program** menjawab partisipasi.  
**Credential** menjadi bukti status/kompetensi.

---

# 34. Shared Data Objects

Objek utama yang perlu dipikirkan dari sisi mobile:

```text
User
Profile
Membership
Volunteer Profile
Program
Enrollment
Course
Learning Progress
Certificate
Assignment
Activity
Attendance
Notification
Credential
```

SAKSI 360 nantinya menambahkan objek:

```text
Witness Assignment
Mandate
TPS
Witness Report
Evidence
Incident
```

---

# 35. Event dan Attendance

Amanat Academy dan PANdawa sebaiknya menggunakan event/attendance engine yang sama dengan fitur kegiatan relawan, bila secara teknis memungkinkan.

Contoh:

```text
Event
↓
Reservation
↓
QR Pass
↓
Check-in
↓
Attendance
↓
Completion
```

Manfaat:

- satu QR Pass;
- satu attendance history;
- satu activity timeline.

---

# 36. Offline Experience

Karena mobile digunakan di kondisi jaringan beragam, dapat dipertimbangkan:

- caching agenda;
- progress learning sementara;
- draft task;
- draft assignment;
- upload queue;
- retry otomatis;
- `PENDING SYNC`.

Namun status resmi harus dikonfirmasi server.

---

# 37. Security

Rekomendasi:

- secure token storage;
- encrypted transport;
- optional biometric unlock;
- session management;
- remote logout;
- server-side authorization;
- audit trail tindakan kritis;
- masking data sensitif;
- pengendalian device/session.

---

# 38. Privacy

Untuk mobile:

- tampilkan hanya data yang diperlukan;
- minta permission lokasi hanya ketika dibutuhkan;
- jelaskan tujuan akses kamera/lokasi;
- jangan meminta data identitas tambahan tanpa kebutuhan bisnis;
- hindari menyimpan evidence sensitif di device lebih lama dari yang diperlukan;
- sediakan kontrol privacy yang relevan.

---

# 39. UX Principles

## Principle 1 — Program-first, bukan Role-first

Pengguna tidak perlu memahami struktur organisasi untuk menggunakan aplikasi.

Mereka cukup melihat:

> Tugas saya  
> Kegiatan saya  
> Pembelajaran saya  
> Program saya

## Principle 2 — Progress terlihat

Pengguna selalu tahu:

> Saya sedang di tahap mana?

## Principle 3 — One app, one identity

Tidak ada akun berbeda untuk:

- relawan;
- PANdawa;
- Academy;
- saksi.

## Principle 4 — Contextual visibility

Menu muncul berdasarkan konteks.

---

# 40. MVP — Amanat Academy

1. Home Academy
2. Catalog
3. Course Detail
4. Video/Document Learning
5. Quiz
6. Progress
7. My Courses
8. Certificate

---

# 41. MVP — PANdawa

1. Program Overview
2. Registration/Application
3. Status
4. Training
5. Schedule
6. Activity
7. Credential
8. Notification

Status dan workflow final harus mengikuti definisi resmi pemilik program.

---

# 42. MVP — Shared

1. Digital Identity
2. Notification
3. Activity History
4. QR Pass
5. Attendance
6. Profile

---

# 43. Phase 2

### Academy

- recommendation engine;
- live class;
- discussion;
- assignment;
- richer assessments;
- competency mapping.

### PANdawa

- activity history;
- credential verification;
- advanced scheduling;
- program-specific announcements;
- digital certificate;
- readiness/competency profile.

### Shared

- PAN Digital Passport;
- personalized home;
- recommendation;
- achievement/badge.

---

# 44. Phase 3

Potential future capability:

```text
Personalized Learning
        ↓
Competency Graph
        ↓
Program Eligibility
        ↓
Recommended Activities
        ↓
Credential
        ↓
Assignment
```

Contoh:

> User memiliki kompetensi A + B + C → mendapat rekomendasi program tertentu.

Keputusan penerimaan program tetap mengikuti proses resmi.

---

# 45. Product KPI

### Academy

- enrollment;
- course completion;
- quiz completion;
- certificate issued;
- monthly active learner.

### PANdawa

- application;
- participation;
- training completion;
- activity participation;
- credential active.

### Overall Mobile

- MAU/WAU;
- repeat visits;
- task completion;
- event attendance;
- check-in success;
- notification engagement;
- profile completeness.

---

# 46. Success Scenario

### Hari pertama

User mendaftar sebagai relawan → melengkapi profil → melihat kegiatan → mendaftar Amanat Academy.

### Minggu berikutnya

Menyelesaikan training → mengambil tugas di Bursa Tugas → check-in dengan QR Pass.

### Bulan berikutnya

Menemukan PANdawa → mendaftar → mengikuti program dan training.

### Menjelang Pemilu

Mengikuti Program Saksi → menyelesaikan pelatihan → bila kemudian ditetapkan dan dimandatkan melalui proses yang sah, modul SAKSI 360 aktif.

Ini menciptakan **continuous engagement journey**.

---

# 47. Proposed Mobile Information Architecture

```text
MOBILE APP
│
├── HOME
│   ├── My Status
│   ├── Quick Actions
│   ├── Active Tasks
│   ├── Upcoming Events
│   ├── Learning Progress
│   ├── Program Cards
│   └── Notifications
│
├── TUGAS
│   ├── Bursa Tugas
│   ├── Tugas Saya
│   ├── Detail
│   ├── Presensi
│   └── Riwayat
│
├── KEGIATAN
│   ├── Agenda
│   ├── Kalender
│   ├── Reservasi
│   ├── Kegiatan Saya
│   ├── Posko Relawan
│   └── Riwayat
│
├── ACADEMY
│   ├── Home
│   ├── Amanat Academy
│   ├── PANdawa
│   ├── Program Saksi
│   ├── Kelas Saya
│   ├── Progress
│   └── Sertifikat
│
└── PROFIL
    ├── My Profile
    ├── Digital ID
    ├── QR Pass
    ├── Membership
    ├── Volunteer Status
    ├── Program Passport
    ├── Skills
    ├── Activity History
    ├── Pengajuan Anggota
    ├── Kontak Korlap
    └── Settings
```

---

# 48. Recommended Mobile State Model

## Relawan biasa

```text
Volunteer = ACTIVE
PANdawa = NONE
Program Saksi = NONE
```

UI utama:

- Home
- Tugas
- Kegiatan
- Academy
- Profil

## Peserta PANdawa

```text
Volunteer = ACTIVE
PANdawa = REGISTERED / SELECTED / TRAINING / ACTIVE
```

Tambahan UI:

- PANdawa card;
- training;
- schedule;
- activity;
- credential.

## Calon saksi

```text
Volunteer = ACTIVE
Witness Candidate = READY / UNDER_REVIEW
```

Tambahan:

- Program Saksi;
- readiness;
- training status.

Belum ada:

- My TPS;
- Check-in TPS;
- TPS Report.

## Saksi resmi

```text
Witness = ACTIVE
Assignment = ACTIVE
```

Baru kemudian modul SAKSI 360 operasional tersedia.

---

# 49. Guardrails Produk

1. **Training tidak sama dengan mandat.**
2. **Program participation tidak sama dengan operational role.**
3. **Credential tidak boleh memperluas permission tanpa rule yang jelas.**
4. **Assignment harus berasal dari workflow yang berwenang.**
5. **Mobile hanya menampilkan fungsi yang relevan dengan status user.**
6. **Data pribadi dan data program mengikuti prinsip minimisasi dan kontrol akses.**
7. **PANdawa tidak boleh di-hard-code sebagai role jika definisi resminya adalah program/credential.**

---

# 50. Kesimpulan

Rancangan mobile yang direkomendasikan adalah:

```text
                    PAN MOBILE
                        │
        ┌───────────────┼────────────────┐
        │               │                │
      IDENTITY       ACTIVITIES        LEARNING
        │               │                │
        │          ┌────┼────┐           │
        │          │    │    │           │
        │        Tasks Events Check-in    │
        │                               │
        └───────────────┬───────────────┘
                        │
                  AMANAT ACADEMY
                        │
              ┌─────────┼─────────┐
              │         │         │
             Core    PANdawa    Program
           Learning            Saksi
              │         │         │
              └─────────┼─────────┘
                        │
                  CREDENTIAL
                        │
                PAN DIGITAL PASSPORT
```

### Filosofi produk

> **Amanat Academy = tempat pengguna berkembang.**

> **PANdawa = program khusus tempat pengguna mendapatkan pengalaman dan credential sesuai program.**

> **Bursa Tugas = tempat pengguna berkontribusi.**

> **Kegiatan = tempat pengguna hadir dan terlibat.**

> **PAN Digital Passport = tempat seluruh perjalanan pengguna dirangkum.**

> **SAKSI 360 = capability operasional yang hanya muncul ketika pengguna memenuhi status/penugasan yang sesuai.**

Dengan arsitektur ini, aplikasi mobile menjadi **satu pintu pengalaman digital pengguna PAN**, sementara setiap program tetap dapat mempertahankan identitas, lifecycle, dan aturan masing-masing.

---

# Lampiran A — Terminologi Produk

| Istilah | Makna |
|---|---|
| User | Identitas akun |
| Member | Status hubungan keanggotaan |
| Volunteer | Status/role relawan |
| Program | Program khusus |
| Enrollment | Keikutsertaan pada program/kursus |
| Training | Aktivitas pembelajaran |
| Credential | Bukti status/kompetensi |
| Assignment | Penugasan operasional |
| Witness | Role operasional saksi |
| Mandate | Dasar formal penugasan saksi |
| Scope | Batas objek/wilayah akses |
| Permission | Hak melakukan tindakan |
| Activity | Aktivitas lapangan |
| Check-in | Konfirmasi kehadiran |
| QR Pass | Credential/token digital untuk verifikasi |

---

# Lampiran B — Catatan Sumber dan Validasi

## Sumber resmi PAN

**Partai Amanat Nasional — Amanat Academy**  
https://www.pan.or.id/amanat-academy/

Situs resmi PAN saat ini menjelaskan Amanat Academy sebagai program pelatihan PAN yang dirancang untuk kader dan masyarakat umum untuk menambah wawasan dan kemampuan.

## Sumber publik mengenai PANdawa

**detikNews — “Siapkan Satgas Pengamanan, DPP PAN Gelar Pelatihan PANdawa”**  
https://news.detik.com/berita/d-7752452/siapkan-satgas-pengamanan-dpp-pan-gelar-pelatihan-pandawa

Artikel tanggal 27 Januari 2025 menyebut PANdawa sebagai “Pasukan Muda Tangguh dan Waspada” dan menjelaskan konteks pendidikan/pelatihan kesiapsiagaan pengamanan serta pengawalan PAN.

> **Validasi yang masih diperlukan sebelum development final:** nama resmi program, struktur status, eligibility, credential, training curriculum, assignment model, serta kewenangan pengelola PANdawa.
