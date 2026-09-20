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
import { getActiveWitnessScope } from '../utils/witnessResolver';

export default function ProfileScreen({ navigation }: any) {
  const {
    role,
    switchActiveRole,
    switchOperationalRoleWithGuard,
    applyCareerStatePreset,
    applyVolunteerStatePreset,
    currentUser,
    witnesses,
    tps,
    setVolunteerPause,
    cancelMembershipResignation,
    logout,
  } = useApp();
  const { colors, isDark } = useTheme();

  const [confirmLogoutVisible, setConfirmLogoutVisible] = useState(false);
  const [roleSwitchNotice, setRoleSwitchNotice] = useState<string | null>(null);
  const [activityModalVisible, setActivityModalVisible] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [roleModalTab, setRoleModalTab] = useState<'roles' | 'presets'>('roles');

  const user = currentUser.identity;
  const officialMembership = currentUser.memberships.find((m) => m.type === 'member');
  const hasOfficialMembership = Boolean(officialMembership);
  const isOfficialMember = hasOfficialMembership;
  const currentMembership = officialMembership || currentUser.memberships[0];

  const dims = currentUser.dimensions || {
    membership: 'active',
    volunteer: 'active',
  };

  // Cadre / Official Member dimension statuses
  const isResignationRequested = dims.membership === 'resignation_requested' || Boolean(currentUser.resignationRequest);
  const isMembershipInactive = dims.membership === 'inactive';

  // Volunteer dimension statuses
  const isVolunteerPaused = dims.volunteer === 'paused' || Boolean(currentUser.volunteerPauseInfo?.isPaused);
  const isVolunteerInactive = dims.volunteer === 'inactive';

  // Scoped non-active status by track:
  // If Official Member: only evaluate membership dimension (resignation or inactive).
  // If Pure Volunteer: only evaluate volunteer dimension (paused or inactive).
  const isNonActiveStatus = hasOfficialMembership
    ? (isResignationRequested || isMembershipInactive)
    : (isVolunteerPaused || isVolunteerInactive);

  const statusDotColor = hasOfficialMembership
    ? (isResignationRequested ? '#F59E0B' : isMembershipInactive ? colors.danger : colors.success)
    : (isVolunteerPaused ? '#F59E0B' : isVolunteerInactive ? colors.danger : colors.success);

  const getAlertConfig = () => {
    if (hasOfficialMembership) {
      // CADRE / OFFICIAL MEMBER ALERTS
      if (isResignationRequested) {
        return {
          cardBg: isDark ? 'rgba(245, 158, 11, 0.12)' : '#FFFBEB',
          borderColor: isDark ? '#B45309' : '#FDE68A',
          iconBg: isDark ? 'rgba(245, 158, 11, 0.25)' : '#FEF3C7',
          icon: 'clock' as const,
          iconColor: '#D97706',
          title: 'Pengunduran Diri Diproses',
          titleColor: isDark ? '#FDE047' : '#92400E',
          badge: 'REVIEW DPD',
          pillBg: isDark ? 'rgba(245, 158, 11, 0.3)' : '#FEF3C7',
          pillText: '#B45309',
          description: 'Pengajuan pengunduran diri keanggotaan Anda sedang ditinjau administrasi DPD PAN. Hak suara permusyawaratan dibekukan sementara.',
          descColor: isDark ? '#FDE047' : '#78350F',
          btnText: 'Batalkan Resign',
          btnIcon: 'rotate-ccw' as const,
          btnBg: '#0284C7',
          onPrimaryAction: () => {
            cancelMembershipResignation();
            setRoleSwitchNotice('Pengajuan pengunduran diri dibatalkan. Status keanggotaan tetap Aktif Penuh.');
          },
          secondaryText: 'Detail Status',
        };
      }

      if (isMembershipInactive) {
        return {
          cardBg: isDark ? 'rgba(239, 68, 68, 0.12)' : '#FEF2F2',
          borderColor: isDark ? '#991B1B' : '#FECACA',
          iconBg: isDark ? 'rgba(239, 68, 68, 0.25)' : '#FEE2E2',
          icon: 'shield-off' as const,
          iconColor: '#DC2626',
          title: 'Keanggotaan Nonaktif',
          titleColor: isDark ? '#FCA5A5' : '#991B1B',
          badge: 'NONAKTIF',
          pillBg: isDark ? 'rgba(239, 68, 68, 0.3)' : '#FEE2E2',
          pillText: '#991B1B',
          description: 'Status keanggotaan resmi partai Anda saat ini tidak aktif. Silakan hubungi Sekretariat DPD PAN untuk pembaruan data.',
          descColor: isDark ? '#FECACA' : '#7F1D1D',
          btnText: undefined,
          btnIcon: undefined,
          btnBg: undefined,
          onPrimaryAction: undefined,
          secondaryText: 'Detail Keanggotaan',
        };
      }
    } else {
      // PURE VOLUNTEER TRACK ALERTS
      if (isVolunteerPaused) {
        const pauseInfo = currentUser.volunteerPauseInfo;
        const durationLabel = pauseInfo?.durationMonths ? `${pauseInfo.durationMonths} Bulan` : '3 Bulan';
        const reasonLabel = pauseInfo?.reason || 'Cuti terencana';
        return {
          cardBg: isDark ? 'rgba(245, 158, 11, 0.12)' : '#FFFBEB',
          borderColor: isDark ? '#B45309' : '#FDE68A',
          iconBg: isDark ? 'rgba(245, 158, 11, 0.25)' : '#FEF3C7',
          icon: 'pause-circle' as const,
          iconColor: '#D97706',
          title: 'Masa Cuti Relawan Aktif',
          titleColor: isDark ? '#FDE047' : '#92400E',
          badge: 'CUTI SEMENTARA',
          pillBg: isDark ? 'rgba(245, 158, 11, 0.3)' : '#FEF3C7',
          pillText: '#B45309',
          description: `Partisipasi tugas lapangan Anda sedang dijeda (${durationLabel} • ${reasonLabel}). Penugasan baru dinonaktifkan tanpa menghapus portofolio Anda.`,
          descColor: isDark ? '#FDE047' : '#78350F',
          btnText: 'Aktifkan Kembali',
          btnIcon: 'play' as const,
          btnBg: '#D97706',
          onPrimaryAction: () => {
            setVolunteerPause({ isPaused: false });
            setRoleSwitchNotice('Status kerelawanan aktif kembali! Penugasan lapangan dan bursa aksi siap diterima.');
          },
          secondaryText: 'Atur Masa Jeda',
        };
      }

      if (isVolunteerInactive) {
        return {
          cardBg: isDark ? 'rgba(239, 68, 68, 0.12)' : '#FEF2F2',
          borderColor: isDark ? '#991B1B' : '#FECACA',
          iconBg: isDark ? 'rgba(239, 68, 68, 0.25)' : '#FEE2E2',
          icon: 'user-x' as const,
          iconColor: '#DC2626',
          title: 'Status Kerelawanan Nonaktif',
          titleColor: isDark ? '#FCA5A5' : '#991B1B',
          badge: 'NONAKTIF',
          pillBg: isDark ? 'rgba(239, 68, 68, 0.3)' : '#FEE2E2',
          pillText: '#991B1B',
          description: 'Anda sedang tidak aktif dalam kegiatan relawan lapangan. Rekam jejak tugas dan sertifikat bimtek tetap tersimpan utuh di simPAN.',
          descColor: isDark ? '#FECACA' : '#7F1D1D',
          btnText: 'Aktifkan Relawan',
          btnIcon: 'rotate-ccw' as const,
          btnBg: '#DC2626',
          onPrimaryAction: () => {
            setVolunteerPause({ isPaused: false });
            setRoleSwitchNotice('Status kerelawanan berhasil diaktifkan kembali!');
          },
          secondaryText: 'Detail Partisipasi',
        };
      }
    }

    return null;
  };

  const alertConfig = getAlertConfig();

  const activeScope = getActiveWitnessScope(currentUser, witnesses, tps);
  const activeAssignment = currentUser.roles.find((r) => r.role === role) ?? currentUser.roles[0];
  const activityTimeline = ROLE_ACTIVITY_TIMELINE[user.email] || ROLE_ACTIVITY_TIMELINE['saksi@pan.go.id'] || [];
  const hasWitnessRole = currentUser.roles.some((r) => r.role === 'WITNESS') || currentUser.dimensions?.programs?.programSaksi === 'MANDATED';

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
            <View style={[styles.onlineDot, { backgroundColor: statusDotColor }]} />
          </View>

          <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
              <Text style={[styles.userName, { color: colors.text, flex: 1 }]} numberOfLines={1} ellipsizeMode="tail">
                {user.name}
              </Text>
              {isMultiRole && (
                <Pressable
                  onPress={() => setRoleModalVisible(true)}
                  style={({ pressed }) => [
                    styles.changeRoleChipBtn,
                    { backgroundColor: colors.primaryLight, borderColor: colors.primary, flexShrink: 0 },
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
                <Text style={[styles.activeRoleChipText, { color: colors.primary }]}>
                  {getRoleFriendlyName(role as MobileRole)}
                </Text>
              </View>
            </View>

            <Text style={[styles.userContactText, { color: colors.textMuted }]} numberOfLines={1} ellipsizeMode="tail">
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
            {isOfficialMember ? (
              <Image source={BRAND_ASSETS.official} style={{ width: 28, height: 28 }} resizeMode="contain" />
            ) : (
              <View style={[styles.volunteerBadgeCircle, { backgroundColor: colors.primary }]}>
                <Feather name="shield" size={14} color="#FFFFFF" />
              </View>
            )}
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <Text style={[styles.passBarTitle, { color: colors.textMuted }]} numberOfLines={1}>
                  {isOfficialMember ? 'e-KTA simPAN Digital' : 'ID RELAWAN SIMPATISAN'}
                </Text>
                {isNonActiveStatus && (
                  <View
                    style={[
                      styles.passStatusTag,
                      {
                        backgroundColor:
                          (hasOfficialMembership ? isResignationRequested : isVolunteerPaused)
                            ? isDark ? 'rgba(245,158,11,0.25)' : '#FEF3C7'
                            : isDark ? 'rgba(239,68,68,0.25)' : '#FEE2E2',
                        borderColor:
                          (hasOfficialMembership ? isResignationRequested : isVolunteerPaused) ? '#F59E0B' : '#EF4444',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.passStatusTagText,
                        {
                          color:
                            (hasOfficialMembership ? isResignationRequested : isVolunteerPaused)
                              ? isDark ? '#FDE047' : '#B45309'
                              : isDark ? '#FCA5A5' : '#DC2626',
                        },
                      ]}
                    >
                      {hasOfficialMembership
                        ? isResignationRequested
                          ? 'PROSES RESIGN'
                          : 'NONAKTIF'
                        : isVolunteerPaused
                        ? 'CUTI SEMENTARA'
                        : 'NONAKTIF'}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={[styles.passBarNumber, { color: colors.text }]} numberOfLines={1} ellipsizeMode="tail">
                {isOfficialMember
                  ? officialMembership?.ktaNumber || '32.73.01.2024.08912'
                  : currentMembership?.ktaNumber || 'REL-3273-2024-0042'}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 0 }}>
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

        {/* Informasi Wilayah & Keanggotaan Terpadu */}
        <View
          style={[
            styles.heroInfoBox,
            {
              backgroundColor: isDark ? 'rgba(0, 43, 82, 0.22)' : '#F8FAFC',
              borderColor: isDark ? 'rgba(10, 61, 107, 0.5)' : '#E2E8F0',
            },
          ]}
        >
          <View style={styles.heroInfoRow}>
            <View style={styles.heroInfoRowLeft}>
              <View style={[styles.heroInfoIconCircle, { backgroundColor: colors.primaryLight }]}>
                <Feather name="map-pin" size={11} color={colors.primary} />
              </View>
              <Text style={[styles.heroInfoLabel, { color: colors.textMuted }]}>Struktur Wilayah</Text>
            </View>
            <View style={styles.heroInfoValueCol}>
              <Text
                style={[styles.heroInfoValueMain, { color: colors.text }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {currentMembership?.dpd || 'DPD PAN Kota Bandung'}
              </Text>
              <Text
                style={[styles.heroInfoValueSub, { color: colors.textMuted }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {currentMembership?.dpc || 'DPC Coblong'}
              </Text>
            </View>
          </View>

          <View style={[styles.heroInfoDivider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0' }]} />

          <View style={styles.heroInfoRow}>
            <View style={styles.heroInfoRowLeft}>
              <View style={[styles.heroInfoIconCircle, { backgroundColor: colors.primaryLight }]}>
                <Feather name="calendar" size={11} color={colors.primary} />
              </View>
              <Text style={[styles.heroInfoLabel, { color: colors.textMuted }]}>Terdaftar Sejak</Text>
            </View>
            <Text style={[styles.heroInfoValue, { color: colors.text }]} numberOfLines={1}>
              {currentMembership?.registeredAt || '01 Maret 2024'}
            </Text>
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
              <Feather name="award" size={15} color="#D97706" />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ fontFamily: fonts.bold, fontSize: 11, color: '#B45309' }} numberOfLines={1}>
                  Ingin memiliki e-KTA Kader Resmi?
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 10, color: colors.textMuted }} numberOfLines={1} ellipsizeMode="tail">
                  Tingkatkan status keanggotaan simPAN resmi partai
                </Text>
              </View>
            </View>
            <View style={[styles.upgradeBannerAction, { flexShrink: 0 }]}>
              <Text style={styles.upgradeBannerActionText}>Ajukan</Text>
              <Feather name="arrow-right" size={11} color="#B45309" />
            </View>
          </Pressable>
        )}
      </Card>

      {/* 1.5 INFORMATIVE STATUS ALERT BANNER (Muncul ketika status akun selain aktif) */}
      {isNonActiveStatus && alertConfig && (
        <View
          style={[
            styles.statusAlertCard,
            {
              backgroundColor: alertConfig.cardBg,
              borderColor: alertConfig.borderColor,
            },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
            <View style={[styles.statusAlertIconWrap, { backgroundColor: alertConfig.iconBg }]}>
              <Feather name={alertConfig.icon} size={20} color={alertConfig.iconColor} />
            </View>

            <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
              <View style={styles.statusAlertHeaderRow}>
                <Text
                  style={[styles.statusAlertTitle, { color: alertConfig.titleColor }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {alertConfig.title}
                </Text>
                <View style={[styles.statusAlertPill, { backgroundColor: alertConfig.pillBg }]}>
                  <Text style={[styles.statusAlertPillText, { color: alertConfig.pillText }]}>
                    {alertConfig.badge}
                  </Text>
                </View>
              </View>

              <Text style={[styles.statusAlertDesc, { color: alertConfig.descColor }]}>
                {alertConfig.description}
              </Text>

              <View style={styles.statusAlertActionRow}>
                {alertConfig.onPrimaryAction && (
                  <Pressable
                    onPress={alertConfig.onPrimaryAction}
                    style={({ pressed }) => [
                      styles.statusAlertPrimaryBtn,
                      { backgroundColor: alertConfig.btnBg },
                      pressed && { opacity: 0.8 },
                    ]}
                  >
                    <Feather name={alertConfig.btnIcon as any} size={12} color="#FFFFFF" />
                    <Text style={styles.statusAlertPrimaryBtnText}>{alertConfig.btnText}</Text>
                  </Pressable>
                )}

                <Pressable
                  onPress={() => navigation.navigate('KelolaStatus')}
                  style={({ pressed }) => [
                    styles.statusAlertSecondaryBtn,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#FFFFFF',
                      borderColor: alertConfig.borderColor,
                    },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text style={[styles.statusAlertSecondaryBtnText, { color: alertConfig.titleColor }]}>
                    {alertConfig.secondaryText || 'Kelola Status'}
                  </Text>
                  <Feather name="chevron-right" size={12} color={alertConfig.titleColor} />
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* 2. KHUSUS RELAWAN: STATISTIK PENCAPAIAN, KEAHLIAN & KORLAP */}
      {!isOfficialMember && (
        <Card style={[styles.menuCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Feather name="activity" size={15} color={colors.primary} />
              <Text style={[styles.cardSectionHeading, { color: colors.text }]}>
                {role === 'WITNESS' ? 'Rekam Jejak & Mandat Lapangan' : 'Rekam Jejak Kerelawanan'}
              </Text>
            </View>
            <Pill
              label={role === 'WITNESS' ? 'Saksi Mandat BSN' : 'Relawan Terlatih'}
              tone="success"
            />
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
                  {currentUser.coordinatorContact?.name || 'Hendra Gunawan'}
                </Text>
                <Text style={{ fontFamily: fonts.medium, fontSize: 11, color: colors.primary }}>
                  Koordinator Lapangan • {currentUser.coordinatorContact?.phone || '0812-3456-7890'}
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 10, color: colors.textMuted }} numberOfLines={1}>
                  {currentUser.coordinatorContact?.posko || 'Posko Pemenangan Kec. Sumur Bandung'}
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
              Lihat Riwayat & Aktivitas Lapangan ({activityTimeline.length})
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

      {/* 3. LAYANAN & PENGATURAN */}
      <Card style={[styles.menuCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.cardSectionHeading, { color: colors.text }]}>Layanan & Pengaturan</Text>

        {/* Status & Peran Terpadu (Status, Portofolio & Tata Kelola) */}
        <Pressable
          onPress={() => navigation.navigate('StatusPeranSaya')}
          style={({ pressed }) => [styles.actionRow, pressed && { opacity: 0.7 }]}
        >
          <View style={[styles.actionIconWrap, { backgroundColor: isOfficialMember ? '#E0F2FE' : '#FEF3C7' }]}>
            <Feather
              name={isOfficialMember ? 'layers' : 'user-check'}
              size={15}
              color={isOfficialMember ? '#0066B3' : '#D97706'}
            />
          </View>
          <View style={{ flex: 1, gap: 1 }}>
            <Text style={[styles.actionTitle, { color: colors.text }]}>
              {isOfficialMember ? 'Status & Peran Kader' : 'Status & Partisipasi Relawan'}
            </Text>
            <Text style={[styles.actionSubtitle, { color: colors.textMuted }]}>
              {isOfficialMember
                ? 'Portofolio 7 dimensi, keabsahan e-KTA, dan tata kelola'
                : 'Portofolio tugas, akreditasi BSN Saksi, & tata kelola status'}
            </Text>
          </View>
          {isNonActiveStatus && (
            <View
              style={[
                styles.actionRowStatusPill,
                {
                  backgroundColor:
                    (hasOfficialMembership ? isResignationRequested : isVolunteerPaused)
                      ? isDark ? 'rgba(245,158,11,0.2)' : '#FEF3C7'
                      : isDark ? 'rgba(239,68,68,0.2)' : '#FEE2E2',
                  borderColor:
                    (hasOfficialMembership ? isResignationRequested : isVolunteerPaused) ? '#F59E0B' : '#EF4444',
                },
              ]}
            >
              <Text
                style={[
                  styles.actionRowStatusPillText,
                  {
                    color:
                      (hasOfficialMembership ? isResignationRequested : isVolunteerPaused)
                        ? isDark ? '#FDE047' : '#B45309'
                        : isDark ? '#FCA5A5' : '#DC2626',
                  },
                ]}
              >
                {hasOfficialMembership
                  ? isResignationRequested
                    ? 'Proses Resign'
                    : 'Nonaktif'
                  : isVolunteerPaused
                  ? 'Cuti'
                  : 'Nonaktif'}
              </Text>
            </View>
          )}
          <Feather name="chevron-right" size={16} color={colors.textMuted} />
        </Pressable>

        <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />

        {/* Surat Mandat Digital (Hanya untuk Saksi / Penugasan Saksi) */}
        {hasWitnessRole && (
          <>
            <Pressable
              onPress={() => navigation.navigate('AssignmentLetter', { witnessId: activeScope.witnessId, tpsId: activeScope.assignedTpsId })}
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
      {/* 4. TOMBOL LOGOUT & FOOTER APLIKASI */}
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
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                              <Feather name="alert-triangle" size={10} color="#D97706" />
                              <Text style={[styles.eligibilityHint, { marginTop: 0 }]} numberOfLines={1}>
                                {eligibility.reason}
                              </Text>
                            </View>
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
    minHeight: 34,
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
    minHeight: 34,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  openKtaBtnOutlineText: {
    fontFamily: fonts.bold,
    fontSize: 11,
  },

  // Hero Info Box (Struktur Wilayah & Terdaftar Sejak)
  heroInfoBox: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 9,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: 7,
  },
  heroInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  heroInfoRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  heroInfoIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroInfoLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  heroInfoValueCol: {
    flex: 1,
    minWidth: 0,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  heroInfoValueMain: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'right',
  },
  heroInfoValueSub: {
    fontFamily: fonts.medium,
    fontSize: 10,
    lineHeight: 14,
    textAlign: 'right',
    marginTop: 1,
  },
  heroInfoValue: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    flex: 1,
    textAlign: 'right',
  },
  heroInfoDivider: {
    height: 1,
    width: '100%',
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
    gap: 4,
    minHeight: 32,
    paddingHorizontal: 10,
    paddingVertical: 6,
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
    minHeight: 32,
    paddingHorizontal: 10,
    paddingVertical: 4,
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
    gap: 5,
    minHeight: 32,
    paddingHorizontal: 10,
    paddingVertical: 5,
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

  // Action Menu Rows
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 48,
    paddingVertical: 8,
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
    minHeight: 42,
    paddingVertical: 10,
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
  statusAlertCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  statusAlertIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statusAlertHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    flexWrap: 'wrap',
  },
  statusAlertTitle: {
    fontSize: 13,
    fontFamily: fonts.bold,
    flex: 1,
    minWidth: 140,
  },
  statusAlertPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.pill,
    flexShrink: 0,
  },
  statusAlertPillText: {
    fontSize: 9.5,
    fontFamily: fonts.bold,
  },
  statusAlertDesc: {
    fontSize: 11,
    fontFamily: fonts.regular,
    lineHeight: 16,
  },
  statusAlertActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  statusAlertPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.sm,
  },
  statusAlertPrimaryBtnText: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: '#FFFFFF',
  },
  statusAlertSecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  statusAlertSecondaryBtnText: {
    fontSize: 11,
    fontFamily: fonts.semiBold,
  },
  passStatusTag: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  passStatusTagText: {
    fontSize: 9,
    fontFamily: fonts.bold,
  },
  actionRowStatusPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    marginRight: 4,
  },
  actionRowStatusPillText: {
    fontSize: 9.5,
    fontFamily: fonts.bold,
  },
});
