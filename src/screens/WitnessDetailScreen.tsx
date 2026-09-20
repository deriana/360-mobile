import React, { useState } from 'react';
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Card, ConfirmDialog, EmptyState, Pill, PrimaryButton, SectionTitle } from '../components/ui';
import { fonts, fontSize, radius, spacing } from '../theme';
import { maskNik, maskPhone } from '../utils/masking';
import { getStableAvatar } from '../data/images';
import { getActiveWitnessScope } from '../utils/witnessResolver';

export default function WitnessDetailScreen({ route, navigation }: any) {
  const { witnesses, tps, checkInWitness, currentUser } = useApp();
  const { colors, isDark } = useTheme();
  const [showFullNik, setShowFullNik] = useState(false);
  const [dialogInfo, setDialogInfo] = useState<{ visible: boolean; title: string; message: string }>({
    visible: false,
    title: '',
    message: '',
  });

  const activeScope = getActiveWitnessScope(currentUser, witnesses, tps);
  const witnessId = route?.params?.witnessId || activeScope.witnessId;
  const witness = witnesses.find((w) => w.id === witnessId) || (witnessId === activeScope.witnessId ? activeScope.witness : null);

  if (!witness) {
    return <EmptyState title="Saksi Tidak Ditemukan" body="Data saksi ini tidak tersedia atau telah dihapus." icon="user-x" />;
  }

  const assignedTps = tps.find((t) => t.id === witness.assignedTpsId) || (witnessId === activeScope.witnessId ? activeScope.tps : null);
  const avatarUrl = getStableAvatar(witness.id);
  const isCheckedIn = witness.status === 'checked_in';

  const handleCall = () => {
    Linking.openURL(`tel:${witness.phone.replace(/[^0-9]/g, '')}`).catch(() => {
      setDialogInfo({
        visible: true,
        title: 'Panggilan Telepon',
        message: `Nomor telepon saksi: ${witness.phone}`,
      });
    });
  };

  const handleSendReminder = () => {
    const cleanPhone = witness.phone.replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
    const message = `Halo Sdr/i ${witness.name}, pengingat dari Koordinator PAN: Mohon segera melakukan check-in dan persiapan penugasan Saksi di ${witness.assignedTpsId}. Terima kasih!`;
    const url = `whatsapp://send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`;

    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Linking.openURL(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`);
      }
    }).catch(() => {
      Linking.openURL(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`);
    });
  };

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* 1. Header Card: Profile Identity */}
      <Card style={styles.headerCard}>
        <View style={styles.avatarWrap}>
          <Image source={avatarUrl} style={[styles.avatarImage, { borderColor: colors.primary }]} />
          <View
            style={[
              styles.avatarDot,
              {
                backgroundColor: isCheckedIn ? '#10B981' : '#F59E0B',
                borderColor: colors.surface,
              },
            ]}
          />
        </View>

        <Text style={[styles.name, { color: colors.text }]}>{witness.name}</Text>

        <View style={styles.badgeRow}>
          <View style={[styles.idPill, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.idText, { color: colors.primary }]}>{witness.id}</Text>
          </View>
          <Pill
            label={isCheckedIn ? 'Sudah Check-in' : witness.status === 'assigned' ? 'Ditugaskan' : 'Tidak Hadir'}
            tone={isCheckedIn ? 'success' : witness.status === 'assigned' ? 'warning' : 'danger'}
          />
        </View>

        {/* Quick Contact Action Buttons */}
        <View style={[styles.contactActionRow, { borderTopColor: colors.border }]}>
          <Pressable
            onPress={handleCall}
            style={({ pressed }) => [
              styles.contactBtn,
              { backgroundColor: colors.background, borderColor: colors.border },
              pressed && { opacity: 0.75 },
            ]}
          >
            <Feather name="phone" size={14} color={colors.primary} />
            <Text style={[styles.contactBtnText, { color: colors.text }]}>Hubungi</Text>
          </Pressable>

          <Pressable
            onPress={handleSendReminder}
            style={({ pressed }) => [
              styles.contactBtn,
              { backgroundColor: isDark ? 'rgba(22,163,74,0.18)' : '#DCFCE7', borderColor: '#86EFAC' },
              pressed && { opacity: 0.75 },
            ]}
          >
            <Feather name="message-circle" size={14} color="#15803D" />
            <Text style={[styles.contactBtnText, { color: '#15803D' }]}>
              {isCheckedIn ? 'Kirim Pesan WA' : 'Ingatkan via WA'}
            </Text>
          </Pressable>
        </View>
      </Card>

      {/* 2. Profil & Identitas Saksi (Tanpa Redudansi) */}
      <Card style={{ gap: spacing.xs, padding: spacing.md }}>
        <SectionTitle style={{ marginBottom: spacing.xs }}>Identitas & Penugasan</SectionTitle>

        <View style={[styles.row, { borderBottomColor: colors.border }]}>
          <Text style={[styles.rowLabel, { color: colors.textMuted }]}>NIK Saksi</Text>
          <View style={styles.nikValueRow}>
            <Text style={[styles.rowValue, { color: colors.text }]}>
              {showFullNik ? witness.nik : maskNik(witness.nik)}
            </Text>
            <Pressable
              onPress={() => setShowFullNik((v) => !v)}
              hitSlop={8}
              style={styles.eyeBtn}
            >
              <Feather
                name={showFullNik ? 'eye-off' : 'eye'}
                size={14}
                color={colors.primary}
              />
            </Pressable>
          </View>
        </View>

        <View style={[styles.row, { borderBottomColor: colors.border }]}>
          <Text style={[styles.rowLabel, { color: colors.textMuted }]}>Nomor Telepon</Text>
          <Text style={[styles.rowValue, { color: colors.text }]}>
            {witness.phone}
          </Text>
        </View>

        <View style={[styles.row, { borderBottomColor: colors.border }]}>
          <Text style={[styles.rowLabel, { color: colors.textMuted }]}>TPS Penugasan</Text>
          <View style={styles.tpsBadge}>
            <Feather name="map-pin" size={12} color={colors.primary} />
            <Text style={[styles.tpsBadgeText, { color: colors.primary }]}>{witness.assignedTpsId}</Text>
          </View>
        </View>

        {assignedTps && (
          <View style={[styles.row, { borderBottomColor: colors.border }]}>
            <Text style={[styles.rowLabel, { color: colors.textMuted }]}>Wilayah TPS</Text>
            <Text style={[styles.rowValue, { color: colors.text }]}>
              {assignedTps.district}, {assignedTps.regency}
            </Text>
          </View>
        )}

        <View style={[styles.row, { borderBottomColor: 'transparent', paddingBottom: 0 }]}>
          <Text style={[styles.rowLabel, { color: colors.textMuted }]}>Alamat Domisili</Text>
          <Text style={[styles.rowValue, { color: colors.text, textAlign: 'right', flex: 1 }]}>
            {witness.address}
          </Text>
        </View>
      </Card>

      {/* 3. Detail Presensi (Hanya jika sudah check-in) */}
      {isCheckedIn && (
        <Card style={{ gap: spacing.xs, padding: spacing.md }}>
          <View style={styles.presensiHeader}>
            <SectionTitle style={{ marginBottom: 0 }}>Presensi Lapangan</SectionTitle>
            <View style={[styles.verifiedBadge, { backgroundColor: isDark ? 'rgba(16,185,129,0.18)' : '#D1FAE5' }]}>
              <Feather name="check" size={11} color="#059669" />
              <Text style={styles.verifiedText}>Terverifikasi GPS</Text>
            </View>
          </View>

          <View style={[styles.row, { borderBottomColor: colors.border }]}>
            <Text style={[styles.rowLabel, { color: colors.textMuted }]}>Waktu Presensi</Text>
            <Text style={[styles.rowValue, { color: colors.text }]}>{witness.checkInTime ?? '-'}</Text>
          </View>

          <View style={[styles.row, { borderBottomColor: colors.border }]}>
            <Text style={[styles.rowLabel, { color: colors.textMuted }]}>Lokasi Presensi</Text>
            <Text style={[styles.rowValue, { color: colors.text }]}>{witness.checkInLocation ?? '-'}</Text>
          </View>

          {witness.checkInLat && witness.checkInLng && (
            <View style={[styles.row, { borderBottomColor: 'transparent', paddingBottom: 0 }]}>
              <Text style={[styles.rowLabel, { color: colors.textMuted }]}>Koordinat GPS</Text>
              <Text style={[styles.rowValue, { color: colors.text }]}>
                {witness.checkInLat.toFixed(4)}, {witness.checkInLng.toFixed(4)}
              </Text>
            </View>
          )}
        </Card>
      )}

      {/* 4. Action Buttons Grid */}
      <View style={styles.actionGrid}>
        <View style={{ flex: 1 }}>
          <PrimaryButton
            label="Kartu Petugas"
            variant="secondary"
            icon="credit-card"
            onPress={() => navigation.navigate('KartuPetugas', { personType: 'witness', personId: witness.id })}
          />
        </View>

        <View style={{ flex: 1 }}>
          <PrimaryButton
            label="Surat Tugas"
            variant="secondary"
            icon="file-text"
            onPress={() => navigation.navigate('AssignmentLetter', { witnessId: witness.id })}
          />
        </View>
      </View>

      {!isCheckedIn && (
        <PrimaryButton
          label="Tandai Check-in (Simulasi)"
          icon="check-circle"
          onPress={() => checkInWitness(witness.id)}
        />
      )}

      <ConfirmDialog
        visible={dialogInfo.visible}
        title={dialogInfo.title}
        message={dialogInfo.message}
        tone="info"
        singleButton
        confirmLabel="Mengerti"
        onConfirm={() => setDialogInfo((v) => ({ ...v, visible: false }))}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl + 10 },
  headerCard: {
    alignItems: 'center',
    gap: 8,
    padding: spacing.md,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: 2,
  },
  avatarImage: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
  },
  avatarDot: {
    position: 'absolute',
    bottom: 0,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  name: {
    fontFamily: fonts.bold,
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  idPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  idText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    fontWeight: '800',
  },
  contactActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    paddingTop: spacing.sm + 2,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 4,
  },
  contactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  contactBtnText: {
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 9,
    gap: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    flexShrink: 0,
  },
  rowValue: {
    fontFamily: fonts.semiBold,
    fontSize: 12.5,
  },
  nikValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eyeBtn: {
    padding: 2,
  },
  tpsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tpsBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    fontWeight: '800',
  },
  presensiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: radius.pill,
  },
  verifiedText: {
    fontFamily: fonts.bold,
    fontSize: 10.5,
    color: '#059669',
    fontWeight: '700',
  },
  actionGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: 2,
  },
});


