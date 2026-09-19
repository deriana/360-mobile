import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Card, ConfirmDialog, Modal, Pill, PrimaryButton, SectionTitle } from '../components/ui';
import { fontSize, fonts, iconStrokeWidth, radius, shadow, spacing } from '../theme';
import { CURRENT_WITNESS_ID, getUserProfile, ROLE_ICON, ROLE_LABEL, scopeTps, scopeWitnesses } from '../utils/scope';
import { BRAND_ASSETS, getWitnessAvatar } from '../data/images';
import { PORTAL_NEWS_LIST } from '../data/portalNews';
import { maskNik } from '../utils/masking';
import QrPlaceholder from '../components/QrPlaceholder';
import { MobileRole } from '../types';

interface QuickActionItem {
  id: string;
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle: string;
  badge?: string;
  tone?: 'primary' | 'danger' | 'success' | 'warning' | 'info';
  onPress: () => void;
}

export default function DashboardScreen({ navigation: propNav }: any) {
  const hookNav = useNavigation<any>();
  const navigation = propNav || hookNav;

  const navigateToMap = () => {
    if (navigation?.navigate) {
      navigation.navigate('MapSebaranRelawanAnggota');
    } else if (hookNav?.navigate) {
      hookNav.navigate('MapSebaranRelawanAnggota');
    }
  };
  const {
    role,
    currentUser,
    availableRoles,
    switchActiveRole,
    tps,
    witnesses,
    payments,
    isOnline,
    unsyncedQueueCount,
    flushQueueNow,
    events,
    tasks,
    volunteerOpportunities,
    joinOpportunity,
    applyWitnessCandidate,
  } = useApp();
  const { colors, isDark } = useTheme();

  // Modals & Dialog states
  const [isSyncing, setIsSyncing] = useState(false);
  const [showKtaQrModal, setShowKtaQrModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showCoordinatorModal, setShowCoordinatorModal] = useState(false);
  const [showAspirasiModal, setShowAspirasiModal] = useState(false);
  const [showCandidateConfirmDialog, setShowCandidateConfirmDialog] = useState(false);
  const [showAuditBerkasModal, setShowAuditBerkasModal] = useState(false);
  const [showMaklumatModal, setShowMaklumatModal] = useState(false);
  const [activeWartaTab, setActiveWartaTab] = useState<'instruksi' | 'agenda'>('instruksi');
  const [newAspirasiTitle, setNewAspirasiTitle] = useState('');
  const [newAspirasiDesc, setNewAspirasiDesc] = useState('');
  const [newAspirasiResident, setNewAspirasiResident] = useState('');
  const [selectedDetailAspirasi, setSelectedDetailAspirasi] = useState<any | null>(null);
  const [aspirasiFilterTab, setAspirasiFilterTab] = useState<'my_input' | 'all_dago'>('my_input');
  const [dialogConfig, setDialogConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    tone?: 'danger' | 'primary' | 'warning' | 'success' | 'info';
  }>({ visible: false, title: '', message: '' });

  // Data aspirasi warga wilayah dampingan Dago dengan riwayat timeline penanganan Web Command Center
  const [aspirasiItems, setAspirasiItems] = useState([
    {
      id: 'ASP-01',
      title: 'Perbaikan Lampu Jalan Gang RW 04 Dago',
      desc: 'Warga mengusulkan penambahan 3 titik lampu PJU pada ruas gang menurun arah Posyandu demi keselamatan warga lansia dan anak-anak saat malam hari.',
      category: 'Fasilitas Umum',
      residentName: 'Ibu Eni & Tokoh Warga RT 02',
      recordedBy: 'Siti Rahmawati',
      recordedRole: 'Relawan Dampingan Dago',
      location: 'Gang Saluyu RT 02 / RW 04, Kel. Dago',
      date: '17 Sep 2026, 14:15 WIB',
      status: 'Diteruskan ke Fraksi',
      statusColor: '#0284C7',
      assignedTo: 'Sekretariat Fraksi PAN DPRD Kota Bandung',
      backofficeNotes: 'Telah dimasukkan ke dalam daftar Pokir (Pokok Pikiran) prioritas Dapil 3 oleh Tenaga Ahli Fraksi.',
      timeline: [
        {
          stage: 'Aspirasi Dihimpun di Lapangan',
          actor: 'Siti Rahmawati (Relawan Dago)',
          time: '17 Sep 2026, 14:15 WIB',
          desc: 'Aspirasi warga dicatat saat giat sapa warga door-to-door.',
          done: true,
        },
        {
          stage: 'Verifikasi Operator Posko Dago',
          actor: 'Kang Asep Ridwan (Korlap Dago)',
          time: '17 Sep 2026, 16:30 WIB',
          desc: 'Lokasi dan urgensi kebutuhan PJU diverifikasi di sistem posko.',
          done: true,
        },
        {
          stage: 'Disposisi Web Command Center',
          actor: 'Operator Fraksi PAN Bandung',
          time: '18 Sep 2026, 09:20 WIB',
          desc: 'Diteruskan ke meja Komisi C DPRD Kota Bandung untuk advokasi APBD-P.',
          done: true,
        },
        {
          stage: 'Realisasi / Tindak Lanjut Lapangan',
          actor: 'Dinas Terkait & Tim Aspirasi PAN',
          time: 'Menunggu Jadwal Survai',
          desc: 'Survai teknis titik instalasi lampu oleh tim aspirasi dewan.',
          done: false,
        },
      ],
    },
    {
      id: 'ASP-02',
      title: 'Permohonan Bantuan Posyandu Balita RW 05',
      desc: 'Pengurus Posyandu mengajukan bantuan sarana timbangan bayi digital serta asupan makanan pendamping ASI (MPASI) untuk dimasukkan ke agenda bakti sosial PAN.',
      category: 'Kesehatan Warga',
      residentName: 'Kader Posyandu Mawar RW 05',
      recordedBy: 'Siti Rahmawati',
      recordedRole: 'Relawan Dampingan Dago',
      location: 'Balai RW 05, Kelurahan Dago',
      date: '16 Sep 2026, 10:30 WIB',
      status: 'Disetujui di Agenda Baksos',
      statusColor: '#10B981',
      assignedTo: 'Tim Baksos & Logistik DPW PAN Jabar',
      backofficeNotes: 'Disetujui. Bantuan paket PMT balita dan timbangan digital dialokasikan pada Baksos Minggu 21 Sep 2026.',
      timeline: [
        {
          stage: 'Aspirasi Dihimpun di Lapangan',
          actor: 'Siti Rahmawati (Relawan Dago)',
          time: '16 Sep 2026, 10:30 WIB',
          desc: 'Permohonan dicatat langsung saat silaturahmi balai posyandu.',
          done: true,
        },
        {
          stage: 'Review Tim Logistik Pemenangan',
          actor: 'Biro Logistik BSN Jabar',
          time: '16 Sep 2026, 15:45 WIB',
          desc: 'Disetujui untuk dipaketkan bersama sembako murah Baksos Dago.',
          done: true,
        },
        {
          stage: 'Penjadwalan Serah Terima',
          actor: 'Koordinator Acara Baksos',
          time: '21 Sep 2026, 08:30 WIB',
          desc: 'Penyerahan simbolis oleh caleg DPR-RI dan kader DPD di Balai Warga RW 05.',
          done: false,
        },
      ],
    },
    {
      id: 'ASP-03',
      title: 'Antusiasme Pasar Tebus Sembako Murah',
      desc: 'Warga lansia RT 04 meminta kuota sembako murah (minyak goreng dan beras) ditambah dari alokasi awal 100 paket menjadi 150 paket.',
      category: 'Kebutuhan Pokok',
      residentName: 'Pak Ujang (Ketua RT 04 Dago)',
      recordedBy: 'Kang Maman (Relawan RW 04)',
      recordedRole: 'Relawan Lapangan Dago',
      location: 'Pemukiman RT 04 / RW 04 Dago',
      date: '15 Sep 2026, 17:00 WIB',
      status: 'Selesai Diproses',
      statusColor: '#64748B',
      assignedTo: 'Koordinator Logistik Posko Dago',
      backofficeNotes: 'Tambahan 50 kuota sembako murah telah disetujui DPD PAN Kota Bandung.',
      timeline: [
        {
          stage: 'Aspirasi Dihimpun di Lapangan',
          actor: 'Kang Maman (Relawan RW 04)',
          time: '15 Sep 2026, 17:00 WIB',
          desc: 'Disampaikan saat pembagian kupon sembako.',
          done: true,
        },
        {
          stage: 'Disposisi Web Command Center',
          actor: 'Admin Logistik Pemenangan',
          time: '16 Sep 2026, 08:30 WIB',
          desc: 'Alokasi kuota ditingkatkan menjadi 150 paket sembako.',
          done: true,
        },
        {
          stage: 'Selesai Diproses',
          actor: 'Tim Posko Dago',
          time: '16 Sep 2026, 11:00 WIB',
          desc: 'Kupon tambahan telah disalurkan ke ketua RT 04.',
          done: true,
        },
      ],
    },
  ]);

  const profile = getUserProfile(role);
  const user = currentUser.identity;
  const isOfficialMember = currentUser.memberships.some((m) => m.type === 'member' && m.status === 'verified');
  const officialMembership = currentUser.memberships.find((m) => m.type === 'member');
  const volunteerMembership = currentUser.memberships.find((m) => m.type === 'volunteer');
  const scopedTps = scopeTps(role, tps, witnesses);
  const scopedWitnesses = scopeWitnesses(role, witnesses, scopedTps);

  const currentWitness = witnesses.find((w) => w.id === CURRENT_WITNESS_ID) || witnesses[0];
  const currentTps = scopedTps[0] || tps[0];
  const currentPayment = payments?.find((p) => p.witnessId === currentWitness?.id);

  const checkedInCount = scopedWitnesses.filter((w) => w.status === 'checked_in').length;
  const totalWitnessInScope = scopedWitnesses.length;

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
        message: 'Pastikan koneksi internet seluler stabil.',
        tone: 'danger',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const isWitnessRole = role === 'WITNESS' || role === 'TPS_WITNESS';
  const isVolunteer = role === 'VOLUNTEER' || role === 'RELAWAN';
  const isCoordinator = role === 'TPS_COORDINATOR' || role === 'FIELD_COORDINATOR';
  const isCaleg = role === 'CALEG' || (currentUser as any)?.electoralStatus?.status === 'CALEG' || (currentUser as any)?.electoralStatus === 'CALEG' || (currentUser as any)?.roles?.some((r: any) => r.role === 'CALEG');
  const hasOfficialWitnessAssignment =
    isWitnessRole || (isVolunteer && currentUser.dimensions?.programs?.programSaksi === 'MANDATED');

  // Quick Action items: 4 menu esensial 1 baris per role dengan menu "Broadcast" selalu di posisi paling kanan
  const getQuickMenuItems = (): QuickActionItem[] => {
    const broadcastItem: QuickActionItem = {
      id: 'broadcast',
      icon: 'volume-2',
      title: 'Broadcast',
      subtitle: 'Saluran Resmi',
      // badge: hasOfficialWitnessAssignment ? 'Grup' : 'Saluran',
      tone: 'primary',
      onPress: () => navigation.navigate('Broadcast'),
    };

    // 1. Relawan Biasa (Murni) / Simpatisan
    if (isVolunteer) {
      return [
        {
          id: 'bursa_tugas',
          icon: 'briefcase',
          title: 'Bursa Tugas',
          subtitle: 'Aksi Lapangan',
          badge: '4',
          tone: 'primary',
          onPress: () => navigation.navigate('Tasks'),
        },
        {
          id: 'pan_academy',
          icon: 'award',
          title: 'PAN Academy',
          subtitle: 'Modul Pelatihan',
          // badge: 'Modul',
          tone: 'primary',
          onPress: () => navigation.navigate('AmanatAcademy'),
        },
        {
          id: 'sebaran_relawan',
          icon: 'map',
          title: 'Sebaran Relawan',
          subtitle: 'Sebaran Relawan',
          tone: 'info',
          onPress: () => navigation.navigate('MapSebaranRelawanAnggota'),
        },
        broadcastItem,
      ];
    }

    // 2. Koordinator TPS / Lapangan
    if (isCoordinator) {
      return [
        {
          id: 'supervisi',
          icon: 'grid',
          title: 'Supervisi TPS',
          subtitle: 'Kluster Wilayah',
          badge: `${scopedTps.length}`,
          tone: 'primary',
          onPress: () => navigation.navigate('Supervision'),
        },
        {
          id: 'peta_sebaran',
          icon: 'map',
          title: 'Peta Sebaran',
          subtitle: 'GIS Wilayah',
          badge: 'GIS',
          tone: 'primary',
          onPress: navigateToMap,
        },
        {
          id: 'darurat',
          icon: 'alert-triangle',
          title: 'Lapor Insiden',
          subtitle: 'Eskalasi Darurat',
          badge: 'SOS',
          tone: 'danger',
          onPress: () => navigation.navigate('EmergencyForm'),
        },
        broadcastItem,
      ];
    }

    // 3. Anggota + Caleg / Bacaleg 2029
    if (isCaleg) {
      return [
        {
          id: 'peta_basis_dapil',
          icon: 'map',
          title: 'Peta Basis Dapil',
          subtitle: 'GIS Suara Masuk',
          badge: 'Dapil',
          tone: 'primary',
          onPress: navigateToMap,
        },
        {
          id: 'daftar_bacaleg',
          icon: 'file-text',
          title: 'Daftar Bacaleg',
          subtitle: 'simPAN Caleg',
          tone: 'primary',
          onPress: () => navigation.navigate('SimpanBacaleg'),
        },
        {
          id: 'audit_berkas',
          icon: 'check-circle',
          title: 'Audit KPPN',
          subtitle: 'Verifikasi Berkas',
          badge: 'Valid',
          tone: 'primary',
          onPress: () => setShowAuditBerkasModal(true),
        },
        broadcastItem,
      ];
    }

    // 4. Saksi TPS Resmi Hari-H (WITNESS)
    if (isWitnessRole) {
      return [
        {
          id: 'presensi_gps',
          icon: 'map-pin',
          title: 'Presensi Bilik',
          subtitle: 'GPS Geofence',
          badge: 'Wajib',
          tone: 'primary',
          onPress: () => navigation.navigate('CheckIn'),
        },
        {
          id: 'lapor_c1',
          icon: 'edit-3',
          title: 'Entri C1 TPS',
          subtitle: 'Formulir Plano',
          tone: 'primary',
          onPress: () => navigation.navigate('ReportForm', { tpsId: currentTps?.id || 'TPS-001' }),
        },
        {
          id: 'scan_ocr',
          icon: 'camera',
          title: 'Scan AI C1',
          subtitle: 'Vision Plano C1',
          badge: 'AI',
          tone: 'primary',
          onPress: () => navigation.navigate('C1Ocr', { tpsId: currentTps?.id || 'TPS-001' }),
        },
        broadcastItem,
      ];
    }

    // 5. Anggota / Pengurus Umum (MEMBER default)
    return [
      {
        id: 'peta_sebaran',
        icon: 'map',
        title: 'Peta Sebaran',
        subtitle: 'GIS Kekuatan',
        badge: 'GIS',
        tone: 'primary',
        onPress: navigateToMap,
      },
      {
        id: 'aspirasi_warga',
        icon: 'message-square',
        title: 'Catat Aspirasi',
        subtitle: 'Suara Warga',
        badge: `${aspirasiItems.length}`,
        tone: 'primary',
        onPress: () => setShowAspirasiModal(true),
      },
      {
        id: 'pan_academy',
        icon: 'award',
        title: 'PAN Academy',
        subtitle: 'Modul Kader',
        badge: 'Modul',
        tone: 'primary',
        onPress: () => navigation.navigate('AmanatAcademy'),
      },
      broadcastItem,
    ];
  };

  const bcaMenuItems = getQuickMenuItems();

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ========================================================================= */}
      {/* 1. HEADER: IDENTITAS PENGGUNA & MODE SAYA (ROLE STRIP)                   */}
      {/* ========================================================================= */}
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
                Data aman tersimpan di HP & otomatis disinkronkan saat online.
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
      {/* 1. MASTER UNIFIED CARD: IDENTITAS, ARAHAN RESMI & QUICK MENU              */}
      {/* ========================================================================= */}
      <View style={[styles.unifiedMasterCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {/* A. Header Identitas Pengguna */}
        <View style={styles.headerTopRow}>
          <View style={styles.headerTitleCol}>
            <Text style={[styles.welcomeGreeting, { color: colors.text }]}>
              {isVolunteer
                ? 'SELAMAT DATANG'
                : isWitnessRole
                ? 'SIAGA HARI-H'
                : (role === 'TPS_COORDINATOR' || role === 'FIELD_COORDINATOR')
                ? 'KOMANDO LAPANGAN'
                : 'SELAMAT DATANG'}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.welcomeAccountSub, { color: colors.text, fontFamily: fonts.bold }]}>
                {`Halo, ${user.name || profile.name || 'Ahmad Fauzan'}`}
              </Text>
              {isOfficialMember && (
                <Feather name="check-circle" size={14} color={colors.primary} />
              )}
            </View>
          </View>

          {/* Profile Avatar */}
          <Pressable
            onPress={() => navigation.navigate('Profile')}
            style={({ pressed }) => [styles.avatarTouch, pressed && { opacity: 0.8 }]}
          >
            <Image source={getWitnessAvatar(user.avatarIndex ?? profile.avatarIndex)} style={styles.avatarPhoto} />
            <View style={[styles.onlineStatusDot, { backgroundColor: colors.success }]} />
          </Pressable>
        </View>

        {/* B. Active Role Strip & Digital ID / QR Pass */}
        <View
          style={[
            styles.statusWilayahCard,
            { backgroundColor: isDark ? 'rgba(0,43,82,0.45)' : '#F0F7FF', borderColor: isDark ? '#0A3D6B' : '#BAE6FD' },
          ]}
        >
          <View style={styles.statusWilayahItem}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={[styles.roleBadgeDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.swRoleName, { color: colors.primary }]}>
                {isVolunteer ? 'Relawan Simpatisan — PAN 360' : (ROLE_LABEL[role] || profile.roleLabel)}
              </Text>
            </View>
            <Text style={[styles.swScopeText, { color: colors.textMuted }]} numberOfLines={1}>
              {isVolunteer ? 'Kel. Dago, Kec. Coblong, Kota Bandung' : profile.scopeLocation}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 }}>
              <Text style={[styles.swIdText, { color: colors.text }]}>
                {isOfficialMember
                  ? `e-KTA: ${officialMembership?.ktaNumber || '32.73.01.2024.08912'}`
                  : `ID: ${volunteerMembership?.ktaNumber || 'REL-3273-2024-0042'}`}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {!isVolunteer && (
              <Pressable
                onPress={() => navigation.navigate('StatusPeranSaya')}
                style={({ pressed }) => [
                  styles.switchModeBtn,
                  { backgroundColor: isDark ? 'rgba(0,102,179,0.3)' : '#E0F2FE' },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Feather name="user-check" size={12} color={colors.primary} />
                <Text style={[styles.switchModeBtnText, { color: colors.primary }]}>Peran</Text>
              </Pressable>
            )}

            {!isVolunteer && currentUser.roles.length > 1 && (
              <Pressable
                onPress={() => setShowRoleModal(true)}
                style={({ pressed }) => [
                  styles.switchModeBtn,
                  { backgroundColor: colors.primaryLight },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Feather name="repeat" size={12} color={colors.primary} />
                <Text style={[styles.switchModeBtnText, { color: colors.primary }]}>Mode</Text>
              </Pressable>
            )}

            <Pressable
              onPress={() => setShowKtaQrModal(true)}
              style={({ pressed }) => [
                styles.ktaMiniBtnSolid,
                { backgroundColor: colors.primary },
                pressed && { opacity: 0.85 },
              ]}
            >
              <Feather name="maximize" size={12} color="#FFFFFF" />
              <Text style={styles.ktaMiniBtnSolidText}>QR Pass</Text>
            </Pressable>
          </View>
        </View>

        {/* E. Quick Menu Section */}
        <View style={{ gap: spacing.xs, paddingTop: 2 }}>
          <View style={styles.sectionHeaderBetween}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Feather name="grid" size={14} color={colors.primary} />
              <Text style={[styles.sectionHeadingTitle, { color: colors.text, fontSize: 13 }]}>Quick Menu</Text>
            </View>
          </View>

          <View style={styles.quickIconGrid}>
            {bcaMenuItems.map((item) => {
              const isDanger = item.tone === 'danger';
              const isSuccess = item.tone === 'success';
              const isWarning = item.tone === 'warning';
              const isInfo = item.tone === 'info';

              const iconBg = isDanger
                ? colors.dangerBg
                : isSuccess
                ? colors.successBg
                : isWarning
                ? colors.warningBg
                : isInfo
                ? isDark ? 'rgba(14, 165, 233, 0.15)' : '#E0F2FE'
                : colors.primaryLight;

              const iconColor = isDanger
                ? colors.danger
                : isSuccess
                ? colors.success
                : isWarning
                ? colors.warning
                : isInfo
                ? '#0284C7'
                : colors.primary;

              return (
                <Pressable
                  key={item.id}
                  onPress={item.onPress}
                  style={({ pressed }) => [
                    styles.quickGridItem,
                    pressed && { opacity: 0.7, transform: [{ scale: 0.95 }] },
                  ]}
                >
                  <View style={styles.quickIconWrapper}>
                    <View style={[styles.quickIconBox, { backgroundColor: iconBg, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}>
                      <Feather name={item.icon} size={20} color={iconColor} strokeWidth={2} />
                    </View>
                    {item.badge && (
                      <View
                        style={[
                          styles.quickMicroBadge,
                          {
                            backgroundColor: isDanger ? colors.danger : colors.primary,
                          },
                        ]}
                      >
                        <Text style={styles.quickMicroBadgeText}>{item.badge}</Text>
                      </View>
                    )}
                  </View>

                  <Text style={[styles.quickItemLabel, { color: colors.text }]} numberOfLines={2}>
                    {item.title}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      {/* ========================================================================= */}
      {/* 3. KARTU PERAN UTAMA (CONTEXTUAL ROLE CARD) - BAB 10 & 31                 */}
      {/* ========================================================================= */}
      {(role === 'WITNESS' || role === 'TPS_WITNESS') && (
        <Card style={{ gap: spacing.sm, backgroundColor: colors.surface, borderColor: colors.border }}>
          <View style={styles.sectionHeaderBetween}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Feather name="eye" size={16} color={colors.primary} />
              <Text style={[styles.sectionHeadingTitle, { color: colors.text }]}>Penugasan Saksi TPS</Text>
            </View>
            <Pill label="Mandat Aktif" tone="success" />
          </View>

          <View style={[styles.witnessStatusBox, { backgroundColor: isDark ? 'rgba(0,43,82,0.4)' : '#F0F9FF', borderColor: colors.border }]}>
            <View style={styles.witnessStatusTop}>
              <View style={{ gap: 2, flex: 1 }}>
                <Text style={[styles.wsTpsTitle, { color: colors.text }]}>
                  TPS 001 — Kel. Dago, Kec. Coblong
                </Text>
                <Text style={[styles.wsTpsSub, { color: colors.textMuted }]}>
                  Kota Bandung • DPT: 284 Pemilih • Mandat: 042/SM-DPP/2026
                </Text>
              </View>
              <View style={[styles.wsStatusBadge, { backgroundColor: colors.successBg, borderColor: colors.success }]}>
                <Text style={[styles.wsStatusBadgeText, { color: colors.success }]}>SIAGA HARI-H</Text>
              </View>
            </View>

            {/* Progress Monitoring Suara & Status TPS (Zero Redundancy: Entri C1 di Quick Menu) */}
            <View style={{ gap: 6, marginTop: spacing.xs }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 11, fontFamily: fonts.medium, color: colors.textMuted }}>
                  Partisipasi TPS: 184 / 284 DPT Terdata Hadir
                </Text>
                <Text style={{ fontSize: 11, fontFamily: fonts.bold, color: colors.primary }}>
                  64.8% Hadir
                </Text>
              </View>
              <View style={{ height: 6, borderRadius: 999, backgroundColor: colors.border, overflow: 'hidden' }}>
                <View style={{ width: '64.8%', height: '100%', borderRadius: 999, backgroundColor: colors.primary }} />
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, paddingTop: 6, borderTopWidth: 1, borderTopColor: colors.border }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Feather name="shield" size={12} color={colors.success} />
                <Text style={{ fontSize: 11, fontFamily: fonts.medium, color: colors.textMuted }}>
                  Mandat BSN Resmi Terverifikasi KPU
                </Text>
              </View>
              <Pressable
                onPress={() => navigation.navigate('QuickCountGame')}
                style={({ pressed }) => [
                  { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4 },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={{ fontSize: 11.5, fontFamily: fonts.bold, color: colors.primary }}>
                  Detail Log Suara TPS
                </Text>
                <Feather name="arrow-right" size={13} color={colors.primary} />
              </Pressable>
            </View>
          </View>
        </Card>
      )}

      {(role === 'TPS_COORDINATOR' || role === 'FIELD_COORDINATOR') && (
        <Card style={{ gap: spacing.sm, backgroundColor: colors.surface, borderColor: colors.border }}>
          <View style={styles.sectionHeaderBetween}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Feather name="users" size={16} color={colors.primary} />
              <Text style={[styles.sectionHeadingTitle, { color: colors.text }]}>Supervisi Kluster TPS</Text>
            </View>
            <Pill label={`${scopedTps.length} TPS Terdaftar`} tone="primary" />
          </View>

          <View style={[styles.coordSummaryBox, { backgroundColor: isDark ? 'rgba(0,43,82,0.4)' : '#F0F9FF', borderColor: colors.border }]}>
            <View style={styles.coordStatRow}>
              <Pressable
                onPress={() => navigation.navigate('Supervision')}
                style={styles.coordStatCol}
              >
                <Text style={[styles.coordStatNum, { color: colors.primary }]}>{scopedTps.length}</Text>
                <Text style={[styles.coordStatLabel, { color: colors.textMuted }]}>TPS Kluster (Detail)</Text>
              </Pressable>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <Pressable
                onPress={() => navigation.navigate('WitnessList')}
                style={styles.coordStatCol}
              >
                <Text style={[styles.coordStatNum, { color: colors.success }]}>{checkedInCount}</Text>
                <Text style={[styles.coordStatLabel, { color: colors.textMuted }]}>Saksi Hadir</Text>
              </Pressable>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <Pressable
                onPress={() => navigation.navigate('WitnessList')}
                style={styles.coordStatCol}
              >
                <Text style={[styles.coordStatNum, { color: colors.warning }]}>
                  {totalWitnessInScope - checkedInCount}
                </Text>
                <Text style={[styles.coordStatLabel, { color: colors.textMuted }]}>Belum Check-in</Text>
              </Pressable>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 6, borderTopWidth: 1, borderTopColor: colors.border }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Feather name="check-circle" size={12} color={colors.success} />
                <Text style={{ fontSize: 11, fontFamily: fonts.medium, color: colors.textMuted }}>
                  Ketuk angka di atas untuk membuka daftar personel
                </Text>
              </View>
              <Pressable
                onPress={() => navigation.navigate('Supervision')}
                style={({ pressed }) => [
                  { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4 },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={{ fontSize: 11.5, fontFamily: fonts.bold, color: colors.primary }}>
                  Supervisi Wilayah
                </Text>
                <Feather name="arrow-right" size={13} color={colors.primary} />
              </Pressable>
            </View>
          </View>
        </Card>
      )}

      {/* Kartu Penugasan jika Relawan memegang Mandat Saksi TPS Resmi */}
      {hasOfficialWitnessAssignment && isVolunteer && (
        <Card style={{ gap: spacing.sm, backgroundColor: colors.surface, borderColor: colors.border }}>
          <View style={styles.sectionHeaderBetween}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, marginRight: 8 }}>
              <Feather name="eye" size={16} color={colors.primary} />
              <Text style={[styles.sectionHeadingTitle, { color: colors.text, flexShrink: 1 }]} numberOfLines={1}>
                Penugasan Relawan Saksi TPS
              </Text>
            </View>
            <View style={{ flexShrink: 0 }}>
              <Pill label="Mandat TPS Aktif" tone="primary" />
            </View>
          </View>

          <View style={[styles.witnessStatusBox, { backgroundColor: isDark ? 'rgba(0,43,82,0.4)' : '#F0F9FF', borderColor: colors.border }]}>
            <View style={styles.witnessStatusTop}>
              <View style={{ gap: 2, flex: 1 }}>
                <Text style={[styles.wsTpsTitle, { color: colors.text }]}>
                  TPS 001 — Kel. Dago, Kec. Coblong
                </Text>
                <Text style={[styles.wsTpsSub, { color: colors.textMuted }]}>
                  Kota Bandung | Mandat: 042/SM-DPP/2026
                </Text>
              </View>
              <View style={[styles.wsStatusBadge, { backgroundColor: colors.successBg, borderColor: colors.success }]}>
                <Text style={[styles.wsStatusBadgeText, { color: colors.success }]}>SIAGA HARI-H</Text>
              </View>
            </View>

            <View style={{ gap: 6, marginTop: spacing.xs }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 11, fontFamily: fonts.medium, color: colors.textMuted }}>
                  Progress Pemilih Hadir: 184 / 284 DPT (64.8%)
                </Text>
                <Text style={{ fontSize: 11, fontFamily: fonts.bold, color: colors.primary }}>
                  C1 Standby
                </Text>
              </View>
              <View style={{ height: 6, borderRadius: 999, backgroundColor: colors.border, overflow: 'hidden' }}>
                <View style={{ width: '64.8%', height: '100%', borderRadius: 999, backgroundColor: colors.primary }} />
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, paddingTop: 6, borderTopWidth: 1, borderTopColor: colors.border }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Feather name="check" size={12} color={colors.success} />
                <Text style={{ fontSize: 11, fontFamily: fonts.medium, color: colors.textMuted }}>
                  Relawan Terakreditasi BSN
                </Text>
              </View>
              <Pressable
                onPress={() => navigation.navigate('TpsDetail', { tpsId: currentTps?.id || 'TPS-001' })}
                style={({ pressed }) => [
                  { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4 },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={{ fontSize: 11.5, fontFamily: fonts.bold, color: colors.primary }}>
                  Detail TPS
                </Text>
                <Feather name="arrow-right" size={13} color={colors.primary} />
              </Pressable>
            </View>
          </View>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* 4. KABAR & BERITA TERBARU                                                 */}
      {/* ========================================================================= */}
      <Card style={{ gap: spacing.sm, backgroundColor: colors.surface, borderColor: colors.border }}>
        <View style={styles.sectionHeaderBetween}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Feather name="book-open" size={16} color={colors.primary} />
            <Text style={[styles.sectionHeadingTitle, { color: colors.text }]}>Kabar & Berita Terbaru</Text>
          </View>
          <Pressable
            onPress={() =>
              navigation.navigate('SimpanNews', {
                newsId: undefined,
                selectedNewsId: undefined,
                resetSelected: true,
                timestamp: Date.now(),
              })
            }
            hitSlop={8}
          >
            <Text style={[styles.unifiedActionLink, { color: colors.primary }]}>Lihat Semua</Text>
          </Pressable>
        </View>

        {/* Normalized 3 News Items List with Right-Side Thumbnail */}
        <View style={{ gap: 2 }}>
          {PORTAL_NEWS_LIST.slice(0, 3).map((news, idx) => (
            <React.Fragment key={news.id}>
              {idx > 0 && <View style={[styles.newsDivider, { backgroundColor: colors.border }]} />}
              <Pressable
                onPress={() =>
                  navigation.navigate('SimpanNews', {
                    newsId: news.id,
                    timestamp: Date.now(),
                  })
                }
                style={({ pressed }) => [
                  styles.newsItemRow,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <View style={{ flex: 1, gap: 3, marginRight: 10 }}>
                  <Text style={[styles.newsItemCategory, { color: colors.primary }]}>
                    {news.categoryLabel.toUpperCase()} • {news.timeAgo}
                  </Text>
                  <Text style={[styles.newsItemTitle, { color: colors.text }]} numberOfLines={2}>
                    {news.title}
                  </Text>
                  <Text style={[styles.newsItemMeta, { color: colors.textMuted }]}>
                    {news.author.name} • {news.readTime}
                  </Text>
                </View>

                <Image
                  source={news.localFallbackImage || { uri: news.imageUrl }}
                  style={styles.newsItemThumbnail}
                  resizeMode="cover"
                />
              </Pressable>
            </React.Fragment>
          ))}
        </View>
      </Card>

      {/* ========================================================================= */}
      {/* 5. AGENDA & KEGIATAN TERDEKAT                                             */}
      {/* ========================================================================= */}
      <Card style={{ gap: spacing.sm, backgroundColor: colors.surface, borderColor: colors.border }}>
        <View style={styles.sectionHeaderBetween}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Feather name="calendar" size={15} color={colors.primary} />
            <Text style={[styles.sectionHeadingTitle, { color: colors.text }]}>Agenda Kegiatan Terdekat</Text>
          </View>
          <Pressable onPress={() => navigation.navigate('Activities')} hitSlop={8}>
            <Text style={[styles.unifiedActionLink, { color: colors.primary }]}>Lihat Semua</Text>
          </Pressable>
        </View>

        <View style={{ gap: spacing.xs }}>
          {events.slice(0, 3).map((ev) => (
            <Pressable
              key={ev.id}
              onPress={() => navigation.navigate('Activities')}
              style={({ pressed }) => [
                styles.miniAgendaRow,
                { borderColor: colors.border },
                pressed && { opacity: 0.7 },
              ]}
            >
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[styles.miniAgendaTitle, { color: colors.text }]} numberOfLines={1}>
                  {ev.title}
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted }}>
                  {ev.dateLabel} • {ev.location}
                </Text>
              </View>
              <Pill label={isVolunteer ? 'Terdaftar' : (ev.isRegistered ? 'Terdaftar' : 'Buka')} tone={isVolunteer || ev.isRegistered ? 'success' : 'info'} />
            </Pressable>
          ))}
        </View>
      </Card>


      {/* Role Switcher Modal ("Mode Saya") */}
      <Modal
        visible={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        title="Pilih Mode Peran (Mode Saya)"
        subtitle="Ubah konteks kerja tanpa membuat akun baru"
      >
        <View style={{ gap: spacing.sm, paddingVertical: spacing.xs }}>
          {availableRoles.map((r) => {
            const isCurrent = role === r;
            const iconName = ROLE_ICON[r] || 'user';

            return (
              <Pressable
                key={r}
                onPress={() => {
                  switchActiveRole(r as MobileRole);
                  setShowRoleModal(false);
                }}
                style={({ pressed }) => [
                  styles.roleSwitchRow,
                  {
                    backgroundColor: isCurrent ? (isDark ? 'rgba(0,43,82,0.6)' : '#F0F9FF') : colors.background,
                    borderColor: isCurrent ? colors.primary : colors.border,
                  },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <View style={[styles.roleSwitchIconCircle, { backgroundColor: isCurrent ? colors.primary : colors.surface }]}>
                  <Feather name={iconName} size={16} color={isCurrent ? '#FFFFFF' : colors.textMuted} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.roleSwitchName, { color: isCurrent ? colors.primary : colors.text }]}>
                    {r === 'WITNESS'
                      ? 'Mode Saksi TPS'
                      : r === 'TPS_COORDINATOR'
                      ? 'Mode Koordinator TPS'
                      : r === 'VOLUNTEER'
                      ? 'Mode Relawan'
                      : 'Mode Anggota'}
                  </Text>
                  <Text style={{ fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted }}>
                    {ROLE_LABEL[r]}
                  </Text>
                </View>
                {isCurrent && <Feather name="check-circle" size={18} color={colors.primary} />}
              </Pressable>
            );
          })}
        </View>
      </Modal>

      {/* Info Instruction Modal */}
      <Modal
        visible={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        title={isVolunteer ? 'Arahan Resmi DPP PAN' : 'Maklumat Resmi DPP PAN'}
        subtitle={isVolunteer ? 'Gerakan Sapa Warga & Aksi Nyata Rakyat' : 'Instruksi Pemenangan & Pengawalan Pemilu'}
      >
        <View style={{ gap: spacing.sm, paddingVertical: spacing.xs }}>
          <Text style={{ fontFamily: fonts.bold, fontSize: fontSize.sm, color: colors.text }}>
            {isVolunteer
              ? 'Gerakan Sapa Warga: Kenalkan Aksi Nyata PAN ke Masyarakat'
              : 'Kawal Ketat Form C1 Plano & Integritas Tabulasi Suara'}
          </Text>
          <Text style={{ fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textMuted, lineHeight: 18 }}>
            {isVolunteer ? (
              <>
                1. Lakukan kunjungan silaturahmi sapa warga secara santun dan ramah di lingkungan Kelurahan Dago.{'\n'}
                2. Kenalkan program aksi nyata PAN dalam membantu kebutuhan pokok rakyat dan UMKM.{'\n'}
                3. Catat aspirasi dan kebutuhan posko warga melalui menu Bursa Tugas dan Kontak Korlap.{'\n'}
                4. Jaga selalu etika, ketertiban, dan kehangatan dalam berinteraksi dengan warga sekitar.
              </>
            ) : (
              <>
                1. Seluruh saksi wajib hadir di TPS sebelum pukul 07:00 WIB dan melakukan presensi GPS melalui aplikasi.{'\n'}
                2. Tunjukkan surat mandat resmi bertanda tangan digital ke petugas KPPS.{'\n'}
                3. Catat hasil hitung suara saat sidang terbuka dan foto lembar C1 Plano dengan jelas.{'\n'}
                4. Jika terjadi kendala intimidasi atau selisih suara, gunakan tombol Lapor SOS untuk eskalasi ke Tim Hukum BSN.
              </>
            )}
          </Text>
          <PrimaryButton label="Saya Mengerti" onPress={() => setShowInfoModal(false)} style={{ marginTop: spacing.xs }} />
        </View>
      </Modal>

      {/* QR Pass Modal */}
      <Modal
        visible={showKtaQrModal}
        onClose={() => setShowKtaQrModal(false)}
        title={isOfficialMember ? 'QR Pas Digital Anggota' : 'QR Pas Relawan Simpatisan'}
        subtitle={isOfficialMember ? 'e-KTA simPAN Terverifikasi' : 'Digital ID Relawan PAN'}
      >
        <View style={{ alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm }}>
          <QrPlaceholder
            size={180}
            seed={
              isOfficialMember
                ? `PAN-${officialMembership?.ktaNumber || '32.73.01.2024.08912'}-AUTHENTICATED`
                : `PAN-${volunteerMembership?.ktaNumber || 'REL-3273-2024-0042'}-VOLUNTEER`
            }
          />
          <Text style={{ fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted, textAlign: 'center' }}>
            {isOfficialMember
              ? 'Pindai QR ini untuk verifikasi keanggotaan dan presensi kegiatan internal partai.'
              : 'Pindai QR ini untuk presensi kehadiran giat posko dan kegiatan bakti relawan.'}
          </Text>
          <PrimaryButton
            label={isOfficialMember ? 'Buka e-KTA Penuh' : 'Buka Profil Relawan'}
            variant="secondary"
            onPress={() => {
              setShowKtaQrModal(false);
              if (isOfficialMember) {
                navigation.navigate('SimpanKta');
              } else {
                navigation.navigate('Profile');
              }
            }}
            style={{ width: '100%' }}
          />
        </View>
      </Modal>

      {/* Coordinator Contact Modal */}
      <Modal
        visible={showCoordinatorModal}
        onClose={() => setShowCoordinatorModal(false)}
        title="Koordinator Wilayah Dampingan"
        subtitle="Posko Pemenangan Kelurahan Dago"
      >
        <View style={{ gap: spacing.sm, paddingVertical: spacing.xs }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              padding: spacing.sm,
              backgroundColor: isDark ? 'rgba(0,43,82,0.4)' : '#F0F9FF',
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Feather name="user-check" size={20} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ fontFamily: fonts.bold, fontSize: fontSize.sm, color: colors.text }}>
                {currentUser.coordinatorContact?.name || 'Asep Ridwan'}
              </Text>
              <Text style={{ fontFamily: fonts.medium, fontSize: 11, color: colors.primary }}>
                Koordinator Lapangan Kelurahan Dago
              </Text>
            </View>
          </View>

          <View
            style={{
              gap: spacing.xs,
              padding: spacing.sm,
              backgroundColor: colors.surface,
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Feather name="phone" size={14} color={colors.primary} />
              <Text style={{ fontFamily: fonts.medium, fontSize: 12, color: colors.text }}>
                {currentUser.coordinatorContact?.phone || '0811-2233-4455'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
              <Feather name="map-pin" size={14} color={colors.primary} style={{ marginTop: 2 }} />
              <Text style={{ fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted, flex: 1 }}>
                {currentUser.coordinatorContact?.posko || 'Posko Kawal Suara Dago Atas No. 84, Coblong, Kota Bandung'}
              </Text>
            </View>
          </View>

          <PrimaryButton
            label="Tutup"
            onPress={() => setShowCoordinatorModal(false)}
            style={{ marginTop: spacing.xs }}
          />
        </View>
      </Modal>

      {/* Candidate Confirmation Dialog */}
      <ConfirmDialog
        visible={showCandidateConfirmDialog}
        title="Ajukan Diri Sebagai Calon Saksi?"
        message="Portofolio keaktifan relawan (8 tugas selesai) dan sertifikat Bimtek PAN Academy (12 jam) Anda akan dikirimkan ke Tim BSN DPD PAN Kota Bandung untuk verifikasi dan penerbitan SK Mandat."
        confirmLabel="Ya, Kirim Pengajuan"
        cancelLabel="Batal"
        tone="primary"
        onConfirm={() => {
          setShowCandidateConfirmDialog(false);
          applyWitnessCandidate();
          setDialogConfig({
            visible: true,
            title: 'Pengajuan Berhasil Dikirim',
            message: 'Pengajuan Anda telah tercatat di Web Command Center BSN DPD PAN Kota Bandung. Silakan tunggu penugasan resmi.',
            tone: 'success',
          });
        }}
        onCancel={() => setShowCandidateConfirmDialog(false)}
      />

      {/* Feedback Dialog */}
      <ConfirmDialog
        visible={dialogConfig.visible}
        title={dialogConfig.title}
        message={dialogConfig.message}
        tone={dialogConfig.tone}
        singleButton
        confirmLabel="Tutup"
        onConfirm={() => setDialogConfig((prev) => ({ ...prev, visible: false }))}
      />

      {/* Aspirasi Warga Modal (List & Input Form) */}
      <Modal
        visible={showAspirasiModal}
        onClose={() => setShowAspirasiModal(false)}
        title="Aspirasi & Suara Warga"
        subtitle="Posko Pemenangan Kelurahan Dago, Coblong"
      >
        <ScrollView style={{ maxHeight: 460 }} showsVerticalScrollIndicator={false}>
          <View style={{ gap: spacing.sm, paddingVertical: spacing.xs }}>
            {/* Form Tambah Aspirasi Cepat */}
            <View
              style={{
                padding: spacing.sm,
                backgroundColor: isDark ? 'rgba(0,43,82,0.35)' : '#F0F7FF',
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: colors.border,
                gap: 6,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Feather name="edit-3" size={13} color={colors.primary} />
                <Text style={{ fontFamily: fonts.bold, fontSize: fontSize.xs, color: colors.text }}>
                  Input Catatan Aspirasi Baru
                </Text>
              </View>

              <TextInput
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: radius.sm,
                  borderWidth: 1,
                  borderColor: colors.border,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  fontSize: 12,
                  fontFamily: fonts.medium,
                  color: colors.text,
                }}
                placeholder="Nama warga / RT pengusul (mis: Ibu Eni RT 02)..."
                placeholderTextColor={colors.textMuted}
                value={newAspirasiResident}
                onChangeText={setNewAspirasiResident}
              />

              <TextInput
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: radius.sm,
                  borderWidth: 1,
                  borderColor: colors.border,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  fontSize: 12,
                  fontFamily: fonts.medium,
                  color: colors.text,
                }}
                placeholder="Pokok usulan (mis: Perbaikan PJU gang lansia)..."
                placeholderTextColor={colors.textMuted}
                value={newAspirasiTitle}
                onChangeText={setNewAspirasiTitle}
              />

              <TextInput
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: radius.sm,
                  borderWidth: 1,
                  borderColor: colors.border,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  fontSize: 11.5,
                  fontFamily: fonts.regular,
                  color: colors.text,
                  minHeight: 50,
                  textAlignVertical: 'top',
                }}
                placeholder="Rincian usulan & lokasi spesifik di Dago..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={2}
                value={newAspirasiDesc}
                onChangeText={setNewAspirasiDesc}
              />

              <PrimaryButton
                label="Simpan Catatan Aspirasi"
                onPress={() => {
                  if (!newAspirasiTitle.trim()) {
                    setDialogConfig({
                      visible: true,
                      title: 'Judul Wajib Diisi',
                      message: 'Mohon tuliskan pokok aspirasi warga.',
                      tone: 'warning',
                    });
                    return;
                  }

                  const newEntry = {
                    id: `ASP-${Date.now().toString().slice(-4)}`,
                    title: newAspirasiTitle.trim(),
                    desc: newAspirasiDesc.trim() || 'Aspirasi warga dicatat saat kunjungan relawan ke Dago.',
                    category: 'Aspirasi Langsung',
                    residentName: newAspirasiResident.trim() || 'Warga Binaan Dago',
                    recordedBy: 'Siti Rahmawati',
                    recordedRole: 'Relawan Dampingan Dago',
                    location: 'Kelurahan Dago, Coblong',
                    date: '18 Sep 2026, Hari Ini',
                    status: 'Tercatat di Posko',
                    statusColor: '#F59E0B',
                    assignedTo: 'Koordinator Lapangan Dago',
                    backofficeNotes: 'Aspirasi baru masuk, menunggu verifikasi operator sebelum diteruskan ke fraksi.',
                    timeline: [
                      {
                        stage: 'Aspirasi Dihimpun di Lapangan',
                        actor: 'Siti Rahmawati (Relawan)',
                        time: '18 Sep 2026, Baru saja',
                        desc: 'Dicatat melalui aplikasi Simpan 360.',
                        done: true,
                      },
                      {
                        stage: 'Verifikasi Operator Posko Dago',
                        actor: 'Kang Asep Ridwan (Korlap)',
                        time: 'Dalam Antrean Review',
                        desc: 'Pemeriksaan keabsahan lokasi & prioritas.',
                        done: false,
                      },
                      {
                        stage: 'Disposisi Web Command Center',
                        actor: 'Operator Fraksi PAN',
                        time: 'Menunggu Disposisi',
                        desc: 'Penyerahan ke Tim Advokasi Kebijakan / Dewan.',
                        done: false,
                      },
                    ],
                  };

                  setAspirasiItems((prev) => [newEntry, ...prev]);
                  setNewAspirasiTitle('');
                  setNewAspirasiDesc('');
                  setNewAspirasiResident('');
                  setDialogConfig({
                    visible: true,
                    title: 'Aspirasi Berhasil Disimpan',
                    message: 'Catatan aspirasi telah tercatat dan masuk ke antrean Web Command Center Posko Dago.',
                    tone: 'success',
                  });
                }}
                style={{ marginTop: 2 }}
              />
            </View>

            {/* Segment Filter Tab: Catatan Siti vs Semua Posko Dago */}
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
                borderRadius: radius.md,
                padding: 3,
                marginTop: 4,
              }}
            >
              <Pressable
                onPress={() => setAspirasiFilterTab('my_input')}
                style={[
                  { flex: 1, paddingVertical: 6, alignItems: 'center', borderRadius: radius.sm },
                  aspirasiFilterTab === 'my_input' && { backgroundColor: colors.primary },
                ]}
              >
                <Text
                  style={{
                    fontFamily: aspirasiFilterTab === 'my_input' ? fonts.bold : fonts.medium,
                    fontSize: 11,
                    color: aspirasiFilterTab === 'my_input' ? '#FFFFFF' : colors.textMuted,
                  }}
                >
                  Catatan Saya ({aspirasiItems.filter((i) => i.recordedBy.includes('Siti')).length})
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setAspirasiFilterTab('all_dago')}
                style={[
                  { flex: 1, paddingVertical: 6, alignItems: 'center', borderRadius: radius.sm },
                  aspirasiFilterTab === 'all_dago' && { backgroundColor: colors.primary },
                ]}
              >
                <Text
                  style={{
                    fontFamily: aspirasiFilterTab === 'all_dago' ? fonts.bold : fonts.medium,
                    fontSize: 11,
                    color: aspirasiFilterTab === 'all_dago' ? '#FFFFFF' : colors.textMuted,
                  }}
                >
                  Semua Posko Dago ({aspirasiItems.length})
                </Text>
              </Pressable>
            </View>

            {/* List Aspirasi Cards (Clickable for Timeline Detail) */}
            <View style={{ gap: spacing.xs, marginTop: 4 }}>
              {aspirasiItems
                .filter((item) => (aspirasiFilterTab === 'my_input' ? item.recordedBy.includes('Siti') : true))
                .map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => setSelectedDetailAspirasi(item)}
                    style={({ pressed }) => [
                      {
                        padding: spacing.sm,
                        backgroundColor: colors.surface,
                        borderRadius: radius.md,
                        borderWidth: 1,
                        borderColor: colors.border,
                        gap: 5,
                      },
                      pressed && { opacity: 0.75 },
                    ]}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
                      <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: colors.text, flex: 1 }}>
                        {item.title}
                      </Text>
                      <View
                        style={{
                          backgroundColor: isDark ? 'rgba(0,102,179,0.2)' : '#EFF6FF',
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                          borderRadius: 4,
                        }}
                      >
                        <Text style={{ fontFamily: fonts.bold, fontSize: 9.5, color: item.statusColor || colors.primary }}>
                          {item.status}
                        </Text>
                      </View>
                    </View>

                    <Text style={{ fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted, lineHeight: 16 }} numberOfLines={2}>
                      {item.desc}
                    </Text>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 3, paddingTop: 4, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }}>
                      <View style={{ gap: 1 }}>
                        <Text style={{ fontFamily: fonts.medium, fontSize: 10, color: colors.text }}>
                          Pengusul: {item.residentName}
                        </Text>
                        <Text style={{ fontFamily: fonts.regular, fontSize: 9.5, color: colors.primary }}>
                          Pencatat: {item.recordedBy}
                        </Text>
                      </View>

                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Text style={{ fontFamily: fonts.bold, fontSize: 10, color: colors.primary }}>
                          Detail & Tracking
                        </Text>
                        <Feather name="chevron-right" size={13} color={colors.primary} />
                      </View>
                    </View>
                  </Pressable>
                ))}
            </View>

            <PrimaryButton
              label="Tutup"
              variant="secondary"
              onPress={() => setShowAspirasiModal(false)}
            />
          </View>
        </ScrollView>
      </Modal>

      {/* Modal Detail Aspirasi & Tracking Timeline Penanganan Web Backoffice */}
      <Modal
        visible={!!selectedDetailAspirasi}
        onClose={() => setSelectedDetailAspirasi(null)}
        title="Detail Aspirasi & Tracking"
        subtitle={`No. Tiket: ${selectedDetailAspirasi?.id || ''}`}
      >
        {selectedDetailAspirasi && (
          <ScrollView style={{ maxHeight: 480 }} showsVerticalScrollIndicator={false}>
            <View style={{ gap: spacing.sm, paddingVertical: spacing.xs }}>
              {/* Header Status Banner */}
              <View
                style={{
                  padding: spacing.sm,
                  backgroundColor: isDark ? 'rgba(0,43,82,0.4)' : '#F0F9FF',
                  borderRadius: radius.md,
                  borderWidth: 1,
                  borderColor: colors.border,
                  gap: 4,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontFamily: fonts.bold, fontSize: 13, color: colors.text, flex: 1 }}>
                    {selectedDetailAspirasi.title}
                  </Text>
                  <View
                    style={{
                      backgroundColor: colors.surface,
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 6,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Text style={{ fontFamily: fonts.bold, fontSize: 10, color: selectedDetailAspirasi.statusColor || colors.primary }}>
                      {selectedDetailAspirasi.status}
                    </Text>
                  </View>
                </View>

                <Text style={{ fontFamily: fonts.regular, fontSize: 11.5, color: colors.textMuted, lineHeight: 17, marginTop: 4 }}>
                  {selectedDetailAspirasi.desc}
                </Text>
              </View>

              {/* Data Meta Aspirasi */}
              <View
                style={{
                  padding: spacing.sm,
                  backgroundColor: colors.surface,
                  borderRadius: radius.md,
                  borderWidth: 1,
                  borderColor: colors.border,
                  gap: 6,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Feather name="user" size={13} color={colors.primary} />
                  <Text style={{ fontFamily: fonts.medium, fontSize: 11, color: colors.text }}>
                    Pengusul: <Text style={{ fontFamily: fonts.bold }}>{selectedDetailAspirasi.residentName}</Text>
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Feather name="map-pin" size={13} color={colors.primary} />
                  <Text style={{ fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted }}>
                    Lokasi: {selectedDetailAspirasi.location}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Feather name="check-circle" size={13} color={colors.primary} />
                  <Text style={{ fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted }}>
                    Dicatat oleh: <Text style={{ fontFamily: fonts.medium, color: colors.text }}>{selectedDetailAspirasi.recordedBy} ({selectedDetailAspirasi.recordedRole})</Text>
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Feather name="calendar" size={13} color={colors.primary} />
                  <Text style={{ fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted }}>
                    Waktu: {selectedDetailAspirasi.date}
                  </Text>
                </View>
              </View>

              {/* Catatan Tindak Lanjut Web Backoffice */}
              {selectedDetailAspirasi.backofficeNotes && (
                <View
                  style={{
                    padding: spacing.sm,
                    backgroundColor: isDark ? 'rgba(16,185,129,0.1)' : '#F0FDF4',
                    borderRadius: radius.md,
                    borderWidth: 1,
                    borderColor: isDark ? 'rgba(16,185,129,0.25)' : '#BBF7D0',
                    gap: 3,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Feather name="info" size={13} color="#10B981" />
                    <Text style={{ fontFamily: fonts.bold, fontSize: 11, color: '#10B981' }}>
                      Catatan Disposisi Web Command Center:
                    </Text>
                  </View>
                  <Text style={{ fontFamily: fonts.regular, fontSize: 11, color: colors.text, lineHeight: 16 }}>
                    "{selectedDetailAspirasi.backofficeNotes}"
                  </Text>
                  <Text style={{ fontFamily: fonts.medium, fontSize: 10, color: colors.textMuted, marginTop: 2 }}>
                    PIC: {selectedDetailAspirasi.assignedTo}
                  </Text>
                </View>
              )}

              {/* Timeline Tracking Penanganan Web Command Center */}
              <View
                style={{
                  padding: spacing.sm,
                  backgroundColor: colors.surface,
                  borderRadius: radius.md,
                  borderWidth: 1,
                  borderColor: colors.border,
                  gap: spacing.xs,
                }}
              >
                <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: colors.text, marginBottom: 4 }}>
                  Tracking Penanganan Aspirasi
                </Text>

                {selectedDetailAspirasi.timeline.map((step: any, index: number) => {
                  const isLast = index === selectedDetailAspirasi.timeline.length - 1;
                  return (
                    <View key={index} style={{ flexDirection: 'row', gap: 10 }}>
                      {/* Left Track & Icon */}
                      <View style={{ alignItems: 'center', width: 18 }}>
                        <View
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: 8,
                            backgroundColor: step.done ? colors.primary : isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {step.done ? (
                            <Feather name="check" size={10} color="#FFFFFF" strokeWidth={3} />
                          ) : (
                            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.textMuted }} />
                          )}
                        </View>
                        {!isLast && (
                          <View
                            style={{
                              width: 2,
                              flex: 1,
                              backgroundColor: step.done ? colors.primary : colors.border,
                              minHeight: 28,
                            }}
                          />
                        )}
                      </View>

                      {/* Right Details */}
                      <View style={{ flex: 1, paddingBottom: isLast ? 0 : 12, gap: 1 }}>
                        <Text
                          style={{
                            fontFamily: fonts.bold,
                            fontSize: 11.5,
                            color: step.done ? colors.text : colors.textMuted,
                          }}
                        >
                          {step.stage}
                        </Text>
                        <Text style={{ fontFamily: fonts.medium, fontSize: 10, color: colors.primary }}>
                          {step.actor} • {step.time}
                        </Text>
                        <Text style={{ fontFamily: fonts.regular, fontSize: 10.5, color: colors.textMuted, lineHeight: 15 }}>
                          {step.desc}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>

              <PrimaryButton
                label="Kembali ke Daftar"
                onPress={() => setSelectedDetailAspirasi(null)}
                style={{ marginTop: 4 }}
              />
            </View>
          </ScrollView>
        )}
      </Modal>

      {/* Modal Audit Berkas KPPN (Khusus Caleg & Fungsionaris) */}
      <Modal
        visible={showAuditBerkasModal}
        onClose={() => setShowAuditBerkasModal(false)}
        title="Audit Berkas Pencalegan KPPN"
      >
        <View style={{ gap: spacing.sm }}>
          <View style={{ gap: 2 }}>
            <Text style={{ fontSize: 11.5, fontFamily: fonts.regular, color: colors.textMuted }}>
              Komite Pemenangan Pemilu Nasional (KPPN) DPP PAN
            </Text>
            <Text style={{ fontSize: 13, fontFamily: fonts.bold, color: colors.text }}>
              Verifikasi Kelayakan Berkas Caleg Pemilu 2029
            </Text>
          </View>

          <View style={{ gap: 8, marginTop: 4 }}>
            {[
              { id: '1', doc: 'KTP Elektronik & e-KTA simPAN Terverifikasi', status: 'Lengkap & Sah' },
              { id: '2', doc: 'Ijazah Terlegalisir Lembaga Pendidikan Berwenang', status: 'Lengkap & Sah' },
              { id: '3', doc: 'Surat Keterangan Bebas Pidana Pengadilan Negeri', status: 'Lengkap & Sah' },
              { id: '4', doc: 'SKCK dari Mabes Polri (Keperluan Pencalegan)', status: 'Lengkap & Sah' },
              { id: '5', doc: 'Bukti Pelaporan Harta Kekayaan (LHKPN KPK)', status: 'Terverifikasi' },
              { id: '6', doc: 'Formulir Model BB & Pakta Integritas DPP PAN', status: 'Ditandatangani' },
            ].map((item) => (
              <View
                key={item.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 8,
                  borderRadius: radius.sm,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
                  borderWidth: 1,
                  borderColor: colors.border,
                  gap: 8,
                }}
              >
                <Feather name="check-circle" size={16} color={colors.success} />
                <View style={{ flex: 1, gap: 1 }}>
                  <Text style={{ fontSize: 11.5, fontFamily: fonts.medium, color: colors.text }}>
                    {item.doc}
                  </Text>
                  <Text style={{ fontSize: 10, fontFamily: fonts.bold, color: colors.success }}>
                    Status: {item.status}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View
            style={{
              backgroundColor: isDark ? 'rgba(5, 150, 105, 0.15)' : '#ECFDF5',
              padding: 10,
              borderRadius: radius.sm,
              borderWidth: 1,
              borderColor: '#10B981',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              marginTop: 4,
            }}
          >
            <Feather name="award" size={20} color="#059669" />
            <View style={{ flex: 1, gap: 1 }}>
              <Text style={{ fontSize: 11, fontFamily: fonts.bold, color: '#059669' }}>
                STATUS KPPN: MEMENUHI SYARAT (MS)
              </Text>
              <Text style={{ fontSize: 10, fontFamily: fonts.regular, color: colors.textMuted }}>
                Berkas siap di-generate dan di-submit ke SILON KPU RI.
              </Text>
            </View>
          </View>

          <PrimaryButton
            label="Tutup Hasil Audit"
            onPress={() => setShowAuditBerkasModal(false)}
          />
        </View>
      </Modal>

      {/* Modal Maklumat Resmi DPP PAN */}
      <Modal
        visible={showMaklumatModal}
        onClose={() => setShowMaklumatModal(false)}
        title="Maklumat Resmi DPP PAN"
      >
        <View style={{ gap: spacing.sm }}>
          <View
            style={{
              backgroundColor: isDark ? 'rgba(230, 0, 18, 0.15)' : '#FEF2F2',
              borderColor: '#FCA5A5',
              borderWidth: 1,
              padding: 10,
              borderRadius: radius.md,
              gap: 4,
            }}
          >
            <Text style={{ fontSize: 10, fontFamily: fonts.bold, color: '#DC2626', letterSpacing: 0.5 }}>
              SEKRETARIAT JENDERAL DPP PARTAI AMANAT NASIONAL
            </Text>
            <Text style={{ fontSize: 13, fontFamily: fonts.bold, color: colors.text }}>
              Instruksi Strategis Pemenangan & Pengawalan Suara
            </Text>
            <Text style={{ fontSize: 10.5, fontFamily: fonts.regular, color: colors.textMuted }}>
              Nomor: PAN/A/KU-SJ/082/IX/2026 • Tanggal: 18 September 2026
            </Text>
          </View>

          <Text style={{ fontSize: 12, fontFamily: fonts.medium, color: colors.text, lineHeight: 17 }}>
            Kepada Seluruh Fungsionaris DPW, DPD, DPC, DPRt, Caleg, dan Saksi TPS BSN PAN Se-Indonesia:
          </Text>

          <View style={{ gap: 8 }}>
            {[
              '1. Seluruh jajaran DPD & DPC wajib memastikan 100% TPS di wilayahnya terisi saksi resmi ber-SK Mandat.',
              '2. Wajib menggunakan aplikasi SAKSI 360 untuk input Form C1 Plano dan presensi GPS bilik suara.',
              '3. Koordinator Kluster dan Satgas PANdawa siaga penuh mengamankan pemungutan serta penghitungan suara.',
              '4. Setiap potensi sengketa atau indikasi kecurangan segera dilaporkan melalui kanal SOS Darurat di aplikasi.',
            ].map((text, idx) => (
              <View key={idx} style={{ flexDirection: 'row', gap: 6, alignItems: 'flex-start' }}>
                <Feather name="check-square" size={13} color={colors.primary} style={{ marginTop: 2 }} />
                <Text style={{ fontSize: 11.5, fontFamily: fonts.regular, color: colors.text, flex: 1, lineHeight: 16 }}>
                  {text}
                </Text>
              </View>
            ))}
          </View>

          <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 4 }} />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ gap: 1 }}>
              <Text style={{ fontSize: 11, fontFamily: fonts.bold, color: colors.text }}>Dr. (H.C.) Zulkifli Hasan</Text>
              <Text style={{ fontSize: 10, fontFamily: fonts.regular, color: colors.textMuted }}>Ketua Umum DPP PAN</Text>
            </View>
            <View style={{ gap: 1, alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 11, fontFamily: fonts.bold, color: colors.text }}>Sekretaris Jenderal</Text>
              <Text style={{ fontSize: 10, fontFamily: fonts.regular, color: colors.textMuted }}>DPP PAN Jakarta</Text>
            </View>
          </View>

          <PrimaryButton
            label="Pahami & Siap Melaksanakan"
            onPress={() => setShowMaklumatModal(false)}
          />
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },
  unifiedMasterCard: {
    padding: spacing.md,
    gap: spacing.sm + 2,
    borderRadius: radius.xl,
    borderWidth: 1,
    ...shadow.card,
  },
  headerCard: {
    padding: spacing.md,
    gap: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    ...shadow.card,
  },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitleCol: { gap: 2, flex: 1 },
  welcomeGreeting: { fontFamily: fonts.extraBold, fontSize: 16, letterSpacing: 0.5 },
  welcomeAccountSub: { fontFamily: fonts.medium, fontSize: 11 },
  avatarTouch: { position: 'relative' },
  avatarPhoto: { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: '#0066B3' },
  onlineStatusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  statusWilayahCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  statusWilayahItem: { flex: 1, gap: 2 },
  roleBadgeDot: { width: 8, height: 8, borderRadius: 4 },
  swRoleName: { fontFamily: fonts.bold, fontSize: 12 },
  swScopeText: { fontFamily: fonts.regular, fontSize: 10.5 },
  swIdText: { fontFamily: fonts.semiBold, fontSize: 10.5, letterSpacing: 0.3 },
  switchModeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  switchModeBtnText: { fontFamily: fonts.bold, fontSize: 11 },
  ktaMiniStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  ktaEmblemRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  panEmblemSmall: { width: 28, height: 28 },
  ktaLabelText: { fontFamily: fonts.bold, fontSize: 9.5, letterSpacing: 0.5 },
  ktaNumberText: { fontFamily: fonts.extraBold, fontSize: 12 },
  ktaButtonRow: { flexDirection: 'row', gap: 6 },
  ktaMiniBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  ktaMiniBtnText: { fontFamily: fonts.bold, fontSize: 11 },
  ktaMiniBtnSolid: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.md,
  },
  ktaMiniBtnSolidText: { fontFamily: fonts.bold, fontSize: 11, color: '#FFFFFF' },
  syncBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  syncBannerTitle: { fontSize: 11.5, fontFamily: fonts.bold },
  syncBannerSub: { fontSize: 9.5, fontFamily: fonts.regular },
  syncBannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  syncBannerBtnText: { fontSize: 10.5, fontFamily: fonts.bold, color: '#FFFFFF' },
  announcementBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: spacing.sm,
    paddingVertical: 9,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  announcementIconBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(220, 38, 38, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  announcementBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  announcementBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 9,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  announcementDateText: {
    fontFamily: fonts.regular,
    fontSize: 9.5,
  },
  announcementHeadline: {
    fontFamily: fonts.bold,
    fontSize: 11.5,
  },
  announcementActionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingLeft: 4,
  },
  announcementActionText: {
    fontFamily: fonts.bold,
    fontSize: 11,
  },
  integratedAnnouncementStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  announcementIconBoxCompact: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  announcementBadgeCompact: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 3,
  },
  announcementBadgeTextCompact: {
    fontFamily: fonts.bold,
    fontSize: 8.5,
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  announcementDateTextCompact: {
    fontFamily: fonts.regular,
    fontSize: 9,
  },
  announcementHeadlineCompact: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    lineHeight: 15,
  },
  unifiedCardDivider: {
    height: 1,
    width: '100%',
    marginVertical: 2,
  },
  sectionHeaderBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionHeadingTitle: { fontFamily: fonts.bold, fontSize: fontSize.sm },
  witnessStatusBox: { padding: spacing.sm, borderRadius: radius.md, borderWidth: 1, gap: spacing.sm },
  witnessStatusTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  wsTpsTitle: { fontFamily: fonts.bold, fontSize: fontSize.xs },
  wsTpsSub: { fontFamily: fonts.regular, fontSize: 10.5, marginTop: 1 },
  wsStatusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.sm, borderWidth: 1 },
  wsStatusBadgeText: { fontFamily: fonts.bold, fontSize: 10 },
  wsActionButtonsRow: { flexDirection: 'row', gap: spacing.xs },
  wsBtnSolid: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: radius.md,
  },
  wsBtnSolidText: { fontFamily: fonts.bold, fontSize: 11, color: '#FFFFFF' },
  wsBtnOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  wsBtnOutlineText: { fontFamily: fonts.bold, fontSize: 11 },
  coordSummaryBox: { padding: spacing.sm, borderRadius: radius.md, borderWidth: 1, gap: spacing.sm },
  coordStatRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  coordStatCol: { alignItems: 'center' },
  coordStatNum: { fontFamily: fonts.extraBold, fontSize: 20 },
  coordStatLabel: { fontFamily: fonts.medium, fontSize: 10, marginTop: 2 },
  statDivider: { width: 1, height: 28 },
  unifiedWartaCard: { padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, gap: spacing.xs },
  unifiedWartaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  unifiedSegmentTrack: { flexDirection: 'row', gap: 6 },
  unifiedSegmentPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, borderWidth: 1 },
  unifiedSegmentText: { fontFamily: fonts.bold, fontSize: 11 },
  unifiedActionLink: { fontFamily: fonts.bold, fontSize: 11 },
  instruksiContentBox: { gap: 3, marginTop: 4 },
  instruksiMetaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  instruksiTagPill: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  instruksiTagText: { fontFamily: fonts.bold, fontSize: 10, color: '#DC2626' },
  instruksiDateText: { fontFamily: fonts.regular, fontSize: 10 },
  instruksiTitleText: { fontFamily: fonts.bold, fontSize: fontSize.xs, lineHeight: 18 },
  instruksiExcerptText: { fontFamily: fonts.regular, fontSize: 11, lineHeight: 16 },
  miniAgendaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 0.5 },
  miniAgendaTitle: { fontFamily: fonts.bold, fontSize: 11.5 },
  newsHighlightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  newsHighlightThumb: {
    width: 68,
    height: 68,
    borderRadius: 8,
  },
  newsHighlightTitle: {
    fontFamily: fonts.bold,
    fontSize: 12.5,
    lineHeight: 17,
  },
  newsDivider: {
    height: 1,
    width: '100%',
    marginVertical: 4,
  },
  newsItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  newsItemCategory: {
    fontSize: 9.5,
    fontFamily: fonts.bold,
    letterSpacing: 0.4,
  },
  newsItemTitle: {
    fontSize: 12,
    fontFamily: fonts.bold,
    lineHeight: 16,
  },
  newsItemMeta: {
    fontSize: 10.5,
    fontFamily: fonts.regular,
  },
  newsItemThumbnail: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  // 4-Column Quick Menu Icon Grid
  quickIconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    rowGap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  quickGridItem: {
    width: '25%',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 2,
    gap: 6,
  },
  quickIconWrapper: {
    position: 'relative',
  },
  quickIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  quickMicroBadge: {
    position: 'absolute',
    top: -4,
    right: -6,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: radius.pill,
  },
  quickMicroBadgeText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontFamily: fonts.bold,
  },
  quickItemLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
    paddingHorizontal: 2,
  },

  sectionWrap: { gap: spacing.xs },
  bcaGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  bcaMenuCard: {
    width: '48.8%',
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    minHeight: 82,
    justifyContent: 'space-between',
  },
  bcaMenuCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  bcaMenuIconBadge: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  bcaMicroBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.sm },
  bcaMicroBadgeText: { fontSize: 9, fontFamily: fonts.bold },
  bcaMenuCardTitle: { fontSize: 11.5, fontFamily: fonts.bold },
  bcaMenuCardSub: { fontSize: 9.5, fontFamily: fonts.regular },
  taskMiniItem: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: spacing.sm, borderRadius: radius.md, borderWidth: 1 },
  taskMiniDot: { width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  taskMiniTitle: { fontFamily: fonts.bold, fontSize: 11.5 },
  roleSwitchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: spacing.sm, borderRadius: radius.md, borderWidth: 1 },
  roleSwitchIconCircle: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  roleSwitchName: { fontFamily: fonts.bold, fontSize: fontSize.xs },
  volunteerOppCard: { padding: spacing.sm, borderRadius: radius.md, borderWidth: 1, gap: 5 },
  oppHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  oppCategoryBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.sm },
  oppCategoryBadgeText: { fontFamily: fonts.bold, fontSize: 10 },
  oppSlotBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.sm },
  oppSlotBadgeText: { fontFamily: fonts.bold, fontSize: 10 },
  oppTitleText: { fontFamily: fonts.bold, fontSize: fontSize.xs, marginTop: 2 },
  oppDescText: { fontFamily: fonts.regular, fontSize: 11, lineHeight: 16 },
  oppMetaWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 2 },
  oppMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  oppMetaText: { fontFamily: fonts.medium, fontSize: 10.5 },
  oppActionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, borderRadius: radius.md, marginTop: 4 },
  oppActionButtonText: { fontFamily: fonts.bold, fontSize: 11 },
  candidatePrereqBox: { padding: spacing.sm, borderRadius: radius.md, borderWidth: 1, gap: 6 },
  candidatePrereqRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  candidatePrereqText: { fontFamily: fonts.medium, fontSize: 11, flex: 1, lineHeight: 16 },
  candidateAppliedNotice: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: spacing.sm, borderRadius: radius.md, borderWidth: 1 },
  candidateAppliedNoticeText: { fontFamily: fonts.medium, fontSize: 11, flex: 1, lineHeight: 16 },
  candidateApplyBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 9, borderRadius: radius.md },
  candidateApplyBtnText: { fontFamily: fonts.bold, fontSize: 11.5, color: '#FFFFFF' },
});
