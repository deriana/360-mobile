import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { fonts, radius, spacing } from '../../theme';

interface ContactActionsProps {
  phone: string;
}

/** "0812-3456-7890" → "6281234567890" (format wa.me). */
function toWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.startsWith('0') ? `62${digits.slice(1)}` : digits;
}

/** Dua tombol kecil untuk menghubungi koordinator: Telepon dan WhatsApp. */
export default function ContactActions({ phone }: ContactActionsProps) {
  const { colors } = useTheme();
  const digits = phone.replace(/\D/g, '');

  const items = [
    { label: 'Telepon', icon: 'phone' as const, url: `tel:${digits}` },
    { label: 'WhatsApp', icon: 'message-circle' as const, url: `https://wa.me/${toWhatsAppNumber(phone)}` },
  ];

  return (
    <View style={styles.row}>
      {items.map((item) => (
        <Pressable
          key={item.label}
          onPress={() => Linking.openURL(item.url)}
          accessibilityRole="button"
          accessibilityLabel={`${item.label} koordinator`}
          style={({ pressed }) => [
            styles.btn,
            { borderColor: colors.primary, backgroundColor: colors.primaryLight },
            pressed && { opacity: 0.8 },
          ]}
        >
          <Feather name={item.icon} size={14} color={colors.primary} />
          <Text style={[styles.text, { color: colors.primary }]}>{item.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  text: { fontFamily: fonts.semiBold, fontSize: 12 },
});
