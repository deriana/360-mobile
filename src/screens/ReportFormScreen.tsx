import React, { useEffect, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Card, ConfirmDialog, DropdownPicker, EmptyState, IconButton, Modal, Pill, PrimaryButton, SectionTitle, Input, StatusBadge } from '../components/ui';
import { fonts, fontSize, radius, spacing } from '../theme';
import { CURRENT_WITNESS_ID, scopeTps } from '../utils/scope';
import { partyNames, candidateNames, dprCandidates } from '../data/regions';
import { IMAGES, getTpsPhoto, getCandidateAvatar } from '../data/images';
import { pickImage } from '../utils/pickImage';
import { generateWatermarkText } from '../utils/watermark';
import { addToOfflineQueue } from '../utils/offlineQueue';
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
  const { witnesses, tps, submitTpsReport, addDocumentationPhoto, role } = useApp();
  const { colors, isDark } = useTheme();

  const currentWitness = witnesses.find((w) => w.id === CURRENT_WITNESS_ID);
  const scopedTps = scopeTps(role, tps, witnesses);

  // Initial TPS from route params or the witness's own assignment — otherwise
  // leave unselected so ambiguous "new report" entry forces an explicit pick.
  const initialTpsId: string | null = route?.params?.tpsId ?? currentWitness?.assignedTpsId ?? null;

  const [viewMode, setViewMode] = useState<MainViewMode>(route?.params?.tpsId ? 'form' : 'history');
  const [selectedTpsId, setSelectedTpsId] = useState<string | null>(initialTpsId);
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>('all');
  const [previewTps, setPreviewTps] = useState<Tps | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    visible: boolean;
    title: string;
    message: string;
    tone?: 'danger' | 'primary' | 'warning' | 'success' | 'info';
    confirmLabel?: string;
    cancelLabel?: string;
    singleButton?: boolean;
    onConfirm?: () => void;
    onCancel?: () => void;
  }>({ visible: false, title: '', message: '' });

  // Form State for active TPS being edited — null until a TPS is explicitly chosen
  const activeRecord = selectedTpsId ? tps.find((t) => t.id === selectedTpsId) ?? null : null;

  const [entryCategory, setEntryCategory] = useState<EntryTab>('pilpres');
  const prefillInvalidVotes: number | undefined = route?.params?.prefillInvalidVotes;
  const [votersPresent, setVotersPresent] = useState(String(activeRecord?.votersPresent || ''));
  const [invalidVotes, setInvalidVotes] = useState(String(prefillInvalidVotes ?? activeRecord?.votes.invalidVotes ?? ''));
  const [partyValues, setPartyValues] = useState<Record<string, string>>(
    Object.fromEntries(partyNames.map((p) => [p, String(activeRecord?.votes.partyVotes[p] || '')])),
  );
  const prefillCandidateVotes: Record<string, number> | undefined = route?.params?.prefillCandidateVotes;
  const [candidateValues, setCandidateValues] = useState<Record<string, string>>(
    Object.fromEntries(
      candidateNames.map((c) => [c, String(prefillCandidateVotes?.[c] ?? activeRecord?.votes.candidateVotes[c] ?? '')]),
    ),
  );
  const [dprCandidateValues, setDprCandidateValues] = useState<Record<string, string>>(
    Object.fromEntries(dprCandidates.map((c) => [c, String(activeRecord?.votes.dprCandidateVotes?.[c] || '')])),
  );
  const [uploads, setUploads] = useState<{ formPhoto: any; tpsPhoto: any; tpsVideo: boolean }>({
    formPhoto: IMAGES.c1Form,
    tpsPhoto: IMAGES.ballotPaper,
    tpsVideo: false,
  });
  const [isEditing, setIsEditing] = useState(false);
  // Tracks which uploads are real user-picked photos
  const [pickedReal, setPickedReal] = useState<{ formPhoto: boolean; tpsPhoto: boolean }>({ formPhoto: false, tpsPhoto: false });
  const [photoWatermarks, setPhotoWatermarks] = useState<{ formPhoto?: string; tpsPhoto?: string }>({});
  const [importedNotice, setImportedNotice] = useState<string | null>(null);

  // Reaktif terhadap incoming prefill dari QuickCount
  useEffect(() => {
    if (route?.params?.prefillCandidateVotes) {
      setViewMode('form');
      setEntryCategory('pilpres');
      if (route.params.tpsId) {
        setSelectedTpsId(route.params.tpsId);
      }
      const incoming = route.params.prefillCandidateVotes;
      setCandidateValues((prev) => ({
        ...prev,
        ...Object.fromEntries(
          Object.entries(incoming).map(([k, v]) => [k, String(v ?? 0)])
        ),
      }));
      if (route.params.prefillInvalidVotes !== undefined) {
        setInvalidVotes(String(route.params.prefillInvalidVotes));
      }

      const totalValid = Object.values(incoming).reduce((sum: number, val: any) => sum + Number(val || 0), 0);
      const totalCounted = totalValid + Number(route.params.prefillInvalidVotes || 0);
      setVotersPresent((curr) => (!curr || curr === '0' ? String(totalCounted) : curr));

      setImportedNotice(`Data hasil Hitung Cepat Bilik Suara (${totalCounted} suara) berhasil diimpor otomatis!`);
    }
  }, [route?.params?.prefillCandidateVotes, route?.params?.prefillInvalidVotes, route?.params?.tpsId]);

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
    setUploads({
      formPhoto: targetTps.status === 'done' ? IMAGES.c1Form : null,
      tpsPhoto: targetTps.status === 'done' ? IMAGES.ballotPaper : null,
      tpsVideo: false,
    });
    setPickedReal({ formPhoto: false, tpsPhoto: false });
    setIsEditing(targetTps.status === 'done');
    setViewMode('form');
  };

  const handleCreateNewReport = () => {
    if (scopedTps.length === 1) {
      handleSelectTpsForEdit(scopedTps[0]);
      setIsEditing(false);
      return;
    }
    // Multiple TPS in scope — force an explicit pick via the dropdown instead
    // of silently guessing one (was picking an out-of-scope TPS before).
    setSelectedTpsId(null);
    setIsEditing(false);
    setViewMode('form');
  };

  const toggleVideo = () => setUploads((prev) => ({ ...prev, tpsVideo: !prev.tpsVideo }));

  const handlePickUpload = async (key: 'formPhoto' | 'tpsPhoto', source: 'camera' | 'library') => {
    const uri = await pickImage(source);
    if (!uri) return;

    let lat = activeRecord?.lat ?? -6.8833;
    let lng = activeRecord?.lng ?? 107.6167;
    try {
      const loc = await Location.getLastKnownPositionAsync({});
      if (loc) {
        lat = loc.coords.latitude;
        lng = loc.coords.longitude;
      }
    } catch (e) {
      // fallback
    }

    const watermark = generateWatermarkText({
      tpsId: activeRecord?.id,
      tpsNumber: activeRecord?.tpsNumber,
      village: activeRecord?.village ?? 'DAGO',
      district: activeRecord?.district ?? 'Coblong',
      regency: activeRecord?.regency ?? 'Kota Bandung',
      lat,
      lng,
    });

    setUploads((prev) => ({ ...prev, [key]: { uri } }));
    setPickedReal((prev) => ({ ...prev, [key]: true }));
    setPhotoWatermarks((prev) => ({ ...prev, [key]: watermark.watermarkText }));
  };

  const executeSaveReport = (pemilihHadir: number, totalTidakSah: number) => {
    if (!activeRecord) return;
    const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    if (pickedReal.formPhoto) {
      addDocumentationPhoto(activeRecord.id, {
        source: uploads.formPhoto,
        takenAt: `${now} WIB — Foto Formulir C1 Plano`,
        watermark: photoWatermarks.formPhoto,
      });
    }
    if (pickedReal.tpsPhoto) {
      addDocumentationPhoto(activeRecord.id, {
        source: uploads.tpsPhoto,
        takenAt: `${now} WIB — Foto Papan Perhitungan TPS`,
        watermark: photoWatermarks.tpsPhoto,
      });
    }

    const reportPayload = {
      tpsId: activeRecord.id,
      votersPresent: pemilihHadir,
      votes: {
        partyVotes: Object.fromEntries(partyNames.map((p) => [p, Number(partyValues[p]) || 0])),
        candidateVotes: Object.fromEntries(candidateNames.map((c) => [c, Number(candidateValues[c]) || 0])),
        dprCandidateVotes: Object.fromEntries(dprCandidates.map((c) => [c, Number(dprCandidateValues[c]) || 0])),
        invalidVotes: totalTidakSah,
      },
      watermark: photoWatermarks.formPhoto,
      timestamp: new Date().toISOString(),
      status: 'done' as const,
    };

    addToOfflineQueue('c1_report', reportPayload);
    submitTpsReport(activeRecord.id, reportPayload);

    setConfirmDialog({
      visible: true,
      title: 'Laporan Berhasil Disimpan',
      message: `Data perolehan suara C1 untuk ${activeRecord.id} telah tersimpan dan dicatat dalam antrean sinkronisasi server.`,
      tone: 'success',
      confirmLabel: 'Lihat Riwayat Laporan',
      singleButton: true,
      onConfirm: () => {
        setConfirmDialog((prev) => ({ ...prev, visible: false }));
        setViewMode('history');
      },
    });
  };

  const handleSubmitForm = () => {
    if (!activeRecord) return;
    if (!uploads.formPhoto || !uploads.tpsPhoto) {
      setConfirmDialog({
        visible: true,
        title: 'Lengkapi Dokumen',
        message: 'Unggah foto formulir C1 Plano dan foto lokasi TPS sebelum submit.',
        tone: 'warning',
        singleButton: true,
      });
      return;
    }

    const candidateVotesSum = Object.values(candidateValues).reduce((sum, v) => sum + (Number(v) || 0), 0);
    const partyVotesSum = Object.values(partyValues).reduce((sum, v) => sum + (Number(v) || 0), 0);
    const dprVotesSum = Object.values(dprCandidateValues).reduce((sum, v) => sum + (Number(v) || 0), 0);
    const currentCategorySah =
      entryCategory === 'pilpres'
        ? candidateVotesSum
        : entryCategory === 'dpr'
        ? dprVotesSum
        : partyVotesSum;

    const totalTidakSah = Number(invalidVotes) || 0;
    const pemilihHadir = Number(votersPresent) || 0;
    const totalSuara = currentCategorySah + totalTidakSah;

    if (pemilihHadir > 0 && totalSuara !== pemilihHadir) {
      const selisih = Math.abs(totalSuara - pemilihHadir);
      setConfirmDialog({
        visible: true,
        title: 'Peringatan Disparitas Suara',
        message: `Total suara (${totalSuara}) tidak sama dengan Pemilih Hadir (${pemilihHadir}). Terjadi selisih ${selisih} suara.\n\nApakah Anda ingin tetap mengirimkan laporan C1 ini sesuai catatan selisih dari KPPS?`,
        tone: 'danger',
        confirmLabel: 'Tetap Kirim (Ada Selisih KPPS)',
        cancelLabel: 'Periksa Kembali',
        singleButton: false,
        onConfirm: () => {
          setConfirmDialog((prev) => ({ ...prev, visible: false }));
          executeSaveReport(pemilihHadir, totalTidakSah);
        },
        onCancel: () => setConfirmDialog((prev) => ({ ...prev, visible: false })),
      });
      return;
    }

    executeSaveReport(pemilihHadir, totalTidakSah);
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
                  {activeRecord ? (isEditing ? `Edit Laporan ${activeRecord.id}` : `Formulir Baru ${activeRecord.id}`) : 'Formulir Baru'}
                </SectionTitle>
                {activeRecord && <Pill label={isEditing ? 'Perbarui Data' : 'Baru'} tone={isEditing ? 'warning' : 'primary'} />}
              </View>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                {activeRecord
                  ? `${activeRecord.id} — TPS ${activeRecord.tpsNumber}, ${activeRecord.district}, ${activeRecord.regency}`
                  : 'Pilih TPS dulu di bawah sebelum mengisi formulir.'}
              </Text>
            </View>

            {/* Quick Switcher Select TPS — only shown when there's actually a choice */}
            {scopedTps.length > 1 && (
              <Card style={{ gap: spacing.xs }}>
                <SectionTitle style={{ marginBottom: 0 }}>Pilih TPS untuk Diisi / Di-edit</SectionTitle>
                <DropdownPicker
                  label="TPS"
                  icon="map-pin"
                  value={selectedTpsId ?? ''}
                  placeholder="Belum ada TPS dipilih"
                  options={scopedTps.map((t) => ({
                    label: `${t.id} (TPS ${t.tpsNumber} — Kec. ${t.district})`,
                    value: t.id,
                  }))}
                  onSelect={(id) => {
                    const target = scopedTps.find((t) => t.id === id);
                    if (target) handleSelectTpsForEdit(target);
                  }}
                />
              </Card>
            )}

            {!activeRecord ? (
              <EmptyState
                title="Belum Ada TPS Dipilih"
                body="Pilih TPS dari dropdown di atas untuk mulai mengisi formulir C1. Input belum bisa diisi sebelum TPS ditentukan."
                icon="map-pin"
              />
            ) : (
              <>
                {importedNotice && (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: spacing.xs,
                      backgroundColor: colors.primaryLight,
                      borderColor: colors.primary,
                      borderWidth: 1,
                      borderRadius: radius.md,
                      padding: spacing.sm,
                      marginBottom: spacing.xs,
                    }}
                  >
                    <Feather name="check-circle" size={16} color={colors.primary} />
                    <Text style={{ flex: 1, fontSize: fontSize.xs, color: colors.primary, fontWeight: '700' }}>
                      {importedNotice}
                    </Text>
                    <Pressable onPress={() => setImportedNotice(null)} hitSlop={8}>
                      <Feather name="x" size={14} color={colors.primary} />
                    </Pressable>
                  </View>
                )}

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

                {/* Live Mathematical Balance Indicator */}
                {Number(votersPresent) > 0 && (() => {
                  const candSum = Object.values(candidateValues).reduce((sum, v) => sum + (Number(v) || 0), 0);
                  const prtSum = Object.values(partyValues).reduce((sum, v) => sum + (Number(v) || 0), 0);
                  const dprSum = Object.values(dprCandidateValues).reduce((sum, v) => sum + (Number(v) || 0), 0);
                  const activeSah = entryCategory === 'pilpres' ? candSum : entryCategory === 'dpr' ? dprSum : prtSum;
                  const tdkSah = Number(invalidVotes) || 0;
                  const hadir = Number(votersPresent) || 0;
                  const totalMasuk = activeSah + tdkSah;
                  const selisih = totalMasuk - hadir;
                  const match = selisih === 0;

                  return (
                    <Card
                      style={{
                        gap: spacing.xs,
                        backgroundColor: match ? colors.successBg : colors.dangerBg,
                        borderColor: match ? colors.success : colors.danger,
                        borderWidth: 1,
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Feather
                            name={match ? 'check-circle' : 'alert-triangle'}
                            size={16}
                            color={match ? colors.success : colors.danger}
                            strokeWidth={2}
                          />
                          <Text style={{ fontSize: fontSize.xs, fontWeight: '800', color: match ? colors.success : colors.danger }}>
                            {match
                              ? 'Keseimbangan Suara: Akurat Sempurna'
                              : `Disparitas Suara! Selisih ${Math.abs(selisih)} Suara`}
                          </Text>
                        </View>
                        <Pill
                          label={match ? 'Cocok (100%)' : selisih > 0 ? `+${selisih}` : `${selisih}`}
                          tone={match ? 'success' : 'danger'}
                        />
                      </View>

                      <Text style={{ fontSize: 11, color: colors.text, lineHeight: 16 }}>
                        {match
                          ? `Total suara masuk (${totalMasuk}) seimbang dengan Pemilih Hadir (${hadir}). Rincian: ${activeSah} Suara Sah (${entryCategory.toUpperCase()}) + ${tdkSah} Suara Tidak Sah.`
                          : `Total suara masuk (${totalMasuk}) tidak sama dengan Pemilih Hadir (${hadir}). Rincian: ${activeSah} Suara Sah (${entryCategory.toUpperCase()}) + ${tdkSah} Tidak Sah. Selisih ${selisih > 0 ? `kelebihan +${selisih}` : `kekurangan ${selisih}`} suara.`}
                      </Text>
                    </Card>
                  );
                })()}

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
                imageSource={uploads.formPhoto}
                watermark={photoWatermarks.formPhoto}
                onPick={(source) => handlePickUpload('formPhoto', source)}
              />
              <UploadRow
                label="Foto Papan Perhitungan TPS (Wajib)"
                imageSource={uploads.tpsPhoto}
                watermark={photoWatermarks.tpsPhoto}
                onPick={(source) => handlePickUpload('tpsPhoto', source)}
              />
              <UploadRow
                label="Video Suasana TPS (Opsional)"
                done={uploads.tpsVideo}
                onPress={toggleVideo}
              />
            </Card>

                <PrimaryButton
                  label={isEditing ? 'Simpan Perubahan Laporan C1' : 'Kirim & Simpan Laporan TPS Baru'}
                  icon="send"
                  onPress={handleSubmitForm}
                />
              </>
            )}
          </>
        )}
      </ScrollView>

      {/* FULL C1 DOCUMENT PREVIEW MODAL */}
      <Modal
        visible={!!previewTps}
        onClose={() => setPreviewTps(null)}
        variant="floating"
        title={previewTps ? `Pratinjau Dokumen C1 ${previewTps.id}` : ''}
      >
        {previewTps && (
          <ScrollView contentContainerStyle={{ gap: spacing.md, paddingVertical: spacing.xs }}>
            <Image source={IMAGES.c1Form} style={styles.modalFormImage} resizeMode="contain" />

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
                  <Image source={getCandidateAvatar(name)} style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: colors.border }} />
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
                    <Image source={getCandidateAvatar(name)} style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: colors.border }} />
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
      </Modal>

      <ConfirmDialog
        visible={confirmDialog.visible}
        title={confirmDialog.title}
        message={confirmDialog.message}
        tone={confirmDialog.tone || 'primary'}
        confirmLabel={confirmDialog.confirmLabel}
        cancelLabel={confirmDialog.cancelLabel}
        singleButton={confirmDialog.singleButton}
        onConfirm={() => {
          if (confirmDialog.onConfirm) {
            confirmDialog.onConfirm();
          } else {
            setConfirmDialog((prev) => ({ ...prev, visible: false }));
          }
        }}
        onCancel={confirmDialog.onCancel || (() => setConfirmDialog((prev) => ({ ...prev, visible: false })))}
      />
    </KeyboardAvoidingView>
  );
}

export function UploadRow({
  label,
  imageSource,
  onPick,
  done,
  onPress,
  watermark,
}: {
  label: string;
  imageSource?: any;
  onPick?: (source: 'camera' | 'library') => void;
  done?: boolean;
  onPress?: () => void;
  watermark?: string;
}) {
  const { colors } = useTheme();

  // Real camera/gallery picker mode (photo rows)
  if (onPick) {
    const isDone = !!imageSource;
    return (
      <View style={{ gap: 4, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: spacing.xs }}>
        <View style={[styles.uploadRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
          {isDone ? (
            <Image source={imageSource} style={styles.previewImage} />
          ) : (
            <View style={[styles.previewPlaceholder, { backgroundColor: colors.primaryLight, borderColor: colors.border }]}>
              <Feather name="image" size={16} color={colors.primary} />
            </View>
          )}
          <Text style={[styles.uploadLabel, { color: colors.text }]}>{label}</Text>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <IconButton icon="camera" tone={isDone ? 'neutral' : 'primary'} size={16} onPress={() => onPick('camera')} />
            <IconButton icon="image" tone={isDone ? 'neutral' : 'primary'} size={16} onPress={() => onPick('library')} />
          </View>
        </View>
        {watermark && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingLeft: 46 }}>
            <Feather name="shield" size={10} color={colors.success} />
            <Text style={{ fontSize: 9, color: colors.success, fontWeight: '700' }} numberOfLines={1}>
              {watermark}
            </Text>
          </View>
        )}
      </View>
    );
  }

  // Simple toggle mode (optional video row — no real picker)
  return (
    <View style={[styles.uploadRow, { borderBottomColor: colors.border }]}>
      {imageSource && <Image source={imageSource} style={styles.previewImage} />}
      <Text style={[styles.uploadLabel, { color: colors.text }]}>{label}</Text>
      <PrimaryButton
        label={done ? 'Ditandai' : 'Tandai Ada'}
        icon={done ? 'check' : 'video'}
        variant={done ? 'primary' : 'secondary'}
        onPress={onPress ?? (() => {})}
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
  title: { fontFamily: fonts.extraBold, fontSize: fontSize.xl },
  subtitle: { fontFamily: fonts.regular, fontSize: fontSize.xs },
  cardTpsTitle: { fontFamily: fonts.bold, fontSize: fontSize.md, marginTop: 2 },
  modeTabPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  modeTabText: { fontFamily: fonts.bold, fontSize: 12 },
  filterPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  filterText: { fontFamily: fonts.bold, fontSize: 11 },
  summaryBox: {
    padding: spacing.xs + 2,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: 4,
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  summaryText: { fontFamily: fonts.regular, fontSize: 11 },
  uploadRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.xs, gap: spacing.sm },
  uploadLabel: { fontFamily: fonts.semiBold, fontSize: fontSize.xs, flex: 1 },
  previewImage: { width: 44, height: 44, borderRadius: radius.sm, borderWidth: 1, borderColor: '#4F46E5' },
  previewPlaceholder: { width: 44, height: 44, borderRadius: radius.sm, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  categoryTabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  categoryTabText: { fontFamily: fonts.medium, fontSize: 12 },
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
