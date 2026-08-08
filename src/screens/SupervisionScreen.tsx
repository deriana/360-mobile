import React, { useMemo, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Card, EmptyState, Input, Pill, StatusBadge } from '../components/ui';
import { fontSize, iconStrokeWidth, radius, shadow, spacing } from '../theme';
import { ROLE_LABEL, scopeTps, scopeWitnesses } from '../utils/scope';
import { IMAGES, getTpsPhoto } from '../data/images';
import { TpsStatus } from '../types';

export default function SupervisionScreen({ navigation }: any) {
  const { role, tps, witnesses, getDocumentation } = useApp();
  const { colors } = useTheme();

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TpsStatus | 'all'>('all');

  const scopedTps = useMemo(() => scopeTps(role, tps, witnesses), [role, tps, witnesses]);

  const filteredTps = useMemo(() => {
    return scopedTps.filter((t) => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (query && !`${t.id} ${t.district} ${t.village || ''} ${t.tpsNumber}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [scopedTps, statusFilter, query]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.text }]}>Pengawasan TPS</Text>
          <Pill label={`${filteredTps.length} TPS`} tone="primary" />
        </View>
        <Text style={[styles.subTitle, { color: colors.textMuted }]}>
          Hak Akses: <Text style={{ color: colors.primary, fontWeight: '800' }}>{ROLE_LABEL[role]}</Text>
        </Text>
      </View>

      <Input
        placeholder="Cari TPS, Kelurahan, Kecamatan..."
        icon="search"
        value={query}
        onChangeText={setQuery}
        onClear={() => setQuery('')}
        containerStyle={{ marginBottom: spacing.xs }}
      />

      {/* Filter Status Quick Chips */}
      <View style={styles.filterRow}>
        {[
          { key: 'all', label: 'Semua Status' },
          { key: 'not_reported', label: 'Belum Lapor' },
          { key: 'in_progress', label: 'Proses' },
          { key: 'done', label: 'Selesai' },
          { key: 'problem', label: 'Bermasalah' },
        ].map((f) => {
          const isActive = statusFilter === f.key;
          return (
            <Pressable
              key={f.key}
              hitSlop={8}
              onPress={() => setStatusFilter(f.key as any)}
              style={({ pressed }) => [
                styles.chip,
                {
                  backgroundColor: isActive ? colors.primary : colors.surface,
                  borderColor: isActive ? colors.primary : colors.border,
                },
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text style={[styles.chipText, { color: isActive ? colors.textInverse : colors.text }]}>
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {filteredTps.length === 0 ? (
        <EmptyState
          title="Tidak Ada TPS Terdeteksi"
          body="Tidak ada TPS yang cocok dengan kriteria pencarian dan filter ini."
          icon="map-pin"
        />
      ) : (
        <FlatList
          data={filteredTps}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.xl }}
          renderItem={({ item, index }) => {
            const assignedWit = witnesses.filter((w) => w.assignedTpsId === item.id);
            const checkedInWit = assignedWit.filter((w) => w.status === 'checked_in').length;

            const totalCandidate = Object.values(item.votes.candidateVotes).reduce((a, b) => a + b, 0);
            const leading = Object.entries(item.votes.candidateVotes).sort((a, b) => b[1] - a[1])[0];
            const leadingPercent = leading && totalCandidate > 0 ? Math.round((leading[1] / totalCandidate) * 100) : 0;

            const hasAnomaly =
              item.status === 'problem' ||
              item.votersPresent > item.dpt ||
              item.votes.invalidVotes > item.votersPresent ||
              (totalCandidate > 0 && totalCandidate + item.votes.invalidVotes !== item.votersPresent);

            return (
              <Pressable
                onPress={() => navigation.navigate('TpsDetail', { tpsId: item.id })}
                style={({ pressed }) => [
                  styles.tpsCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
                ]}
              >
                <Image source={getTpsPhoto(index)} style={styles.tpsThumb} />
                <View style={{ flex: 1, gap: 4 }}>
                  <View style={styles.cardTopRow}>
                    <Text style={[styles.tpsNumberTitle, { color: colors.text }]}>
                      TPS {item.tpsNumber} — {item.village || item.district}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 4 }}>
                      {hasAnomaly && <Pill label="Anomali" tone="danger" icon="alert-triangle" />}
                      <StatusBadge status={item.status} />
                    </View>
                  </View>

                  <Text style={[styles.tpsLocationSub, { color: colors.textMuted }]}>
                    Kec. {item.district}, {item.regency}
                  </Text>

                  <View style={[styles.cardMetaRow, { borderTopColor: colors.border }]}>
                    <View style={styles.metaItem}>
                      <Feather name="users" size={12} color={colors.primary} strokeWidth={iconStrokeWidth} />
                      <Text style={[styles.metaText, { color: colors.text }]}>DPT: {item.dpt} Pemilih</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Feather name="user-check" size={12} color={colors.success} strokeWidth={iconStrokeWidth} />
                      <Text style={[styles.metaText, { color: colors.success }]}>
                        Saksi Hadir: {checkedInWit}/{assignedWit.length || 1}
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Feather name="image" size={12} color={colors.textMuted} strokeWidth={iconStrokeWidth} />
                      <Text style={[styles.metaText, { color: colors.textMuted }]}>
                        Dokumentasi: {getDocumentation(item.id).length} foto
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.quickCountRow, { borderTopColor: colors.border }]}>
                    <Feather name="zap" size={12} color={colors.danger} strokeWidth={iconStrokeWidth} />
                    <Text style={[styles.quickCountText, { color: colors.text }]} numberOfLines={1}>
                      {leading && totalCandidate > 0
                        ? `Quick Count: ${leading[0].split('—')[0].trim()} ${leadingPercent}%`
                        : 'Quick Count: belum ada suara masuk'}
                    </Text>
                  </View>
                </View>
                <Feather name="chevron-right" size={18} color={colors.textMuted} strokeWidth={iconStrokeWidth} />
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: spacing.lg, gap: spacing.xs },
  header: { gap: 2, marginBottom: spacing.xs },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: fontSize.xl, fontWeight: '800' },
  subTitle: { fontSize: fontSize.xs },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.xs },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    minHeight: 32,
    justifyContent: 'center',
  },
  chipText: { fontSize: fontSize.xs, fontWeight: '700' },
  tpsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    ...shadow.card,
  },
  tpsThumb: { width: 56, height: 56, borderRadius: radius.md },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tpsNumberTitle: { fontSize: fontSize.sm, fontWeight: '800' },
  tpsLocationSub: { fontSize: 11 },
  cardMetaRow: { flexDirection: 'row', gap: spacing.md, paddingTop: 4, borderTopWidth: 0.5 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, fontWeight: '700' },
  quickCountRow: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingTop: 4, borderTopWidth: 0.5 },
  quickCountText: { fontSize: 11, fontWeight: '700', flexShrink: 1 },
});
