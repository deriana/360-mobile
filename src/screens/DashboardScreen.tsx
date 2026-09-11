import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Card, KpiCard, Pill, SectionTitle, StatusBadge } from '../components/ui';
import { fontSize, iconStrokeWidth, radius, shadow, spacing } from '../theme';
import { CURRENT_WITNESS_ID, ROLE_LABEL, ROLE_SCOPE_DESCRIPTION, getUserProfile, scopeTps, scopeWitnesses } from '../utils/scope';
import { BRAND_ASSETS, IMAGES, getWitnessAvatar, getTpsPhoto } from '../data/images';

const ITEMS_PER_PAGE = 5;

interface BentoItem {
  id: string;
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle: string;
  tone?: 'primary' | 'danger' | 'success' | 'warning';
  badge?: string;
  onPress: () => void;
}

export default function DashboardScreen({ navigation }: any) {
  const { role, tps, witnesses } = useApp();
  const { colors } = useTheme();

  const isCoordinator = role === 'TPS_COORDINATOR';
  const isOperator = role === 'OPERATOR';

  const [tpsPage, setTpsPage] = useState(1);
  const [witnessPage, setWitnessPage] = useState(1);
  const [attendancePage, setAttendancePage] = useState(1);
  const [attendanceSort, setAttendanceSort] = useState<'best' | 'worst'>('best');

  const scopedTps = scopeTps(role, tps, witnesses);
  const scopedWitnesses = scopeWitnesses(role, witnesses, scopedTps);

  const checkedInCount = scopedWitnesses.filter((w) => w.status === 'checked_in').length;
  const reportedCount = scopedTps.filter((t) => t.status === 'done').length;

  // Pagination calculations for Operator Scope
  const totalTpsPages = Math.ceil(scopedTps.length / ITEMS_PER_PAGE);
  const paginatedTps = scopedTps.slice((tpsPage - 1) * ITEMS_PER_PAGE, tpsPage * ITEMS_PER_PAGE);

  const totalWitnessPages = Math.ceil(scopedWitnesses.length / ITEMS_PER_PAGE);
  const paginatedWitnesses = scopedWitnesses.slice((witnessPage - 1) * ITEMS_PER_PAGE, witnessPage * ITEMS_PER_PAGE);

  // Per-TPS attendance breakdown, sortable best-first or worst-first.
  const attendanceByTps = [...scopedTps]
    .map((t) => {
      const ws = scopedWitnesses.filter((w) => w.assignedTpsId === t.id);
      const hadir = ws.filter((w) => w.status === 'checked_in').length;
      const total = ws.length;
      return { tps: t, hadir, total, pct: total > 0 ? Math.round((hadir / total) * 100) : 0 };
    })
    .sort((a, b) => (attendanceSort === 'best' ? b.pct - a.pct : a.pct - b.pct));
  const fullyPresentTpsCount = attendanceByTps.filter((a) => a.pct === 100).length;
  const totalAttendancePages = Math.ceil(attendanceByTps.length / ITEMS_PER_PAGE);
  const paginatedAttendance = attendanceByTps.slice(
    (attendancePage - 1) * ITEMS_PER_PAGE,
    attendancePage * ITEMS_PER_PAGE,
  );

  // -------------------------------------------------------------
  // VIEW FOR CALEG (DAPIL JABAR I — SUARA PRIBADI & PROGRESS DAPIL)
  // -------------------------------------------------------------
  if (role === 'CALEG') {
    const calegBentoItems: BentoItem[] = [
      {
        id: 'suara',
        icon: 'bar-chart-2',
        title: 'Hitung Suara Parpol',
        subtitle: 'Perolehan PAN & Ambang Batas',
        badge: '7.24% Nasional',
        onPress: () => navigation.navigate('PartyLeaderboard'),
      },
      {
        id: 'roster',
        icon: 'users',
        title: 'Caleg PAN Dapil Jabar I',
        subtitle: 'Daftar Caleg DPR RI & Suara',
        onPress: () => navigation.navigate('PartyRoster', { party: 'PAN' }),
      },
      {
        id: 'kawal',
        icon: 'grid',
        title: 'Status Kawal C1 TPS',
        subtitle: 'Monitoring Saksi TPS di Dapil',
        onPress: () => navigation.navigate('Supervision'),
      },
      {
        id: 'darurat',
        icon: 'alert-triangle',
        title: 'Laporan Saksi Lapangan',
        subtitle: 'Cek Kendala & Dugaan Curang',
        tone: 'danger',
        onPress: () => navigation.navigate('EmergencyList'),
      },
      {
        id: 'bacaleg',
        icon: 'award',
        title: 'Syarat & Berkas Caleg',
        subtitle: 'Status Verifikasi KPU & Partai',
        onPress: () => navigation.navigate('SimpanBacaleg'),
      },
      {
        id: 'news',
        icon: 'file-text',
        title: 'Instruksi DPP & BSN',
        subtitle: 'Warta Pengawalan Suara',
        onPress: () => navigation.navigate('SimpanNews'),
      },
    ];

    return (
      <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
        <PersonnelHeaderCard role={role} navigation={navigation} />
        <SimpanEcosystemHubCard navigation={navigation} />
        <BroadcastQuickButton navigation={navigation} />

        {/* Hero Suara Caleg */}
        <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.heroHeaderRow}>
            <Image source={BRAND_ASSETS.official} style={{ width: 36, height: 36 }} resizeMode="contain" />
            <Pill label="Dapil Jawa Barat I" tone="primary" />
          </View>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Monitoring Suara Caleg</Text>
          <Text style={[styles.heroSub, { color: colors.textMuted }]}>
            Dr. H. Ahmad Fauzi, M.Si. — Caleg DPR-RI PAN Nomor Urut 1 (Kota Bandung & Kota Cimahi)
          </Text>

          <View style={[styles.statRow, { borderTopColor: colors.border }]}>
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: colors.primary }]}>48.210</Text>
              <Text style={[styles.statSub, { color: colors.textMuted }]}>Suara Caleg Masuk</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: colors.success }]}>112.450</Text>
              <Text style={[styles.statSub, { color: colors.textMuted }]}>Suara PAN Dapil</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: colors.text }]}>56,9%</Text>
              <Text style={[styles.statSub, { color: colors.textMuted }]}>TPS Terhimpun</Text>
            </View>
          </View>
        </View>

        {/* Proyeksi Kursi Card */}
        <Card style={{ gap: spacing.xs, backgroundColor: '#002B49', borderColor: '#0066B3' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Feather name="award" size={18} color="#60A5FA" />
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#FFFFFF' }}>
                Proyeksi Kursi Parlemen
              </Text>
            </View>
            <Pill label="Aman Terpilih" tone="success" />
          </View>
          <Text style={{ fontSize: fontSize.xs, color: '#93C5FD', lineHeight: 18 }}>
            Berdasarkan simulasi Sainte-Laguë perolehan suara 112.450 (14,8%), Partai Amanat Nasional mengamankan Kursi Ke-3 dari total 7 Kursi DPR-RI di Dapil Jabar 1.
          </Text>
        </Card>

        {/* Breakdown Suara Internal PAN Dapil */}
        <Card style={{ gap: spacing.sm }}>
          <SectionTitle style={{ marginBottom: 0 }}>Peringkat Suara Internal Caleg PAN di Dapil Jabar I</SectionTitle>
          <Text style={[styles.subHint, { color: colors.textMuted }]}>
            Akumulasi formulir C1 Plano dari 4.120 TPS se-Kota Bandung & Cimahi:
          </Text>

          {[
            { no: '1', nama: 'Dr. H. Ahmad Fauzi, M.Si.', suara: '48.210', pct: '42.9%', isMe: true },
            { no: '2', nama: 'Hj. Rina Marlina, S.H.', suara: '26.430', pct: '23.5%', isMe: false },
            { no: '3', nama: 'M. Irfan Pratama, M.B.A.', suara: '18.910', pct: '16.8%', isMe: false },
            { no: '-', nama: 'Suara Coblos Lambang PAN Saja', suara: '18.900', pct: '16.8%', isMe: false },
          ].map((c, idx) => (
            <View
              key={idx}
              style={[
                styles.witnessRowItem,
                { borderBottomColor: colors.border },
                c.isMe && { backgroundColor: colors.primaryLight, paddingHorizontal: 8, borderRadius: radius.md },
              ]}
            >
              <View style={[styles.headerNumBadge, { backgroundColor: c.isMe ? colors.primary : colors.border }]}>
                <Text style={[styles.headerNumBadgeText, { color: c.isMe ? '#FFFFFF' : colors.text }]}>{c.no}</Text>
              </View>
              <View style={{ flex: 1, gap: 1 }}>
                <Text style={[styles.witnessName, { color: colors.text, fontWeight: c.isMe ? '900' : '700' }]}>
                  {c.nama} {c.isMe ? '★ (Akun Anda)' : ''}
                </Text>
                <Text style={[styles.witnessSub, { color: colors.textMuted }]}>Porsi Suara: {c.pct}</Text>
              </View>
              <Text style={{ fontSize: fontSize.sm, fontWeight: '900', color: c.isMe ? colors.primary : colors.text }}>
                {c.suara}
              </Text>
            </View>
          ))}
        </Card>

        {/* Bento Grid Shortcut Caleg */}
        <View style={{ gap: spacing.xs }}>
          <SectionTitle style={{ marginBottom: spacing.xs }}>Menu Aksi & Pengawalan Caleg</SectionTitle>
          <BentoGridShortcut items={calegBentoItems} />
        </View>
      </ScrollView>
    );
  }

  // -------------------------------------------------------------
  // VIEW FOR KADER / ANGGOTA PARTAI PAN (PENGUSUL PARLEMEN DPR)
  // -------------------------------------------------------------
  if (role === 'KADER_ANGGOTA') {
    const kaderBentoItems: BentoItem[] = [
      {
        id: 'suara',
        icon: 'bar-chart-2',
        title: 'Suara & Parlemen',
        subtitle: 'Simulasi Sainte-Laguë DPR-RI',
        badge: '7.24%',
        onPress: () => navigation.navigate('PartyLeaderboard'),
      },
      {
        id: 'bacaleg',
        icon: 'award',
        title: 'Berkas Calon DPR',
        subtitle: '7 Dokumen Terverifikasi KPU',
        badge: 'Lengkap',
        onPress: () => navigation.navigate('SimpanBacaleg'),
      },
      {
        id: 'kta',
        icon: 'credit-card',
        title: 'e-KTA Digital',
        subtitle: 'Kartu Anggota & Barcode QR',
        onPress: () => navigation.navigate('SimpanKta'),
      },
      {
        id: 'kawal',
        icon: 'grid',
        title: 'Kawal TPS Dapil',
        subtitle: 'Monitoring Saksi C1 BSN',
        onPress: () => navigation.navigate('Supervision'),
      },
      {
        id: 'kantor',
        icon: 'map-pin',
        title: 'Kantor & Konter',
        subtitle: 'Pelayanan Sekretariat',
        onPress: () => navigation.navigate('SimpanOffices'),
      },
      {
        id: 'warta',
        icon: 'file-text',
        title: 'Warta DPP Terkini',
        subtitle: 'Maklumat & Arahan Resmi',
        onPress: () => navigation.navigate('SimpanNews'),
      },
    ];

    return (
      <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
        <PersonnelHeaderCard role={role} navigation={navigation} />
        <SimpanEcosystemHubCard navigation={navigation} />
        <BroadcastQuickButton navigation={navigation} />

        {/* Hero Suara Pribadi Calon Parlemen DPR */}
        <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.heroHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Image source={BRAND_ASSETS.official} style={{ width: 34, height: 34 }} resizeMode="contain" />
              <View>
                <Text style={{ fontSize: 10, fontWeight: '800', color: colors.primary }}>CALON ANGGOTA DPR-RI PARLEMEN</Text>
                <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textMuted }}>Dapil Jabar I (No. Urut 2)</Text>
              </View>
            </View>
            <Pill label="Target Tercapai" tone="success" />
          </View>

          <Text style={[styles.heroTitle, { color: colors.text, marginTop: 4 }]}>Suara Pribadi Anda Masuk</Text>
          <Text style={[styles.heroSub, { color: colors.textMuted }]}>
            Fajar Pratama Nugraha, S.T. — Akumulasi suara pribadi calon parlemen dari data C1 Plano TPS masuk.
          </Text>

          <View style={[styles.statRow, { borderTopColor: colors.border }]}>
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: colors.primary }]}>32.840</Text>
              <Text style={[styles.statSub, { color: colors.primary, fontWeight: '800' }]}>Suara Pribadi Anda</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: colors.success }]}>109,4%</Text>
              <Text style={[styles.statSub, { color: colors.textMuted }]}>Target (30.000)</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: colors.text }]}>Peringkat #2</Text>
              <Text style={[styles.statSub, { color: colors.textMuted }]}>Internal PAN Dapil</Text>
            </View>
          </View>
        </View>

        {/* Perolehan Suara Partai PAN (Dapil & Nasional) */}
        <Card style={{ gap: spacing.xs, backgroundColor: colors.surface, borderColor: colors.border }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 12, fontWeight: '800', color: colors.text }}>
              Perolehan Suara Partai PAN (Dapil & Nasional)
            </Text>
            <Pill label="Lolos Parlemen" tone="success" />
          </View>

          <Text style={{ fontSize: 11, color: colors.textMuted }}>
            Kawal suara partai dan akumulasi kursi DPR-RI di tingkat nasional dan daerah pemilihan:
          </Text>

          <View style={[styles.statRow, { borderTopColor: colors.border, marginTop: spacing.xs, paddingTop: spacing.xs }]}>
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: colors.text }]}>112.450</Text>
              <Text style={[styles.statSub, { color: colors.textMuted }]}>Suara PAN Dapil Jabar 1</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: colors.primary }]}>10.984.003</Text>
              <Text style={[styles.statSub, { color: colors.textMuted }]}>Total Nasional (7,24%)</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: colors.success }]}>48 Kursi</Text>
              <Text style={[styles.statSub, { color: colors.textMuted }]}>DPR-RI Senayan</Text>
            </View>
          </View>
        </Card>

        {/* Sebaran Suara Pribadi Masuk per Kecamatan Basis Calon */}
        <Card style={{ gap: spacing.sm }}>
          <SectionTitle style={{ marginBottom: 0 }}>Sebaran Suara Pribadi Masuk per Kecamatan (Basis Anda)</SectionTitle>
          <Text style={[styles.subHint, { color: colors.textMuted }]}>
            Hasil penghitungan C1 Plano suara pribadi Fajar Pratama Nugraha di TPS:
          </Text>

          {[
            { kec: 'Kecamatan Coblong (Basis Utama)', suara: '8.420', pct: '25,6%' },
            { kec: 'Kecamatan Cimahi Selatan', suara: '7.880', pct: '24,0%' },
            { kec: 'Kecamatan Antapani', suara: '6.250', pct: '19,0%' },
            { kec: 'Kecamatan Sukasari', suara: '5.910', pct: '18,0%' },
            { kec: 'Kecamatan Cidadap & Lainnya', suara: '4.380', pct: '13,4%' },
          ].map((item, idx) => (
            <View key={idx} style={[styles.witnessRowItem, { borderBottomColor: colors.border }]}>
              <View style={[styles.headerNumBadge, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.headerNumBadgeText, { color: colors.primary }]}>{idx + 1}</Text>
              </View>
              <View style={{ flex: 1, gap: 1 }}>
                <Text style={[styles.witnessName, { color: colors.text }]}>{item.kec}</Text>
                <Text style={[styles.witnessSub, { color: colors.textMuted }]}>Kontribusi: {item.pct}</Text>
              </View>
              <Text style={{ fontSize: fontSize.sm, fontWeight: '900', color: colors.primary }}>
                {item.suara}
              </Text>
            </View>
          ))}
        </Card>

        {/* Quick KTA Widget */}
        <Pressable
          onPress={() => navigation.navigate('SimpanKta')}
          style={({ pressed }) => [
            styles.heroCard,
            { backgroundColor: '#002B49', borderColor: '#0066B3' },
            pressed && { opacity: 0.9 },
          ]}
        >
          <View style={styles.heroHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Image source={BRAND_ASSETS.official} style={{ width: 28, height: 28 }} resizeMode="contain" />
              <Text style={{ fontSize: 12, fontWeight: '900', color: '#FFFFFF' }}>KARTU TANDA ANGGOTA RESMI</Text>
            </View>
            <Pill label="Kader Aktif" tone="success" />
          </View>
          <Text style={{ fontSize: 11, color: '#93C5FD' }}>No. KTA: 32.73.01.2024.08912</Text>
          <Text style={{ fontSize: fontSize.md, fontWeight: '900', color: '#FFFFFF', marginTop: 2 }}>
            FAJAR PRATAMA NUGRAHA, S.T.
          </Text>
          <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>
            DPD PAN Kota Bandung • Calon DPR-RI No. Urut 2
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.15)', paddingTop: 8, marginTop: 6 }}>
            <Text style={{ fontSize: 11, color: '#60A5FA', fontWeight: '700' }}>Ketuk untuk lihat kartu penuh & QR Code</Text>
            <Feather name="arrow-right" size={14} color="#60A5FA" />
          </View>
        </Pressable>

        {/* Bento Grid Shortcut Kader */}
        <View style={{ gap: spacing.xs }}>
          <SectionTitle style={{ marginBottom: spacing.xs }}>Layanan Kader & Calon Parlemen</SectionTitle>
          <BentoGridShortcut items={kaderBentoItems} />
        </View>
      </ScrollView>
    );
  }

  // -------------------------------------------------------------
  // VIEW FOR PENGURUS WILAYAH (DPD / DPC / DPW / DPP / PAC)
  // -------------------------------------------------------------
  if (role === 'DPD' || role === 'DPC' || role === 'DPW' || role === 'DPP' || role === 'PAC') {
    const pengurusBentoItems: BentoItem[] = [
      {
        id: 'struktur',
        icon: 'users',
        title: 'Struktur Organisasi',
        subtitle: 'Direktori Kepengurusan',
        badge: 'Pengurus',
        onPress: () => navigation.navigate('SimpanStructure'),
      },
      {
        id: 'kantor',
        icon: 'map-pin',
        title: 'Kantor & Konter',
        subtitle: 'Layanan Sekretariat Wilayah',
        onPress: () => navigation.navigate('SimpanOffices'),
      },
      {
        id: 'supervision',
        icon: 'grid',
        title: 'Pengawasan TPS',
        subtitle: 'Monitoring Teritorial',
        onPress: () => navigation.navigate('Supervision'),
      },
      {
        id: 'witnesses',
        icon: 'user-check',
        title: 'Daftar Saksi BSN',
        subtitle: 'Cek Kesiapan Saksi TPS',
        onPress: () => navigation.navigate('WitnessList'),
      },
      {
        id: 'pimpinan',
        icon: 'trending-up',
        title: 'Dashboard Pimpinan',
        subtitle: 'Analisis Suara & Ranking',
        onPress: () => navigation.navigate('Leadership'),
      },
      {
        id: 'broadcast',
        icon: 'radio',
        title: 'Kirim Broadcast',
        subtitle: 'Instruksi Langsung ke Saksi',
        onPress: () => navigation.navigate('Broadcast'),
      },
      {
        id: 'register',
        icon: 'camera',
        title: 'Rekrutmen Kader',
        subtitle: 'Daftar Anggota AI Scan KTP',
        badge: 'AI Scan',
        onPress: () => navigation.navigate('RegisterMember'),
      },
      {
        id: 'news',
        icon: 'file-text',
        title: 'Warta Resmi DPP',
        subtitle: 'Rilis Pers & Instruksi',
        onPress: () => navigation.navigate('SimpanNews'),
      },
    ];

    return (
      <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
        <PersonnelHeaderCard role={role} navigation={navigation} />
        <SimpanEcosystemHubCard navigation={navigation} />
        <BroadcastQuickButton navigation={navigation} />

        <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.heroHeaderRow}>
            <Image source={BRAND_ASSETS.official} style={{ width: 36, height: 36 }} resizeMode="contain" />
            <Pill label={ROLE_LABEL[role].split('—')[0].trim()} tone="primary" />
          </View>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Pusat Kendali Pengurus</Text>
          <Text style={[styles.heroSub, { color: colors.textMuted }]}>
            {ROLE_SCOPE_DESCRIPTION[role]}
          </Text>

          <View style={[styles.statRow, { borderTopColor: colors.border }]}>
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: colors.primary }]}>{scopedTps.length}</Text>
              <Text style={[styles.statSub, { color: colors.textMuted }]}>Total TPS Wilayah</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: colors.success }]}>{checkedInCount} / {scopedWitnesses.length}</Text>
              <Text style={[styles.statSub, { color: colors.textMuted }]}>Saksi Hadir GPS</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: colors.success }]}>{reportedCount}</Text>
              <Text style={[styles.statSub, { color: colors.textMuted }]}>C1 Terkumpul</Text>
            </View>
          </View>
        </View>

        <View style={{ gap: spacing.xs }}>
          <SectionTitle style={{ marginBottom: spacing.xs }}>Menu Aksi Kepengurusan & Wilayah</SectionTitle>
          <BentoGridShortcut items={pengurusBentoItems} />
        </View>
      </ScrollView>
    );
  }

  // -------------------------------------------------------------
  // VIEW FOR OPERATOR LAPANGAN (KOTA BANDUNG REGENCY SCOPE)
  // -------------------------------------------------------------
  if (isOperator) {
    const operatorBentoItems: BentoItem[] = [
      {
        id: 'ktp',
        icon: 'credit-card',
        title: 'Scan KTP Saksi',
        subtitle: 'Registrasi & Entri NIK',
        badge: 'Utama',
        onPress: () => navigation.navigate('KtpOcr'),
      },
      {
        id: 'supervision',
        icon: 'grid',
        title: 'Pengawasan TPS',
        subtitle: 'Monitoring Kota Bandung',
        onPress: () => navigation.navigate('Supervision'),
      },
      {
        id: 'doc',
        icon: 'camera',
        title: 'Foto Lapangan',
        subtitle: 'Upload Dokumentasi',
        onPress: () => navigation.navigate('Documentation', { tpsId: 'TPS-001' }),
      },
      {
        id: 'checkin',
        icon: 'map-pin',
        title: 'Absen GPS',
        subtitle: 'Pendampingan Presensi',
        onPress: () => navigation.navigate('CheckIn'),
      },
      {
        id: 'c1',
        icon: 'edit-3',
        title: 'Input Form C1',
        subtitle: 'Bantu Entri Suara TPS',
        onPress: () => navigation.navigate('ReportForm', { tpsId: 'TPS-001' }),
      },
      {
        id: 'emergency',
        icon: 'alert-triangle',
        title: 'Lapor Kendala',
        subtitle: 'Eskalasi Operasional',
        tone: 'danger',
        onPress: () => navigation.navigate('EmergencyForm'),
      },
      {
        id: 'emergencies',
        icon: 'alert-circle',
        title: 'Cek Kendala TPS',
        subtitle: 'Monitoring Laporan Kota Bandung',
        tone: 'warning',
        onPress: () => navigation.navigate('EmergencyList'),
      },
    ];

    return (
      <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
        {/* Personnel Profile Header Card */}
        <PersonnelHeaderCard role={role} navigation={navigation} />

        <SimpanEcosystemHubCard navigation={navigation} />

        <BroadcastQuickButton navigation={navigation} />

        <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.heroHeaderRow}>
            <Image source={BRAND_ASSETS.official} style={{ width: 36, height: 36 }} resizeMode="contain" />
            <Pill label="Kota Bandung" tone="primary" />
          </View>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Dashboard Operator Lapangan</Text>
          <Text style={[styles.heroSub, { color: colors.textMuted }]}>
            Monitoring TPS, Saksi Binaan, & Bantuan Registrasi se-Kabupaten/Kota Bandung.
          </Text>

          <View style={[styles.statRow, { borderTopColor: colors.border }]}>
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: colors.primary }]}>{scopedTps.length}</Text>
              <Text style={[styles.statSub, { color: colors.textMuted }]}>Total TPS Bandung</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: colors.success }]}>{checkedInCount}</Text>
              <Text style={[styles.statSub, { color: colors.textMuted }]}>Saksi Hadir GPS</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: colors.success }]}>{reportedCount}</Text>
              <Text style={[styles.statSub, { color: colors.textMuted }]}>Form C1 Masuk</Text>
            </View>
          </View>
        </View>

        <AttendanceStatCard
          witnesses={scopedWitnesses}
          fullyPresentTpsCount={fullyPresentTpsCount}
          totalTpsCount={scopedTps.length}
          colors={colors}
        />

        <TpsAttendanceList
          items={paginatedAttendance}
          currentPage={attendancePage}
          totalPages={totalAttendancePages}
          onPrev={() => setAttendancePage((p) => Math.max(1, p - 1))}
          onNext={() => setAttendancePage((p) => Math.min(totalAttendancePages, p + 1))}
          sort={attendanceSort}
          onToggleSort={() => {
            setAttendanceSort((s) => (s === 'best' ? 'worst' : 'best'));
            setAttendancePage(1);
          }}
          navigation={navigation}
          colors={colors}
        />

        {/* Bento Grid Shortcut for Operator */}
        <View style={{ gap: spacing.xs }}>
          <SectionTitle style={{ marginBottom: spacing.xs }}>Menu Aksi Operator Lapangan</SectionTitle>
          <BentoGridShortcut items={operatorBentoItems} />
        </View>

        {/* Saksi Management List per Regency (Kota Bandung) with Pagination */}
        <Card style={{ gap: spacing.md }}>
          <SectionTitle style={{ marginBottom: 0 }}>Manajemen Saksi & Penugasan TPS (Kota Bandung)</SectionTitle>
          <Text style={[styles.subHint, { color: colors.textMuted }]}>
            Daftar Saksi terdaftar di Kota Bandung (Menampilkan 5 dari {scopedWitnesses.length} Saksi).
          </Text>

          {paginatedWitnesses.map((w, idx) => {
            const assigned = tps.find((t) => t.id === w.assignedTpsId);
            return (
              <Pressable
                key={w.id}
                onPress={() => navigation.navigate('WitnessDetail', { witnessId: w.id })}
                style={({ pressed }) => [
                  styles.witnessRowItem,
                  { borderBottomColor: colors.border },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Image source={getWitnessAvatar(idx)} style={styles.avatarImg} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[styles.witnessName, { color: colors.text }]}>{w.name}</Text>
                  <Text style={[styles.witnessSub, { color: colors.primary, fontWeight: '700' }]}>
                    Ditugaskan di: {assigned ? `TPS ${assigned.tpsNumber} (${assigned.district})` : w.assignedTpsId}
                  </Text>
                  <Text style={[styles.witnessContact, { color: colors.textMuted }]}>NIK: {w.nik} • Telp: {w.phone}</Text>
                </View>
                <Pill
                  label={w.status === 'checked_in' ? 'Hadir GPS' : 'Belum Absen'}
                  tone={w.status === 'checked_in' ? 'success' : 'warning'}
                />
              </Pressable>
            );
          })}

          <PaginationBar
            currentPage={witnessPage}
            totalPages={totalWitnessPages}
            onPrev={() => setWitnessPage((p) => Math.max(1, p - 1))}
            onNext={() => setWitnessPage((p) => Math.min(totalWitnessPages, p + 1))}
          />
        </Card>

        {/* TPS Status Monitoring for Kota Bandung with Pagination */}
        <Card style={{ gap: spacing.md }}>
          <SectionTitle style={{ marginBottom: 0 }}>Status TPS di Kota Bandung ({scopedTps.length} TPS)</SectionTitle>
          <Text style={[styles.subHint, { color: colors.textMuted }]}>
            Menampilkan 5 TPS per halaman.
          </Text>
          {paginatedTps.map((item, idx) => (
            <Pressable
              key={item.id}
              onPress={() => navigation.navigate('TpsDetail', { tpsId: item.id })}
              style={[styles.witnessRowItem, { borderBottomColor: colors.border }]}
            >
              <Image source={getTpsPhoto(idx)} style={styles.avatarImg} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[styles.witnessName, { color: colors.text }]}>TPS {item.tpsNumber} — Kec. {item.district}</Text>
                <Text style={[styles.witnessSub, { color: colors.textMuted }]}>Kel. {item.village || 'Dago'} • DPT: {item.dpt}</Text>
              </View>
              <StatusBadge status={item.status} />
            </Pressable>
          ))}

          <PaginationBar
            currentPage={tpsPage}
            totalPages={totalTpsPages}
            onPrev={() => setTpsPage((p) => Math.max(1, p - 1))}
            onNext={() => setTpsPage((p) => Math.min(totalTpsPages, p + 1))}
          />
        </Card>
      </ScrollView>
    );
  }

  // -------------------------------------------------------------
  // VIEW FOR KOORDINATOR TPS (SUPERVISI 6 TPS BINAAN KLUSTER)
  // -------------------------------------------------------------
  if (isCoordinator) {
    const coordinatorBentoItems: BentoItem[] = [
      {
        id: 'supervision',
        icon: 'grid',
        title: 'Pengawasan Kluster',
        subtitle: 'Supervisi 6 TPS Dago',
        badge: 'Kluster 6',
        onPress: () => navigation.navigate('Supervision'),
      },
      {
        id: 'ktp',
        icon: 'credit-card',
        title: 'Scan KTP Saksi',
        subtitle: 'Registrasi & Entri NIK',
        onPress: () => navigation.navigate('KtpOcr'),
      },
      {
        id: 'doc',
        icon: 'camera',
        title: 'Foto Supervisi',
        subtitle: 'Upload Bukti Lapangan',
        onPress: () => navigation.navigate('Documentation', { tpsId: 'TPS-001' }),
      },
      {
        id: 'emergencies',
        icon: 'alert-triangle',
        title: 'Insiden Kluster',
        subtitle: 'Monitoring Laporan Darurat',
        tone: 'danger',
        onPress: () => navigation.navigate('EmergencyList'),
      },
      {
        id: 'lapor',
        icon: 'alert-circle',
        title: 'Lapor Kendala',
        subtitle: 'Eskalasi Masalah TPS',
        tone: 'warning',
        onPress: () => navigation.navigate('EmergencyForm'),
      },
    ];

    return (
      <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
        {/* Personnel Profile Header Card */}
        <PersonnelHeaderCard role={role} navigation={navigation} />

        <SimpanEcosystemHubCard navigation={navigation} />

        <BroadcastQuickButton navigation={navigation} />

        <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.heroHeaderRow}>
            <Image source={BRAND_ASSETS.official} style={{ width: 36, height: 36 }} resizeMode="contain" />
            <Pill label="Kluster COORD-1" tone="primary" />
          </View>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Pemantauan Kluster TPS</Text>
          <Text style={[styles.heroSub, { color: colors.textMuted }]}>
            Supervisi {scopedWitnesses.length} Saksi & {scopedTps.length} TPS Binaan di Wilayah Kelurahan Dago (Kluster COORD-1)
          </Text>

          <View style={[styles.statRow, { borderTopColor: colors.border }]}>
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: colors.success }]}>{checkedInCount} / {scopedWitnesses.length}</Text>
              <Text style={[styles.statSub, { color: colors.textMuted }]}>Saksi Hadir GPS</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: colors.primary }]}>{reportedCount} / {scopedTps.length}</Text>
              <Text style={[styles.statSub, { color: colors.textMuted }]}>Laporan C1 Masuk</Text>
            </View>
          </View>
        </View>

        <AttendanceStatCard
          witnesses={scopedWitnesses}
          fullyPresentTpsCount={fullyPresentTpsCount}
          totalTpsCount={scopedTps.length}
          colors={colors}
        />

        <TpsAttendanceList
          items={paginatedAttendance}
          currentPage={attendancePage}
          totalPages={totalAttendancePages}
          onPrev={() => setAttendancePage((p) => Math.max(1, p - 1))}
          onNext={() => setAttendancePage((p) => Math.min(totalAttendancePages, p + 1))}
          sort={attendanceSort}
          onToggleSort={() => {
            setAttendanceSort((s) => (s === 'best' ? 'worst' : 'best'));
            setAttendancePage(1);
          }}
          navigation={navigation}
          colors={colors}
        />

        {/* Bento Grid Shortcut for Koordinator */}
        <View style={{ gap: spacing.xs }}>
          <SectionTitle style={{ marginBottom: spacing.xs }}>Menu Aksi Koordinator TPS</SectionTitle>
          <BentoGridShortcut items={coordinatorBentoItems} />
        </View>

        {/* Supervision List 6 TPS */}
        <Card style={{ gap: spacing.md }}>
          <SectionTitle style={{ marginBottom: 0 }}>
            Daftar Presensi & C1 Saksi Binaan (6 TPS Kluster, {scopedWitnesses.length} Saksi)
          </SectionTitle>
          {paginatedWitnesses.map((w, idx) => {
            const assigned = tps.find((t) => t.id === w.assignedTpsId);
            const isDone = assigned?.status === 'done';
            return (
              <Pressable
                key={w.id}
                onPress={() => navigation.navigate('TpsDetail', { tpsId: w.assignedTpsId })}
                style={({ pressed }) => [
                  styles.witnessRowItem,
                  { borderBottomColor: colors.border },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Image source={getWitnessAvatar(idx)} style={styles.avatarImg} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[styles.witnessName, { color: colors.text }]}>{w.name}</Text>
                  <Text style={[styles.witnessSub, { color: colors.primary, fontWeight: '700' }]}>
                    Penugasan: TPS {assigned?.tpsNumber ?? 1} Kel. Dago • Telp: {w.phone}
                  </Text>
                  <Text style={[styles.witnessContact, { color: colors.textMuted }]}>
                    NIK: {w.nik} • Status Lapor C1: {isDone ? 'Sudah Dikirim' : 'Belum'}
                  </Text>
                </View>
                <Pill
                  label={isDone ? 'C1 Selesai' : w.status === 'checked_in' ? 'Hadir GPS' : 'Belum Absen'}
                  tone={isDone ? 'success' : w.status === 'checked_in' ? 'info' : 'warning'}
                />
              </Pressable>
            );
          })}

          <PaginationBar
            currentPage={witnessPage}
            totalPages={totalWitnessPages}
            onPrev={() => setWitnessPage((p) => Math.max(1, p - 1))}
            onNext={() => setWitnessPage((p) => Math.min(totalWitnessPages, p + 1))}
          />
        </Card>
      </ScrollView>
    );
  }

  // -------------------------------------------------------------
  // VIEW FOR SAKSI TPS MANDIRI (1 TPS SCOPE)
  // -------------------------------------------------------------
  const witnessBentoItems: BentoItem[] = [
    {
      id: 'checkin',
      icon: 'map-pin',
      title: 'Absen GPS',
      subtitle: 'Presensi Swafoto',
      badge: 'Step 1',
      onPress: () => navigation.navigate('CheckIn'),
    },
    {
      id: 'mandate',
      icon: 'file-text',
      title: 'E-Mandat',
      subtitle: 'Surat Tugas Digital',
      badge: 'Step 2',
      onPress: () => navigation.navigate('AssignmentLetter', { witnessId: CURRENT_WITNESS_ID }),
    },
    {
      id: 'c1',
      icon: 'edit-3',
      title: 'Formulir C1',
      subtitle: 'Foto & Entri Suara',
      badge: 'Step 3',
      onPress: () => navigation.navigate('ReportForm', { tpsId: 'TPS-001' }),
    },
    {
      id: 'doc',
      icon: 'camera',
      title: 'Dokumentasi',
      subtitle: 'Foto Kegiatan TPS',
      badge: 'Step 4',
      onPress: () => navigation.navigate('Documentation', { tpsId: 'TPS-001' }),
    },
    {
      id: 'emergency',
      icon: 'alert-triangle',
      title: 'Lapor Darurat',
      subtitle: 'Kirim Insiden TPS',
      tone: 'danger',
      badge: 'Step 5',
      onPress: () => navigation.navigate('EmergencyForm'),
    },
    {
      id: 'emergencies',
      icon: 'alert-circle',
      title: 'Cek Kendala TPS',
      subtitle: 'Status Laporan Anda & TPS',
      tone: 'warning',
      onPress: () => navigation.navigate('EmergencyList'),
    },
    {
      id: 'quickcount',
      icon: 'zap',
      title: 'Hitung Cepat Suara',
      subtitle: 'Tally Manual, Sinkron ke C1',
      badge: 'Baru',
      onPress: () => navigation.navigate('QuickCountGame'),
    },
  ];

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* Personnel Profile Header Card */}
      <PersonnelHeaderCard role={role} navigation={navigation} />

      <SimpanEcosystemHubCard navigation={navigation} />

      <BroadcastQuickButton navigation={navigation} />

      <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.heroHeaderRow}>
          <Image source={BRAND_ASSETS.official} style={{ width: 36, height: 36 }} resizeMode="contain" />
          <Pill label="TPS 001 Dago" tone="primary" />
        </View>
        <Text style={[styles.heroTitle, { color: colors.text }]}>Tugas Operasional Saksi TPS</Text>
        <Text style={[styles.heroSub, { color: colors.textMuted }]}>
          TPS 001 Kel. Dago, Kec. Coblong, Kota Bandung
        </Text>
      </View>

      {/* Statistik TPS Saya */}
      {scopedTps[0] && (
        <View style={{ gap: spacing.xs }}>
          <SectionTitle
            style={{ marginBottom: spacing.xs }}
            action={
              <Pressable onPress={() => navigation.navigate('TpsDetail', { tpsId: scopedTps[0].id })}>
                <Text style={[styles.roleBadgeText, { color: colors.primary }]}>Lihat Detail</Text>
              </Pressable>
            }
          >
            Statistik TPS Saya
          </SectionTitle>
          <View style={styles.statGrid}>
            <KpiCard label="DPT Terdaftar" value={scopedTps[0].dpt} icon="users" style={styles.statGridItem} />
            <KpiCard label="Pemilih Hadir" value={scopedTps[0].votersPresent} tone={colors.success} icon="check-circle" style={styles.statGridItem} />
            <KpiCard label="Suara Tidak Sah" value={scopedTps[0].votes.invalidVotes} tone={colors.danger} icon="x-circle" style={styles.statGridItem} />
            <KpiCard
              label="Total Suara Masuk"
              value={Object.values(scopedTps[0].votes.partyVotes).reduce((a, b) => a + b, 0)}
              icon="bar-chart-2"
              style={styles.statGridItem}
            />
          </View>
        </View>
      )}

      {/* Bento Grid Shortcut for Saksi */}
      <View style={{ gap: spacing.xs }}>
        <SectionTitle style={{ marginBottom: spacing.xs }}>Langkah Kerja Hari-H</SectionTitle>
        <BentoGridShortcut items={witnessBentoItems} />
      </View>
    </ScrollView>
  );
}

function BentoGridShortcut({ items }: { items: BentoItem[] }) {
  const { colors } = useTheme();
  return (
    <View style={styles.bentoGridContainer}>
      {items.map((item) => {
        const isDanger = item.tone === 'danger';
        const isSuccess = item.tone === 'success';
        const isWarning = item.tone === 'warning';

        const iconBg = isDanger
          ? colors.dangerBg
          : isSuccess
          ? colors.successBg
          : isWarning
          ? colors.warningBg
          : colors.primaryLight;

        const iconColor = isDanger
          ? colors.danger
          : isSuccess
          ? colors.success
          : isWarning
          ? colors.warning
          : colors.primary;

        return (
          <Pressable
            key={item.id}
            onPress={item.onPress}
            style={({ pressed }) => [
              styles.bentoCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
              pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
            ]}
          >
            <View style={styles.bentoCardHeader}>
              <View style={[styles.bentoIconBadge, { backgroundColor: iconBg }]}>
                <Feather name={item.icon} size={20} color={iconColor} strokeWidth={2} />
              </View>
              {item.badge && <Pill label={item.badge} tone={item.tone || 'primary'} />}
            </View>

            <View style={{ gap: 2, marginTop: spacing.xs }}>
              <Text style={[styles.bentoCardTitle, { color: colors.text }]} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={[styles.bentoCardSub, { color: colors.textMuted }]} numberOfLines={2}>
                {item.subtitle}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

function AttendanceStatCard({
  witnesses,
  fullyPresentTpsCount,
  totalTpsCount,
  colors,
}: {
  witnesses: { status: string }[];
  fullyPresentTpsCount: number;
  totalTpsCount: number;
  colors: any;
}) {
  const total = witnesses.length;
  const hadir = witnesses.filter((w) => w.status === 'checked_in').length;
  const tidakHadir = total - hadir;
  const pctHadir = total > 0 ? Math.round((hadir / total) * 100) : 0;

  return (
    <Card style={{ gap: spacing.sm }}>
      <SectionTitle style={{ marginBottom: 0 }}>Kehadiran Saksi</SectionTitle>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <Text style={{ fontSize: fontSize.xxl, fontWeight: '800', color: colors.success }}>{pctHadir}%</Text>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ fontSize: fontSize.xs, color: colors.textMuted }}>Persentase Saksi Hadir dari {total} Saksi</Text>
          <View style={[styles.attendanceBarTrack, { backgroundColor: colors.dangerBg }]}>
            <View style={[styles.attendanceBarFill, { width: `${pctHadir}%`, backgroundColor: colors.success }]} />
          </View>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' }}>
        <Pill label={`${hadir} Hadir`} tone="success" />
        <Pill label={`${tidakHadir} Tidak Hadir`} tone="danger" />
        <Pill label={`${fullyPresentTpsCount}/${totalTpsCount} TPS 100% Hadir`} tone="info" />
      </View>
    </Card>
  );
}

function TpsAttendanceList({
  items,
  currentPage,
  totalPages,
  onPrev,
  onNext,
  sort,
  onToggleSort,
  navigation,
  colors,
}: {
  items: Array<{ tps: { id: string; tpsNumber: number; district: string; village?: string }; hadir: number; total: number; pct: number }>;
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  sort: 'best' | 'worst';
  onToggleSort: () => void;
  navigation: any;
  colors: any;
}) {
  return (
    <Card style={{ gap: spacing.md }}>
      <SectionTitle
        style={{ marginBottom: 0 }}
        action={
          <Pressable
            onPress={onToggleSort}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
          >
            <Feather name={sort === 'best' ? 'arrow-down' : 'arrow-up'} size={13} color={colors.primary} />
            <Text style={{ fontSize: 11, fontWeight: '700', color: colors.primary }}>
              {sort === 'best' ? 'Terbaik Dulu' : 'Terburuk Dulu'}
            </Text>
          </Pressable>
        }
      >
        Rekap Kehadiran per TPS
      </SectionTitle>
      {items.map(({ tps: t, hadir, total, pct }) => (
        <Pressable
          key={t.id}
          onPress={() => navigation.navigate('TpsDetail', { tpsId: t.id })}
          style={({ pressed }) => [styles.witnessRowItem, { borderBottomColor: colors.border }, pressed && { opacity: 0.8 }]}
        >
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[styles.witnessName, { color: colors.text }]}>TPS {t.tpsNumber} — Kec. {t.district}</Text>
            <Text style={[styles.witnessSub, { color: colors.textMuted }]}>Kel. {t.village || 'Dago'} • {hadir}/{total} Saksi Hadir</Text>
          </View>
          <Pill
            label={pct === 100 ? '100% Hadir' : `${pct}% Hadir`}
            tone={pct === 100 ? 'success' : pct >= 50 ? 'warning' : 'danger'}
          />
        </Pressable>
      ))}
      <PaginationBar currentPage={currentPage} totalPages={totalPages} onPrev={onPrev} onNext={onNext} />
    </Card>
  );
}

function PaginationBar({ currentPage, totalPages, onPrev, onNext }: { currentPage: number; totalPages: number; onPrev: () => void; onNext: () => void }) {
  const { colors } = useTheme();
  if (totalPages <= 1) return null;
  return (
    <View style={styles.paginationRow}>
      <Pressable
        disabled={currentPage <= 1}
        onPress={onPrev}
        style={({ pressed }) => [
          styles.pageBtn,
          { backgroundColor: colors.surface, borderColor: colors.border },
          currentPage <= 1 && { opacity: 0.4 },
          pressed && { opacity: 0.8 },
        ]}
      >
        <Feather name="chevron-left" size={16} color={colors.text} />
        <Text style={[styles.pageBtnText, { color: colors.text }]}>Prev</Text>
      </Pressable>

      <Text style={[styles.pageIndicator, { color: colors.textMuted }]}>
        Halaman <Text style={{ fontWeight: '800', color: colors.text }}>{currentPage}</Text> dari {totalPages}
      </Text>

      <Pressable
        disabled={currentPage >= totalPages}
        onPress={onNext}
        style={({ pressed }) => [
          styles.pageBtn,
          { backgroundColor: colors.surface, borderColor: colors.border },
          currentPage >= totalPages && { opacity: 0.4 },
          pressed && { opacity: 0.8 },
        ]}
      >
        <Text style={[styles.pageBtnText, { color: colors.text }]}>Next</Text>
        <Feather name="chevron-right" size={16} color={colors.text} />
      </Pressable>
    </View>
  );
}

function SimpanEcosystemHubCard({ navigation }: { navigation: any }) {
  const { colors } = useTheme();

  return (
    <Card style={{ gap: spacing.xs, backgroundColor: colors.surface, borderColor: colors.border }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ fontSize: 13, fontWeight: '900', color: colors.text }}>
            sim<Text style={{ color: colors.primary }}>PAN</Text> Ekosistem
          </Text>
          <Pill label="Sistem Terpadu" tone="primary" />
        </View>
        <Text style={{ fontSize: 10, color: colors.textMuted }}>Partai Amanat Nasional</Text>
      </View>

      <Text style={{ fontSize: 11, color: colors.textMuted }}>
        Pengawalan Suara Saksi BSN & Layanan Keanggotaan Terpadu
      </Text>

      <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
        <Pressable
          onPress={() => navigation.navigate('SimpanKta')}
          style={({ pressed }) => [
            styles.hubQuickBtn,
            { backgroundColor: colors.primaryLight },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Feather name="credit-card" size={12} color={colors.primary} />
          <Text style={[styles.hubQuickBtnText, { color: colors.primary }]}>e-KTA Digital</Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate('RegisterMember')}
          style={({ pressed }) => [
            styles.hubQuickBtn,
            { backgroundColor: colors.primaryLight },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Feather name="camera" size={12} color={colors.primary} />
          <Text style={[styles.hubQuickBtnText, { color: colors.primary }]}>Scan KTP AI</Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate('SimpanStructure')}
          style={({ pressed }) => [
            styles.hubQuickBtn,
            { backgroundColor: colors.primaryLight },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Feather name="users" size={12} color={colors.primary} />
          <Text style={[styles.hubQuickBtnText, { color: colors.primary }]}>Struktur</Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate('SimpanOffices')}
          style={({ pressed }) => [
            styles.hubQuickBtn,
            { backgroundColor: colors.primaryLight },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Feather name="map-pin" size={12} color={colors.primary} />
          <Text style={[styles.hubQuickBtnText, { color: colors.primary }]}>Kantor & Konter</Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate('SimpanNews')}
          style={({ pressed }) => [
            styles.hubQuickBtn,
            { backgroundColor: colors.primaryLight },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Feather name="file-text" size={12} color={colors.primary} />
          <Text style={[styles.hubQuickBtnText, { color: colors.primary }]}>Warta DPP</Text>
        </Pressable>
      </View>
    </Card>
  );
}

function BroadcastQuickButton({ navigation }: { navigation: any }) {
  const { colors } = useTheme();
  const { broadcasts } = useApp();
  const count = broadcasts.length;

  return (
    <Pressable
      onPress={() => navigation.navigate('Broadcast')}
      style={({ pressed }) => [
        styles.broadcastButton,
        { backgroundColor: colors.primaryLight, borderColor: colors.border },
        pressed && { opacity: 0.85 },
      ]}
    >
      <Feather name="radio" size={16} color={colors.primary} strokeWidth={iconStrokeWidth} />
      <Text style={[styles.broadcastButtonText, { color: colors.primary }]}>
        {count > 0 ? `${count} Broadcast Masuk` : 'Belum Ada Broadcast'}
      </Text>
      <Feather name="chevron-right" size={16} color={colors.primary} strokeWidth={iconStrokeWidth} />
    </Pressable>
  );
}

function PersonnelHeaderCard({ role, navigation }: { role: any; navigation: any }) {
  const { colors } = useTheme();
  const profile = getUserProfile(role);

  return (
    <Pressable
      onPress={() => navigation.navigate('Profile')}
      style={({ pressed }) => [
        styles.profileHeaderCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
        pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] },
      ]}
    >
      <View style={styles.profileAvatarWrapper}>
        <Image source={getWitnessAvatar(profile.avatarIndex)} style={styles.profileHeaderAvatar} />
        <View style={[styles.onlineDot, { backgroundColor: colors.success }]} />
      </View>

      <View style={{ flex: 1, gap: 2 }}>
        <View style={styles.profileHeaderTopRow}>
          <Text style={[styles.profileHeaderName, { color: colors.text }]}>{profile.name}</Text>
          <View style={[styles.badgeIdPill, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.badgeIdPillText, { color: colors.primary }]}>{profile.badgeId}</Text>
          </View>
        </View>
        <Text style={[styles.profileHeaderRole, { color: colors.primary }]}>{profile.roleLabel}</Text>
        <Text style={[styles.profileHeaderScope, { color: colors.textMuted }]}>
          📍 {profile.scopeLocation}
        </Text>
      </View>
      <Feather name="chevron-right" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },
  broadcastButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  broadcastButtonText: { flex: 1, fontSize: fontSize.xs, fontWeight: '800' },
  profileHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    ...shadow.card,
  },
  profileAvatarWrapper: { position: 'relative' },
  profileHeaderAvatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 1.5, borderColor: '#0066B3' },
  onlineDot: { width: 12, height: 12, borderRadius: 6, position: 'absolute', bottom: 0, right: 0, borderWidth: 2, borderColor: '#FFFFFF' },
  profileHeaderTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  profileHeaderName: { fontSize: fontSize.sm, fontWeight: '800' },
  badgeIdPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.pill },
  badgeIdPillText: { fontSize: 9, fontWeight: '800' },
  profileHeaderRole: { fontSize: 11, fontWeight: '700' },
  profileHeaderScope: { fontSize: 10 },
  heroCard: { padding: spacing.lg, gap: spacing.xs, borderRadius: radius.xl, borderWidth: 1 },
  heroHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  roleBadgeText: { fontSize: 11, fontWeight: '800' },
  heroTitle: { fontSize: fontSize.xl, fontWeight: '800' },
  heroSub: { fontSize: fontSize.xs, lineHeight: 18 },
  subHint: { fontSize: fontSize.xs, marginBottom: spacing.xs },
  statRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1 },
  statBox: { alignItems: 'center' },
  statNum: { fontSize: fontSize.lg, fontWeight: '800' },
  statSub: { fontSize: 11, marginTop: 2 },
  divider: { width: 1, height: 28 },
  witnessRowItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs, borderBottomWidth: 0.5 },
  avatarImg: { width: 44, height: 44, borderRadius: 22 },
  witnessName: { fontSize: fontSize.sm, fontWeight: '700' },
  witnessSub: { fontSize: 11 },
  witnessContact: { fontSize: 10 },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  pageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  pageBtnText: { fontSize: 12, fontWeight: '700' },
  pageIndicator: { fontSize: 12 },

  // Bento Grid Shortcut Styles
  bentoGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  bentoCard: {
    width: '48%',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.xs,
    minHeight: 110,
    justifyContent: 'space-between',
    ...shadow.card,
  },
  bentoCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bentoIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bentoCardTitle: {
    fontSize: fontSize.sm,
    fontWeight: '800',
  },
  bentoCardSub: {
    fontSize: 11,
    lineHeight: 15,
  },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statGridItem: { minWidth: '46%' },
  attendanceBarTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  attendanceBarFill: { height: '100%', borderRadius: 4 },
  hubQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  hubQuickBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  headerNumBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerNumBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
});
