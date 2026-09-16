import React, { useState } from 'react';
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Card, ConfirmDialog, Pill, SectionTitle } from '../components/ui';
import { fonts, fontSize, radius, spacing } from '../theme';
import { getWitnessAvatar } from '../data/images';
import { KANTOR_SEKRETARIAT_LIST } from '../data/simpan';

export default function SimpanOfficesScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [contactDialog, setContactDialog] = useState<{
    visible: boolean;
    phone: string;
  }>({ visible: false, phone: '' });

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone.replace(/[^0-9]/g, '')}`).catch(() => {
      setContactDialog({ visible: true, phone });
    });
  };

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={{ gap: spacing.md }}>
        {KANTOR_SEKRETARIAT_LIST.map((kantor) => (
          <Pressable
            key={kantor.id}
            onPress={() => navigation.navigate('SimpanOfficeDetail', { kantorId: kantor.id })}
            style={({ pressed }) => [pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] }]}
          >
            <Card style={{ gap: spacing.sm }}>
              <View style={styles.kantorHeader}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <Pill label={kantor.tingkat} tone="primary" />
                    <Text style={{ fontSize: 10, color: colors.textMuted }}>{kantor.statusGedung}</Text>
                  </View>
                  <Text style={[styles.kantorNama, { color: colors.text }]}>{kantor.namaKantor}</Text>
                </View>
                <Feather name="chevron-right" size={20} color={colors.textMuted} />
              </View>

              <View style={[styles.rowInfo, { borderTopColor: colors.border }]}>
                <Feather name="map-pin" size={14} color={colors.primary} style={{ marginTop: 2 }} />
                <Text style={[styles.alamatText, { color: colors.text }]}>
                  {kantor.alamat}, {kantor.kota}, {kantor.provinsi} {kantor.kodePos}
                </Text>
              </View>

              <View style={styles.rowInfo}>
                <Feather name="clock" size={14} color={colors.textMuted} />
                <Text style={[styles.subInfoText, { color: colors.textMuted }]}>{kantor.jamBuka}</Text>
              </View>

              <View style={[styles.leaderRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Image
                  source={getWitnessAvatar(kantor.avatarIndex ?? 0)}
                  style={styles.leaderAvatar}
                />
                <View style={{ flex: 1, gap: 1 }}>
                  <Text style={[styles.leaderName, { color: colors.text }]}>{kantor.kepalaSekretariat}</Text>
                  <Text style={[styles.leaderRole, { color: colors.primary }]}>{kantor.jabatanKepala}</Text>
                </View>
              </View>

              <View style={[styles.konterBadgeRow, { backgroundColor: colors.primaryLight }]}>
                <Feather name="layers" size={13} color={colors.primary} />
                <Text style={[styles.konterBadgeText, { color: colors.primary }]}>
                  {kantor.konterLayanan.length} Layanan Konter Terpadu: {kantor.konterLayanan.map((l) => l.namaLayanan.split(' ')[0]).join(', ')}...
                </Text>
              </View>

              <View style={[styles.actionsRow, { borderTopColor: colors.border }]}>
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    handleCall(kantor.telepon);
                  }}
                  style={({ pressed }) => [
                    styles.actionBtn,
                    { backgroundColor: colors.primaryLight },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Feather name="phone" size={12} color={colors.primary} />
                  <Text style={[styles.actionBtnText, { color: colors.primary }]}>{kantor.telepon}</Text>
                </Pressable>

                <View style={styles.detailBtn}>
                  <Text style={[styles.detailBtnText, { color: colors.primary }]}>Buka Konter & Detail</Text>
                  <Feather name="arrow-right" size={12} color={colors.primary} />
                </View>
              </View>
            </Card>
          </Pressable>
        ))}
      </View>

      <ConfirmDialog
        visible={contactDialog.visible}
        title="Kontak Telepon"
        message={`Nomor telepon kantor: ${contactDialog.phone}`}
        tone="info"
        singleButton
        confirmLabel="Mengerti"
        onConfirm={() => setContactDialog((prev) => ({ ...prev, visible: false }))}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },
  kantorHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  kantorNama: { fontFamily: fonts.bold, fontSize: fontSize.md },
  rowInfo: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  alamatText: { fontFamily: fonts.regular, fontSize: fontSize.xs, flex: 1, lineHeight: 18 },
  subInfoText: { fontFamily: fonts.medium, fontSize: 11 },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
    borderTopWidth: 0.5,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  actionBtnText: { fontFamily: fonts.bold, fontSize: 11 },
  emailBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  konterBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  konterBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    flex: 1,
  },
  detailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  detailBtnText: {
    fontFamily: fonts.bold,
    fontSize: 11,
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  leaderAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#0066B3',
  },
  leaderName: {
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  leaderRole: {
    fontFamily: fonts.semiBold,
    fontSize: 10.5,
  },
});
