import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Card, PrimaryButton, SectionTitle } from '../components/ui';
import { PersonnelIdCard } from '../components/PersonnelIdCard';
import { spacing } from '../theme';
import { getUserProfile } from '../utils/scope';
import { getWitnessAvatar } from '../data/images';

export default function ProfileScreen({ navigation }: any) {
  const { role } = useApp();
  const { colors } = useTheme();

  const profile = getUserProfile(role);

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <PersonnelIdCard
        name={profile.name}
        roleLabel={profile.roleLabel}
        badgeId={profile.badgeId}
        avatarSource={getWitnessAvatar(profile.avatarIndex)}
        rows={[
          { icon: 'credit-card', label: 'NIK', value: profile.nik },
          { icon: 'phone', label: 'No. WhatsApp / HP', value: profile.phone },
          { icon: 'mail', label: 'Email Akun', value: profile.email },
          { icon: 'map-pin', label: 'Lokasi Penugasan', value: profile.scopeLocation },
          { icon: 'shield', label: 'Status Autentikasi', value: 'TERVERIFIKASI SAKSI 360', isSuccess: true },
        ]}
        footerNote="Pindai QR Code ini oleh Pengawas / KPPS untuk memvalidasi identitas saksi."
      />

      {/* Profile Actions */}
      <Card style={{ gap: spacing.sm }}>
        <SectionTitle style={{ marginBottom: 2 }}>Aksi Petugas Lapangan</SectionTitle>

        <PrimaryButton
          label="Tunjukkan Surat Tugas Digital (E-Mandat)"
          icon="file-text"
          onPress={() => navigation.navigate('AssignmentLetter', { witnessId: 'SAKSI-001' })}
        />

        <PrimaryButton
          label="Kembali ke Dashboard Utama"
          icon="home"
          variant="secondary"
          onPress={() => navigation.goBack()}
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },
});
