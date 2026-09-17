import React, { useState } from 'react';
import {
  ActivityIndicator,
  DimensionValue,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Card, ConfirmDialog, KpiCard, Modal, Pill, SectionTitle, StatusBadge } from '../components/ui';
import { fontSize, fonts, iconStrokeWidth, radius, shadow, spacing } from '../theme';
import { CURRENT_WITNESS_ID, ROLE_LABEL, ROLE_SCOPE_DESCRIPTION, getUserProfile, scopeTps, scopeWitnesses } from '../utils/scope';
import { BRAND_ASSETS, IMAGES, getWitnessAvatar, getTpsPhoto } from '../data/images';
import QrPlaceholder from '../components/QrPlaceholder';

const ITEMS_PER_PAGE = 5;

interface BcaQuickActionItem {
  id: string;
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle: string;
  badge?: string;
  tone?: 'primary' | 'danger' | 'success' | 'warning' | 'info';
  onPress: () => void;
}

export default function DashboardScreen({ navigation }: any) {
  const { role, tps, witnesses, payments, isOnline, unsyncedQueueCount, flushQueueNow, broadcasts } = useApp();
  const { colors, isDark } = useTheme();

  // Modals & Dialog states
  const [isSyncing, setIsSyncing] = useState(false);
  const [showKtaQrModal, setShowKtaQrModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showAgendaModal, setShowAgendaModal] = useState(false);
  const [activeWartaTab, setActiveWartaTab] = useState<'instruksi' | 'agenda'>('instruksi');
  const [showScanModal, setShowScanModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    tone?: 'danger' | 'primary' | 'warning' | 'success' | 'info';
  }>({ visible: false, title: '', message: '' });

  // Interactive Checklist states
  const [taskGotvCount, setTaskGotvCount] = useState(142);
  const [taskTallyDone, setTaskTallyDone] = useState(false);
  const [taskDocDone, setTaskDocDone] = useState(false);
  const [taskLogisticDone, setTaskLogisticDone] = useState(true);

  // Pagination & Sorting states
  const [tpsPage, setTpsPage] = useState(1);
  const [witnessPage, setWitnessPage] = useState(1);
  const [attendancePage, setAttendancePage] = useState(1);
  const [attendanceSort, setAttendanceSort] = useState<'best' | 'worst'>('best');

  const profile = getUserProfile(role);
  const scopedTps = scopeTps(role, tps, witnesses);
  const scopedWitnesses = scopeWitnesses(role, witnesses, scopedTps);

  const checkedInCount = scopedWitnesses.filter((w) => w.status === 'checked_in').length;
  const reportedCount = scopedTps.filter((t) => t.status === 'done').length;

  const currentWitness = witnesses.find((w) => w.id === CURRENT_WITNESS_ID) || witnesses[0];
  const currentTps = scopedTps[0] || tps[0];
  const currentPayment = payments?.find((p) => p.witnessId === currentWitness?.id);

  // Pagination calculations
  const totalTpsPages = Math.ceil(scopedTps.length / ITEMS_PER_PAGE);
  const paginatedTps = scopedTps.slice((tpsPage - 1) * ITEMS_PER_PAGE, tpsPage * ITEMS_PER_PAGE);

  const totalWitnessPages = Math.ceil(scopedWitnesses.length / ITEMS_PER_PAGE);
  const paginatedWitnesses = scopedWitnesses.slice((witnessPage - 1) * ITEMS_PER_PAGE, witnessPage * ITEMS_PER_PAGE);

  // Attendance breakdown
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

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const synced = await flushQueueNow();
      if (synced > 0) {
        setDialogConfig({
          visible: true,
          title: 'Sinkronisasi Sukses',
          message: `${synced} transaksi offline berhasil disinkronkan ke server pusat.`,
          tone: 'success',
        });
      } else {
        setDialogConfig({
          visible: true,
          title: 'Antrean Bersih',
          message: 'Semua transaksi lapangan telah tersinkronisasi sempurna.',
          tone: 'info',
        });
      }
    } catch (e) {
      setDialogConfig({
        visible: true,
        title: 'Gagal Sinkron',
        message: 'Pastikan sinyal internet seluler stabil.',
        tone: 'danger',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Full-aspect BCA style menu items
  const bcaMenuItems: BcaQuickActionItem[] = [
    {
      id: 'suara',
      icon: 'bar-chart-2',
      title: 'Simulasi Parlemen',
      subtitle: 'Sainte-Laguë & Kursi DPR',
      badge: '7.24%',
      tone: 'primary',
      onPress: () => navigation.navigate('PartyLeaderboard'),
    },
    {
      id: 'bacaleg',
      icon: 'award',
      title: 'Berkas Caleg KPU',
      subtitle: '7 Dokumen Terverifikasi',
      badge: 'Lengkap',
      tone: 'success',
      onPress: () => navigation.navigate('SimpanBacaleg'),
    },
    {
      id: 'kawal',
      icon: 'grid',
      title: 'Kawal TPS Dapil',
      subtitle: 'Monitoring Saksi C1 BSN',
      tone: 'info',
      onPress: () => navigation.navigate('Supervision'),
    },
    {
      id: 'roster',
      icon: 'users',
      title: 'Roster Caleg PAN',
      subtitle: 'Daftar Calon DPR-RI Jabar 1',
      tone: 'primary',
      onPress: () => navigation.navigate('PartyRoster', { party: 'PAN' }),
    },
    {
      id: 'kantor',
      icon: 'map-pin',
      title: 'Kantor & Posko',
      subtitle: 'Layanan DPD & Sekretariat',
      tone: 'primary',
      onPress: () => navigation.navigate('SimpanOffices'),
    },
    {
      id: 'struktur',
      icon: 'layers',
      title: 'Struktur Pengurus',
      subtitle: 'Direktori DPP, DPW & DPD',
      tone: 'primary',
      onPress: () => navigation.navigate('SimpanStructure'),
    },
    {
      id: 'bantuan',
      icon: 'help-circle',
      title: 'Pusat Bantuan',
      subtitle: 'Pedoman KPU & SOP Saksi',
      tone: 'info',
      onPress: () => navigation.navigate('HelpCenter'),
    },
    {
      id: 'rekrut',
      icon: 'user-plus',
      title: 'Rekrut Kader',
      subtitle: 'Formulir Anggota simPAN',
      tone: 'primary',
      onPress: () => navigation.navigate('RegisterMember'),
    },
    {
      id: 'kta',
      icon: 'credit-card',
      title: 'e-KTA Digital',
      subtitle: 'Kartu Anggota simPAN',
      tone: 'primary',
      onPress: () => navigation.navigate('SimpanKta'),
    },
    {
      id: 'tally',
      icon: 'zap',
      title: 'Hitung Cepat TPS',
      subtitle: 'Tally Suara Bilik TPS',
      tone: 'warning',
      onPress: () => navigation.navigate('QuickCountGame'),
    },
    {
      id: 'honor',
      icon: 'dollar-sign',
      title: 'Honorarium Saksi',
      subtitle: 'Pencairan Mandiri / BCA',
      tone: 'success',
      onPress: () => navigation.navigate('Payment'),
    },
    {
      id: 'darurat',
      icon: 'alert-triangle',
      title: 'Lapor Insiden SOS',
      subtitle: 'Eskalasi Pelanggaran TPS',
      tone: 'danger',
      badge: 'Darurat',
      onPress: () => navigation.navigate('EmergencyForm'),
    },
  ];

  // Checklist of Member Tasks
  const taskChecklist = [
    {
      id: 1,
      title: 'Presensi Lokasi GPS di TPS (< 07:00 WIB)',
      desc: 'Wajib berada di radius 100m dari titik TPS sebelum pemungutan suara dibuka.',
      done: true,
      time: '06:45 WIB • TPS 001',
      actionLabel: 'Lihat Presensi',
      onPress: () => navigation.navigate('CheckIn'),
    },
    {
      id: 2,
      title: 'Tunjukkan Surat Mandat Resmi DPP ke KPPS',
      desc: 'Perlihatkan e-Mandat QR resmi bertanda tangan DPP ke petugas KPPS & Panwaslu.',
      done: true,
      time: 'No. 042/SM-DPP/2026',
      actionLabel: 'Buka Surat Mandat',
      onPress: () => navigation.navigate('AssignmentLetter', { witnessId: CURRENT_WITNESS_ID }),
    },
    {
      id: 3,
      title: 'Kawal Pemilih & Mobilisasi Warga (GOTV)',
      desc: 'Pantau kehadiran warga binaan di lingkungan TPS untuk memastikan suara PAN terjaga.',
      done: taskGotvCount >= 160,
      time: `${taskGotvCount} / 180 Pemilih Hadir (${Math.round((taskGotvCount / 180) * 100)}%)`,
      actionLabel: '+ Tambah Kehadiran',
      onPress: () => {
        setTaskGotvCount((prev) => {
          const next = Math.min(180, prev + 5);
          setDialogConfig({
            visible: true,
            title: 'Kehadiran Pemilih Bertambah',
            message: `Kehadiran pemilih binaan tercatat ${next} dari 180 pemilih (${Math.round((next / 180) * 100)}%).`,
            tone: 'success',
          });
          return next;
        });
      },
    },
    {
      id: 4,
      title: 'Catat Tally Suara Bilik TPS & Foto Plano C1',
      desc: 'Rekam hasil suara per TPS saat sidang hitung terbuka dimulai oleh KPPS.',
      done: taskTallyDone,
      time: taskTallyDone ? 'Tally Selesai' : 'Siap Pukul 13:00 WIB',
      actionLabel: taskTallyDone ? 'Lihat Rekap Tally' : 'Buka Tally Counter',
      onPress: () => navigation.navigate('QuickCountGame'),
    },
    {
      id: 5,
      title: 'Unggah Form C1 ke Server & Klaim Honor Saksi',
      desc: 'Pindai lembar C1 Plano dengan AI Scanner lalu verifikasi pencairan honorarium Rp 350.000.',
      done: Boolean(currentPayment?.status === 'paid'),
      time: currentPayment?.status === 'paid' ? 'Lunas Rp 350.000' : 'Menunggu Unggah C1',
      actionLabel: currentPayment?.status === 'paid' ? 'Cek Bukti Transfer' : 'Scan & Unggah C1',
      onPress: () => navigation.navigate('ReportForm', { tpsId: currentTps?.id || 'TPS-001' }),
    },
  ];

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ========================================================================= */}
      {/* 1. 🏠 BERANDA: PUSAT AKTIVITAS ANGGOTA (HEADER UTAMA)                     */}
      {/* ========================================================================= */}
      <View style={[styles.headerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerTitleCol}>
            <View style={styles.headerBadgePill}>
            </View>
            <Text style={[styles.welcomeGreeting, { color: colors.text }]}>
              SELAMAT DATANG
            </Text>
            <Text style={[styles.welcomeAccountSub, { color: colors.textMuted }]}>
              {profile.name} • {profile.roleLabel.split('—')[0].trim()}
            </Text>
          </View>

          {/* Profile Avatar with Online Dot */}
          <Pressable
            onPress={() => navigation.navigate('Profile')}
            style={({ pressed }) => [styles.avatarTouch, pressed && { opacity: 0.8 }]}
          >
            <Image source={getWitnessAvatar(1)} style={styles.avatarPhoto} />
            <View style={[styles.onlineStatusDot, { backgroundColor: colors.success }]} />
          </Pressable>
        </View>

        {/* Status & Wilayah Section */}
        <View style={[styles.statusWilayahCard, { backgroundColor: isDark ? 'rgba(0,43,82,0.45)' : '#F0F7FF', borderColor: isDark ? '#0A3D6B' : '#BAE6FD' }]}>
          {/* <View style={styles.statusWilayahItem}>
            <Text style={[styles.swLabel, { color: colors.textMuted }]}>Status:</Text>
            <View style={[styles.activeStatusPill, { backgroundColor: colors.successBg, borderColor: colors.success }]}>
              <View style={[styles.pulsingGreenDot, { backgroundColor: colors.success }]} />
              <Text style={[styles.activeStatusPillText, { color: colors.success }]}>
                🟢 ANGGOTA AKTIF
              </Text>
            </View>
          </View> */}

          {/* <View style={[styles.swDivider, { backgroundColor: isDark ? '#1A5490' : '#CBD5E1' }]} /> */}

          <View style={styles.statusWilayahItem}>
            {/* <Text style={[styles.swLabel, { color: colors.textMuted }]}>Wilayah:</Text> */}
            <Text style={[styles.swValue, { color: colors.text }]} numberOfLines={1}>
              DPD Kabupaten Bandung
            </Text>
            <Text style={[styles.swSubValue, { color: colors.primary }]} numberOfLines={1}>
              Dapil Jawa Barat I
            </Text>
          </View>
        </View>

        {/* e-KTA Mini Pass Action Strip */}
        <View style={[styles.ktaMiniStrip, { backgroundColor: isDark ? 'rgba(0,26,51,0.5)' : '#FFFFFF', borderColor: colors.border }]}>
          <View style={styles.ktaEmblemRow}>
            <Image source={BRAND_ASSETS.official} style={styles.panEmblemSmall} resizeMode="contain" />
            <View>
              <Text style={[styles.ktaLabelText, { color: colors.textMuted }]}>NO. KTA RESMI simPAN</Text>
              <Text style={[styles.ktaNumberText, { color: colors.primary }]}>32.73.01.2024.08912</Text>
            </View>
          </View>

          <View style={styles.ktaButtonRow}>
            <Pressable
              onPress={() => setShowKtaQrModal(true)}
              style={({ pressed }) => [
                styles.ktaMiniBtnOutline,
                { borderColor: colors.border, backgroundColor: colors.surface },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Feather name="maximize" size={13} color={colors.primary} />
              <Text style={[styles.ktaMiniBtnText, { color: colors.primary }]}>QR Pass</Text>
            </Pressable>

            <Pressable
              onPress={() => navigation.navigate('SimpanKta')}
              style={({ pressed }) => [
                styles.ktaMiniBtnSolid,
                { backgroundColor: colors.primary },
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={styles.ktaMiniBtnSolidText}>e-KTA</Text>
              <Feather name="chevron-right" size={13} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Offline Sync Banner if Needed */}
      {(!isOnline || unsyncedQueueCount > 0) && (
        <View
          style={[
            styles.syncBannerCard,
            {
              backgroundColor: !isOnline ? colors.warningBg : colors.primaryLight,
              borderColor: !isOnline ? colors.warning : colors.primary,
            },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
            <Feather
              name={!isOnline ? 'wifi-off' : 'cloud-off'}
              size={18}
              color={!isOnline ? colors.warning : colors.primary}
            />
            <View style={{ flex: 1 }}>
              <Text style={[styles.syncBannerTitle, { color: colors.text }]}>
                {!isOnline ? 'Koneksi Lapangan Terputus' : `${unsyncedQueueCount} Transaksi Menunggu Sinyal`}
              </Text>
              <Text style={[styles.syncBannerSub, { color: colors.textMuted }]}>
                Data tetap aman di HP & otomatis disinkronkan saat internet aktif.
              </Text>
            </View>
          </View>
          {isOnline && (
            <Pressable
              onPress={handleManualSync}
              disabled={isSyncing}
              style={({ pressed }) => [
                styles.syncBannerBtn,
                { backgroundColor: colors.primary },
                pressed && { opacity: 0.8 },
              ]}
            >
              {isSyncing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Feather name="refresh-cw" size={12} color="#FFFFFF" />
                  <Text style={styles.syncBannerBtnText}>Sinkron</Text>
                </>
              )}
            </Pressable>
          )}
        </View>
      )}

      {/* ========================================================================= */}
      {/* 2. 📢 WARTA & AGENDA RESMI PAN (UNIFIED INFORMATION & EVENT CARD)          */}
      {/* ========================================================================= */}
      <View style={[styles.unifiedWartaCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {/* Header: Segmented Pills Switcher & Action Link */}
        <View style={styles.unifiedWartaHeader}>
          <View style={styles.unifiedSegmentTrack}>
            <Pressable
              onPress={() => setActiveWartaTab('instruksi')}
              style={[
                styles.unifiedSegmentPill,
                activeWartaTab === 'instruksi'
                  ? { backgroundColor: '#DC2626', borderColor: '#DC2626' }
                  : { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9', borderColor: colors.border },
              ]}
            >
              <Feather
                name="volume-2"
                size={12}
                color={activeWartaTab === 'instruksi' ? '#FFFFFF' : colors.textMuted}
              />
              <Text
                style={[
                  styles.unifiedSegmentText,
                  { color: activeWartaTab === 'instruksi' ? '#FFFFFF' : colors.textMuted },
                ]}
              >
                Instruksi DPP
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setActiveWartaTab('agenda')}
              style={[
                styles.unifiedSegmentPill,
                activeWartaTab === 'agenda'
                  ? { backgroundColor: colors.primary, borderColor: colors.primary }
                  : { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9', borderColor: colors.border },
              ]}
            >
              <Feather
                name="calendar"
                size={12}
                color={activeWartaTab === 'agenda' ? '#FFFFFF' : colors.textMuted}
              />
              <Text
                style={[
                  styles.unifiedSegmentText,
                  { color: activeWartaTab === 'agenda' ? '#FFFFFF' : colors.textMuted },
                ]}
              >
                Agenda Terdekat
              </Text>
              <View
                style={[
                  styles.agendaBadgeCircle,
                  {
                    backgroundColor: activeWartaTab === 'agenda' ? 'rgba(255,255,255,0.3)' : colors.primaryLight,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.agendaBadgeCircleText,
                    { color: activeWartaTab === 'agenda' ? '#FFFFFF' : colors.primary },
                  ]}
                >
                  3
                </Text>
              </View>
            </Pressable>
          </View>

          <Pressable
            onPress={() => (activeWartaTab === 'instruksi' ? setShowInfoModal(true) : setShowAgendaModal(true))}
            hitSlop={8}
          >
            <Text style={[styles.unifiedActionLink, { color: colors.primary }]}>
              {activeWartaTab === 'instruksi' ? 'Detail' : 'Semua'}
            </Text>
          </Pressable>
        </View>

        {/* TAB 1: INSTRUKSI DPP */}
        {activeWartaTab === 'instruksi' ? (
          <Pressable
            onPress={() => setShowInfoModal(true)}
            style={({ pressed }) => [
              styles.instruksiContentBox,
              pressed && { opacity: 0.9 },
            ]}
          >
            <View style={styles.instruksiMetaRow}>
              <View style={styles.instruksiTagPill}>
                <Image source={BRAND_ASSETS.official} style={{ width: 14, height: 14 }} resizeMode="contain" />
                <Text style={styles.instruksiTagText}>ARAHAN DPP PAN & BSN</Text>
              </View>
              <Text style={[styles.instruksiDateText, { color: colors.textMuted }]}>Hari Ini • 08:30 WIB</Text>
            </View>

            <Text style={[styles.instruksiTitleText, { color: colors.text }]} numberOfLines={2}>
              Kawal Ketat Form C1 Plano & Integritas Tabulasi Suara Pemilu
            </Text>

            <Text style={[styles.instruksiExcerptText, { color: colors.textMuted }]} numberOfLines={2}>
              Ketua Umum DPP PAN Dr. (H.C.) Zulkifli Hasan menginstruksikan seluruh kader, pengurus DPD, dan saksi TPS siaga penuh mengawal suara rakyat.
            </Text>

            <View style={[styles.linkedAgendaTeaser, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', borderColor: colors.border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                <Feather name="calendar" size={12} color={colors.primary} />
                <Text style={[styles.linkedAgendaText, { color: colors.text }]} numberOfLines={1}>
                  Agenda Terkait: <Text style={{ fontFamily: fonts.bold }}>Bimtek Saksi C1 (21 Sep)</Text>
                </Text>
              </View>
              <View style={styles.readMoreRow}>
                <Text style={[styles.readMoreText, { color: colors.primary }]}>Baca Arahan</Text>
                <Feather name="arrow-right" size={12} color={colors.primary} />
              </View>
            </View>
          </Pressable>
        ) : (
          /* TAB 2: AGENDA TERDEKAT */
          <View style={styles.agendaContentWrap}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.agendaScrollTrack}
            >
              {/* Agenda Card 1 */}
              <View style={[styles.modernAgendaCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC', borderColor: colors.border }]}>
                <View style={styles.modernAgendaHeader}>
                  <View style={[styles.agendaPillTagModern, { backgroundColor: 'rgba(220, 38, 38, 0.1)' }]}>
                    <Text style={[styles.agendaPillTagModernText, { color: '#DC2626' }]}>Konsolidasi DPD</Text>
                  </View>
                  <Text style={[styles.agendaPriorityBadge, { color: colors.textMuted }]}>Wajib Hadir</Text>
                </View>
                <Text style={[styles.modernAgendaTitle, { color: colors.text }]} numberOfLines={2}>
                  Konsolidasi Akbar Kader DPD & Pemenangan Pemilu
                </Text>
                <View style={styles.modernAgendaInfoRow}>
                  <Feather name="calendar" size={11} color={colors.primary} />
                  <Text style={[styles.modernAgendaInfoText, { color: colors.textMuted }]}>Sabtu, 20 Sep • 09:00 WIB</Text>
                </View>
                <View style={styles.modernAgendaInfoRow}>
                  <Feather name="map-pin" size={11} color={colors.primary} />
                  <Text style={[styles.modernAgendaInfoText, { color: colors.textMuted }]} numberOfLines={1}>
                    Gedung DPD PAN Kab. Bandung
                  </Text>
                </View>
                <Pressable
                  onPress={() => {
                    setDialogConfig({
                      visible: true,
                      title: 'Konfirmasi Kehadiran',
                      message: 'Kehadiran Anda pada Konsolidasi Akbar DPD telah dicatat oleh sekretariat.',
                      tone: 'success',
                    });
                  }}
                  style={({ pressed }) => [
                    styles.modernAgendaBtn,
                    { backgroundColor: colors.primary },
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Text style={styles.modernAgendaBtnText}>Konfirmasi Hadir</Text>
                  <Feather name="check" size={11} color="#FFFFFF" />
                </Pressable>
              </View>

              {/* Agenda Card 2 */}
              <View style={[styles.modernAgendaCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC', borderColor: colors.border }]}>
                <View style={styles.modernAgendaHeader}>
                  <View style={[styles.agendaPillTagModern, { backgroundColor: 'rgba(2, 132, 199, 0.1)' }]}>
                    <Text style={[styles.agendaPillTagModernText, { color: '#0284C7' }]}>Bimtek Saksi C1</Text>
                  </View>
                  <Text style={[styles.agendaPriorityBadge, { color: colors.success }]}>Terdaftar</Text>
                </View>
                <Text style={[styles.modernAgendaTitle, { color: colors.text }]} numberOfLines={2}>
                  Pelatihan Pengisian C1 Plano & Vision AI BSN
                </Text>
                <View style={styles.modernAgendaInfoRow}>
                  <Feather name="calendar" size={11} color={colors.primary} />
                  <Text style={[styles.modernAgendaInfoText, { color: colors.textMuted }]}>Minggu, 21 Sep • 13:00 WIB</Text>
                </View>
                <View style={styles.modernAgendaInfoRow}>
                  <Feather name="map-pin" size={11} color={colors.primary} />
                  <Text style={[styles.modernAgendaInfoText, { color: colors.textMuted }]} numberOfLines={1}>
                    Posko Kawal Suara Coblong
                  </Text>
                </View>
                <Pressable
                  onPress={() => navigation.navigate('ReportForm', { tpsId: 'TPS-001' })}
                  style={({ pressed }) => [
                    styles.modernAgendaBtn,
                    { backgroundColor: colors.surface, borderColor: colors.primary, borderWidth: 1 },
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Text style={[styles.modernAgendaBtnText, { color: colors.primary }]}>Buka Materi Bimtek</Text>
                  <Feather name="book-open" size={11} color={colors.primary} />
                </Pressable>
              </View>

              {/* Agenda Card 3 */}
              <View style={[styles.modernAgendaCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC', borderColor: colors.border }]}>
                <View style={styles.modernAgendaHeader}>
                  <View style={[styles.agendaPillTagModern, { backgroundColor: 'rgba(217, 119, 6, 0.1)' }]}>
                    <Text style={[styles.agendaPillTagModernText, { color: '#D97706' }]}>Apel Akbar</Text>
                  </View>
                  <Text style={[styles.agendaPriorityBadge, { color: colors.textMuted }]}>Buka Kuota</Text>
                </View>
                <Text style={[styles.modernAgendaTitle, { color: colors.text }]} numberOfLines={2}>
                  Apel Siaga Pengawalan Suara Saksi TPS
                </Text>
                <View style={styles.modernAgendaInfoRow}>
                  <Feather name="calendar" size={11} color={colors.primary} />
                  <Text style={[styles.modernAgendaInfoText, { color: colors.textMuted }]}>Rabu, 24 Sep • 07:00 WIB</Text>
                </View>
                <View style={styles.modernAgendaInfoRow}>
                  <Feather name="map-pin" size={11} color={colors.primary} />
                  <Text style={[styles.modernAgendaInfoText, { color: colors.textMuted }]} numberOfLines={1}>
                    Lapangan Merdeka Bandung
                  </Text>
                </View>
                <Pressable
                  onPress={() => setShowAgendaModal(true)}
                  style={({ pressed }) => [
                    styles.modernAgendaBtn,
                    { backgroundColor: colors.primary },
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Text style={styles.modernAgendaBtnText}>Daftar Ikut</Text>
                  <Feather name="user-plus" size={11} color="#FFFFFF" />
                </Pressable>
              </View>
            </ScrollView>
          </View>
        )}
      </View>

      {/* ========================================================================= */}
      {/* 8. ⚡ QUICK ACTION: KOTAK-KOTAK KECIL ALA BCA MOBILE YANG SANGAT BAGUS     */}
      {/* ========================================================================= */}
      <View style={styles.sectionWrap}>
        <View style={styles.sectionHeaderBetween}>
          <View>
            <Text style={[styles.sectionHeadingTitle, { color: colors.text }]}>Quick Menu</Text>
          </View>
          <View style={[styles.bcaBrandTag, { backgroundColor: colors.primaryLight }]}>
          </View>
        </View>

        {/* 4 PRIMARY BCA QUICK ACTION BUTTONS */}
        <View style={styles.bcaFourRow}>
          {/* 1. [ Scan QR ] */}
          <Pressable
            onPress={() => setShowScanModal(true)}
            style={({ pressed }) => [
              styles.bcaSquircleBtn,
              { backgroundColor: colors.surface, borderColor: colors.border },
              pressed && { opacity: 0.8, transform: [{ scale: 0.96 }] },
            ]}
          >
            <View style={[styles.bcaSquircleIconWrap, { backgroundColor: '#E0F2FE' }]}>
              <Feather name="maximize" size={22} color="#0284C7" strokeWidth={2} />
            </View>
            <Text style={[styles.bcaSquircleLabel, { color: colors.text }]} numberOfLines={1}>
              Scan QR
            </Text>
            <Text style={[styles.bcaSquircleMicro, { color: colors.textMuted }]}>
              C1 / e-KTA
            </Text>
          </Pressable>

          {/* 2. [ Check-in ] */}
          <Pressable
            onPress={() => navigation.navigate('CheckIn')}
            style={({ pressed }) => [
              styles.bcaSquircleBtn,
              { backgroundColor: colors.surface, borderColor: colors.border },
              pressed && { opacity: 0.8, transform: [{ scale: 0.96 }] },
            ]}
          >
            <View style={[styles.bcaSquircleIconWrap, { backgroundColor: '#ECFDF5' }]}>
              <Feather name="map-pin" size={22} color="#10B981" strokeWidth={2} />
            </View>
            <Text style={[styles.bcaSquircleLabel, { color: colors.text }]} numberOfLines={1}>
              Check-in
            </Text>
            <Text style={[styles.bcaSquircleMicro, { color: colors.textMuted }]}>
              Presensi GPS
            </Text>
          </Pressable>

          {/* 3. [ Laporkan ] */}
          <Pressable
            onPress={() => setShowReportModal(true)}
            style={({ pressed }) => [
              styles.bcaSquircleBtn,
              { backgroundColor: colors.surface, borderColor: colors.border },
              pressed && { opacity: 0.8, transform: [{ scale: 0.96 }] },
            ]}
          >
            <View style={[styles.bcaSquircleIconWrap, { backgroundColor: '#FEF2F2' }]}>
              <Feather name="edit-3" size={22} color="#DC2626" strokeWidth={2} />
            </View>
            <Text style={[styles.bcaSquircleLabel, { color: colors.text }]} numberOfLines={1}>
              Laporkan
            </Text>
            <Text style={[styles.bcaSquircleMicro, { color: colors.textMuted }]}>
              C1 & SOS
            </Text>
          </Pressable>

          {/* 4. [ Daftar Kegiatan ] */}
          <Pressable
            onPress={() => setShowAgendaModal(true)}
            style={({ pressed }) => [
              styles.bcaSquircleBtn,
              { backgroundColor: colors.surface, borderColor: colors.border },
              pressed && { opacity: 0.8, transform: [{ scale: 0.96 }] },
            ]}
          >
            <View style={[styles.bcaSquircleIconWrap, { backgroundColor: '#F3E8FF' }]}>
              <Feather name="calendar" size={22} color="#9333EA" strokeWidth={2} />
            </View>
            <Text style={[styles.bcaSquircleLabel, { color: colors.text }]} numberOfLines={1}>
              Kegiatan
            </Text>
            <Text style={[styles.bcaSquircleMicro, { color: colors.textMuted }]}>
              Daftar Ikut
            </Text>
          </Pressable>
        </View>

        {/* FULL BCA MENU GRID (2-COLUMN CARDS EXACTLY AS IN WIREFRAME 2) */}
        <View style={{ marginTop: spacing.sm, gap: spacing.xs }}>
          <View style={styles.sectionHeaderBetween}>
            <Text style={[styles.bcaGridSectionTitle, { color: colors.text }]}>
              Layanan Kader & Calon Parlemen
            </Text>
            <Text style={{ fontSize: 10, fontFamily: fonts.medium, color: colors.textMuted }}>
              Semua Aspek Menu
            </Text>
          </View>

          <View style={styles.bcaGridContainer}>
            {bcaMenuItems.map((item) => {
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
                    styles.bcaMenuCard,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
                  ]}
                >
                  <View style={styles.bcaMenuCardHeader}>
                    <View style={[styles.bcaMenuIconBadge, { backgroundColor: iconBg }]}>
                      <Feather name={item.icon} size={18} color={iconColor} strokeWidth={2} />
                    </View>
                    {item.badge && (
                      <View
                        style={[
                          styles.bcaMicroBadge,
                          {
                            backgroundColor:
                              item.tone === 'success'
                                ? colors.successBg
                                : item.tone === 'danger'
                                ? colors.dangerBg
                                : colors.primaryLight,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.bcaMicroBadgeText,
                            {
                              color:
                                item.tone === 'success'
                                  ? colors.success
                                  : item.tone === 'danger'
                                  ? colors.danger
                                  : colors.primary,
                            },
                          ]}
                        >
                          {item.badge}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={{ gap: 2, marginTop: 4 }}>
                    <Text style={[styles.bcaMenuCardTitle, { color: colors.text }]} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={[styles.bcaMenuCardSub, { color: colors.textMuted }]} numberOfLines={1}>
                      {item.subtitle}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      {/* ========================================================================= */}
      {/* 4. 🎓 PELATIHAN SAYA (AKADEMI SAKSI & KADER PAN)                           */}
      {/* ========================================================================= */}
      <Card style={{ gap: spacing.sm, backgroundColor: colors.surface, borderColor: colors.border }}>
        <View style={styles.sectionHeaderBetween}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Pill label="SimPAN Academy" tone="primary" />
          </View>
          <Text style={{ fontSize: 11, fontFamily: fonts.semiBold, color: colors.success }}>
            2 dari 3 Selesai
          </Text>
        </View>

        {/* Pelatihan 1: Bimtek Saksi C1 */}
        <View style={[styles.trainingItemBox, { backgroundColor: isDark ? 'rgba(0,43,82,0.3)' : '#F8FAFC', borderColor: colors.border }]}>
          <View style={styles.trainingItemHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
              <View style={[styles.trainingIconBadge, { backgroundColor: colors.successBg }]}>
                <Feather name="check-circle" size={16} color={colors.success} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.trainingItemTitle, { color: colors.text }]}>
                  Bimtek Saksi TPS & Vision AI C1 Plano
                </Text>
                <Text style={[styles.trainingItemSub, { color: colors.textMuted }]}>
                  3 dari 3 Modul Selesai • Skor 96/100
                </Text>
              </View>
            </View>
            <Pill label="Lulus 100%" tone="success" />
          </View>
          <Pressable
            onPress={() => {
              setDialogConfig({
                visible: true,
                title: 'E-Sertifikat Saksi Terverifikasi',
                message: 'Sertifikat Kompetensi Saksi BSN PAN No. SERT-PAN-3273-08912 telah diterbitkan secara digital.',
                tone: 'success',
              });
            }}
            style={({ pressed }) => [styles.trainingActionLink, pressed && { opacity: 0.7 }]}
          >
            <Feather name="award" size={12} color={colors.primary} />
            <Text style={[styles.trainingActionLinkText, { color: colors.primary }]}>
              Lihat E-Sertifikat Saksi BSN
            </Text>
          </Pressable>
        </View>

        {/* Pelatihan 2: Kaderisasi Tingkat Pertama (In Progress) */}
        <View style={[styles.trainingItemBox, { backgroundColor: isDark ? 'rgba(0,43,82,0.3)' : '#F8FAFC', borderColor: colors.border }]}>
          <View style={styles.trainingItemHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
              <View style={[styles.trainingIconBadge, { backgroundColor: colors.primaryLight }]}>
                <Feather name="book-open" size={16} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.trainingItemTitle, { color: colors.text }]}>
                  Kaderisasi Tingkat Pertama (KTP) simPAN
                </Text>
                <Text style={[styles.trainingItemSub, { color: colors.textMuted }]}>
                  Modul 2 Selesai • Lanjut: Visi & Platform PAN
                </Text>
              </View>
            </View>
            <Pill label="67% Berjalan" tone="primary" />
          </View>

          <View style={[styles.trainingProgressBarTrack, { backgroundColor: colors.border }]}>
            <View style={[styles.trainingProgressBarFill, { width: '67%', backgroundColor: colors.primary }]} />
          </View>

          <Pressable
            onPress={() => {
              setDialogConfig({
                visible: true,
                title: 'Lanjutkan Modul 3',
                message: 'Modul "Platform Perjuangan Politik & Etika Saksi PAN" siap dipelajari.',
                tone: 'primary',
              });
            }}
            style={({ pressed }) => [styles.trainingActionLink, pressed && { opacity: 0.7 }]}
          >
            <Feather name="play-circle" size={12} color={colors.primary} />
            <Text style={[styles.trainingActionLinkText, { color: colors.primary }]}>
              Lanjutkan Modul 3 (Estimasi: 15 Menit)
            </Text>
          </Pressable>
        </View>

        {/* Pelatihan 3: SOP Sengketa */}
        <View style={[styles.trainingItemBox, { backgroundColor: isDark ? 'rgba(0,43,82,0.3)' : '#F8FAFC', borderColor: colors.border }]}>
          <View style={styles.trainingItemHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
              <View style={[styles.trainingIconBadge, { backgroundColor: colors.warningBg }]}>
                <Feather name="shield" size={16} color={colors.warning} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.trainingItemTitle, { color: colors.text }]}>
                  SOP Advokasi & Penanganan Sengketa Suara
                </Text>
                <Text style={[styles.trainingItemSub, { color: colors.textMuted }]}>
                  Panduan Pelanggaran KPPS, Bawaslu, & MK
                </Text>
              </View>
            </View>
            <Pill label="Tersedia" tone="warning" />
          </View>
          <Pressable
            onPress={() => navigation.navigate('HelpCenter')}
            style={({ pressed }) => [styles.trainingActionLink, pressed && { opacity: 0.7 }]}
          >
            <Feather name="external-link" size={12} color={colors.primary} />
            <Text style={[styles.trainingActionLinkText, { color: colors.primary }]}>
              Pelajari Panduan & SOP Saksi
            </Text>
          </Pressable>
        </View>
      </Card>

      {/* ========================================================================= */}
      {/* 5. 🎯 TUGAS SAYA (CHECKLIST HARIAN & HARI-H ANGGOTA)                       */}
      {/* ========================================================================= */}
      <Card style={{ gap: spacing.sm, backgroundColor: colors.surface, borderColor: colors.border }}>
        <View style={styles.sectionHeaderBetween}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={[styles.sectionHeadingTitle, { color: colors.text }]}>Tugas Saya</Text>
            <View style={[styles.counterBadge, { backgroundColor: colors.successBg }]}>
              <Text style={[styles.counterBadgeText, { color: colors.success }]}>2 Selesai</Text>
            </View>
          </View>
          <Text style={{ fontSize: 11, fontFamily: fonts.semiBold, color: colors.textMuted }}>
            Hari Pemungutan Suara
          </Text>
        </View>

        <View style={{ gap: spacing.xs }}>
          {taskChecklist.map((task) => (
            <View
              key={task.id}
              style={[
                styles.taskItemBox,
                {
                  backgroundColor: isDark ? 'rgba(0,43,82,0.35)' : '#FFFFFF',
                  borderColor: task.done ? colors.success : colors.border,
                },
              ]}
            >
              <View style={styles.taskItemTopRow}>
                <View
                  style={[
                    styles.taskCheckCircle,
                    { backgroundColor: task.done ? colors.success : colors.border },
                  ]}
                >
                  <Feather
                    name={task.done ? 'check' : 'clock'}
                    size={13}
                    color={task.done ? '#FFFFFF' : colors.textMuted}
                  />
                </View>

                <View style={{ flex: 1, gap: 2 }}>
                  <Text
                    style={[
                      styles.taskTitleText,
                      { color: colors.text, textDecorationLine: task.done ? 'none' : 'none' },
                    ]}
                  >
                    {task.title}
                  </Text>
                  <Text style={[styles.taskDescText, { color: colors.textMuted }]}>
                    {task.desc}
                  </Text>
                </View>
              </View>

              <View style={[styles.taskFooterRow, { borderTopColor: colors.border }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Feather name="info" size={11} color={task.done ? colors.success : colors.primary} />
                  <Text style={[styles.taskStatusNote, { color: task.done ? colors.success : colors.textMuted }]}>
                    {task.time}
                  </Text>
                </View>

                <Pressable
                  onPress={task.onPress}
                  style={({ pressed }) => [
                    styles.taskActionButton,
                    { backgroundColor: task.done ? colors.surface : colors.primary, borderColor: colors.border },
                    task.done && { borderWidth: 1 },
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Text
                    style={[
                      styles.taskActionButtonText,
                      { color: task.done ? colors.text : '#FFFFFF' },
                    ]}
                  >
                    {task.actionLabel}
                  </Text>
                  <Feather
                    name="chevron-right"
                    size={12}
                    color={task.done ? colors.text : '#FFFFFF'}
                  />
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      </Card>

      {/* ========================================================================= */}
      {/* 6. 🗳️ STATUS SAKSI (MONITORING STATUS PENUGASAN TPS SAYA)                  */}
      {/* ========================================================================= */}
      <Card style={{ gap: spacing.sm, backgroundColor: colors.surface, borderColor: colors.border }}>
        <View style={styles.sectionHeaderBetween}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={[styles.sectionHeadingTitle, { color: colors.text }]}>Status Saksi</Text>
            <Pill label="Mandat Terverifikasi" tone="success" />
          </View>
          <Text style={{ fontSize: 11, fontFamily: fonts.bold, color: colors.primary }}>
            TPS 001 Dago
          </Text>
        </View>

        <View style={[styles.witnessStatusBox, { backgroundColor: isDark ? 'rgba(0,43,82,0.4)' : '#F0F9FF', borderColor: isDark ? '#0A3D6B' : '#BAE6FD' }]}>
          <View style={styles.witnessStatusTop}>
            <View style={{ gap: 2, flex: 1 }}>
              <Text style={[styles.wsTpsTitle, { color: colors.text }]}>
                TPS 001 — Kel. Dago, Kec. Coblong
              </Text>
              <Text style={[styles.wsTpsSub, { color: colors.textMuted }]}>
                Kota Bandung, Jawa Barat • DPT: 284 Pemilih
              </Text>
            </View>
            <View style={[styles.wsStatusBadge, { backgroundColor: colors.successBg, borderColor: colors.success }]}>
              <View style={[styles.pulsingGreenDot, { backgroundColor: colors.success }]} />
              <Text style={[styles.wsStatusBadgeText, { color: colors.success }]}>
                SIAGA LAPANGAN
              </Text>
            </View>
          </View>

          <View style={[styles.wsDetailsGrid, { borderTopColor: colors.border }]}>
            <View style={styles.wsDetailCell}>
              <Text style={[styles.wsCellLabel, { color: colors.textMuted }]}>Koordinator TPS</Text>
              <Text style={[styles.wsCellValue, { color: colors.text }]}>Asep Ridwan</Text>
              <Text style={[styles.wsCellSub, { color: colors.primary }]}>0811-2233-4455</Text>
            </View>
            <View style={styles.wsDetailCell}>
              <Text style={[styles.wsCellLabel, { color: colors.textMuted }]}>Surat Mandat</Text>
              <Text style={[styles.wsCellValue, { color: colors.text }]}>042/SM-DPP/2026</Text>
              <Text style={[styles.wsCellSub, { color: colors.success }]}>Sah KPU & Bawaslu</Text>
            </View>
          </View>

          {/* Quick Buttons for Witness */}
          <View style={styles.wsActionButtonsRow}>
            <Pressable
              onPress={() => navigation.navigate('AssignmentLetter', { witnessId: CURRENT_WITNESS_ID })}
              style={({ pressed }) => [
                styles.wsBtnOutline,
                { backgroundColor: colors.surface, borderColor: colors.border },
                pressed && { opacity: 0.8 },
              ]}
            >
              <Feather name="file-text" size={13} color={colors.primary} />
              <Text style={[styles.wsBtnOutlineText, { color: colors.primary }]}>Buka Mandat</Text>
            </Pressable>

            <Pressable
              onPress={() => navigation.navigate('TpsDetail', { tpsId: currentTps?.id || 'TPS-001' })}
              style={({ pressed }) => [
                styles.wsBtnOutline,
                { backgroundColor: colors.surface, borderColor: colors.border },
                pressed && { opacity: 0.8 },
              ]}
            >
              <Feather name="map-pin" size={13} color={colors.primary} />
              <Text style={[styles.wsBtnOutlineText, { color: colors.primary }]}>Info TPS</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setDialogConfig({
                  visible: true,
                  title: 'Kontak Koordinator',
                  message: 'Hubungi Asep Ridwan (Koordinator TPS Kel. Dago) di nomor 0811-2233-4455 via WhatsApp atau Telepon.',
                  tone: 'info',
                });
              }}
              style={({ pressed }) => [
                styles.wsBtnSolid,
                { backgroundColor: colors.primary },
                pressed && { opacity: 0.85 },
              ]}
            >
              <Feather name="phone" size={13} color="#FFFFFF" />
              <Text style={styles.wsBtnSolidText}>Hubungi Korlap</Text>
            </Pressable>
          </View>
        </View>
      </Card>

      {/* ========================================================================= */}
      {/* 7. 📍 AKTIVITAS WILAYAH (LIVE REGIONAL TIMELINE)                           */}
      {/* ========================================================================= */}
      <Card style={{ gap: spacing.sm, backgroundColor: colors.surface, borderColor: colors.border }}>
        <View style={styles.sectionHeaderBetween}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={[styles.sectionHeadingTitle, { color: colors.text }]}>Aktivitas Wilayah</Text>
            <View style={[styles.counterBadge, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.counterBadgeText, { color: colors.primary }]}>Live Feed</Text>
            </View>
          </View>
          <Text style={{ fontSize: 11, fontFamily: fonts.medium, color: colors.textMuted }}>
            DPD Kab. Bandung
          </Text>
        </View>

        <View style={{ gap: 10 }}>
          {[
            {
              time: '15 Menit Lalu',
              title: 'Saksi TPS 003 Dago Berhasil Presensi GPS',
              desc: 'Rudi Santoso telah terverifikasi hadir di titik koordinat TPS radius 45 meter.',
              tag: 'Presensi',
              icon: 'map-pin' as const,
              tone: 'success' as const,
            },
            {
              time: '1 Jam Lalu',
              title: 'Distribusi 1.200 Surat Mandat Fisik DPD',
              desc: 'Sekretariat DPD menyelesaikan penyerahan bundel surat mandat ke 6 posko kecamatan.',
              tag: 'Logistik',
              icon: 'package' as const,
              tone: 'primary' as const,
            },
            {
              time: '3 Jam Lalu',
              title: 'Posko Induk Coblong: Logistik Saksi Tiba',
              desc: 'Paket konsumsi, vitamin, dan rompi saksi resmi siap didistribusikan ke TPS 001 - 015.',
              tag: 'Posko',
              icon: 'truck' as const,
              tone: 'warning' as const,
            },
          ].map((act, idx) => (
            <View key={idx} style={styles.activityFeedItem}>
              <View style={[styles.activityIconCircle, { backgroundColor: colors.primaryLight }]}>
                <Feather name={act.icon} size={13} color={colors.primary} />
              </View>
              <View style={{ flex: 1, gap: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={[styles.activityItemTitle, { color: colors.text }]}>{act.title}</Text>
                  <Text style={[styles.activityItemTime, { color: colors.textMuted }]}>{act.time}</Text>
                </View>
                <Text style={[styles.activityItemDesc, { color: colors.textMuted }]}>{act.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </Card>



      {/* ========================================================================= */}
      {/* 9. SISA-SISA ITEM YANG ADA KEBAWAH (RETAINED & REFINED WITH POPPINS)        */}
      {/* Seluruh item historis (rekap suara, PT 4%, kecamatan, absensi saksi)       */}
      {/* dipertahankan di bawah quick action dan dirapikan secara proporsional.     */}
      {/* ========================================================================= */}
      <View style={{ marginTop: spacing.sm, gap: spacing.md }}>
        <SectionTitle style={{ marginBottom: 0 }}>
          Detail Tabulasi & Pengawalan Suara
        </SectionTitle>

        {/* Hero Suara Caleg & Live Tabulasi C1 */}
        <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.heroHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={[styles.livePulseDot, { backgroundColor: colors.success }]} />
              <Text style={[styles.liveTabulasiText, { color: colors.success }]}>LIVE TABULASI C1 BSN</Text>
            </View>
            <View style={[styles.tpsInflowBadge, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.tpsInflowBadgeText, { color: colors.primary }]}>TPS Masuk: 84,2% (4.210 TPS)</Text>
            </View>
          </View>

          <View style={{ marginTop: 4, gap: 2 }}>
            <Text style={[styles.voteSummaryLabel, { color: colors.textMuted }]}>
              Monitoring Suara Caleg DPR-RI Dapil Jabar I
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <Text style={[styles.heroBigVoteNum, { color: colors.primary }]}>54.210</Text>
              <View style={[styles.surplusPill, { backgroundColor: colors.successBg, borderColor: colors.success }]}>
                <Feather name="trending-up" size={12} color={colors.success} />
                <Text style={[styles.surplusPillText, { color: colors.success }]}>+2.840 Surplus Target</Text>
              </View>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={{ gap: 4, marginTop: 4 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 11, fontFamily: fonts.medium, color: colors.textMuted }}>Target Pemenangan Dapil</Text>
              <Text style={{ fontSize: 11, fontFamily: fonts.bold, color: colors.success }}>109,4% (Target: 30.000)</Text>
            </View>
            <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
              <View style={[styles.progressFillBase, { width: '91.4%', backgroundColor: colors.primary }]} />
              <View style={[styles.progressFillSurplus, { width: '8.6%', backgroundColor: colors.success }]} />
            </View>
          </View>

          <View style={[styles.statRow, { borderTopColor: colors.border }]}>
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: colors.primary }]}>54.210</Text>
              <Text style={[styles.statSub, { color: colors.textMuted }]}>Suara Caleg</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: colors.success }]}>128.450</Text>
              <Text style={[styles.statSub, { color: colors.textMuted }]}>Suara PAN Dapil</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: colors.text }]}>85,6%</Text>
              <Text style={[styles.statSub, { color: colors.textMuted }]}>Target Masuk</Text>
            </View>
          </View>
        </View>

        {/* Proyeksi Kursi Parlemen Card */}
        <Card style={{ gap: spacing.xs, backgroundColor: '#002B49', borderColor: '#0066B3' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Feather name="award" size={18} color="#60A5FA" />
              <Text style={{ fontSize: 13, fontFamily: fonts.bold, color: '#FFFFFF' }}>
                Proyeksi Kursi Parlemen
              </Text>
            </View>
            <Pill label="Aman Terpilih" tone="success" />
          </View>
          <Text style={{ fontSize: fontSize.xs, fontFamily: fonts.regular, color: '#93C5FD', lineHeight: 18 }}>
            Berdasarkan simulasi Sainte-Laguë perolehan suara 112.450 (14,8%), Partai Amanat Nasional mengamankan Kursi Ke-3 dari total 7 Kursi DPR-RI di Dapil Jabar 1.
          </Text>
        </Card>

        {/* Ambang Batas Parlemen (PT 4%) Indicator */}
        <Card style={{ gap: spacing.sm, backgroundColor: colors.surface, borderColor: colors.border }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Image source={BRAND_ASSETS.official} style={{ width: 22, height: 22 }} resizeMode="contain" />
              <Text style={{ fontSize: 12, fontFamily: fonts.bold, color: colors.text }}>
                Partai PAN & Parlemen Senayan
              </Text>
            </View>
            <Pill label="Lolos PT 4%" tone="success" />
          </View>

          <View style={[styles.thresholdCard, { backgroundColor: isDark ? 'rgba(0, 43, 82, 0.4)' : '#F8FAFC', borderColor: colors.border }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 11, fontFamily: fonts.medium, color: colors.textMuted }}>Ambang Batas Parlemen (PT)</Text>
              <Text style={{ fontSize: 11, fontFamily: fonts.bold, color: colors.success }}>7,24% (+3,24% Margin Aman)</Text>
            </View>
            <View style={[styles.thresholdBarTrack, { backgroundColor: colors.border }]}>
              <View style={[styles.thresholdBarFill, { width: '72.4%', backgroundColor: colors.success }]} />
              <View style={[styles.thresholdMarker, { left: '40%' }]} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 9, fontFamily: fonts.regular, color: colors.textMuted }}>0%</Text>
              <Text style={{ fontSize: 9, fontFamily: fonts.bold, color: colors.textMuted, marginLeft: 28 }}>Batas PT 4,00%</Text>
              <Text style={{ fontSize: 9, fontFamily: fonts.bold, color: colors.primary }}>PAN 7,24%</Text>
            </View>
          </View>

          <View style={[styles.statRow, { borderTopColor: colors.border, marginTop: 2, paddingTop: spacing.xs }]}>
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: colors.text }]}>112.450</Text>
              <Text style={[styles.statSub, { color: colors.textMuted }]}>Suara PAN Dapil 1</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: colors.primary }]}>1 Kursi</Text>
              <Text style={[styles.statSub, { color: colors.textMuted }]}>Potensi Dapil</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: colors.success }]}>48 Kursi</Text>
              <Text style={[styles.statSub, { color: colors.textMuted }]}>DPR-RI Senayan</Text>
            </View>
          </View>

          <Pressable
            onPress={() => navigation.navigate('PartyLeaderboard')}
            style={({ pressed }) => [styles.linkDetailBtn, pressed && { opacity: 0.7 }]}
          >
            <Text style={{ fontSize: 11, fontFamily: fonts.bold, color: colors.primary }}>
              Lihat Simulasi Sainte-Laguë Lengkap
            </Text>
            <Feather name="arrow-right" size={13} color={colors.primary} />
          </Pressable>
        </Card>

        {/* Sebaran Suara per Kecamatan */}
        <Card style={{ gap: spacing.md, backgroundColor: colors.surface, borderColor: colors.border }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <SectionTitle style={{ marginBottom: 0 }}>Sebaran Suara per Kecamatan</SectionTitle>
            <View style={[styles.badgePillSmall, { backgroundColor: colors.primaryLight }]}>
              <Text style={{ fontSize: 10, fontFamily: fonts.bold, color: colors.primary }}>5 Basis Utama</Text>
            </View>
          </View>

          <View style={{ gap: spacing.sm }}>
            {[
              { kec: 'Kec. Coblong', suara: '8.420', pct: 25.6, barWidth: '100%', isMain: true },
              { kec: 'Kec. Cimahi Selatan', suara: '7.880', pct: 24.0, barWidth: '93.6%', isMain: false },
              { kec: 'Kec. Antapani', suara: '6.250', pct: 19.0, barWidth: '74.2%', isMain: false },
              { kec: 'Kec. Sukasari', suara: '5.910', pct: 18.0, barWidth: '70.3%', isMain: false },
              { kec: 'Kec. Cidadap & Lainnya', suara: '4.380', pct: 13.4, barWidth: '52.3%', isMain: false },
            ].map((item, idx) => (
              <View key={idx} style={{ gap: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{ fontSize: 12, fontFamily: fonts.bold, color: colors.text }}>{item.kec}</Text>
                    {item.isMain && (
                      <View style={[styles.basisBadge, { backgroundColor: colors.primaryLight }]}>
                        <Text style={[styles.basisBadgeText, { color: colors.primary }]}>Basis Utama</Text>
                      </View>
                    )}
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{ fontSize: 12, fontFamily: fonts.bold, color: colors.text }}>{item.suara}</Text>
                    <Text style={{ fontSize: 11, fontFamily: fonts.medium, color: colors.textMuted }}>({item.pct}%)</Text>
                  </View>
                </View>

                <View style={[styles.distBarTrack, { backgroundColor: colors.border }]}>
                  <View
                    style={[
                      styles.distBarFill,
                      {
                        width: item.barWidth as DimensionValue,
                        backgroundColor: item.isMain ? colors.primary : isDark ? '#1D4ED8' : '#3B82F6',
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* Rekap Kehadiran Saksi TPS */}
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

        {/* Manajemen Saksi & Daftar TPS */}
        <Card style={{ gap: spacing.md, backgroundColor: colors.surface, borderColor: colors.border }}>
          <SectionTitle style={{ marginBottom: 0 }}>Daftar TPS & Saksi Binaan ({scopedTps.length} TPS)</SectionTitle>
          <Text style={[styles.subHint, { color: colors.textMuted }]}>
            Menampilkan 5 dari {scopedTps.length} TPS terdaftar di wilayah penugasan:
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
                <Text style={[styles.witnessSub, { color: colors.textMuted }]}>Kel. {item.village || 'Dago'} • DPT: {item.dpt} Pemilih</Text>
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
      </View>

      {/* ========================================================================= */}
      {/* MODALS: SCAN QR, LAPORKAN, DAFTAR KEGIATAN, INFORMASI PAN, E-KTA PASS     */}
      {/* ========================================================================= */}

      {/* 1. Modal Scan QR Options */}
      <Modal
        visible={showScanModal}
        onClose={() => setShowScanModal(false)}
        title="Pindai QR / Dokumen"
        subtitle="Pilih jenis pemindaian kamera AI simPAN"
      >
        <View style={{ gap: spacing.sm, paddingVertical: spacing.xs }}>
          <Pressable
            onPress={() => {
              setShowScanModal(false);
              navigation.navigate('ReportForm', { tpsId: 'TPS-001' });
            }}
            style={({ pressed }) => [
              styles.modalOptionTile,
              { backgroundColor: colors.surface, borderColor: colors.border },
              pressed && { opacity: 0.8 },
            ]}
          >
            <View style={[styles.modalOptionIconWrap, { backgroundColor: '#E0F2FE' }]}>
              <Feather name="camera" size={20} color="#0284C7" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.modalOptionTitle, { color: colors.text }]}>Foto & Scan C1 Plano (Vision AI)</Text>
              <Text style={[styles.modalOptionDesc, { color: colors.textMuted }]}>
                Ekstraksi angka perolehan suara TPS otomatis dengan kecerdasan buatan.
              </Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.textMuted} />
          </Pressable>

          <Pressable
            onPress={() => {
              setShowScanModal(false);
              setShowKtaQrModal(true);
            }}
            style={({ pressed }) => [
              styles.modalOptionTile,
              { backgroundColor: colors.surface, borderColor: colors.border },
              pressed && { opacity: 0.8 },
            ]}
          >
            <View style={[styles.modalOptionIconWrap, { backgroundColor: '#ECFDF5' }]}>
              <Feather name="maximize" size={20} color="#10B981" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.modalOptionTitle, { color: colors.text }]}>Tampilkan QR Pass e-KTA</Text>
              <Text style={[styles.modalOptionDesc, { color: colors.textMuted }]}>
                Validasi mandat keanggotaan resmi untuk presensi & verifikasi lapangan.
              </Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.textMuted} />
          </Pressable>

          <Pressable
            onPress={() => {
              setShowScanModal(false);
              navigation.navigate('KtpOcr');
            }}
            style={({ pressed }) => [
              styles.modalOptionTile,
              { backgroundColor: colors.surface, borderColor: colors.border },
              pressed && { opacity: 0.8 },
            ]}
          >
            <View style={[styles.modalOptionIconWrap, { backgroundColor: '#F3E8FF' }]}>
              <Feather name="credit-card" size={20} color="#9333EA" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.modalOptionTitle, { color: colors.text }]}>Scan KTP AI (Registrasi Anggota)</Text>
              <Text style={[styles.modalOptionDesc, { color: colors.textMuted }]}>
                Pindai e-KTP untuk pendaftaran anggota baru atau saksi binaan.
              </Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.textMuted} />
          </Pressable>
        </View>
      </Modal>

      {/* 2. Modal Laporkan Options */}
      <Modal
        visible={showReportModal}
        onClose={() => setShowReportModal(false)}
        title="Pusat Pelaporan Lapangan"
        subtitle="Kirim hasil suara atau eskalasi kendala TPS"
      >
        <View style={{ gap: spacing.sm, paddingVertical: spacing.xs }}>
          <Pressable
            onPress={() => {
              setShowReportModal(false);
              navigation.navigate('ReportForm', { tpsId: 'TPS-001' });
            }}
            style={({ pressed }) => [
              styles.modalOptionTile,
              { backgroundColor: colors.surface, borderColor: colors.border },
              pressed && { opacity: 0.8 },
            ]}
          >
            <View style={[styles.modalOptionIconWrap, { backgroundColor: '#ECFDF5' }]}>
              <Feather name="file-text" size={20} color="#10B981" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.modalOptionTitle, { color: colors.text }]}>Input Formulir C1 Plano</Text>
              <Text style={[styles.modalOptionDesc, { color: colors.textMuted }]}>
                Kirim data perolehan suara partai dan caleg DPR-RI di TPS Anda.
              </Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.textMuted} />
          </Pressable>

          <Pressable
            onPress={() => {
              setShowReportModal(false);
              navigation.navigate('EmergencyForm');
            }}
            style={({ pressed }) => [
              styles.modalOptionTile,
              { backgroundColor: colors.surface, borderColor: colors.border },
              pressed && { opacity: 0.8 },
            ]}
          >
            <View style={[styles.modalOptionIconWrap, { backgroundColor: '#FEF2F2' }]}>
              <Feather name="alert-triangle" size={20} color="#DC2626" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.modalOptionTitle, { color: colors.danger }]}>Laporkan Insiden & SOS TPS</Text>
              <Text style={[styles.modalOptionDesc, { color: colors.textMuted }]}>
                Eskalasi temuan kecurangan, intimidasi, atau surat suara rusak.
              </Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.textMuted} />
          </Pressable>
        </View>
      </Modal>

      {/* 3. Modal Agenda & Daftar Kegiatan */}
      <Modal
        visible={showAgendaModal}
        onClose={() => setShowAgendaModal(false)}
        title="Daftar Kegiatan & Bimtek"
        subtitle="Jadwal agenda resmi Partai Amanat Nasional"
      >
        <View style={{ gap: spacing.sm, paddingVertical: spacing.xs }}>
          {[
            {
              title: 'Konsolidasi Akbar DPD & Pemenangan Pemilu',
              date: 'Sabtu, 20 September 2026 • 09:00 WIB',
              loc: 'Gedung DPD PAN Kab. Bandung',
              status: 'Wajib Hadir',
            },
            {
              title: 'Bimtek Saksi C1 & Vision AI BSN',
              date: 'Minggu, 21 September 2026 • 13:00 WIB',
              loc: 'Kantor Posko Coblong',
              status: 'Terdaftar',
            },
            {
              title: 'Apel Akbar Pengawalan Suara Saksi TPS',
              date: 'Rabu, 24 September 2026 • 07:00 WIB',
              loc: 'Lapangan Merdeka Bandung',
              status: 'Buka Pendaftaran',
            },
            {
              title: 'Rapat Koordinasi Saksi TPS Kelurahan Dago',
              date: 'Jumat, 26 September 2026 • 19:30 WIB',
              loc: 'Ruang Rapat Online (Zoom Meeting)',
              status: 'Tersedia',
            },
          ].map((item, idx) => (
            <View
              key={idx}
              style={[
                styles.agendaModalRow,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[styles.agendaModalTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.agendaModalDate, { color: colors.primary }]}>{item.date}</Text>
                <Text style={[styles.agendaModalLoc, { color: colors.textMuted }]}>📍 {item.loc}</Text>
              </View>
              <Pressable
                onPress={() => {
                  setShowAgendaModal(false);
                  setDialogConfig({
                    visible: true,
                    title: 'Pendaftaran Berhasil',
                    message: `Anda telah terdaftar pada agenda: ${item.title}. Informasi detail telah dikirim via notifikasi.`,
                    tone: 'success',
                  });
                }}
                style={({ pressed }) => [
                  styles.agendaModalBtn,
                  { backgroundColor: colors.primary },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text style={styles.agendaModalBtnText}>Daftar</Text>
              </Pressable>
            </View>
          ))}
        </View>
      </Modal>

      {/* 4. Modal Informasi PAN Lengkap */}
      <Modal
        visible={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        title="Instruksi Resmi DPP PAN"
        subtitle="Badan Saksi Nasional (BSN) — Surat Edaran No. 042/SE-DPP/2026"
      >
        <View style={{ gap: spacing.md, paddingVertical: spacing.xs }}>
          <View style={[styles.infoBannerHighlight, { backgroundColor: colors.dangerBg, borderColor: colors.danger }]}>
            <Feather name="shield" size={16} color={colors.danger} />
            <Text style={[styles.infoBannerHighlightText, { color: colors.danger }]}>
              Instruksi Wajib: Seluruh Saksi & Kader Mengawal Rekap C1 Hingga Tuntas
            </Text>
          </View>

          <Text style={[styles.infoModalBody, { color: colors.text }]}>
            Kepada Seluruh Pengurus DPW, DPD, DPC, DPRt, serta Saksi BSN PAN di seluruh Indonesia:
            {'\n\n'}
            1. Pastikan hadir di TPS sebelum pukul 07.00 WIB dan melakukan presensi GPS melalui aplikasi simPAN 360.
            {'\n\n'}
            2. Tunjukkan Surat Mandat Digital resmi yang telah dilengkapi e-Meterai dan QR Code DPP ke petugas KPPS.
            {'\n\n'}
            3. Catat setiap suara saat penghitungan suara dimulai dan lakukan pemotretan lembar C1 Plano dengan sudut tegak lurus serta pencahayaan cukup.
            {'\n\n'}
            4. Segera laporkan setiap dugaan pelanggaran melalui tombol "Lapor Insiden SOS" agar dapat ditangani tim advokasi hukum Bawaslu & DPP PAN.
          </Text>

          <Pressable
            onPress={() => {
              setShowInfoModal(false);
              navigation.navigate('SimpanNews');
            }}
            style={({ pressed }) => [
              styles.infoModalCloseBtn,
              { backgroundColor: colors.primary },
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={styles.infoModalCloseBtnText}>Buka Warta DPP Lengkap</Text>
            <Feather name="arrow-right" size={14} color="#FFFFFF" />
          </Pressable>
        </View>
      </Modal>

      {/* 5. Modal e-KTA QR Pass */}
      <Modal
        visible={showKtaQrModal}
        onClose={() => setShowKtaQrModal(false)}
        title="e-KTA QR Pass Resmi"
        subtitle="Partai Amanat Nasional — Verifikasi Mandat Anggota"
      >
        <View style={{ alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm }}>
          <View style={[styles.qrContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <QrPlaceholder seed="32.73.01.2024.08912" size={180} />
          </View>
          <View style={{ alignItems: 'center', gap: 3 }}>
            <Text style={{ fontSize: fontSize.md, fontFamily: fonts.bold, color: colors.text }}>
              ANDRI — {profile.name}
            </Text>
            <Text style={{ fontSize: 12, fontFamily: fonts.semiBold, color: colors.primary }}>
              No. KTA: 32.73.01.2024.08912
            </Text>
            <Text style={{ fontSize: 11, fontFamily: fonts.medium, color: colors.textMuted }}>
              Anggota Aktif • DPD Kabupaten Bandung • Dapil Jawa Barat I
            </Text>
            <View style={{ marginTop: 6 }}>
              <Pill label="Terdaftar SIPOL KPU RI" tone="success" icon="check-circle" />
            </View>
          </View>

          <Pressable
            onPress={() => {
              setShowKtaQrModal(false);
              navigation.navigate('SimpanKta');
            }}
            style={({ pressed }) => [
              styles.openFullKtaBtn,
              { backgroundColor: colors.primary },
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={styles.openFullKtaBtnText}>Buka Kartu Fisik e-KTA</Text>
            <Feather name="arrow-right" size={14} color="#FFFFFF" />
          </Pressable>
        </View>
      </Modal>

      {/* Global Dialog Confirmation */}
      <ConfirmDialog
        visible={dialogConfig.visible}
        title={dialogConfig.title}
        message={dialogConfig.message}
        tone={dialogConfig.tone || 'info'}
        singleButton
        confirmLabel="OK, Mengerti"
        onConfirm={() => setDialogConfig((prev) => ({ ...prev, visible: false }))}
      />
    </ScrollView>
  );
}

// =========================================================================
// SUB-COMPONENTS
// =========================================================================

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
    <Card style={{ gap: spacing.sm, backgroundColor: colors.surface, borderColor: colors.border }}>
      <SectionTitle style={{ marginBottom: 0 }}>Kehadiran Saksi TPS</SectionTitle>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <Text style={{ fontSize: fontSize.xxl, fontFamily: fonts.bold, color: colors.success }}>
          {pctHadir}%
        </Text>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ fontSize: fontSize.xs, fontFamily: fonts.medium, color: colors.textMuted }}>
            Persentase Saksi Hadir dari {total} Saksi Binaan
          </Text>
          <View style={[styles.attendanceBarTrack, { backgroundColor: colors.dangerBg }]}>
            <View style={[styles.attendanceBarFill, { width: `${pctHadir}%`, backgroundColor: colors.success }]} />
          </View>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' }}>
        <Pill label={`${hadir} Hadir GPS`} tone="success" />
        <Pill label={`${tidakHadir} Belum Hadir`} tone="danger" />
        <Pill label={`${fullyPresentTpsCount}/${totalTpsCount} TPS 100% Siaga`} tone="info" />
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
    <Card style={{ gap: spacing.md, backgroundColor: colors.surface, borderColor: colors.border }}>
      <SectionTitle
        style={{ marginBottom: 0 }}
        action={
          <Pressable
            onPress={onToggleSort}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
          >
            <Feather name={sort === 'best' ? 'arrow-down' : 'arrow-up'} size={13} color={colors.primary} />
            <Text style={{ fontSize: 11, fontFamily: fonts.bold, color: colors.primary }}>
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
        Halaman <Text style={{ fontFamily: fonts.bold, color: colors.text }}>{currentPage}</Text> dari {totalPages}
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

// =========================================================================
// STYLES (POPPINS TYPOGRAPHY & REFINED COMPONENTS)
// =========================================================================
const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxxl },

  // Header & Identity Styles
  headerCard: {
    padding: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    gap: spacing.sm,
    ...shadow.card,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  headerTitleCol: {
    flex: 1,
    gap: 3,
  },
  headerBadgePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0,102,179,0.08)',
  },
  headerBadgePillText: {
    fontSize: 9.5,
    fontFamily: fonts.bold,
    letterSpacing: 0.4,
  },
  welcomeGreeting: {
    fontSize: 18,
    fontFamily: fonts.extraBold,
    letterSpacing: -0.2,
  },
  welcomeAccountSub: {
    fontSize: 11,
    fontFamily: fonts.medium,
  },
  avatarTouch: {
    position: 'relative',
  },
  avatarPhoto: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#0066B3',
  },
  onlineStatusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  // Status & Wilayah Box
  statusWilayahCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    justifyContent: 'space-between',
  },
  statusWilayahItem: {
    flex: 1,
    gap: 2,
  },
  swLabel: {
    fontSize: 10,
    fontFamily: fonts.medium,
  },
  activeStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  pulsingGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activeStatusPillText: {
    fontSize: 10,
    fontFamily: fonts.bold,
  },
  swDivider: {
    width: 1,
    height: 32,
    marginHorizontal: spacing.sm,
  },
  swValue: {
    fontSize: 11.5,
    fontFamily: fonts.bold,
  },
  swSubValue: {
    fontSize: 10,
    fontFamily: fonts.semiBold,
  },

  // Mini KTA Strip
  ktaMiniStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  ktaEmblemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  panEmblemSmall: {
    width: 22,
    height: 22,
  },
  ktaLabelText: {
    fontSize: 8.5,
    fontFamily: fonts.bold,
    letterSpacing: 0.5,
  },
  ktaNumberText: {
    fontSize: 11,
    fontFamily: fonts.bold,
  },
  ktaButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ktaMiniBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  ktaMiniBtnText: {
    fontSize: 10.5,
    fontFamily: fonts.bold,
  },
  ktaMiniBtnSolid: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  ktaMiniBtnSolidText: {
    fontSize: 10.5,
    fontFamily: fonts.bold,
    color: '#FFFFFF',
  },

  // 📢 Unified Warta & Agenda Card Styles
  unifiedWartaCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadow.card,
  },
  unifiedWartaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  unifiedSegmentTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  unifiedSegmentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  unifiedSegmentText: {
    fontSize: 11,
    fontFamily: fonts.bold,
  },
  agendaBadgeCircle: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: radius.pill,
    minWidth: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agendaBadgeCircleText: {
    fontSize: 9,
    fontFamily: fonts.bold,
  },
  unifiedActionLink: {
    fontSize: 11,
    fontFamily: fonts.bold,
  },

  // Instruksi Tab Styles
  instruksiContentBox: {
    gap: 6,
  },
  instruksiMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  instruksiTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  instruksiTagText: {
    fontSize: 10,
    fontFamily: fonts.bold,
    color: '#DC2626',
    letterSpacing: 0.3,
  },
  instruksiDateText: {
    fontSize: 10,
    fontFamily: fonts.medium,
  },
  instruksiTitleText: {
    fontSize: 13.5,
    fontFamily: fonts.bold,
    lineHeight: 19,
  },
  instruksiExcerptText: {
    fontSize: 11,
    fontFamily: fonts.regular,
    lineHeight: 16,
  },
  linkedAgendaTeaser: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: 2,
  },
  linkedAgendaText: {
    fontSize: 10.5,
    fontFamily: fonts.medium,
  },
  readMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  readMoreText: {
    fontSize: 10.5,
    fontFamily: fonts.bold,
  },

  // Agenda Tab Styles
  agendaContentWrap: {
    gap: spacing.xs,
  },
  agendaScrollTrack: {
    gap: spacing.sm,
    paddingVertical: 2,
  },
  modernAgendaCard: {
    width: 220,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.sm + 2,
    gap: 5,
  },
  modernAgendaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  agendaPillTagModern: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  agendaPillTagModernText: {
    fontSize: 9.5,
    fontFamily: fonts.bold,
  },
  agendaPriorityBadge: {
    fontSize: 9.5,
    fontFamily: fonts.bold,
  },
  modernAgendaTitle: {
    fontSize: 12,
    fontFamily: fonts.bold,
    lineHeight: 16,
  },
  modernAgendaInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  modernAgendaInfoText: {
    fontSize: 10,
    fontFamily: fonts.medium,
    flex: 1,
  },
  modernAgendaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: radius.pill,
    paddingVertical: 5,
    marginTop: 3,
  },
  modernAgendaBtnText: {
    fontSize: 10,
    fontFamily: fonts.bold,
    color: '#FFFFFF',
  },

  // 🎓 Pelatihan Saya Styles
  trainingItemBox: {
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: 6,
  },
  trainingItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  trainingIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trainingItemTitle: {
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  trainingItemSub: {
    fontSize: 10,
    fontFamily: fonts.regular,
  },
  trainingProgressBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  trainingProgressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  trainingActionLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingTop: 2,
  },
  trainingActionLinkText: {
    fontSize: 10.5,
    fontFamily: fonts.bold,
  },

  // 🎯 Tugas Saya Styles
  taskItemBox: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: 6,
  },
  taskItemTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  taskCheckCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  taskTitleText: {
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  taskDescText: {
    fontSize: 10.5,
    fontFamily: fonts.regular,
    lineHeight: 14,
  },
  taskFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 0.5,
  },
  taskStatusNote: {
    fontSize: 10,
    fontFamily: fonts.medium,
  },
  taskActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  taskActionButtonText: {
    fontSize: 10,
    fontFamily: fonts.bold,
  },

  // 🗳️ Status Saksi Styles
  witnessStatusBox: {
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xs,
  },
  witnessStatusTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  wsTpsTitle: {
    fontSize: 12.5,
    fontFamily: fonts.bold,
  },
  wsTpsSub: {
    fontSize: 10.5,
    fontFamily: fonts.regular,
  },
  wsStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  wsStatusBadgeText: {
    fontSize: 9.5,
    fontFamily: fonts.bold,
  },
  wsDetailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 0.5,
  },
  wsDetailCell: {
    flex: 1,
    gap: 1,
  },
  wsCellLabel: {
    fontSize: 9.5,
    fontFamily: fonts.medium,
  },
  wsCellValue: {
    fontSize: 11,
    fontFamily: fonts.bold,
  },
  wsCellSub: {
    fontSize: 9.5,
    fontFamily: fonts.bold,
  },
  wsActionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  wsBtnOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  wsBtnOutlineText: {
    fontSize: 10.5,
    fontFamily: fonts.bold,
  },
  wsBtnSolid: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 7,
    borderRadius: radius.pill,
  },
  wsBtnSolidText: {
    fontSize: 10.5,
    fontFamily: fonts.bold,
    color: '#FFFFFF',
  },

  // 📍 Aktivitas Wilayah Styles
  activityFeedItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 3,
  },
  activityIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  activityItemTitle: {
    fontSize: 11.5,
    fontFamily: fonts.bold,
    flex: 1,
  },
  activityItemTime: {
    fontSize: 9.5,
    fontFamily: fonts.medium,
    marginLeft: 6,
  },
  activityItemDesc: {
    fontSize: 10.5,
    fontFamily: fonts.regular,
    lineHeight: 14,
  },

  // ⚡ QUICK ACTION: BCA STYLE STYLES
  quickActionHeaderSub: {
    fontSize: 10.5,
    fontFamily: fonts.regular,
    marginTop: 1,
  },
  bcaBrandTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  bcaBrandTagText: {
    fontSize: 10,
    fontFamily: fonts.bold,
  },
  bcaFourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 6,
  },
  bcaSquircleBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: 3,
    ...shadow.sm,
  },
  bcaSquircleIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  bcaSquircleLabel: {
    fontSize: 11,
    fontFamily: fonts.bold,
    textAlign: 'center',
  },
  bcaSquircleMicro: {
    fontSize: 9,
    fontFamily: fonts.medium,
    textAlign: 'center',
  },
  bcaGridSectionTitle: {
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  bcaGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  bcaMenuCard: {
    width: '48.5%',
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    minHeight: 78,
    justifyContent: 'space-between',
    ...shadow.sm,
  },
  bcaMenuCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bcaMenuIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bcaMicroBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  bcaMicroBadgeText: {
    fontSize: 9,
    fontFamily: fonts.bold,
  },
  bcaMenuCardTitle: {
    fontSize: 11.5,
    fontFamily: fonts.bold,
  },
  bcaMenuCardSub: {
    fontSize: 9.5,
    fontFamily: fonts.regular,
  },

  // Sisa Item: Tabulasi & Stat Styles
  heroCard: { padding: spacing.md, gap: spacing.xs, borderRadius: radius.lg, borderWidth: 1, ...shadow.card },
  heroHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  livePulseDot: { width: 8, height: 8, borderRadius: 4 },
  liveTabulasiText: { fontSize: 10.5, fontFamily: fonts.extraBold, letterSpacing: 0.5 },
  tpsInflowBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill },
  tpsInflowBadgeText: { fontSize: 10, fontFamily: fonts.bold },
  voteSummaryLabel: { fontSize: 11, fontFamily: fonts.semiBold },
  heroBigVoteNum: { fontSize: 28, fontFamily: fonts.extraBold, letterSpacing: -0.5 },
  surplusPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.pill, borderWidth: 1 },
  surplusPillText: { fontSize: 10, fontFamily: fonts.bold },
  progressTrack: { height: 9, borderRadius: 4.5, flexDirection: 'row', overflow: 'hidden' },
  progressFillBase: { height: '100%', borderTopLeftRadius: 4.5, borderBottomLeftRadius: 4.5 },
  progressFillSurplus: { height: '100%', borderTopRightRadius: 4.5, borderBottomRightRadius: 4.5 },
  statRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1 },
  statBox: { alignItems: 'center' },
  statNum: { fontSize: fontSize.md, fontFamily: fonts.bold },
  statSub: { fontSize: 10, fontFamily: fonts.medium, marginTop: 2 },
  divider: { width: 1, height: 26 },

  // Threshold Card
  thresholdCard: { padding: spacing.sm, borderRadius: radius.md, borderWidth: 1, gap: 6 },
  thresholdBarTrack: { height: 8, borderRadius: 4, position: 'relative', overflow: 'hidden' },
  thresholdBarFill: { height: '100%', borderRadius: 4 },
  thresholdMarker: { position: 'absolute', top: 0, bottom: 0, width: 2, backgroundColor: '#DC2626' },
  linkDetailBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingTop: 4 },

  // Sebaran Suara
  badgePillSmall: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.pill },
  basisBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.pill },
  basisBadgeText: { fontSize: 9, fontFamily: fonts.bold },
  distBarTrack: { height: 7, borderRadius: 3.5, width: '100%', overflow: 'hidden' },
  distBarFill: { height: '100%', borderRadius: 3.5 },

  // Attendance
  attendanceBarTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  attendanceBarFill: { height: '100%', borderRadius: 4 },

  // Witness List & TPS Rows
  witnessRowItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs, borderBottomWidth: 0.5 },
  avatarImg: { width: 40, height: 40, borderRadius: 20 },
  witnessName: { fontSize: fontSize.xs, fontFamily: fonts.bold },
  witnessSub: { fontSize: 10.5, fontFamily: fonts.medium },
  subHint: { fontSize: fontSize.xs, fontFamily: fonts.regular, marginBottom: spacing.xs },

  // Pagination
  paginationRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: spacing.sm, marginTop: spacing.xs },
  pageBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.md, borderWidth: 1 },
  pageBtnText: { fontSize: 11, fontFamily: fonts.bold },
  pageIndicator: { fontSize: 11, fontFamily: fonts.medium },

  // Sync banner
  syncBannerCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.sm, borderRadius: radius.md, borderWidth: 1 },
  syncBannerTitle: { fontSize: 11.5, fontFamily: fonts.bold },
  syncBannerSub: { fontSize: 9.5, fontFamily: fonts.regular },
  syncBannerBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill },
  syncBannerBtnText: { fontSize: 10.5, fontFamily: fonts.bold, color: '#FFFFFF' },

  // Modal Custom Tiles
  modalOptionTile: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: spacing.sm, borderRadius: radius.md, borderWidth: 1 },
  modalOptionIconWrap: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  modalOptionTitle: { fontSize: 12, fontFamily: fonts.bold },
  modalOptionDesc: { fontSize: 10, fontFamily: fonts.regular, lineHeight: 14, marginTop: 1 },

  // Agenda Modal
  agendaModalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.sm, borderRadius: radius.md, borderWidth: 1, gap: 8 },
  agendaModalTitle: { fontSize: 11.5, fontFamily: fonts.bold },
  agendaModalDate: { fontSize: 10.5, fontFamily: fonts.semiBold },
  agendaModalLoc: { fontSize: 9.5, fontFamily: fonts.medium },
  agendaModalBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill },
  agendaModalBtnText: { fontSize: 11, fontFamily: fonts.bold, color: '#FFFFFF' },

  // Info Modal
  infoBannerHighlight: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: spacing.sm, borderRadius: radius.md, borderWidth: 1 },
  infoBannerHighlightText: { fontSize: 11, fontFamily: fonts.bold, flex: 1 },
  infoModalBody: { fontSize: 11.5, fontFamily: fonts.regular, lineHeight: 18 },
  infoModalCloseBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: radius.pill },
  infoModalCloseBtnText: { fontSize: 12, fontFamily: fonts.bold, color: '#FFFFFF' },

  // QR Modal
  qrContainer: { padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  openFullKtaBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 20, borderRadius: radius.pill, width: '100%' },
  openFullKtaBtnText: { fontSize: 12, fontFamily: fonts.bold, color: '#FFFFFF' },
});
