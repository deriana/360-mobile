import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { Card, Pill, PrimaryButton } from '../components/ui';
import { fonts, radius, spacing } from '../theme';

export default function StatusPeranSayaScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const { currentUser, role } = useApp();

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.container}
    >
      <View style={[styles.headerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Feather name="user-check" size={24} color={colors.primary} />
        <View style={{ gap: 2, flex: 1 }}>
          <Text style={[styles.title, { color: colors.text }]}>Status & Peran Multidimensi</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Identitas Terpadu: Keanggotaan, Fungsionaris, Relawan, & Mandat Saksi BSN PAN
          </Text>
        </View>
      </View>

      <Card style={{ gap: spacing.sm }}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>1. Status Keanggotaan simPAN</Text>
        <Text style={{ color: colors.textMuted, fontSize: 12 }}>
          {currentUser?.identity?.name} • No. Anggota: PAN-3273-2024-00892
        </Text>
        <Pill label="ANGGOTA RESMI AKTIF" tone="success" />
      </Card>

      <Card style={{ gap: spacing.sm }}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>2. Kelola Status & Partisipasi</Text>
        <Text style={{ color: colors.textMuted, fontSize: 12 }}>
          Pengaturan status pengunduran diri terstruktur atau jeda kerelawanan mandiri.
        </Text>
        <PrimaryButton
          label="Buka Kelola Status Saya"
          onPress={() => navigation.navigate('KelolaStatus')}
        />
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
