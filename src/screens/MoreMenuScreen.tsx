import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { fontSize, iconSize, iconStrokeWidth, radius, shadow, spacing } from '../theme';
import { CURRENT_WITNESS_ID, ROLE_LABEL, ROLE_PERMISSIONS, ROLE_SCOPE_DESCRIPTION } from '../utils/scope';

interface MenuItem {
  key: string;
  icon: keyof typeof Feather.glyphMap;
  label: string;
  desc: string;
  badge?: string;
  params?: any;
}

export default function MoreMenuScreen({ navigation }: any) {
  const { role, logout } = useApp();
  const { colors, isDark, toggleTheme } = useTheme();

  const permissions = ROLE_PERMISSIONS[role];

  // Dynamically filter menu items per role according to RBAC matrix
  const getRoleMenuItems = (): MenuItem[] => {
    if (role === 'TPS_WITNESS') {
      return [
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
        {
          key: 'Supervision',
          icon: 'grid',
          label: 'Pengawasan TPS Kota Bandung',
          desc: 'Monitoring status & presensi saksi TPS se-Kota Bandung',
        },
        {
          key: 'KtpOcr',
          icon: 'credit-card',
          label: 'Scan / Foto KTP Saksi (AI OCR)',
          desc: 'Ekstraksi otomatis NIK, Nama, Tanggal Lahir, & Alamat',
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
          key: 'Documentation',
          icon: 'image',
          label: 'Dokumentasi Kegiatan TPS',
          desc: 'Unggah foto bukti pendampingan lapangan',
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
        {
          key: 'Supervision',
          icon: 'grid',
          label: 'Pengawasan 6 TPS Kluster',
          desc: 'Monitoring status & presensi 6 TPS binaan kluster',
        },
        {
          key: 'KtpOcr',
          icon: 'credit-card',
          label: 'Scan / Foto KTP Saksi (AI OCR)',
          desc: 'Ekstraksi otomatis NIK, Nama, Tanggal Lahir, & Alamat',
        },
        {
          key: 'EmergencyList',
          icon: 'alert-triangle',
          label: 'Laporan Darurat Kluster TPS',
          desc: 'Monitoring laporan kendala dari 6 saksi binaan',
        },
        {
          key: 'Documentation',
          icon: 'image',
          label: 'Dokumentasi Kegiatan TPS',
          desc: 'Unggah foto bukti supervisi kluster',
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

    const items: MenuItem[] = [];

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
      {/* Role & Scope Header */}
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
          onPress={() => navigation.navigate(item.key, item.params)}
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
        <View style={[styles.iconWrap, { backgroundColor: colors.dangerBg }]}>
          <Feather name="log-out" size={iconSize.md} color={colors.danger} strokeWidth={iconStrokeWidth} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.rowTitle, { color: colors.danger }]}>Keluar Sesi (Logout)</Text>
          <Text style={[styles.rowDesc, { color: colors.textMuted }]}>Kembali ke halaman autentikasi</Text>
        </View>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl + 40, gap: spacing.sm },
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
