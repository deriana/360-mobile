import React, { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Card, ConfirmDialog, Pill, PrimaryButton } from '../components/ui';
import QrPlaceholder from '../components/QrPlaceholder';
import { fontSize, fonts, radius, spacing } from '../theme';
import { ROLE_ICON, ROLE_LABEL } from '../utils/scope';
import { BRAND_ASSETS, getWitnessAvatar } from '../data/images';
import { maskPhone } from '../utils/masking';
import { CareerStatePresetId, MobileRole, VolunteerStatePresetId } from '../types';
import {
  CAREER_PRESETS,
  ROLE_ACTIVITY_TIMELINE,
  VOLUNTEER_PRESETS,
} from '../utils/userContext';
import { checkRoleEligibility } from '../utils/roleUnlockRules';

export default function ProfileScreen({ navigation }: any) {
  const {
    role,
    switchActiveRole,
    switchOperationalRoleWithGuard,
    applyCareerStatePreset,
    applyVolunteerStatePreset,
    currentUser,
    logout,
  } = useApp();
  const { colors, isDark } = useTheme();

  const [confirmLogoutVisible, setConfirmLogoutVisible] = useState(false);
  const [roleSwitchNotice, setRoleSwitchNotice] = useState<string | null>(null);
  const [activityModalVisible, setActivityModalVisible] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [unlockSaksiModalVisible, setUnlockSaksiModalVisible] = useState(false);
  const [roleModalTab, setRoleModalTab] = useState<'roles' | 'presets'>('roles');

  const user = currentUser.identity;
  const officialMembership = currentUser.memberships.find((m) => m.type === 'member');
  const isOfficialMember = Boolean(officialMembership && (officialMembership.status === 'verified' || officialMembership.status === 'active'));
  const currentMembership = officialMembership || currentUser.memberships[0];

  const activeAssignment = currentUser.roles.find((r) => r.role === role) ?? currentUser.roles[0];
  const activityTimeline = ROLE_ACTIVITY_TIMELINE[user.email] || ROLE_ACTIVITY_TIMELINE['saksi@pan.go.id'] || [];
  const hasWitnessRole = currentUser.roles.some((r) => r.role === 'WITNESS');

  // Guard: Opsi role yang boleh diakses hanya yang memang legal
  // Role 'MEMBER' HANYA boleh jika isOfficialMember === true
  const availableRoles = currentUser.roles.filter((r) => {
    if (r.role === 'MEMBER') {
      return isOfficialMember;
    }
    return true;
  });

  const isMultiRole = true; // Always enable role/mode switching for presentation demo
  const [roleModalVisible, setRoleModalVisible] = useState(false);

  const handleSwitchRoleWithGuard = (targetRole: MobileRole) => {
    const res = switchOperationalRoleWithGuard(targetRole);
    if (!res.success) {
      Alert.alert(
        'Persyaratan Peran Belum Terpenuhi',
        res.reason || 'Anda belum memenuhi kualifikasi untuk peran operasional ini.',
        [{ text: 'Tutup', style: 'default' }],
      );
      return;
    }
    setRoleModalVisible(false);
    const friendlyName = getRoleFriendlyName(targetRole);
    setRoleSwitchNotice(`Mode peran berhasil dialihkan ke ${friendlyName}. Tampilan beranda dan navigasi tugas telah disesuaikan.`);
  };

  const handleApplyCareerPreset = (presetId: CareerStatePresetId) => {
    applyCareerStatePreset(presetId);
    setRoleModalVisible(false);
    const preset = CAREER_PRESETS[presetId];
    setRoleSwitchNotice(`Preset "${preset?.name}" aktif! Seluruh 7 dimensi identitas diselaraskan secara real-time.`);
  };

  const handleApplyVolunteerPreset = (presetId: VolunteerStatePresetId) => {
    applyVolunteerStatePreset(presetId);
    setRoleModalVisible(false);
    const preset = VOLUNTEER_PRESETS[presetId];
    setRoleSwitchNotice(`Mode Relawan "${preset?.name}" aktif!`);
  };

  const getRoleFriendlyName = (r: MobileRole): string => {
    switch (r) {
      case 'WITNESS':
        return 'Saksi TPS Resmi';
      case 'TPS_COORDINATOR':
        return 'Koordinator TPS';
      case 'FIELD_COORDINATOR':
        return 'Koordinator Lapangan';
      case 'VOLUNTEER':
        return 'Relawan Simpatisan';
      case 'CALEG_OPS':
        return 'Bakal Calon Legislatif (Caleg)';
      case 'MEMBER':
      default:
        return 'Kader & Anggota Partai';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'assigned':
        return 'Ditugaskan';
      case 'active':
        return 'Aktif';
      case 'verified':
        return 'Terverifikasi';
      default:
        return status;
    }
  };

  const getStatusTone = (status: string): 'success' | 'warning' | 'primary' | 'danger' => {
    switch (status.toLowerCase()) {
      case 'assigned':
        return 'warning';
      case 'active':
      case 'verified':
        return 'success';
      default:
        return 'primary';
    }
  };

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. HERO PROFILE CARD */}
      <Card style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.heroTopRow}>
          <View style={styles.avatarWrap}>
            <Image
              source={getWitnessAvatar(user.avatarIndex ?? 0)}
              style={styles.avatarImage}
            />
            <View style={[styles.onlineDot, { backgroundColor: colors.success }]} />
          </View>

          <View style={{ flex: 1, gap: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={[styles.userName, { color: colors.text }]}>{user.name}</Text>
              {isMultiRole && (
                <Pressable
                  onPress={() => setRoleModalVisible(true)}
                  style={({ pressed }) => [
                    styles.changeRoleChipBtn,
                    { backgroundColor: colors.primaryLight, borderColor: colors.primary },
                    pressed && { opacity: 0.75 },
                  ]}
                >
                  <Feather name="refresh-cw" size={10} color={colors.primary} />
                  <Text style={[styles.changeRoleChipText, { color: colors.primary }]}>Ganti Mode</Text>
                </Pressable>
              )}
            </View>

            {/* Badge Role Aktif */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <View style={[styles.activeRoleChip, { backgroundColor: colors.primaryLight, borderColor: 'transparent' }]}>
                <Feather name={ROLE_ICON[role as MobileRole] || 'user'} size={12} color={colors.primary} />
                <Text style={[styles.activeRoleChipText, { color: colors.primary }]}>
                  {getRoleFriendlyName(role as MobileRole)}
                </Text>
              </View>
            </View>

            <Text style={[styles.userContactText, { color: colors.textMuted }]}>
              {maskPhone(user.phone)} • {user.email}
            </Text>
          </View>
        </View>

        {/* Digital ID Pass Bar (Clean Navy PAN theme) */}
        <View
          style={[
            styles.ktaPassBar,
            {
              backgroundColor: isDark ? 'rgba(0, 43, 82, 0.45)' : '#F0F7FF',
              borderColor: isDark ? '#0A3D6B' : '#BAE6FD',
            },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
            {isOfficialMember ? (
              <Image source={BRAND_ASSETS.official} style={{ width: 28, height: 28 }} resizeMode="contain" />
            ) : (
              <View style={[styles.volunteerBadgeCircle, { backgroundColor: colors.primary }]}>
                <Feather name="shield" size={14} color="#FFFFFF" />
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={[styles.passBarTitle, { color: colors.textMuted }]}>
                {isOfficialMember ? 'e-KTA simPAN Digital' : 'ID RELAWAN SIMPATISAN'}
              </Text>
              <Text style={[styles.passBarNumber, { color: colors.text }]}>
                {isOfficialMember
                  ? officialMembership?.ktaNumber || '32.73.01.2024.08912'
                  : currentMembership?.ktaNumber || 'REL-3273-2024-0042'}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Pressable
              onPress={() => setQrModalVisible(true)}
              style={({ pressed }) => [
                styles.openKtaBtn,
                { backgroundColor: colors.primary },
                pressed && { opacity: 0.85 },
              ]}
            >
              <Feather name="maximize" size={12} color="#FFFFFF" />
              <Text style={styles.openKtaBtnText}>QR Pas</Text>
            </Pressable>

            {isOfficialMember && (
              <Pressable
                onPress={() => navigation.navigate('SimpanKta')}
                style={({ pressed }) => [
                  styles.openKtaBtnOutline,
                  { borderColor: colors.border, backgroundColor: colors.surface },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={[styles.openKtaBtnOutlineText, { color: colors.primary }]}>e-KTA</Text>
                <Feather name="chevron-right" size={12} color={colors.primary} />
              </Pressable>
            )}
          </View>
        </View>

        {/* Upgrade Banner Khusus Non-Kader (Ajakan Jadi Kader Resmi) */}
        {!isOfficialMember && (
          <Pressable
            onPress={() => {
              navigation.navigate('RegisterMember', {
                source: 'profile_upgrade',
                prefillName: user.name,
                prefillPhone: user.phone,
                prefillEmail: user.email,
                prefillNik: user.nikFull || user.nikMasked,
              });
            }}
            style={({ pressed }) => [
              styles.upgradeBanner,
              { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : '#FFFBEB', borderColor: isDark ? '#78350F' : '#FDE68A' },
              pressed && { opacity: 0.8 },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
              <Feather name="award" size={15} color="#D97706" />
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: fonts.bold, fontSize: 11, color: '#B45309' }}>
                  Ingin memiliki e-KTA Kader Resmi?
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 10, color: colors.textMuted }}>
                  Tingkatkan status keanggotaan simPAN resmi partai
                </Text>
              </View>
            </View>
            <View style={styles.upgradeBannerAction}>
              <Text style={styles.upgradeBannerActionText}>Ajukan</Text>
              <Feather name="arrow-right" size={11} color="#B45309" />
            </View>
          </Pressable>
        )}
      </Card>

      {/* 2. KHUSUS RELAWAN: STATISTIK PENCAPAIAN, KEAHLIAN & KORLAP */}
      {!isOfficialMember && (role === 'VOLUNTEER' || role === 'RELAWAN') && (
        <Card style={[styles.menuCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Feather name="activity" size={15} color={colors.primary} />
              <Text style={[styles.cardSectionHeading, { color: colors.text }]}>Rekam Jejak</Text>
            </View>
            <Pill label="Relawan Terlatih" tone="success" />
          </View>

          {/* Metric Stats Kontribusi */}
          <View
            style={[
              styles.volunteerStatsGrid,
              { backgroundColor: isDark ? 'rgba(0,43,82,0.3)' : '#F8FAFC', borderColor: colors.border },
            ]}
          >
            <View style={styles.volunteerStatItem}>
              <Text style={[styles.volunteerStatValue, { color: colors.primary }]}>
                {currentUser.volunteerStats?.eventsAttended || 5}
              </Text>
              <Text style={[styles.volunteerStatLabel, { color: colors.textMuted }]}>Kegiatan</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.volunteerStatItem}>
              <Text style={[styles.volunteerStatValue, { color: colors.success }]}>
                {currentUser.volunteerStats?.tasksCompleted || 8}
              </Text>
              <Text style={[styles.volunteerStatLabel, { color: colors.textMuted }]}>Tugas Selesai</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.volunteerStatItem}>
              <Text style={[styles.volunteerStatValue, { color: '#D97706' }]}>
                {currentUser.volunteerStats?.trainingHours || 12} Jam
              </Text>
              <Text style={[styles.volunteerStatLabel, { color: colors.textMuted }]}>Bimtek BSN</Text>
            </View>
          </View>

          {/* Keahlian Relawan Chips (Subtle Pills) */}
          <View style={{ gap: 6, marginTop: 4 }}>
            <Text style={{ fontFamily: fonts.bold, fontSize: 10.5, color: colors.textMuted, letterSpacing: 0.3 }}>
              KEAHLIAN & KETERAMPILAN
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {(
                currentUser.skills || [
                  'Komunikasi Publik & Warga',
                  'Administrasi Acara & Presensi',
                  'Fotografi & Konten Medsos',
                ]
              ).map((skill, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.volunteerSkillChip,
                    { backgroundColor: isDark ? 'rgba(0,102,179,0.18)' : '#F0F7FF' },
                  ]}
                >
                  <Feather name="check" size={10} color={colors.primary} />
                  <Text style={[styles.volunteerSkillChipText, { color: colors.primary }]}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Minat & Fokus Gerakan Chips */}
          <View style={{ gap: 6, marginTop: 4 }}>
            <Text style={{ fontFamily: fonts.bold, fontSize: 10.5, color: colors.textMuted, letterSpacing: 0.3 }}>
              MINAT & FOKUS PENGABDIAN
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {(
                currentUser.interests || [
                  'Event & Sosialisasi',
                  'Advokasi Lansia/Pemilih',
                  'Logistik Posko & Dapur Umum',
                ]
              ).map((interest, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.volunteerInterestChip,
                    { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' },
                  ]}
                >
                  <Feather name="tag" size={10} color={colors.textMuted} />
                  <Text style={[styles.volunteerInterestChipText, { color: colors.text }]}>{interest}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Koordinator Pendamping Wilayah */}
          <View
            style={[
              styles.coordinatorContactBox,
              { backgroundColor: isDark ? 'rgba(0, 43, 82, 0.25)' : '#F8FAFC', borderColor: colors.border },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: colors.primaryLight,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Feather name="user-check" size={16} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: colors.text }}>
                  {currentUser.coordinatorContact?.name || 'Asep Ridwan'}
                </Text>
                <Text style={{ fontFamily: fonts.medium, fontSize: 11, color: colors.primary }}>
                  Koordinator Lapangan • {currentUser.coordinatorContact?.phone || '0811-2233-4455'}
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 10, color: colors.textMuted }} numberOfLines={1}>
                  {currentUser.coordinatorContact?.posko || 'Posko Pemenangan Dago Atas No. 84'}
                </Text>
              </View>
            </View>
          </View>
          {/* Tombol Lihat Riwayat Aktivitas Relawan */}
          <Pressable
            onPress={() => setActivityModalVisible(true)}
            style={({ pressed }) => [
              styles.viewTimelineBtn,
              { borderColor: colors.border, backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC' },
              pressed && { opacity: 0.75 },
            ]}
          >
            <Feather name="clock" size={12} color={colors.primary} />
            <Text style={[styles.viewTimelineBtnText, { color: colors.primary }]}>
              Lihat Riwayat & Aktivitas Lengkap
            </Text>
            <Feather name="chevron-right" size={12} color={colors.primary} />
          </Pressable>
        </Card>
      )}

      {/* 2B. REKAM JEJAK & PENGABDIAN KADER (JIKA ANGGOTA RESMI) */}
      {isOfficialMember && (
        <Card style={[styles.menuCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Feather name="activity" size={15} color={colors.primary} />
              <Text style={[styles.cardSectionHeading, { color: colors.text }]}>Rekam Jejak & Pengabdian</Text>
            </View>
            <Pill label="Kader Aktif" tone="primary" />
          </View>

          <View
            style={[
              styles.volunteerStatsGrid,
              { backgroundColor: isDark ? 'rgba(0,43,82,0.3)' : '#F8FAFC', borderColor: colors.border },
            ]}
          >
            <View style={styles.volunteerStatItem}>
              <Text style={[styles.volunteerStatValue, { color: colors.primary }]}>
                {activityTimeline.length}
              </Text>
              <Text style={[styles.volunteerStatLabel, { color: colors.textMuted }]}>Penugasan</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.volunteerStatItem}>
              <Text style={[styles.volunteerStatValue, { color: colors.success }]}>
                Lulus LKK
              </Text>
              <Text style={[styles.volunteerStatLabel, { color: colors.textMuted }]}>Kaderisasi</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.volunteerStatItem}>
              <Text style={[styles.volunteerStatValue, { color: '#D97706' }]}>
                16 Jam
              </Text>
              <Text style={[styles.volunteerStatLabel, { color: colors.textMuted }]}>Bimtek BSN</Text>
            </View>
          </View>

          {/* Tombol Lihat Riwayat Aktivitas Kader */}
          <Pressable
            onPress={() => setActivityModalVisible(true)}
            style={({ pressed }) => [
              styles.viewTimelineBtn,
              { borderColor: colors.border, backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC' },
              pressed && { opacity: 0.75 },
            ]}
          >
            <Feather name="clock" size={12} color={colors.primary} />
            <Text style={[styles.viewTimelineBtnText, { color: colors.primary }]}>
              Lihat Riwayat & Timeline Penugasan ({activityTimeline.length})
            </Text>
            <Feather name="chevron-right" size={12} color={colors.primary} />
          </Pressable>
        </Card>
      )}

      {/* 3. INFORMASI IDENTITAS & WILAYAH */}
      <Card style={[styles.menuCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.cardSectionHeading, { color: colors.text }]}>Informasi Identitas & Wilayah</Text>

        <View style={styles.infoRow}>
          <View style={styles.infoRowLeft}>
            <Feather name="map-pin" size={14} color={colors.primary} />
            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Struktur Wilayah</Text>
          </View>
          <Text style={[styles.infoValue, { color: colors.text }]}>
            {currentMembership?.dpd || 'DPD PAN Kota Bandung'} • {currentMembership?.dpc || 'DPC Coblong'}
          </Text>
        </View>

        <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />

        <View style={styles.infoRow}>
          <View style={styles.infoRowLeft}>
            <Feather name="calendar" size={14} color={colors.primary} />
            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Terdaftar Sejak</Text>
          </View>
          <Text style={[styles.infoValue, { color: colors.text }]}>
            {currentMembership?.registeredAt || '01 Maret 2024'}
          </Text>
        </View>
      </Card>

      {/* 4. LAYANAN & PENGATURAN */}
      <Card style={[styles.menuCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.cardSectionHeading, { color: colors.text }]}>Layanan & Pengaturan</Text>


        {/* Mandat Saksi TPS (Khusus Relawan / Saksi) */}
        {!hasWitnessRole ? (
          <>
            <Pressable
              onPress={() => setUnlockSaksiModalVisible(true)}
              style={({ pressed }) => [styles.actionRow, pressed && { opacity: 0.7 }]}
            >
              <View style={[styles.actionIconWrap, { backgroundColor: '#FEE2E2' }]}>
                <Feather name="shield" size={15} color="#DC2626" />
              </View>
              <View style={{ flex: 1, gap: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={[styles.actionTitle, { color: colors.text }]}>Unlock Mandat Saksi TPS</Text>
                  <View style={{ backgroundColor: '#EF4444', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 }}>
                    <Text style={{ fontFamily: fonts.bold, fontSize: 9, color: '#FFFFFF' }}>4 Syarat</Text>
                  </View>
                </View>
                <Text style={[styles.actionSubtitle, { color: colors.textMuted }]}>
                  Akreditasi BSN: Bimtek, e-KTP, Pakta Integritas, & SK Mandat DPD
                </Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.textMuted} />
            </Pressable>

            <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />
          </>
        ) : (
          <>
            <Pressable
              onPress={() => setUnlockSaksiModalVisible(true)}
              style={({ pressed }) => [styles.actionRow, pressed && { opacity: 0.7 }]}
            >
              <View style={[styles.actionIconWrap, { backgroundColor: '#DCFCE7' }]}>
                <Feather name="shield" size={15} color="#16A34A" />
              </View>
              <View style={{ flex: 1, gap: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={[styles.actionTitle, { color: colors.text }]}>Status Mandat Saksi TPS</Text>
                  <View style={{ backgroundColor: '#16A34A', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 }}>
                    <Text style={{ fontFamily: fonts.bold, fontSize: 9, color: '#FFFFFF' }}>Aktif</Text>
                  </View>
                </View>
                <Text style={[styles.actionSubtitle, { color: colors.textMuted }]}>
                  Mandat resmi BSN aktif • TPS 014 Babakan Asih
                </Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.textMuted} />
            </Pressable>

            <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />
          </>
        )}

        {/* Status & Peran Saya (7 Dimensi Identitas) */}
        <Pressable
          onPress={() => navigation.navigate('StatusPeranSaya')}
          style={({ pressed }) => [styles.actionRow, pressed && { opacity: 0.7 }]}
        >
          <View style={[styles.actionIconWrap, { backgroundColor: '#E0F2FE' }]}>
            <Feather name="layers" size={15} color="#0066B3" />
          </View>
          <View style={{ flex: 1, gap: 1 }}>
            <Text style={[styles.actionTitle, { color: colors.text }]}>Status & Peran Saya</Text>
            <Text style={[styles.actionSubtitle, { color: colors.textMuted }]}>
              7 Dimensi Identitas, Perkaderan, Posisi, & SK Mandat
            </Text>
          </View>
          <Feather name="chevron-right" size={16} color={colors.textMuted} />
        </Pressable>

        <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />

        {/* Kelola Status Saya (Pengunduran Diri & Jeda) */}
        <Pressable
          onPress={() => navigation.navigate('KelolaStatus')}
          style={({ pressed }) => [styles.actionRow, pressed && { opacity: 0.7 }]}
        >
          <View style={[styles.actionIconWrap, { backgroundColor: '#FEF3C7' }]}>
            <Feather name="user-check" size={15} color="#D97706" />
          </View>
          <View style={{ flex: 1, gap: 1 }}>
            <Text style={[styles.actionTitle, { color: colors.text }]}>Kelola Status & Partisipasi</Text>
            <Text style={[styles.actionSubtitle, { color: colors.textMuted }]}>
              Pengajuan pengunduran diri resmi, jeda, & active task guard
            </Text>
          </View>
          <Feather name="chevron-right" size={16} color={colors.textMuted} />
        </Pressable>

        <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />

        {/* Surat Mandat Digital (Hanya untuk Saksi / Penugasan Saksi) */}
        {hasWitnessRole && (
          <>
            <Pressable
              onPress={() => navigation.navigate('AssignmentLetter', { witnessId: 'SAKSI-001' })}
              style={({ pressed }) => [styles.actionRow, pressed && { opacity: 0.7 }]}
            >
              <View style={[styles.actionIconWrap, { backgroundColor: colors.primaryLight }]}>
                <Feather name="file-text" size={15} color={colors.primary} />
              </View>
              <View style={{ flex: 1, gap: 1 }}>
                <Text style={[styles.actionTitle, { color: colors.text }]}>Surat Tugas Digital (E-Mandat)</Text>
                <Text style={[styles.actionSubtitle, { color: colors.textMuted }]}>Surat Mandat resmi saksi TPS Partai</Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.textMuted} />
            </Pressable>

            <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />
          </>
        )}

        {/* Kantor Sekretariat simPAN */}
        <Pressable
          onPress={() => navigation.navigate('SimpanOffices')}
          style={({ pressed }) => [styles.actionRow, pressed && { opacity: 0.7 }]}
        >
          <View style={[styles.actionIconWrap, { backgroundColor: colors.primaryLight }]}>
            <Feather name="home" size={15} color={colors.primary} />
          </View>
          <View style={{ flex: 1, gap: 1 }}>
            <Text style={[styles.actionTitle, { color: colors.text }]}>Kantor Sekretariat simPAN</Text>
            <Text style={[styles.actionSubtitle, { color: colors.textMuted }]}>
              Alamat kantor partai & rumah aspirasi di Indonesia
            </Text>
          </View>
          <Feather name="chevron-right" size={16} color={colors.textMuted} />
        </Pressable>

        <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />

        {/* Transparansi & Akuntabilitas */}
        <Pressable
          onPress={() => navigation.navigate('TransparencyHub')}
          style={({ pressed }) => [styles.actionRow, pressed && { opacity: 0.7 }]}
        >
          <View style={[styles.actionIconWrap, { backgroundColor: '#ECFDF5' }]}>
            <Feather name="check-circle" size={15} color="#059669" />
          </View>
          <View style={{ flex: 1, gap: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.actionTitle, { color: colors.text }]}>Transparansi & Akuntabilitas</Text>
              <View style={{ backgroundColor: '#ECFDF5', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4 }}>
                <Text style={{ fontFamily: fonts.bold, fontSize: 8.5, color: '#059669' }}>WTP</Text>
              </View>
            </View>
            <Text style={[styles.actionSubtitle, { color: colors.textMuted }]}>
              Struktur, Laporan Keuangan, Banpar & AD/ART
            </Text>
          </View>
          <Feather name="chevron-right" size={16} color={colors.textMuted} />
        </Pressable>

        <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />

        {/* Keamanan & Privasi */}
        <Pressable
          onPress={() => navigation.navigate('Security')}
          style={({ pressed }) => [styles.actionRow, pressed && { opacity: 0.7 }]}
        >
          <View style={[styles.actionIconWrap, { backgroundColor: colors.primaryLight }]}>
            <Feather name="shield" size={15} color={colors.primary} />
          </View>
          <View style={{ flex: 1, gap: 1 }}>
            <Text style={[styles.actionTitle, { color: colors.text }]}>Keamanan & Privasi Akun</Text>
            <Text style={[styles.actionSubtitle, { color: colors.textMuted }]}>Proteksi PIN & autentikasi biometric</Text>
          </View>
          <Feather name="chevron-right" size={16} color={colors.textMuted} />
        </Pressable>

        <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />

        {/* Pusat Bantuan */}
        <Pressable
          onPress={() => navigation.navigate('HelpCenter')}
          style={({ pressed }) => [styles.actionRow, pressed && { opacity: 0.7 }]}
        >
          <View style={[styles.actionIconWrap, { backgroundColor: colors.primaryLight }]}>
            <Feather name="help-circle" size={15} color={colors.primary} />
          </View>
          <View style={{ flex: 1, gap: 1 }}>
            <Text style={[styles.actionTitle, { color: colors.text }]}>Pusat Bantuan & Panduan</Text>
            <Text style={[styles.actionSubtitle, { color: colors.textMuted }]}>FAQ, kontak call center & regulasi saksi</Text>
          </View>
          <Feather name="chevron-right" size={16} color={colors.textMuted} />
        </Pressable>
      </Card>
      {/* 5. TOMBOL LOGOUT & FOOTER APLIKASI */}
      <View style={{ marginTop: spacing.xs, gap: spacing.md, alignItems: 'center' }}>
        <Pressable
          onPress={() => setConfirmLogoutVisible(true)}
          style={({ pressed }) => [
            styles.logoutBtn,
            { borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : '#FEE2E2', backgroundColor: isDark ? 'rgba(239, 68, 68, 0.08)' : '#FFF5F5' },
            pressed && { opacity: 0.8 },
          ]}
        >
          <Feather name="log-out" size={15} color="#DC2626" />
          <Text style={styles.logoutBtnText}>Logout</Text>
        </Pressable>

        <Text style={[styles.versionFooter, { color: colors.textMuted }]}>
          simPAN Mobile • Versi 2.4.0 (Build 2026.09)
        </Text>
      </View>

      {/* MODAL RIWAYAT AKTIVITAS */}
      <Modal
        visible={activityModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setActivityModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <View style={{ gap: 2 }}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Riwayat Aktivitas & Penugasan</Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted }}>
                  Jejak rekam penugasan resmi Partai Amanat Nasional
                </Text>
              </View>
              <Pressable onPress={() => setActivityModalVisible(false)} style={styles.modalCloseBtn}>
                <Feather name="x" size={18} color={colors.textMuted} />
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
              <View style={{ paddingVertical: spacing.xs }}>
                {activityTimeline.map((item, index) => (
                  <View key={item.id} style={styles.timelineRow}>
                    <View style={styles.timelineIndicatorCol}>
                      <View style={[styles.timelineDot, { backgroundColor: colors.primary }]}>
                        <Feather name={item.icon} size={10} color="#FFFFFF" />
                      </View>
                      {index < activityTimeline.length - 1 && (
                        <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
                      )}
                    </View>

                    <View style={{ flex: 1, paddingBottom: spacing.sm, gap: 2 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontFamily: fonts.bold, fontSize: fontSize.xs, color: colors.text }}>
                          {item.title}
                        </Text>
                        <Text style={{ fontFamily: fonts.medium, fontSize: 10, color: colors.primary }}>
                          {item.date}
                        </Text>
                      </View>
                      <Text style={{ fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted, lineHeight: 15 }}>
                        {item.desc}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>

            <Pressable
              onPress={() => setActivityModalVisible(false)}
              style={[styles.modalActionBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.modalActionBtnText}>Tutup</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* MODAL ADAPTIF: PILIH MODE PERAN LAPANGAN & STATE PRESETS (DPP DEMO) */}
      <Modal
        visible={roleModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setRoleModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={{ gap: 2, flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Feather name="layers" size={16} color={colors.primary} />
                  <Text style={[styles.modalTitle, { color: colors.text }]}>
                    {isOfficialMember ? 'Ganti Mode & Simulasi Karir' : 'Mode Transisi Relawan PAN'}
                  </Text>
                </View>
                <Text style={{ fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted }}>
                  {isOfficialMember
                    ? 'Peralihan peran operasional & 6 state presets demonstrasi DPP'
                    : 'Peralihan mode relawan posko menuju mandat saksi TPS'}
                </Text>
              </View>
              <Pressable onPress={() => setRoleModalVisible(false)} style={styles.modalCloseBtn}>
                <Feather name="x" size={18} color={colors.textMuted} />
              </Pressable>
            </View>

            {/* If Official Member (Ahmad Fauzan / Kader): Show Tabs for Peran Operasional vs State Presets */}
            {isOfficialMember && (
              <View style={styles.modalTabRow}>
                <TouchableOpacity
                  style={[
                    styles.modalTabBtn,
                    roleModalTab === 'roles' && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                  onPress={() => setRoleModalTab('roles')}
                  activeOpacity={0.8}
                >
                  <Feather name="users" size={13} color={roleModalTab === 'roles' ? '#FFFFFF' : colors.textMuted} />
                  <Text
                    style={[
                      styles.modalTabText,
                      { color: roleModalTab === 'roles' ? '#FFFFFF' : colors.textMuted },
                    ]}
                  >
                    Peran Operasional
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalTabBtn,
                    roleModalTab === 'presets' && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                  onPress={() => setRoleModalTab('presets')}
                  activeOpacity={0.8}
                >
                  <Feather name="play-circle" size={13} color={roleModalTab === 'presets' ? '#FFFFFF' : colors.textMuted} />
                  <Text
                    style={[
                      styles.modalTabText,
                      { color: roleModalTab === 'presets' ? '#FFFFFF' : colors.textMuted },
                    ]}
                  >
                    Preset Karir (Demo)
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* MODAL CONTENT: ROLE SWITCHER (AKUN ANGGOTA) */}
            {isOfficialMember && roleModalTab === 'roles' && (
              <ScrollView style={{ maxHeight: 350 }} showsVerticalScrollIndicator={false}>
                <View style={{ gap: spacing.xs, paddingVertical: spacing.xs }}>
                  {availableRoles.map((assignment) => {
                    const isCurrent = role === assignment.role;
                    const iconName = ROLE_ICON[assignment.role] || 'user';
                    const friendlyName = getRoleFriendlyName(assignment.role);
                    const eligibility = checkRoleEligibility(currentUser, assignment.role);

                    return (
                      <Pressable
                        key={assignment.role}
                        onPress={() => handleSwitchRoleWithGuard(assignment.role)}
                        style={({ pressed }) => [
                          styles.roleModalCard,
                          {
                            backgroundColor: isCurrent
                              ? isDark
                                ? 'rgba(0, 66, 128, 0.4)'
                                : '#F0F9FF'
                              : !eligibility.allowed
                              ? isDark
                                ? 'rgba(245, 158, 11, 0.08)'
                                : '#FFFBEB'
                              : colors.surface,
                            borderColor: isCurrent
                              ? colors.primary
                              : !eligibility.allowed
                              ? '#FDE68A'
                              : colors.border,
                          },
                          pressed && { opacity: 0.85 },
                        ]}
                      >
                        <View
                          style={[
                            styles.roleIconCircle,
                            {
                              backgroundColor: isCurrent
                                ? colors.primary
                                : !eligibility.allowed
                                ? '#FEF3C7'
                                : isDark
                                ? 'rgba(255,255,255,0.08)'
                                : '#F1F5F9',
                            },
                          ]}
                        >
                          <Feather
                            name={iconName}
                            size={16}
                            color={isCurrent ? '#FFFFFF' : !eligibility.allowed ? '#D97706' : colors.textMuted}
                          />
                        </View>

                        <View style={{ flex: 1, gap: 2 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <Text
                              style={[
                                styles.roleCardTitle,
                                { color: isCurrent ? colors.primary : colors.text },
                              ]}
                            >
                              {friendlyName}
                            </Text>
                            {!eligibility.allowed ? (
                              <View style={[styles.lockedPill, { backgroundColor: '#FEF3C7' }]}>
                                <Feather name="lock" size={9} color="#B45309" />
                                <Text style={styles.lockedPillText}>Prasyarat BSN</Text>
                              </View>
                            ) : (
                              <Pill
                                label={getStatusLabel(assignment.status)}
                                tone={getStatusTone(assignment.status)}
                              />
                            )}
                          </View>

                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Feather name="map-pin" size={11} color={colors.textMuted} />
                            <Text style={[styles.roleCardScope, { color: colors.textMuted }]} numberOfLines={1}>
                              {assignment.scope.name}
                            </Text>
                          </View>

                          {!eligibility.allowed && (
                            <Text style={styles.eligibilityHint} numberOfLines={1}>
                              ⚠️ {eligibility.reason}
                            </Text>
                          )}
                        </View>

                        {isCurrent ? (
                          <View style={[styles.activeRolePill, { backgroundColor: colors.primary }]}>
                            <Feather name="check" size={11} color="#FFFFFF" strokeWidth={3} />
                            <Text style={styles.activeRoleText}>Aktif</Text>
                          </View>
                        ) : !eligibility.allowed ? (
                          <View style={[styles.switchRoleBtn, { borderColor: '#FDE68A', backgroundColor: '#FEF3C7' }]}>
                            <Feather name="lock" size={12} color="#B45309" />
                          </View>
                        ) : (
                          <View style={[styles.switchRoleBtn, { borderColor: colors.border }]}>
                            <Text style={[styles.switchRoleText, { color: colors.primary }]}>Pilih</Text>
                            <Feather name="chevron-right" size={13} color={colors.primary} />
                          </View>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            )}

            {/* MODAL CONTENT: 6 STATE PRESETS (AKUN ANGGOTA AHMAD FAUZAN) */}
            {isOfficialMember && roleModalTab === 'presets' && (
              <ScrollView style={{ maxHeight: 370 }} showsVerticalScrollIndicator={false}>
                <View style={{ gap: 8, paddingVertical: spacing.xs }}>
                  {(Object.keys(CAREER_PRESETS) as CareerStatePresetId[]).map((presetId) => {
                    const preset = CAREER_PRESETS[presetId];
                    const isPresetRole = role === preset.role;

                    return (
                      <TouchableOpacity
                        key={presetId}
                        onPress={() => handleApplyCareerPreset(presetId)}
                        style={[
                          styles.presetCard,
                          {
                            backgroundColor: isPresetRole
                              ? isDark
                                ? 'rgba(0, 66, 128, 0.4)'
                                : '#F0F9FF'
                              : colors.surface,
                            borderColor: isPresetRole ? colors.primary : colors.border,
                          },
                        ]}
                        activeOpacity={0.8}
                      >
                        <View style={styles.presetTopRow}>
                          <Text style={[styles.presetName, { color: colors.text }]}>{preset.name}</Text>
                          <View style={[styles.presetBadge, { backgroundColor: '#E0F2FE' }]}>
                            <Text style={[styles.presetBadgeText, { color: '#0066B3' }]}>{preset.badge}</Text>
                          </View>
                        </View>
                        <Text style={[styles.presetDesc, { color: colors.textMuted }]}>{preset.desc}</Text>
                        <View style={styles.presetFooter}>
                          <View style={styles.presetRolePill}>
                            <Feather name="tag" size={10} color={colors.primary} />
                            <Text style={[styles.presetRoleText, { color: colors.primary }]}>
                              Role: {getRoleFriendlyName(preset.role)}
                            </Text>
                          </View>
                          {isPresetRole ? (
                            <View style={[styles.activePillSmall, { backgroundColor: colors.primary }]}>
                              <Feather name="check" size={10} color="#FFFFFF" />
                              <Text style={styles.activePillSmallText}>Aktif</Text>
                            </View>
                          ) : (
                            <Text style={[styles.applyText, { color: colors.primary }]}>Aktifkan →</Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            )}

            {/* MODAL CONTENT: VOLUNTEER TRANSITION (AKUN RELAWAN SITI RAHMAWATI) */}
            {!isOfficialMember && (
              <ScrollView style={{ maxHeight: 370 }} showsVerticalScrollIndicator={false}>
                <View style={{ gap: 10, paddingVertical: spacing.xs }}>
                  <Text style={[styles.volunteerSectionNotice, { color: colors.textMuted }]}>
                    Transisi dinamis relawan murni: beralih antara status pengawalan posko simpatisan vs saksi ber-SK Mandat resmi TPS 018 Braga.
                  </Text>

                  {(Object.keys(VOLUNTEER_PRESETS) as VolunteerStatePresetId[]).map((presetId) => {
                    const preset = VOLUNTEER_PRESETS[presetId];
                    const isCurrent = role === preset.role;

                    return (
                      <TouchableOpacity
                        key={presetId}
                        onPress={() => handleApplyVolunteerPreset(presetId)}
                        style={[
                          styles.presetCard,
                          {
                            backgroundColor: isCurrent
                              ? isDark
                                ? 'rgba(0, 66, 128, 0.4)'
                                : '#F0F9FF'
                              : colors.surface,
                            borderColor: isCurrent ? colors.primary : colors.border,
                          },
                        ]}
                        activeOpacity={0.8}
                      >
                        <View style={styles.presetTopRow}>
                          <Text style={[styles.presetName, { color: colors.text }]}>{preset.name}</Text>
                          <View
                            style={[
                              styles.presetBadge,
                              { backgroundColor: presetId === 'state_r2' ? '#DCFCE7' : '#FEF3C7' },
                            ]}
                          >
                            <Text
                              style={[
                                styles.presetBadgeText,
                                { color: presetId === 'state_r2' ? '#166534' : '#92400E' },
                              ]}
                            >
                              {preset.badge}
                            </Text>
                          </View>
                        </View>
                        <Text style={[styles.presetDesc, { color: colors.textMuted }]}>{preset.desc}</Text>
                        <View style={styles.presetFooter}>
                          <View style={styles.presetRolePill}>
                            <Feather name="shield" size={10} color={colors.primary} />
                            <Text style={[styles.presetRoleText, { color: colors.primary }]}>
                              Akses: {preset.role === 'WITNESS' ? 'Mode Saksi TPS Penuh' : 'Mode Relawan Posko'}
                            </Text>
                          </View>
                          {isCurrent ? (
                            <View style={[styles.activePillSmall, { backgroundColor: colors.primary }]}>
                              <Feather name="check" size={10} color="#FFFFFF" />
                              <Text style={styles.activePillSmallText}>Aktif</Text>
                            </View>
                          ) : (
                            <Text style={[styles.applyText, { color: colors.primary }]}>Terapkan Mode →</Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            )}

            <Pressable
              onPress={() => setRoleModalVisible(false)}
              style={[styles.modalActionBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0', marginTop: 10 }]}
            >
              <Text style={[styles.modalActionBtnText, { color: colors.text }]}>Tutup</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* MODAL QR PAS DIGITAL (e-KTA / RELAWAN) */}
      <Modal
        visible={qrModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setQrModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContentCard, { backgroundColor: colors.surface, borderColor: colors.border, alignItems: 'center' }]}>
            <View style={[styles.modalHeader, { width: '100%' }]}>
              <View style={{ gap: 2 }}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {isOfficialMember ? 'QR Pas Digital Anggota' : 'QR Pas Relawan Simpatisan'}
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted }}>
                  {isOfficialMember ? 'e-KTA simPAN Terverifikasi' : 'Digital ID Relawan PAN'}
                </Text>
              </View>
              <Pressable onPress={() => setQrModalVisible(false)} style={styles.modalCloseBtn}>
                <Feather name="x" size={18} color={colors.textMuted} />
              </Pressable>
            </View>

            <View style={{ alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, width: '100%' }}>
              <QrPlaceholder
                size={180}
                seed={
                  isOfficialMember
                    ? `PAN-${officialMembership?.ktaNumber || '32.73.01.2024.08912'}-AUTHENTICATED`
                    : `PAN-${currentMembership?.ktaNumber || 'REL-3273-2024-0042'}-VOLUNTEER`
                }
              />
              <Text style={{ fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted, textAlign: 'center', paddingHorizontal: 12 }}>
                {isOfficialMember
                  ? 'Pindai QR ini untuk verifikasi keanggotaan resmi dan absensi kegiatan internal partai.'
                  : 'Pindai QR ini untuk presensi kehadiran giat posko dan kegiatan bakti relawan.'}
              </Text>
              <PrimaryButton
                label={isOfficialMember ? 'Buka e-KTA Penuh' : 'Tutup'}
                variant={isOfficialMember ? 'primary' : 'secondary'}
                onPress={() => {
                  setQrModalVisible(false);
                  if (isOfficialMember) {
                    navigation.navigate('SimpanKta');
                  }
                }}
                style={{ width: '100%' }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL UNLOCK MANDAT SAKSI TPS */}
      <Modal
        visible={unlockSaksiModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setUnlockSaksiModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContentCard, { backgroundColor: colors.surface, borderColor: colors.border, maxHeight: '85%' }]}>
            <View style={[styles.modalHeader, { width: '100%' }]}>
              <View style={{ gap: 2, flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>Mandat Saksi TPS</Text>
                  <View style={{ backgroundColor: '#EF4444', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 }}>
                    <Text style={{ fontFamily: fonts.bold, fontSize: 9, color: '#FFFFFF' }}>BSN PAN</Text>
                  </View>
                </View>
                <Text style={{ fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted }}>
                  Verifikasi 4 instrumen akreditasi resmi saksi TPS
                </Text>
              </View>
              <Pressable onPress={() => setUnlockSaksiModalVisible(false)} style={styles.modalCloseBtn}>
                <Feather name="x" size={18} color={colors.textMuted} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm, paddingVertical: spacing.xs }}>
              <View style={{ backgroundColor: isDark ? '#1E293B' : '#EFF6FF', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: '#93C5FD' }}>
                <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: '#0066B3' }}>
                  Persyaratan Operasional Saksi BSN:
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 11, color: colors.text, marginTop: 2, lineHeight: 16 }}>
                  Sesuai Petunjuk Teknis DPP & Badan Saksi Nasional (BSN), relawan yang dimandatkan harus melengkapi 4 instrumen kepatuhan hukum sebelum dapat bertugas di TPS.
                </Text>
              </View>

              {/* 4 Syarat Checklist */}
              {[
                {
                  title: '1. Kelulusan Bimtek Saksi Pemilu',
                  desc: 'Modul pengawalan suara C1 Plano & Kode Etik BSN',
                  status: 'Tersertifikasi',
                  done: true,
                },
                {
                  title: '2. Verifikasi e-KTP & DPT TPS',
                  desc: 'Terdaftar di TPS 014 Kel. Babakan Asih, Bojongloa Kaler',
                  status: 'Terverifikasi',
                  done: true,
                },
                {
                  title: '3. Pakta Integritas Saksi PAN',
                  desc: 'Persetujuan digital pakta komitmen saksi TPS jujur & adil',
                  status: 'Ditandatangani Digital',
                  done: true,
                },
                {
                  title: '4. SK Surat Mandat Resmi DPD',
                  desc: 'No: SK.MANDAT/PAN-BDG/2024/0419 tertanda Ketua DPD',
                  status: 'Terbit & Sah',
                  done: true,
                },
              ].map((item, idx) => (
                <View
                  key={idx}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    gap: 10,
                    padding: 10,
                    borderRadius: 8,
                    backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Feather name="check-circle" size={18} color="#16A34A" style={{ marginTop: 2 }} />
                  <View style={{ flex: 1, gap: 1 }}>
                    <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: colors.text }}>{item.title}</Text>
                    <Text style={{ fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted }}>{item.desc}</Text>
                    <View style={{ alignSelf: 'flex-start', backgroundColor: '#DCFCE7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4 }}>
                      <Text style={{ fontFamily: fonts.bold, fontSize: 10, color: '#16A34A' }}>{item.status}</Text>
                    </View>
                  </View>
                </View>
              ))}

              <View style={{ gap: spacing.xs, marginTop: spacing.sm }}>
                {!hasWitnessRole ? (
                  <PrimaryButton
                    label="Aktifkan Mandat Saksi TPS (State R2)"
                    variant="primary"
                    onPress={() => {
                      setUnlockSaksiModalVisible(false);
                      handleApplyVolunteerPreset('state_r2');
                    }}
                    style={{ width: '100%' }}
                  />
                ) : (
                  <PrimaryButton
                    label="Kembalikan ke Relawan Murni (State R1)"
                    variant="danger"
                    onPress={() => {
                      setUnlockSaksiModalVisible(false);
                      handleApplyVolunteerPreset('state_r1');
                    }}
                    style={{ width: '100%' }}
                  />
                )}
                <PrimaryButton
                  label="Tutup"
                  variant="secondary"
                  onPress={() => setUnlockSaksiModalVisible(false)}
                  style={{ width: '100%' }}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Role Switch Notice Dialog */}
      <ConfirmDialog
        visible={Boolean(roleSwitchNotice)}
        title="Mode Peran Berhasil Dialihkan"
        message={roleSwitchNotice || ''}
        tone="success"
        singleButton
        confirmLabel="Lanjutkan"
        onConfirm={() => setRoleSwitchNotice(null)}
      />

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        visible={confirmLogoutVisible}
        title="Konfirmasi Keluar"
        message="Apakah Anda yakin ingin keluar dari akun? Anda perlu masuk kembali untuk mengakses tugas dan laporan lapangan."
        tone="danger"
        confirmLabel="Ya, Keluar"
        cancelLabel="Batal"
        onConfirm={() => {
          setConfirmLogoutVisible(false);
          logout();
        }}
        onCancel={() => setConfirmLogoutVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },

  // Hero Profile Card
  heroCard: {
    padding: spacing.md,
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#0066B3',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  verifiedTagText: {
    fontFamily: fonts.semiBold,
    fontSize: 10,
    color: '#059669',
  },
  userContactText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    marginTop: 2,
  },

  // e-KTA Pass Bar
  ktaPassBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  passBarTitle: {
    fontFamily: fonts.bold,
    fontSize: 9.5,
    letterSpacing: 0.5,
  },
  passBarNumber: {
    fontFamily: fonts.extraBold,
    fontSize: 12,
  },
  openKtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.md,
  },
  openKtaBtnText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: '#FFFFFF',
  },
  openKtaBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  openKtaBtnOutlineText: {
    fontFamily: fonts.bold,
    fontSize: 11,
  },
  upgradeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  upgradeBannerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: '#FEF3C7',
  },
  upgradeBannerActionText: {
    fontFamily: fonts.bold,
    fontSize: 10.5,
    color: '#B45309',
  },
  volunteerBadgeCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Role Chip on Hero Card
  activeRoleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  activeRoleChipText: {
    fontFamily: fonts.bold,
    fontSize: 11,
  },
  changeRoleChipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  changeRoleChipText: {
    fontFamily: fonts.semiBold,
    fontSize: 10.5,
  },

  // Multi-Role Quick Banner
  multiRoleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  multiRoleBannerIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  multiRoleBannerTitle: {
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  multiRoleBannerSub: {
    fontFamily: fonts.regular,
    fontSize: 11,
  },
  roleCountBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: radius.pill,
  },
  roleCountText: {
    fontFamily: fonts.bold,
    fontSize: 9.5,
    color: '#FFFFFF',
  },
  switchBadgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  switchBadgeText: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
  },

  // Role Cards in Modal
  roleModalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1.5,
  },
  roleIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleCardTitle: {
    fontFamily: fonts.bold,
    fontSize: 12.5,
  },
  roleCardScope: {
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  activeRolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  activeRoleText: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: '#FFFFFF',
  },
  switchRoleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  switchRoleText: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
  },

  // Grouped Menu Cards
  menuCard: {
    padding: spacing.md,
    gap: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  cardSectionHeading: {
    fontFamily: fonts.bold,
    fontSize: 12.5,
    marginBottom: 2,
  },
  rowDivider: {
    height: 1,
  },

  // Info Rows
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  infoRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontFamily: fonts.medium,
    fontSize: 11.5,
  },
  infoValue: {
    fontFamily: fonts.semiBold,
    fontSize: 11.5,
  },

  // Action Menu Rows
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 3,
  },
  actionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 12.5,
  },
  actionSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 10.5,
  },

  // Logout Button
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    width: '100%',
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  logoutBtnText: {
    fontFamily: fonts.bold,
    fontSize: 12.5,
    color: '#DC2626',
  },
  versionFooter: {
    fontFamily: fonts.regular,
    fontSize: 10.5,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalContentCard: {
    width: '100%',
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.xs,
  },
  modalTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSize.sm,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalActionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: radius.md,
    marginTop: spacing.xs,
  },
  modalActionBtnText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: '#FFFFFF',
  },

  // Timeline
  timelineRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  timelineIndicatorCol: {
    alignItems: 'center',
    width: 22,
  },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginVertical: 2,
  },
  volunteerSkillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  volunteerSkillChipText: {
    fontFamily: fonts.bold,
    fontSize: 10.5,
  },
  volunteerInterestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  volunteerInterestChipText: {
    fontFamily: fonts.medium,
    fontSize: 10.5,
  },
  volunteerStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: spacing.xs,
  },
  volunteerStatItem: {
    alignItems: 'center',
    gap: 2,
  },
  volunteerStatValue: {
    fontFamily: fonts.extraBold,
    fontSize: 16,
  },
  volunteerStatLabel: {
    fontFamily: fonts.medium,
    fontSize: 10,
  },
  statDivider: {
    width: 1,
    height: 28,
  },
  coordinatorContactBox: {
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: spacing.xs,
  },
  viewTimelineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: spacing.xs,
  },
  viewTimelineBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
  },
  modalTabRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 10,
  },
  modalTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  modalTabText: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  lockedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  lockedPillText: {
    fontFamily: fonts.semiBold,
    fontSize: 10,
    color: '#B45309',
  },
  eligibilityHint: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: '#D97706',
    marginTop: 2,
  },
  presetCard: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  presetTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  presetName: {
    fontFamily: fonts.bold,
    fontSize: 13,
    flex: 1,
  },
  presetBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  presetBadgeText: {
    fontFamily: fonts.semiBold,
    fontSize: 10,
  },
  presetDesc: {
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 8,
  },
  presetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  presetRolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  presetRoleText: {
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  activePillSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  activePillSmallText: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: '#FFFFFF',
  },
  applyText: {
    fontFamily: fonts.bold,
    fontSize: 11,
  },
  volunteerSectionNotice: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 4,
  },
});
