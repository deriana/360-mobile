import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Card, ConfirmDialog, Modal } from '../components/ui';
import { fonts, fontSize, iconStrokeWidth, radius, spacing } from '../theme';
import { EmergencyCategory, EmergencySeverity } from '../types';
import { CURRENT_WITNESS_ID } from '../utils/scope';
import { getActiveWitnessScope } from '../utils/witnessResolver';
import { pickImage } from '../utils/pickImage';

interface CategoryOption {
  key: EmergencyCategory;
  label: string;
  icon: keyof typeof Feather.glyphMap;
  subtitle: string;
}

const CATEGORIES: CategoryOption[] = [
  {
    key: 'intimidation',
    label: 'Intimidasi Saksi',
    icon: 'user-x',
    subtitle: 'Ancaman fisik atau verbal terhadap saksi',
  },
  {
    key: 'unrest',
    label: 'Kerusuhan / Kericuhan',
    icon: 'alert-octagon',
    subtitle: 'Gesekan massa atau kegaduhan di TPS',
  },
  {
    key: 'ballot_shortage',
    label: 'Kekurangan Surat Suara',
    icon: 'file-minus',
    subtitle: 'Logistik surat suara kurang dari DPT',
  },
  {
    key: 'violation',
    label: 'Pelanggaran Prosedur',
    icon: 'slash',
    subtitle: 'KPPS tidak mematuhi tata cara pemilu',
  },
  {
    key: 'vote_buying',
    label: 'Politik Uang (Money Politics)',
    icon: 'dollar-sign',
    subtitle: 'Pembagian materi/uang di sekitar TPS',
  },
  {
    key: 'security_disturbance',
    label: 'Gangguan Keamanan TPS',
    icon: 'shield-off',
    subtitle: 'Intervensi pihak luar atau sabotase TPS',
  },
];

const SEVERITY_CONFIG: Record<
  EmergencySeverity,
  {
    label: string;
    levelName: string;
    desc: string;
    color: string;
    bgLight: string;
    icon: keyof typeof Feather.glyphMap;
  }
> = {
  low: {
    label: 'Rendah (Low)',
    levelName: 'Rendah',
    desc: 'Administratif minor • TPS tetap berjalan normal',
    color: '#10B981',
    bgLight: 'rgba(16, 185, 129, 0.12)',
    icon: 'info',
  },
  medium: {
    label: 'Sedang (Medium)',
    levelName: 'Sedang',
    desc: 'Potensi sengketa • Butuh atensi Koordinator Saksi',
    color: '#F59E0B',
    bgLight: 'rgba(245, 158, 11, 0.12)',
    icon: 'alert-circle',
  },
  high: {
    label: 'Kritis (Critical)',
    levelName: 'Kritis',
    desc: 'Kecurangan fatal • Intervensi darurat BSN PAN',
    color: '#EF4444',
    bgLight: 'rgba(239, 68, 68, 0.12)',
    icon: 'alert-triangle',
  },
};

const QUICK_TEMPLATES: Record<EmergencyCategory, string[]> = {
  intimidation: [
    'Saksi diusir secara paksa dari area penghitungan oleh oknum tertentu.',
    'Ada ancaman verbal terhadap saksi saat mengajukan nota keberatan.',
  ],
  unrest: [
    'Terjadi kericuhan antar pendukung di luar gerbang TPS.',
    'Penghitungan suara dihentikan sementara akibat situasi tidak kondusif.',
  ],
  ballot_shortage: [
    'Surat suara Pilpres kurang sebanyak 25 lembar dari jumlah DPT.',
    'Surat suara tertukar dengan dapil lain dan pemilih sudah terlanjur hadir.',
  ],
  violation: [
    'Kotak suara dibuka sebelum waktu penghitungan resmi dimulai.',
    'KPPS tidak memberikan salinan formulir C.Hasil-KWK kepada saksi PAN.',
    'Pemilih tanpa KTP-el / form A-Pindah Memilih diizinkan mencoblos.',
  ],
  vote_buying: [
    'Terlihat oknum membagikan amplop/sembako di radius 50m dari TPS.',
    'Ada ajakan mencoblos paslon tertentu disertai imbalan uang tunai.',
  ],
  security_disturbance: [
    'Aparat non-penyelenggara memasuki ruang pencoblosan tanpa izin.',
    'Listrik TPS padam saat proses rekapitulasi perhitungan suara.',
  ],
};

export default function EmergencyFormScreen({ navigation }: any) {
  const { addEmergencyReport, tps, witnesses, currentUser } = useApp();
  const { colors, isDark } = useTheme();

  const [category, setCategory] = useState<EmergencyCategory>('violation');
  const [severity, setSeverity] = useState<EmergencySeverity>('medium');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultDialog, setResultDialog] = useState<{
    visible: boolean;
    title: string;
    message: string;
    tone?: 'danger' | 'primary' | 'warning' | 'success' | 'info';
    onConfirm?: () => void;
  }>({ visible: false, title: '', message: '' });

  const activeScope = getActiveWitnessScope(currentUser, witnesses, tps);
  const currentWitness = activeScope.witness;
  const currentTps = activeScope.tps;
  const tpsName = currentTps
    ? `TPS ${String(currentTps.tpsNumber).padStart(3, '0')} Kel. ${currentTps.village || currentTps.district}`
    : 'TPS 001 Kel. Braga';

  const handlePickImage = async (source: 'camera' | 'library') => {
    if (attachments.length >= 4) {
      setResultDialog({
        visible: true,
        title: 'Batas Maksimal',
        message: 'Anda hanya dapat melampirkan maksimal 4 foto bukti.',
        tone: 'warning',
      });
      return;
    }
    const uri = await pickImage(source);
    if (uri) {
      setAttachments((prev) => [...prev, uri]);
    }
  };

  const handleRemoveAttachment = (indexToRemove: number) => {
    setAttachments((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleApplyTemplate = (tmpl: string) => {
    setDescription((prev) => (prev ? `${prev}\n${tmpl}` : tmpl));
  };

  const handleConfirmSubmit = () => {
    if (!description.trim()) {
      setShowConfirmModal(false);
      setResultDialog({
        visible: true,
        title: 'Deskripsi Wajib',
        message: 'Mohon tuliskan rincian kronologi kejadian di lapangan.',
        tone: 'warning',
      });
      return;
    }

    setIsSubmitting(true);
    addEmergencyReport({
      category,
      severity,
      description: description.trim(),
      photos: attachments,
      tpsId: currentTps?.id || null,
      reportedBy: currentWitness?.name || 'Saksi BSN PAN',
    });

    setIsSubmitting(false);
    setShowConfirmModal(false);

    setResultDialog({
      visible: true,
      title: 'Laporan Darurat Terkirim',
      message: `Laporan kejadian tingkat [${SEVERITY_CONFIG[severity].levelName.toUpperCase()}] berhasil dikirim ke Crisis Center BSN PAN Pusat. Tim advokasi siap siaga.`,
      tone: 'success',
      onConfirm: () => {
        setResultDialog((prev) => ({ ...prev, visible: false }));
        navigation.navigate('EmergencyList');
      },
    });
  };

  const selectedCategoryObj = CATEGORIES.find((c) => c.key === category);
  const selectedSeverityConfig = SEVERITY_CONFIG[severity];
  const categoryTemplates = QUICK_TEMPLATES[category] || [];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.keyboardView, { backgroundColor: colors.background }]}
    >
      <ScrollView
        style={[styles.screen, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. CRISIS CENTER HEADER BANNER */}
        <View
          style={[
            styles.crisisBanner,
            {
              backgroundColor: isDark ? 'rgba(220, 38, 38, 0.12)' : '#FEF2F2',
              borderColor: isDark ? 'rgba(220, 38, 38, 0.35)' : '#FCA5A5',
            },
          ]}
        >
          <View style={styles.bannerTopRow}>
            <View style={[styles.redAlertBadge, { backgroundColor: '#DC2626' }]}>
              <Feather name="shield" size={11} color="#FFFFFF" />
              <Text style={styles.redAlertBadgeText}>CRISIS CENTER BSN PAN</Text>
            </View>
            <View style={styles.liveStatusPill}>
              <View style={[styles.liveDot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.liveStatusText}>TIM ADVOKASI STANDBY</Text>
            </View>
          </View>

          <Text style={[styles.bannerTitle, { color: isDark ? '#FCA5A5' : '#991B1B' }]}>
            Saluran Cepat Eskalasi Insiden
          </Text>
          <Text style={[styles.bannerSubtitle, { color: isDark ? '#E2E8F0' : '#4B5563' }]}>
            Gunakan form ini untuk kejadian krusial yang memerlukan bantuan advokasi hukum atau intervensi Koordinator Saksi.
          </Text>

          <View style={[styles.metaStrip, { borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : '#FEE2E2' }]}>
            <View style={styles.metaCol}>
              <View style={styles.metaItem}>
                <Feather name="map-pin" size={12} color={colors.primary} />
                <Text style={[styles.metaText, { color: colors.text }]} numberOfLines={1}>
                  {tpsName}
                </Text>
              </View>
            </View>
            <View style={styles.metaCol}>
              <View style={[styles.metaItem, { justifyContent: 'flex-end' }]}>
                <Feather name="crosshair" size={12} color="#10B981" />
                <Text style={[styles.metaText, { color: '#10B981' }]}>GPS Terverifikasi</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 2. BENTO GRID KATEGORI KEJADIAN */}
        <Card style={styles.cardSection}>
          <View style={styles.sectionTitleRow}>
            <Text style={[styles.sectionTitleText, { color: colors.text }]}>Kategori Kejadian</Text>
            <Text style={[styles.requiredTag, { color: colors.danger }]}>*Wajib Dipilih</Text>
          </View>

          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => {
              const isSelected = category === cat.key;
              return (
                <Pressable
                  key={cat.key}
                  onPress={() => setCategory(cat.key)}
                  style={[
                    styles.categoryCard,
                    {
                      backgroundColor: isSelected
                        ? isDark
                          ? 'rgba(30, 58, 138, 0.35)'
                          : '#EFF6FF'
                        : isDark
                        ? colors.surface
                        : '#F8FAFC',
                      borderColor: isSelected ? colors.primary : colors.border,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                >
                  <View style={styles.categoryCardHeader}>
                    <View
                      style={[
                        styles.categoryIconWrap,
                        {
                          backgroundColor: isSelected
                            ? colors.primary
                            : isDark
                            ? 'rgba(255, 255, 255, 0.08)'
                            : '#E2E8F0',
                        },
                      ]}
                    >
                      <Feather
                        name={cat.icon}
                        size={15}
                        color={isSelected ? '#FFFFFF' : colors.textMuted}
                        strokeWidth={iconStrokeWidth}
                      />
                    </View>
                    {isSelected && (
                      <View style={[styles.selectedCheckBadge, { backgroundColor: colors.primary }]}>
                        <Feather name="check" size={10} color="#FFFFFF" strokeWidth={3} />
                      </View>
                    )}
                  </View>

                  <Text
                    style={[
                      styles.categoryCardLabel,
                      {
                        color: isSelected ? (isDark ? '#93C5FD' : colors.primary) : colors.text,
                        fontWeight: isSelected ? '800' : '600',
                      },
                    ]}
                    numberOfLines={2}
                  >
                    {cat.label}
                  </Text>
                  <Text
                    style={[
                      styles.categoryCardSubtitle,
                      { color: isSelected ? (isDark ? '#CBD5E1' : '#475569') : colors.textMuted },
                    ]}
                    numberOfLines={2}
                  >
                    {cat.subtitle}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        {/* 3. TINGKAT KEPARAHAN (SEVERITY) */}
        <Card style={styles.cardSection}>
          <View style={styles.sectionTitleRow}>
            <Text style={[styles.sectionTitleText, { color: colors.text }]}>Tingkat Keparahan / Dampak</Text>
            <Text style={[styles.requiredTag, { color: colors.danger }]}>*Wajib Dipilih</Text>
          </View>

          <View style={styles.severityGrid}>
            {(['low', 'medium', 'high'] as EmergencySeverity[]).map((sev) => {
              const cfg = SEVERITY_CONFIG[sev];
              const isSelected = severity === sev;
              return (
                <Pressable
                  key={sev}
                  onPress={() => setSeverity(sev)}
                  style={[
                    styles.severityCard,
                    {
                      backgroundColor: isSelected
                        ? cfg.bgLight
                        : isDark
                        ? colors.surface
                        : '#F8FAFC',
                      borderColor: isSelected ? cfg.color : colors.border,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                >
                  <View style={styles.severityCardTop}>
                    <View style={[styles.severityDot, { backgroundColor: cfg.color }]} />
                    <Feather
                      name={cfg.icon}
                      size={15}
                      color={isSelected ? cfg.color : colors.textMuted}
                    />
                  </View>
                  <Text
                    style={[
                      styles.severityName,
                      {
                        color: isSelected ? cfg.color : colors.text,
                        fontWeight: isSelected ? '800' : '700',
                      },
                    ]}
                  >
                    {cfg.levelName}
                  </Text>
                  <Text
                    style={[
                      styles.severityDesc,
                      { color: isSelected ? colors.text : colors.textMuted },
                    ]}
                    numberOfLines={2}
                  >
                    {cfg.desc}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        {/* 4. DESKRIPSI KRONOLOGI & QUICK TEMPLATES */}
        <Card style={styles.cardSection}>
          <View style={styles.sectionTitleRow}>
            <Text style={[styles.sectionTitleText, { color: colors.text }]}>Kronologi Kejadian</Text>
            <Text style={[styles.requiredTag, { color: colors.danger }]}>*Wajib Diisi</Text>
          </View>

          {/* Quick incident suggestion chips */}
          {categoryTemplates.length > 0 && (
            <View style={styles.templateSection}>
              <Text style={[styles.templateHeaderLabel, { color: colors.textMuted }]}>
                KETUK UNTUK MENAMBAH TEMPLATE KRONOLOGI:
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.templateRow}
              >
                {categoryTemplates.map((tmpl, idx) => (
                  <Pressable
                    key={idx}
                    onPress={() => handleApplyTemplate(tmpl)}
                    style={[
                      styles.templateChip,
                      {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
                        borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#CBD5E1',
                      },
                    ]}
                  >
                    <Feather name="plus-circle" size={12} color={colors.primary} />
                    <Text
                      style={[styles.templateChipText, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {tmpl}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          <View
            style={[
              styles.inputBoxWrap,
              {
                backgroundColor: isDark ? colors.surface : '#FAFAFA',
                borderColor: colors.border,
              },
            ]}
          >
            <TextInput
              style={[styles.textAreaInput, { color: colors.text }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Ceritakan waktu, pelaku, lokasi spesifik, dan kronologi kejadian secara objektif..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            {description.length > 0 && (
              <Pressable onPress={() => setDescription('')} style={styles.clearTextBtn}>
                <Feather name="x-circle" size={16} color={colors.textMuted} />
              </Pressable>
            )}
          </View>
        </Card>

        {/* 5. BUKTI LAPANGAN (FOTO & GPS) */}
        <Card style={styles.cardSection}>
          <View style={styles.sectionTitleRow}>
            <Text style={[styles.sectionTitleText, { color: colors.text }]}>Bukti Foto Lapangan</Text>
            <Text style={{ fontSize: fontSize.xs, color: colors.textMuted }}>Maks 4 Foto</Text>
          </View>

          {/* Action buttons: Camera & Gallery */}
          <View style={styles.photoActionRow}>
            <Pressable
              onPress={() => handlePickImage('camera')}
              style={[
                styles.uploadTile,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC',
                  borderColor: colors.border,
                },
              ]}
            >
              <Feather name="camera" size={20} color={colors.primary} />
              <Text style={[styles.uploadTileTitle, { color: colors.text }]}>Ambil Kamera</Text>
              <Text style={[styles.uploadTileSub, { color: colors.textMuted }]}>
                {attachments.length}/4 Terlampir
              </Text>
            </Pressable>

            <Pressable
              onPress={() => handlePickImage('library')}
              style={[
                styles.uploadTile,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC',
                  borderColor: colors.border,
                },
              ]}
            >
              <Feather name="image" size={20} color={colors.primary} />
              <Text style={[styles.uploadTileTitle, { color: colors.text }]}>Buka Galeri</Text>
              <Text style={[styles.uploadTileSub, { color: colors.textMuted }]}>Pilih dari memori</Text>
            </Pressable>
          </View>

          {/* Thumbnails list */}
          {attachments.length > 0 && (
            <View style={styles.photoThumbGrid}>
              {attachments.map((uri, idx) => (
                <View
                  key={idx}
                  style={[styles.thumbBox, { borderColor: colors.border }]}
                >
                  <Pressable
                    onPress={() => setPreviewUri(uri)}
                    style={styles.thumbImageWrap}
                  >
                    <Image source={{ uri }} style={styles.thumbImage} resizeMode="cover" />
                  </Pressable>
                  <Pressable
                    onPress={() => handleRemoveAttachment(idx)}
                    style={[styles.removeThumbBtn, { backgroundColor: colors.danger }]}
                  >
                    <Feather name="x" size={12} color="#FFFFFF" strokeWidth={3} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          {/* Auto verified GPS Badge */}
          <View
            style={[
              styles.gpsVerifiedBar,
              {
                backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#ECFDF5',
                borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : '#A7F3D0',
              },
            ]}
          >
            <View style={[styles.gpsDot, { backgroundColor: '#10B981' }]} />
            <Text style={[styles.gpsVerifiedText, { color: isDark ? '#A7F3D0' : '#065F46' }]}>
              Koordinat GPS otomatis tersemat bersama laporan ini
            </Text>
          </View>
        </Card>

        {/* 6. URGENT SUBMIT BUTTON */}
        <Pressable
          onPress={() => setShowConfirmModal(true)}
          style={({ pressed }) => [
            styles.submitEmergencyBtn,
            { backgroundColor: colors.danger },
            pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
          ]}
        >
          <Feather name="alert-triangle" size={18} color="#FFFFFF" />
          <Text style={styles.submitEmergencyText}>Kirim Laporan Darurat Sekarang</Text>
        </Pressable>
      </ScrollView>

      {/* FULLSCREEN IMAGE PREVIEW MODAL */}
      <Modal visible={!!previewUri} onClose={() => setPreviewUri(null)} variant="floating" title="Bukti Foto Kejadian">
        {previewUri && (
          <View style={styles.previewImageContainer}>
            <Image source={{ uri: previewUri }} style={styles.previewImageFull} resizeMode="contain" />
          </View>
        )}
      </Modal>

      {/* SAFETY CONFIRMATION DIALOG */}
      <ConfirmDialog
        visible={showConfirmModal}
        title="Kirim Laporan Darurat?"
        message={`Laporan "${selectedCategoryObj?.label}" dengan status tingkat keparahan [${selectedSeverityConfig.levelName.toUpperCase()}] akan segera dikirimkan ke Crisis Center BSN PAN dan Koordinator Saksi.\n\nPastikan data kejadian dan bukti foto telah sesuai.`}
        icon="alert-triangle"
        tone="danger"
        confirmLabel="Ya, Kirim Sekarang"
        cancelLabel="Periksa Kembali"
        confirmLoading={isSubmitting}
        onConfirm={handleConfirmSubmit}
        onCancel={() => setShowConfirmModal(false)}
      />

      <ConfirmDialog
        visible={resultDialog.visible}
        title={resultDialog.title}
        message={resultDialog.message}
        tone={resultDialog.tone || 'info'}
        singleButton
        confirmLabel="OK"
        onConfirm={() => {
          if (resultDialog.onConfirm) {
            resultDialog.onConfirm();
          } else {
            setResultDialog((prev) => ({ ...prev, visible: false }));
          }
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: { flex: 1 },
  screen: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: 110 },

  // 1. Crisis Banner
  crisisBanner: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    gap: 6,
  },
  bannerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  redAlertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radius.sm - 2,
  },
  redAlertBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontFamily: fonts.extraBold,
    letterSpacing: 0.4,
  },
  liveStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  liveStatusText: {
    fontSize: 9,
    fontFamily: fonts.bold,
    color: '#10B981',
    letterSpacing: 0.3,
  },
  bannerTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSize.sm + 1,
    marginTop: 2,
  },
  bannerSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 16,
  },
  metaStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    marginTop: 2,
    borderTopWidth: 1,
  },
  metaCol: {
    flex: 1,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontFamily: fonts.bold,
    fontSize: 10,
  },

  // Cards & Sections
  cardSection: {
    padding: spacing.md,
    gap: spacing.sm,
    borderRadius: radius.lg,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitleText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xs + 2,
  },
  requiredTag: {
    fontFamily: fonts.bold,
    fontSize: 10,
  },

  // Category Bento Grid
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryCard: {
    width: '48%',
    padding: 10,
    borderRadius: radius.md,
    gap: 4,
    minHeight: 100,
  },
  categoryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  categoryIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCheckBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryCardLabel: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xs,
    lineHeight: 15,
  },
  categoryCardSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 13,
  },

  // Severity Grid
  severityGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  severityCard: {
    flex: 1,
    padding: 10,
    borderRadius: radius.md,
    gap: 4,
    minHeight: 88,
  },
  severityCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  severityName: {
    fontFamily: fonts.bold,
    fontSize: 11,
    marginTop: 2,
  },
  severityDesc: {
    fontFamily: fonts.regular,
    fontSize: 9,
    lineHeight: 12,
  },

  // Templates
  templateSection: {
    gap: 6,
  },
  templateHeaderLabel: {
    fontFamily: fonts.bold,
    fontSize: 9,
    letterSpacing: 0.3,
  },
  templateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 2,
  },
  templateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
    minHeight: 36,
    maxWidth: 260,
  },
  templateChipText: {
    fontFamily: fonts.medium,
    fontSize: 10.5,
  },

  // Textarea
  inputBoxWrap: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: 10,
    minHeight: 100,
    position: 'relative',
  },
  textAreaInput: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs + 1,
    minHeight: 80,
    padding: 0,
  },
  clearTextBtn: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },

  // Photo Upload Tiles
  photoActionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  uploadTile: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 6,
  },
  uploadTileTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xs,
  },
  uploadTileSub: {
    fontFamily: fonts.regular,
    fontSize: 9,
  },
  photoThumbGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  thumbBox: {
    width: 70,
    height: 70,
    borderRadius: radius.sm,
    borderWidth: 1,
    position: 'relative',
  },
  thumbImageWrap: {
    width: '100%',
    height: '100%',
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  removeThumbBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gpsVerifiedBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: 2,
  },
  gpsDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  gpsVerifiedText: {
    fontFamily: fonts.semiBold,
    fontSize: 10,
  },

  // Submit Button
  submitEmergencyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: radius.md,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitEmergencyText: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: fontSize.sm,
    letterSpacing: 0.3,
  },

  // Modal
  previewImageContainer: {
    width: '100%',
    height: 320,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  previewImageFull: {
    width: '100%',
    height: '100%',
  },
});
