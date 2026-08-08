import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Card, EmptyState, Pill } from '../components/ui';
import { fontSize, spacing, iconStrokeWidth } from '../theme';

export default function BroadcastScreen() {
  const { broadcasts } = useApp();
  const { colors } = useTheme();

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Kotak Masuk Broadcast & Instruksi</Text>
        <Text style={[styles.subTitle, { color: colors.textMuted }]}>
          Instruksi resmi, dokumen panduan, & pengumuman penting dari Pusat Komando ke Petugas Lapangan.
        </Text>
      </View>

      {broadcasts.length === 0 ? (
        <EmptyState title="Belum Ada Pesan Masuk" body="Pesan broadcast dan pengumuman dari pusat komando akan tampil di sini." icon="radio" />
      ) : (
        <FlatList
          data={broadcasts}
          keyExtractor={(b) => b.id}
          contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.xxl + 40 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Card style={{ gap: spacing.xs }}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.senderBadge}>
                  <Feather name="radio" size={14} color={colors.primary} strokeWidth={iconStrokeWidth} />
                  <Text style={[styles.senderText, { color: colors.primary }]}>Pusat Komando ({item.sentBy})</Text>
                </View>
                <Pill label={item.sentAt} tone="info" />
              </View>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.cardBody, { color: colors.textMuted }]}>{item.body}</Text>
            </Card>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: spacing.lg, gap: spacing.sm },
  header: { gap: 2, marginBottom: spacing.xs },
  title: { fontSize: fontSize.xl, fontWeight: '800' },
  subTitle: { fontSize: fontSize.xs, lineHeight: 18 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  senderBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  senderText: { fontSize: 11, fontWeight: '800' },
  cardTitle: { fontSize: fontSize.sm, fontWeight: '800' },
  cardBody: { fontSize: fontSize.xs, lineHeight: 18 },
});
