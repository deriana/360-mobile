import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { fontSize, iconSize, iconStrokeWidth, radius, shadow, spacing } from '../theme';
import { CURRENT_WITNESS_ID, ROLE_LABEL, ROLE_PERMISSIONS, ROLE_SCOPE_DESCRIPTION, getUserProfile } from '../utils/scope';
import { BRAND_ASSETS, getWitnessAvatar } from '../data/images';
import { CandidateExplorerModal } from '../components/CandidateExplorerModal';

interface MenuItem {
  key: string;
  icon: keyof typeof Feather.glyphMap;
  label: string;
  desc: string;
  badge?: string;
  params?: any;
}

export default function MoreMenuScreen({ navigation }: any) {
  const { role, logout, witnesses } = useApp();
  const { colors, isDark, toggleTheme } = useTheme();
  const [showCandidateExplorer, setShowCandidateExplorer] = useState(false);

  const permissions = ROLE_PERMISSIONS[role];
  const userProfile = getUserProfile(role);
  const avatarUrl = getWitnessAvatar(userProfile.avatarIndex);
  const currentWitness = witnesses.find((w) => w.id === CURRENT_WITNESS_ID);

  // Dynamically filter menu items per role according to RBAC matrix
  const getRoleMenuItems = (): MenuItem[] => {
    const profileItem: MenuItem = {
      key: 'Profile',
      icon: 'user',
      label: 'Profil Akun Saya',
      desc: 'Kartu Identitas Petugas, NIK & Informasi Akun',
    };

    const candidateExplorerItem: MenuItem = {
      key: 'CandidateExplorer',
      icon: 'users',
      label: 'Profil Paslon & Caleg DPR RI',
      desc: 'Visi, misi, program unggulan, & rekam jejak kandidat Pemilu',
    };

    const partyLeaderboardItem: MenuItem = {
      key: 'PartyLeaderboard',
      icon: 'bar-chart-2',
      label: 'Partai & Legislatif',
      desc: 'Koalisi mana yang menang gede & anggota DPR RI terpilih',
    };

    const helpCenterItem: MenuItem = {
      key: 'HelpCenter',
      icon: 'help-circle',
      label: 'Pusat Bantuan',
      desc: 'FAQ seputar check-in, lapor C1, dokumentasi, & honorarium',
    };

    if (role === 'TPS_WITNESS') {
      return [
        profileItem,
        candidateExplorerItem,
        partyLeaderboardItem,
        helpCenterItem,
        {
          key: 'AssignmentLetter',
          icon: 'file-text',
          label: 'Surat Tugas Digital Saksi',
          desc: 'Lihat & tunjukkan mandat resmi ber-QR Code ke KPPS',
          params: { witnessId: CURRENT_WITNESS_ID },
        },
        {
          key: 'Payment',
          icon: 'dollar-sign',
          label: 'Status Honorarium Saksi',
          desc: 'Rincian status pembayaran (Dibayar / Belum)',
        },
        {
          key: 'EmergencyForm',
          icon: 'alert-triangle',
          label: 'Lapor Kejadian TPS',
          desc: 'Kirim laporan kendala / kecurangan ke koordinator',
        },
        {
          key: 'EmergencyList',
          icon: 'alert-circle',
          label: 'Cek Laporan Kendala TPS',
          desc: 'Pantau status laporan kendala di TPS Anda',
        },
        {
          key: 'Documentation',
          icon: 'image',
          label: 'Dokumentasi Kegiatan TPS',
          desc: 'Unggah foto persiapan, pemungutan, & penghitungan suara',
          params: { tpsId: currentWitness?.assignedTpsId },
        },
        {
          key: 'Broadcast',
          icon: 'inbox',
          label: 'Kotak Masuk Broadcast',
          desc: 'Instruksi & pengumuman resmi dari pusat komando',
        },
      ];
    }

    if (role === 'OPERATOR') {
      return [
        profileItem,
        {
          key: 'Supervision',
          icon: 'grid',
          label: 'Pengawasan TPS Kota Bandung',
          desc: 'Monitoring status & presensi saksi TPS se-Kota Bandung',
        },
        {
          key: 'CoordinatorList',
          icon: 'shield',
          label: 'Daftar Koordinator TPS',
          desc: 'Cek kehadiran, detail & kartu petugas koordinator binaan',
        },
        {
          key: 'WitnessList',
          icon: 'users',
          label: 'Daftar Saksi TPS',
          desc: 'Cek kehadiran, detail & kartu petugas saksi se-Kota Bandung',
        },
        partyLeaderboardItem,
        helpCenterItem,
        {
          key: 'KtpOcr',
          icon: 'credit-card',
          label: 'Scan / Foto KTP Saksi',
          desc: 'Pembacaan otomatis NIK, Nama, Tanggal Lahir, & Alamat',
        },
        {
          key: 'EmergencyForm',
          icon: 'alert-triangle',
          label: 'Lapor Kendala Lapangan',
          desc: 'Kirim laporan hambatan teknis operasional',
        },
        {
          key: 'EmergencyList',
          icon: 'alert-circle',
          label: 'Cek Laporan Kendala TPS',
          desc: 'Monitoring laporan kendala se-Kota Bandung',
        },
        {
          key: 'Broadcast',
          icon: 'inbox',
          label: 'Kotak Masuk Broadcast',
          desc: 'Instruksi & pengumuman resmi dari pusat komando',
        },
      ];
    }

    if (role === 'TPS_COORDINATOR') {
      return [
        profileItem,
        {
          key: 'Supervision',
          icon: 'grid',
          label: 'Pengawasan 6 TPS Kluster',
          desc: 'Monitoring status & presensi 6 TPS binaan kluster',
        },
        {
          key: 'WitnessList',
          icon: 'users',
          label: 'Daftar Saksi Kluster',
          desc: 'Cek kehadiran, detail & kartu petugas saksi binaan',
        },
        partyLeaderboardItem,
        helpCenterItem,
        {
          key: 'KtpOcr',
          icon: 'credit-card',
          label: 'Scan / Foto KTP Saksi',
          desc: 'Pembacaan otomatis NIK, Nama, Tanggal Lahir, & Alamat',
        },
        {
          key: 'EmergencyList',
          icon: 'alert-triangle',
          label: 'Laporan Darurat Kluster TPS',
          desc: 'Monitoring laporan kendala dari 6 saksi binaan',
        },
        {
          key: 'Broadcast',
          icon: 'inbox',
          label: 'Kotak Masuk Broadcast',
          desc: 'Instruksi & dokumen dari pusat komando',
        },
        {
          key: 'Payment',
          icon: 'dollar-sign',
          label: 'Status Honorarium Saksi Kluster',
          desc: 'Status pembayaran saksi binaan (Read-Only)',
        },
      ];
    }

    const items: MenuItem[] = [profileItem, partyLeaderboardItem, helpCenterItem];

    if (permissions.canAccessEmergencyList) {
      items.push({
        key: 'EmergencyList',
        icon: 'alert-triangle',
        label: 'Laporan Darurat Wilayah',
        desc: 'Monitoring kejadian & pelanggaran di lapangan',
      });
    }

    if (permissions.canAccessBroadcast) {
      items.push({
        key: 'Broadcast',
        icon: 'inbox',
        label: 'Kotak Masuk Broadcast',
        desc: 'Pesan & instruksi dari pusat komando',
      });
    }

    if (permissions.canAccessAllPayments) {
      items.push({
        key: 'Payment',
        icon: 'dollar-sign',
        label: 'Status Honorarium Saksi Wilayah',
        desc: 'Status pencairan honor saksi (Read-Only)',
      });
    }

    return items;
  };

  const menuItems = getRoleMenuItems();

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* Brand Logo Banner */}
      <View style={[styles.brandBanner, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: '#0A192F', alignItems: 'center', justifyContent: 'center' }}>
            <Image source={BRAND_ASSETS.emblem} style={{ width: 22, height: 22 }} resizeMode="contain" />
          </View>
          <Image
            source={BRAND_ASSETS.logoText}
            style={{ width: 95, height: 20, tintColor: colors.text }}
            resizeMode="contain"
          />
        </View>
        <View style={[styles.appVersionTag, { backgroundColor: colors.primaryLight }]}>
          <Text style={[styles.appVersionText, { color: colors.primary }]}>v1.0.0</Text>
        </View>
      </View>

      {/* Logged-In User Profile Card */}
      <Pressable
        onPress={() => navigation.navigate('Profile')}
        style={({ pressed }) => [
          styles.profileHeaderCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
          pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] },
        ]}
      >
        <View style={styles.profileAvatarWrapper}>
          <Image source={avatarUrl} style={styles.profileHeaderAvatar} />
          <View style={[styles.onlineDot, { backgroundColor: colors.success }]} />
        </View>

        <View style={{ flex: 1, gap: 2 }}>
          <View style={styles.profileHeaderTopRow}>
            <Text style={[styles.profileHeaderName, { color: colors.text }]}>{userProfile.name}</Text>
            <View style={[styles.badgeIdPill, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.badgeIdPillText, { color: colors.primary }]}>{userProfile.badgeId}</Text>
            </View>
          </View>
          <Text style={[styles.profileHeaderRole, { color: colors.primary }]}>{userProfile.roleLabel}</Text>
          <Text style={[styles.profileHeaderScope, { color: colors.textMuted }]}>
            📍 {userProfile.scopeLocation}
          </Text>
        </View>
        <Feather name="chevron-right" size={18} color={colors.textMuted} />
      </Pressable>

      {/* Role & Scope Description */}
      <View style={[styles.headerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.roleBadgeRow}>
          <View style={[styles.roleBadge, { backgroundColor: colors.primaryLight }]}>
            <Feather name="shield" size={14} color={colors.primary} strokeWidth={iconStrokeWidth} />
            <Text style={[styles.roleBadgeText, { color: colors.primary }]}>{ROLE_LABEL[role]}</Text>
          </View>
          <View style={styles.rbacBadge}>
            <Text style={styles.rbacText}>Status Terverifikasi</Text>
          </View>
        </View>
        <Text style={[styles.scopeDesc, { color: colors.textMuted }]}>
          {ROLE_SCOPE_DESCRIPTION[role]}
        </Text>
      </View>

      <Text style={[styles.menuTitle, { color: colors.text }]}>Menu & Fitur Peran</Text>

      {/* Main Navigation Items Filtered by Role */}
      {menuItems.map((item) => (
        <Pressable
          key={item.key}
          hitSlop={4}
          style={({ pressed }) => [
            styles.row,
            { backgroundColor: colors.surface, borderColor: colors.border },
            pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
          ]}
          onPress={() => {
            if (item.key === 'CandidateExplorer') {
              setShowCandidateExplorer(true);
            } else {
              navigation.navigate(item.key, item.params);
            }
          }}
        >
          <View style={[styles.iconWrap, { backgroundColor: colors.primaryLight }]}>
            <Feather name={item.icon} size={iconSize.md} color={colors.primary} strokeWidth={iconStrokeWidth} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>{item.label}</Text>
              {item.badge && (
                <View style={[styles.itemBadge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.itemBadgeText}>{item.badge}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.rowDesc, { color: colors.textMuted }]}>{item.desc}</Text>
          </View>
          <Feather name="chevron-right" size={iconSize.md} color={colors.textMuted} strokeWidth={iconStrokeWidth} />
        </Pressable>
      ))}

      {/* Dynamic Theme Toggle Row */}
      <Pressable
        hitSlop={4}
        style={({ pressed }) => [
          styles.row,
          { backgroundColor: colors.surface, borderColor: colors.border },
          pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
        ]}
        onPress={toggleTheme}
      >
        <View style={[styles.iconWrap, { backgroundColor: colors.primaryLight }]}>
          <Feather name={isDark ? 'sun' : 'moon'} size={iconSize.md} color={colors.primary} strokeWidth={iconStrokeWidth} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.rowTitle, { color: colors.text }]}>
            {isDark ? 'Mode Gelap (Dark Navy)' : 'Mode Terang (Light Mode)'}
          </Text>
          <Text style={[styles.rowDesc, { color: colors.textMuted }]}>
            Ketuk untuk beralih ke {isDark ? 'Mode Terang' : 'Mode Gelap'}
          </Text>
        </View>
        <Feather name="refresh-cw" size={16} color={colors.primary} strokeWidth={iconStrokeWidth} />
      </Pressable>

      {/* Logout Row */}
      <Pressable
        hitSlop={4}
        style={({ pressed }) => [
          styles.row,
          { backgroundColor: colors.surface, borderColor: colors.border, marginTop: spacing.xs },
          pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
        ]}
        onPress={logout}
      >
        <View style={[styles.iconWrap, { backgroundColor: isDark ? 'rgba(239,68,68,0.2)' : '#FEE2E2' }]}>
          <Feather name="log-out" size={iconSize.md} color={colors.danger} strokeWidth={iconStrokeWidth} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.rowTitle, { color: colors.danger }]}>Keluar Sesi (Logout)</Text>
          <Text style={[styles.rowDesc, { color: colors.textMuted }]}>Kembali ke halaman autentikasi</Text>
        </View>
      </Pressable>

      <CandidateExplorerModal
        visible={showCandidateExplorer}
        onClose={() => setShowCandidateExplorer(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xl, gap: spacing.sm },
  brandBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  brandLogoImg: { width: 120, height: 32 },
  appVersionTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.pill },
  appVersionText: { fontSize: 10, fontWeight: '800' },
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
  profileHeaderAvatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 1.5, borderColor: '#E60012' },
  onlineDot: { width: 12, height: 12, borderRadius: 6, position: 'absolute', bottom: 0, right: 0, borderWidth: 2, borderColor: '#FFFFFF' },
  profileHeaderTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  profileHeaderName: { fontSize: fontSize.sm, fontWeight: '800' },
  badgeIdPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.pill },
  badgeIdPillText: { fontSize: 9, fontWeight: '800' },
  profileHeaderRole: { fontSize: 11, fontWeight: '700' },
  profileHeaderScope: { fontSize: 10 },
  headerCard: { padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, gap: spacing.xs },
  roleBadgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  roleBadgeText: { fontSize: 11, fontWeight: '800' },
  rbacBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill, backgroundColor: '#F1F5F9' },
  rbacText: { fontSize: 10, fontWeight: '700', color: '#64748B' },
  scopeDesc: { fontSize: fontSize.xs },
  menuTitle: { fontSize: fontSize.sm, fontWeight: '700', marginTop: spacing.xs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    minHeight: 64,
    ...shadow.card,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: { fontSize: fontSize.sm, fontWeight: '700' },
  rowDesc: { fontSize: fontSize.xs, marginTop: 2 },
  itemBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 },
  itemBadgeText: { fontSize: 9, fontWeight: '800', color: '#FFFFFF' },
});
