import React, { useState } from 'react';
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Card, ConfirmDialog, Pill, SectionTitle, PrimaryButton } from '../components/ui';
import { fontSize, radius, spacing } from '../theme';
import { getWitnessAvatar } from '../data/images';
import { KANTOR_SEKRETARIAT_LIST, KantorSekretariat } from '../data/simpan';

export default function SimpanOfficeDetailScreen({ route, navigation }: any) {
  const { colors } = useTheme();
  const [contactDialog, setContactDialog] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({ visible: false, title: '', message: '' });

  const kantorId = route?.params?.kantorId || 'KANTOR-03';

  const kantor: KantorSekretariat =
    KANTOR_SEKRETARIAT_LIST.find((k) => k.id === kantorId) || KANTOR_SEKRETARIAT_LIST[2];

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone.replace(/[^0-9]/g, '')}`).catch(() => {
      setContactDialog({
        visible: true,
        title: 'Kontak Telepon',
        message: `Nomor telepon: ${phone}`,
      });
    });
  };

  const handleWhatsApp = (wa: string) => {
    const cleanWa = wa.replace(/[^0-9]/g, '').replace(/^0/, '62');
    const url = `whatsapp://send?phone=${cleanWa}&text=Halo%20Sekretariat%20simPAN%20${encodeURIComponent(kantor.namaKantor)},%20saya%20kader%20PAN%20ingin%20berkonsultasi.`;
    Linking.openURL(url).catch(() => {
      setContactDialog({
        visible: true,
        title: 'WhatsApp',
        message: `Nomor WhatsApp: ${wa}`,
      });
    });
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}?subject=Konsultasi%20Kader%20simPAN`).catch(() => {
      setContactDialog({
        visible: true,
        title: 'Email',
        message: `Alamat email: ${email}`,
      });
    });
  };

  const handleOpenMaps = () => {
    const query = encodeURIComponent(`${kantor.namaKantor} ${kantor.alamat} ${kantor.kota}`);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
    Linking.openURL(mapsUrl).catch(() => {
      setContactDialog({
        visible: true,
        title: 'Peta',
        message: `Alamat: ${kantor.alamat}, ${kantor.kota}`,
      });
    });
  };

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* Header Card */}
      <Card style={{ gap: spacing.sm }}>
        <View style={styles.headerTopRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Pill label={kantor.tingkat} tone="primary" />
            <Text style={[styles.gedungTag, { color: colors.textMuted }]}>{kantor.statusGedung}</Text>
          </View>
          <View style={[styles.idBadge, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.idBadgeText, { color: colors.primary }]}>{kantor.id}</Text>
          </View>
        </View>

        <Text style={[styles.namaKantor, { color: colors.text }]}>{kantor.namaKantor}</Text>

        <View style={styles.addressRow}>
          <Feather name="map-pin" size={16} color={colors.primary} style={{ marginTop: 2 }} />
          <Text style={[styles.addressText, { color: colors.text }]}>
            {kantor.alamat}, {kantor.kota}, {kantor.provinsi} {kantor.kodePos}
          </Text>
        </View>

        <View style={styles.jamRow}>
          <Feather name="clock" size={14} color={colors.textMuted} />
          <Text style={[styles.jamText, { color: colors.textMuted }]}>{kantor.jamBuka}</Text>
        </View>

        {/* Quick Action Buttons */}
        <View style={[styles.actionGrid, { borderTopColor: colors.border }]}>
          <Pressable
            onPress={handleOpenMaps}
            style={({ pressed }) => [
              styles.actionItem,
              { backgroundColor: colors.primaryLight },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Feather name="navigation" size={16} color={colors.primary} />
            <Text style={[styles.actionItemText, { color: colors.primary }]}>Petunjuk Arah</Text>
          </Pressable>

          <Pressable
            onPress={() => handleWhatsApp(kantor.whatsapp)}
            style={({ pressed }) => [
              styles.actionItem,
              { backgroundColor: '#DCFCE7' },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Feather name="message-circle" size={16} color="#15803D" />
            <Text style={[styles.actionItemText, { color: '#15803D' }]}>WhatsApp</Text>
          </Pressable>

          <Pressable
            onPress={() => handleCall(kantor.telepon)}
            style={({ pressed }) => [
              styles.actionItem,
              { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Feather name="phone" size={16} color={colors.text} />
            <Text style={[styles.actionItemText, { color: colors.text }]}>Telepon</Text>
          </Pressable>

          <Pressable
            onPress={() => handleEmail(kantor.email)}
            style={({ pressed }) => [
              styles.actionItem,
              { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Feather name="mail" size={16} color={colors.text} />
            <Text style={[styles.actionItemText, { color: colors.text }]}>Email</Text>
          </Pressable>
        </View>
      </Card>

      {/* Detail Kepala & Staf Sekretariat */}
      <Card style={{ gap: spacing.sm }}>
        <SectionTitle style={{ marginBottom: 0 }}>Pimpinan & Narahubung Sekretariat</SectionTitle>
        <Text style={[styles.subHint, { color: colors.textMuted }]}>
          Pejabat penanggung jawab operasional kantor dan layanan administrasi keanggotaan.
        </Text>

        <View style={[styles.staffCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <View style={styles.staffAvatarContainer}>
            <Image
              source={getWitnessAvatar(kantor.avatarIndex ?? 0)}
              style={styles.staffAvatarImg}
            />
            <View style={[styles.staffOnlineDot, { borderColor: colors.background }]} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[styles.staffName, { color: colors.text }]}>{kantor.kepalaSekretariat}</Text>
            <Text style={[styles.staffRole, { color: colors.primary }]}>{kantor.jabatanKepala}</Text>
            {kantor.nipKepala && (
              <Text style={[styles.staffNip, { color: colors.textMuted }]}>NIP Partai: {kantor.nipKepala}</Text>
            )}
          </View>
        </View>

        <View style={[styles.contactBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Feather name="headphones" size={14} color={colors.primary} />
            <Text style={[styles.contactBoxTitle, { color: colors.text }]}>Hotline Pelayanan / Front Desk:</Text>
          </View>
          <Text style={[styles.contactBoxVal, { color: colors.primary }]}>{kantor.kontakPetugasKonter}</Text>
        </View>
      </Card>

      {/* Konter Pelayanan simPAN Terpadu */}
      <View style={{ gap: spacing.xs }}>
        <SectionTitle style={{ marginBottom: 2 }}>Konter Pelayanan Terpadu simPAN</SectionTitle>
        <Text style={[styles.subHint, { color: colors.textMuted }]}>
          Layanan tatap muka dan bantuan teknis yang tersedia di sekretariat ini.
        </Text>

        <View style={{ gap: spacing.sm, marginTop: spacing.xs }}>
          {kantor.konterLayanan.map((layanan) => {
            const isSiaga = layanan.status === 'SIAGA_PEMILU';
            return (
              <Card key={layanan.id} style={{ gap: spacing.xs }}>
                <View style={styles.loketHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.loketTag, { color: colors.primary }]}>{layanan.loket}</Text>
                    <Text style={[styles.layananTitle, { color: colors.text }]}>{layanan.namaLayanan}</Text>
                  </View>
                  <Pill
                    label={isSiaga ? 'Siaga Pemilu' : 'Buka'}
                    tone={isSiaga ? 'warning' : 'success'}
                  />
                </View>

                <Text style={[styles.layananDesc, { color: colors.textMuted }]}>{layanan.deskripsi}</Text>

                <View style={[styles.layananMetaRow, { borderTopColor: colors.border }]}>
                  <View style={styles.metaItem}>
                    <Feather name="clock" size={12} color={colors.textMuted} />
                    <Text style={[styles.metaText, { color: colors.textMuted }]}>{layanan.waktuOperasional}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Feather name="check-circle" size={12} color={colors.primary} />
                    <Text style={[styles.metaText, { color: colors.primary, fontWeight: '700' }]}>
                      Estimasi: {layanan.estimasiProses}
                    </Text>
                  </View>
                </View>
              </Card>
            );
          })}
        </View>
      </View>

      {/* Fasilitas Gedung */}
      <Card style={{ gap: spacing.sm }}>
        <SectionTitle style={{ marginBottom: 0 }}>Fasilitas & Sarana Kantor</SectionTitle>
        <Text style={[styles.subHint, { color: colors.textMuted }]}>
          Sarana penunjang kegiatan konsolidasi, rapat pleno, dan posko pemilu.
        </Text>

        <View style={styles.fasilitasGrid}>
          {kantor.fasilitas.map((f, idx) => (
            <View
              key={idx}
              style={[styles.fasilitasItem, { backgroundColor: colors.background, borderColor: colors.border }]}
            >
              <Feather name="check" size={14} color={colors.primary} style={{ marginTop: 2 }} />
              <Text style={[styles.fasilitasText, { color: colors.text }]}>{f}</Text>
            </View>
          ))}
        </View>
      </Card>

      {/* Navigasi Peta Google Maps Action */}
      <PrimaryButton
        label="Buka Rute Navigasi (Google Maps)"
        icon="map"
        onPress={handleOpenMaps}
        style={{ marginTop: spacing.xs }}
      />

      <ConfirmDialog
        visible={contactDialog.visible}
        title={contactDialog.title}
        message={contactDialog.message}
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
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  gedungTag: { fontSize: 11, fontWeight: '600' },
  idBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.pill },
  idBadgeText: { fontSize: 10, fontWeight: '800' },
  namaKantor: { fontSize: fontSize.lg, fontWeight: '900', marginTop: 2 },
  addressRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  addressText: { fontSize: fontSize.xs, flex: 1, lineHeight: 18 },
  jamRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  jamText: { fontSize: 11 },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    marginTop: spacing.xs,
  },
  actionItem: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.md,
  },
  actionItemText: { fontSize: 11, fontWeight: '800' },
  subHint: { fontSize: fontSize.xs, lineHeight: 16 },
  staffCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  staffAvatarContainer: {
    position: 'relative',
  },
  staffAvatarImg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#0066B3',
  },
  staffOnlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: '#16A34A',
    borderWidth: 2,
  },
  staffName: { fontSize: fontSize.sm, fontWeight: '800' },
  staffRole: { fontSize: 11, fontWeight: '700' },
  staffNip: { fontSize: 10 },
  contactBox: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: 4,
  },
  contactBoxTitle: { fontSize: 11, fontWeight: '700' },
  contactBoxVal: { fontSize: fontSize.xs, fontWeight: '800' },
  loketHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  loketTag: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' },
  layananTitle: { fontSize: fontSize.sm, fontWeight: '800', marginTop: 2 },
  layananDesc: { fontSize: fontSize.xs, lineHeight: 17 },
  layananMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 0.5,
    marginTop: 4,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 10.5 },
  fasilitasGrid: { gap: 6 },
  fasilitasItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  fasilitasText: { fontSize: fontSize.xs, flex: 1, lineHeight: 18 },
});
