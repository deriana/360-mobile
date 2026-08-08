import React, { useMemo, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { EmptyState, Pill, Input } from '../components/ui';
import { fontSize, iconStrokeWidth, radius, shadow, spacing } from '../theme';
import { scopeTps, scopeWitnesses } from '../utils/scope';
import { IMAGES, getWitnessAvatar } from '../data/images';
import { WitnessStatus } from '../types';

const STATUS_TONE: Record<WitnessStatus, 'success' | 'warning' | 'danger'> = {
  checked_in: 'success',
  assigned: 'warning',
  absent: 'danger',
};
const STATUS_TEXT: Record<WitnessStatus, string> = {
  checked_in: 'Check-in',
  assigned: 'Ditugaskan',
  absent: 'Tidak Hadir',
};

export default function WitnessListScreen({ navigation }: any) {
  const { role, tps, witnesses } = useApp();
  const { colors } = useTheme();
  const [query, setQuery] = useState('');

  const scopedTps = useMemo(() => scopeTps(role, tps), [role, tps]);
  const scopedWitnesses = useMemo(() => scopeWitnesses(role, witnesses, scopedTps), [role, witnesses, scopedTps]);

  const filtered = scopedWitnesses.filter((w) =>
    query
      ? w.name.toLowerCase().includes(query.toLowerCase()) ||
        w.assignedTpsId.toLowerCase().includes(query.toLowerCase()) ||
        w.phone.includes(query)
      : true,
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Manajemen Saksi ({filtered.length})</Text>

      <Input
        placeholder="Cari nama, No HP, atau ID TPS..."
        icon="search"
        value={query}
        onChangeText={setQuery}
        onClear={() => setQuery('')}
        containerStyle={{ marginBottom: spacing.md }}
      />

      {filtered.length === 0 ? (
        <EmptyState
          title="Tidak Ada Saksi"
          body="Tidak ada saksi yang cocok dengan pencarian kata kunci ini."
          icon="users"
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(w) => w.id}
          contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.xxl + 40 }}
          renderItem={({ item, index }) => {
            const avatarUrl = getWitnessAvatar(index);

            return (
              <Pressable
                hitSlop={4}
                style={({ pressed }) => [
                  styles.rowCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  pressed && { opacity: 0.75, transform: [{ scale: 0.98 }] },
                ]}
                onPress={() => navigation.navigate('WitnessDetail', { witnessId: item.id })}
              >
                <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
                  <View style={styles.subRow}>
                    <Feather name="map-pin" size={12} color={colors.textMuted} strokeWidth={iconStrokeWidth} />
                    <Text style={[styles.tps, { color: colors.textMuted }]}>{item.assignedTpsId}</Text>
                    <Text style={[styles.dotSep, { color: colors.borderStrong }]}>•</Text>
                    <Feather name="phone" size={12} color={colors.textMuted} strokeWidth={iconStrokeWidth} />
                    <Text style={[styles.tps, { color: colors.textMuted }]}>{item.phone}</Text>
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
  title: { fontSize: fontSize.xl, fontWeight: '800', marginBottom: spacing.md },
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
  name: { fontSize: fontSize.sm, fontWeight: '700' },
  subRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tps: { fontSize: fontSize.xs },
  dotSep: { fontSize: fontSize.xs },
});
