import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Card, EmptyState, Pill } from '../components/ui';
import { fonts, fontSize, spacing, iconStrokeWidth } from '../theme';

export default function BroadcastScreen() {
  const { broadcasts } = useApp();
  const { colors } = useTheme();

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {broadcasts.length === 0 ? (
        <EmptyState title="Belum Ada Pesan Masuk" body="Pesan broadcast dan pengumuman dari pusat komando akan tampil di sini." icon="radio" />
      ) : (
        <FlatList
          data={broadcasts}
          keyExtractor={(b) => b.id}
          contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.xl }}
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
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  senderBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  senderText: { fontFamily: fonts.bold, fontSize: 11 },
  cardTitle: { fontFamily: fonts.bold, fontSize: fontSize.sm },
  cardBody: { fontFamily: fonts.regular, fontSize: fontSize.xs, lineHeight: 18 },
});
