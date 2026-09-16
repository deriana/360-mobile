import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, SectionList, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Card, EmptyState, Input, Pill, StatusBadge } from '../components/ui';
import { fonts, fontSize, iconStrokeWidth, radius, shadow, spacing } from '../theme';
import { getUserProfile, scopeTps, scopeWitnesses } from '../utils/scope';
import { getTpsPhoto } from '../data/images';
import { Tps, TpsStatus } from '../types';

interface TpsSection {
  district: string;
  data: Tps[];
}

export default function SupervisionScreen({ navigation }: any) {
  const { role, tps, witnesses, getDocumentation } = useApp();
  const { colors, isDark } = useTheme();

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TpsStatus | 'all'>('all');

  const userProfile = getUserProfile(role);
  const scopedTps = useMemo(() => scopeTps(role, tps, witnesses), [role, tps, witnesses]);

  const notReportedCount = useMemo(() => scopedTps.filter((t) => t.status === 'not_reported').length, [scopedTps]);
  const inProgressCount = useMemo(() => scopedTps.filter((t) => t.status === 'in_progress').length, [scopedTps]);
  const doneCount = useMemo(() => scopedTps.filter((t) => t.status === 'done').length, [scopedTps]);
  const problemCount = useMemo(() => scopedTps.filter((t) => t.status === 'problem').length, [scopedTps]);

  const filteredTps = useMemo(() => {
    return scopedTps.filter((t) => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (query && !`${t.id} ${t.district} ${t.village || ''} ${t.tpsNumber}`.toLowerCase().includes(query.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [scopedTps, statusFilter, query]);

  // Group filtered TPS by Kecamatan (District)
  const groupedSections: TpsSection[] = useMemo(() => {
    const map = new Map<string, Tps[]>();
    filteredTps.forEach((t) => {
      const d = t.district || 'Lainnya';
      if (!map.has(d)) {
        map.set(d, []);
      }
      map.get(d)!.push(t);
    });

    return Array.from(map.entries()).map(([district, data]) => ({
      district,
      data: data.sort((a, b) => a.tpsNumber - b.tpsNumber),
    }));
  }, [filteredTps]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Top Bar: Real Territorial Scope & Non-clipping Counter */}
      <View style={styles.topBar}>
        <View style={styles.scopeBadge}>
          <Feather name="map-pin" size={12} color={colors.primary} />
          <Text style={[styles.scopeText, { color: colors.text }]} numberOfLines={1}>
            {userProfile.scopeLocation}
          </Text>
        </View>
        <Pill label={`${filteredTps.length} TPS Terdaftar`} tone="primary" />
      </View>

      {/* Search Input */}
      <Input
        placeholder="Cari TPS, kelurahan, atau kecamatan..."
        icon="search"
        value={query}
        onChangeText={setQuery}
        onClear={() => setQuery('')}
        containerStyle={{ marginTop: spacing.xs, marginBottom: spacing.xs }}
      />

      {/* Filter Status: Single Smooth Horizontal Scroll */}
      <View style={styles.filterScrollView}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {[
            { key: 'all' as const, label: `Semua (${scopedTps.length})` },
            { key: 'not_reported' as const, label: `Belum Lapor (${notReportedCount})` },
            { key: 'in_progress' as const, label: `Proses (${inProgressCount})` },
            { key: 'done' as const, label: `Selesai (${doneCount})` },
            { key: 'problem' as const, label: `Bermasalah (${problemCount})` },
          ].map((f) => {
            const isActive = statusFilter === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => setStatusFilter(f.key)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isActive ? colors.primary : colors.surface,
                    borderColor: isActive ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={[styles.chipText, { color: isActive ? '#FFFFFF' : colors.text }]}>
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Grouped TPS by Kecamatan (SectionList) */}
      {filteredTps.length === 0 ? (
        <EmptyState
          title="Tidak Ada TPS Terdeteksi"
          body="Tidak ada TPS yang cocok dengan kriteria pencarian dan filter status ini."
          icon="map-pin"
        />
      ) : (
        <SectionList
          sections={groupedSections}
          keyExtractor={(item) => item.id}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: spacing.xl, gap: spacing.xs }}
          renderSectionHeader={({ section: { district, data } }) => {
            const doneInDistrict = data.filter((t) => t.status === 'done').length;
            return (
              <View style={styles.sectionHeaderWrap}>
                <View style={styles.sectionHeaderLeft}>
                  <View style={[styles.districtIconWrap, { backgroundColor: colors.primaryLight }]}>
                    <Feather name="map-pin" size={11} color={colors.primary} />
                  </View>
                  <Text style={[styles.sectionDistrictTitle, { color: colors.text }]}>
                    Kecamatan {district}
                  </Text>
                </View>
                <View style={[styles.sectionBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9' }]}>
                  <Text style={[styles.sectionBadgeText, { color: colors.textMuted }]}>
                    {data.length} TPS{doneInDistrict > 0 ? ` • ${doneInDistrict} Selesai` : ''}
                  </Text>
                </View>
              </View>
            );
          }}
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
                  pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] },
                ]}
              >
                <Image source={getTpsPhoto(item.tpsNumber - 1)} style={styles.tpsThumb} resizeMode="cover" />

                <View style={{ flex: 1, gap: 4 }}>
                  {/* Top Row: TPS Number & Badges */}
                  <View style={styles.cardTopRow}>
                    <Text style={[styles.tpsNumberTitle, { color: colors.text }]}>
                      TPS {String(item.tpsNumber).padStart(2, '0')}
                    </Text>
                    <View style={styles.badgeRow}>
                      {hasAnomaly && item.status !== 'problem' && (
                        <Pill label="Anomali" tone="danger" icon="alert-triangle" />
                      )}
                      <StatusBadge status={item.status} />
                    </View>
                  </View>

                  {/* Subtitle: ID & Region (District is already in Section Header) */}
                  <Text style={[styles.tpsLocationSub, { color: colors.textMuted }]}>
                    {item.id} • {item.village ? `Kel. ${item.village}` : item.regency}
                  </Text>

                  {/* Meta Strip: Compact & Anti-Truncation */}
                  <View style={[styles.cardMetaRow, { borderTopColor: colors.border }]}>
                    <View style={styles.metaItem}>
                      <Feather name="users" size={11} color={colors.primary} strokeWidth={iconStrokeWidth} />
                      <Text style={[styles.metaText, { color: colors.text }]}>DPT: {item.dpt}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Feather name="user-check" size={11} color={colors.success} strokeWidth={iconStrokeWidth} />
                      <Text style={[styles.metaText, { color: colors.success }]}>
                        Saksi: {checkedInWit}/{assignedWit.length || 1}
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Feather name="image" size={11} color={colors.textMuted} strokeWidth={iconStrokeWidth} />
                      <Text style={[styles.metaText, { color: colors.textMuted }]}>
                        {getDocumentation(item.id).length} Foto
                      </Text>
                    </View>
                  </View>

                  {/* Quick Count Row */}
                  <View style={[styles.quickCountRow, { borderTopColor: colors.border }]}>
                    {leading && totalCandidate > 0 ? (
                      <>
                        <Feather name="zap" size={11} color={colors.primary} strokeWidth={iconStrokeWidth} />
                        <Text style={[styles.quickCountText, { color: colors.text }]} numberOfLines={1}>
                          Hasil: <Text style={{ fontWeight: '800', color: colors.primary }}>{leading[0].split('—')[0].trim()}</Text> unggul {leadingPercent}%
                        </Text>
                      </>
                    ) : (
                      <>
                        <Feather name="clock" size={11} color={colors.textMuted} strokeWidth={iconStrokeWidth} />
                        <Text style={[styles.quickCountText, { color: colors.textMuted }]} numberOfLines={1}>
                          Menunggu penghitungan C1 Plano
                        </Text>
                      </>
                    )}
                  </View>
                </View>

                <Feather name="chevron-right" size={16} color={colors.textMuted} strokeWidth={iconStrokeWidth} />
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  scopeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  scopeText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xs,
  },
  filterScrollView: {
    maxHeight: 38,
    marginBottom: spacing.xs,
  },
  filterScroll: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    minHeight: 30,
    justifyContent: 'center',
  },
  chipText: {
    fontFamily: fonts.bold,
    fontSize: 11,
  },
  sectionHeaderWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: 4,
    paddingHorizontal: 2,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  districtIconWrap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionDistrictTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xs + 1,
  },
  sectionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  sectionBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 10,
  },
  tpsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    marginBottom: spacing.xs,
    ...shadow.card,
  },
  tpsThumb: {
    width: 54,
    height: 54,
    borderRadius: radius.md,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tpsNumberTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSize.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tpsLocationSub: {
    fontFamily: fonts.regular,
    fontSize: 11,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 5,
    borderTopWidth: 0.5,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontFamily: fonts.bold,
    fontSize: 10.5,
  },
  quickCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingTop: 4,
    borderTopWidth: 0.5,
  },
  quickCountText: {
    fontFamily: fonts.regular,
    fontSize: 11,
    flex: 1,
  },
});
