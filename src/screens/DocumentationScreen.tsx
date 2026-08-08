import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Card, EmptyState, PrimaryButton, SectionTitle } from '../components/ui';
import { fontSize, iconStrokeWidth, radius, spacing } from '../theme';
import { pickImage } from '../utils/pickImage';

interface DocPhoto {
  uri: string;
  takenAt: string;
}

export default function DocumentationScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [photos, setPhotos] = useState<DocPhoto[]>([]);

  const handlePick = async (source: 'camera' | 'library') => {
    const uri = await pickImage(source);
    if (!uri) return;
    setPhotos((prev) => [...prev, { uri, takenAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }]);
  };

  const removePhoto = (uri: string) => {
    setPhotos((prev) => prev.filter((p) => p.uri !== uri));
  };

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={[styles.headerIconWrap, { backgroundColor: colors.primaryLight }]}>
          <Feather name="image" size={20} color={colors.primary} strokeWidth={iconStrokeWidth} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text }]}>Dokumentasi Kegiatan TPS</Text>
          <Text style={[styles.subTitle, { color: colors.textMuted }]}>
            Unggah foto kegiatan lapangan sebagai bukti dokumentasi (persiapan, pemungutan, penghitungan suara, dll).
          </Text>
        </View>
      </View>

      <Card style={{ gap: spacing.sm }}>
        <SectionTitle
          style={{ marginBottom: 0 }}
          action={photos.length > 0 ? <Text style={{ fontSize: fontSize.xs, color: colors.textMuted }}>{photos.length} foto</Text> : undefined}
        >
          Unggah Foto
        </SectionTitle>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <PrimaryButton label="Ambil Foto" icon="camera" onPress={() => handlePick('camera')} style={{ flex: 1 }} />
          <PrimaryButton label="Pilih File" icon="upload" variant="secondary" onPress={() => handlePick('library')} style={{ flex: 1 }} />
        </View>
      </Card>

      {photos.length === 0 ? (
        <EmptyState
          title="Belum Ada Dokumentasi"
          body="Foto yang diunggah akan tampil di galeri bawah ini."
          icon="camera"
        />
      ) : (
        <Card style={{ gap: spacing.sm }}>
          <SectionTitle style={{ marginBottom: 0 }}>Galeri Dokumentasi</SectionTitle>
          <View style={styles.grid}>
            {photos.map((photo) => (
              <View key={photo.uri} style={styles.gridItemWrap}>
                <Image source={{ uri: photo.uri }} style={styles.gridImage} />
                <View style={styles.timeBadge}>
                  <Text style={styles.timeBadgeText}>{photo.takenAt}</Text>
                </View>
                <Pressable
                  onPress={() => removePhoto(photo.uri)}
                  hitSlop={8}
                  style={[styles.removeBtn, { backgroundColor: colors.danger }]}
                >
                  <Feather name="x" size={13} color="#FFFFFF" strokeWidth={iconStrokeWidth} />
                </Pressable>
              </View>
            ))}
          </View>
        </Card>
      )}

      <PrimaryButton
        label="Selesai"
        icon="check"
        onPress={() => navigation.goBack()}
        disabled={photos.length === 0}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl + 40 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  headerIconWrap: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: fontSize.xl, fontWeight: '800' },
  subTitle: { fontSize: fontSize.xs, lineHeight: 18, marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  gridItemWrap: { position: 'relative', width: '31%', aspectRatio: 1 },
  gridImage: { width: '100%', height: '100%', borderRadius: radius.md },
  timeBadge: { position: 'absolute', left: 4, bottom: 4, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.pill },
  timeBadgeText: { fontSize: 9, color: '#FFFFFF', fontWeight: '700' },
  removeBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
