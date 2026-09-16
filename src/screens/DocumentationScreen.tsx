import React, { useState } from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Card, EmptyState, Modal, Pill, PrimaryButton, SectionTitle } from '../components/ui';
import { fonts, fontSize, iconStrokeWidth, radius, spacing } from '../theme';
import { pickImage } from '../utils/pickImage';
import { generateWatermarkText } from '../utils/watermark';

export default function DocumentationScreen({ route, navigation }: any) {
  const { colors } = useTheme();
  const { tps, getDocumentation, addDocumentationPhoto, removeDocumentationPhoto } = useApp();
  const tpsId = route?.params?.tpsId;
  const [previewPhoto, setPreviewPhoto] = useState<any>(null);

  const record = tps.find((t) => t.id === tpsId);
  const photos = tpsId ? getDocumentation(tpsId) : [];

  const handlePick = async (pickSource: 'camera' | 'library') => {
    if (!tpsId) return;
    const uri = await pickImage(pickSource);
    if (!uri) return;

    let lat = record?.lat ?? -6.8833;
    let lng = record?.lng ?? 107.6167;
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
      tpsId: record?.id,
      tpsNumber: record?.tpsNumber,
      village: record?.village ?? 'DAGO',
      district: record?.district ?? 'Coblong',
      regency: record?.regency ?? 'Kota Bandung',
      lat,
      lng,
    });

    addDocumentationPhoto(tpsId, {
      source: { uri },
      takenAt: `${watermark.timestampWib} — Foto Lapangan`,
      watermark: watermark.watermarkText,
      lat,
      lng,
    });
  };

  const removePhoto = (id: string) => {
    if (!tpsId) return;
    removeDocumentationPhoto(tpsId, id);
  };

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {record && (
        <View style={[styles.tpsScopeBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="map-pin" size={13} color={colors.primary} />
          <Text style={[styles.tpsScopeText, { color: colors.text }]}>
            TPS {record.tpsNumber} • Kec. {record.district}, {record.regency}
          </Text>
          <Text style={[styles.tpsIdText, { color: colors.textMuted }]}>{record.id}</Text>
        </View>
      )}

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
              <View key={photo.id} style={styles.gridItemWrap}>
                <Pressable onPress={() => setPreviewPhoto(photo)} style={styles.gridImagePressable}>
                  <Image source={photo.source} style={styles.gridImage} resizeMode="cover" />
                </Pressable>
                <View style={styles.timeBadge} pointerEvents="none">
                  <Text style={styles.timeBadgeText} numberOfLines={1}>
                    {photo.watermark ? '🔒 Watermark PAN' : photo.takenAt}
                  </Text>
                </View>
                <Pressable
                  onPress={() => removePhoto(photo.id)}
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

      <Modal visible={!!previewPhoto} onClose={() => setPreviewPhoto(null)} variant="floating" title="Pratinjau Foto & Watermark">
        {previewPhoto && (
          <View style={{ gap: spacing.sm }}>
            <View style={styles.previewImageWrap}>
              <Image source={previewPhoto.source} style={styles.previewImage} resizeMode="contain" />
            </View>

            {/* Official Watermark Stamping Badge */}
            <View
              style={{
                backgroundColor: colors.background,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: radius.md,
                padding: spacing.sm,
                gap: 4,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Feather name="shield" size={14} color={colors.primary} />
                  <Text style={{ fontSize: 11, fontWeight: '800', color: colors.primary }}>
                    PAN BSN • Autentikasi Bukti Fisik
                  </Text>
                </View>
                <Pill label="Stempel Sah" tone="success" icon="check" />
              </View>
              <Text style={{ fontSize: 10, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: colors.text }}>
                {previewPhoto.watermark ?? `[PAN BSN - TPS ${record?.tpsNumber ?? '001'} - ${previewPhoto.takenAt}]`}
              </Text>
              <Text style={{ fontSize: 9, color: colors.textMuted }}>
                Waktu Rekam: {previewPhoto.takenAt}
              </Text>
            </View>
          </View>
        )}
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },
  tpsScopeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  tpsScopeText: { fontFamily: fonts.bold, fontSize: fontSize.xs, flex: 1 },
  tpsIdText: { fontSize: 10, fontFamily: 'monospace' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  gridItemWrap: { position: 'relative', width: '31%', aspectRatio: 1, overflow: 'hidden', borderRadius: radius.md },
  gridImagePressable: { width: '100%', height: '100%' },
  gridImage: { width: '100%', height: '100%' },
  previewImageWrap: { width: '100%', aspectRatio: 1, borderRadius: radius.md, overflow: 'hidden' },
  previewImage: { width: '100%', height: '100%' },
  timeBadge: { position: 'absolute', left: 4, bottom: 4, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.pill },
  timeBadgeText: { fontFamily: fonts.bold, fontSize: 9, color: '#FFFFFF' },
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
