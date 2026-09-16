import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Card, Pill } from './ui';
import { fonts, fontSize, iconStrokeWidth, radius, shadow, spacing } from '../theme';
import { BRAND_ASSETS } from '../data/images';

export interface PersonnelIdCardRow {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
  isSuccess?: boolean;
}

export interface PersonnelIdCardProps {
  name: string;
  roleLabel: string;
  badgeId: string;
  avatarSource: any;
  rows: PersonnelIdCardRow[];
  footerNote: string;
}

export function PersonnelIdCard({ name, roleLabel, badgeId, avatarSource, rows, footerNote }: PersonnelIdCardProps) {
  const { colors } = useTheme();

  return (
    <Card style={[styles.idCardContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.cardHeader, { backgroundColor: '#0066B3' }]}>
        <Image source={BRAND_ASSETS.official} style={{ width: 48, height: 48 }} resizeMode="contain" />
        <View style={styles.cardHeaderBadge}>
          <Text style={styles.cardHeaderText}>KARTU PETUGAS</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.photoRow}>
          <Image source={avatarSource} style={styles.profileAvatar} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={[styles.profileName, { color: colors.text }]}>{name}</Text>
            <Pill label={roleLabel} tone="primary" />
            <Text style={[styles.badgeIdText, { color: colors.textMuted }]}>ID: {badgeId}</Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={{ gap: spacing.sm }}>
          {rows.map((row) => (
            <DetailRow key={row.label} {...row} />
          ))}
        </View>
      </View>

      <View style={[styles.cardFooter, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.footerTitle, { color: colors.text }]}>Verifikasi Resmi Mandat</Text>
          <Text style={[styles.footerSub, { color: colors.textMuted }]}>{footerNote}</Text>
        </View>
        <View style={[styles.qrPlaceholder, { backgroundColor: colors.primaryLight }]}>
          <Feather name="grid" size={28} color={colors.primary} strokeWidth={iconStrokeWidth} />
        </View>
      </View>
    </Card>
  );
}

function DetailRow({ icon, label, value, isSuccess }: PersonnelIdCardRow) {
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
  idCardContainer: { padding: 0, overflow: 'hidden', borderRadius: radius.xl, borderWidth: 1, ...shadow.lg },
  cardHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLogo: { width: 140, height: 36 },
  cardHeaderBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill, backgroundColor: '#004F8A' },
  cardHeaderText: { fontFamily: fonts.bold, fontSize: 10, color: '#FFFFFF', letterSpacing: 0.5 },
  cardBody: { padding: spacing.lg, gap: spacing.md },
  photoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  profileAvatar: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: '#0066B3' },
  profileName: { fontFamily: fonts.bold, fontSize: fontSize.lg },
  badgeIdText: { fontFamily: fonts.bold, fontSize: 11 },
  divider: { height: 1, width: '100%' },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  detailIconBox: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  detailLabel: { fontFamily: fonts.medium, fontSize: 11 },
  detailValue: { fontFamily: fonts.bold, fontSize: fontSize.sm },
  cardFooter: { padding: spacing.md, borderTopWidth: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  footerTitle: { fontFamily: fonts.bold, fontSize: fontSize.xs },
  footerSub: { fontFamily: fonts.regular, fontSize: 10, marginTop: 2 },
  qrPlaceholder: { width: 52, height: 52, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
});
