import React, { useState } from 'react';
import { Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Card, EmptyState, PrimaryButton, SectionTitle, StatusBadge, KpiCard, Pill } from '../components/ui';
import { fontSize, radius, spacing } from '../theme';
import { IMAGES, getWitnessAvatar, getTpsPhoto, getCandidateAvatar } from '../data/images';
import { CandidateDetailModal } from '../components/CandidateDetailModal';
import { PartyBadge } from '../components/PartyBadge';

type CategoryTab = 'pilpres' | 'dpr' | 'partai' | 'all';

const CATEGORY_TABS: Array<{ key: CategoryTab; label: string; icon: keyof typeof Feather.glyphMap }> = [
  { key: 'pilpres', label: 'Pilpres', icon: 'flag' },
  { key: 'dpr', label: 'Caleg DPR RI', icon: 'users' },
  { key: 'partai', label: 'Partai Politik', icon: 'grid' },
  { key: 'all', label: 'Semua Data', icon: 'layers' },
];

export default function TpsDetailScreen({ route, navigation }: any) {
  const { tpsId } = route.params;
  const { tps, witnesses, getDocumentation } = useApp();
  const { colors, isDark } = useTheme();

  const [activeCategory, setActiveCategory] = useState<CategoryTab>('pilpres');
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);

  const record = tps.find((t) => t.id === tpsId);
  const assignedWitnesses = witnesses.filter((w) => w.assignedTpsId === tpsId);

  if (!record) {
    return <EmptyState title="TPS Tidak Ditemukan" body="Data TPS ini tidak tersedia." icon="map-pin" />;
  }

  const totalParty = Object.values(record.votes.partyVotes).reduce((a, b) => a + b, 0);
  const totalCandidate = Object.values(record.votes.candidateVotes).reduce((a, b) => a + b, 0);
  const quickCountRanking = Object.entries(record.votes.candidateVotes).sort((a, b) => b[1] - a[1]);
  const documentation = getDocumentation(record.id);

  const anomalies: string[] = [];
  if (record.votersPresent > record.dpt) {
    anomalies.push(`Pemilih hadir (${record.votersPresent}) melebihi jumlah DPT terdaftar (${record.dpt}).`);
  }
  if (record.votes.invalidVotes > record.votersPresent) {
    anomalies.push(`Suara tidak sah (${record.votes.invalidVotes}) melebihi jumlah pemilih hadir (${record.votersPresent}).`);
  }
  if (totalCandidate > 0) {
    const pilpresTotal = totalCandidate + record.votes.invalidVotes;
    if (pilpresTotal !== record.votersPresent) {
      const diff = pilpresTotal - record.votersPresent;
      anomalies.push(
        `Selisih ${Math.abs(diff)} suara antara total suara Pilpres (sah + tidak sah = ${pilpresTotal}) dengan jumlah pemilih hadir (${record.votersPresent}).`,
      );
    }
  }

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* TPS Photo Banner Header */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <ImageBackground source={getTpsPhoto(parseInt(record.id.replace('TPS-', '')) || 0)} style={styles.tpsBanner}>
          <View style={[styles.tpsOverlay, { backgroundColor: isDark ? 'rgba(30, 41, 59, 0.94)' : 'rgba(255, 255, 255, 0.94)' }]}>
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.tpsIdBadge, { color: colors.primary }]}>{record.id}</Text>
                <Text style={[styles.tpsTitle, { color: colors.text }]}>TPS {record.tpsNumber} — {record.village || record.district}</Text>
              </View>
              <StatusBadge status={record.status} />
            </View>
            <Text style={[styles.locationText, { color: colors.textMuted }]}>
              Kec. {record.district}, {record.regency}, {record.province}
            </Text>
          </View>
        </ImageBackground>
      </Card>

      {/* Standalone Horizontal Scrollable KPI Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: spacing.sm, paddingRight: spacing.lg }}
      >
        <View style={{ width: 140 }}>
          <KpiCard label="DPT Terdaftar" value={record.dpt} icon="users" />
        </View>
        <View style={{ width: 140 }}>
          <KpiCard label="Pemilih Hadir" value={record.votersPresent} tone={colors.success} icon="check-circle" />
        </View>
        <View style={{ width: 150 }}>
          <KpiCard label="Suara Tidak Sah" value={record.votes.invalidVotes} tone={colors.danger} icon="x-circle" />
        </View>
      </ScrollView>

      {/* Quick Count Ringkasan Suara Pilpres TPS Ini */}
      <Card style={{ gap: spacing.xs }}>
        <SectionTitle style={{ marginBottom: 0 }} action={<Pill label="Quick Count" tone="danger" icon="zap" />}>
          Hasil Sementara TPS Ini
        </SectionTitle>
        {totalCandidate === 0 ? (
          <Text style={[styles.muted, { color: colors.textMuted }]}>Belum ada suara masuk untuk quick count TPS ini.</Text>
        ) : (
          <>
            <Text style={{ fontSize: 11, color: colors.textMuted }}>
              Diurutkan dari perolehan suara Pilpres tertinggi ke terendah di TPS ini.
            </Text>
            {quickCountRanking.map(([name, value]) => (
              <VoteRow key={name} name={name} value={value} total={totalCandidate} onPress={() => setSelectedCandidate(name)} />
            ))}
          </>
        )}
      </Card>

      {/* Segmented Category Selector */}
      <View style={{ gap: spacing.xs }}>
        <SectionTitle style={{ marginBottom: 0 }}>Kategori Pemilihan</SectionTitle>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.xs }}>
          {CATEGORY_TABS.map((tab) => {
            const isSelected = activeCategory === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveCategory(tab.key)}
                style={({ pressed }) => [
                  styles.categoryTabPill,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Feather name={tab.icon} size={13} color={isSelected ? '#FFFFFF' : colors.textMuted} />
                <Text
                  style={[
                    styles.categoryTabText,
                    {
                      color: isSelected ? '#FFFFFF' : colors.text,
                      fontWeight: isSelected ? '800' : '600',
                    },
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Perolehan Suara Paslon Pilpres */}
      {(activeCategory === 'pilpres' || activeCategory === 'all') && (
        <Card style={{ gap: spacing.xs }}>
          <SectionTitle style={{ marginBottom: 0 }} action={<Pill label="Pilpres" tone="primary" />}>
            Suara Paslon Pilpres
          </SectionTitle>
          <Text style={{ fontSize: 11, color: colors.textMuted }}>Ketuk baris kandidat untuk melihat profil, visi-misi & rekam jejak.</Text>
          {totalParty === 0 ? (
            <Text style={[styles.muted, { color: colors.textMuted }]}>Belum ada data suara masuk.</Text>
          ) : (
            Object.entries(record.votes.candidateVotes).map(([name, value]) => (
              <VoteRow key={name} name={name} value={value} total={totalParty} onPress={() => setSelectedCandidate(name)} />
            ))
          )}
        </Card>
      )}

      {/* Perolehan Suara Caleg DPR RI */}
      {(activeCategory === 'dpr' || activeCategory === 'all') && (
        <Card style={{ gap: spacing.xs }}>
          <SectionTitle style={{ marginBottom: 0 }} action={<Pill label="Dapil Jabar I" tone="info" />}>
            Suara Caleg DPR RI
          </SectionTitle>
          <Text style={{ fontSize: 11, color: colors.textMuted }}>Ketuk nama caleg untuk melihat profil & program unggulan.</Text>
          {totalParty === 0 || !record.votes.dprCandidateVotes ? (
            <Text style={[styles.muted, { color: colors.textMuted }]}>Belum ada data suara masuk.</Text>
          ) : (
            Object.entries(record.votes.dprCandidateVotes).map(([name, value]) => (
              <VoteRow key={name} name={name} value={value} total={totalParty} onPress={() => setSelectedCandidate(name)} />
            ))
          )}
        </Card>
      )}

      {/* Perolehan Suara Partai */}
      {(activeCategory === 'partai' || activeCategory === 'all') && (
        <Card style={{ gap: spacing.xs }}>
          <SectionTitle style={{ marginBottom: 0 }} action={<Pill label="Partai" tone="neutral" />}>
            Suara Partai Politik
          </SectionTitle>
          {totalParty === 0 ? (
            <Text style={[styles.muted, { color: colors.textMuted }]}>Belum ada data suara masuk.</Text>
          ) : (
            Object.entries(record.votes.partyVotes).map(([name, value]) => (
              <VoteRow key={name} name={name} value={value} total={totalParty} isParty />
            ))
          )}
        </Card>
      )}

      {/* Pemeriksaan Anomali Data */}
      <Card style={{ gap: spacing.xs }}>
        <SectionTitle
          style={{ marginBottom: 0 }}
          action={
            <Pill
              label={anomalies.length > 0 ? `${anomalies.length} Anomali` : 'Data Konsisten'}
              tone={anomalies.length > 0 ? 'danger' : 'success'}
              icon={anomalies.length > 0 ? 'alert-triangle' : 'check-circle'}
            />
          }
        >
          Pemeriksaan Anomali Data
        </SectionTitle>
        {anomalies.length === 0 ? (
          <Text style={[styles.muted, { color: colors.textMuted }]}>Tidak ada anomali terdeteksi pada data TPS ini.</Text>
        ) : (
          anomalies.map((a, idx) => (
            <View key={idx} style={styles.anomalyRow}>
              <Feather name="alert-triangle" size={13} color={colors.danger} style={{ marginTop: 1 }} />
              <Text style={[styles.anomalyText, { color: colors.text }]}>{a}</Text>
            </View>
          ))
        )}
      </Card>

      {/* Ringkasan Dokumentasi TPS */}
      <Card style={{ gap: spacing.xs }}>
        <SectionTitle style={{ marginBottom: 0 }} action={<Pill label={`${documentation.length} Foto`} tone={documentation.length > 0 ? 'primary' : 'neutral'} />}>
          Dokumentasi Kegiatan TPS
        </SectionTitle>
        {documentation.length === 0 ? (
          <Text style={[styles.muted, { color: colors.textMuted }]}>Belum ada foto dokumentasi diunggah untuk TPS ini.</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.xs }}>
            {documentation.map((doc) => (
              <View key={doc.id} style={styles.docThumbWrap}>
                <Image source={doc.source} style={styles.docThumb} resizeMode="cover" />
              </View>
            ))}
          </ScrollView>
        )}
      </Card>

      {/* Daftar Saksi Bertugas */}
      <Card style={{ gap: spacing.xs }}>
        <SectionTitle>Daftar Saksi TPS</SectionTitle>
        {assignedWitnesses.length === 0 ? (
          <Text style={[styles.muted, { color: colors.textMuted }]}>Belum ada saksi ditugaskan ke TPS ini.</Text>
        ) : (
          assignedWitnesses.map((w, idx) => (
            <View key={w.id} style={[styles.witnessRow, { borderBottomColor: colors.border }]}>
              <Image source={getWitnessAvatar(idx)} style={styles.witnessAvatar} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.witnessName, { color: colors.text }]}>{w.name}</Text>
                <Text style={[styles.witnessSub, { color: colors.textMuted }]}>No HP: {w.phone}</Text>
              </View>
              <Pill
                label={w.status === 'checked_in' ? 'Check-in' : w.status === 'assigned' ? 'Ditugaskan' : 'Tidak Hadir'}
                tone={w.status === 'checked_in' ? 'success' : w.status === 'assigned' ? 'warning' : 'danger'}
              />
            </View>
          ))
        )}
      </Card>

      <View style={{ gap: spacing.sm, marginTop: spacing.xs }}>
        <PrimaryButton
          label="Lihat & Unggah Dokumentasi TPS"
          icon="image"
          variant="secondary"
          onPress={() => navigation.navigate('Documentation', { tpsId: record.id })}
        />
        <PrimaryButton
          label="Isi / Perbarui Laporan C1 TPS"
          icon="edit-3"
          onPress={() => navigation.navigate('ReportForm', { tpsId: record.id })}
        />
      </View>

      <CandidateDetailModal candidateName={selectedCandidate} onClose={() => setSelectedCandidate(null)} />
    </ScrollView>
  );
}

function VoteRow({
  name,
  value,
  total,
  onPress,
  isParty,
}: {
  name: string;
  value: number;
  total: number;
  onPress?: () => void;
  isParty?: boolean;
}) {
  const { colors } = useTheme();
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
  const avatarUri = isParty ? null : getCandidateAvatar(name);

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.voteRow,
        { borderBottomColor: colors.border },
        pressed && !!onPress && { opacity: 0.7 },
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
        {isParty ? (
          <PartyBadge party={name} size={34} />
        ) : (
          avatarUri && <Image source={avatarUri} style={styles.candidateAvatar} />
        )}
        <View style={{ flex: 1, gap: 2 }}>
          <View style={styles.voteTopRow}>
            <Text style={[styles.voteName, { color: colors.text }]} numberOfLines={1}>
              {name}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={[styles.voteValue, { color: colors.text }]}>
                {value} suara ({percent}%)
              </Text>
              {onPress && <Feather name="chevron-right" size={14} color={colors.textMuted} />}
            </View>
          </View>
          <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
            <View style={[styles.progressBarFill, { width: `${percent}%`, backgroundColor: colors.primary }]} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },
  tpsBanner: { width: '100%', height: 140, justifyContent: 'flex-end' },
  tpsOverlay: { padding: spacing.md, backgroundColor: 'rgba(255,255,255,0.92)' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm },
  tpsIdBadge: { fontSize: 10, fontWeight: '800', color: '#4F46E5', textTransform: 'uppercase' },
  tpsTitle: { fontSize: fontSize.lg, fontWeight: '800', color: '#0F172A' },
  locationText: { fontSize: fontSize.xs, color: '#64748B', marginTop: 2 },
  statRow: { flexDirection: 'row', gap: spacing.sm },
  muted: { fontSize: fontSize.xs },
  categoryTabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  categoryTabText: { fontSize: 12 },
  voteRow: { paddingVertical: spacing.xs, gap: 4 },
  candidateAvatar: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: '#CBD5E1' },
  voteTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  voteName: { fontSize: fontSize.xs + 1, fontWeight: '700', flex: 1, marginRight: 4 },
  voteValue: { fontSize: fontSize.xs, fontWeight: '800' },
  progressBarBg: { height: 6, borderRadius: 3, width: '100%', overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },
  witnessRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs, borderBottomWidth: 0.5 },
  witnessAvatar: { width: 36, height: 36, borderRadius: 18 },
  witnessName: { fontSize: fontSize.sm, fontWeight: '700' },
  witnessSub: { fontSize: 11 },
  anomalyRow: { flexDirection: 'row', gap: 6, alignItems: 'flex-start', paddingVertical: 2 },
  anomalyText: { fontSize: fontSize.xs, flex: 1, lineHeight: 17 },
  docThumbWrap: { width: 72, height: 72, borderRadius: radius.md, overflow: 'hidden' },
  docThumb: { width: '100%', height: '100%' },
});
