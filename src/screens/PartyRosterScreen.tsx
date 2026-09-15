import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Card, EmptyState, Input, Pill } from '../components/ui';
import { PartyBadge } from '../components/PartyBadge';
import { fontSize, iconStrokeWidth, radius, shadow, spacing } from '../theme';
import { NATIONAL_PARTIES, LEGISLATIVE_MEMBERS } from '../data/legislative';
import { getStableAvatar } from '../data/images';

type ElectFilter = 'all' | 'terpilih' | 'tidak';

const PAGE_SIZE = 10;

const PARTY_FULL_NAMES: Record<string, string> = {
  PAN: 'Partai Amanat Nasional',
  PKB: 'Partai Kebangkitan Bangsa',
  PKS: 'Partai Keadilan Sejahtera',
  PPP: 'Partai Persatuan Pembangunan',
  PBB: 'Partai Bulan Bintang',
  PKN: 'Partai Kebangkitan Nusantara',
  PSI: 'Partai Solidaritas Indonesia',
};

export default function PartyRosterScreen({ route, navigation }: any) {
  const party = route?.params?.party || 'PAN';
  const { colors, isDark } = useTheme();
  const [query, setQuery] = useState('');
  const [electFilter, setElectFilter] = useState<ElectFilter>('terpilih');
  const [displayedCount, setDisplayedCount] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fullName = PARTY_FULL_NAMES[party] ?? party;
  const partyData = NATIONAL_PARTIES.find((np) => np.name === party);
  const totalSeats = partyData?.seats ?? 0;

  const allMembers = useMemo(
    () => LEGISLATIVE_MEMBERS.filter((m) => m.party === party),
    [party],
  );

  const electedCount = useMemo(
    () => allMembers.filter((m) => m.terpilih).length,
    [allMembers],
  );

  const filtered = useMemo(() => {
    return allMembers
      .filter((m) => {
        if (electFilter === 'terpilih' && !m.terpilih) return false;
        if (electFilter === 'tidak' && m.terpilih) return false;
        if (query && !`${m.name} ${m.province}`.toLowerCase().includes(query.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => {
        if (a.terpilih !== b.terpilih) return a.terpilih ? -1 : 1;
        return b.votes - a.votes;
      });
  }, [allMembers, electFilter, query]);

  useEffect(() => {
    setDisplayedCount(PAGE_SIZE);
    setLoadingMore(false);
  }, [electFilter, query, party]);

  const displayedMembers = useMemo(
    () => filtered.slice(0, displayedCount),
    [filtered, displayedCount],
  );

  const handleLoadMore = () => {
    if (loadingMore || displayedCount >= filtered.length) return;
    setLoadingMore(true);
    setTimeout(() => {
      setDisplayedCount((prev) => Math.min(prev + PAGE_SIZE, filtered.length));
      setLoadingMore(false);
    }, 450);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setDisplayedCount(PAGE_SIZE);
    setTimeout(() => {
      setRefreshing(false);
    }, 400);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Header Card Partai & Fraksi DPR RI */}
      <Card style={styles.partyBannerCard}>
        <View style={styles.partyBannerTop}>
          <PartyBadge party={party} size={50} />
          <View style={{ flex: 1, gap: 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <Text style={[styles.partyFullName, { color: colors.text }]} numberOfLines={1}>
                {fullName}
              </Text>
              {party !== fullName && (
                <View style={[styles.partyCodePill, { backgroundColor: colors.primaryLight }]}>
                  <Text style={[styles.partyCodeText, { color: colors.primary }]}>{party}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.fraksiText, { color: colors.textMuted }]}>
              Fraksi DPR RI Periode 2024–2029
            </Text>
            {partyData?.lolosThreshold ? (
              <View style={styles.thresholdRow}>
                <Feather name="check-circle" size={11} color={colors.success} />
                <Text style={[styles.thresholdText, { color: colors.success }]}>
                  Lolos Ambang Batas Parlemen (PT 4%)
                </Text>
              </View>
            ) : partyData && !partyData.isLocal ? (
              <View style={styles.thresholdRow}>
                <Feather name="alert-circle" size={11} color={colors.textMuted} />
                <Text style={[styles.thresholdText, { color: colors.textMuted }]}>
                  Di Bawah Ambang Batas PT 4%
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* 3-Column Key Metrics Bar */}
        <View style={[styles.metricsBar, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <View style={styles.metricItem}>
            <Text style={[styles.metricValue, { color: colors.primary }]}>
              {totalSeats}
            </Text>
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Kursi Senayan</Text>
          </View>
          <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />
          <View style={styles.metricItem}>
            <Text style={[styles.metricValue, { color: colors.text }]}>
              {partyData && partyData.pct > 0 ? `${partyData.pct}%` : `${electedCount}`}
            </Text>
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
              {partyData && partyData.pct > 0 ? 'Suara Nasional' : 'Terpilih'}
            </Text>
          </View>
          <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />
          <View style={styles.metricItem}>
            <Text style={[styles.metricValue, { color: colors.text }]}>
              {allMembers.length}
            </Text>
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Caleg Terdaftar</Text>
          </View>
        </View>
      </Card>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {[
          { key: 'terpilih' as const, label: `Terpilih (${electedCount})` },
          { key: 'all' as const, label: `Semua Caleg (${allMembers.length})` },
          { key: 'tidak' as const, label: `Belum Terpilih (${allMembers.length - electedCount})` },
        ].map((f) => {
          const isActive = electFilter === f.key;
          return (
            <Pressable
              key={f.key}
              onPress={() => setElectFilter(f.key)}
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
      </View>

      {/* Search Input */}
      <Input
        placeholder="Cari nama caleg atau provinsi dapil..."
        icon="search"
        value={query}
        onChangeText={setQuery}
        onClear={() => setQuery('')}
        containerStyle={{ marginTop: spacing.xs, marginBottom: spacing.xs }}
      />

      {/* Status Bar Jumlah Caleg */}
      <View style={styles.resultsInfoRow}>
        <Text style={[styles.resultsCountText, { color: colors.textMuted }]}>
          Menampilkan <Text style={{ fontWeight: '800', color: colors.text }}>{displayedMembers.length}</Text> dari <Text style={{ fontWeight: '800', color: colors.text }}>{filtered.length}</Text> caleg
          {electFilter === 'terpilih' ? ' lolos Senayan' : ''}
        </Text>
        {query ? (
          <Pressable onPress={() => setQuery('')}>
            <Text style={{ fontSize: 11, color: colors.primary, fontWeight: '700' }}>Reset Cari</Text>
          </Pressable>
        ) : null}
      </View>

      {/* Candidate List */}
      {filtered.length === 0 ? (
        <EmptyState
          title="Tidak Ada Caleg"
          body="Tidak ada anggota legislatif yang sesuai dengan kata kunci pencarian atau filter ini."
          icon="users"
        />
      ) : (
        <FlatList
          data={displayedMembers}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.xxl }}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListFooterComponent={
            <View style={styles.footerWrap}>
              {loadingMore ? (
                <View style={styles.loadingMoreRow}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={[styles.loadingMoreText, { color: colors.textMuted }]}>
                    Memuat caleg berikutnya...
                  </Text>
                </View>
              ) : displayedCount >= filtered.length && filtered.length > 0 ? (
                <Text style={[styles.allLoadedText, { color: colors.textMuted }]}>
                  ✓ Semua {filtered.length} anggota legislatif telah dimuat
                </Text>
              ) : null}
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => navigation.navigate('LegislativeMemberDetail', { memberId: item.id })}
              style={({ pressed }) => [
                styles.candidateCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: item.terpilih ? (isDark ? '#1E3A8A' : '#BFDBFE') : colors.border,
                },
                item.terpilih && !isDark && { backgroundColor: '#F8FAFF' },
                pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] },
              ]}
            >
              <View style={styles.avatarWrap}>
                <Image
                  source={getStableAvatar(item.id)}
                  style={[
                    styles.avatar,
                    { borderColor: item.terpilih ? colors.primary : colors.border },
                  ]}
                />
                {item.terpilih && (
                  <View style={[styles.checkCircleBadge, { backgroundColor: colors.success }]}>
                    <Feather name="check" size={8} color="#FFFFFF" strokeWidth={3} />
                  </View>
                )}
              </View>

              <View style={{ flex: 1, gap: 3 }}>
                <Text style={[styles.candidateName, { color: colors.text }]} numberOfLines={1}>
                  {item.name}
                </Text>

                <View style={styles.metaBadgeRow}>
                  <View style={[styles.dapilBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9' }]}>
                    <Feather name="map-pin" size={10} color={colors.primary} />
                    <Text style={[styles.dapilText, { color: colors.text }]}>
                      Dapil {item.province}
                    </Text>
                  </View>
                  <Text style={[styles.dotSep, { color: colors.textMuted }]}>•</Text>
                  <Text style={[styles.noUrutText, { color: colors.textMuted }]}>
                    No. Urut #{item.noUrut}
                  </Text>
                </View>

                <View style={styles.votesRow}>
                  <Text style={[styles.votesLabel, { color: colors.textMuted }]}>Perolehan:</Text>
                  <Text style={[styles.votesValue, { color: colors.primary }]}>
                    {item.votes.toLocaleString('id-ID')} suara sah
                  </Text>
                </View>
              </View>

              <View style={styles.cardRightCol}>
                <Pill
                  label={item.terpilih ? 'DPR RI' : 'Calon'}
                  tone={item.terpilih ? 'success' : 'neutral'}
                  icon={item.terpilih ? 'award' : undefined}
                />
                <Feather name="chevron-right" size={16} color={colors.textMuted} strokeWidth={iconStrokeWidth} />
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: spacing.lg, gap: spacing.xs },
  partyBannerCard: {
    padding: spacing.md,
    gap: spacing.sm,
    borderRadius: radius.lg,
  },
  partyBannerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  partyFullName: {
    fontSize: fontSize.md,
    fontWeight: '800',
    flexShrink: 1,
  },
  partyCodePill: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: radius.pill,
  },
  partyCodeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  fraksiText: {
    fontSize: 11,
    fontWeight: '600',
  },
  thresholdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  thresholdText: {
    fontSize: 10,
    fontWeight: '700',
  },
  metricsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
  },
  metricValue: {
    fontSize: fontSize.md,
    fontWeight: '900',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  metricDivider: {
    width: 1,
    height: 24,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  resultsInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
    marginBottom: spacing.xs,
  },
  resultsCountText: {
    fontSize: 11,
  },
  candidateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    ...shadow.card,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
  },
  checkCircleBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  candidateName: {
    fontSize: fontSize.sm,
    fontWeight: '800',
  },
  metaBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  dapilBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dapilText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  dotSep: {
    fontSize: 10,
  },
  noUrutText: {
    fontSize: 10.5,
    fontWeight: '600',
  },
  votesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  votesLabel: {
    fontSize: 10,
  },
  votesValue: {
    fontSize: 11,
    fontWeight: '800',
  },
  cardRightCol: {
    alignItems: 'flex-end',
    gap: 8,
  },
  footerWrap: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  loadingMoreText: {
    fontSize: 11,
    fontWeight: '600',
  },
  allLoadedText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
});
