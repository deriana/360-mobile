import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Card, KpiCard, SectionTitle, Pill, EmptyState } from '../components/ui';
import { fontSize, radius, spacing, iconStrokeWidth } from '../theme';
import { partyNames } from '../data/regions';
import { ROLE_PERMISSIONS } from '../utils/scope';

export default function LeadershipScreen() {
  const { role, tps } = useApp();
  const { colors } = useTheme();

  const permissions = ROLE_PERMISSIONS[role];

  if (!permissions.canAccessLeadership) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background, padding: spacing.lg }]}>
        <EmptyState
          title="Akses Terbatas Pimpinan"
          body="Fitur Dashboard Eksekutif Pimpinan hanya dapat diakses oleh jajaran pengurus HQ (DPP, DPW, DPD)."
          icon="shield-off"
        />
      </View>
    );
  }

  const totalVotes = partyNames.reduce(
    (sum, p) => sum + tps.reduce((s, t) => s + (t.votes.partyVotes[p] ?? 0), 0),
    0,
  );
  const reported = tps.filter((t) => t.status === 'done').length;

  const byRegency = useMemo(() => {
    const map = new Map<string, { total: number; reported: number }>();
    tps.forEach((t) => {
      const key = `${t.regency}`;
      const entry = map.get(key) ?? { total: 0, reported: 0 };
      entry.total += 1;
      if (t.status === 'done') entry.reported += 1;
      map.set(key, entry);
    });
    return Array.from(map.entries())
      .map(([regency, v]) => ({ regency, ...v, pct: v.total ? Math.round((v.reported / v.total) * 100) : 0 }))
      .sort((a, b) => b.pct - a.pct);
  }, [tps]);

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.text }]}>Dashboard Eksekutif Pimpinan</Text>

      {/* Bento Grid Executive KPI */}
      <View style={styles.bentoRow}>
        <KpiCard label="Total Suara Sah Masuk" value={totalVotes.toLocaleString('id-ID')} icon="award" />
        <KpiCard label="TPS Berhasil Lapor" value={`${reported}/${tps.length}`} tone={colors.success} icon="check-square" />
      </View>

      <Card style={{ gap: spacing.sm }}>
        <SectionTitle style={{ marginBottom: 0 }}>Peringkat Kecepatan Pelaporan Wilayah</SectionTitle>
        {byRegency.map((r, i) => (
          <View key={r.regency} style={[styles.rankRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.rank, { color: colors.textMuted }]}>#{i + 1}</Text>
            <Text style={[styles.rankName, { color: colors.text }]}>{r.regency}</Text>
            <Pill label={`${r.pct}% (${r.reported}/${r.total})`} tone={r.pct >= 70 ? 'success' : r.pct >= 40 ? 'warning' : 'danger'} />
          </View>
        ))}
      </Card>

      <Card style={{ gap: spacing.sm }}>
        <SectionTitle style={{ marginBottom: 0 }}>Sorotan Performa Wilayah</SectionTitle>
        <View style={[styles.highlightBox, { backgroundColor: colors.successBg }]}>
          <Feather name="trending-up" size={18} color={colors.success} strokeWidth={iconStrokeWidth} />
          <Text style={[styles.highlightText, { color: colors.text }]}>
            Wilayah Tertinggi: <Text style={{ fontWeight: '800' }}>{byRegency[0]?.regency}</Text> ({byRegency[0]?.pct}% selesai)
          </Text>
        </View>

        <View style={[styles.highlightBox, { backgroundColor: colors.dangerBg }]}>
          <Feather name="trending-down" size={18} color={colors.danger} strokeWidth={iconStrokeWidth} />
          <Text style={[styles.highlightText, { color: colors.text }]}>
            Wilayah Terendah: <Text style={{ fontWeight: '800' }}>{byRegency[byRegency.length - 1]?.regency}</Text> ({byRegency[byRegency.length - 1]?.pct}% selesai)
          </Text>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl + 40 },
  title: { fontSize: fontSize.xl, fontWeight: '800' },
  bentoRow: { flexDirection: 'row', gap: spacing.md },
  rankRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.xs, gap: spacing.sm, borderBottomWidth: 0.5 },
  rank: { fontSize: fontSize.xs, fontWeight: '700', width: 28 },
  rankName: { fontSize: fontSize.sm, fontWeight: '700', flex: 1 },
  highlightBox: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: radius.md },
  highlightText: { fontSize: fontSize.xs },
});
