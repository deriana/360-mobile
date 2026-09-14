import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Card, Pill, PrimaryButton } from '../components/ui';
import { BRAND_ASSETS } from '../data/images';
import { fontSize, iconStrokeWidth, radius, spacing } from '../theme';

export default function PartyLeaderboardScreen({ navigation }: any) {
  const { colors } = useTheme();

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Perolehan Suara PAN di Dapil</Text>
        <Text style={[styles.subTitle, { color: colors.textMuted }]}>
          Ringkasan tabulasi suara Partai Amanat Nasional wilayah pemilihan Jawa Barat I.
        </Text>
      </View>

      <Card style={styles.mainCard}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.brandGroup}>
            <Image source={BRAND_ASSETS.official} style={styles.brandLogo} resizeMode="contain" />
            <View>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Partai Amanat Nasional</Text>
              <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>Dapil Jabar I (Kota Bandung & Cimahi)</Text>
            </View>
          </View>
          <Pill label="Lolos PT 4%" tone="success" icon="check-circle" />
        </View>

        <View style={[styles.heroStatBox, { backgroundColor: colors.primary }]}>
          <View style={styles.heroTextCol}>
            <Text style={styles.heroLabel}>TOTAL SUARA PAN DAPIL</Text>
            <Text style={styles.heroValue}>128.450</Text>
            <Text style={styles.heroSub}>18.4% dari total suara sah di Dapil</Text>
          </View>
          <View style={styles.seatBadgeContainer}>
            <Text style={styles.seatNumber}>1</Text>
            <Text style={styles.seatLabel}>Kursi DPR RI</Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressLabelRow}>
            <Text style={[styles.progressTitle, { color: colors.text }]}>Target Pemenangan Dapil</Text>
            <Text style={[styles.progressPercent, { color: colors.primary }]}>85.6% (128.450 / 150.000)</Text>
          </View>
          <View style={[styles.progressBarTrack, { backgroundColor: colors.border }]}>
            <View style={[styles.progressBarFill, { width: '85.6%', backgroundColor: colors.primary }]} />
          </View>
        </View>

        <View style={[styles.breakdownBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.breakdownHeader, { color: colors.text }]}>Rincian Kontribusi Suara</Text>

          <View style={[styles.statRow, { borderBottomColor: colors.border }]}>
            <View style={styles.statLeft}>
              <View style={[styles.bullet, { backgroundColor: colors.primary }]} />
              <Text style={[styles.statName, { color: colors.text }]}>Dr. H. Ahmad Fauzi, M.Si. (No. 1)</Text>
            </View>
            <Text style={[styles.statNum, { color: colors.text }]}>54.210</Text>
          </View>

          <View style={[styles.statRow, { borderBottomColor: colors.border }]}>
            <View style={styles.statLeft}>
              <View style={[styles.bullet, { backgroundColor: '#3B9EE0' }]} />
              <Text style={[styles.statName, { color: colors.text }]}>Fajar Pratama Nugraha, S.T. (No. 2)</Text>
            </View>
            <Text style={[styles.statNum, { color: colors.text }]}>38.120</Text>
          </View>

          <View style={[styles.statRow, { borderBottomColor: 'transparent' }]}>
            <View style={styles.statLeft}>
              <View style={[styles.bullet, { backgroundColor: '#F59E0B' }]} />
              <Text style={[styles.statName, { color: colors.text }]}>Suara Lambang Partai (Coblos Parpol)</Text>
            </View>
            <Text style={[styles.statNum, { color: colors.text }]}>36.120</Text>
          </View>
        </View>

        <View style={styles.infoFooterRow}>
          <View style={styles.infoBadge}>
            <Feather name="shield" size={14} color={colors.success} strokeWidth={iconStrokeWidth} />
            <Text style={[styles.infoBadgeText, { color: colors.textMuted }]}>Metode Sainte-Laguë Terverifikasi</Text>
          </View>
          <View style={styles.infoBadge}>
            <Feather name="check-circle" size={14} color={colors.primary} strokeWidth={iconStrokeWidth} />
            <Text style={[styles.infoBadgeText, { color: colors.textMuted }]}>98.2% TPS Masuk</Text>
          </View>
        </View>

        <PrimaryButton
          label="Lihat Roster Caleg PAN"
          icon="users"
          variant="outline"
          onPress={() => navigation.navigate('PartyRoster', { party: 'PAN' })}
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  header: {
    gap: 2,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '800',
  },
  subTitle: {
    fontSize: fontSize.xs,
  },
  mainCard: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  brandLogo: {
    width: 38,
    height: 38,
  },
  cardTitle: {
    fontSize: fontSize.md,
    fontWeight: '800',
  },
  cardSubtitle: {
    fontSize: 11,
  },
  heroStatBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  heroTextCol: {
    flex: 1,
    gap: 2,
  },
  heroLabel: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  heroValue: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 36,
  },
  heroSub: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    marginTop: 2,
  },
  seatBadgeContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    minWidth: 72,
  },
  seatNumber: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 30,
  },
  seatLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  progressSection: {
    gap: 6,
  },
  progressLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '800',
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  breakdownBox: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.xs,
  },
  breakdownHeader: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
  },
  statLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statName: {
    fontSize: 12,
    fontWeight: '600',
  },
  statNum: {
    fontSize: 12,
    fontWeight: '800',
  },
  infoFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
