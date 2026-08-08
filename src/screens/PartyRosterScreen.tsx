import React, { useMemo, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Card, EmptyState, Input, Pill } from '../components/ui';
import { PartyBadge } from '../components/PartyBadge';
import { fontSize, iconStrokeWidth, radius, shadow, spacing } from '../theme';
import { NATIONAL_PARTIES, LEGISLATIVE_MEMBERS, COALITIONS } from '../data/legislative';
import { getStableAvatar } from '../data/images';

type ElectFilter = 'all' | 'terpilih' | 'tidak';

export default function PartyRosterScreen({ route, navigation }: any) {
  const { party } = route.params;
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [electFilter, setElectFilter] = useState<ElectFilter>('all');

  const coalition = COALITIONS.find((c) => c.parties.includes(party));
  const rosterParties = coalition?.parties ?? [party];
  const totalSeats = rosterParties.reduce((sum, p) => sum + (NATIONAL_PARTIES.find((np) => np.name === p)?.seats ?? 0), 0);

  const allMembers = useMemo(
    () => LEGISLATIVE_MEMBERS.filter((m) => rosterParties.includes(m.party)),
    [rosterParties.join('|')],
  );

  const filtered = allMembers.filter((m) => {
    if (electFilter === 'terpilih' && !m.terpilih) return false;
    if (electFilter === 'tidak' && m.terpilih) return false;
    if (query && !m.name.toLowerCase().includes(query.toLowerCase()) && !m.province.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const electedCount = allMembers.filter((m) => m.terpilih).length;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <Card style={styles.headerCard}>
        {coalition ? (
          <View style={{ flexDirection: 'row', gap: -8 }}>
            {rosterParties.map((p) => (
              <PartyBadge key={p} party={p} size={40} />
            ))}
          </View>
        ) : (
          <PartyBadge party={party} size={56} />
        )}
        <Text style={[styles.partyName, { color: colors.text }]}>{coalition ? coalition.name : party}</Text>
        {coalition && (
          <Text style={{ fontSize: 11, color: colors.textMuted, textAlign: 'center' }}>{coalition.parties.join(', ')}</Text>
        )}
        <View style={{ flexDirection: 'row', gap: spacing.xs }}>
          <Pill label={`${totalSeats} Kursi DPR RI`} tone="primary" />
          <Pill label={`${electedCount}/${allMembers.length} Caleg Terpilih`} tone="info" />
        </View>
      </Card>

      <View style={styles.filterRow}>
        {[
          { key: 'all', label: `Semua (${allMembers.length})` },
          { key: 'terpilih', label: `Terpilih (${electedCount})` },
          { key: 'tidak', label: `Tidak Terpilih (${allMembers.length - electedCount})` },
        ].map((f) => {
          const isActive = electFilter === f.key;
          return (
            <Pressable
              key={f.key}
              onPress={() => setElectFilter(f.key as ElectFilter)}
              style={[
                styles.chip,
                { backgroundColor: isActive ? colors.primary : colors.surface, borderColor: isActive ? colors.primary : colors.border },
              ]}
            >
              <Text style={[styles.chipText, { color: isActive ? '#FFFFFF' : colors.text }]}>{f.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Input
        placeholder="Cari nama anggota atau dapil provinsi..."
        icon="search"
        value={query}
        onChangeText={setQuery}
        onClear={() => setQuery('')}
        containerStyle={{ marginBottom: spacing.sm }}
      />

      {filtered.length === 0 ? (
        <EmptyState title="Tidak Ada Anggota" body="Tidak ada caleg yang cocok dengan filter atau pencarian ini." icon="users" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.xl }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => navigation.navigate('LegislativeMemberDetail', { memberId: item.id })}
              style={({ pressed }) => [styles.row, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && { opacity: 0.75 }]}
            >
              <Image source={getStableAvatar(item.id)} style={styles.avatar} />
              <View style={{ flex: 1, gap: 2 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                  {coalition && <PartyBadge party={item.party} size={16} />}
                </View>
                <Text style={{ fontSize: 11, color: colors.textMuted }}>
                  Dapil {item.province} • No. Urut {item.noUrut} • {item.votes.toLocaleString('id-ID')} suara
                </Text>
              </View>
              <Pill label={item.terpilih ? 'Terpilih' : 'Tidak Terpilih'} tone={item.terpilih ? 'success' : 'neutral'} />
              <Feather name="chevron-right" size={16} color={colors.textMuted} strokeWidth={iconStrokeWidth} />
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: spacing.lg },
  headerCard: { alignItems: 'center', gap: spacing.xs },
  partyName: { fontSize: fontSize.md, fontWeight: '800', textAlign: 'center' },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill, borderWidth: 1 },
  chipText: { fontSize: 11, fontWeight: '700' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.lg,
    padding: spacing.sm,
    borderWidth: 1,
    ...shadow.card,
  },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  name: { fontSize: fontSize.sm, fontWeight: '700' },
});
