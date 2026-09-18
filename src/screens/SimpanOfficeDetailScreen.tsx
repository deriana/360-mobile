import React, { useState } from 'react';
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Card, ConfirmDialog, Pill, SectionTitle, PrimaryButton } from '../components/ui';
import { fonts, fontSize, radius, spacing } from '../theme';
import { getWitnessAvatar } from '../data/images';
import { KANTOR_SEKRETARIAT_LIST, KantorSekretariat } from '../data/simpan';

export default function SimpanOfficeDetailScreen({ route, navigation }: any) {
  const { colors, isDark } = useTheme();
  const [contactDialog, setContactDialog] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({ visible: false, title: '', message: '' });

  const kantorId = route?.params?.kantorId || 'KANTOR-05';

  const kantor: KantorSekretariat =
    KANTOR_SEKRETARIAT_LIST.find((k) => k.id === kantorId) || KANTOR_SEKRETARIAT_LIST[4];

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
        title: 'Peta Lokasi',
        message: `Alamat: ${kantor.alamat}, ${kantor.kota}`,
      });
    });
  };

  const isPosko = kantor.tingkat === 'POSKO';

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* 1. Header Card: Identitas Utama & Lokasi */}
      <Card style={{ gap: spacing.sm, padding: spacing.md }}>
        {/* Top Badges Row */}
        <View style={styles.headerTopRow}>
          <View style={styles.badgeGroup}>
            <View style={[styles.tingkatBadge, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
              <Feather name={isPosko ? 'flag' : 'briefcase'} size={11} color={colors.primary} />
              <Text style={[styles.tingkatBadgeText, { color: colors.primary }]}>{kantor.tingkat}</Text>
            </View>

            <View style={[styles.idBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' }]}>
              <Text style={[styles.idBadgeText, { color: colors.textMuted }]}>{kantor.id}</Text>
            </View>
          </View>

          <View style={styles.statusLiveWrap}>
            <View style={[styles.liveDot, { backgroundColor: '#10B981' }]} />
            <Text style={[styles.statusLiveText, { color: colors.textMuted }]}>Aktif</Text>
          </View>
        </View>

        {/* Title & Status Gedung */}
        <View style={{ gap: 4, marginTop: 2 }}>
          <Text style={[styles.namaKantor, { color: colors.text }]}>{kantor.namaKantor}</Text>
          <Text style={[styles.gedungSub, { color: colors.textMuted }]}>{kantor.statusGedung}</Text>
        </View>

        {/* Alamat & Jam Buka Info Box */}
        <View style={[styles.infoCardBox, { backgroundColor: isDark ? 'rgba(0,43,82,0.3)' : '#F8FAFC', borderColor: colors.border }]}>
          <View style={styles.infoRow}>
            <View style={[styles.infoIconWrap, { backgroundColor: colors.primaryLight }]}>
              <Feather name="map-pin" size={13} color={colors.primary} />
            </View>
            <Text style={[styles.addressText, { color: colors.text }]}>
              {kantor.alamat}, {kantor.kota}, {kantor.provinsi} {kantor.kodePos}
            </Text>
          </View>

          <View style={[styles.infoDivider, { backgroundColor: colors.border }]} />

          <View style={styles.infoRow}>
            <View style={[styles.infoIconWrap, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9' }]}>
              <Feather name="clock" size={13} color={colors.textMuted} />
            </View>
            <Text style={[styles.jamText, { color: colors.textMuted }]}>{kantor.jamBuka}</Text>
          </View>
        </View>

        {/* 4 Action Buttons Grid */}
        <View style={[styles.actionGrid, { borderTopColor: colors.border }]}>
          <Pressable
            onPress={handleOpenMaps}
            style={({ pressed }) => [
              styles.actionItem,
              { backgroundColor: colors.primaryLight, borderColor: colors.primary },
              pressed && { opacity: 0.75, transform: [{ scale: 0.98 }] },
            ]}
          >
            <Feather name="navigation" size={14} color={colors.primary} />
            <Text style={[styles.actionItemText, { color: colors.primary }]}>Petunjuk Arah</Text>
          </Pressable>

          <Pressable
            onPress={() => handleWhatsApp(kantor.whatsapp)}
            style={({ pressed }) => [
              styles.actionItem,
              { backgroundColor: isDark ? 'rgba(22,163,74,0.18)' : '#DCFCE7', borderColor: '#86EFAC' },
              pressed && { opacity: 0.75, transform: [{ scale: 0.98 }] },
            ]}
          >
            <Feather name="message-circle" size={14} color="#15803D" />
            <Text style={[styles.actionItemText, { color: '#15803D' }]}>WhatsApp</Text>
          </Pressable>

          <Pressable
            onPress={() => handleCall(kantor.telepon)}
            style={({ pressed }) => [
              styles.actionItem,
              { backgroundColor: colors.surface, borderColor: colors.border },
              pressed && { opacity: 0.75, transform: [{ scale: 0.98 }] },
            ]}
          >
            <Feather name="phone" size={14} color={colors.text} />
            <Text style={[styles.actionItemText, { color: colors.text }]}>Telepon</Text>
          </Pressable>

          <Pressable
            onPress={() => handleEmail(kantor.email)}
            style={({ pressed }) => [
              styles.actionItem,
              { backgroundColor: colors.surface, borderColor: colors.border },
              pressed && { opacity: 0.75, transform: [{ scale: 0.98 }] },
            ]}
          >
            <Feather name="mail" size={14} color={colors.text} />
            <Text style={[styles.actionItemText, { color: colors.text }]}>Email</Text>
          </Pressable>
        </View>
      </Card>

      {/* 2. Pimpinan & Narahubung Sekretariat */}
      <Card style={{ gap: spacing.sm, padding: spacing.md }}>
        <View style={styles.sectionHeaderWrap}>
          <SectionTitle style={{ marginBottom: 0 }}>Pimpinan & Narahubung</SectionTitle>
          <Text style={[styles.subHint, { color: colors.textMuted }]}>
            Pejabat penanggung jawab operasional kantor dan layanan keanggotaan.
          </Text>
        </View>

        {/* Profile Card */}
        <View style={[styles.staffCard, { backgroundColor: isDark ? 'rgba(0,43,82,0.3)' : '#F8FAFC', borderColor: colors.border }]}>
          <View style={styles.staffAvatarContainer}>
            <Image
              source={getWitnessAvatar(kantor.avatarIndex ?? 0)}
              style={[styles.staffAvatarImg, { borderColor: colors.primary }]}
            />
            <View style={[styles.staffOnlineDot, { borderColor: isDark ? '#002B52' : '#FFFFFF' }]} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[styles.staffName, { color: colors.text }]} numberOfLines={1}>
              {kantor.kepalaSekretariat}
            </Text>
            <Text style={[styles.staffRole, { color: colors.primary }]} numberOfLines={1}>
              {kantor.jabatanKepala}
            </Text>
            {kantor.nipKepala && (
              <View style={styles.nipRow}>
                <Feather name="shield" size={10} color={colors.textMuted} />
                <Text style={[styles.staffNip, { color: colors.textMuted }]}>ID: {kantor.nipKepala}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Quick Dial Hotline Button */}
        <Pressable
          onPress={() => handleCall(kantor.kontakPetugasKonter)}
          style={({ pressed }) => [
            styles.contactBox,
            { backgroundColor: colors.surface, borderColor: colors.border },
            pressed && { opacity: 0.8 },
          ]}
        >
          <View style={[styles.hotlineIconWrap, { backgroundColor: colors.primaryLight }]}>
            <Feather name="headphones" size={15} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.contactBoxTitle, { color: colors.textMuted }]}>Hotline Pelayanan / Front Desk</Text>
            <Text style={[styles.contactBoxVal, { color: colors.primary }]}>{kantor.kontakPetugasKonter}</Text>
          </View>
          <Feather name="phone-call" size={15} color={colors.primary} />
        </Pressable>
      </Card>

      {/* 3. Konter / Fungsi Layanan Posko */}
      <View style={{ gap: spacing.xs }}>
        <View style={styles.sectionHeaderWrap}>
          <SectionTitle style={{ marginBottom: 2 }}>
            {isPosko ? 'Layanan & Fungsi Posko Relawan' : 'Konter Pelayanan Terpadu simPAN'}
          </SectionTitle>
          <Text style={[styles.subHint, { color: colors.textMuted }]}>
            {isPosko
              ? 'Aktivitas lapangan, pengambilan atribut, dan koordinasi relawan di posko ini.'
              : 'Layanan tatap muka dan bantuan teknis yang tersedia di sekretariat ini.'}
          </Text>
        </View>

        <View style={{ gap: spacing.sm, marginTop: spacing.xs }}>
          {kantor.konterLayanan.map((layanan) => {
            const isSiaga = layanan.status === 'SIAGA_PEMILU';
            return (
              <Card key={layanan.id} style={{ gap: spacing.xs, padding: spacing.md }}>
                <View style={styles.loketHeader}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <View style={styles.loketBadgeWrap}>
                      <Text style={[styles.loketTag, { color: colors.primary }]}>{layanan.loket}</Text>
                    </View>
                    <Text style={[styles.layananTitle, { color: colors.text }]}>{layanan.namaLayanan}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusPill,
                      {
                        backgroundColor: isSiaga
                          ? (isDark ? 'rgba(245,158,11,0.2)' : '#FEF3C7')
                          : (isDark ? 'rgba(16,185,129,0.2)' : '#D1FAE5'),
                        borderColor: isSiaga ? '#F59E0B' : '#10B981',
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.statusPillDot,
                        { backgroundColor: isSiaga ? '#D97706' : '#059669' },
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusPillText,
                        { color: isSiaga ? (isDark ? '#FCD34D' : '#92400E') : (isDark ? '#6EE7B7' : '#065F46') },
                      ]}
                    >
                      {isSiaga ? 'Siaga Pemilu' : 'Buka'}
                    </Text>
                  </View>
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

      {/* 4. Fasilitas Posko / Gedung */}
      <Card style={{ gap: spacing.sm, padding: spacing.md }}>
        <View style={styles.sectionHeaderWrap}>
          <SectionTitle style={{ marginBottom: 0 }}>
            {isPosko ? 'Fasilitas & Sarana Posko' : 'Fasilitas & Sarana Kantor'}
          </SectionTitle>
          <Text style={[styles.subHint, { color: colors.textMuted }]}>
            {isPosko
              ? 'Sarana pendukung operasional relawan, titik istirahat, dan logistik lapangan.'
              : 'Sarana penunjang kegiatan konsolidasi, rapat pleno, dan posko pemilu.'}
          </Text>
        </View>

        <View style={styles.fasilitasGrid}>
          {kantor.fasilitas.map((f, idx) => (
            <View
              key={idx}
              style={[styles.fasilitasItem, { backgroundColor: isDark ? 'rgba(0,43,82,0.3)' : '#F8FAFC', borderColor: colors.border }]}
            >
              <View style={[styles.checkCircle, { backgroundColor: colors.primaryLight }]}>
                <Feather name="check" size={12} color={colors.primary} />
              </View>
              <Text style={[styles.fasilitasText, { color: colors.text }]}>{f}</Text>
            </View>
          ))}
        </View>
      </Card>

      {/* 5. Navigasi Peta Google Maps Action */}
      <View style={{ marginTop: spacing.xs }}>
        <PrimaryButton
          label="Buka Rute Navigasi (Google Maps)"
          icon="navigation"
          onPress={handleOpenMaps}
        />
      </View>

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
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl + 10 },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badgeGroup: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tingkatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  tingkatBadgeText: {
    fontFamily: fonts.extraBold,
    fontSize: 10,
    letterSpacing: 0.6,
  },
  idBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  idBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 10,
  },
  statusLiveWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusLiveText: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
  },
  namaKantor: {
    fontFamily: fonts.extraBold,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  gedungSub: {
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 16,
  },
  infoCardBox: {
    padding: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: 8,
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  infoIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    flex: 1,
    lineHeight: 17,
  },
  infoDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 1,
  },
  jamText: {
    fontFamily: fonts.medium,
    fontSize: 11.5,
    flex: 1,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: spacing.sm + 2,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 2,
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
    borderWidth: 1,
  },
  actionItemText: {
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  sectionHeaderWrap: {
    gap: 2,
  },
  subHint: {
    fontFamily: fonts.regular,
    fontSize: 11.5,
    lineHeight: 16,
  },
  staffCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  staffAvatarContainer: {
    position: 'relative',
  },
  staffAvatarImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
  },
  staffOnlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
  },
  staffName: {
    fontFamily: fonts.bold,
    fontSize: 13.5,
    fontWeight: '800',
  },
  staffRole: {
    fontFamily: fonts.semiBold,
    fontSize: 11.5,
    fontWeight: '700',
  },
  nipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  staffNip: {
    fontFamily: fonts.medium,
    fontSize: 10.5,
  },
  contactBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: 10,
  },
  hotlineIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactBoxTitle: {
    fontFamily: fonts.medium,
    fontSize: 10.5,
  },
  contactBoxVal: {
    fontFamily: fonts.bold,
    fontSize: 12.5,
    fontWeight: '700',
    marginTop: 1,
  },
  loketHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  loketBadgeWrap: {
    alignSelf: 'flex-start',
    marginBottom: 3,
  },
  loketTag: {
    fontFamily: fonts.extraBold,
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  layananTitle: {
    fontFamily: fonts.bold,
    fontSize: 13.5,
    fontWeight: '800',
    lineHeight: 18,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  statusPillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusPillText: {
    fontFamily: fonts.bold,
    fontSize: 10.5,
    fontWeight: '700',
  },
  layananDesc: {
    fontFamily: fonts.regular,
    fontSize: 11.5,
    lineHeight: 17,
  },
  layananMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontFamily: fonts.regular,
    fontSize: 10.5,
  },
  fasilitasGrid: {
    gap: 8,
  },
  fasilitasItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fasilitasText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    flex: 1,
    lineHeight: 17,
  },
});

