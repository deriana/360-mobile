import React, { useState } from 'react';
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Card, ConfirmDialog, Pill, SectionTitle } from '../components/ui';
import { fonts, fontSize, radius, spacing } from '../theme';
import { getWitnessAvatar } from '../data/images';
import { KANTOR_SEKRETARIAT_LIST, KantorSekretariat } from '../data/simpan';

export default function SimpanOfficesScreen({ navigation }: any) {
  const { role, currentUser } = useApp();
  const { colors, isDark } = useTheme();
  const [tabFilter, setTabFilter] = useState<'posko_wilayah' | 'semua_kantor'>('posko_wilayah');
  const [contactDialog, setContactDialog] = useState<{
    visible: boolean;
    phone: string;
  }>({ visible: false, phone: '' });

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone.replace(/[^0-9]/g, '')}`).catch(() => {
      setContactDialog({ visible: true, phone });
    });
  };

  const isVolunteer = role === 'VOLUNTEER' || role === 'RELAWAN';

  // Sort & Filter: Untuk relawan Siti Rahmawati, posko wilayah Dago dan DPC Coblong adalah prioritas utama
  const displayList: KantorSekretariat[] = React.useMemo(() => {
    if (tabFilter === 'posko_wilayah') {
      // Prioritas 1: Posko Relawan Dago (KANTOR-05), Prioritas 2: DPC Coblong (KANTOR-04)
      const localOffices = KANTOR_SEKRETARIAT_LIST.filter(
        (k) => k.id === 'KANTOR-05' || k.id === 'KANTOR-04'
      );
      return localOffices.length > 0 ? localOffices : KANTOR_SEKRETARIAT_LIST;
    }
    return KANTOR_SEKRETARIAT_LIST;
  }, [tabFilter]);

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* Header Banner Konteks Wilayah Relawan */}
      {isVolunteer && (
        <View
          style={{
            backgroundColor: isDark ? 'rgba(0,43,82,0.35)' : '#F0F9FF',
            borderRadius: radius.md,
            borderWidth: 1,
            borderColor: colors.border,
            padding: spacing.sm,
            gap: 4,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Feather name="map-pin" size={13} color={colors.primary} />
            <Text style={{ fontFamily: fonts.bold, fontSize: fontSize.xs, color: colors.primary }}>
              Wilayah Dampingan: Kelurahan Dago, Coblong
            </Text>
          </View>
          <Text style={{ fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted, lineHeight: 16 }}>
            Berikut adalah posko operasional lapangan dan kantor sekretariat kecamatan tempat berkumpul serta koordinasi relawan.
          </Text>
        </View>
      )}

      {/* Segment Tab: Posko Wilayah Dago vs Seluruh Kantor Partai */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
          borderRadius: radius.pill,
          padding: 3,
        }}
      >
        <Pressable
          onPress={() => setTabFilter('posko_wilayah')}
          style={[
            styles.segmentBtn,
            tabFilter === 'posko_wilayah' && { backgroundColor: colors.primary },
          ]}
        >
          <Feather
            name="map-pin"
            size={12}
            color={tabFilter === 'posko_wilayah' ? '#FFFFFF' : colors.textMuted}
          />
          <Text
            style={[
              styles.segmentBtnText,
              {
                color: tabFilter === 'posko_wilayah' ? '#FFFFFF' : colors.textMuted,
                fontFamily: tabFilter === 'posko_wilayah' ? fonts.bold : fonts.medium,
              },
            ]}
          >
            Posko Wilayah Dago (2)
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setTabFilter('semua_kantor')}
          style={[
            styles.segmentBtn,
            tabFilter === 'semua_kantor' && { backgroundColor: colors.primary },
          ]}
        >
          <Feather
            name="grid"
            size={12}
            color={tabFilter === 'semua_kantor' ? '#FFFFFF' : colors.textMuted}
          />
          <Text
            style={[
              styles.segmentBtnText,
              {
                color: tabFilter === 'semua_kantor' ? '#FFFFFF' : colors.textMuted,
                fontFamily: tabFilter === 'semua_kantor' ? fonts.bold : fonts.medium,
              },
            ]}
          >
            Semua Kantor ({KANTOR_SEKRETARIAT_LIST.length})
          </Text>
        </Pressable>
      </View>

      {/* List Card Posko & Kantor */}
      <View style={{ gap: spacing.md }}>
        {displayList.map((kantor) => {
          const isPrimaryPosko = kantor.id === 'KANTOR-05';

          return (
            <Pressable
              key={kantor.id}
              onPress={() => navigation.navigate('SimpanOfficeDetail', { kantorId: kantor.id })}
              style={({ pressed }) => [pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] }]}
            >
              <Card
                style={[
                  { gap: spacing.xs },
                  isPrimaryPosko && {
                    borderColor: colors.primary,
                    borderWidth: 1.5,
                  },
                ]}
              >
                {/* Header Card Scannable: Tingkat Badge + Tag Status Gedung */}
                <View style={styles.kantorHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <Pill
                        label={kantor.tingkat}
                        tone={isPrimaryPosko ? 'primary' : 'info'}
                      />
                      <Text style={{ fontSize: 10.5, fontFamily: fonts.medium, color: colors.textMuted }}>
                        {kantor.statusGedung}
                      </Text>
                    </View>
                    <Text style={[styles.kantorNama, { color: colors.text }]}>{kantor.namaKantor}</Text>
                  </View>
                  <Feather name="chevron-right" size={18} color={colors.textMuted} />
                </View>

                {/* Alamat & Jam Buka Ringkas */}
                <View style={[styles.rowInfo, { borderTopColor: colors.border, paddingTop: 6, borderTopWidth: StyleSheet.hairlineWidth }]}>
                  <Feather name="map-pin" size={13} color={colors.primary} style={{ marginTop: 2 }} />
                  <Text style={[styles.alamatText, { color: colors.text }]} numberOfLines={2}>
                    {kantor.alamat}, {kantor.kota}
                  </Text>
                </View>

                <View style={styles.rowInfo}>
                  <Feather name="clock" size={13} color={colors.textMuted} />
                  <Text style={[styles.subInfoText, { color: colors.textMuted }]}>{kantor.jamBuka}</Text>
                </View>

                {/* Penanggung Jawab / Korlap Lapangan */}
                <View style={[styles.leaderRow, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', borderColor: colors.border }]}>
                  <Image
                    source={getWitnessAvatar(kantor.avatarIndex ?? 0)}
                    style={styles.leaderAvatar}
                  />
                  <View style={{ flex: 1, gap: 1 }}>
                    <Text style={[styles.leaderName, { color: colors.text }]}>{kantor.kepalaSekretariat}</Text>
                    <Text style={[styles.leaderRole, { color: colors.primary }]}>{kantor.jabatanKepala}</Text>
                  </View>
                </View>

                {/* Layanan Utama / Fungsi Posko */}
                <View style={[styles.konterBadgeRow, { backgroundColor: isDark ? 'rgba(0,102,179,0.15)' : '#EFF6FF' }]}>
                  <Feather name="check-circle" size={12} color={colors.primary} />
                  <Text style={[styles.konterBadgeText, { color: colors.primary }]} numberOfLines={1}>
                    {kantor.konterLayanan.map((l) => l.namaLayanan.replace('Konter ', '').replace('Posko ', '')).join(' • ')}
                  </Text>
                </View>

                {/* Actions Bottom Bar */}
                <View style={[styles.actionsRow, { borderTopColor: colors.border }]}>
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      handleCall(kantor.telepon);
                    }}
                    style={({ pressed }) => [
                      styles.actionBtn,
                      { backgroundColor: isDark ? 'rgba(0,102,179,0.2)' : '#E0F2FE' },
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <Feather name="phone" size={11} color={colors.primary} />
                    <Text style={[styles.actionBtnText, { color: colors.primary }]}>{kantor.telepon}</Text>
                  </Pressable>

                  <View style={styles.detailBtn}>
                    <Text style={[styles.detailBtnText, { color: colors.primary }]}>Buka Info & Fasilitas</Text>
                    <Feather name="arrow-right" size={12} color={colors.primary} />
                  </View>
                </View>
              </Card>
            </Pressable>
          );
        })}
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
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 7,
    borderRadius: radius.pill,
  },
  segmentBtnText: {
    fontSize: 11.5,
  },
});
