import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Card, SectionTitle } from '../components/ui';
import { fonts, fontSize, iconStrokeWidth, radius, spacing } from '../theme';
import { insightsList } from '../data/insights';

export default function InsightsScreen() {
  const { colors } = useTheme();

  const TONE_COLOR: Record<string, string> = {
    danger: colors.danger,
    warning: colors.warning,
    info: colors.info,
    success: colors.success,
  };

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: colors.primaryLight }]}>
          <Feather name="activity" size={14} color={colors.primary} strokeWidth={iconStrokeWidth} />
          <Text style={[styles.badgeText, { color: colors.primary }]}>Analisis Lapangan</Text>
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Ringkasan & Pemantauan TPS</Text>
        <Text style={[styles.disclaimer, { color: colors.textMuted }]}>
          Ringkasan indikator perkembangan pelaporan dan presensi saksi secara terpadu.
        </Text>
      </View>

      {insightsList.map((insight) => {
        const accentColor = TONE_COLOR[insight.tone] ?? colors.primary;
        return (
          <Card key={insight.id} style={[styles.insightCard, { borderLeftColor: accentColor }]}>
            <View style={styles.headerRow}>
              <Feather name="check-square" size={18} color={colors.primary} strokeWidth={iconStrokeWidth} />
              <SectionTitle style={{ marginBottom: 0, fontSize: fontSize.md }}>{insight.title}</SectionTitle>
            </View>
            <Text style={[styles.body, { color: colors.textMuted }]}>{insight.body}</Text>
          </Card>
        );
      })}
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
  badgeText: { fontFamily: fonts.bold, fontSize: fontSize.xs },
  title: { fontFamily: fonts.extraBold, fontSize: fontSize.xl },
  disclaimer: { fontFamily: fonts.regular, fontSize: fontSize.xs },
  insightCard: { borderLeftWidth: 4, gap: spacing.xs },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  body: { fontFamily: fonts.regular, fontSize: fontSize.sm, lineHeight: 20 },
});

