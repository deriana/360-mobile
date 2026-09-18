import React, { useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Card, EmptyState, Pill } from '../components/ui';
import { fonts, fontSize, iconStrokeWidth, radius, spacing } from '../theme';
import { NotificationItem } from '../types';

export default function NotificationsScreen({ navigation }: any) {
  const { notifications, markNotificationRead } = useApp();
  const { colors, isDark } = useTheme();

  const [filterType, setFilterType] = useState<'all' | 'broadcast' | 'assignment' | 'reminder'>('all');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = notifications.filter((n) => {
    if (filterType === 'all') return true;
    return n.type === filterType;
  });

  const handleNotificationPress = (item: NotificationItem) => {
    markNotificationRead(item.id);
    if (item.actionScreen) {
      navigation.navigate(item.actionScreen, item.actionParams);
    }
  };

  const markAllRead = () => {
    notifications.forEach((n) => markNotificationRead(n.id));
  };

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'broadcast':
        return 'radio';
      case 'assignment':
        return 'file-text';
      case 'reminder':
        return 'clock';
      case 'audit':
      default:
        return 'check-circle';
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Header Info Banner */}
      <View style={[styles.headerBanner, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={[styles.heading, { color: colors.text }]}>Kotak Masuk Notifikasi</Text>
          <Text style={[styles.subHeading, { color: colors.textMuted }]}>
            Instruksi komando, jadwal penugasan TPS, & pengingat presensi
          </Text>
        </View>

        {unreadCount > 0 ? (
          <Pressable onPress={markAllRead} hitSlop={8}>
            <Pill label={`${unreadCount} Belum Dibaca`} tone="danger" />
          </Pressable>
        ) : (
          <Pill label="Semua Dibaca" tone="success" />
        )}
      </View>

      {/* Filter Track */}
      <View style={styles.filterTrack}>
        {[
          { key: 'all' as const, label: 'Semua' },
          { key: 'broadcast' as const, label: 'Broadcast' },
          { key: 'assignment' as const, label: 'Penugasan' },
          { key: 'reminder' as const, label: 'Pengingat' },
        ].map((f) => (
          <Pressable
            key={f.key}
            onPress={() => setFilterType(f.key)}
            style={[
              styles.filterPill,
              filterType === f.key
                ? { backgroundColor: colors.primary, borderColor: colors.primary }
                : { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text
              style={[
                styles.filterText,
                { color: filterType === f.key ? '#FFFFFF' : colors.textMuted },
              ]}
            >
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Notification List */}
      {filtered.length === 0 ? (
        <EmptyState
          title="Tidak Ada Notifikasi"
          body="Kotak masuk Anda bersih. Tidak ada pemberitahuan baru saat ini."
          icon="inbox"
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const iconName = getNotificationIcon(item.type);

            return (
              <Pressable
                onPress={() => handleNotificationPress(item)}
                style={({ pressed }) => [pressed && { opacity: 0.85 }]}
              >
                <Card
                  style={[
                    styles.notifCard,
                    {
                      backgroundColor: item.read
                        ? colors.surface
                        : isDark
                        ? 'rgba(0,43,82,0.35)'
                        : '#F0F9FF',
                      borderColor: item.read ? colors.border : colors.primary,
                    },
                  ]}
                >
                  <View style={styles.cardHeaderRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                      <View
                        style={[
                          styles.iconWrap,
                          {
                            backgroundColor: item.read ? colors.surface : colors.primaryLight,
                          },
                        ]}
                      >
                        <Feather
                          name={iconName}
                          size={14}
                          color={item.read ? colors.textMuted : colors.primary}
                          strokeWidth={iconStrokeWidth}
                        />
                      </View>
                      <Text style={[styles.senderName, { color: colors.primary }]} numberOfLines={1}>
                        {item.sentBy}
                      </Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={[styles.timeLabel, { color: colors.textMuted }]}>{item.sentAt}</Text>
                      {!item.read && <View style={[styles.unreadDot, { backgroundColor: colors.danger }]} />}
                    </View>
                  </View>

                  <Text style={[styles.notifTitle, { color: colors.text }]}>{item.title}</Text>
                  <Text style={[styles.notifBody, { color: colors.textMuted }]}>{item.body}</Text>

                  {item.actionScreen && (
                    <View style={styles.actionRow}>
                      <Text style={[styles.actionText, { color: colors.primary }]}>
                        Buka Dokumen / Tindak Lanjut
                      </Text>
                      <Feather name="arrow-right" size={12} color={colors.primary} />
                    </View>
                  )}
                </Card>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  headerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  heading: { fontFamily: fonts.bold, fontSize: fontSize.sm },
  subHeading: { fontFamily: fonts.regular, fontSize: fontSize.xs, lineHeight: 16 },
  filterTrack: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  filterPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  filterText: { fontFamily: fonts.semiBold, fontSize: 11 },
  listContent: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.xxl },
  notifCard: { padding: spacing.md, gap: 4 },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  senderName: { fontFamily: fonts.bold, fontSize: 11 },
  timeLabel: { fontFamily: fonts.regular, fontSize: 10 },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  notifTitle: { fontFamily: fonts.bold, fontSize: fontSize.xs, marginTop: 2 },
  notifBody: { fontFamily: fonts.regular, fontSize: fontSize.xs, lineHeight: 17 },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    paddingTop: 4,
  },
  actionText: { fontFamily: fonts.bold, fontSize: 11 },
});
