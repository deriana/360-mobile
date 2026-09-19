import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Card, Pill, PrimaryButton } from '../components/ui';
import { fonts, radius, spacing } from '../theme';

export default function KelolaStatusScreen() {
  const { colors } = useTheme();

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.container}
    >
      <View style={[styles.headerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Feather name="settings" size={24} color={colors.primary} />
        <View style={{ gap: 2, flex: 1 }}>
          <Text style={[styles.title, { color: colors.text }]}>Kelola Status Mandiri</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Tata kelola siklus keanggotaan, jeda relawan, dan proteksi tugas aktif (Never Delete User Hard).
          </Text>
        </View>
      </View>

      <Card style={{ gap: spacing.sm }}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Status Kerelawanan</Text>
        <Text style={{ color: colors.textMuted, fontSize: 12 }}>
          Pilihan rehat sementara (Cuti Relawan) atau berhenti tetap tanpa menghapus portofolio kontribusi.
        </Text>
        <Pill label="Relawan Aktif" tone="primary" />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { padding: spacing.md, gap: spacing.md },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  title: { fontSize: 16, fontFamily: fonts.bold },
  subtitle: { fontSize: 11, fontFamily: fonts.regular },
  cardTitle: { fontSize: 13, fontFamily: fonts.bold },
});
