import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Card, EmptyState, Pill, PrimaryButton, SectionTitle } from '../components/ui';
import { fonts, fontSize, iconStrokeWidth, radius, spacing } from '../theme';
import { getWitnessAvatar } from '../data/images';
import { maskNik, maskPhone } from '../utils/masking';

export default function CoordinatorDetailScreen({ route, navigation }: any) {
  const coordinatorId = route?.params?.coordinatorId || 'KORLAP-001';
  const { coordinators, witnesses, tps } = useApp();
  const { colors } = useTheme();

  const coordinator = coordinators.find((c) => c.id === coordinatorId);

  if (!coordinator) {
    return <EmptyState title="Koordinator Tidak Ditemukan" body="Data koordinator ini tidak tersedia." icon="user-x" />;
  }

  const boundWitnesses = witnesses.filter((w) => {
    const t = tps.find((x) => x.id === w.assignedTpsId);
    return t?.district === coordinator.district && t?.regency === coordinator.regency;
  });
  const checkedInCount = boundWitnesses.filter((w) => w.status === 'checked_in').length;

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Card style={styles.headerCard}>
        <Image source={getWitnessAvatar(coordinator.avatarIndex)} style={styles.avatar} />
        <Text style={[styles.name, { color: colors.text }]}>{coordinator.name}</Text>
        <Pill
          label={coordinator.status === 'checked_in' ? 'Sudah Hadir' : coordinator.status === 'assigned' ? 'Belum Hadir' : 'Tidak Hadir'}
          tone={coordinator.status === 'checked_in' ? 'success' : coordinator.status === 'assigned' ? 'warning' : 'danger'}
        />
      </Card>

      <Card style={{ gap: spacing.xs }}>
        <SectionTitle>Profil Koordinator</SectionTitle>
        <DetailRow label="NIK" value={coordinator.nik} />
        <DetailRow label="Nomor Telepon" value={coordinator.phone} />
        <DetailRow label="NIK" value={maskNik(coordinator.nik)} />
        <DetailRow label="Nomor Telepon" value={maskPhone(coordinator.phone)} />
        <DetailRow label="Alamat Domisili" value={coordinator.address} />
        <DetailRow label="Kluster Binaan" value={`Kec. ${coordinator.district}, ${coordinator.regency}`} />
      </Card>

      {coordinator.status === 'checked_in' && (
        <Card style={{ gap: spacing.xs }}>
          <SectionTitle>Detail Presensi</SectionTitle>
          <DetailRow label="Waktu Presensi" value={coordinator.checkInTime ?? '-'} />
          <DetailRow label="Lokasi Presensi" value={coordinator.checkInLocation ?? '-'} />
        </Card>
      )}

      <Card style={{ gap: spacing.xs }}>
        <SectionTitle action={<Pill label={`Hadir ${checkedInCount}/${boundWitnesses.length || 1}`} tone="primary" />}>
          Saksi Binaan
        </SectionTitle>
        {boundWitnesses.length === 0 ? (
          <Text style={[styles.muted, { color: colors.textMuted }]}>Belum ada saksi terdaftar di kluster ini.</Text>
        ) : (
          boundWitnesses.map((w, idx) => (
            <Pressable
              key={w.id}
              onPress={() => navigation.navigate('WitnessDetail', { witnessId: w.id })}
              style={[styles.witnessRow, { borderBottomColor: colors.border }]}
            >
              <Image source={getWitnessAvatar(idx)} style={styles.witnessAvatar} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.witnessName, { color: colors.text }]}>{w.name}</Text>
                <Text style={[styles.witnessSub, { color: colors.textMuted }]}>TPS: {w.assignedTpsId} • No HP: {w.phone}</Text>
              </View>
              <Pill
                label={w.status === 'checked_in' ? 'Hadir' : w.status === 'assigned' ? 'Belum Hadir' : 'Tidak Hadir'}
                tone={w.status === 'checked_in' ? 'success' : w.status === 'assigned' ? 'warning' : 'danger'}
              />
              <Feather name="chevron-right" size={16} color={colors.textMuted} strokeWidth={iconStrokeWidth} />
            </Pressable>
          ))
        )}
      </Card>

      <View style={{ marginTop: spacing.xs }}>
        <PrimaryButton
          label="Lihat Kartu Petugas"
          icon="credit-card"
          variant="secondary"
          onPress={() => navigation.navigate('KartuPetugas', { personType: 'coordinator', personId: coordinator.id })}
        />
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
  avatar: { width: 64, height: 64, borderRadius: 32, marginBottom: spacing.xs, borderWidth: 2, borderColor: '#4F46E5' },
  name: { fontFamily: fonts.bold, fontSize: fontSize.lg, marginBottom: spacing.xs },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs, gap: spacing.md, borderBottomWidth: 0.5 },
  rowLabel: { fontFamily: fonts.medium, fontSize: fontSize.xs, flexShrink: 0 },
  rowValue: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, flex: 1, textAlign: 'right' },
  muted: { fontFamily: fonts.regular, fontSize: fontSize.xs },
  witnessRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs, borderBottomWidth: 0.5 },
  witnessAvatar: { width: 36, height: 36, borderRadius: 18 },
  witnessName: { fontFamily: fonts.bold, fontSize: fontSize.sm },
  witnessSub: { fontFamily: fonts.regular, fontSize: 11 },
});
