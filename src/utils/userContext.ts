import { CareerStatePresetId, CurrentUser, MobileRole, Role, UserDimensions, VolunteerOpportunity, VolunteerStatePresetId } from '../types';
import { Feather } from '@expo/vector-icons';

// ============================================================================
// SAKSI 360 / PAN DIGITAL — USER CONTEXT & MULTI-ROLE PERSONALIZATION UTILS
// Sesuai Bab 4, 7, 8, 9, 10, 21, 22, 28, 29 dokumen blueprint AGENTS.md
// ============================================================================

export interface RoleCapability {
  title: string;
  desc: string;
  icon: keyof typeof Feather.glyphMap;
}

export interface ActivityTimelineItem {
  id: string;
  date: string;
  title: string;
  desc: string;
  icon: keyof typeof Feather.glyphMap;
  status: 'completed' | 'current' | 'pending';
}

// Bab 8 & 21: Matriks Kemampuan Lapangan per Mobile Role
export const ROLE_CAPABILITIES: Record<MobileRole, RoleCapability[]> = {
  WITNESS: [
    { title: 'Formulir Laporan TPS', desc: 'Input perolehan suara C1 plano dan suara sah/tidak sah partai', icon: 'file-text' },
    { title: 'Upload Bukti Dokumen', desc: 'Unggah foto Plano, kejadian khusus, dan dokumen formulir C1', icon: 'camera' },
    { title: 'GPS Check-in Bilik TPS', desc: 'Validasi kehadiran saksi berbasis geofence radius 50m TPS', icon: 'map-pin' },
    { title: 'Lapor Insiden Lapangan', desc: 'Laporkan kecurangan, intimidasi, atau logistik bermasalah', icon: 'alert-triangle' },
    { title: 'Surat Mandat Digital', desc: 'Akses SK Mandat resmi saksi KPU yang telah diverifikasi BSN PAN', icon: 'award' },
  ],
  TPS_COORDINATOR: [
    { title: 'Monitoring Saksi Kluster', desc: 'Pantau kehadiran, status check-in, dan kesiapan 6 TPS dampingan', icon: 'users' },
    { title: 'Pantau Progres TPS', desc: 'Status penghitungan suara TPS real-time di wilayah kelurahan', icon: 'check-circle' },
    { title: 'Kirim Pengingat WhatsApp', desc: 'Kirim pesan instan reminder ke saksi yang belum check-in/lapor', icon: 'message-circle' },
    { title: 'Eskalasi Masalah ke Web', desc: 'Teruskan laporan darurat langsung ke Web Command Center', icon: 'arrow-up-circle' },
    { title: 'Laporan Darurat Wilayah', desc: 'Supervisi dan tindak lanjut situasi darurat saksi di lapangan', icon: 'shield' },
  ],
  FIELD_COORDINATOR: [
    { title: 'Coverage Wilayah Kecamatan', desc: 'Monitoring sebaran seluruh TPS dan koordinator se-Kecamatan Coblong', icon: 'map' },
    { title: 'Supervisi Koordinator TPS', desc: 'Pantau performa dan respon seluruh koordinator kluster TPS', icon: 'compass' },
    { title: 'Broadcast Instruksi Lokal', desc: 'Kirim instruksi taktis lapangan kepada seluruh saksi & relawan', icon: 'radio' },
    { title: 'Penanganan Insiden Wilayah', desc: 'Triase dan koordinasi penanganan pelanggaran bersama tim hukum', icon: 'alert-octagon' },
    { title: 'Rekapitulasi Suara Dapil', desc: 'Pantau agregasi suara masuk di tingkat Panitia Pemilihan Kecamatan (PPK)', icon: 'bar-chart-2' },
  ],
  VOLUNTEER: [
    { title: 'Pengawalan Suara (GOTV)', desc: 'Mobilisasi pemilih dan pendampingan warga ke TPS wilayah', icon: 'heart' },
    { title: 'RSVP & Absensi Kegiatan', desc: 'Daftar dan scan tiket QR pass kehadiran rapat konsolidasi', icon: 'calendar' },
    { title: 'Bimtek Pelatihan Relawan', desc: 'Akses materi edukasi dan modul panduan pemantauan pemilu', icon: 'book-open' },
    { title: 'Lapor Temuan Lapangan', desc: 'Informasikan temuan dugaan pelanggaran atau isu logistik', icon: 'flag' },
    { title: 'Sertifikat Relawan PAN', desc: 'Apresiasi digital pengawal suara resmi Partai Amanat Nasional', icon: 'award' },
  ],
  MEMBER: [
    { title: 'e-KTA Digital simPAN', desc: 'Identitas keanggotaan resmi PAN dengan QR validasi server', icon: 'credit-card' },
    { title: 'Agenda & Konsolidasi Partai', desc: 'Partisipasi dalam musyawarah daerah dan apel siaga pemenangan', icon: 'calendar' },
    { title: 'Pendaftaran Program Relawan', desc: 'Daftar diri untuk penugasan pengawal suara atau saksi TPS', icon: 'user-plus' },
    { title: 'Aspirasi & Suara Kader', desc: 'Sampaikan saran dan masukan langsung ke pimpinan struktur partai', icon: 'message-square' },
    { title: 'Perlindungan Data Pribadi', desc: 'NIK dan data identitas dienkripsi sesuai UU No. 27 Tahun 2022', icon: 'lock' },
  ],
  CALEG_OPS: [
    { title: 'Monitoring Suara Dapil', desc: 'Pantau perolehan suara caleg & partai di seluruh TPS dapil', icon: 'bar-chart-2' },
    { title: 'Sebaran Relawan & Saksi', desc: 'Pemetaan penugasan tim pemenangan dan saksi TPS mandiri', icon: 'map' },
    { title: 'Laporan C1 Saksi Terverifikasi', desc: 'Akses real-time bukti foto C1 plano dari TPS tercover', icon: 'file-text' },
    { title: 'Aktivitas Lapangan & Kampanye', desc: 'Kelola agenda konsolidasi dan sosialisasi di dapil pemenangan', icon: 'calendar' },
    { title: 'Instruksi Tim Relawan Caleg', desc: 'Kirim koordinasi dan broadcast taktis ke posko pemenangan caleg', icon: 'message-square' },
  ],
};

// Bab 21: Hak Akses Granular per Mobile Role
export const ROLE_PERMISSIONS_BY_MOBILE_ROLE: Record<MobileRole, string[]> = {
  WITNESS: [
    'view_own_profile',
    'view_assigned_tps',
    'checkin_tps',
    'submit_witness_report',
    'upload_evidence',
    'submit_incident',
    'view_assigned_task',
  ],
  TPS_COORDINATOR: [
    'view_own_profile',
    'view_assigned_witnesses',
    'view_assigned_tps',
    'view_checkin_status',
    'send_task_reminder',
    'escalate_issue',
    'submit_incident',
    'view_assigned_task',
  ],
  FIELD_COORDINATOR: [
    'view_own_profile',
    'view_assigned_witnesses',
    'view_assigned_tps',
    'view_checkin_status',
    'send_task_reminder',
    'escalate_issue',
    'submit_incident',
    'send_broadcast',
    'view_assigned_task',
  ],
  VOLUNTEER: [
    'view_own_profile',
    'view_volunteer_profile',
    'view_volunteer_task',
    'view_activity',
    'join_activity',
    'checkin_activity',
    'submit_incident',
    'view_assigned_task',
  ],
  MEMBER: [
    'view_own_profile',
    'edit_own_profile',
    'view_activity',
    'join_activity',
    'checkin_activity',
    'apply_volunteer',
    'view_assigned_task',
  ],
  CALEG_OPS: [
    'view_own_profile',
    'view_caleg_dashboard',
    'view_dapil_votes',
    'view_assigned_witnesses',
    'view_assigned_tps',
    'view_activity',
    'join_activity',
    'send_broadcast',
    'view_assigned_task',
  ],
};

// Bab 28 & 29: Riwayat Aktivitas & Assignment Timeline Kader
export const ROLE_ACTIVITY_TIMELINE: Record<string, ActivityTimelineItem[]> = {
  'ahmad.fauzan@pan.go.id': [
    { id: 'act-fz-1', date: '18 Sep 2026', title: 'Lulus Diklat Saksi BSN & Terbit SK Mandat', desc: 'Menyelesaikan modul sertifikasi Saksi Resmi TPS BSN PAN (Skor 100).', icon: 'award', status: 'completed' },
    { id: 'act-fz-2', date: '15 Agu 2026', title: 'Penugasan Caleg DPR-RI Dapil Jabar I', desc: 'SK Penetapan Calon Legislatif Partai Amanat Nasional Nomor: 128/SK/DPP-PAN/2026.', icon: 'award', status: 'completed' },
    { id: 'act-fz-3', date: '10 Jan 2024', title: 'Penerbitan e-KTA Digital simPAN', desc: 'Resmi terdaftar sebagai Anggota Tetap PAN Kota Bandung.', icon: 'credit-card', status: 'completed' },
  ],
  'siti.rahmawati@relawanpan.id': [
    { id: 'act-st-1', date: '16 Sep 2026', title: 'Lulus Bimtek Pengawal Suara & Terakreditasi BSN', desc: 'Menyelesaikan modul Bimtek Saksi TPS 018 Braga di Amanat Academy.', icon: 'award', status: 'completed' },
    { id: 'act-st-2', date: '10 Sep 2026', title: 'Mobilisasi 45 Calon Pemilih Posko Braga', desc: 'Pendataan dan asistensi pemilih pemula & lansia di Kelurahan Braga.', icon: 'users', status: 'completed' },
    { id: 'act-st-3', date: '01 Mar 2024', title: 'Registrasi Relawan Simpatisan PAN', desc: 'Bergabung di Posko Pemenangan Relawan Kecamatan Sumur Bandung.', icon: 'heart', status: 'completed' },
  ],
  'saksi@pan.go.id': [
    { id: 'act-1', date: '17 Sep 2026', title: 'Lulus Bimtek & Sertifikasi Saksi BSN', desc: 'Menyelesaikan modul sertifikasi Saksi Resmi TPS PAN dengan skor 95/100.', icon: 'award', status: 'completed' },
    { id: 'act-2', date: '10 Sep 2026', title: 'Menerima SK Mandat Saksi TPS 001', desc: 'SK Penugasan No. 042/MND/PAN-BDG/2026 diterbitkan oleh DPD PAN Kota Bandung.', icon: 'file-text', status: 'completed' },
    { id: 'act-3', date: '01 Sep 2026', title: 'Check-in Apel Siaga Saksi Coblong', desc: 'Hadir di Posko Pemenangan DPC Coblong untuk briefing teknis C1.', icon: 'map-pin', status: 'completed' },
    { id: 'act-4', date: '15 Jan 2024', title: 'Terdaftar Relawan Simpatisan PAN', desc: 'Bergabung sebagai relawan pemenangan dengan ID REL-3273-2024-0018.', icon: 'heart', status: 'completed' },
  ],
  'relawan@pan.go.id': [
    { id: 'act-1', date: '15 Sep 2026', title: 'Mobilisasi Pemilih Posko Dago', desc: 'Mendata 45 warga calon pemilih lansia & pemilih pemula.', icon: 'users', status: 'completed' },
    { id: 'act-2', date: '01 Sep 2026', title: 'Check-in Bimtek Relawan Muda PAN', desc: 'Mengikuti pembekalan tata cara pengawalan suara di DPD Kota Bandung.', icon: 'calendar', status: 'completed' },
    { id: 'act-3', date: '01 Mar 2024', title: 'Terdaftar sebagai Relawan Simpatisan', desc: 'Bergabung dalam Posko Relawan Simpatisan Kecamatan Coblong.', icon: 'heart', status: 'completed' },
  ],
  'korlap@pan.go.id': [
    { id: 'act-1', date: '16 Sep 2026', title: 'Verifikasi Kesiapan 6 TPS Kluster', desc: 'Seluruh saksi di 6 TPS dampingan Kelurahan Dago telah terkonfirmasi siap bertugas.', icon: 'shield', status: 'completed' },
    { id: 'act-2', date: '10 Sep 2026', title: 'Penetapan Koordinator TPS Kluster 6', desc: 'SK Koordinator Lapangan diterbitkan oleh Tim Pemenangan Dapil Jabar I.', icon: 'award', status: 'completed' },
    { id: 'act-3', date: '15 Agu 2026', title: 'Simulasi Hitung C1 & Pelaporan Cepat', desc: 'Memimpin gladi bersih saksi se-Kecamatan Coblong.', icon: 'check-circle', status: 'completed' },
  ],
  'kader@pan.go.id': [
    { id: 'act-1', date: '17 Sep 2026', title: 'Rapat Konsolidasi Caleg & Pengurus DPD', desc: 'Hadir pada konsolidasi internal pemenangan kursi DPR-RI Dapil Jabar I.', icon: 'users', status: 'completed' },
    { id: 'act-2', date: '01 Jan 2024', title: 'Penetapan Calon Legislatif Partai', desc: 'Terdaftar sebagai Calon Anggota Parlemen DPR-RI Dapil Jabar I.', icon: 'award', status: 'completed' },
    { id: 'act-3', date: '15 Jan 2020', title: 'Kaderisasi LKK Madya Partai', desc: 'Menyelesaikan jenjang kaderisasi Partai Amanat Nasional.', icon: 'check-circle', status: 'completed' },
  ],
};

// ============================================================================
// STATE PRESETS UNTUK LIVE DEMO DPP PAN
// ============================================================================
export interface CareerPresetMeta {
  id: CareerStatePresetId;
  name: string;
  badge: string;
  desc: string;
  dimensions: UserDimensions;
  role: MobileRole;
}

export const CAREER_PRESETS: Record<CareerStatePresetId, CareerPresetMeta> = {
  state_1: {
    id: 'state_1',
    name: 'State 1: Anggota Pemula',
    badge: 'Anggota Baru',
    desc: 'Akun baru mendaftar, e-KTA simPAN aktif, orientasi anggota baru.',
    role: 'MEMBER',
    dimensions: {
      membership: 'active',
      kader: 'non_kader',
      position: { position: 'NONE', region: 'Kota Bandung' },
      electoral: { status: 'NONE' },
      volunteer: 'none',
      programs: { amanatAcademy: 'NONE', pandawa: 'NONE', programSaksi: 'NONE' },
      operationalRole: 'MEMBER',
    },
  },
  state_2: {
    id: 'state_2',
    name: 'State 2: Kader LKK + Relawan',
    badge: 'Kader & Relawan',
    desc: 'Lulus LKK di Amanat Academy, aktif di posko & Satgas PANdawa, Diklat Saksi 80%.',
    role: 'VOLUNTEER',
    dimensions: {
      membership: 'active',
      kader: 'kader_aktif',
      position: { position: 'NONE', region: 'Kota Bandung' },
      electoral: { status: 'NONE' },
      volunteer: 'active',
      programs: {
        amanatAcademy: 'ACTIVE',
        academyProgress: 80,
        pandawa: 'ACTIVE',
        programSaksi: 'TRAINING',
        saksiProgress: 80,
      },
      operationalRole: 'VOLUNTEER',
    },
  },
  state_3: {
    id: 'state_3',
    name: 'State 3: Saksi TPS Resmi BSN',
    badge: 'Saksi TPS 014',
    desc: 'Mengantongi SK Mandat BSN, mode saksi bilik suara aktif penuh (C1 Plano & GPS).',
    role: 'WITNESS',
    dimensions: {
      membership: 'active',
      kader: 'kader_aktif',
      position: { position: 'NONE', region: 'Kota Bandung' },
      electoral: { status: 'NONE' },
      volunteer: 'active',
      programs: {
        amanatAcademy: 'GRADUATED',
        academyProgress: 100,
        pandawa: 'ACTIVE',
        programSaksi: 'MANDATED',
        saksiProgress: 100,
        skMandatNumber: 'BSN/DPD-BDG/2024/014',
      },
      operationalRole: 'WITNESS',
    },
  },
  state_4: {
    id: 'state_4',
    name: 'State 4: Koordinator TPS DPC',
    badge: 'Koordinator 15 TPS',
    desc: 'Mandat supervisi 15 TPS di Kecamatan Sumur Bandung (monitoring & broadcast).',
    role: 'TPS_COORDINATOR',
    dimensions: {
      membership: 'active',
      kader: 'kader_aktif',
      position: {
        position: 'KOORDINATOR',
        level: 'DPC',
        region: 'DPC Sumur Bandung (15 TPS)',
        roleTitle: 'Koordinator TPS DPC',
      },
      electoral: { status: 'NONE' },
      volunteer: 'active',
      programs: {
        amanatAcademy: 'GRADUATED',
        academyProgress: 100,
        pandawa: 'ACTIVE',
        programSaksi: 'MANDATED',
        saksiProgress: 100,
      },
      operationalRole: 'TPS_COORDINATOR',
    },
  },
  state_5: {
    id: 'state_5',
    name: 'State 5: Pengurus DPD & Caleg 2029',
    badge: 'Sekretaris & Caleg',
    desc: 'Sekretaris DPD Kota Bandung & Caleg DPR-RI Jabar I (Peta Dapil & Audit KPPN).',
    role: 'CALEG_OPS',
    dimensions: {
      membership: 'active',
      kader: 'kader_aktif',
      position: {
        position: 'PENGURUS',
        level: 'DPD',
        region: 'DPD PAN Kota Bandung',
        roleTitle: 'Sekretaris DPD',
        isPrimary: true,
      },
      electoral: {
        status: 'CALEG',
        electionYear: 2029,
        legislativeLevel: 'DPR_RI',
        dapil: 'Jawa Barat I (Kota Bandung & Cimahi)',
        periodLabel: 'Caleg PAN DPR-RI 2029',
        ballotNumber: 1,
      },
      volunteer: 'active',
      programs: {
        amanatAcademy: 'GRADUATED',
        academyProgress: 100,
        pandawa: 'ACTIVE',
        programSaksi: 'MANDATED',
        saksiProgress: 100,
      },
      operationalRole: 'CALEG_OPS',
    },
  },
  state_6: {
    id: 'state_6',
    name: 'State 6: Uji Kelola Status',
    badge: 'Menunggu Review',
    desc: 'Simulasi pengunduran diri anggota (Review DPD) dan jeda relawan (Task Guard).',
    role: 'MEMBER',
    dimensions: {
      membership: 'resignation_requested',
      kader: 'kader_aktif',
      position: {
        position: 'PENGURUS',
        level: 'DPD',
        region: 'DPD PAN Kota Bandung',
        roleTitle: 'Sekretaris DPD',
      },
      electoral: {
        status: 'CALEG',
        electionYear: 2029,
        legislativeLevel: 'DPR_RI',
        dapil: 'Jawa Barat I',
      },
      volunteer: 'paused',
      programs: {
        amanatAcademy: 'GRADUATED',
        academyProgress: 100,
        pandawa: 'ACTIVE',
        programSaksi: 'MANDATED',
        saksiProgress: 100,
      },
      operationalRole: 'MEMBER',
    },
  },
};

export interface VolunteerPresetMeta {
  id: VolunteerStatePresetId;
  name: string;
  badge: string;
  desc: string;
  dimensions: UserDimensions;
  role: MobileRole;
}

export const VOLUNTEER_PRESETS: Record<VolunteerStatePresetId, VolunteerPresetMeta> = {
  state_r1: {
    id: 'state_r1',
    name: 'Relawan Posko & Lapangan',
    badge: 'Relawan Posko',
    desc: 'Bursa tugas posko, presensi giat baksos, dan opsi onboarding KTA simPAN.',
    role: 'VOLUNTEER',
    dimensions: {
      membership: 'inactive',
      kader: 'non_kader',
      position: { position: 'NONE', region: 'Kota Bandung' },
      electoral: { status: 'NONE' },
      volunteer: 'active',
      programs: {
        amanatAcademy: 'ACTIVE',
        academyProgress: 80,
        pandawa: 'ACTIVE',
        programSaksi: 'TRAINING',
        saksiProgress: 80,
      },
      operationalRole: 'VOLUNTEER',
    },
  },
  state_r2: {
    id: 'state_r2',
    name: 'Relawan Mandat Saksi TPS 018 Braga',
    badge: 'Saksi TPS 018 Mandat BSN',
    desc: 'Telah terakreditasi Bimtek & ber-SK Mandat resmi kawal bilik suara TPS 018.',
    role: 'WITNESS',
    dimensions: {
      membership: 'inactive',
      kader: 'non_kader',
      position: { position: 'NONE', region: 'Kota Bandung' },
      electoral: { status: 'NONE' },
      volunteer: 'active',
      programs: {
        amanatAcademy: 'GRADUATED',
        academyProgress: 100,
        pandawa: 'ACTIVE',
        programSaksi: 'MANDATED',
        saksiProgress: 100,
        skMandatNumber: 'BSN/DPD-BDG/2024/018',
      },
      operationalRole: 'WITNESS',
    },
  },
};

// Bab 4, 7, 9: Database Profil Terpersonalisasi Tiap Akun Resmi Mobile
export const USER_PROFILES_BY_EMAIL: Record<string, CurrentUser> = {
  'ahmad.fauzan@pan.go.id': {
    id: 'USR-FAUZAN',
    identity: {
      id: 'USR-FAUZAN',
      name: 'Ahmad Fauzan',
      nikMasked: '327301******0892',
      nikFull: '3273011405900892',
      phone: '0812-9988-7766',
      email: 'ahmad.fauzan@pan.go.id',
      avatarIndex: 1,
      status: 'active',
    },
    memberships: [
      {
        type: 'member',
        status: 'active',
        ktaNumber: 'PAN-3273-2024-00892',
        registeredAt: '2024-01-10',
        dpc: 'DPC Sumur Bandung',
        dpd: 'DPD Kota Bandung',
      },
      {
        type: 'volunteer',
        status: 'active',
        registeredAt: '2024-02-15',
        dpc: 'DPC Sumur Bandung',
      },
    ],
    roles: [
      {
        role: 'MEMBER',
        status: 'active',
        scope: { level: 'REGENCY', code: '3273', name: 'DPD PAN Kota Bandung' },
        assignedAt: '10 Jan 2024',
      },
      {
        role: 'CALEG_OPS',
        status: 'active',
        scope: { level: 'PROVINCE', code: 'JABAR-1', name: 'Dapil DPR-RI Jabar I (Kota Bandung & Cimahi)' },
        assignedAt: '01 Agu 2026',
      },
      {
        role: 'TPS_COORDINATOR',
        status: 'active',
        scope: { level: 'DISTRICT', code: '327302', name: 'DPC Sumur Bandung (15 TPS)' },
        assignedAt: '15 Agu 2026',
      },
      {
        role: 'WITNESS',
        status: 'assigned',
        scope: { level: 'TPS', code: 'TPS-014', name: 'TPS 014 Kel. Merdeka' },
        assignedAt: '01 Sep 2026',
      },
      {
        role: 'VOLUNTEER',
        status: 'active',
        scope: { level: 'DISTRICT', code: '327302', name: 'Kecamatan Sumur Bandung' },
        assignedAt: '15 Feb 2024',
      },
    ],
    currentRole: 'MEMBER',
    permissions: ROLE_PERMISSIONS_BY_MOBILE_ROLE.MEMBER,
    dimensions: CAREER_PRESETS.state_5.dimensions,
  },

  'siti.rahmawati@relawanpan.id': {
    id: 'USR-SITI',
    identity: {
      id: 'USR-SITI',
      name: 'Siti Rahmawati',
      nikMasked: '327301******0042',
      nikFull: '3273015506990042',
      phone: '0821-4455-6677',
      email: 'siti.rahmawati@relawanpan.id',
      avatarIndex: 5,
      status: 'active',
    },
    memberships: [
      {
        type: 'volunteer',
        status: 'active',
        ktaNumber: 'REL-3273-2024-0042',
        registeredAt: '2024-03-01',
        dpc: 'Posko Sumur Bandung',
      },
    ],
    roles: [
      {
        role: 'VOLUNTEER',
        status: 'active',
        scope: { level: 'DISTRICT', code: '327302', name: 'Posko Kel. Braga, Kec. Sumur Bandung' },
        assignedAt: '01 Mar 2024',
      },
    ],
    currentRole: 'VOLUNTEER',
    permissions: ROLE_PERMISSIONS_BY_MOBILE_ROLE.VOLUNTEER,
    skills: ['Komunikasi Publik & Warga', 'Administrasi Acara & Presensi', 'Fotografi & Konten Medsos'],
    interests: ['Event & Sosialisasi', 'Advokasi Lansia/Pemilih', 'Logistik Posko & Dapur Umum'],
    volunteerStats: {
      eventsAttended: 6,
      tasksCompleted: 9,
      trainingHours: 14,
      activitiesCount: 16,
    },
    coordinatorContact: {
      name: 'Hendra Gunawan',
      phone: '0813-2211-4455',
      role: 'Koordinator Lapangan Kecamatan',
      posko: 'Posko Pemenangan Braga No. 12',
      region: 'Sumur Bandung',
    },
    dimensions: VOLUNTEER_PRESETS.state_r1.dimensions,
  },

  'saksi@pan.go.id': {
    id: 'USR-001',
    identity: {
      id: 'USR-001',
      name: 'Rudi Saputra',
      nikMasked: '327301******0001',
      nikFull: '3273011204920001',
      phone: '0812-3456-7890',
      email: 'saksi@pan.go.id',
      avatarIndex: 0,
      status: 'active',
    },
    memberships: [
      {
        type: 'volunteer',
        status: 'active',
        ktaNumber: 'REL-3273-2024-0018',
        registeredAt: '2024-01-15',
        dpc: 'DPC Coblong',
        dpd: 'DPD Kota Bandung',
      },
    ],
    roles: [
      {
        role: 'WITNESS',
        status: 'assigned',
        scope: { level: 'TPS', code: 'TPS-001', name: 'TPS 001 Kel. Dago, Kec. Coblong' },
        assignedAt: '01 Sep 2026',
      },
    ],
    currentRole: 'WITNESS',
    permissions: ROLE_PERMISSIONS_BY_MOBILE_ROLE.WITNESS,
  },

  'relawan@pan.go.id': {
    id: 'USR-002',
    identity: {
      id: 'USR-002',
      name: 'Siti Rahmawati',
      nikMasked: '327301******0002',
      nikFull: '3273015408950002',
      phone: '0813-9876-5432',
      email: 'relawan@pan.go.id',
      avatarIndex: 1,
      status: 'active',
    },
    memberships: [
      {
        type: 'volunteer',
        status: 'active',
        ktaNumber: 'REL-3273-2024-0042',
        registeredAt: '2024-03-01',
        dpc: 'DPC Coblong',
        dpd: 'DPD Kota Bandung',
      },
    ],
    roles: [
      {
        role: 'VOLUNTEER',
        status: 'active',
        scope: { level: 'DISTRICT', code: '327301', name: 'Kecamatan Coblong' },
        assignedAt: '01 Mar 2024',
      },
    ],
    currentRole: 'VOLUNTEER',
    permissions: ROLE_PERMISSIONS_BY_MOBILE_ROLE.VOLUNTEER,
    skills: ['Komunikasi Publik & Warga', 'Administrasi Acara & Presensi', 'Fotografi & Konten Medsos'],
    interests: ['Event & Sosialisasi', 'Advokasi Lansia/Pemilih', 'Logistik Posko & Dapur Umum'],
    volunteerStats: {
      eventsAttended: 5,
      tasksCompleted: 8,
      trainingHours: 12,
      activitiesCount: 15,
    },
    candidateStatus: 'TRAINED',
    coordinatorContact: {
      name: 'Asep Ridwan (Korlap Coblong)',
      phone: '0811-2233-4455',
      role: 'Koordinator Lapangan Kecamatan',
      posko: 'Posko Pemenangan Dago Atas No. 84',
    },
  },

  'korlap@pan.go.id': {
    id: 'USR-003',
    identity: {
      id: 'USR-003',
      name: 'Asep Ridwan',
      nikMasked: '327301******0003',
      nikFull: '3273011802800003',
      phone: '0811-2233-4455',
      email: 'korlap@pan.go.id',
      avatarIndex: 2,
      status: 'active',
    },
    memberships: [
      {
        type: 'member',
        status: 'verified',
        ktaNumber: '32.73.01.2019.04321',
        registeredAt: '2019-01-15',
        dpc: 'DPC Coblong',
        dpd: 'DPD Kota Bandung',
      },
    ],
    roles: [
      {
        role: 'TPS_COORDINATOR',
        status: 'active',
        scope: { level: 'DISTRICT', code: '327301', name: 'Kluster 6 TPS Kel. Dago' },
        assignedAt: '10 Sep 2026',
      },
      {
        role: 'FIELD_COORDINATOR',
        status: 'active',
        scope: { level: 'DISTRICT', code: '327301', name: 'Kecamatan Coblong' },
        assignedAt: '15 Agu 2026',
      },
      {
        role: 'MEMBER',
        status: 'active',
        scope: { level: 'REGENCY', code: '3273', name: 'DPD PAN Kota Bandung' },
        assignedAt: '01 Jan 2019',
      },
    ],
    currentRole: 'TPS_COORDINATOR',
    permissions: ROLE_PERMISSIONS_BY_MOBILE_ROLE.TPS_COORDINATOR,
  },

  'korlap.wilayah@pan.go.id': {
    id: 'USR-003W',
    identity: {
      id: 'USR-003W',
      name: 'Asep Ridwan',
      nikMasked: '327301******0003',
      nikFull: '3273011802800003',
      phone: '0811-2233-4455',
      email: 'korlap.wilayah@pan.go.id',
      avatarIndex: 2,
      status: 'active',
    },
    memberships: [
      {
        type: 'member',
        status: 'verified',
        ktaNumber: '32.73.01.2019.04321',
        registeredAt: '2019-01-15',
        dpc: 'DPC Coblong',
        dpd: 'DPD Kota Bandung',
      },
    ],
    roles: [
      {
        role: 'FIELD_COORDINATOR',
        status: 'active',
        scope: { level: 'DISTRICT', code: '327301', name: 'Kecamatan Coblong' },
        assignedAt: '15 Agu 2026',
      },
      {
        role: 'TPS_COORDINATOR',
        status: 'active',
        scope: { level: 'DISTRICT', code: '327301', name: 'Kluster 6 TPS Kel. Dago' },
        assignedAt: '10 Sep 2026',
      },
      {
        role: 'MEMBER',
        status: 'active',
        scope: { level: 'REGENCY', code: '3273', name: 'DPD PAN Kota Bandung' },
        assignedAt: '01 Jan 2019',
      },
    ],
    currentRole: 'FIELD_COORDINATOR',
    permissions: ROLE_PERMISSIONS_BY_MOBILE_ROLE.FIELD_COORDINATOR,
  },

  'kader@pan.go.id': {
    id: 'USR-004',
    identity: {
      id: 'USR-004',
      name: 'Fajar Pratama Nugraha, S.T.',
      nikMasked: '327301******0005',
      nikFull: '3273011508920005',
      phone: '0813-2211-4433',
      email: 'kader@pan.go.id',
      avatarIndex: 3,
      status: 'active',
    },
    memberships: [
      {
        type: 'member',
        status: 'verified',
        ktaNumber: '32.73.01.2020.00789',
        registeredAt: '2020-01-15',
        dpc: 'DPC Coblong',
        dpd: 'DPD Kota Bandung',
      },
    ],
    roles: [
      {
        role: 'MEMBER',
        status: 'active',
        scope: { level: 'REGENCY', code: '3273', name: 'DPD PAN Kota Bandung' },
        assignedAt: '15 Jan 2020',
      },
      {
        role: 'VOLUNTEER',
        status: 'active',
        scope: { level: 'REGENCY', code: '3273', name: 'Dapil Jabar I' },
        assignedAt: '01 Jan 2024',
      },
      {
        role: 'WITNESS',
        status: 'assigned',
        scope: { level: 'TPS', code: 'TPS-001', name: 'TPS 001 Kel. Dago' },
        assignedAt: '01 Sep 2026',
      },
    ],
    currentRole: 'MEMBER',
    permissions: ROLE_PERMISSIONS_BY_MOBILE_ROLE.MEMBER,
  },

  'anggota@pan.go.id': {
    id: 'USR-005',
    identity: {
      id: 'USR-005',
      name: 'Dina Permata',
      nikMasked: '327301******0006',
      nikFull: '3273016209980006',
      phone: '0857-1122-3344',
      email: 'anggota@pan.go.id',
      avatarIndex: 4,
      status: 'active',
    },
    memberships: [
      {
        type: 'member',
        status: 'verified',
        ktaNumber: '32.73.01.2024.19874',
        registeredAt: '2024-06-20',
        dpc: 'DPC Coblong',
        dpd: 'DPD Kota Bandung',
      },
    ],
    roles: [
      {
        role: 'MEMBER',
        status: 'active',
        scope: { level: 'DISTRICT', code: '327301', name: 'DPC PAN Coblong' },
        assignedAt: '20 Jun 2024',
      },
      {
        role: 'VOLUNTEER',
        status: 'active',
        scope: { level: 'TPS', code: '32730101', name: 'Kelurahan Dago' },
        assignedAt: '01 Agu 2024',
      },
    ],
    currentRole: 'MEMBER',
    permissions: ROLE_PERMISSIONS_BY_MOBILE_ROLE.MEMBER,
  },
};

export function getUserContext(role: Role, email?: string): CurrentUser {
  if (email && USER_PROFILES_BY_EMAIL[email.toLowerCase().trim()]) {
    const base = USER_PROFILES_BY_EMAIL[email.toLowerCase().trim()];
    const isMobile = (['WITNESS', 'VOLUNTEER', 'TPS_COORDINATOR', 'FIELD_COORDINATOR', 'MEMBER'] as MobileRole[]).includes(role as MobileRole);
    return {
      ...base,
      currentRole: isMobile ? (role as MobileRole) : base.currentRole,
      permissions: isMobile ? ROLE_PERMISSIONS_BY_MOBILE_ROLE[role as MobileRole] : base.permissions,
    };
  }

  // Fallback by role
  switch (role) {
    case 'VOLUNTEER':
    case 'RELAWAN':
      return USER_PROFILES_BY_EMAIL['relawan@pan.go.id'];
    case 'TPS_COORDINATOR':
      return USER_PROFILES_BY_EMAIL['korlap@pan.go.id'];
    case 'FIELD_COORDINATOR':
      return USER_PROFILES_BY_EMAIL['korlap.wilayah@pan.go.id'];
    case 'MEMBER':
    case 'KADER_ANGGOTA':
      return USER_PROFILES_BY_EMAIL['kader@pan.go.id'];
    case 'WITNESS':
    case 'TPS_WITNESS':
    default:
      return USER_PROFILES_BY_EMAIL['saksi@pan.go.id'];
  }
}

export function getPermissionsForRole(role: MobileRole): string[] {
  return ROLE_PERMISSIONS_BY_MOBILE_ROLE[role] ?? ROLE_PERMISSIONS_BY_MOBILE_ROLE.MEMBER;
}

// Bab 5.2: Bursa Peluang Penugasan Relawan Lapangan (Bukan Saksi TPS)
export const INITIAL_VOLUNTEER_OPPORTUNITIES: VolunteerOpportunity[] = [
  {
    id: 'opp-1',
    title: 'Distribusi Undangan Simpatisan & Warga Dago',
    category: 'Sosialisasi',
    location: 'RW 03 - RW 07 Kelurahan Dago',
    date: '19 Sep 2026',
    time: '08:00 - 12:00 WIB',
    neededSlots: 6,
    filledSlots: 4,
    isJoined: true,
    coordinatorName: 'Asep Ridwan (Korlap Dago)',
    description: 'Penyaluran flyer visi-misi PAN dan undangan konsolidasi warga pemilih ke rumah-rumah di wilayah Dago.',
  },
  {
    id: 'opp-2',
    title: 'Registrasi Peserta & Meja Presensi Konsolidasi DPD',
    category: 'Registrasi Posko',
    location: 'Ballroom Hotel Jayakarta, Bandung',
    date: '21 Sep 2026',
    time: '13:00 - 17:30 WIB',
    neededSlots: 8,
    filledSlots: 5,
    isJoined: false,
    coordinatorName: 'Asep Ridwan (Korlap Dago)',
    description: 'Menyambut kader & relawan se-Kota Bandung, validasi QR Digital ID, serta pembagian rompi dan paket posko.',
  },
  {
    id: 'opp-3',
    title: 'Tim Dokumentasi & Konten Lapangan Posko Dago',
    category: 'Dokumentasi',
    location: 'Posko Pemenangan Dago Atas No. 84',
    date: '22 Sep 2026',
    time: '10:00 - 15:00 WIB',
    neededSlots: 4,
    filledSlots: 2,
    isJoined: false,
    coordinatorName: 'Asep Ridwan (Korlap Dago)',
    description: 'Dokumentasi foto & video interaksi relawan dengan warga untuk publikasi media sosial PAN Juara.',
  },
  {
    id: 'opp-4',
    title: 'Pendampingan Pemilih Lansia & Disabilitas ke TPS',
    category: 'Pengawalan Warga',
    location: 'Area Dampingan Kelurahan Dago',
    date: 'Hari Pemungutan Suara',
    time: '07:00 - 12:00 WIB',
    neededSlots: 10,
    filledSlots: 7,
    isJoined: false,
    coordinatorName: 'Asep Ridwan (Korlap Dago)',
    description: 'Membantu mobilitas warga sepuh dan disabilitas dari rumah ke gerbang TPS (di luar bilik suara) agar dapat menyalurkan hak suara.',
  },
];



export function applyCareerPreset(user: CurrentUser, presetId: CareerStatePresetId): CurrentUser {
  const preset = CAREER_PRESETS[presetId];
  if (!preset) return user;

  const nextDims: UserDimensions = {
    ...user.dimensions,
    ...preset.dimensions,
    operationalRole: preset.role,
  };

  const nextRoles = [...user.roles];
  if (!nextRoles.some((r) => r.role === preset.role)) {
    nextRoles.push({
      role: preset.role,
      status: 'active',
      scope: { level: 'REGENCY', code: '3273', name: 'DPD PAN Kota Bandung' },
      assignedAt: '10 Jan 2024',
    });
  }

  return {
    ...user,
    currentRole: preset.role,
    permissions: ROLE_PERMISSIONS_BY_MOBILE_ROLE[preset.role as MobileRole] ?? user.permissions,
    dimensions: nextDims,
    resignationRequest:
      presetId === 'state_6'
        ? {
            reason: 'Kesibukan Profesional',
            note: 'Melanjutkan studi doktoral dan penugasan dinas luar kota.',
            requestedAt: '18 Sep 2026',
          }
        : undefined,
    volunteerPauseInfo:
      presetId === 'state_6'
        ? {
            isPaused: true,
            reason: 'Pendidikan',
            durationMonths: 3,
          }
        : undefined,
  };
}

export function applyVolunteerPreset(user: CurrentUser, presetId: VolunteerStatePresetId): CurrentUser {
  const preset = VOLUNTEER_PRESETS[presetId];
  if (!preset) return user;

  const nextDims: UserDimensions = {
    ...user.dimensions,
    ...preset.dimensions,
    operationalRole: preset.role,
  };

  const nextRoles =
    presetId === 'state_r1'
      ? user.roles.filter((r) => r.role === 'VOLUNTEER')
      : user.roles.some((r) => r.role === 'WITNESS')
      ? user.roles
      : [
          ...user.roles,
          {
            role: 'WITNESS' as MobileRole,
            status: 'assigned' as const,
            scope: { level: 'TPS' as const, code: 'TPS-018', name: 'TPS 018 Kel. Braga' },
            assignedAt: '10 Sep 2026',
          },
        ];

  return {
    ...user,
    currentRole: preset.role,
    permissions: ROLE_PERMISSIONS_BY_MOBILE_ROLE[preset.role as MobileRole] ?? user.permissions,
    roles: nextRoles,
    dimensions: nextDims,
  };
}
