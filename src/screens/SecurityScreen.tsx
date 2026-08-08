import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Card, EmptyState } from '../components/ui';
import { fontSize, iconSize, iconStrokeWidth, radius, spacing } from '../theme';
import { ROLE_PERMISSIONS } from '../utils/scope';

const ITEMS: Array<{ icon: keyof typeof Feather.glyphMap; title: string; body: string }> = [
  { icon: 'lock', title: 'Enkripsi End-to-End Data', body: 'Seluruh payload data C1 dan presensi dienkripsi dengan standar AES-256 saat transmisi & tersimpan.' },
  { icon: 'key', title: 'Autentikasi Dua Faktor (2FA)', body: 'Proteksi verifikasi tambahan melalui OTP SMS / WhatsApp pada perangkat saksi terdaftar.' },
  { icon: 'layers', title: 'Hak Akses Berjenjang Sesuai Wilayah', body: 'Setiap peran (DPP, DPW, DPD, DPC) hanya dapat mengakses data statistik pada lingkup otoritas wilayahnya.' },
  { icon: 'file-text', title: 'Log Audit Imutabel', body: 'Seluruh riwayat aksi input, koreksi, dan persetujuan data tercatat beserta timestamp & ID pelaku.' },
  { icon: 'cloud', title: 'Backup Redundan Otomatis', body: 'Penyimpanan terdistribusi yang selalu dicadangkan real-time untuk mencegah kehilangan data.' },
];

export default function SecurityScreen() {
  const { role } = useApp();
  const { colors } = useTheme();

  const permissions = ROLE_PERMISSIONS[role];

  if (!permissions.canAccessSecurity) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background, padding: spacing.lg }]}>
        <EmptyState
          title="Akses Terbatas Admin System"
          body="Modul Audit Log, Konfigurasi Keamanan & Trust System hanya dapat diakses oleh Super Admin DPP Pusat."
          icon="shield-off"
        />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: colors.primaryLight }]}>
          <Feather name="shield" size={14} color={colors.primary} strokeWidth={iconStrokeWidth} />
          <Text style={[styles.badgeText, { color: colors.primary }]}>Keamanan Sistem</Text>
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Keamanan & Kepercayaan</Text>
        <Text style={[styles.disclaimer, { color: colors.textMuted }]}>
          Sistem SAKSI 360 dirancang sesuai standar keamanan data pemilu terenkripsi.
        </Text>
      </View>

      {ITEMS.map((item) => (
        <Card key={item.title} style={styles.row}>
          <View style={[styles.iconWrap, { backgroundColor: colors.primaryLight }]}>
            <Feather name={item.icon} size={iconSize.lg} color={colors.primary} strokeWidth={iconStrokeWidth} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.body, { color: colors.textMuted }]}>{item.body}</Text>
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },
  header: { gap: 4 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  badgeText: { fontSize: fontSize.xs, fontWeight: '700' },
  title: { fontSize: fontSize.xl, fontWeight: '800' },
  disclaimer: { fontSize: fontSize.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontSize: fontSize.sm, fontWeight: '700' },
  body: { fontSize: fontSize.xs, lineHeight: 18 },
});
