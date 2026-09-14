import React, { useState } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Card, EmptyState, Pill, PrimaryButton, SectionTitle, Input } from '../components/ui';
import { fontSize, iconStrokeWidth, radius, spacing } from '../theme';
import { partyNames, candidateNames, dprCandidates } from '../data/regions';
import { pickImage } from '../utils/pickImage';
import { scanC1PlanoWithVisionAi, C1OcrBoxDetection } from '../utils/ocrApi';
import { UploadRow } from './ReportFormScreen';

type ScanStage = 'before' | 'scanning' | 'review' | 'attachment' | 'done';

export default function C1OcrScreen({ route, navigation }: any) {
  const { tpsId } = route.params || { tpsId: 'TPS-001' };
  const { tps, submitTpsReport, addDocumentationPhoto } = useApp();
  const { colors } = useTheme();

  const record = tps.find((t) => t.id === tpsId);
  const [stage, setStage] = useState<ScanStage>('before');
  const [invalidVotes, setInvalidVotes] = useState('0');
  const [partyValues, setPartyValues] = useState<Record<string, string>>({});
  const [candidateValues, setCandidateValues] = useState<Record<string, string>>({});
  const [dprCandidateValues, setDprCandidateValues] = useState<Record<string, string>>({});
  const [votersPresent, setVotersPresent] = useState('0');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [tpsPhoto, setTpsPhoto] = useState<any>(null);
  const [tpsVideo, setTpsVideo] = useState(false);

  // Vision AI state
  const [aiConfidence, setAiConfidence] = useState<number>(0);
  const [aiSource, setAiSource] = useState<'api' | 'offline_fallback'>('api');
  const [detectedBoxes, setDetectedBoxes] = useState<C1OcrBoxDetection[]>([]);
  const [aiMessage, setAiMessage] = useState<string>('');

  if (!record) {
    return <EmptyState title="TPS Tidak Ditemukan" body="Tidak dapat memproses OCR C1." icon="alert-circle" />;
  }

  const handlePick = async (source: 'camera' | 'library') => {
    const uri = await pickImage(source);
    if (uri) setPhotoUri(uri);
  };

  const handlePickTpsPhoto = async (source: 'camera' | 'library') => {
    const uri = await pickImage(source);
    if (uri) setTpsPhoto({ uri });
  };

  const resetAll = () => {
    setPhotoUri(null);
    setStage('before');
    setInvalidVotes('0');
    setPartyValues({});
    setCandidateValues({});
    setDprCandidateValues({});
    setVotersPresent('0');
    setTpsPhoto(null);
    setTpsVideo(false);
    setAiConfidence(0);
    setDetectedBoxes([]);
    setAiMessage('');
  };

  const runScan = async () => {
    if (!photoUri) return;
    setStage('scanning');

    try {
      const result = await scanC1PlanoWithVisionAi(photoUri, record.id, 'all', record.dpt);
      setAiConfidence(result.confidence);
      setAiSource(result.source);
      setDetectedBoxes(result.detectedBoxes);
      setAiMessage(result.message || '');
      setVotersPresent(String(result.votersPresent));
      setInvalidVotes(String(result.invalidVotes));

      setPartyValues(
        Object.fromEntries(partyNames.map((p) => [p, String(result.partyVotes[p] ?? 0)])),
      );
      setCandidateValues(
        Object.fromEntries(candidateNames.map((c) => [c, String(result.candidateVotes[c] ?? 0)])),
      );
      setDprCandidateValues(
        Object.fromEntries(dprCandidates.map((c) => [c, String(result.dprCandidateVotes[c] ?? 0)])),
      );

      setStage('review');
    } catch (err) {
      console.warn('[C1OcrScreen] Error scanning C1:', err);
      Alert.alert('Gagal Memindai', 'Terjadi kendala saat memproses gambar. Silakan coba lagi.');
      setStage('before');
    }
  };

  const confirm = () => {
    if (!tpsPhoto) {
      Alert.alert('Lengkapi Dokumen', 'Unggah foto papan hasil hitung TPS sebelum mengirim laporan.');
      return;
    }
    const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    if (photoUri) {
      addDocumentationPhoto(record.id, { source: { uri: photoUri }, takenAt: `${now} WIB — Foto Formulir C1 (Vision AI Scan)` });
    }
    addDocumentationPhoto(record.id, { source: tpsPhoto, takenAt: `${now} WIB — Papan Hasil Hitung TPS` });

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
    setStage('done');
  };

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Pemindaian Lembar C1 Plano</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          {record.id} — TPS {record.tpsNumber}, {record.district}, {record.regency}
        </Text>
      </View>

      {(stage === 'before' || stage === 'scanning') && (
        <Card style={{ alignItems: 'center', gap: spacing.md }}>
          {photoUri ? (
            <Pressable onPress={() => setPreviewOpen(true)} style={{ width: '100%' }}>
              <Image source={{ uri: photoUri }} style={styles.photoPlaceholder} resizeMode="cover" />
            </Pressable>
          ) : (
            <View style={[styles.photoPlaceholder, { backgroundColor: colors.primaryLight, borderColor: colors.border }]}>
              <Feather name="file-text" size={40} color={colors.primary} strokeWidth={iconStrokeWidth} />
              <Text style={[styles.photoCaption, { color: colors.primary }]}>Area Pratinjau Pemindaian Lembar C1 Plano</Text>
              <Text style={{ fontSize: 11, color: colors.textMuted, textAlign: 'center', paddingHorizontal: 16 }}>
                Format didukung: Kamera langsung atau galeri lembar plano plano KPU
              </Text>
            </View>
          )}

          {stage === 'before' && !photoUri && (
            <View style={{ flexDirection: 'row', gap: spacing.sm, width: '100%' }}>
              <PrimaryButton label="Ambil Foto" icon="camera" variant="secondary" onPress={() => handlePick('camera')} style={{ flex: 1 }} />
              <PrimaryButton label="Pilih File" icon="upload" variant="secondary" onPress={() => handlePick('library')} style={{ flex: 1 }} />
            </View>
          )}
          {stage === 'before' && photoUri && (
            <View style={{ flexDirection: 'row', gap: spacing.sm, width: '100%' }}>
              <PrimaryButton label="Ganti Foto" icon="x" variant="secondary" onPress={() => setPhotoUri(null)} style={{ flex: 1 }} />
              <PrimaryButton label="Pindai AI Vision" icon="zap" onPress={runScan} style={{ flex: 2 }} />
            </View>
          )}
          {stage === 'scanning' && (
            <View style={{ width: '100%', gap: 8, alignItems: 'center' }}>
              <PrimaryButton label="Menganalisis Kotak Angka Vision AI..." onPress={() => {}} loading style={{ width: '100%' }} />
              <Text style={{ fontSize: 11, color: colors.textMuted, textAlign: 'center' }}>
                Mengunggah multipart-form & mengekstrak kotak perolehan suara...
              </Text>
            </View>
          )}
        </Card>
      )}

      {stage === 'review' && (
        <>
          {/* AI Banner */}
          <View
            style={[
              styles.aiBanner,
              {
                backgroundColor: aiSource === 'api' ? colors.successBg : colors.surface,
                borderColor: aiSource === 'api' ? colors.success : colors.border,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Feather name="cpu" size={16} color={aiSource === 'api' ? colors.success : colors.primary} />
                <Text style={{ fontSize: 12, fontWeight: '800', color: colors.text }}>
                  Vision AI Engine — Ekstraksi Kotak Angka
                </Text>
              </View>
              <Pill
                label={`${Math.round(aiConfidence * 100)}% Akurasi`}
                tone={aiConfidence >= 0.9 ? 'success' : 'warning'}
              />
            </View>
            <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 4 }}>
              {aiMessage || 'Angka formulir berhasil diekstraksi dari kotak lembar C1 Plano. Silakan verifikasi.'}
            </Text>

            {detectedBoxes.length > 0 && (
              <View style={[styles.boxRow, { borderTopColor: colors.border }]}>
                {detectedBoxes.map((b, idx) => (
                  <View key={idx} style={[styles.detectedBoxItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={{ fontSize: 10, color: colors.textMuted }}>{b.label}</Text>
                    <Text style={{ fontSize: 13, fontWeight: '900', color: colors.primary }}>{b.value}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <Card style={{ gap: spacing.sm }}>
            <SectionTitle style={{ marginBottom: 0 }} action={<Pill label="Langkah 1/2" tone="info" />}>
              Hasil Pembacaan C1
            </SectionTitle>
            <Text style={[styles.hint, { color: colors.textMuted }]}>
              Silakan periksa dan perbaiki angka jika terdapat perbedaan dengan lembar C1 Plano fisik.
            </Text>
            <Input
              label="Pemilih Hadir (DPT Masuk)"
              value={votersPresent}
              onChangeText={setVotersPresent}
              keyboardType="numeric"
            />
            <Input
              label="Suara Tidak Sah"
              value={invalidVotes}
              onChangeText={setInvalidVotes}
              keyboardType="numeric"
            />

            <Text style={[styles.subHeading, { color: colors.text }]}>Suara Partai Politik</Text>
            {partyNames.map((p) => (
              <Input
                key={p}
                label={p}
                value={partyValues[p] ?? '0'}
                onChangeText={(v) => setPartyValues((prev) => ({ ...prev, [p]: v }))}
                keyboardType="numeric"
              />
            ))}

            <Text style={[styles.subHeading, { color: colors.text }]}>Suara Paslon Pilpres</Text>
            {candidateNames.map((c) => (
              <Input
                key={c}
                label={c}
                value={candidateValues[c] ?? '0'}
                onChangeText={(v) => setCandidateValues((prev) => ({ ...prev, [c]: v }))}
                keyboardType="numeric"
              />
            ))}

            <Text style={[styles.subHeading, { color: colors.text }]}>Suara Caleg DPR RI</Text>
            {dprCandidates.map((c) => (
              <Input
                key={c}
                label={c}
                value={dprCandidateValues[c] ?? '0'}
                onChangeText={(v) => setDprCandidateValues((prev) => ({ ...prev, [c]: v }))}
                keyboardType="numeric"
              />
            ))}
          </Card>

          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <PrimaryButton label="Reset" icon="rotate-ccw" variant="secondary" onPress={resetAll} style={{ flex: 1 }} />
            <PrimaryButton label="Lanjut ke Lampiran" icon="arrow-right" onPress={() => setStage('attachment')} style={{ flex: 2 }} />
          </View>
        </>
      )}

      {stage === 'attachment' && (
        <>
          <Card style={{ gap: spacing.sm }}>
            <SectionTitle style={{ marginBottom: 0 }} action={<Pill label="Langkah 2/2" tone="info" />}>
              Lampiran Foto & Video
            </SectionTitle>
            <Text style={[styles.hint, { color: colors.textMuted }]}>
              Data C1 sudah diverifikasi. Lengkapi bukti foto papan hasil hitung sebelum dikirim.
            </Text>
            <UploadRow
              label="Foto Formulir C1 (Sudah dari Scan Vision AI)"
              imageSource={photoUri ? { uri: photoUri } : undefined}
              onPick={() => handlePick('camera')}
            />
            <UploadRow
              label="Foto Papan Hasil Hitung (Wajib)"
              imageSource={tpsPhoto}
              onPick={(source) => handlePickTpsPhoto(source)}
            />
            <UploadRow
              label="Video Suasana TPS (Opsional)"
              done={tpsVideo}
              onPress={() => setTpsVideo((v) => !v)}
            />
          </Card>

          <PrimaryButton label="Kirim Laporan" icon="send" onPress={confirm} />
          <PrimaryButton label="Kembali Cek Data" variant="secondary" icon="arrow-left" onPress={() => setStage('review')} />
        </>
      )}

      {stage === 'done' && (
        <Card style={{ alignItems: 'center', gap: spacing.md, paddingVertical: spacing.lg }}>
          <Pill label="Hasil Form C1 Terverifikasi & Terkirim" tone="success" icon="check-circle" />
          <Text style={{ fontSize: 13, color: colors.textMuted, textAlign: 'center' }}>
            Data hasil suara telah dikirim ke pusat tabulasi dan dicadangkan ke antrean offline lokal.
          </Text>
          <PrimaryButton label="Kembali ke Laporan" variant="secondary" icon="arrow-left" onPress={() => navigation.goBack()} />
        </Card>
      )}

      {photoUri && (
        <Modal visible={previewOpen} transparent animationType="fade" onRequestClose={() => setPreviewOpen(false)}>
          <Pressable style={styles.imageOverlayBackdrop} onPress={() => setPreviewOpen(false)}>
            <Image source={{ uri: photoUri }} style={styles.imageOverlayFull} resizeMode="contain" />
          </Pressable>
        </Modal>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },
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
  imageOverlayBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', alignItems: 'center', justifyContent: 'center' },
  imageOverlayFull: { width: '100%', height: '80%' },
  aiBanner: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  boxRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
  },
  detectedBoxItem: {
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});
