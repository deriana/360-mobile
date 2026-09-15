import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Card, EmptyState, Pill, SectionTitle } from '../components/ui';
import { PartyBadge } from '../components/PartyBadge';
import { fontSize, iconStrokeWidth, radius, shadow, spacing } from '../theme';
import { LEGISLATIVE_MEMBERS, NATIONAL_PARTIES, getLegislativePosition } from '../data/legislative';
import { getStableAvatar } from '../data/images';

const PARTY_FULL_NAMES: Record<string, string> = {
  PAN: 'Partai Amanat Nasional',
  PKB: 'Partai Kebangkitan Bangsa',
  PKS: 'Partai Keadilan Sejahtera',
  PPP: 'Partai Persatuan Pembangunan',
  PBB: 'Partai Bulan Bintang',
  PKN: 'Partai Kebangkitan Nusantara',
  PSI: 'Partai Solidaritas Indonesia',
};

export default function LegislativeMemberDetailScreen({ route }: any) {
  const memberId = route?.params?.memberId;
  const { colors, isDark } = useTheme();

  const member = LEGISLATIVE_MEMBERS.find((m) => m.id === memberId);

  if (!member) {
    return <EmptyState title="Anggota Tidak Ditemukan" body="Data anggota legislatif ini tidak tersedia." icon="user-x" />;
  }

  const position = getLegislativePosition(member);
  const fullName = PARTY_FULL_NAMES[member.party] ?? member.party;
  const partyData = NATIONAL_PARTIES.find((np) => np.name === member.party);

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* Hero Member Profile Card */}
      <Card style={styles.heroCard}>
        <View style={styles.avatarWrap}>
          <Image
            source={getStableAvatar(member.id)}
            style={[
              styles.avatar,
              { borderColor: member.terpilih ? colors.primary : colors.border },
            ]}
          />
          {member.terpilih && (
            <View style={[styles.avatarVerifiedBadge, { backgroundColor: colors.success }]}>
              <Feather name="check" size={12} color="#FFFFFF" strokeWidth={3} />
            </View>
          )}
        </View>

        <Text style={[styles.memberName, { color: colors.text }]}>{member.name}</Text>

        <View style={styles.partyRow}>
          <PartyBadge party={member.party} size={22} />
          <Text style={[styles.partyNameText, { color: colors.text }]}>{fullName}</Text>
          <View style={[styles.partyCodeBadge, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.partyCodeText, { color: colors.primary }]}>{member.party}</Text>
          </View>
        </View>

        <Pill
          label={member.terpilih ? 'Anggota DPR RI Terpilih (2024–2029)' : 'Calon Legislatif Pemilu 2024'}
          tone={member.terpilih ? 'success' : 'neutral'}
          icon={member.terpilih ? 'award' : 'user'}
        />
      </Card>

      {/* 3-Column Quick Metrics Card */}
      <Card style={[styles.statsCard, { paddingVertical: spacing.md }]}>
        <View style={styles.metricItem}>
          <Text style={[styles.metricValue, { color: colors.primary }]}>
            {member.votes.toLocaleString('id-ID')}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Suara Sah</Text>
        </View>
        <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />
        <View style={styles.metricItem}>
          <Text style={[styles.metricValue, { color: colors.text }]}>#{member.noUrut}</Text>
          <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Nomor Urut</Text>
        </View>
        <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />
        <View style={styles.metricItem}>
          <Text style={[styles.metricValue, { color: colors.text }]} numberOfLines={1}>
            {member.province}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Dapil Provinsi</Text>
        </View>
      </Card>

      {/* Penugasan Parlemen DPR RI (Jika Terpilih) */}
      {member.terpilih && (
        <Card style={{ gap: spacing.sm }}>
          <SectionTitle style={{ marginBottom: 0 }}>Penugasan Parlemen DPR RI</SectionTitle>

          <View style={[styles.commissionBox, { backgroundColor: isDark ? 'rgba(0,102,179,0.15)' : '#F0F7FF', borderColor: colors.primary }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Feather name="briefcase" size={16} color={colors.primary} />
              <Text style={[styles.commissionTitle, { color: colors.primary }]}>{position.komisi}</Text>
            </View>
            <Text style={[styles.portfolioText, { color: colors.text }]}>
              {position.portfolio}
            </Text>
          </View>

          <DetailRow label="Fraksi DPR RI" value={`Fraksi ${fullName} (${member.party})`} />
          <DetailRow label="Wilayah Pemilihan" value={`Dapil ${member.province} — No. Urut ${member.noUrut}`} />
          <DetailRow label="Masa Jabatan" value="2024–2029 (5 Tahun)" />
          <DetailRow label="Metode Penetapan" value="Sainte-Laguë Terverifikasi KPU" />
        </Card>
      )}

      {/* Rekam Hasil Rekapitulasi Pemilu */}
      <Card style={{ gap: spacing.xs }}>
        <SectionTitle style={{ marginBottom: spacing.xs }}>Rekapitulasi Suara & Parlemen</SectionTitle>
        <DetailRow label="Total Suara Sah" value={`${member.votes.toLocaleString('id-ID')} suara`} />
        <DetailRow label="Nomor Urut Surat Suara" value={`Nomor #${member.noUrut}`} />
        <DetailRow label="Status Keterpilihan" value={member.terpilih ? 'Lolos Memperoleh Kursi DPR RI' : 'Belum Memperoleh Kursi'} />
        <DetailRow label="Sistem Pemilu" value="Proporsional Terbuka (Suara Terbanyak)" />
        {partyData && (
          <DetailRow
            label="Kursi Nasional Partai"
            value={`${partyData.seats} Kursi DPR RI (${partyData.pct}% suara)`}
          />
        )}
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
  heroCard: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.lg,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: spacing.xs,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
  },
  avatarVerifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  memberName: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    textAlign: 'center',
  },
  partyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.xs,
  },
  partyNameText: {
    fontSize: 12,
    fontWeight: '700',
  },
  partyCodeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.pill,
  },
  partyCodeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.xs,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
  },
  metricValue: {
    fontSize: fontSize.md,
    fontWeight: '900',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  metricDivider: {
    width: 1,
    height: 28,
  },
  commissionBox: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: 4,
    marginBottom: spacing.xs,
  },
  commissionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '800',
  },
  portfolioText: {
    fontSize: fontSize.xs,
    lineHeight: 18,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs + 2,
    gap: spacing.md,
    borderBottomWidth: 0.5,
  },
  rowLabel: {
    fontSize: fontSize.xs,
    flexShrink: 0,
  },
  rowValue: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
  },
});
