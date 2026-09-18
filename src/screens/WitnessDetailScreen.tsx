import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Card, EmptyState, Pill, PrimaryButton, SectionTitle } from '../components/ui';
import { fonts, fontSize, radius, spacing } from '../theme';
import { maskNik, maskPhone } from '../utils/masking';

export default function WitnessDetailScreen({ route, navigation }: any) {
  const witnessId = route?.params?.witnessId || 'SAKSI-001';
  const { witnesses, tps, checkInWitness } = useApp();
  const { colors } = useTheme();

  const witness = witnesses.find((w) => w.id === witnessId);

  if (!witness) {
    return <EmptyState title="Saksi Tidak Ditemukan" body="Data saksi ini tidak tersedia atau telah dihapus." icon="user-x" />;
  }

  const assignedTps = tps.find((t) => t.id === witness.assignedTpsId);

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
      <Card style={styles.headerCard}>
        <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
          <Text style={[styles.avatarText, { color: colors.primary }]}>{witness.name.charAt(0)}</Text>
        </View>
        <Text style={[styles.name, { color: colors.text }]}>{witness.name}</Text>
        <Pill
          label={witness.status === 'checked_in' ? 'Sudah Check-in' : witness.status === 'assigned' ? 'Ditugaskan' : 'Tidak Hadir'}
          tone={witness.status === 'checked_in' ? 'success' : witness.status === 'assigned' ? 'warning' : 'danger'}
        />
      </Card>

      <Card style={{ gap: spacing.xs }}>
        <SectionTitle>Profil Saksi</SectionTitle>
        <DetailRow label="NIK Saksi" value={witness.nik} />
        <DetailRow label="Nomor Telepon" value={witness.phone} />
        <DetailRow label="NIK Saksi" value={maskNik(witness.nik)} />
        <DetailRow label="Nomor Telepon" value={maskPhone(witness.phone)} />
        <DetailRow label="Alamat Domisili" value={witness.address} />
        <DetailRow label="TPS Penugasan" value={witness.assignedTpsId} />
        {assignedTps && <DetailRow label="Lokasi TPS" value={`${assignedTps.district}, ${assignedTps.regency}`} />}
      </Card>

      {witness.status === 'checked_in' && (
        <Card style={{ gap: spacing.xs }}>
          <SectionTitle>Detail Presensi Check-in</SectionTitle>
          <DetailRow label="Waktu Presensi" value={witness.checkInTime ?? '-'} />
          <DetailRow label="Lokasi Presensi" value={witness.checkInLocation ?? '-'} />
          {witness.checkInLat && witness.checkInLng && (
            <DetailRow label="Koordinat GPS" value={`${witness.checkInLat.toFixed(4)}, ${witness.checkInLng.toFixed(4)}`} />
          )}
        </Card>
      )}

      <View style={{ gap: spacing.sm, marginTop: spacing.xs }}>
        {witness.status !== 'checked_in' && (
          <PrimaryButton
            label="Kirim Pengingat WhatsApp"
            variant="outline"
            icon="message-circle"
            onPress={handleSendReminder}
          />
        )}
        <PrimaryButton
          label="Lihat Kartu Petugas"
          variant="secondary"
          icon="credit-card"
          onPress={() => navigation.navigate('KartuPetugas', { personType: 'witness', personId: witness.id })}
        />
        <PrimaryButton
          label="Lihat Surat Tugas Digital"
          variant="secondary"
          icon="file-text"
          onPress={() => navigation.navigate('AssignmentLetter', { witnessId: witness.id })}
        />
        {witness.status !== 'checked_in' && (
          <PrimaryButton
            label="Tandai Check-in (Simulasi)"
            icon="check-circle"
            onPress={() => checkInWitness(witness.id)}
          />
        )}
      </View>
    </ScrollView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <Text style={[styles.rowLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  headerCard: { alignItems: 'center', gap: spacing.xs },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  avatarText: { fontFamily: fonts.extraBold, fontSize: fontSize.xl },
  name: { fontFamily: fonts.bold, fontSize: fontSize.lg, marginBottom: spacing.xs },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs, gap: spacing.md, borderBottomWidth: 0.5 },
  rowLabel: { fontFamily: fonts.medium, fontSize: fontSize.xs, flexShrink: 0 },
  rowValue: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, flex: 1, textAlign: 'right' },
});

