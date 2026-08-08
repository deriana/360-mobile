import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Card, Modal, PrimaryButton, SectionTitle, Input } from '../components/ui';
import { fontSize, iconStrokeWidth, radius, spacing } from '../theme';
import { EmergencyCategory, EmergencySeverity } from '../types';
import { CURRENT_WITNESS_ID } from '../utils/scope';
import { pickImage } from '../utils/pickImage';

const CATEGORIES: Array<{ key: EmergencyCategory; label: string }> = [
  { key: 'intimidation', label: 'Intimidasi Saksi' },
  { key: 'unrest', label: 'Kerusuhan / Kericuhan' },
  { key: 'ballot_shortage', label: 'Kekurangan Surat Suara' },
  { key: 'violation', label: 'Pelanggaran Prosedur' },
  { key: 'vote_buying', label: 'Politik Uang (Money Politics)' },
  { key: 'security_disturbance', label: 'Gangguan Keamanan TPS' },
];

export default function EmergencyFormScreen({ navigation }: any) {
  const { addEmergencyReport } = useApp();
  const { colors } = useTheme();

  const [category, setCategory] = useState<EmergencyCategory>('intimidation');
  const [severity, setSeverity] = useState<EmergencySeverity>('medium');
  const [description, setDescription] = useState('');
  const [attachedPhotos, setAttachedPhotos] = useState<string[]>([]);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const handleAttach = async (source: 'camera' | 'library') => {
    const uri = await pickImage(source);
    if (uri) setAttachedPhotos((prev) => [...prev, uri]);
  };

  const removeAttachment = (uri: string) => {
    setAttachedPhotos((prev) => prev.filter((p) => p !== uri));
  };

  const submit = () => {
    addEmergencyReport({
      category,
      description: description || 'Tidak ada deskripsi tambahan.',
      tpsId: null,
      reportedBy: CURRENT_WITNESS_ID,
      severity,
      photos: attachedPhotos.length ? attachedPhotos : undefined,
    });
    navigation.goBack();
  };

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
        <Text style={[styles.title, { color: colors.text }]}>Lapor Kejadian Darurat</Text>

        <Card style={{ gap: spacing.sm }}>
          <SectionTitle style={{ marginBottom: 0 }}>Kategori Insiden</SectionTitle>
          <View style={styles.chipWrap}>
            {CATEGORIES.map((c) => {
              const isActive = category === c.key;
              return (
                <Pressable
                  key={c.key}
                  hitSlop={8}
                  onPress={() => setCategory(c.key)}
                  style={({ pressed }) => [
                    styles.chip,
                    {
                      backgroundColor: isActive ? colors.primary : colors.surface,
                      borderColor: isActive ? colors.primary : colors.border,
                    },
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Text style={[styles.chipText, { color: isActive ? colors.textInverse : colors.text }]}>
                    {c.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <Card style={{ gap: spacing.sm }}>
          <SectionTitle style={{ marginBottom: 0 }}>Tingkat Keparahan (Severity)</SectionTitle>
          <View style={styles.chipWrap}>
            {(['low', 'medium', 'high'] as EmergencySeverity[]).map((s) => {
              const isActive = severity === s;
              const severityLabels = { low: 'Rendah (Low)', medium: 'Sedang (Medium)', high: 'Tinggi (High)' };
              return (
                <Pressable
                  key={s}
                  hitSlop={8}
                  onPress={() => setSeverity(s)}
                  style={({ pressed }) => [
                    styles.chip,
                    {
                      backgroundColor: isActive
                        ? s === 'high'
                          ? colors.danger
                          : s === 'medium'
                          ? '#F59E0B'
                          : colors.primary
                        : colors.surface,
                      borderColor: isActive
                        ? s === 'high'
                          ? colors.danger
                          : s === 'medium'
                          ? '#F59E0B'
                          : colors.primary
                        : colors.border,
                    },
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Text style={[styles.chipText, { color: isActive ? colors.textInverse : colors.text }]}>
                    {severityLabels[s]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <Card style={{ gap: spacing.sm }}>
          <SectionTitle style={{ marginBottom: 0 }}>Deskripsi Kejadian</SectionTitle>
          <Input
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
            placeholder="Jelaskan kronologi kejadian secara mendetail..."
            inputStyle={{ minHeight: 96, textAlignVertical: 'top' }}
          />
        </Card>

        <Card style={{ gap: spacing.sm }}>
          <SectionTitle
            style={{ marginBottom: 0 }}
            action={attachedPhotos.length > 0 ? <Text style={{ fontSize: fontSize.xs, color: colors.textMuted }}>{attachedPhotos.length} foto</Text> : undefined}
          >
            Lampiran Bukti Lapangan
          </SectionTitle>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <PrimaryButton label="Ambil Foto" icon="camera" variant="secondary" onPress={() => handleAttach('camera')} style={{ flex: 1 }} />
            <PrimaryButton label="Pilih File" icon="upload" variant="secondary" onPress={() => handleAttach('library')} style={{ flex: 1 }} />
          </View>

          {attachedPhotos.length > 0 && (
            <View style={styles.attachmentGrid}>
              {attachedPhotos.map((uri) => (
                <View key={uri} style={styles.attachmentPreviewWrap}>
                  <Pressable onPress={() => setPreviewUri(uri)}>
                    <Image source={{ uri }} style={styles.attachmentPreview} />
                  </Pressable>
                  <Pressable
                    onPress={() => removeAttachment(uri)}
                    hitSlop={8}
                    style={[styles.removeAttachmentBtn, { backgroundColor: colors.danger }]}
                  >
                    <Feather name="x" size={14} color="#FFFFFF" strokeWidth={iconStrokeWidth} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          <View style={styles.gpsRow}>
            <Feather name="map-pin" size={14} color={colors.textMuted} strokeWidth={iconStrokeWidth} />
            <Text style={[styles.gpsNote, { color: colors.textMuted }]}>Tersetempel GPS Otomatis: -6.9000, 107.6000</Text>
          </View>
        </Card>

        <PrimaryButton label="Kirim Laporan Darurat" icon="alert-triangle" onPress={submit} />
      </ScrollView>

      <Modal visible={!!previewUri} onClose={() => setPreviewUri(null)} variant="floating" title="Pratinjau Foto">
        {previewUri && <Image source={{ uri: previewUri }} style={styles.previewImage} resizeMode="contain" />}
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: { flex: 1 },
  screen: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 120 },
  title: { fontSize: fontSize.xl, fontWeight: '800' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    minHeight: 36,
    justifyContent: 'center',
  },
  chipText: { fontSize: fontSize.xs, fontWeight: '700' },
  attachmentGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  attachmentPreviewWrap: { position: 'relative' },
  attachmentPreview: { width: 92, height: 92, borderRadius: radius.md },
  removeAttachmentBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gpsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  gpsNote: { fontSize: fontSize.xs },
  previewImage: { width: '100%', aspectRatio: 1, borderRadius: radius.md },
});


