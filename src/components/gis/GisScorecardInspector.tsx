import React from 'react';
import {
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { fonts, radius, spacing } from '../../theme';
import { Pill } from '../ui';
import { PoskoDesaItem, RegionalCluster, RegionalLeaderInfo } from '../../data/gisRegionalData';
import { FourPillarsMetric, GisLayerMode } from '../../services/gisDistributionService';

interface GisScorecardInspectorProps {
  visible: boolean;
  onClose: () => void;
  cluster: RegionalCluster | null;
  metrics: FourPillarsMetric | null;
  layerMode: GisLayerMode;
  leaderInfo?: RegionalLeaderInfo | null;
  subClusters?: RegionalCluster[];
  poskoDesas?: PoskoDesaItem[];
  onSelectSubRegion?: (item: RegionalCluster) => void;
  onSelectPoskoDesa?: (desa: PoskoDesaItem) => void;
}

export default function GisScorecardInspector({
  visible,
  onClose,
  cluster,
  metrics,
  layerMode,
  leaderInfo,
  subClusters = [],
  poskoDesas = [],
  onSelectSubRegion,
  onSelectPoskoDesa,
}: GisScorecardInspectorProps) {
  const { colors, isDark } = useTheme();
  const { role } = useApp();
  const isGrassroots = role === 'VOLUNTEER' || role === 'MEMBER' || role === 'WITNESS';

  if (!visible || !cluster || !metrics) return null;

  const isMembersLayer = layerMode === 'MEMBERS';
  const unit = isMembersLayer ? 'Kader' : 'Relawan';
  const formatNum = (val?: number | null) => (val != null && !isNaN(val) ? val : 0).toLocaleString('id-ID');

  const formatRegionLevel = (level?: string) => {
    switch (level) {
      case 'PROVINSI': return 'Tingkat Provinsi (DPW)';
      case 'KAB_KOTA': return 'Tingkat Kabupaten/Kota (DPC)';
      case 'KECAMATAN': return 'Tingkat Kecamatan (PAC)';
      case 'DESA': return 'Tingkat Kelurahan / Desa';
      default: return 'Wilayah Teritorial';
    }
  };

  const getSubRegionType = (level?: string) => {
    switch (level) {
      case 'PROVINSI': return 'Kabupaten / Kota';
      case 'KAB_KOTA': return 'Kecamatan';
      case 'KECAMATAN': return 'Kelurahan / Desa';
      default: return 'Wilayah Binaan';
    }
  };

  const getRegionBadge = (level?: string) => {
    switch (level) {
      case 'PROVINSI': return 'DPW PAN';
      case 'KAB_KOTA': return 'DPC PAN';
      case 'KECAMATAN': return 'PAC PAN';
      case 'DESA': return 'DPRt PAN';
      default: return 'Wilayah Binaan';
    }
  };

  const handleOpenDirections = (lat: number, lng: number, title: string) => {
    const scheme = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(title)}@${lat},${lng}`,
      android: `geo:0,0?q=${lat},${lng}(${encodeURIComponent(title)})`,
    });
    const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    Linking.openURL(scheme || fallbackUrl).catch(() => Linking.openURL(fallbackUrl));
  };

  const handleContactWhatsApp = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const intlPhone = cleanPhone.startsWith('0') ? `62${cleanPhone.slice(1)}` : cleanPhone;
    const waUrl = `whatsapp://send?phone=${intlPhone}&text=${encodeURIComponent(`Halo ${name}, saya ingin koordinasi terkait giat pemenangan PAN.`)}`;
    Linking.openURL(waUrl).catch(() => Linking.openURL(`tel:${cleanPhone}`));
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.sheetContainer,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {/* Top Handle Bar */}
          <View style={styles.handleContainer}>
            <View style={[styles.handleBar, { backgroundColor: colors.border }]} />
          </View>

          {/* Header */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1, gap: 2 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <Text style={[styles.regionName, { color: colors.text }]}>{cluster.name}</Text>
                <Pill
                  label={isGrassroots ? getRegionBadge(cluster.level) : metrics.statusLabel}
                  tone={isGrassroots ? 'primary' : metrics.statusTone}
                />
              </View>
              <Text style={[styles.regionSub, { color: colors.textMuted }]}>
                {formatRegionLevel(cluster.level)} &bull; {subClusters.length > 0 ? `${subClusters.length} ${getSubRegionType(cluster.level)}` : `${formatNum(metrics.activeCount)} ${unit} Siaga`}
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9' }]}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name="x" size={18} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Body Content */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Kartu Profil Pimpinan Wilayah (Sesuai Referensi Web Admin) */}
            {leaderInfo && (
              <View style={[styles.leaderCard, { backgroundColor: isDark ? 'rgba(37,99,235,0.08)' : '#F0F9FF', borderColor: '#38BDF8' }]}>
                <View style={styles.leaderRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.leaderRole}>{leaderInfo.roleTitle}</Text>
                    <Text style={[styles.leaderName, { color: colors.text }]}>{leaderInfo.leaderName}</Text>
                  </View>
                  <View style={styles.skBadge}>
                    <Text style={styles.skBadgeText}>{leaderInfo.skStatus}</Text>
                    <Text style={styles.leaderPhone}>{leaderInfo.phone}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => handleContactWhatsApp(leaderInfo.phone, leaderInfo.leaderName)}
                  style={styles.leaderContactBtn}
                  activeOpacity={0.8}
                >
                  <Feather name="message-circle" size={13} color="#FFFFFF" />
                  <Text style={styles.leaderContactBtnText}>Hubungi via WhatsApp</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Tampilan Metrik: Adaptif Sesuai Persona */}
            {isGrassroots ? (
              /* KEKUATAN PERSONEL REAL UNTUK RELAWAN & KADER (NOL METRIK AUDIT BAPPILU) */
              <View
                style={[
                  styles.grassrootsStrengthCard,
                  {
                    backgroundColor: isDark ? 'rgba(0,102,179,0.12)' : '#F0F9FF',
                    borderColor: isDark ? 'rgba(56,189,248,0.3)' : '#BAE6FD',
                  },
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ gap: 2 }}>
                    <Text style={[styles.grassrootsLabel, { color: isDark ? '#7DD3FC' : '#005299' }]}>
                      {isMembersLayer ? 'TOTAL KADER BER-KTA' : 'RELAWAN SIAGA WILAYAH'}
                    </Text>
                    <Text style={[styles.grassrootsValue, { color: colors.text }]}>
                      {formatNum(metrics.activeCount)}{' '}
                      <Text style={{ fontSize: 13, fontFamily: fonts.medium, color: colors.textMuted }}>
                        {isMembersLayer ? 'Kader' : 'Relawan'}
                      </Text>
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 2 }}>
                    <Text style={[styles.grassrootsLabel, { color: isDark ? '#7DD3FC' : '#005299' }]}>
                      {subClusters.length > 0 ? 'CAKUPAN WILAYAH' : 'TITIK POSKO'}
                    </Text>
                    <Text style={[styles.grassrootsValue, { color: '#059669' }]}>
                      {subClusters.length > 0 ? formatNum(subClusters.length) : formatNum(cluster.poskoCount || 1)}{' '}
                      <Text style={{ fontSize: 13, fontFamily: fonts.medium, color: colors.textMuted }}>
                        {subClusters.length > 0 ? getSubRegionType(cluster.level) : 'Posko'}
                      </Text>
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              /* 4 PILAR METRIK UNTUK PENGURUS/BAPPILU/CALEG */
              <>
                <View style={styles.metricsGrid}>
                  {/* 1. Capaian Kuota */}
                  <View style={[styles.metricCard, { backgroundColor: isDark ? 'rgba(0,102,179,0.1)' : '#F0F9FF', borderColor: '#BAE6FD' }]}>
                    <View style={styles.metricCardHeader}>
                      <Feather name="target" size={13} color="#0066B3" />
                      <Text style={styles.metricCardLabel}>
                        {isMembersLayer ? 'Target Kader' : 'Capaian Kuota'}
                      </Text>
                    </View>
                    <Text style={[styles.metricValue, { color: '#0066B3' }]}>
                      {metrics.achievementPercent ?? 0}%
                    </Text>
                    <Text style={[styles.metricSub, { color: colors.textMuted }]}>
                      Target: {formatNum(metrics.targetAmount)}
                    </Text>
                  </View>

                  {/* 2. Volume Aktif */}
                  <View style={[styles.metricCard, { backgroundColor: isDark ? 'rgba(16,185,129,0.1)' : '#ECFDF5', borderColor: '#A7F3D0' }]}>
                    <View style={styles.metricCardHeader}>
                      <Feather name="users" size={13} color="#10B981" />
                      <Text style={[styles.metricCardLabel, { color: '#047857' }]}>
                        {isMembersLayer ? 'Kader Ber-KTA' : 'Relawan Aktif'}
                      </Text>
                    </View>
                    <Text style={[styles.metricValue, { color: '#10B981' }]}>
                      {formatNum(metrics.activeCount)}
                    </Text>
                    <Text style={[styles.metricSub, { color: colors.textMuted }]}>
                      Belum: {formatNum(metrics.unregisteredCount)}
                    </Text>
                  </View>

                  {/* 3. Verifikasi KTA / KTP */}
                  <View style={[styles.metricCard, { backgroundColor: isDark ? 'rgba(2,132,199,0.1)' : '#F0FDF4', borderColor: '#BBF7D0' }]}>
                    <View style={styles.metricCardHeader}>
                      <Feather name="shield" size={13} color="#0284C7" />
                      <Text style={[styles.metricCardLabel, { color: '#0369A1' }]}>
                        {isMembersLayer ? 'Validasi e-KTA' : 'Verifikasi KTP'}
                      </Text>
                    </View>
                    <Text style={[styles.metricValue, { color: '#0284C7' }]}>
                      {metrics.verificationRatePercent ?? 0}%
                    </Text>
                    <Text style={[styles.metricSub, { color: colors.textMuted }]}>
                      {formatNum(metrics.verifiedCount)} Terverifikasi
                    </Text>
                  </View>

                  {/* 4. Defisit / Surplus */}
                  <View style={[styles.metricCard, { backgroundColor: isDark ? 'rgba(245,158,11,0.1)' : '#FFFBEB', borderColor: '#FDE68A' }]}>
                    <View style={styles.metricCardHeader}>
                      <Feather name="trending-up" size={13} color="#D97706" />
                      <Text style={[styles.metricCardLabel, { color: '#B45309' }]}>
                        Defisit / Surplus
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.metricValue,
                        { color: metrics.isSurplus ? '#10B981' : '#D97706' },
                      ]}
                    >
                      {metrics.isSurplus ? '+' : ''}
                      {formatNum(metrics.gap)}
                    </Text>
                    <Text style={[styles.metricSub, { color: colors.textMuted }]}>
                      {metrics.isSurplus ? 'Surplus Wilayah' : 'Perlu Akselerasi'}
                    </Text>
                  </View>
                </View>

                {/* Dual Segment Progress Bar */}
                <View style={[styles.progressBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', borderColor: colors.border }]}>
                  <View style={styles.progressHeader}>
                    <Text style={[styles.progressTitle, { color: colors.text }]}>
                      Rasio Ketercapaian Terdaftar
                    </Text>
                    <Text style={[styles.progressPercent, { color: '#0066B3' }]}>
                      {metrics.achievementPercent}%
                    </Text>
                  </View>

                  <View style={[styles.trackBg, { backgroundColor: colors.border }]}>
                    <View
                      style={[
                        styles.trackFill,
                        {
                          width: `${Math.min(metrics.achievementPercent, 100)}%`,
                          backgroundColor: metrics.isSurplus ? '#0066B3' : '#F59E0B',
                        },
                      ]}
                    />
                  </View>

                  <View style={styles.progressLegendRow}>
                    <Text style={[styles.progressLegendText, { color: '#10B981' }]}>
                      ● {formatNum(metrics.activeCount)} Terdaftar
                    </Text>
                    <Text style={[styles.progressLegendText, { color: isDark ? '#FBBF24' : '#B45309' }]}>
                      ● {formatNum(metrics.unregisteredCount)} Belum Terdaftar
                    </Text>
                  </View>
                </View>
              </>
            )}

            {/* Rincian Posko Desa (Level 4 - Bebas % Bappilu untuk Relawan) */}
            {poskoDesas.length > 0 && (
              <View style={styles.subListSection}>
                <Text style={[styles.subListTitle, { color: colors.text }]}>
                  Rincian Posko Desa / Kelurahan ({poskoDesas.length})
                </Text>
                {poskoDesas.map((desa) => (
                  <View
                    key={desa.id}
                    style={[
                      styles.desaCard,
                      { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', borderColor: colors.border },
                    ]}
                  >
                    <View style={styles.desaHeader}>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={[styles.desaTitle, { color: colors.text }]}>{desa.villageName}</Text>
                          <View style={styles.poskoBadge}>
                            <Text style={styles.poskoBadgeText}>POSKO SIAGA</Text>
                          </View>
                        </View>
                        <Text style={[styles.desaCoordinator, { color: colors.textMuted }]}>
                          Koordinator: <Text style={{ color: colors.primary, fontFamily: fonts.bold }}>{desa.coordinatorName}</Text>
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end', gap: 2 }}>
                        <Text style={{ fontSize: 13.5, fontFamily: fonts.bold, color: '#059669' }}>
                          {desa.registeredVolunteers} Relawan
                        </Text>
                        <Text style={{ fontSize: 10, color: colors.textMuted }}>Siaga Lapangan</Text>
                      </View>
                    </View>

                    <View style={styles.desaActionsRow}>
                      <TouchableOpacity
                        onPress={() => handleOpenDirections(desa.lat, desa.lng, desa.villageName)}
                        style={[styles.desaActionBtn, { backgroundColor: '#0066B3' }]}
                        activeOpacity={0.8}
                      >
                        <Feather name="navigation" size={12} color="#FFFFFF" />
                        <Text style={styles.desaActionText}>Rute GPS</Text>
                      </TouchableOpacity>

                      {desa.coordinatorPhone && (
                        <TouchableOpacity
                          onPress={() => handleContactWhatsApp(desa.coordinatorPhone!, desa.coordinatorName)}
                          style={[styles.desaActionBtn, { backgroundColor: '#10B981' }]}
                          activeOpacity={0.8}
                        >
                          <Feather name="phone-call" size={12} color="#FFFFFF" />
                          <Text style={styles.desaActionText}>Hubungi WA</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Rincian Sub-Wilayah (DPC / PAC) */}
            {subClusters.length > 0 && (
              <View style={styles.subListSection}>
                <Text style={[styles.subListTitle, { color: colors.text }]}>
                  Daftar {getSubRegionType(cluster.level)} ({subClusters.length})
                </Text>
                {subClusters.map((sub) => {
                  const count = isMembersLayer ? sub.totalCadres : sub.totalVolunteers;
                  return (
                    <TouchableOpacity
                      key={sub.id}
                      onPress={() => onSelectSubRegion && onSelectSubRegion(sub)}
                      style={[
                        styles.subCard,
                        { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', borderColor: colors.border },
                      ]}
                      activeOpacity={0.7}
                    >
                      <View style={{ flex: 1, justifyContent: 'center' }}>
                        <Text style={[styles.subName, { color: colors.text }]}>{sub.name}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={{ fontSize: 13.5, fontFamily: fonts.bold, color: '#0066B3' }}>
                          {formatNum(count)} {unit}
                        </Text>
                        <Feather name="chevron-right" size={16} color={colors.textMuted} />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: 1,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    maxHeight: '82%',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  handleBar: {
    width: 38,
    height: 4.5,
    borderRadius: radius.full,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  regionName: {
    fontSize: 16,
    fontFamily: fonts.bold,
  },
  regionSub: {
    fontSize: 11,
    fontFamily: fonts.regular,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  leaderCard: {
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: 8,
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  leaderRole: {
    fontSize: 10.5,
    color: '#0066B3',
    fontFamily: fonts.bold,
  },
  leaderName: {
    fontSize: 13,
    fontFamily: fonts.bold,
  },
  skBadge: {
    alignItems: 'flex-end',
  },
  skBadgeText: {
    fontSize: 9.5,
    color: '#10B981',
    fontFamily: fonts.bold,
  },
  leaderPhone: {
    fontSize: 9.5,
    color: '#64748B',
  },
  leaderContactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#10B981',
    paddingVertical: 7,
    borderRadius: radius.sm,
  },
  leaderContactBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: fonts.bold,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metricCard: {
    flex: 1,
    minWidth: '46%',
    padding: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: 2,
  },
  metricCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricCardLabel: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: '#0066B3',
  },
  metricValue: {
    fontSize: 18,
    fontFamily: fonts.bold,
  },
  metricSub: {
    fontSize: 10,
    fontFamily: fonts.regular,
  },
  progressBox: {
    padding: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: 6,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressTitle: {
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  progressPercent: {
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  trackBg: {
    height: 7,
    borderRadius: 4,
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressLegendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressLegendText: {
    fontSize: 10,
    fontFamily: fonts.bold,
  },
  subListSection: {
    gap: 6,
    paddingTop: 4,
  },
  subListTitle: {
    fontSize: 12.5,
    fontFamily: fonts.bold,
  },
  desaCard: {
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: 6,
  },
  desaHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  desaTitle: {
    fontSize: 13,
    fontFamily: fonts.bold,
  },
  poskoBadge: {
    backgroundColor: 'rgba(37,99,235,0.12)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  poskoBadgeText: {
    fontSize: 8.5,
    color: '#2563EB',
    fontFamily: fonts.bold,
  },
  desaCoordinator: {
    fontSize: 10.5,
    marginTop: 2,
  },
  desaPercent: {
    fontSize: 12.5,
    fontFamily: fonts.bold,
  },
  desaStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  desaStatText: {
    fontSize: 10.5,
  },
  desaActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 2,
  },
  desaActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  desaActionText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontFamily: fonts.bold,
  },
  subCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  subName: {
    fontSize: 12.5,
    fontFamily: fonts.bold,
  },
  grassrootsStrengthCard: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.xs,
  },
  grassrootsLabel: {
    fontSize: 10,
    fontFamily: fonts.bold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  grassrootsValue: {
    fontSize: 18,
    fontFamily: fonts.bold,
    letterSpacing: -0.3,
    marginTop: 2,
  },
});
