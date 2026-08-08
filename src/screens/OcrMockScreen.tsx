import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Card, EmptyState, Pill, PrimaryButton, SectionTitle, Input } from '../components/ui';
import { fontSize, iconStrokeWidth, radius, spacing } from '../theme';
import { partyNames, candidateNames } from '../data/regions';

type Stage = 'before' | 'scanning' | 'after' | 'done';

export default function OcrMockScreen({ route, navigation }: any) {
  const { tpsId } = route.params;
  const { tps, submitTpsReport } = useApp();
  const { colors } = useTheme();

  const record = tps.find((t) => t.id === tpsId);
  const [stage, setStage] = useState<Stage>('before');
  const [invalidVotes, setInvalidVotes] = useState('0');
  const [partyValues, setPartyValues] = useState<Record<string, string>>({});
  const [candidateValues, setCandidateValues] = useState<Record<string, string>>({});
  const [votersPresent, setVotersPresent] = useState('0');

  if (!record) {
    return <EmptyState title="TPS Tidak Ditemukan" body="Tidak dapat memproses OCR." icon="alert-circle" />;
  }

  const runScan = () => {
    setStage('scanning');
    setTimeout(() => {
      const present = Math.round(record.dpt * 0.78);
      const invalid = Math.max(1, Math.round(present * 0.02));
      const remaining = present - invalid;
      const share = Math.floor(remaining / 3);
      setVotersPresent(String(present));
      setInvalidVotes(String(invalid));
      setPartyValues({
        [partyNames[0]]: String(share + 12),
        [partyNames[1]]: String(share - 5),
        [partyNames[2]]: String(remaining - (share + 12) - (share - 5)),
      });
      setCandidateValues({
        [candidateNames[0]]: String(share + 8),
        [candidateNames[1]]: String(share - 3),
        [candidateNames[2]]: String(remaining - (share + 8) - (share - 3)),
      });
      setStage('after');
    }, 1400);
  };

  const confirm = () => {
    submitTpsReport(record.id, {
      votersPresent: Number(votersPresent) || 0,
      votes: {
        partyVotes: Object.fromEntries(partyNames.map((p) => [p, Number(partyValues[p]) || 0])),
        candidateVotes: Object.fromEntries(candidateNames.map((c) => [c, Number(candidateValues[c]) || 0])),
        invalidVotes: Number(invalidVotes) || 0,
      },
      status: 'done',
    });
    setStage('done');
  };

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>AI OCR — Pindai Formulir C.Hasil</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          {record.id} — TPS {record.tpsNumber}, {record.district}, {record.regency}
        </Text>
      </View>

      <Card style={{ alignItems: 'center', gap: spacing.md }}>
        <View style={[styles.photoPlaceholder, { backgroundColor: colors.primaryLight, borderColor: colors.border }]}>
          <Feather name="file-text" size={40} color={colors.primary} strokeWidth={iconStrokeWidth} />
          <Text style={[styles.photoCaption, { color: colors.primary }]}>Area Pratinjau Pemindaian C.Hasil</Text>
        </View>

        {stage === 'before' && (
          <PrimaryButton label="Jalankan Pemindaian AI OCR" icon="zap" onPress={runScan} style={{ width: '100%' }} />
        )}
        {stage === 'scanning' && (
          <PrimaryButton label="Memproses Gambar dengan AI..." onPress={() => {}} loading style={{ width: '100%' }} />
        )}
      </Card>

      {(stage === 'after' || stage === 'done') && (
        <>
          <Card style={{ gap: spacing.sm }}>
            <SectionTitle style={{ marginBottom: 0 }}>Hasil Ekstraksi OCR</SectionTitle>
            <Text style={[styles.hint, { color: colors.textMuted }]}>
              Silakan periksa dan perbaiki angka yang diekstrak AI jika terdapat perbedaan.
            </Text>
            <Input
              label="Pemilih Hadir"
              value={votersPresent}
              onChangeText={setVotersPresent}
              editable={stage === 'after'}
              keyboardType="numeric"
            />
            <Input
              label="Suara Tidak Sah"
              value={invalidVotes}
              onChangeText={setInvalidVotes}
              editable={stage === 'after'}
              keyboardType="numeric"
            />

            <Text style={[styles.subHeading, { color: colors.text }]}>Suara Partai</Text>
            {partyNames.map((p) => (
              <Input
                key={p}
                label={p}
                value={partyValues[p] ?? '0'}
                onChangeText={(v) => setPartyValues((prev) => ({ ...prev, [p]: v }))}
                editable={stage === 'after'}
                keyboardType="numeric"
              />
            ))}

            <Text style={[styles.subHeading, { color: colors.text }]}>Suara Kandidat</Text>
            {candidateNames.map((c) => (
              <Input
                key={c}
                label={c}
                value={candidateValues[c] ?? '0'}
                onChangeText={(v) => setCandidateValues((prev) => ({ ...prev, [c]: v }))}
                editable={stage === 'after'}
                keyboardType="numeric"
              />
            ))}
          </Card>

          {stage === 'after' && (
            <PrimaryButton label="Konfirmasi & Simpan Hasil" icon="check" onPress={confirm} />
          )}

          {stage === 'done' && (
            <Card style={{ alignItems: 'center', gap: spacing.md, paddingVertical: spacing.lg }}>
              <Pill label="Hasil AI Terverifikasi & Terkirim" tone="success" icon="check-circle" />
              <PrimaryButton label="Kembali ke Laporan" variant="secondary" icon="arrow-left" onPress={() => navigation.goBack()} />
            </Card>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  header: { gap: 2 },
  title: { fontSize: fontSize.xl, fontWeight: '800' },
  subtitle: { fontSize: fontSize.xs },
  photoPlaceholder: {
    width: '100%',
    height: 150,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  photoCaption: { fontSize: fontSize.xs, fontWeight: '700' },
  hint: { fontSize: fontSize.xs, marginBottom: spacing.xs },
  subHeading: { fontSize: fontSize.sm, fontWeight: '700', marginTop: spacing.xs },
});
