import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Card, EmptyState, Pill, PrimaryButton, SectionTitle, Input } from '../components/ui';
import { fontSize, radius, spacing } from '../theme';
import { CURRENT_WITNESS_ID } from '../utils/scope';
import { partyNames, candidateNames, dprCandidates } from '../data/regions';
import { IMAGES } from '../data/images';

type EntryTab = 'pilpres' | 'dpr' | 'partai' | 'all';

const ENTRY_TABS: Array<{ key: EntryTab; label: string; icon: keyof typeof Feather.glyphMap }> = [
  { key: 'pilpres', label: 'Pilpres', icon: 'flag' },
  { key: 'dpr', label: 'Caleg DPR RI', icon: 'users' },
  { key: 'partai', label: 'Partai Politik', icon: 'grid' },
  { key: 'all', label: 'Semua Formulir', icon: 'layers' },
];

export default function ReportFormScreen({ route, navigation }: any) {
  const { witnesses, tps, submitTpsReport } = useApp();
  const { colors } = useTheme();

  const [entryCategory, setEntryCategory] = useState<EntryTab>('pilpres');

  const currentWitness = witnesses.find((w) => w.id === CURRENT_WITNESS_ID);
  const tpsId = route?.params?.tpsId ?? currentWitness?.assignedTpsId;
  const record = tps.find((t) => t.id === tpsId);

  const [votersPresent, setVotersPresent] = useState(record ? String(record.votersPresent || '') : '');
  const [invalidVotes, setInvalidVotes] = useState(record ? String(record.votes.invalidVotes || '') : '');
  const [partyValues, setPartyValues] = useState<Record<string, string>>(
    Object.fromEntries(partyNames.map((p) => [p, String(record?.votes.partyVotes[p] || '')])),
  );
  const [candidateValues, setCandidateValues] = useState<Record<string, string>>(
    Object.fromEntries(candidateNames.map((c) => [c, String(record?.votes.candidateVotes[c] || '')])),
  );
  const [dprCandidateValues, setDprCandidateValues] = useState<Record<string, string>>(
    Object.fromEntries(dprCandidates.map((c) => [c, String(record?.votes.dprCandidateVotes?.[c] || '')])),
  );
  const [uploads, setUploads] = useState({ formPhoto: false, tpsPhoto: false, tpsVideo: false });
  const [submitted, setSubmitted] = useState(false);

  if (!record) {
    return <EmptyState title="TPS Tidak Ditemukan" body="Tidak ada TPS untuk diisi laporannya." icon="alert-circle" />;
  }

  const toggleUpload = (key: keyof typeof uploads) => setUploads((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSubmit = () => {
    if (!uploads.formPhoto || !uploads.tpsPhoto) {
      Alert.alert('Lengkapi Dokumen', 'Unggah foto formulir hasil dan foto TPS sebelum submit.');
      return;
    }
    submitTpsReport(record.id, {
      votersPresent: Number(votersPresent) || 0,
      votes: {
        partyVotes: Object.fromEntries(partyNames.map((p) => [p, Number(partyValues[p]) || 0])),
        candidateVotes: Object.fromEntries(candidateNames.map((c) => [c, Number(candidateValues[c]) || 0])),
        dprCandidateVotes: Object.fromEntries(dprCandidates.map((c) => [c, Number(dprCandidateValues[c]) || 0])),
        invalidVotes: Number(invalidVotes) || 0,
      },
      status: 'done',
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <Card style={{ alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl }}>
          <Image source={{ uri: IMAGES.c1Form }} style={styles.successThumbnail} />
          <Pill label="Laporan TPS Terkirim & Terverifikasi" tone="success" icon="check-circle" />
          <Text style={[styles.successTitle, { color: colors.text }]}>Laporan {record.id} Berhasil Dikirim!</Text>
          <Text style={[styles.successText, { color: colors.textMuted }]}>
            Data perolehan suara Pilpres, Caleg DPR RI, dan dokumen C.Hasil telah tersimpan dengan aman.
          </Text>
          <PrimaryButton label="Kembali ke Dashboard" variant="secondary" icon="arrow-left" onPress={() => navigation.goBack()} />
        </Card>
      </View>
    );
  }

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
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Formulir Laporan TPS</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {record.id} — TPS {record.tpsNumber}, {record.district}, {record.regency}
          </Text>
        </View>

        <PrimaryButton
          label="Pindai Otomatis Formulir C1"
          icon="zap"
          variant="secondary"
          onPress={() => navigation.navigate('C1Ocr', { tpsId: record.id })}
        />

        <Card style={{ gap: spacing.md }}>
          <SectionTitle style={{ marginBottom: 0 }}>Data Kehadiran Pemilih</SectionTitle>
          <Input label="Jumlah DPT Terdaftar" value={String(record.dpt)} editable={false} icon="users" />
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

        <PrimaryButton label="Kirim & Simpan Laporan TPS" icon="send" onPress={handleSubmit} />
      </ScrollView>
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
  title: { fontSize: fontSize.xl, fontWeight: '800' },
  subtitle: { fontSize: fontSize.xs },
  uploadRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.xs, gap: spacing.sm },
  uploadLabel: { fontSize: fontSize.xs, fontWeight: '600', flex: 1 },
  previewImage: { width: 44, height: 44, borderRadius: radius.sm, borderWidth: 1, borderColor: '#4F46E5' },
  successThumbnail: { width: 120, height: 120, borderRadius: radius.lg, marginBottom: spacing.xs },
  successTitle: { fontSize: fontSize.lg, fontWeight: '800' },
  successText: { fontSize: fontSize.sm, textAlign: 'center', paddingHorizontal: spacing.md },
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
});
