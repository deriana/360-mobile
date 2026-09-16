import React, { useMemo, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { EmptyState, Pill, Input } from '../components/ui';
import { fonts, fontSize, iconStrokeWidth, radius, shadow, spacing } from '../theme';
import { scopeTps, scopeCoordinators } from '../utils/scope';
import { getWitnessAvatar } from '../data/images';
import { WitnessStatus } from '../types';

const STATUS_TONE: Record<WitnessStatus, 'success' | 'warning' | 'danger'> = {
  checked_in: 'success',
  assigned: 'warning',
  absent: 'danger',
};
const STATUS_TEXT: Record<WitnessStatus, string> = {
  checked_in: 'Hadir',
  assigned: 'Belum Hadir',
  absent: 'Tidak Hadir',
};

export default function CoordinatorListScreen({ navigation }: any) {
  const { role, tps, witnesses, coordinators } = useApp();
  const { colors } = useTheme();
  const [query, setQuery] = useState('');

  const scopedTps = useMemo(() => scopeTps(role, tps, witnesses), [role, tps, witnesses]);
  const scopedCoordinators = useMemo(
    () => scopeCoordinators(role, coordinators, scopedTps),
    [role, coordinators, scopedTps],
  );

  const filtered = scopedCoordinators.filter((c) =>
    query
      ? c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.district.toLowerCase().includes(query.toLowerCase()) ||
        c.phone.includes(query)
      : true,
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Manajemen Koordinator ({filtered.length})</Text>

      <Input
        placeholder="Cari nama, kecamatan, atau No HP..."
        icon="search"
        value={query}
        onChangeText={setQuery}
        onClear={() => setQuery('')}
        containerStyle={{ marginBottom: spacing.md }}
      />

      {filtered.length === 0 ? (
        <EmptyState
          title="Tidak Ada Koordinator"
          body="Tidak ada koordinator yang cocok dengan pencarian kata kunci ini."
          icon="users"
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(c) => c.id}
          contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.xl }}
          renderItem={({ item }) => {
            const witnessCount = witnesses.filter((w) => {
              const t = tps.find((x) => x.id === w.assignedTpsId);
              return t?.district === item.district && t?.regency === item.regency;
            }).length;

            return (
              <Pressable
                hitSlop={4}
                style={({ pressed }) => [
                  styles.rowCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  pressed && { opacity: 0.75, transform: [{ scale: 0.98 }] },
                ]}
                onPress={() => navigation.navigate('CoordinatorDetail', { coordinatorId: item.id })}
              >
                <Image source={getWitnessAvatar(item.avatarIndex)} style={styles.avatarImage} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
                  <View style={styles.subRow}>
                    <Feather name="map-pin" size={12} color={colors.textMuted} strokeWidth={iconStrokeWidth} />
                    <Text style={[styles.tps, { color: colors.textMuted }]}>Kec. {item.district}</Text>
                    <Text style={[styles.dotSep, { color: colors.borderStrong }]}>•</Text>
                    <Feather name="users" size={12} color={colors.textMuted} strokeWidth={iconStrokeWidth} />
                    <Text style={[styles.tps, { color: colors.textMuted }]}>{witnessCount} Saksi Binaan</Text>
                  </View>
                </View>
                <Pill label={STATUS_TEXT[item.status]} tone={STATUS_TONE[item.status]} />
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: spacing.lg },
  title: { fontFamily: fonts.extraBold, fontSize: fontSize.xl, marginBottom: spacing.md },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    ...shadow.card,
  },
  avatarImage: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: '#4F46E5',
  },
  name: { fontFamily: fonts.bold, fontSize: fontSize.sm },
  subRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tps: { fontFamily: fonts.regular, fontSize: fontSize.xs },
  dotSep: { fontFamily: fonts.regular, fontSize: fontSize.xs },
});
