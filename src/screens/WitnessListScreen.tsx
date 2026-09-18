import React, { useMemo, useState } from 'react';
import { FlatList, Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { EmptyState, Pill, Input } from '../components/ui';
import { fonts, fontSize, iconStrokeWidth, radius, shadow, spacing } from '../theme';
import { scopeTps, scopeWitnesses } from '../utils/scope';
import { getWitnessAvatar } from '../data/images';
import { WitnessStatus } from '../types';
import { maskPhone } from '../utils/masking';

const STATUS_CONFIG: Record<WitnessStatus, { label: string; tone: 'success' | 'warning' | 'danger'; dotColor: string; bg: string; text: string }> = {
  checked_in: { label: 'Check-in', tone: 'success', dotColor: '#10B981', bg: '#DCFCE7', text: '#15803D' },
  assigned: { label: 'Ditugaskan', tone: 'warning', dotColor: '#F59E0B', bg: '#FEF3C7', text: '#B45309' },
  absent: { label: 'Tidak Hadir', tone: 'danger', dotColor: '#EF4444', bg: '#FEE2E2', text: '#B91C1C' },
};

type FilterTab = 'all' | 'checked_in' | 'assigned';

export default function WitnessListScreen({ navigation }: any) {
  const { role, tps, witnesses } = useApp();
  const { colors, isDark } = useTheme();
  const [query, setQuery] = useState('');
  const [filterTab, setFilterTab] = useState<FilterTab>('all');

  const scopedTps = useMemo(() => scopeTps(role, tps, witnesses), [role, tps, witnesses]);
  const scopedWitnesses = useMemo(() => scopeWitnesses(role, witnesses, scopedTps), [role, witnesses, scopedTps]);

  const checkedInCount = scopedWitnesses.filter((w) => w.status === 'checked_in').length;
  const assignedCount = scopedWitnesses.filter((w) => w.status === 'assigned').length;

  const filtered = scopedWitnesses.filter((w) => {
    const matchesTab =
      filterTab === 'all'
        ? true
        : filterTab === 'checked_in'
        ? w.status === 'checked_in'
        : w.status === 'assigned' || w.status === 'absent';

    const matchesQuery = query
      ? w.name.toLowerCase().includes(query.toLowerCase()) ||
        w.assignedTpsId.toLowerCase().includes(query.toLowerCase()) ||
        w.phone.includes(query)
      : true;

    return matchesTab && matchesQuery;
  });

  const handleSendReminder = (phone: string, name: string, tpsId: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
    const message = `Halo Sdr/i ${name}, pengingat dari Koordinator PAN: Mohon segera melakukan check-in penugasan Saksi di ${tpsId}. Terima kasih!`;
    const url = `whatsapp://send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`;

    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Linking.openURL(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`);
      }
    }).catch(() => {
      Linking.openURL(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`);
    });
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Top Header Row */}
      <View style={styles.topBar}>
        <View>
          <Text style={[styles.scopeTitle, { color: colors.text }]}>Cakupan Penugasan Saksi</Text>
          <Text style={[styles.scopeSubtitle, { color: colors.textMuted }]}>
            {checkedInCount} dari {scopedWitnesses.length} Saksi telah check-in
          </Text>
        </View>
        <View style={[styles.summaryPill, { backgroundColor: colors.primaryLight }]}>
          <Text style={[styles.summaryPillText, { color: colors.primary }]}>{scopedWitnesses.length} Saksi</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        <Pressable
          onPress={() => setFilterTab('all')}
          style={[
            styles.filterChip,
            {
              backgroundColor: filterTab === 'all' ? colors.primary : colors.surface,
              borderColor: filterTab === 'all' ? colors.primary : colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.filterChipText,
              { color: filterTab === 'all' ? colors.textInverse : colors.textMuted },
            ]}
          >
            Semua ({scopedWitnesses.length})
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setFilterTab('checked_in')}
          style={[
            styles.filterChip,
            {
              backgroundColor: filterTab === 'checked_in' ? colors.primary : colors.surface,
              borderColor: filterTab === 'checked_in' ? colors.primary : colors.border,
            },
          ]}
        >
          <View style={[styles.chipDot, { backgroundColor: '#10B981' }]} />
          <Text
            style={[
              styles.filterChipText,
              { color: filterTab === 'checked_in' ? colors.textInverse : colors.textMuted },
            ]}
          >
            Check-in ({checkedInCount})
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setFilterTab('assigned')}
          style={[
            styles.filterChip,
            {
              backgroundColor: filterTab === 'assigned' ? colors.primary : colors.surface,
              borderColor: filterTab === 'assigned' ? colors.primary : colors.border,
            },
          ]}
        >
          <View style={[styles.chipDot, { backgroundColor: '#F59E0B' }]} />
          <Text
            style={[
              styles.filterChipText,
              { color: filterTab === 'assigned' ? colors.textInverse : colors.textMuted },
            ]}
          >
            Belum ({assignedCount})
          </Text>
        </Pressable>
      </View>

      {/* Search Input */}
      <Input
        placeholder="Cari nama, nomor HP, atau ID TPS..."
        icon="search"
        value={query}
        onChangeText={setQuery}
        onClear={() => setQuery('')}
        containerStyle={{ marginBottom: spacing.md }}
      />

      {filtered.length === 0 ? (
        <EmptyState
          title="Tidak Ada Saksi"
          body="Tidak ada saksi yang cocok dengan filter atau kata kunci pencarian."
          icon="users"
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(w) => w.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.xl }}
          renderItem={({ item, index }) => {
            const avatarUrl = getWitnessAvatar(index);
            const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.assigned;
            const isCheckedIn = item.status === 'checked_in';

            return (
              <Pressable
                hitSlop={4}
                style={({ pressed }) => [
                  styles.rowCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  pressed && { opacity: 0.8, transform: [{ scale: 0.99 }] },
                ]}
                onPress={() => navigation.navigate('WitnessDetail', { witnessId: item.id })}
              >
                <View style={styles.avatarWrap}>
                  <Image source={avatarUrl} style={[styles.avatarImage, { borderColor: colors.border }]} />
                  <View
                    style={[
                      styles.avatarStatusDot,
                      { backgroundColor: statusCfg.dotColor, borderColor: colors.surface },
                    ]}
                  />
                </View>

                <View style={{ flex: 1, gap: 3, justifyContent: 'center' }}>
                  <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                    {item.name}
                  </Text>

                  <View style={styles.subRow}>
                    <View style={styles.metaBadge}>
                      <Feather name="map-pin" size={11} color={colors.primary} />
                      <Text style={[styles.tpsText, { color: colors.primary }]}>{item.assignedTpsId}</Text>
                    </View>

                    <Text style={[styles.dotSep, { color: colors.borderStrong }]}>•</Text>

                    <View style={styles.metaBadge}>
                      <Feather name="phone" size={11} color={colors.textMuted} />
                      <Text style={[styles.phoneText, { color: colors.textMuted }]}>{maskPhone(item.phone)}</Text>
                    </View>
                  </View>
                </View>

                {/* Right Column: Status Badge & Reminder CTA */}
                <View style={styles.rightActionCol}>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : statusCfg.bg,
                        borderColor: statusCfg.dotColor,
                      },
                    ]}
                  >
                    <View style={[styles.statusDot, { backgroundColor: statusCfg.dotColor }]} />
                    <Text style={[styles.statusBadgeText, { color: statusCfg.text }]}>
                      {statusCfg.label}
                    </Text>
                  </View>

                  {!isCheckedIn && (
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        handleSendReminder(item.phone, item.name, item.assignedTpsId);
                      }}
                      style={({ pressed }) => [
                        styles.reminderBtn,
                        { backgroundColor: isDark ? 'rgba(22,163,74,0.18)' : '#DCFCE7' },
                        pressed && { opacity: 0.7, transform: [{ scale: 0.96 }] },
                      ]}
                      hitSlop={6}
                    >
                      <Feather name="message-circle" size={11} color="#15803D" />
                      <Text style={styles.reminderBtnText}>Ingatkan</Text>
                    </Pressable>
                  )}
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: spacing.md },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  scopeTitle: {
    fontFamily: fonts.bold,
    fontSize: 14,
    fontWeight: '800',
  },
  scopeSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 11,
    marginTop: 1,
  },
  summaryPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  summaryPillText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    fontWeight: '700',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  filterChipText: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    fontWeight: '700',
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: radius.md,
    padding: 12,
    borderWidth: 1,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
  },
  avatarStatusDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 11,
    height: 11,
    borderRadius: 5.5,
    borderWidth: 1.5,
  },
  name: {
    fontFamily: fonts.bold,
    fontSize: 13.5,
    fontWeight: '800',
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  tpsText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    fontWeight: '700',
  },
  dotSep: {
    fontSize: 10,
  },
  phoneText: {
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  rightActionCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 10.5,
    fontWeight: '700',
  },
  reminderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  reminderBtnText: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: '#15803D',
    fontWeight: '700',
  },
});

