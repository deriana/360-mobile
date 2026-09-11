import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Card, Modal, Pill, SectionTitle } from '../components/ui';
import { fontSize, radius, spacing } from '../theme';
import { WARTA_DPP_LIST, WartaPartai } from '../data/simpan';

export default function SimpanNewsScreen() {
  const { colors } = useTheme();
  const [selectedNews, setSelectedNews] = useState<WartaPartai | null>(null);

  const getTone = (kat: WartaPartai['kategori']) => {
    switch (kat) {
      case 'INTRUKSI_KETUM': return 'primary';
      case 'BSN_PAN': return 'success';
      case 'KONSOLIDASI': return 'warning';
      default: return 'neutral';
    }
  };

  const getLabel = (kat: WartaPartai['kategori']) => {
    switch (kat) {
      case 'INTRUKSI_KETUM': return 'Instruksi Ketum';
      case 'BSN_PAN': return 'BSN PAN';
      case 'KONSOLIDASI': return 'Konsolidasi';
      default: return 'Rilis Pers';
    }
  };

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Warta & Instruksi simPAN</Text>
        <Text style={[styles.subTitle, { color: colors.textMuted }]}>
          Instruksi resmi Ketua Umum, siaran pers, dan maklumat Badan Saksi Nasional PAN.
        </Text>
      </View>

      <View style={{ gap: spacing.md }}>
        {WARTA_DPP_LIST.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => setSelectedNews(item)}
            style={({ pressed }) => [pressed && { opacity: 0.85 }]}
          >
            <Card style={{ gap: spacing.xs, borderColor: item.pinned ? colors.primary : colors.border }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Pill label={getLabel(item.kategori)} tone={getTone(item.kategori)} />
                  {item.pinned && <Pill label="Penting" tone="primary" icon="bookmark" />}
                </View>
                <Text style={{ fontSize: 10, color: colors.textMuted }}>{item.tanggal}</Text>
              </View>

              <Text style={[styles.newsTitle, { color: colors.text }]}>{item.judul}</Text>
              <Text style={[styles.newsSummary, { color: colors.textMuted }]} numberOfLines={2}>
                {item.ringkasan}
              </Text>

              <View style={[styles.newsFooter, { borderTopColor: colors.border }]}>
                <Text style={[styles.newsAuthor, { color: colors.primary }]}>{item.penulis}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: colors.primary }}>Baca Selengkapnya</Text>
                  <Feather name="chevron-right" size={14} color={colors.primary} />
                </View>
              </View>
            </Card>
          </Pressable>
        ))}
      </View>

      {/* Detail Modal */}
      {selectedNews && (
        <Modal visible={true} title={getLabel(selectedNews.kategori)} onClose={() => setSelectedNews(null)}>
          <ScrollView style={{ maxHeight: 400 }} contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.md }}>
            <Text style={{ fontSize: 11, color: colors.textMuted }}>
              {selectedNews.tanggal} • {selectedNews.penulis}
            </Text>
            <Text style={{ fontSize: fontSize.md, fontWeight: '800', color: colors.text }}>
              {selectedNews.judul}
            </Text>
            <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 4 }} />
            <Text style={{ fontSize: fontSize.xs, color: colors.text, lineHeight: 20 }}>
              {selectedNews.isiLengkap}
            </Text>
          </ScrollView>
        </Modal>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },
  header: { gap: 2 },
  title: { fontSize: fontSize.xl, fontWeight: '800' },
  subTitle: { fontSize: fontSize.xs },
  newsTitle: { fontSize: fontSize.sm, fontWeight: '800', marginTop: 2 },
  newsSummary: { fontSize: 11, lineHeight: 16 },
  newsFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
    borderTopWidth: 0.5,
    marginTop: 4,
  },
  newsAuthor: { fontSize: 10, fontWeight: '700' },
});
