import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Card, Pill, SectionTitle } from '../components/ui';
import { fontSize, radius, spacing } from '../theme';
import { STRUKTUR_PENGURUS, PengurusOrg } from '../data/simpan';
import { getWitnessAvatar } from '../data/images';

const TABS: Array<{ key: PengurusOrg['tingkat'] | 'SEMUA'; label: string }> = [
  { key: 'SEMUA', label: 'Semua' },
  { key: 'DPP', label: 'DPP Pusat' },
  { key: 'DPW', label: 'DPW Jabar' },
  { key: 'DPD', label: 'DPD Bandung' },
  { key: 'DPC', label: 'DPC Coblong' },
  { key: 'DPRT', label: 'Ranting Dago' },
];

export default function SimpanStructureScreen() {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<PengurusOrg['tingkat'] | 'SEMUA'>('SEMUA');

  const filtered = activeTab === 'SEMUA'
    ? STRUKTUR_PENGURUS
    : STRUKTUR_PENGURUS.filter((p) => p.tingkat === activeTab);

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Struktur Kepengurusan simPAN</Text>
        <Text style={[styles.subTitle, { color: colors.textMuted }]}>
          Direktori pengurus resmi Partai Amanat Nasional dari tingkat Pusat hingga Ranting.
        </Text>
      </View>

      {/* Filter Horizontal Scroll */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
        {TABS.map((tab) => {
          const isSelected = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[
                styles.tabBtn,
                {
                  backgroundColor: isSelected ? colors.primary : colors.surface,
                  borderColor: isSelected ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  { color: isSelected ? '#FFFFFF' : colors.text, fontWeight: isSelected ? '800' : '600' },
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* List of Officers */}
      <View style={{ gap: spacing.sm }}>
        {filtered.map((officer) => (
          <Card key={officer.id} style={styles.officerCard}>
            <Image source={getWitnessAvatar(officer.avatarIndex)} style={styles.officerAvatar} />
            <View style={{ flex: 1, gap: 3 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Pill label={officer.tingkat} tone="primary" />
                <Text style={{ fontSize: 10, color: colors.textMuted }}>{officer.periode}</Text>
              </View>
              <Text style={[styles.officerName, { color: colors.text }]}>{officer.nama}</Text>
              <Text style={[styles.officerJabatan, { color: colors.primary }]}>{officer.jabatan}</Text>
              <Text style={[styles.officerWilayah, { color: colors.textMuted }]}>{officer.wilayah}</Text>

              {(officer.telepon || officer.email) && (
                <View style={[styles.contactRow, { borderTopColor: colors.border }]}>
                  {officer.telepon && (
                    <View style={styles.contactItem}>
                      <Feather name="phone" size={11} color={colors.textMuted} />
                      <Text style={[styles.contactText, { color: colors.textMuted }]}>{officer.telepon}</Text>
                    </View>
                  )}
                  {officer.email && (
                    <View style={styles.contactItem}>
                      <Feather name="mail" size={11} color={colors.textMuted} />
                      <Text style={[styles.contactText, { color: colors.textMuted }]}>{officer.email}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },
  header: { gap: 2 },
  title: { fontSize: fontSize.xl, fontWeight: '800' },
  subTitle: { fontSize: fontSize.xs },
  tabsRow: { flexDirection: 'row', gap: spacing.xs, paddingVertical: 2 },
  tabBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  tabBtnText: { fontSize: fontSize.xs },
  officerCard: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  officerAvatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 1.5, borderColor: '#0066B3' },
  officerName: { fontSize: fontSize.sm, fontWeight: '800' },
  officerJabatan: { fontSize: 11, fontWeight: '700' },
  officerWilayah: { fontSize: 10 },
  contactRow: { flexDirection: 'row', gap: spacing.md, marginTop: 4, paddingTop: 4, borderTopWidth: 0.5 },
  contactItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  contactText: { fontSize: 10 },
});
