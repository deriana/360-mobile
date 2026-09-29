import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../../../../context/AppContext';
import { useTheme } from '../../../../context/ThemeContext';
import { Card, Pill, PrimaryButton } from '../../../../components/ui';
import ContactActions from '../../../../core/components/ContactActions';
import { fonts, spacing } from '../../../../theme';
import { useAccountSnapshot } from '../hooks/useAccountSnapshot';
import { getAccountType } from '../../domain/volunteerActivityRules';

/**
 * Data diri pengguna (baca-saja). Perubahan data dilakukan lewat koordinator/tim pusat,
 * karena data identitas diverifikasi di Web Command Center.
 */
export default function DataDiriScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { currentUser } = useApp();
  const account = useAccountSnapshot();
  const accountType = getAccountType(account);
  const { identity } = currentUser;

  const membership =
    currentUser.memberships.find((m) => m.type === (accountType === 'ANGGOTA' ? 'member' : 'volunteer')) ??
    currentUser.memberships[0];
  const region = [membership?.dpc, membership?.dpd].filter(Boolean).join(' · ');
  const skills = currentUser.skills ?? [];
  const interests = currentUser.interests ?? [];

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <Card style={styles.card}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Identitas</Text>
        <Row icon="user" label="Nama" value={identity.name} />
        <Row icon="credit-card" label="NIK" value={identity.nikMasked || '-'} />
        <Row icon="phone" label="Nomor HP" value={identity.phone || '-'} />
        <Row icon="mail" label="Email" value={identity.email || '-'} />
      </Card>

      <Card style={styles.card}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Keanggotaan</Text>
        <Row icon="award" label="Peran" value={accountType === 'ANGGOTA' ? 'Anggota' : 'Relawan'} />
        <Row icon="map" label="Wilayah" value={region || '-'} />
        {membership?.ktaNumber ? <Row icon="hash" label="Nomor e-KTA" value={membership.ktaNumber} /> : null}
      </Card>

      <Card style={styles.card}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Keahlian & Minat</Text>
        {skills.length + interests.length === 0 ? (
          <Text style={[styles.body, { color: colors.textMuted }]}>Belum diisi.</Text>
        ) : (
          <View style={styles.chips}>
            {[...skills, ...interests].map((item) => (
              <Pill key={item} label={item} tone="primary" />
            ))}
          </View>
        )}
      </Card>

      <Text style={[styles.note, { color: colors.textMuted }]}>
        Ada data yang salah? Hubungi koordinator atau tim pusat untuk memperbaikinya.
      </Text>
      {currentUser.coordinatorContact ? (
        <ContactActions phone={currentUser.coordinatorContact.phone} />
      ) : (
        <PrimaryButton label="Buka Pusat Bantuan" icon="help-circle" variant="secondary" onPress={() => navigation.navigate('HelpCenter')} />
      )}
    </ScrollView>
  );
}

function Row({ icon, label, value }: { icon: keyof typeof Feather.glyphMap; label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <Feather name={icon} size={14} color={colors.textMuted} />
      <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.value, { color: colors.text }]} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },
  card: { gap: spacing.sm },
  sectionTitle: { fontFamily: fonts.bold, fontSize: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  label: { fontFamily: fonts.medium, fontSize: 12, width: 84 },
  value: { flex: 1, textAlign: 'right', fontFamily: fonts.semiBold, fontSize: 12.5 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  body: { fontFamily: fonts.regular, fontSize: 12.5 },
  note: { fontFamily: fonts.regular, fontSize: 12, textAlign: 'center' },
});
