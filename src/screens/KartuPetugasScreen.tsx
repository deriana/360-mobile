import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { EmptyState } from '../components/ui';
import { PersonnelIdCard } from '../components/PersonnelIdCard';
import { spacing } from '../theme';
import { getWitnessAvatar } from '../data/images';

type PersonType = 'witness' | 'coordinator';

export default function KartuPetugasScreen({ route }: any) {
  const { personType, personId }: { personType: PersonType; personId: string } = route.params;
  const { witnesses, coordinators, tps } = useApp();
  const { colors } = useTheme();

  if (personType === 'coordinator') {
    const coordinator = coordinators.find((c) => c.id === personId);
    if (!coordinator) {
      return <EmptyState title="Koordinator Tidak Ditemukan" body="Data kartu petugas ini tidak tersedia." icon="user-x" />;
    }
    return (
      <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
        <PersonnelIdCard
          name={coordinator.name}
          roleLabel="Koordinator TPS Lapangan"
          badgeId={`KORLAP-360-${coordinator.id}`}
          avatarSource={getWitnessAvatar(coordinator.avatarIndex)}
          rows={[
            { icon: 'credit-card', label: 'NIK', value: coordinator.nik },
            { icon: 'phone', label: 'No. WhatsApp / HP', value: coordinator.phone },
            { icon: 'map-pin', label: 'Alamat Domisili', value: coordinator.address },
            { icon: 'grid', label: 'Kluster Binaan', value: `Kec. ${coordinator.district}, ${coordinator.regency}` },
            { icon: 'shield', label: 'Status Autentikasi', value: 'TERVERIFIKASI KOORDINATOR 360', isSuccess: true },
          ]}
          footerNote="Pindai QR Code ini oleh Pengawas untuk memvalidasi identitas koordinator."
        />
      </ScrollView>
    );
  }

  const witness = witnesses.find((w) => w.id === personId);
  if (!witness) {
    return <EmptyState title="Saksi Tidak Ditemukan" body="Data kartu petugas ini tidak tersedia." icon="user-x" />;
  }
  const witnessIndex = witnesses.findIndex((w) => w.id === personId);
  const assignedTps = tps.find((t) => t.id === witness.assignedTpsId);

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <PersonnelIdCard
        name={witness.name}
        roleLabel="Saksi Resmi TPS"
        badgeId={`SAKSI-360-${witness.id}`}
        avatarSource={getWitnessAvatar(witnessIndex)}
        rows={[
          { icon: 'credit-card', label: 'NIK', value: witness.nik },
          { icon: 'phone', label: 'No. WhatsApp / HP', value: witness.phone },
          { icon: 'map-pin', label: 'Alamat Domisili', value: witness.address },
          {
            icon: 'grid',
            label: 'TPS Penugasan',
            value: assignedTps ? `${witness.assignedTpsId} — Kec. ${assignedTps.district}, ${assignedTps.regency}` : witness.assignedTpsId,
          },
          { icon: 'shield', label: 'Status Autentikasi', value: 'TERVERIFIKASI SAKSI 360', isSuccess: true },
        ]}
        footerNote="Pindai QR Code ini oleh Pengawas / KPPS untuk memvalidasi identitas saksi."
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },
});
