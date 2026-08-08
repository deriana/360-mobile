import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Card, EmptyState, Pill, SectionTitle } from '../components/ui';
import { PartyBadge } from '../components/PartyBadge';
import { fontSize, spacing } from '../theme';
import { LEGISLATIVE_MEMBERS, getLegislativePosition } from '../data/legislative';
import { getStableAvatar } from '../data/images';

export default function LegislativeMemberDetailScreen({ route }: any) {
  const { memberId } = route.params;
  const { colors } = useTheme();

  const member = LEGISLATIVE_MEMBERS.find((m) => m.id === memberId);

  if (!member) {
    return <EmptyState title="Anggota Tidak Ditemukan" body="Data anggota legislatif ini tidak tersedia." icon="user-x" />;
  }

  const position = getLegislativePosition(member);

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Card style={styles.headerCard}>
        <Image source={getStableAvatar(member.id)} style={styles.avatar} />
        <Text style={[styles.name, { color: colors.text }]}>{member.name}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <PartyBadge party={member.party} size={22} />
          <Text style={{ fontSize: 12, color: colors.textMuted, fontWeight: '700' }}>{member.party}</Text>
        </View>
        <Pill
          label={member.terpilih ? 'Anggota DPR RI Terpilih' : 'Tidak Terpilih'}
          tone={member.terpilih ? 'success' : 'neutral'}
          icon={member.terpilih ? 'check-circle' : 'x-circle'}
        />
      </Card>

      {member.terpilih && (
        <Card style={{ gap: spacing.xs }}>
          <SectionTitle>Posisi & Bidang yang Dibina</SectionTitle>
          <DetailRow label="Penugasan Komisi" value={position.komisi} />
          <DetailRow label="Bidang Pembinaan" value={position.portfolio} />
          <DetailRow label="Dapil" value={position.dapil} />
        </Card>
      )}

      <Card style={{ gap: spacing.xs }}>
        <SectionTitle>Rekam Hasil Pemilu</SectionTitle>
        <DetailRow label="Perolehan Suara" value={`${member.votes.toLocaleString('id-ID')} suara`} />
        <DetailRow label="Nomor Urut" value={String(member.noUrut)} />
        <DetailRow label="Provinsi Dapil" value={member.province} />
      </Card>
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
  avatar: { width: 72, height: 72, borderRadius: 36, marginBottom: spacing.xs, borderWidth: 2, borderColor: '#4F46E5' },
  name: { fontSize: fontSize.lg, fontWeight: '800', textAlign: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs, gap: spacing.md, borderBottomWidth: 0.5 },
  rowLabel: { fontSize: fontSize.xs, flexShrink: 0 },
  rowValue: { fontSize: fontSize.sm, fontWeight: '600', flex: 1, textAlign: 'right' },
});
