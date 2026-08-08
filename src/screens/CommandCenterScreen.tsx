import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { DropdownPicker, EmptyState, Input, Pill } from '../components/ui';
import { fontSize, radius, shadow, spacing } from '../theme';
import { statusColors, statusLabel } from '../theme';
import { ROLE_HOME, ROLE_LABEL, scopeTps } from '../utils/scope';
import { regions } from '../data/regions';
import { TpsStatus } from '../types';

const STATUS_FILTERS: Array<{ key: TpsStatus | 'all'; label: string }> = [
  { key: 'all', label: 'Semua Status' },
  { key: 'not_reported', label: 'Belum Lapor' },
  { key: 'in_progress', label: 'Proses' },
  { key: 'done', label: 'Selesai' },
  { key: 'problem', label: 'Bermasalah' },
];

export default function CommandCenterScreen({ navigation }: any) {
  const { role, tps } = useApp();
  const { colors } = useTheme();

  const [statusFilter, setStatusFilter] = useState<TpsStatus | 'all'>('all');
  const [selectedProvince, setSelectedProvince] = useState<string>('all');
  const [selectedRegency, setSelectedRegency] = useState<string>('all');
  const [query, setQuery] = useState('');

  const home = ROLE_HOME[role];

  // Scoped TPS according to role hierarchy
  const scoped = useMemo(() => scopeTps(role, tps), [role, tps]);

  // Available Provinces for filter (DPP gets all 38 provinces, DPW gets assigned province)
  const availableProvinces = useMemo(() => {
    if (home.province) return [home.province];
    return Array.from(new Set(tps.map((t) => t.province))).sort();
  }, [home.province, tps]);

  // Available Regencies for filter (DPD gets assigned regency, DPW gets regencies in assigned province)
  const availableRegencies = useMemo(() => {
    if (home.regency) return [home.regency];
    const provToUse = selectedProvince !== 'all' ? selectedProvince : home.province;
    if (provToUse) {
      const match = regions.find((r) => r.province === provToUse);
      return match ? match.regencies : [];
    }
    return Array.from(new Set(tps.map((t) => t.regency))).sort();
  }, [home.regency, home.province, selectedProvince, tps]);

  // Options for Dropdowns
  const provinceOptions = useMemo(() => {
    return [
      { label: 'Semua 38 Provinsi', value: 'all' },
      ...availableProvinces.map((p) => ({ label: p, value: p })),
    ];
  }, [availableProvinces]);

  const regencyOptions = useMemo(() => {
    return [
      { label: `Semua Kabupaten / Kota (${availableRegencies.length})`, value: 'all' },
      ...availableRegencies.map((r) => ({ label: r, value: r })),
    ];
  }, [availableRegencies]);

  const filtered = scoped.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (selectedProvince !== 'all' && t.province !== selectedProvince) return false;
    if (selectedRegency !== 'all' && t.regency !== selectedRegency) return false;
    if (query && !`${t.province} ${t.regency} ${t.district} ${t.village} ${t.id}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text }]}>Pusat Pemantauan</Text>
          <Text style={[styles.scopeText, { color: colors.textMuted }]}>
            Hak Akses: <Text style={{ color: colors.primary, fontWeight: '700' }}>{ROLE_LABEL[role]}</Text>
          </Text>
        </View>
        <Pill label={`${filtered.length} TPS`} tone="primary" />
      </View>

      <Input
        placeholder="Cari TPS, Kelurahan, Kecamatan, Kab/Kota..."
        icon="search"
        value={query}
        onChangeText={setQuery}
        onClear={() => setQuery('')}
        containerStyle={{ marginBottom: spacing.xs }}
      />

      {/* Modern Dropdown Hierarchy Pickers (DPP = Provinsi & Kab/Kota Dropdowns, DPW = Kab/Kota Dropdown) */}
      <View style={styles.dropdownContainer}>
        {role === 'DPP' && (
          <DropdownPicker
            label="Wilayah Provinsi"
            icon="globe"
            value={selectedProvince}
            options={provinceOptions}
            onSelect={(val) => {
              setSelectedProvince(val);
              setSelectedRegency('all');
            }}
            placeholder="Pilih Provinsi..."
            style={{ flex: 1 }}
          />
        )}

        {(role === 'DPP' || role === 'DPW') && (
          <DropdownPicker
            label="Kabupaten / Kota"
            icon="map-pin"
            value={selectedRegency}
            options={regencyOptions}
            onSelect={setSelectedRegency}
            placeholder="Pilih Kabupaten / Kota..."
            style={{ flex: 1 }}
          />
        )}
      </View>

      {/* Status Filter Chips */}
      <View style={styles.filterRow}>
        {STATUS_FILTERS.map((f) => {
          const isActive = statusFilter === f.key;
          return (
            <Pressable
              key={f.key}
              hitSlop={8}
              onPress={() => setStatusFilter(f.key)}
              style={({ pressed }) => [
                styles.filterChip,
                {
                  backgroundColor: isActive ? colors.primary : colors.surface,
                  borderColor: isActive ? colors.primary : colors.border,
                },
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: isActive ? colors.textInverse : colors.text },
                ]}
              >
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {filtered.length === 0 ? (
        <EmptyState icon="search" title="Tidak Ada TPS Terdeteksi" body="Tidak ada TPS yang cocok dengan filter dropdown wilayah & pencarian ini." />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(t) => t.id}
          numColumns={2}
          columnWrapperStyle={{ gap: spacing.sm }}
          contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.xxl + 40 }}
          renderItem={({ item }) => (
            <Pressable
              hitSlop={4}
              style={({ pressed }) => [
                styles.tile,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderLeftColor: statusColors[item.status] ?? colors.primary,
                },
                pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
              ]}
              onPress={() => navigation.navigate('TpsDetail', { tpsId: item.id })}
            >
              <Text style={[styles.tileId, { color: colors.text }]}>{item.id}</Text>
              <Text style={[styles.tileLocation, { color: colors.textMuted }]} numberOfLines={1}>
                {item.district}, {item.village || item.regency}
              </Text>
              <Text style={[styles.tileProv, { color: colors.textMuted }]} numberOfLines={1}>
                {item.regency} • {item.province}
              </Text>
              <View style={styles.tileStatusRow}>
                <View style={[styles.tileDot, { backgroundColor: statusColors[item.status] ?? colors.textMuted }]} />
                <Text style={[styles.tileStatus, { color: colors.text }]}>{statusLabel[item.status] ?? item.status}</Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: spacing.lg, gap: spacing.sm },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  title: { fontSize: fontSize.xl, fontWeight: '800' },
  scopeText: { fontSize: 11 },
  dropdownContainer: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.xs },
  filterRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.xs, flexWrap: 'wrap' },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    minHeight: 32,
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  filterText: { fontSize: fontSize.xs, fontWeight: '700' },
  tile: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderLeftWidth: 4,
    padding: spacing.md,
    minHeight: 105,
    justifyContent: 'space-between',
    ...shadow.card,
  },
  tileId: { fontWeight: '800', fontSize: fontSize.sm },
  tileLocation: { fontSize: fontSize.xs, fontWeight: '600' },
  tileProv: { fontSize: 10 },
  tileStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tileDot: { width: 8, height: 8, borderRadius: 4 },
  tileStatus: { fontSize: fontSize.xs, fontWeight: '700' },
});
