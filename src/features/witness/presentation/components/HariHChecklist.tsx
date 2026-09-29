import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../../../context/ThemeContext';
import { fonts, radius, spacing } from '../../../../theme';

export interface HariHChecklistItem {
  id: string;
  label: string;
  hint: string;
  icon: keyof typeof Feather.glyphMap;
  done: boolean;
  onPress: () => void;
}

/**
 * Checklist Hari-H saksi (Task M-03 Saksi360-Admin). Langkah pertama yang belum selesai
 * ditandai sebagai langkah aktif agar hanya ada satu fokus tindakan.
 */
export default function HariHChecklist({ items }: { items: HariHChecklistItem[] }) {
  const { colors } = useTheme();
  const activeIndex = items.findIndex((item) => !item.done);
  const doneCount = items.filter((item) => item.done).length;

  return (
    <View style={{ gap: spacing.sm }}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.text }]}>Checklist Hari-H</Text>
        <Text style={[styles.counter, { color: colors.textMuted }]}>
          {doneCount} dari {items.length} selesai
        </Text>
      </View>

      {items.map((item, index) => {
        const isActive = index === activeIndex;
        const borderColor = isActive ? colors.primary : colors.border;
        const iconBg = item.done ? colors.successBg : isActive ? colors.primaryLight : colors.background;
        const iconColor = item.done ? colors.success : isActive ? colors.primary : colors.textMuted;

        return (
          <Pressable
            key={item.id}
            onPress={item.onPress}
            style={({ pressed }) => [
              styles.row,
              { borderColor, backgroundColor: colors.surface, borderWidth: isActive ? 1.5 : 1 },
              pressed && { opacity: 0.8 },
            ]}
          >
            <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
              <Feather name={item.done ? 'check' : item.icon} size={16} color={iconColor} />
            </View>
            <View style={{ flex: 1, gap: 1 }}>
              <Text style={[styles.label, { color: colors.text }]}>
                {index + 1}. {item.label}
              </Text>
              <Text style={[styles.hint, { color: colors.textMuted }]} numberOfLines={1}>
                {item.done ? 'Selesai' : item.hint}
              </Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.textMuted} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontFamily: fonts.bold, fontSize: 14 },
  counter: { fontFamily: fonts.medium, fontSize: 11.5 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  iconBox: { width: 34, height: 34, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily: fonts.semiBold, fontSize: 13 },
  hint: { fontFamily: fonts.regular, fontSize: 11.5 },
});
