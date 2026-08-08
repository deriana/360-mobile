import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Card, EmptyState, Pill, PrimaryButton, SectionTitle } from '../components/ui';
import { fontSize, radius, spacing } from '../theme';

export default function WitnessDetailScreen({ route, navigation }: any) {
  const { witnessId } = route.params;
  const { witnesses, tps, checkInWitness } = useApp();
  const { colors } = useTheme();

  const witness = witnesses.find((w) => w.id === witnessId);

  if (!witness) {
    return <EmptyState title="Saksi Tidak Ditemukan" body="Data saksi ini tidak tersedia atau telah dihapus." icon="user-x" />;
  }

  const assignedTps = tps.find((t) => t.id === witness.assignedTpsId);

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
  avatarText: { fontWeight: '800', fontSize: fontSize.xl },
  name: { fontSize: fontSize.lg, fontWeight: '800', marginBottom: spacing.xs },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs, gap: spacing.md, borderBottomWidth: 0.5 },
  rowLabel: { fontSize: fontSize.xs, flexShrink: 0 },
  rowValue: { fontSize: fontSize.sm, fontWeight: '600', flex: 1, textAlign: 'right' },
});

