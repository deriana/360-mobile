import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { EmptyState } from '../components/ui';
import { PersonnelIdCard } from '../components/PersonnelIdCard';
import { spacing } from '../theme';
import { getWitnessAvatar } from '../data/images';
import { maskNik, maskPhone } from '../utils/masking';
import { getActiveWitnessScope } from '../utils/witnessResolver';

type PersonType = 'witness' | 'coordinator';

export default function KartuPetugasScreen({ route }: any) {
  const { witnesses, coordinators, tps, currentUser, role } = useApp();
  const { colors } = useTheme();

  const activeScope = getActiveWitnessScope(currentUser, witnesses, tps);
  const { personType = 'witness', personId = activeScope.witnessId }: { personType?: PersonType; personId?: string } = route?.params || {};

  if (personType === 'coordinator') {
    let coordinator = coordinators.find((c) => c.id === personId);
    if (
      !coordinator &&
      (personId === currentUser.identity?.id ||
        personId === currentUser.id ||
        !personId ||
        role === 'TPS_COORDINATOR' ||
        role === 'FIELD_COORDINATOR')
    ) {
      const region = currentUser.dimensions?.position?.region || 'DPC Sumur Bandung (15 TPS)';
      const district = region.includes('Sumur Bandung')
        ? 'Sumur Bandung'
        : (currentUser.memberships?.find((m) => m.type === 'member')?.dpc?.replace('DPC ', '') || 'Coblong');
      coordinator = {
        id: currentUser.identity?.id || 'USR-FAUZAN',
        name: currentUser.identity?.name || 'Ahmad Fauzan',
        nik: currentUser.identity?.nikFull || currentUser.identity?.nikMasked || '3273011405900892',
        phone: currentUser.identity?.phone || '0812-9988-7766',
        address: `Jl. Merdeka No. 45, Kec. ${district}, Kota Bandung`,
        regency: 'Kota Bandung',
        district: district,
        avatarIndex: currentUser.identity?.avatarIndex ?? 1,
        status: 'checked_in',
        checkInTime: '06:45',
        checkInLocation: `Sekretariat ${region}`,
      };
    }

    if (!coordinator) {
      return <EmptyState title="Koordinator Tidak Ditemukan" body="Data kartu petugas ini tidak tersedia." icon="user-x" />;
    }
    return (
      <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
        <PersonnelIdCard
          name={coordinator.name}
          roleLabel="Koordinator TPS Lapangan"
          badgeId={`KORLAP-PAN-${coordinator.id}`}
          avatarSource={getWitnessAvatar(coordinator.avatarIndex)}
          rows={[
            { icon: 'credit-card', label: 'NIK', value: maskNik(coordinator.nik) },
            { icon: 'phone', label: 'No. WhatsApp / HP', value: maskPhone(coordinator.phone) },
            { icon: 'map-pin', label: 'Alamat Domisili', value: coordinator.address },
            { icon: 'grid', label: 'Kluster Binaan', value: `Kec. ${coordinator.district}, ${coordinator.regency}` },
            { icon: 'shield', label: 'Status Autentikasi', value: 'TERVERIFIKASI KOORDINATOR PAN', isSuccess: true },
          ]}
          footerNote="Pindai QR Code ini oleh Pengawas untuk memvalidasi identitas koordinator."
        />
      </ScrollView>
    );
  }

  const witness = witnesses.find((w) => w.id === personId) || (personId === activeScope.witnessId ? activeScope.witness : null);
  if (!witness) {
    return <EmptyState title="Saksi Tidak Ditemukan" body="Data kartu petugas ini tidak tersedia." icon="user-x" />;
  }
  const witnessIndex = witnesses.findIndex((w) => w.id === personId);
  const assignedTps = tps.find((t) => t.id === witness.assignedTpsId) || (personId === activeScope.witnessId ? activeScope.tps : null);

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <PersonnelIdCard
        name={witness.name}
        roleLabel="Saksi Resmi TPS"
        badgeId={`SAKSI-PAN-${witness.id}`}
        avatarSource={getWitnessAvatar(witnessIndex >= 0 ? witnessIndex : 1)}
        rows={[
          { icon: 'credit-card', label: 'NIK', value: maskNik(witness.nik) },
          { icon: 'phone', label: 'No. WhatsApp / HP', value: maskPhone(witness.phone) },
          { icon: 'map-pin', label: 'Alamat Domisili', value: witness.address },
          {
            icon: 'grid',
            label: 'TPS Penugasan',
            value: assignedTps ? `${witness.assignedTpsId} — Kel. ${assignedTps.village || assignedTps.district}, Kec. ${assignedTps.district}` : witness.assignedTpsId,
          },
          { icon: 'shield', label: 'Status Autentikasi', value: 'TERVERIFIKASI SAKSI PAN', isSuccess: true },
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
