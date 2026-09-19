import React, { useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { fonts, fontSize, radius, spacing } from '../theme';
import { Card, ConfirmDialog, Pill, PrimaryButton } from '../components/ui';
import {
  GIS_NATIONAL_SUMMARY,
  GIS_POSKO_LOCATIONS,
  GIS_REGIONAL_CLUSTERS,
  PoskoLocation,
  RegionalCluster,
} from '../data/gisRegionalData';

type GisFilterType = 'ALL' | 'MEMBERS' | 'VOLUNTEERS' | 'WITNESSES';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function MapSebaranRelawanAnggotaScreen() {
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();

  const [filterType, setFilterType] = useState<GisFilterType>('ALL');
  const [selectedCluster, setSelectedCluster] = useState<RegionalCluster>(GIS_REGIONAL_CLUSTERS[3]); // Default: Coblong
  const [selectedPosko, setSelectedPosko] = useState<PoskoLocation | null>(null);
  const [dialogConfig, setDialogConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    tone?: 'success' | 'info' | 'warning';
  }>({ visible: false, title: '', message: '' });

  const getMetricValue = (cluster: RegionalCluster) => {
    switch (filterType) {
      case 'MEMBERS':
        return `${cluster.totalCadres.toLocaleString('id-ID')} Kader`;
      case 'VOLUNTEERS':
        return `${cluster.totalVolunteers.toLocaleString('id-ID')} Relawan`;
      case 'WITNESSES':
        return `${cluster.witnessCount.toLocaleString('id-ID')} Saksi (${cluster.tpsCoveragePct}%)`;
      default:
        return `${(cluster.totalCadres + cluster.totalVolunteers).toLocaleString('id-ID')} Personel`;
    }
  };

  const handleSelectPosko = (posko: PoskoLocation) => {
    setSelectedPosko(posko);
    setDialogConfig({
      visible: true,
      title: posko.name,
      message: `${posko.categoryLabel}\nAlamat: ${posko.address}\nKecamatan: ${posko.district}, ${posko.regency}\nRelawan Aktif: ${posko.activeVolunteers} orang\nPIC Lapangan: ${posko.picName}\nKoordinat: ${posko.lat.toFixed(4)}, ${posko.lng.toFixed(4)}`,
      tone: 'info',
    });
  };

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Executive Banner (Web Command Center Read-Only Reference) */}
      <View
        style={[
          styles.commandCenterBanner,
          {
            backgroundColor: isDark ? '#002B52' : '#003366',
            borderColor: colors.border,
          },
        ]}
      >
        <View style={{ flex: 1, gap: 4 }}>
          <View style={styles.syncBadgeRow}>
            <View style={styles.blinkingDot} />
            <Text style={styles.syncBadgeText}>SINKRONISASI WEB COMMAND CENTER (READ-ONLY)</Text>
          </View>
          <Text style={styles.bannerTitle}>Peta Sebaran Relawan & Kader</Text>
          <Text style={styles.bannerSub}>
            Visualisasi agregasi kekuatan simPAN, relawan posko lapangan, dan cakupan saksi TPS se-Indonesia.
          </Text>
          <Text style={styles.lastSyncLabel}>Update Terakhir: {GIS_NATIONAL_SUMMARY.lastSyncTime}</Text>
        </View>

        <View style={styles.bannerIconBox}>
          <Feather name="globe" size={32} color="#FFFFFF" />
        </View>
      </View>

      {/* 2. Privacy Guard Banner (UU PDP Bab 24 Compliance) */}
      <View style={[styles.privacyNoticeBox, { backgroundColor: isDark ? 'rgba(5, 150, 105, 0.12)' : '#ECFDF5', borderColor: '#A7F3D0' }]}>
        <Feather name="shield" size={14} color="#059669" />
        <Text style={[styles.privacyNoticeText, { color: isDark ? '#6EE7B7' : '#047857' }]}>
          Standar Privasi Bab 24: Data disajikan dalam bentuk agregat kluster wilayah tanpa mengekspos NIK, nomor HP, atau identitas privat.
        </Text>
      </View>

      {/* 3. Filter Switches */}
      <View style={{ gap: spacing.xs }}>
        <Text style={[styles.sectionTitle, { color: colors.text, paddingHorizontal: 4 }]}>
          Filter Lapisan Kekuatan Partai
        </Text>
        <View style={styles.filterBar}>
          {[
            { key: 'ALL' as const, label: 'Semua', icon: 'layers' },
            { key: 'MEMBERS' as const, label: 'Kader Ber-KTA', icon: 'credit-card' },
            { key: 'VOLUNTEERS' as const, label: 'Relawan Posko', icon: 'heart' },
            { key: 'WITNESSES' as const, label: 'Saksi TPS BSN', icon: 'check-circle' },
          ].map((item) => {
            const active = filterType === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                onPress={() => setFilterType(item.key)}
                style={[
                  styles.filterBtn,
                  {
                    backgroundColor: active ? colors.primary : colors.surface,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
                activeOpacity={0.8}
              >
                <Feather
                  name={item.icon as any}
                  size={12}
                  color={active ? '#FFFFFF' : colors.textMuted}
                />
                <Text
                  style={[
                    styles.filterBtnText,
                    {
                      color: active ? '#FFFFFF' : colors.textMuted,
                      fontFamily: active ? fonts.bold : fonts.medium,
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 4. Interactive GIS Map Canvas Simulation */}
      <Card style={{ padding: 0, overflow: 'hidden', backgroundColor: colors.surface, borderColor: colors.border }}>
        <View style={[styles.mapContainer, { backgroundColor: isDark ? '#091322' : '#E2E8F0' }]}>
          {/* Grid lines background simulation */}
          <View style={styles.mapGridPattern}>
            {[...Array(6)].map((_, i) => (
              <View key={`grid-h-${i}`} style={[styles.gridLineH, { top: i * 36 }]} />
            ))}
            {[...Array(8)].map((_, i) => (
              <View key={`grid-v-${i}`} style={[styles.gridLineV, { left: i * 44 }]} />
            ))}
          </View>

          {/* Regional Territory Shape Outline (Simulated SVG/Vector Map) */}
          <View style={styles.territoryOutline}>
            <View style={[styles.regionPolygon, { borderColor: isDark ? 'rgba(0,102,179,0.5)' : 'rgba(0,102,179,0.3)', backgroundColor: isDark ? 'rgba(0,102,179,0.1)' : 'rgba(0,102,179,0.06)' }]}>
              <Text style={styles.regionPolygonLabel}>DAPIL JAWA BARAT I • KOTA BANDUNG</Text>
            </View>
          </View>

          {/* Interactive Cluster Nodes */}
          {GIS_REGIONAL_CLUSTERS.slice(3, 7).map((cluster, index) => {
            const isSelected = selectedCluster.id === cluster.id;
            const positions = [
              { top: 40, left: 60 },
              { top: 65, left: 190 },
              { top: 120, left: 110 },
              { top: 140, left: 230 },
            ];
            const pos = positions[index] || { top: 80, left: 100 };

            return (
              <TouchableOpacity
                key={cluster.id}
                style={[
                  styles.clusterPin,
                  {
                    top: pos.top,
                    left: pos.left,
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                    borderColor: isSelected ? '#FFFFFF' : colors.primary,
                    transform: [{ scale: isSelected ? 1.15 : 1.0 }],
                  },
                ]}
                onPress={() => setSelectedCluster(cluster)}
                activeOpacity={0.8}
              >
                <View style={styles.pinHeader}>
                  <Feather
                    name={filterType === 'WITNESSES' ? 'check-circle' : filterType === 'VOLUNTEERS' ? 'heart' : 'users'}
                    size={10}
                    color={isSelected ? '#FFFFFF' : colors.primary}
                  />
                  <Text
                    style={[
                      styles.pinCountText,
                      { color: isSelected ? '#FFFFFF' : colors.primary },
                    ]}
                  >
                    {cluster.totalCadres > 1000 ? `${(cluster.totalCadres / 1000).toFixed(1)}k` : cluster.totalCadres}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.pinNameText,
                    { color: isSelected ? '#FFFFFF' : colors.text },
                  ]}
                  numberOfLines={1}
                >
                  {cluster.name.replace('Kecamatan ', '')}
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* Posko Pins */}
          {GIS_POSKO_LOCATIONS.map((posko, idx) => {
            const coords = [
              { top: 130, left: 200 },
              { top: 35, left: 130 },
              { top: 55, left: 40 },
              { top: 105, left: 80 },
            ];
            const c = coords[idx] || { top: 90, left: 90 };
            return (
              <TouchableOpacity
                key={posko.id}
                style={[styles.poskoPin, { top: c.top, left: c.left }]}
                onPress={() => handleSelectPosko(posko)}
                activeOpacity={0.8}
              >
                <View style={[styles.poskoBadge, { backgroundColor: posko.isMainCommandCenter ? '#E60012' : '#F59E0B' }]}>
                  <Feather name="flag" size={9} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Map Controls Overlay */}
          <View style={styles.mapControlsOverlay}>
            <View style={[styles.legendBox, { backgroundColor: isDark ? 'rgba(15,23,42,0.9)' : 'rgba(255,255,255,0.9)' }]}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
                <Text style={[styles.legendText, { color: colors.text }]}>Basis Kader</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#E60012' }]} />
                <Text style={[styles.legendText, { color: colors.text }]}>Posko Komando</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                <Text style={[styles.legendText, { color: colors.text }]}>95%+ Saksi TPS</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Info Strip Selected Cluster */}
        <View style={[styles.clusterDetailStrip, { borderTopColor: colors.border, backgroundColor: isDark ? 'rgba(0,43,82,0.15)' : '#F8FAFC' }]}>
          <View style={{ flex: 1, gap: 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.stripTitle, { color: colors.text }]}>{selectedCluster.name}</Text>
              <Pill
                label={selectedCluster.density === 'TINGGI' ? 'Basis Kuat' : 'Zona Penetrasi'}
                tone={selectedCluster.density === 'TINGGI' ? 'success' : 'warning'}
              />
            </View>
            <Text style={[styles.stripSub, { color: colors.textMuted }]}>
              {selectedCluster.coveredTps} dari {selectedCluster.totalTps} TPS Terkover Saksi Resmi Mandat BSN
            </Text>
          </View>

          <View style={{ alignItems: 'flex-end', gap: 2 }}>
            <Text style={[styles.stripMetric, { color: colors.primary }]}>{getMetricValue(selectedCluster)}</Text>
            <Text style={[styles.stripMetricLabel, { color: colors.textMuted }]}>Kekuatan Wilayah</Text>
          </View>
        </View>
      </Card>

      {/* 5. Kartu Statistik Utama Wilayah */}
      <View style={styles.statsCardsRow}>
        <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.statIconBox, { backgroundColor: 'rgba(0,102,179,0.12)' }]}>
            <Feather name="check-square" size={16} color={colors.primary} />
          </View>
          <Text style={[styles.statValue, { color: colors.primary }]}>{GIS_NATIONAL_SUMMARY.nationalCoveragePct}%</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Cakupan TPS</Text>
        </View>

        <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.statIconBox, { backgroundColor: 'rgba(16,185,129,0.12)' }]}>
            <Feather name="users" size={16} color="#10B981" />
          </View>
          <Text style={[styles.statValue, { color: '#10B981' }]}>1.9 Saksi</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Rasio per TPS</Text>
        </View>

        <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.statIconBox, { backgroundColor: 'rgba(230,0,18,0.12)' }]}>
            <Feather name="flag" size={16} color="#E60012" />
          </View>
          <Text style={[styles.statValue, { color: '#E60012' }]}>{GIS_POSKO_LOCATIONS.length} Posko</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Posko Aktif</Text>
        </View>
      </View>

      {/* 6. Rincian Kepadatan Kader & Saksi per Kecamatan */}
      <Card style={{ gap: spacing.sm, backgroundColor: colors.surface, borderColor: colors.border }}>
        <View style={styles.sectionHeaderBetween}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Feather name="bar-chart-2" size={16} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Sebaran per Kecamatan (Dapil Jabar I)</Text>
          </View>
          <Pill label="4 Kecamatan Kunci" tone="primary" />
        </View>

        <View style={{ gap: spacing.sm }}>
          {GIS_REGIONAL_CLUSTERS.slice(3, 7).map((c) => {
            const isCurrent = selectedCluster.id === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                onPress={() => setSelectedCluster(c)}
                style={[
                  styles.districtRow,
                  {
                    backgroundColor: isCurrent ? (isDark ? 'rgba(0,102,179,0.18)' : '#F0F9FF') : 'transparent',
                    borderColor: isCurrent ? colors.primary : colors.border,
                  },
                ]}
                activeOpacity={0.8}
              >
                <View style={{ flex: 1, gap: 4 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={[styles.districtName, { color: colors.text }]}>{c.name}</Text>
                    <Text style={[styles.districtStat, { color: colors.primary }]}>
                      {c.totalCadres.toLocaleString('id-ID')} Kader • {c.witnessCount} Saksi
                    </Text>
                  </View>

                  <View style={styles.progressRow}>
                    <View style={[styles.trackBg, { backgroundColor: colors.border }]}>
                      <View
                        style={[
                          styles.trackFill,
                          {
                            width: `${c.tpsCoveragePct}%`,
                            backgroundColor: c.tpsCoveragePct >= 96 ? colors.success : colors.primary,
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.coveragePctText, { color: colors.textMuted }]}>
                      {c.tpsCoveragePct}% TPS
                    </Text>
                  </View>
                </View>

                <Feather name="chevron-right" size={16} color={isCurrent ? colors.primary : colors.textMuted} />
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      {/* 7. Posko Komando & Aspirasi Rakyat */}
      <Card style={{ gap: spacing.sm, backgroundColor: colors.surface, borderColor: colors.border }}>
        <View style={styles.sectionHeaderBetween}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Feather name="map-pin" size={16} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Jejaring Posko Pemenangan Wilayah</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('SimpanOffices')}>
            <Text style={{ fontSize: 12, fontFamily: fonts.bold, color: colors.primary }}>Lihat Kantor DPD →</Text>
          </TouchableOpacity>
        </View>

        <View style={{ gap: spacing.xs }}>
          {GIS_POSKO_LOCATIONS.map((posko) => (
            <Pressable
              key={posko.id}
              onPress={() => handleSelectPosko(posko)}
              style={({ pressed }) => [
                styles.poskoCardRow,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', borderColor: colors.border },
                pressed && { opacity: 0.8 },
              ]}
            >
              <View style={[styles.poskoIconBox, { backgroundColor: posko.isMainCommandCenter ? 'rgba(230,0,18,0.12)' : 'rgba(245,158,11,0.12)' }]}>
                <Feather name="flag" size={16} color={posko.isMainCommandCenter ? '#E60012' : '#F59E0B'} />
              </View>

              <View style={{ flex: 1, gap: 2 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={[styles.poskoCardTitle, { color: colors.text }]} numberOfLines={1}>
                    {posko.name}
                  </Text>
                  {posko.isMainCommandCenter && <Pill label="Markas Utama" tone="danger" />}
                </View>
                <Text style={[styles.poskoCardAddress, { color: colors.textMuted }]} numberOfLines={1}>
                  {posko.address}
                </Text>
                <Text style={{ fontSize: 10, fontFamily: fonts.medium, color: colors.primary }}>
                  PIC: {posko.picName} • {posko.activeVolunteers} Relawan Siaga
                </Text>
              </View>

              <Feather name="arrow-up-right" size={16} color={colors.textMuted} />
            </Pressable>
          ))}
        </View>
      </Card>

      {/* Global Dialog */}
      <ConfirmDialog
        visible={dialogConfig.visible}
        title={dialogConfig.title}
        message={dialogConfig.message}
        tone={dialogConfig.tone}
        confirmLabel="Tutup"
        onConfirm={() => setDialogConfig({ visible: false, title: '', message: '' })}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: 40,
  },
  commandCenterBanner: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  syncBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  blinkingDot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
    backgroundColor: '#34D399',
  },
  syncBadgeText: {
    fontSize: 9,
    fontFamily: fonts.bold,
    color: '#93C5FD',
    letterSpacing: 0.5,
  },
  bannerTitle: {
    fontSize: 19,
    fontFamily: fonts.bold,
    color: '#FFFFFF',
  },
  bannerSub: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 15,
  },
  lastSyncLabel: {
    fontSize: 9.5,
    fontFamily: fonts.medium,
    color: '#FBBF24',
    marginTop: 2,
  },
  bannerIconBox: {
    width: 50,
    height: 50,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  privacyNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  privacyNoticeText: {
    fontSize: 11,
    fontFamily: fonts.regular,
    flex: 1,
    lineHeight: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: fonts.bold,
  },
  filterBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  filterBtnText: {
    fontSize: 11.5,
  },
  mapContainer: {
    height: 220,
    position: 'relative',
    overflow: 'hidden',
  },
  mapGridPattern: {
    ...StyleSheet.absoluteFill,
    opacity: 0.15,
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#94A3B8',
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#94A3B8',
  },
  territoryOutline: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  regionPolygon: {
    width: '88%',
    height: '80%',
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 8,
  },
  regionPolygonLabel: {
    fontSize: 9,
    fontFamily: fonts.bold,
    color: '#64748B',
    letterSpacing: 0.6,
  },
  clusterPin: {
    position: 'absolute',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    alignItems: 'center',
  },
  pinHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  pinCountText: {
    fontSize: 10,
    fontFamily: fonts.bold,
  },
  pinNameText: {
    fontSize: 8.5,
    fontFamily: fonts.medium,
  },
  poskoPin: {
    position: 'absolute',
    zIndex: 10,
  },
  poskoBadge: {
    width: 20,
    height: 20,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  mapControlsOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
  },
  legendBox: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: radius.full,
  },
  legendText: {
    fontSize: 9,
    fontFamily: fonts.medium,
  },
  clusterDetailStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.sm,
    borderTopWidth: 1,
  },
  stripTitle: {
    fontSize: 13,
    fontFamily: fonts.bold,
  },
  stripSub: {
    fontSize: 10.5,
    fontFamily: fonts.regular,
  },
  stripMetric: {
    fontSize: 13.5,
    fontFamily: fonts.bold,
  },
  stripMetricLabel: {
    fontSize: 9.5,
    fontFamily: fonts.regular,
  },
  statsCardsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statBox: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    gap: 3,
  },
  statIconBox: {
    width: 30,
    height: 30,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    fontFamily: fonts.bold,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: fonts.medium,
  },
  sectionHeaderBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  districtRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    gap: spacing.sm,
  },
  districtName: {
    fontSize: 12.5,
    fontFamily: fonts.bold,
  },
  districtStat: {
    fontSize: 10.5,
    fontFamily: fonts.medium,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trackBg: {
    flex: 1,
    height: 5,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  coveragePctText: {
    fontSize: 10,
    fontFamily: fonts.medium,
    width: 50,
    textAlign: 'right',
  },
  poskoCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  poskoIconBox: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  poskoCardTitle: {
    fontSize: 12.5,
    fontFamily: fonts.bold,
  },
  poskoCardAddress: {
    fontSize: 10.5,
    fontFamily: fonts.regular,
  },
});
