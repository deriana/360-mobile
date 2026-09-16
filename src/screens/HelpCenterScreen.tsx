import React, { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Card, EmptyState, Input, PrimaryButton, SectionTitle } from '../components/ui';
import { fonts, fontSize, iconStrokeWidth, radius, spacing } from '../theme';
import { FAQ_CATEGORIES, FAQ_ITEMS } from '../data/faq';

export default function HelpCenterScreen() {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = FAQ_ITEMS.filter((f) =>
    query
      ? f.question.toLowerCase().includes(query.toLowerCase()) || f.answer.toLowerCase().includes(query.toLowerCase())
      : true,
  );

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Input
        placeholder="Cari pertanyaan, mis. 'check-in', 'C1', 'honor'..."
        icon="search"
        value={query}
        onChangeText={setQuery}
        onClear={() => setQuery('')}
      />

      {filtered.length === 0 ? (
        <EmptyState title="Tidak Ditemukan" body="Tidak ada FAQ yang cocok dengan pencarian ini." icon="search" />
      ) : (
        FAQ_CATEGORIES.map((category) => {
          const items = filtered.filter((f) => f.category === category);
          if (items.length === 0) return null;
          return (
            <Card key={category} style={{ gap: spacing.xs }}>
              <SectionTitle style={{ marginBottom: 0 }}>{category}</SectionTitle>
              {items.map((item) => {
                const isOpen = expandedId === item.id;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => setExpandedId(isOpen ? null : item.id)}
                    style={[styles.faqRow, { borderBottomColor: colors.border }]}
                  >
                    <View style={styles.faqQuestionRow}>
                      <Text style={[styles.faqQuestion, { color: colors.text }]}>{item.question}</Text>
                      <Feather name={isOpen ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} strokeWidth={iconStrokeWidth} />
                    </View>
                    {isOpen && <Text style={[styles.faqAnswer, { color: colors.textMuted }]}>{item.answer}</Text>}
                  </Pressable>
                );
              })}
            </Card>
          );
        })
      )}

      <Card style={{ gap: spacing.sm, alignItems: 'center' }}>
        <Feather name="headphones" size={24} color={colors.primary} strokeWidth={iconStrokeWidth} />
        <Text style={[styles.contactTitle, { color: colors.text }]}>Masih Butuh Bantuan?</Text>
        <Text style={[styles.contactBody, { color: colors.textMuted }]}>
          Hubungi tim support SAKSI 360 kalau pertanyaanmu belum terjawab di atas.
        </Text>
        <PrimaryButton
          label="Chat WhatsApp Support"
          icon="message-circle"
          onPress={() => Linking.openURL('https://wa.me/6281234567890')}
          style={{ width: '100%' }}
        />
        <PrimaryButton
          label="Email support@saksi360.demo"
          icon="mail"
          variant="secondary"
          onPress={() => Linking.openURL('mailto:support@saksi360.demo')}
          style={{ width: '100%' }}
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },
  faqRow: { paddingVertical: spacing.sm, borderBottomWidth: 0.5, gap: 6 },
  faqQuestionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  faqQuestion: { fontFamily: fonts.bold, fontSize: fontSize.xs + 1, flex: 1 },
  faqAnswer: { fontFamily: fonts.regular, fontSize: fontSize.xs, lineHeight: 18 },
  contactTitle: { fontFamily: fonts.bold, fontSize: fontSize.md },
  contactBody: { fontFamily: fonts.regular, fontSize: fontSize.xs, textAlign: 'center', lineHeight: 18 },
});
