import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { fonts, radius, spacing } from '../../theme';

interface CheckboxRowProps {
  checked: boolean;
  onToggle: () => void;
  label: string;
  description?: string;
  error?: string;
}

/** Baris centang dengan label — dipakai untuk syarat, pernyataan, dan persetujuan data. */
export default function CheckboxRow({ checked, onToggle, label, description, error }: CheckboxRowProps) {
  const { colors } = useTheme();
  const borderColor = error ? colors.danger : checked ? colors.primary : colors.border;

  return (
    <View style={{ gap: 4 }}>
      <Pressable
        onPress={onToggle}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        style={({ pressed }) => [
          styles.row,
          { borderColor, backgroundColor: checked ? colors.primaryLight : colors.surface },
          pressed && { opacity: 0.8 },
        ]}
      >
        <View
          style={[
            styles.box,
            { borderColor: checked ? colors.primary : colors.borderStrong, backgroundColor: checked ? colors.primary : 'transparent' },
          ]}
        >
          {checked ? <Feather name="check" size={13} color="#FFFFFF" /> : null}
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
          {description ? <Text style={[styles.description, { color: colors.textMuted }]}>{description}</Text> : null}
        </View>
      </Pressable>
      {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  box: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  label: { fontFamily: fonts.semiBold, fontSize: 13, lineHeight: 18 },
  description: { fontFamily: fonts.regular, fontSize: 11.5, lineHeight: 16 },
  error: { fontFamily: fonts.medium, fontSize: 11, paddingHorizontal: 4 },
});
