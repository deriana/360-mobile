import React, { useMemo, useState } from 'react';
import { Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Card, EmptyState, Modal, PrimaryButton, SectionTitle, StatusBadge, Pill } from '../components/ui';
import { fontSize, radius, shadow, spacing } from '../theme';
import { IMAGES, getWitnessAvatar, getTpsPhoto, getCandidateAvatar } from '../data/images';
import { CandidateDetailModal } from '../components/CandidateDetailModal';
import { PartyBadge } from '../components/PartyBadge';
import { CATEGORY_LABEL } from './EmergencyListScreen';

type CategoryTab = 'pilpres' | 'dpr' | 'partai';

const CATEGORY_TABS: Array<{ key: CategoryTab; label: string; icon: keyof typeof Feather.glyphMap }> = [
  { key: 'pilpres', label: 'Pilpres', icon: 'flag' },
  { key: 'dpr', label: 'Caleg DPR RI', icon: 'users' },
  { key: 'partai', label: 'Partai Politik', icon: 'grid' },
];

export default function TpsDetailScreen({ route, navigation }: any) {
  const tpsId = route?.params?.tpsId || 'TPS-001';
  const { tps, witnesses, emergencyReports, getDocumentation } = useApp();
  const { colors, isDark } = useTheme();

  const [activeCategory, setActiveCategory] = useState<CategoryTab>('pilpres');
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<any>(null);

  const record = tps.find((t) => t.id === tpsId);
  const assignedWitnesses = witnesses.filter((w) => w.assignedTpsId === tpsId);
  const checkedInWitnessCount = assignedWitnesses.filter((w) => w.status === 'checked_in').length;

  if (!record) {
    return <EmptyState title="TPS Tidak Ditemukan" body="Data TPS ini tidak tersedia." icon="map-pin" />;
  }

  const totalCandidate = Object.values(record.votes.candidateVotes).reduce((a, b) => a + b, 0);
  const totalDpr = record.votes.dprCandidateVotes
    ? Object.values(record.votes.dprCandidateVotes).reduce((a, b) => a + b, 0)
    : 0;
  const totalParty = Object.values(record.votes.partyVotes).reduce((a, b) => a + b, 0);

  const pilpresRanking = useMemo(
    () => Object.entries(record.votes.candidateVotes).sort((a, b) => b[1] - a[1]),
    [record.votes.candidateVotes],
  );

  const dprRanking = useMemo(
    () => Object.entries(record.votes.dprCandidateVotes || {}).sort((a, b) => b[1] - a[1]),
    [record.votes.dprCandidateVotes],
  );

  const partyRanking = useMemo(
    () => Object.entries(record.votes.partyVotes).sort((a, b) => b[1] - a[1]),
    [record.votes.partyVotes],
  );

  const documentation = getDocumentation(record.id);

  // Anomaly calculation
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
        `Selisih ${Math.abs(diff)} suara antara total suara Pilpres (sah + tidak sah = ${pilpresTotal}) dengan pemilih hadir (${record.votersPresent}).`,
      );
    }
  }

  // Linked emergency reports for problem status
  const linkedReports = emergencyReports.filter((r) => r.tpsId === record.id);
  if (record.status === 'problem') {
    if (linkedReports.length > 0) {
      linkedReports.forEach((r) => {
        anomalies.push(`TPS Bermasalah — ${CATEGORY_LABEL[r.category]}: ${r.description}`);
      });
    } else {
      anomalies.push('TPS ditandai Bermasalah, namun belum ada laporan darurat terdaftar.');
    }
  }

  const turnoutPercent = record.dpt > 0 ? Math.round((record.votersPresent / record.dpt) * 100) : 0;
  const invalidPercent = record.votersPresent > 0 ? Math.round((record.votes.invalidVotes / record.votersPresent) * 100) : 0;

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* 1. TPS Hero Header Banner (No district repetition) */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <ImageBackground source={getTpsPhoto(parseInt(record.id.replace('TPS-', '')) || 0)} style={styles.tpsBanner}>
          <View style={[styles.tpsOverlay, { backgroundColor: isDark ? 'rgba(30, 41, 59, 0.94)' : 'rgba(255, 255, 255, 0.94)' }]}>
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <View style={styles.idBadgeRow}>
                  <Text style={[styles.tpsIdBadge, { color: colors.primary }]}>{record.id}</Text>
                </View>
                <Text style={[styles.tpsTitle, { color: colors.text }]}>
                  TPS {String(record.tpsNumber).padStart(2, '0')}
                  {record.village ? ` • Kel. ${record.village}` : ''}
                </Text>
              </View>
              <StatusBadge status={record.status} />
            </View>
            <View style={styles.locationRow}>
              <Feather name="map-pin" size={12} color={colors.textMuted} />
              <Text style={[styles.locationText, { color: colors.textMuted }]} numberOfLines={1}>
                Kec. {record.district}, {record.regency}, {record.province}
              </Text>
            </View>
          </View>
        </ImageBackground>
      </Card>

      {/* 2. Responsive 3-Column KPI Strip (Zero Truncation, 100% visible on all screens) */}
      <View style={[styles.kpiContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.kpiCol}>
          <View style={styles.kpiHeader}>
            <Feather name="users" size={13} color={colors.primary} />
            <Text style={[styles.kpiLabel, { color: colors.textMuted }]} numberOfLines={1}>
              DPT Terdaftar
            </Text>
          </View>
          <Text style={[styles.kpiValue, { color: colors.text }]}>{record.dpt}</Text>
          <Text style={[styles.kpiSub, { color: colors.textMuted }]}>100% Hak Pilih</Text>
        </View>

        <View style={[styles.kpiDivider, { backgroundColor: colors.border }]} />

        <View style={styles.kpiCol}>
          <View style={styles.kpiHeader}>
            <Feather name="check-circle" size={13} color={colors.success} />
            <Text style={[styles.kpiLabel, { color: colors.textMuted }]} numberOfLines={1}>
              Pemilih Hadir
            </Text>
          </View>
          <Text style={[styles.kpiValue, { color: colors.success }]}>{record.votersPresent}</Text>
          <Text style={[styles.kpiSub, { color: colors.success }]}>{turnoutPercent}% Partisipasi</Text>
        </View>

        <View style={[styles.kpiDivider, { backgroundColor: colors.border }]} />

        <View style={styles.kpiCol}>
          <View style={styles.kpiHeader}>
            <Feather name="alert-circle" size={13} color={colors.danger} />
            <Text style={[styles.kpiLabel, { color: colors.textMuted }]} numberOfLines={1}>
              Suara Tdk Sah
            </Text>
          </View>
          <Text style={[styles.kpiValue, { color: colors.danger }]}>{record.votes.invalidVotes}</Text>
          <Text style={[styles.kpiSub, { color: colors.textMuted }]}>{invalidPercent}% Total</Text>
        </View>
      </View>

      {/* 3. Unified Vote Results Section (Eliminates Duplicate Pilpres Card) */}
      <Card style={{ gap: spacing.sm }}>
        <View style={styles.sectionHeaderBetween}>
          <SectionTitle style={{ marginBottom: 0 }}>Hasil Perolehan Suara</SectionTitle>
          <Pill
            label={record.status === 'done' ? 'C1 Terverifikasi' : 'Quick Count'}
            tone={record.status === 'done' ? 'success' : 'danger'}
            icon={record.status === 'done' ? 'check-circle' : 'zap'}
          />
        </View>

        {/* 3-Tab Segmented Switcher */}
        <View style={styles.categoryTabsContainer}>
          {CATEGORY_TABS.map((tab) => {
            const isSelected = activeCategory === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveCategory(tab.key)}
                style={({ pressed }) => [
                  styles.categoryTabPill,
                  {
                    backgroundColor: isSelected ? colors.primary : isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9',
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Feather name={tab.icon} size={12} color={isSelected ? '#FFFFFF' : colors.textMuted} />
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
        </View>

        {/* Active Category Content */}
        {activeCategory === 'pilpres' && (
          <View style={{ gap: spacing.xs }}>
            <Text style={[styles.categoryGuideText, { color: colors.textMuted }]}>
              Diurutkan dari perolehan suara tertinggi • Ketuk kandidat untuk profil KPU
            </Text>
            {totalCandidate === 0 ? (
              <Text style={[styles.muted, { color: colors.textMuted }]}>Belum ada suara Pilpres masuk.</Text>
            ) : (
              pilpresRanking.map(([name, value], index) => (
                <VoteRow
                  key={name}
                  rank={index + 1}
                  name={name}
                  value={value}
                  total={totalCandidate}
                  onPress={() => setSelectedCandidate(name)}
                />
              ))
            )}
          </View>
        )}

        {activeCategory === 'dpr' && (
          <View style={{ gap: spacing.xs }}>
            <Text style={[styles.categoryGuideText, { color: colors.textMuted }]}>
              Dapil Jawa Barat I (Kota Bandung & Cimahi) • Ketuk caleg untuk profil lengkap
            </Text>
            {totalDpr === 0 ? (
              <Text style={[styles.muted, { color: colors.textMuted }]}>Belum ada suara Caleg DPR RI masuk.</Text>
            ) : (
              dprRanking.map(([name, value], index) => (
                <VoteRow
                  key={name}
                  rank={index + 1}
                  name={name}
                  value={value}
                  total={totalDpr}
                  onPress={() => setSelectedCandidate(name)}
                />
              ))
            )}
          </View>
        )}

        {activeCategory === 'partai' && (
          <View style={{ gap: spacing.xs }}>
            <Text style={[styles.categoryGuideText, { color: colors.textMuted }]}>
              Perolehan partai politik • Ketuk partai untuk melihat daftar caleg
            </Text>
            {totalParty === 0 ? (
              <Text style={[styles.muted, { color: colors.textMuted }]}>Belum ada suara partai masuk.</Text>
            ) : (
              partyRanking.map(([name, value], index) => (
                <VoteRow
                  key={name}
                  rank={index + 1}
                  name={name}
                  value={value}
                  total={totalParty}
                  isParty
                  onPress={() => navigation.navigate('PartyRoster', { party: name })}
                />
              ))
            )}
          </View>
        )}
      </Card>

      {/* 4. Pemeriksaan Anomali (Sleek Banner if Clean, Alert Card if Anomalous) */}
      {anomalies.length === 0 ? (
        <View
          style={[
            styles.verifiedBanner,
            {
              backgroundColor: isDark ? 'rgba(16, 185, 129, 0.12)' : '#ECFDF5',
              borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : '#A7F3D0',
            },
          ]}
        >
          <View style={[styles.checkCircleWrap, { backgroundColor: colors.success }]}>
            <Feather name="check" size={13} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[styles.verifiedTitle, { color: colors.success }]}>Data TPS Terverifikasi Konsisten</Text>
            <Text style={[styles.verifiedSub, { color: colors.textMuted }]}>
              Tidak ada kejanggalan atau selisih suara yang terdeteksi pada data TPS ini.
            </Text>
          </View>
        </View>
      ) : (
        <Card style={{ gap: spacing.xs, borderColor: colors.danger }}>
          <SectionTitle
            style={{ marginBottom: 0 }}
            action={<Pill label={`${anomalies.length} Anomali`} tone="danger" icon="alert-triangle" />}
          >
            Pemeriksaan Anomali Data
          </SectionTitle>
          {anomalies.map((a, idx) => (
            <View key={idx} style={styles.anomalyRow}>
              <Feather name="alert-triangle" size={13} color={colors.danger} style={{ marginTop: 2 }} />
              <Text style={[styles.anomalyText, { color: colors.text }]}>{a}</Text>
            </View>
          ))}
        </Card>
      )}

      {/* 5. Dokumentasi Kegiatan TPS */}
      <Card style={{ gap: spacing.xs }}>
        <View style={styles.sectionHeaderBetween}>
          <SectionTitle style={{ marginBottom: 0 }}>Dokumentasi Kegiatan TPS</SectionTitle>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
            <Pill label={`${documentation.length} Foto`} tone={documentation.length > 0 ? 'primary' : 'neutral'} />
            <Pressable onPress={() => navigation.navigate('Documentation', { tpsId: record.id })} hitSlop={8}>
              <Text style={[styles.linkAction, { color: colors.primary }]}>Kelola</Text>
            </Pressable>
          </View>
        </View>

        {documentation.length === 0 ? (
          <View style={styles.emptyDocBox}>
            <Feather name="camera" size={24} color={colors.textMuted} />
            <Text style={[styles.muted, { color: colors.textMuted, textAlign: 'center' }]}>
              Belum ada foto C1 Plano atau dokumentasi kegiatan diunggah.
            </Text>
            <Pressable
              onPress={() => navigation.navigate('Documentation', { tpsId: record.id })}
              style={[styles.uploadDocSmallBtn, { borderColor: colors.primary }]}
            >
              <Feather name="upload" size={13} color={colors.primary} />
              <Text style={[styles.uploadDocSmallText, { color: colors.primary }]}>Unggah Sekarang</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm, paddingTop: 4 }}>
            {documentation.map((doc) => (
              <Pressable
                key={doc.id}
                onPress={() => setPreviewDoc(doc.source)}
                style={({ pressed }) => [
                  styles.docThumbWrap,
                  { borderColor: colors.border },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Image source={doc.source} style={styles.docThumb} resizeMode="cover" />
                <View style={styles.docExpandBadge}>
                  <Feather name="maximize-2" size={10} color="#FFFFFF" />
                </View>
              </Pressable>
            ))}
            <Pressable
              onPress={() => navigation.navigate('Documentation', { tpsId: record.id })}
              style={[
                styles.addDocBox,
                { borderColor: colors.border, backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC' },
              ]}
            >
              <Feather name="plus" size={18} color={colors.primary} />
              <Text style={[styles.addDocText, { color: colors.primary }]}>Tambah</Text>
            </Pressable>
          </ScrollView>
        )}
      </Card>

      {/* 6. Daftar Saksi TPS (Interactive Navigation to WitnessDetail) */}
      <Card style={{ gap: spacing.xs }}>
        <View style={styles.sectionHeaderBetween}>
          <SectionTitle style={{ marginBottom: 0 }}>Daftar Saksi TPS</SectionTitle>
          <Pill
            label={`${checkedInWitnessCount}/${assignedWitnesses.length} Hadir`}
            tone={
              checkedInWitnessCount === assignedWitnesses.length && assignedWitnesses.length > 0
                ? 'success'
                : 'warning'
            }
          />
        </View>

        {assignedWitnesses.length === 0 ? (
          <Text style={[styles.muted, { color: colors.textMuted }]}>Belum ada saksi ditugaskan ke TPS ini.</Text>
        ) : (
          assignedWitnesses.map((w, idx) => (
            <Pressable
              key={w.id}
              onPress={() => navigation.navigate('WitnessDetail', { witnessId: w.id })}
              style={({ pressed }) => [
                styles.witnessRow,
                { borderBottomColor: colors.border },
                pressed && { opacity: 0.7, backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' },
              ]}
            >
              <Image source={getWitnessAvatar(idx)} style={styles.witnessAvatar} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[styles.witnessName, { color: colors.text }]}>{w.name}</Text>
                <Text style={[styles.witnessSub, { color: colors.textMuted }]}>No HP: {w.phone}</Text>
              </View>
              <Pill
                label={w.status === 'checked_in' ? 'Check-in' : w.status === 'assigned' ? 'Ditugaskan' : 'Tidak Hadir'}
                tone={w.status === 'checked_in' ? 'success' : w.status === 'assigned' ? 'warning' : 'danger'}
              />
              <Feather name="chevron-right" size={14} color={colors.textMuted} />
            </Pressable>
          ))
        )}
      </Card>

      {/* 7. Bottom Action Buttons */}
      <View style={styles.actionButtonsWrap}>
        <PrimaryButton
          label="Isi / Perbarui Laporan C1 TPS"
          icon="edit-3"
          onPress={() => navigation.navigate('ReportForm', { tpsId: record.id })}
        />
        <PrimaryButton
          label="Lihat & Unggah Dokumentasi"
          icon="image"
          variant="secondary"
          onPress={() => navigation.navigate('Documentation', { tpsId: record.id })}
        />
      </View>

      {/* Modals */}
      <CandidateDetailModal candidateName={selectedCandidate} onClose={() => setSelectedCandidate(null)} />

      <Modal visible={!!previewDoc} onClose={() => setPreviewDoc(null)} variant="floating" title="Pratinjau Dokumentasi">
        {previewDoc && (
          <View style={styles.previewImageWrap}>
            <Image source={previewDoc} style={styles.previewImage} resizeMode="contain" />
          </View>
        )}
      </Modal>
    </ScrollView>
  );
}

function VoteRow({
  rank,
  name,
  value,
  total,
  onPress,
  isParty,
}: {
  rank: number;
  name: string;
  value: number;
  total: number;
  onPress?: () => void;
  isParty?: boolean;
}) {
  const { colors, isDark } = useTheme();
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
      <View style={styles.voteMainRow}>
        {/* Rank Badge */}
        <View
          style={[
            styles.rankBadge,
            {
              backgroundColor:
                rank === 1
                  ? isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2'
                  : isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
            },
          ]}
        >
          <Text
            style={[
              styles.rankText,
              { color: rank === 1 ? colors.danger : colors.textMuted },
            ]}
          >
            #{rank}
          </Text>
        </View>

        {/* Avatar or Party Logo */}
        {isParty ? (
          <PartyBadge party={name} size={32} />
        ) : (
          avatarUri && <Image source={avatarUri} style={styles.candidateAvatar} />
        )}

        {/* Candidate / Party Info & Bar */}
        <View style={{ flex: 1, gap: 3 }}>
          <View style={styles.voteTopRow}>
            <Text style={[styles.voteName, { color: colors.text }]} numberOfLines={1}>
              {name}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={[styles.voteValue, { color: colors.text }]}>
                {value} suara <Text style={{ color: colors.primary, fontWeight: '800' }}>({percent}%)</Text>
              </Text>
              {onPress && <Feather name="chevron-right" size={13} color={colors.textMuted} />}
            </View>
          </View>
          <View style={[styles.progressBarBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0' }]}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.max(percent, 2)}%`,
                  backgroundColor: rank === 1 ? colors.primary : isDark ? '#64748B' : '#94A3B8',
                },
              ]}
            />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl * 1.5 },
  tpsBanner: { width: '100%', height: 130, justifyContent: 'flex-end' },
  tpsOverlay: { padding: spacing.md, borderBottomLeftRadius: radius.lg, borderBottomRightRadius: radius.lg },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm },
  idBadgeRow: { marginBottom: 2 },
  tpsIdBadge: { fontSize: 10.5, fontWeight: '800', letterSpacing: 0.5 },
  tpsTitle: { fontSize: fontSize.md + 1, fontWeight: '800' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  locationText: { fontSize: fontSize.xs, flex: 1 },
  
  // 3-Column Responsive KPI Grid
  kpiContainer: {
    flexDirection: 'row',
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadow.card,
  },
  kpiCol: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  kpiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  kpiLabel: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  kpiValue: {
    fontSize: fontSize.md + 2,
    fontWeight: '800',
  },
  kpiSub: {
    fontSize: 9.5,
    fontWeight: '600',
  },
  kpiDivider: {
    width: 1,
    height: 38,
  },

  sectionHeaderBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  linkAction: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },

  // Category Tabs
  categoryTabsContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: 2,
  },
  categoryTabPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  categoryTabText: {
    fontSize: 11,
  },
  categoryGuideText: {
    fontSize: 10.5,
    marginTop: 2,
    marginBottom: 4,
  },

  // Vote Rows
  voteRow: {
    paddingVertical: 7,
    borderBottomWidth: 0.5,
  },
  voteMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  rankBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 10,
    fontWeight: '800',
  },
  candidateAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  voteTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  voteName: {
    fontSize: fontSize.xs + 0.5,
    fontWeight: '700',
    flex: 1,
    marginRight: 6,
  },
  voteValue: {
    fontSize: 11,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 5,
    borderRadius: 2.5,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2.5,
  },

  // Verified Banner
  verifiedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  checkCircleWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedTitle: {
    fontSize: fontSize.xs + 1,
    fontWeight: '800',
  },
  verifiedSub: {
    fontSize: 11,
    lineHeight: 15,
  },

  // Anomaly Rows
  anomalyRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'flex-start',
    paddingVertical: 3,
  },
  anomalyText: {
    fontSize: fontSize.xs,
    flex: 1,
    lineHeight: 17,
  },

  // Documentation
  emptyDocBox: {
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  uploadDocSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    marginTop: 4,
  },
  uploadDocSmallText: {
    fontSize: 11,
    fontWeight: '700',
  },
  docThumbWrap: {
    width: 68,
    height: 68,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    position: 'relative',
  },
  docThumb: {
    width: '100%',
    height: '100%',
  },
  docExpandBadge: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 18,
    height: 18,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addDocBox: {
    width: 68,
    height: 68,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  addDocText: {
    fontSize: 10,
    fontWeight: '700',
  },
  previewImageWrap: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },

  // Witnesses
  witnessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs + 2,
    borderBottomWidth: 0.5,
  },
  witnessAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  witnessName: {
    fontSize: fontSize.xs + 1,
    fontWeight: '700',
  },
  witnessSub: {
    fontSize: 11,
  },

  actionButtonsWrap: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  muted: {
    fontSize: fontSize.xs,
  },
});

