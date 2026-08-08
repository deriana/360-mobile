import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Card, Pill, PrimaryButton, SectionTitle } from '../components/ui';
import { fontSize, iconStrokeWidth, radius, shadow, spacing } from '../theme';
import { getUserProfile } from '../utils/scope';
import { BRAND_ASSETS, getWitnessAvatar } from '../data/images';

export default function ProfileScreen({ navigation }: any) {
  const { role } = useApp();
  const { colors } = useTheme();

  const profile = getUserProfile(role);

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* Official Personnel Digital ID Card Container */}
      <Card style={[styles.idCardContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {/* ID Card Header */}
        <View style={[styles.cardHeader, { backgroundColor: '#0A192F' }]}>
          <Image source={BRAND_ASSETS.fullLogo} style={styles.cardLogo} resizeMode="contain" />
          <View style={styles.cardHeaderBadge}>
            <Text style={styles.cardHeaderText}>KARTU PETUGAS</Text>
          </View>
        </View>

        {/* Card Body */}
        <View style={styles.cardBody}>
          <View style={styles.photoRow}>
            <Image source={{ uri: getWitnessAvatar(profile.avatarIndex) }} style={styles.profileAvatar} />
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[styles.profileName, { color: colors.text }]}>{profile.name}</Text>
              <Pill label={profile.roleLabel} tone="primary" />
              <Text style={[styles.badgeIdText, { color: colors.textMuted }]}>ID: {profile.badgeId}</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Personnel Details */}
          <View style={{ gap: spacing.sm }}>
            <DetailRow icon="credit-card" label="NIK" value={profile.nik} />
            <DetailRow icon="phone" label="No. WhatsApp / HP" value={profile.phone} />
            <DetailRow icon="mail" label="Email Akun" value={profile.email} />
            <DetailRow icon="map-pin" label="Lokasi Penugasan" value={profile.scopeLocation} />
            <DetailRow icon="shield" label="Status Autentikasi" value="TERVERIFIKASI SAKSI 360" isSuccess />
          </View>
        </View>

        {/* QR Verification Footer */}
        <View style={[styles.cardFooter, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.footerTitle, { color: colors.text }]}>Verifikasi Resmi Mandat</Text>
            <Text style={[styles.footerSub, { color: colors.textMuted }]}>
              Pindai QR Code ini oleh Pengawas / KPPS untuk memvalidasi identitas saksi.
            </Text>
          </View>
          <View style={[styles.qrPlaceholder, { backgroundColor: colors.primaryLight }]}>
            <Feather name="grid" size={28} color={colors.primary} strokeWidth={iconStrokeWidth} />
          </View>
        </View>
      </Card>

      {/* Profile Actions */}
      <Card style={{ gap: spacing.sm }}>
        <SectionTitle style={{ marginBottom: 2 }}>Aksi Petugas Lapangan</SectionTitle>

        <PrimaryButton
          label="Tunjukkan Surat Tugas Digital (E-Mandat)"
          icon="file-text"
          onPress={() => navigation.navigate('AssignmentLetter', { witnessId: 'SAKSI-001' })}
        />

        <PrimaryButton
          label="Kembali ke Dashboard Utama"
          icon="home"
          variant="secondary"
          onPress={() => navigation.goBack()}
        />
      </Card>
    </ScrollView>
  );
}

function DetailRow({ icon, label, value, isSuccess }: { icon: keyof typeof Feather.glyphMap; label: string; value: string; isSuccess?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={styles.detailRow}>
      <View style={[styles.detailIconBox, { backgroundColor: isSuccess ? colors.successBg : colors.primaryLight }]}>
        <Feather name={icon} size={14} color={isSuccess ? colors.success : colors.primary} strokeWidth={iconStrokeWidth} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{label}</Text>
        <Text style={[styles.detailValue, { color: isSuccess ? colors.success : colors.text }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl + 40 },
  idCardContainer: { padding: 0, overflow: 'hidden', borderRadius: radius.xl, borderWidth: 1, ...shadow.lg },
  cardHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLogo: { width: 140, height: 36 },
  cardHeaderBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill, backgroundColor: '#E60012' },
  cardHeaderText: { fontSize: 10, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.5 },
  cardBody: { padding: spacing.lg, gap: spacing.md },
  photoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  profileAvatar: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: '#E60012' },
  profileName: { fontSize: fontSize.lg, fontWeight: '800' },
  badgeIdText: { fontSize: 11, fontWeight: '700' },
  divider: { height: 1, width: '100%' },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  detailIconBox: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  detailLabel: { fontSize: 11 },
  detailValue: { fontSize: fontSize.sm, fontWeight: '700' },
  cardFooter: { padding: spacing.md, borderTopWidth: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  footerTitle: { fontSize: fontSize.xs, fontWeight: '800' },
  footerSub: { fontSize: 10, marginTop: 2 },
  qrPlaceholder: { width: 52, height: 52, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
});
