import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Card, EmptyState, Pill, PrimaryButton, SectionTitle, Input, StatusBadge } from '../components/ui';
import { fontSize, radius, spacing } from '../theme';
import { CURRENT_WITNESS_ID, scopeTps } from '../utils/scope';
import { partyNames, candidateNames, dprCandidates } from '../data/regions';
import { IMAGES, getTpsPhoto, getCandidateAvatar } from '../data/images';
import { Tps } from '../types';

type MainViewMode = 'history' | 'form';
type EntryTab = 'pilpres' | 'dpr' | 'partai' | 'all';
type HistoryFilter = 'all' | 'done' | 'pending';

const ENTRY_TABS: Array<{ key: EntryTab; label: string; icon: keyof typeof Feather.glyphMap }> = [
  { key: 'pilpres', label: 'Pilpres', icon: 'flag' },
  { key: 'dpr', label: 'Caleg DPR RI', icon: 'users' },
  { key: 'partai', label: 'Partai Politik', icon: 'grid' },
  { key: 'all', label: 'Semua Formulir', icon: 'layers' },
];

export default function ReportFormScreen({ route, navigation }: any) {
  const { witnesses, tps, submitTpsReport, role } = useApp();
  const { colors, isDark } = useTheme();

  const currentWitness = witnesses.find((w) => w.id === CURRENT_WITNESS_ID);
  const scopedTps = scopeTps(role, tps, witnesses);

  // Initial TPS from route params or assigned TPS
  const initialTpsId = route?.params?.tpsId ?? currentWitness?.assignedTpsId ?? tps[0]?.id;

  const [viewMode, setViewMode] = useState<MainViewMode>(route?.params?.tpsId ? 'form' : 'history');
  const [selectedTpsId, setSelectedTpsId] = useState<string>(initialTpsId);
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>('all');
  const [previewTps, setPreviewTps] = useState<Tps | null>(null);

  // Form State for active TPS being edited
  const activeRecord = tps.find((t) => t.id === selectedTpsId) ?? tps[0];

  const [entryCategory, setEntryCategory] = useState<EntryTab>('pilpres');
  const [votersPresent, setVotersPresent] = useState(String(activeRecord?.votersPresent || ''));
  const [invalidVotes, setInvalidVotes] = useState(String(activeRecord?.votes.invalidVotes || ''));
  const [partyValues, setPartyValues] = useState<Record<string, string>>(
    Object.fromEntries(partyNames.map((p) => [p, String(activeRecord?.votes.partyVotes[p] || '')])),
  );
  const [candidateValues, setCandidateValues] = useState<Record<string, string>>(
    Object.fromEntries(candidateNames.map((c) => [c, String(activeRecord?.votes.candidateVotes[c] || '')])),
  );
  const [dprCandidateValues, setDprCandidateValues] = useState<Record<string, string>>(
    Object.fromEntries(dprCandidates.map((c) => [c, String(activeRecord?.votes.dprCandidateVotes?.[c] || '')])),
  );
  const [uploads, setUploads] = useState({ formPhoto: true, tpsPhoto: true, tpsVideo: false });
  const [isEditing, setIsEditing] = useState(false);

  // Load a specific TPS into the editor form
  const handleSelectTpsForEdit = (targetTps: Tps) => {
    setSelectedTpsId(targetTps.id);
    setVotersPresent(String(targetTps.votersPresent || ''));
    setInvalidVotes(String(targetTps.votes.invalidVotes || ''));
    setPartyValues(Object.fromEntries(partyNames.map((p) => [p, String(targetTps.votes.partyVotes[p] || '')])));
    setCandidateValues(Object.fromEntries(candidateNames.map((c) => [c, String(targetTps.votes.candidateVotes[c] || '')])));
    setDprCandidateValues(
      Object.fromEntries(dprCandidates.map((c) => [c, String(targetTps.votes.dprCandidateVotes?.[c] || '')])),
    );
    setUploads({ formPhoto: targetTps.status === 'done', tpsPhoto: targetTps.status === 'done', tpsVideo: false });
    setIsEditing(targetTps.status === 'done');
    setViewMode('form');
  };

  const handleCreateNewReport = () => {
    const unsubmitted = tps.find((t) => t.status !== 'done') ?? tps[0];
    handleSelectTpsForEdit(unsubmitted);
    setIsEditing(false);
  };

  const toggleUpload = (key: keyof typeof uploads) => setUploads((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSubmitForm = () => {
    if (!uploads.formPhoto || !uploads.tpsPhoto) {
      Alert.alert('Lengkapi Dokumen', 'Unggah foto formulir C1 Plano dan foto lokasi TPS sebelum submit.');
      return;
    }
    submitTpsReport(activeRecord.id, {
      votersPresent: Number(votersPresent) || 0,
      votes: {
        partyVotes: Object.fromEntries(partyNames.map((p) => [p, Number(partyValues[p]) || 0])),
        candidateVotes: Object.fromEntries(candidateNames.map((c) => [c, Number(candidateValues[c]) || 0])),
        dprCandidateVotes: Object.fromEntries(dprCandidates.map((c) => [c, Number(dprCandidateValues[c]) || 0])),
        invalidVotes: Number(invalidVotes) || 0,
      },
      status: 'done',
    });

    Alert.alert(
      'Laporan Berhasil Disimpan',
      `Data perolehan suara C1 untuk ${activeRecord.id} telah tersimpan dan diperbarui di server.`,
      [{ text: 'Lihat Riwayat Laporan', onPress: () => setViewMode('history') }],
    );
  };

  const filteredHistory = scopedTps.filter((t) => {
    if (historyFilter === 'done') return t.status === 'done';
    if (historyFilter === 'pending') return t.status !== 'done';
    return true;
  });

  return (
    <KeyboardAvoidingView
      style={[styles.keyboardView, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Main View Mode Selector Pills */}
        <Card style={{ padding: spacing.xs, backgroundColor: colors.surface }}>
          <View style={{ flexDirection: 'row', gap: spacing.xs }}>
            <Pressable
              onPress={() => setViewMode('history')}
              style={({ pressed }) => [
                styles.modeTabPill,
                {
                  backgroundColor: viewMode === 'history' ? colors.primary : 'transparent',
                },
                pressed && { opacity: 0.8 },
              ]}
            >
              <Feather name="file-text" size={14} color={viewMode === 'history' ? '#FFFFFF' : colors.textMuted} />
              <Text style={[styles.modeTabText, { color: viewMode === 'history' ? '#FFFFFF' : colors.text }]}>
                Riwayat Formulir C1 ({scopedTps.filter((t) => t.status === 'done').length})
              </Text>
            </Pressable>

            <Pressable
              onPress={handleCreateNewReport}
              style={({ pressed }) => [
                styles.modeTabPill,
                {
                  backgroundColor: viewMode === 'form' ? colors.primary : 'transparent',
                },
                pressed && { opacity: 0.8 },
              ]}
            >
              <Feather name="edit-3" size={14} color={viewMode === 'form' ? '#FFFFFF' : colors.textMuted} />
              <Text style={[styles.modeTabText, { color: viewMode === 'form' ? '#FFFFFF' : colors.text }]}>
                {isEditing ? 'Edit Laporan' : 'Buat / Isi C1 Baru'}
              </Text>
            </Pressable>
          </View>
        </Card>

        {/* VIEW MODE 1: RIWAYAT FORMULIR C1 */}
        {viewMode === 'history' && (
          <>
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, { color: colors.text }]}>Riwayat Laporan C1 TPS</Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                  Daftar formulir perolehan suara C1 Plano yang telah dilaporkan dan diverifikasi.
                </Text>
              </View>
            </View>

            <PrimaryButton
              label="+ Buat Laporan C1 TPS Baru"
              icon="plus-circle"
              onPress={handleCreateNewReport}
            />

            {/* History Filter Pills */}
            <View style={{ flexDirection: 'row', gap: spacing.xs }}>
              <Pressable
                onPress={() => setHistoryFilter('all')}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: historyFilter === 'all' ? colors.primary : colors.surface,
                    borderColor: historyFilter === 'all' ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={[styles.filterText, { color: historyFilter === 'all' ? '#FFFFFF' : colors.text }]}>
                  Semua TPS ({scopedTps.length})
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setHistoryFilter('done')}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: historyFilter === 'done' ? colors.primary : colors.surface,
                    borderColor: historyFilter === 'done' ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={[styles.filterText, { color: historyFilter === 'done' ? '#FFFFFF' : colors.text }]}>
                  Terunggah ({scopedTps.filter((t) => t.status === 'done').length})
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setHistoryFilter('pending')}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: historyFilter === 'pending' ? colors.primary : colors.surface,
                    borderColor: historyFilter === 'pending' ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={[styles.filterText, { color: historyFilter === 'pending' ? '#FFFFFF' : colors.text }]}>
                  Belum Dilaporkan ({scopedTps.filter((t) => t.status !== 'done').length})
                </Text>
              </Pressable>
            </View>

            {/* History Cards List */}
            {filteredHistory.map((t) => {
              const isDone = t.status === 'done';
              const candidateEntries = Object.entries(t.votes.candidateVotes);
              const topCandidate = candidateEntries.length > 0 ? candidateEntries[0] : null;

              return (
                <Card key={t.id} style={{ gap: spacing.sm }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: colors.primary, textTransform: 'uppercase' }}>
                        {t.id}
                      </Text>
                      <Text style={[styles.cardTpsTitle, { color: colors.text }]}>
                        TPS {t.tpsNumber} — {t.village || t.district}
                      </Text>
                      <Text style={{ fontSize: 11, color: colors.textMuted }}>Kec. {t.district}, {t.regency}</Text>
                    </View>
                    <StatusBadge status={t.status} />
                  </View>

                  {isDone ? (
                    <View style={[styles.summaryBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                      <View style={styles.summaryRow}>
                        <Feather name="users" size={13} color={colors.primary} />
                        <Text style={[styles.summaryText, { color: colors.text }]}>
                          Pemilih Hadir: <Text style={{ fontWeight: '800' }}>{t.votersPresent}</Text> / {t.dpt} DPT
                        </Text>
                      </View>
                      <View style={styles.summaryRow}>
                        <Feather name="flag" size={13} color={colors.primary} />
                        <Text style={[styles.summaryText, { color: colors.text }]}>
                          Suara Sah Paslon: <Text style={{ fontWeight: '800' }}>{topCandidate ? `${topCandidate[0].split('—')[0]}: ${topCandidate[1]} Suara` : '-'}</Text>
                        </Text>
                      </View>
                      <View style={styles.summaryRow}>
                        <Feather name="image" size={13} color={colors.success} />
                        <Text style={[styles.summaryText, { color: colors.success }]}>
                          Lampiran C1 Plano Terunggah & Terverifikasi
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <Text style={{ fontSize: 12, color: colors.textMuted, fontStyle: 'italic' }}>
                      Belum ada data perolehan suara C1 yang diunggah untuk TPS ini.
                    </Text>
                  )}

                  {/* Card Action Buttons */}
                  <View style={{ flexDirection: 'row', gap: spacing.xs, marginTop: 4 }}>
                    <PrimaryButton
                      label={isDone ? 'Lihat Pratinjau C1' : 'Scan OCR C1'}
                      icon={isDone ? 'eye' : 'zap'}
                      variant="secondary"
                      onPress={() => (isDone ? setPreviewTps(t) : navigation.navigate('C1Ocr', { tpsId: t.id }))}
                      style={{ flex: 1, minHeight: 38, paddingVertical: 6 }}
                    />
                    <PrimaryButton
                      label={isDone ? 'Edit Laporan' : 'Isi C1'}
                      icon={isDone ? 'edit-3' : 'plus'}
                      onPress={() => handleSelectTpsForEdit(t)}
                      style={{ flex: 1, minHeight: 38, paddingVertical: 6 }}
                    />
                  </View>
                </Card>
              );
            })}
          </>
        )}

        {/* VIEW MODE 2: FORMULIR INPUT / EDIT C1 */}
        {viewMode === 'form' && (
          <>
            <View style={styles.header}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <SectionTitle style={{ marginBottom: 0 }}>
                  {isEditing ? `Edit Laporan ${activeRecord.id}` : `Formulir Baru ${activeRecord.id}`}
                </SectionTitle>
                <Pill label={isEditing ? 'Perbarui Data' : 'Baru'} tone={isEditing ? 'warning' : 'primary'} />
              </View>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                {activeRecord.id} — TPS {activeRecord.tpsNumber}, {activeRecord.district}, {activeRecord.regency}
              </Text>
            </View>

            {/* Quick Switcher Select TPS */}
            <Card style={{ gap: spacing.xs }}>
              <SectionTitle style={{ marginBottom: 0 }}>Pilih TPS untuk Diisi / Di-edit</SectionTitle>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.xs }}>
                {scopedTps.map((t) => {
                  const isSelected = t.id === selectedTpsId;
                  return (
                    <Pressable
                      key={t.id}
                      onPress={() => handleSelectTpsForEdit(t)}
                      style={[
                        styles.tpsSelectorPill,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.surface,
                          borderColor: isSelected ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <Text style={{ fontSize: 11, fontWeight: '800', color: isSelected ? '#FFFFFF' : colors.text }}>
                        {t.id} (TPS {t.tpsNumber})
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </Card>

            <PrimaryButton
              label="Scan Otomatis Kamera Formulir C1 (OCR)"
              icon="zap"
              variant="secondary"
              onPress={() => navigation.navigate('C1Ocr', { tpsId: activeRecord.id })}
            />

            <Card style={{ gap: spacing.md }}>
              <SectionTitle style={{ marginBottom: 0 }}>Data Kehadiran Pemilih</SectionTitle>
              <Input label="Jumlah DPT Terdaftar" value={String(activeRecord.dpt)} editable={false} icon="users" />
              <Input
                label="Jumlah Pemilih Hadir"
                value={votersPresent}
                onChangeText={setVotersPresent}
                keyboardType="numeric"
                icon="user-check"
                placeholder="Masukkan total pemilih hadir"
              />
              <Input
                label="Jumlah Suara Tidak Sah"
                value={invalidVotes}
                onChangeText={setInvalidVotes}
                keyboardType="numeric"
                icon="x-circle"
                placeholder="Masukkan jumlah suara tidak sah"
              />
            </Card>

            {/* Category Tabs Selector */}
            <View style={{ gap: spacing.xs }}>
              <SectionTitle style={{ marginBottom: 0 }}>Pilih Kategori Entri Suara</SectionTitle>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.xs }}>
                {ENTRY_TABS.map((tab) => {
                  const isSelected = entryCategory === tab.key;
                  return (
                    <Pressable
                      key={tab.key}
                      onPress={() => setEntryCategory(tab.key)}
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

            {/* Pilpres Votes Card */}
            {(entryCategory === 'pilpres' || entryCategory === 'all') && (
              <Card style={{ gap: spacing.md }}>
                <SectionTitle style={{ marginBottom: 0 }} action={<Pill label="Pilpres" tone="primary" />}>
                  Pemilu Presiden & Wapres
                </SectionTitle>
                {candidateNames.map((c) => (
                  <Input
                    key={c}
                    label={c}
                    value={candidateValues[c]}
                    onChangeText={(v) => setCandidateValues((prev) => ({ ...prev, [c]: v }))}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                ))}
              </Card>
            )}

            {/* Caleg DPR RI Votes Card */}
            {(entryCategory === 'dpr' || entryCategory === 'all') && (
              <Card style={{ gap: spacing.md }}>
                <SectionTitle style={{ marginBottom: 0 }} action={<Pill label="Dapil Jabar I" tone="info" />}>
                  Suara Caleg DPR RI
                </SectionTitle>
                {dprCandidates.map((c) => (
                  <Input
                    key={c}
                    label={c}
                    value={dprCandidateValues[c]}
                    onChangeText={(v) => setDprCandidateValues((prev) => ({ ...prev, [c]: v }))}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                ))}
              </Card>
            )}

            {/* Party Votes Card */}
            {(entryCategory === 'partai' || entryCategory === 'all') && (
              <Card style={{ gap: spacing.md }}>
                <SectionTitle style={{ marginBottom: 0 }} action={<Pill label="Partai" tone="neutral" />}>
                  Suara Partai Politik
                </SectionTitle>
                {partyNames.map((p) => (
                  <Input
                    key={p}
                    label={p}
                    value={partyValues[p]}
                    onChangeText={(v) => setPartyValues((prev) => ({ ...prev, [p]: v }))}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                ))}
              </Card>
            )}

            <Card style={{ gap: spacing.sm }}>
              <SectionTitle style={{ marginBottom: 0 }}>Lampiran Foto & Video C1</SectionTitle>
              <UploadRow
                label="Foto Formulir C.Hasil Plano (Wajib)"
                done={uploads.formPhoto}
                imageUri={uploads.formPhoto ? IMAGES.c1Form : undefined}
                onPress={() => toggleUpload('formPhoto')}
              />
              <UploadRow
                label="Foto Papan Perhitungan TPS (Wajib)"
                done={uploads.tpsPhoto}
                imageUri={uploads.tpsPhoto ? IMAGES.ballotPaper : undefined}
                onPress={() => toggleUpload('tpsPhoto')}
              />
              <UploadRow
                label="Video Suasana TPS (Opsional)"
                done={uploads.tpsVideo}
                onPress={() => toggleUpload('tpsVideo')}
              />
            </Card>

            <PrimaryButton
              label={isEditing ? 'Simpan Perubahan Laporan C1' : 'Kirim & Simpan Laporan TPS Baru'}
              icon="send"
              onPress={handleSubmitForm}
            />
          </>
        )}
      </ScrollView>

      {/* FULL C1 DOCUMENT PREVIEW MODAL */}
      <Modal visible={!!previewTps} animationType="slide" transparent onRequestClose={() => setPreviewTps(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: fontSize.md, fontWeight: '800', color: colors.text }}>
                Pratinjau Dokumen C1 {previewTps?.id}
              </Text>
              <Pressable hitSlop={8} onPress={() => setPreviewTps(null)}>
                <Feather name="x" size={20} color={colors.textMuted} />
              </Pressable>
            </View>

            {previewTps && (
              <ScrollView contentContainerStyle={{ gap: spacing.md, paddingVertical: spacing.xs }}>
                <Image source={{ uri: IMAGES.c1Form }} style={styles.modalFormImage} resizeMode="contain" />

                <Card style={{ gap: spacing.xs, backgroundColor: colors.background }}>
                  <SectionTitle style={{ marginBottom: 0 }}>Statistik Suara {previewTps.id}</SectionTitle>
                  <Text style={{ fontSize: 12, color: colors.textMuted }}>
                    TPS {previewTps.tpsNumber} — Kec. {previewTps.district}, {previewTps.regency}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.text, fontWeight: '700' }}>
                    Pemilih Hadir: {previewTps.votersPresent} / {previewTps.dpt} DPT | Suara Tidak Sah: {previewTps.votes.invalidVotes}
                  </Text>
                </Card>

                <Card style={{ gap: spacing.xs, backgroundColor: colors.background }}>
                  <SectionTitle style={{ marginBottom: 0 }} action={<Pill label="Pilpres" tone="primary" />}>
                    Suara Paslon Pilpres
                  </SectionTitle>
                  {Object.entries(previewTps.votes.candidateVotes).map(([name, val]) => (
                    <View key={name} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4, gap: spacing.xs }}>
                      <Image source={{ uri: getCandidateAvatar(name) }} style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: colors.border }} />
                      <Text style={{ fontSize: 12, color: colors.text, flex: 1, fontWeight: '600' }}>{name}</Text>
                      <Text style={{ fontSize: 12, fontWeight: '800', color: colors.text }}>{val} Suara</Text>
                    </View>
                  ))}
                </Card>

                {previewTps.votes.dprCandidateVotes && (
                  <Card style={{ gap: spacing.xs, backgroundColor: colors.background }}>
                    <SectionTitle style={{ marginBottom: 0 }} action={<Pill label="Dapil Jabar I" tone="info" />}>
                      Suara Caleg DPR RI
                    </SectionTitle>
                    {Object.entries(previewTps.votes.dprCandidateVotes).map(([name, val]) => (
                      <View key={name} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4, gap: spacing.xs }}>
                        <Image source={{ uri: getCandidateAvatar(name) }} style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: colors.border }} />
                        <Text style={{ fontSize: 12, color: colors.text, flex: 1, fontWeight: '600' }}>{name}</Text>
                        <Text style={{ fontSize: 12, fontWeight: '800', color: colors.text }}>{val} Suara</Text>
                      </View>
                    ))}
                  </Card>
                )}

                <PrimaryButton
                  label="Edit Laporan C1 Ini"
                  icon="edit-3"
                  onPress={() => {
                    const target = previewTps;
                    setPreviewTps(null);
                    handleSelectTpsForEdit(target);
                  }}
                />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

function UploadRow({
  label,
  done,
  imageUri,
  onPress,
}: {
  label: string;
  done: boolean;
  imageUri?: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.uploadRow, { borderBottomColor: colors.border }]}>
      {imageUri && <Image source={{ uri: imageUri }} style={styles.previewImage} />}
      <Text style={[styles.uploadLabel, { color: colors.text }]}>{label}</Text>
      <PrimaryButton
        label={done ? 'Terunggah' : 'Unggah Foto'}
        icon={done ? 'check' : 'upload'}
        variant={done ? 'primary' : 'secondary'}
        onPress={onPress}
        style={{ minHeight: 38, paddingVertical: 6, paddingHorizontal: 10 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  keyboardView: { flex: 1 },
  screen: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 140 },
  header: { gap: 2 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm },
  title: { fontSize: fontSize.xl, fontWeight: '800' },
  subtitle: { fontSize: fontSize.xs },
  cardTpsTitle: { fontSize: fontSize.md, fontWeight: '800', marginTop: 2 },
  modeTabPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  modeTabText: { fontSize: 12, fontWeight: '700' },
  filterPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  filterText: { fontSize: 11, fontWeight: '700' },
  summaryBox: {
    padding: spacing.xs + 2,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: 4,
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  summaryText: { fontSize: 11 },
  tpsSelectorPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  uploadRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.xs, gap: spacing.sm },
  uploadLabel: { fontSize: fontSize.xs, fontWeight: '600', flex: 1 },
  previewImage: { width: 44, height: 44, borderRadius: radius.sm, borderWidth: 1, borderColor: '#4F46E5' },
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: spacing.md,
  },
  modalContent: {
    maxHeight: '85%',
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  modalFormImage: { width: '100%', height: 220, borderRadius: radius.md },
});
