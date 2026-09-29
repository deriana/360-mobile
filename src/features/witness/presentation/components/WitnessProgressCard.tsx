import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../../../context/ThemeContext';
import { Pill } from '../../../../components/ui';
import { fonts, radius, spacing } from '../../../../theme';
import { pillToneFor } from '../../../../core/components/statusTone';
import { useWitnessApplication } from '../hooks/useWitnessApplication';

/**
 * Kartu ringkas status saksi untuk Beranda relawan — lolos "tes 3 detik":
 * status (pill), langkah berikutnya (deskripsi), progres (Langkah X dari 5).
 * Tidak dirender untuk Anggota (jalur saksi khusus relawan).
 */
export default function WitnessProgressCard({ onPress }: { onPress: () => void }) {
  const { colors } = useTheme();
  const { access, statusInfo, stepNumber, totalSteps } = useWitnessApplication();

  if (access.accountType === 'ANGGOTA') return null;

  const isLockedByRequirements = access.nextAction === 'COMPLETE_REQUIREMENTS';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        pressed && { opacity: 0.85 },
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: colors.primaryLight }]}>
        <Feather name={access.isUnlocked ? 'shield' : 'lock'} size={18} color={colors.primary} />
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.text }]}>Saksi TPS</Text>
          <Pill label={statusInfo.label} tone={pillToneFor(statusInfo.tone)} />
        </View>
        <Text style={[styles.body, { color: colors.textMuted }]} numberOfLines={2}>
          {isLockedByRequirements
            ? `Lengkapi ${access.unmetRequirements.length} syarat dulu untuk bisa mendaftar.`
            : statusInfo.description}
        </Text>
        <Text style={[styles.step, { color: colors.primary }]}>
          Langkah {stepNumber} dari {totalSteps}
        </Text>
      </View>
      <Feather name="chevron-right" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  iconBox: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  title: { fontFamily: fonts.bold, fontSize: 14 },
  body: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 17 },
  step: { fontFamily: fonts.semiBold, fontSize: 11.5 },
});
