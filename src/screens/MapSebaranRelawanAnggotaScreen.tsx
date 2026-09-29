import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  BackHandler,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { fonts, radius, spacing } from '../theme';
import { buildCommandCenterMapHtml } from '../utils/gisHtmlBuilder';
import { canSeeCommandCenterModes, useAccountSnapshot } from '../features/account';
import { FEATURE_FLAGS } from '../core/config/featureFlags';
import { INDONESIA_GEOJSON } from '../data/indonesiaGeojsonData';
import { getProvinceKabupatenGeoJson, getKabupatenKecamatanGeoJson, getFeatureCentroid } from '../utils/geoRegistry';
import {
  commandCenterService,
  CommandMode,
  ProvinceCommandItem,
  RegencyBreakdownItem,
  SELECTED_REGION_STYLE,
  ACHIEVEMENT_STATUS_MAP,
  PAN_VICTORY_CONFIG,
  getProvinceSlug,
  getTierColorForMode,
  getTierValueLabelForMode,
  formatNumberID,
  formatPercent,
} from '../services/commandCenterService';

/**
 * Peta Sebaran & Command Center Terpadu — PAN 360
 *
 * Digabung total (2026-09-28) sesuai permintaan: menu "Command Center"
 * dan "Peta Sebaran" sekarang satu layar. Yang dipertahankan dari Peta
 * Sebaran versi lama HANYA peta Indonesia + pembagian wilayahnya
 * (poligon GeoJSON provinsi/kab-kota/kecamatan + drill-down zoom) —
 * seluruh layer pin posko/kantor/kader/relawan & mode layer lama sudah
 * dihapus (lihat gisHtmlBuilder.ts). Warna choropleth dan highlight
 * wilayah terpilih di peta memakai persis tier & warna yang sama dengan
 * commandCenterService.ts (identik dengan yang tampil di kartu KPI),
 * mengikuti ANALISA_MOBILE_COMMAND_CENTER.md Bagian 4.3/4.4.
 */

type DrillTier = 'NATIONAL' | 'PROVINCE' | 'REGENCY';

const NATIONAL_CAMERA = { lat: -2.5, lng: 118.0, zoom: 5, label: 'Nasional (38 Provinsi)' };

export default function MapSebaranRelawanAnggotaScreen() {
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();
  const webViewRef = useRef<WebView>(null);

  // Peta Relawan untuk semua role; mode Saksi TPS & Kemenangan khusus pengurus/pejabat/caleg.
  const account = useAccountSnapshot();
  const canSeeAllModes = FEATURE_FLAGS.advancedRoles || canSeeCommandCenterModes(account);
  const modeTabs = useMemo(
    () => commandCenterService.getModeTabs().filter((t) => canSeeAllModes || t.mode === 'relawan'),
    [canSeeAllModes],
  );
  const allProvinces = useMemo(() => commandCenterService.getProvinces(), []);
  const nationalSummary = useMemo(() => commandCenterService.getNationalSummary(), []);

  const [mode, setMode] = useState<CommandMode>(canSeeAllModes ? 'saksi_tps' : 'relawan');
  const [drillTier, setDrillTier] = useState<DrillTier>('NATIONAL');
  const [selectedProvince, setSelectedProvince] = useState<ProvinceCommandItem | null>(null);
  const [activeProvinceName, setActiveProvinceName] = useState<string | null>(null);
  const [activeRegencyName, setActiveRegencyName] = useState<string | null>(null);
  const [camera, setCamera] = useState(NATIONAL_CAMERA);

  const [isModeSheetVisible, setIsModeSheetVisible] = useState(false);
  const [isRegionSheetVisible, setIsRegionSheetVisible] = useState(false);
  const [isRingkasanVisible, setIsRingkasanVisible] = useState(false);

  const activeModeMeta = modeTabs.find((t) => t.mode === mode)!;

  // -------------------------------------------------------------
  // WARNA CHOROPLETH — identik commandCenterService (Bagian 4.3/4.4)
  // -------------------------------------------------------------
  const regionColorMap = useMemo(() => commandCenterService.getRegionColorMap(mode), [mode]);
  const selectedSlug = selectedProvince ? getProvinceSlug(selectedProvince.name) : null;

  // -------------------------------------------------------------
  // GEOJSON DRILL-DOWN — hanya pembagian wilayah, tanpa data agregat
  // per kab/kota & kecamatan (Fase 1, lihat Bagian 9 Roadmap)
  // -------------------------------------------------------------
  const regencyGeoJson = useMemo(
    () => (activeProvinceName ? getProvinceKabupatenGeoJson(activeProvinceName) : null),
    [activeProvinceName],
  );
  const districtGeoJson = useMemo(
    () => (activeRegencyName ? getKabupatenKecamatanGeoJson(activeRegencyName) : null),
    [activeRegencyName],
  );

  const mapHtml = useMemo(
    () =>
      buildCommandCenterMapHtml({
        centerLat: camera.lat,
        centerLng: camera.lng,
        zoom: camera.zoom,
        nationalGeoJson: INDONESIA_GEOJSON,
        regencyGeoJson: drillTier !== 'NATIONAL' ? regencyGeoJson : null,
        districtGeoJson: drillTier === 'REGENCY' ? districtGeoJson : null,
        regionFillColors: regionColorMap.colors,
        regionValueLabels: regionColorMap.labels,
        selectedRegionSlug: selectedSlug,
        selectedBorderColor: SELECTED_REGION_STYLE.borderColor,
        isDark,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [camera, drillTier, regencyGeoJson, districtGeoJson, regionColorMap, selectedSlug, isDark],
  );

  // -------------------------------------------------------------
  // NAVIGASI WILAYAH
  // -------------------------------------------------------------
  const findCentroidBySlug = (slug: string) => {
    const feature = (INDONESIA_GEOJSON as any)?.features?.find(
      (f: any) => getProvinceSlug(f.properties?.PROVINSI || f.properties?.name || '') === slug,
    );
    if (feature) return getFeatureCentroid(feature);
    return { lat: NATIONAL_CAMERA.lat, lng: NATIONAL_CAMERA.lng };
  };

  const selectProvince = (province: ProvinceCommandItem) => {
    setIsRegionSheetVisible(false);
    setSelectedProvince(province);
    setActiveProvinceName(province.name);
    setActiveRegencyName(null);
    setDrillTier('PROVINCE');
    const centroid = findCentroidBySlug(getProvinceSlug(province.name));
    setCamera({ lat: centroid.lat, lng: centroid.lng, zoom: 7.4, label: province.name });
  };

  const goBackOneTier = (): boolean => {
    if (drillTier === 'REGENCY') {
      setDrillTier('PROVINCE');
      setActiveRegencyName(null);
      if (selectedProvince) {
        const centroid = findCentroidBySlug(getProvinceSlug(selectedProvince.name));
        setCamera({ lat: centroid.lat, lng: centroid.lng, zoom: 7.4, label: selectedProvince.name });
      }
      return true;
    }
    if (drillTier === 'PROVINCE') {
      setDrillTier('NATIONAL');
      setSelectedProvince(null);
      setActiveProvinceName(null);
      setActiveRegencyName(null);
      setCamera(NATIONAL_CAMERA);
      return true;
    }
    navigation.goBack();
    return true;
  };

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', goBackOneTier);
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drillTier, selectedProvince]);

  const handleWebViewMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      if (message.type === 'WEBVIEW_ERROR') {
        console.warn('[PetaSebaran WebView]', message.data);
        return;
      }
      if (message.type !== 'REGION_TAP') return;

      const { level, slug, name, lat, lng } = message.data;
      if (level === 'PROVINCE') {
        const province = slug ? commandCenterService.getProvinceBySlug(slug) : undefined;
        if (province) {
          setSelectedProvince(province);
          setActiveProvinceName(province.name);
        } else {
          setActiveProvinceName(name);
        }
        setActiveRegencyName(null);
        setDrillTier('PROVINCE');
        setCamera({ lat, lng, zoom: 7.6, label: name });
      } else if (level === 'REGENCY') {
        setActiveRegencyName(name);
        setDrillTier('REGENCY');
        setCamera({ lat, lng, zoom: 9.8, label: name });
      } else if (level === 'DISTRICT') {
        Alert.alert('Data Tingkat Kecamatan', `Data agregat ${name} akan tersedia pada pengembangan berikutnya.`);
        setCamera((prev) => ({ ...prev, lat, lng, zoom: 11 }));
      }
    } catch (err) {
      console.warn('[PetaSebaran] Gagal memproses pesan WebView:', err);
    }
  };

  // -------------------------------------------------------------
  // KPI RINGKASAN — identik dengan mapping Bagian 5 (dipakai juga di
  // bottom card & sheet Ringkasan)
  // -------------------------------------------------------------
  const activeSource = selectedProvince ? selectedProvince[mode] : nationalSummary[mode];
  const wilayahLabel = selectedProvince ? selectedProvince.name : 'NASIONAL (38 Provinsi)';

  const kpiCards = useMemo(() => {
    if (mode === 'relawan') {
      const s = activeSource as ProvinceCommandItem['relawan'];
      return [
        { icon: 'target' as const, label: 'Target Relawan', value: formatNumberID(s.target) },
        { icon: 'users' as const, label: 'Relawan Terdaftar', value: formatNumberID(s.active) },
        { icon: 'trending-up' as const, label: 'Capaian Target', value: formatPercent(s.percent), badge: s.statusMeta.label, badgeColor: s.statusMeta.color },
        { icon: 'home' as const, label: 'Total Posko', value: formatNumberID(s.poskoCount) },
      ];
    }
    if (mode === 'saksi_tps') {
      const s = activeSource as ProvinceCommandItem['saksi_tps'];
      return [
        { icon: 'shield' as const, label: 'Mandat Saksi & TPS', value: formatNumberID(s.saksiMandat), sublabel: `Target: ${formatNumberID(s.tpsCount)} TPS` },
        {
          icon: 'map-pin' as const,
          label: 'Saksi Hadir (Presensi)',
          value: formatNumberID(s.saksiHadirCount),
          badge: `${formatPercent(s.tpsStats.selesaiPercent)} C1`,
          badgeColor: colors.primary,
          sublabel: `C1 Masuk: ${formatNumberID(s.tpsStats.selesai)} TPS`,
        },
        { icon: 'check-circle' as const, label: 'Kehadiran Saksi', value: formatPercent(s.saksiPercent), badge: s.saksiStatusMeta.label, badgeColor: s.saksiStatusMeta.color },
        {
          icon: 'alert-triangle' as const,
          label: 'Anomali Terdeteksi',
          value: `${s.saksiAnomaliCount} TPS`,
          badge: s.saksiAnomaliCount > 0 ? 'Alert' : undefined,
          badgeColor: colors.danger,
          isDanger: s.saksiAnomaliCount > 0,
        },
      ];
    }
    const s = activeSource as ProvinceCommandItem['kemenangan'];
    return [
      { icon: 'bar-chart-2' as const, label: 'Total Suara PAN', value: formatNumberID(s.panVotes) },
      { icon: 'percent' as const, label: 'Persentase PAN', value: formatPercent(s.panPercent), badge: s.tierConfig.shortLabel, badgeColor: s.tierConfig.color },
      { icon: 'award' as const, label: 'Peringkat Partai', value: `#${s.partyRank} dari ${s.totalParties} Parpol` },
      { icon: 'briefcase' as const, label: `Estimasi Kursi ${s.kursiLabel}`, value: formatNumberID(s.kursiEstimasi) },
    ];
  }, [activeSource, mode, colors.primary, colors.danger]);

  // -------------------------------------------------------------
  // LEGENDA WARNA — persis mengikuti tabel tier website (Bagian 4.3)
  // -------------------------------------------------------------
  const legendItems = useMemo(() => {
    if (mode === 'kemenangan') {
      // Urutan tampil dari capaian tertinggi ke terendah
      return PAN_VICTORY_CONFIG.map((tier) => ({ color: tier.color, label: tier.label }));
    }
    return [
      ACHIEVEMENT_STATUS_MAP.TARGET_MET,
      ACHIEVEMENT_STATUS_MAP.NEAR_TARGET,
      ACHIEVEMENT_STATUS_MAP.LOW,
      ACHIEVEMENT_STATUS_MAP.ZERO_VOLUNTEER,
      ACHIEVEMENT_STATUS_MAP.NO_DATA,
    ].map((tier) => ({ color: tier.color, label: tier.label }));
  }, [mode]);

  // -------------------------------------------------------------
  // RINCIAN KAB/KOTA — muncul di modal Ringkasan begitu satu provinsi
  // dipilih, menampilkan persentase Relawan/Saksi Mandat/Kemenangan
  // sekaligus per kab/kota (bukan cuma mode aktif di peta).
  // -------------------------------------------------------------
  const regencyBreakdown: RegencyBreakdownItem[] = useMemo(() => {
    if (!selectedProvince || !regencyGeoJson) return [];
    return commandCenterService.getRegencyBreakdown(selectedProvince, regencyGeoJson);
  }, [selectedProvince, regencyGeoJson]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />

      {/* 1. KANVAS PETA — Indonesia + pembagian wilayah, choropleth Command Center */}
      <View style={StyleSheet.absoluteFill}>
        <WebView
          ref={webViewRef}
          source={{ html: mapHtml, baseUrl: 'https://localhost' }}
          style={StyleSheet.absoluteFill}
          onMessage={handleWebViewMessage}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          mixedContentMode="always"
          scrollEnabled={false}
          onError={(e) => console.warn('[PetaSebaran WebView] Error:', e.nativeEvent)}
        />
      </View>

      {/* 2. TOP BAR: Back + Chip Wilayah (mode & legenda dipindah jadi dock terpisah) */}
      <SafeAreaView style={styles.topSafeArea}>
        <View style={styles.topBarRow}>
          <TouchableOpacity
            onPress={goBackOneTier}
            style={[styles.circleButton, { backgroundColor: isDark ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.95)', borderColor: colors.border }]}
            activeOpacity={0.8}
          >
            <Feather name="arrow-left" size={20} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsRegionSheetVisible(true)}
            style={[styles.territoryChip, { backgroundColor: isDark ? 'rgba(15,23,42,0.94)' : 'rgba(255,255,255,0.96)', borderColor: colors.border }]}
            activeOpacity={0.8}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.territoryTierTag, { color: isDark ? '#7DD3FC' : '#005299' }]}>
                {drillTier === 'NATIONAL' ? 'TINGKAT NASIONAL' : drillTier === 'PROVINCE' ? 'TINGKAT PROVINSI' : 'TINGKAT KAB/KOTA'}
              </Text>
              <Text style={[styles.territoryChipText, { color: colors.text }]} numberOfLines={1}>
                {activeRegencyName || activeProvinceName || wilayahLabel}
              </Text>
            </View>
            <Feather name="chevron-down" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* 3. DOCK KANAN: Tombol Ganti Mode (Layer) — posisi FAB, sejajar top bar.
          Disembunyikan bila pengguna hanya punya 1 mode (Peta Relawan). */}
      {modeTabs.length > 1 && (
      <View style={styles.rightDockContainer}>
        <TouchableOpacity
          onPress={() => setIsModeSheetVisible(true)}
          style={[styles.dockFabButton, { backgroundColor: isDark ? 'rgba(15,23,42,0.94)' : 'rgba(255,255,255,0.96)', borderColor: colors.border }]}
          activeOpacity={0.8}
          accessibilityLabel="Ganti Mode Peta"
        >
          <Feather name="layers" size={20} color={isDark ? '#7DD3FC' : '#005299'} />
        </TouchableOpacity>
        <Text style={[styles.dockFabCaption, { color: colors.textMuted }]} numberOfLines={2}>
          {activeModeMeta.label}
        </Text>
      </View>
      )}

      {/* 4. DOCK KIRI: Legenda Warna (identik tier website, Bagian 4.3) */}
      <View style={[styles.legendPanel, { backgroundColor: isDark ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.95)', borderColor: colors.border }]}>
        {legendItems.map((item) => (
          <View key={item.label} style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <Text style={[styles.legendLabel, { color: colors.text }]} numberOfLines={1}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>

      {/* 5. FLOATING BOTTOM SUMMARY CARD — minim info, detail lengkap ada di sheet Ringkasan */}
      <View style={styles.bottomCardContainer}>
        <TouchableOpacity
          onPress={() => setIsRingkasanVisible(true)}
          style={[
            styles.floatingSummaryCard,
            { backgroundColor: isDark ? 'rgba(15,23,42,0.96)' : 'rgba(255,255,255,0.98)', borderColor: isDark ? 'rgba(51,65,85,0.8)' : 'rgba(226,232,240,0.9)' },
          ]}
          activeOpacity={0.88}
        >
          <View style={[styles.cardStatusAccent, { backgroundColor: colors.primary }]} />
          <View style={{ flex: 1, paddingVertical: 2, paddingHorizontal: 10 }}>
            <Text style={[styles.cardTierBadge, { color: isDark ? '#7DD3FC' : '#005299' }]}>{activeModeMeta.label.toUpperCase()}</Text>
            <Text style={[styles.cardTitleText, { color: colors.text }]} numberOfLines={1}>
              {wilayahLabel}
            </Text>
          </View>
          <View style={styles.cardActionContainer}>
            <Text style={[styles.cardActionText, { color: isDark ? '#38BDF8' : '#005299' }]}>Ringkasan</Text>
            <Feather name="chevron-right" size={16} color={isDark ? '#38BDF8' : '#005299'} />
          </View>
        </TouchableOpacity>
      </View>

      {/* 4. SHEET: PILIH MODE (Relawan / Saksi Mandat TPS / Kemenangan) */}
      <Modal visible={isModeSheetVisible} transparent animationType="slide" onRequestClose={() => setIsModeSheetVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.drawerSheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.drawerHandle}>
              <View style={[styles.drawerHandleBar, { backgroundColor: colors.border }]} />
            </View>
            <View style={styles.drawerHeader}>
              <Text style={[styles.drawerTitle, { color: colors.text }]}>Pilih Mode Peta</Text>
              <TouchableOpacity onPress={() => setIsModeSheetVisible(false)}>
                <Feather name="x" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            <View style={{ gap: spacing.sm, paddingVertical: spacing.sm }}>
              {modeTabs.map((tab) => {
                const isSelected = tab.mode === mode;
                return (
                  <TouchableOpacity
                    key={tab.mode}
                    onPress={() => {
                      setMode(tab.mode);
                      setIsModeSheetVisible(false);
                    }}
                    style={[
                      styles.optionRow,
                      {
                        backgroundColor: isSelected ? (isDark ? 'rgba(0,102,179,0.18)' : '#F0F9FF') : isDark ? 'rgba(255,255,255,0.02)' : '#F8FAFC',
                        borderColor: isSelected ? '#0066B3' : colors.border,
                      },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.optionTitle, { color: colors.text, fontFamily: isSelected ? fonts.bold : fonts.medium }]}>{tab.label}</Text>
                      <Text style={[styles.optionDesc, { color: colors.textMuted }]}>{tab.sublabel}</Text>
                    </View>
                    {isSelected && <Feather name="check" size={18} color="#0066B3" />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      {/* 5. SHEET: PILIH WILAYAH (38 Provinsi) */}
      <Modal visible={isRegionSheetVisible} transparent animationType="slide" onRequestClose={() => setIsRegionSheetVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.drawerSheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.drawerHandle}>
              <View style={[styles.drawerHandleBar, { backgroundColor: colors.border }]} />
            </View>
            <View style={styles.drawerHeader}>
              <Text style={[styles.drawerTitle, { color: colors.text }]}>Pilih Cakupan Wilayah</Text>
              <TouchableOpacity onPress={() => setIsRegionSheetVisible(false)}>
                <Feather name="x" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 460 }} showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                onPress={() => {
                  setIsRegionSheetVisible(false);
                  setDrillTier('NATIONAL');
                  setSelectedProvince(null);
                  setActiveProvinceName(null);
                  setActiveRegencyName(null);
                  setCamera(NATIONAL_CAMERA);
                }}
                style={[
                  styles.optionRow,
                  {
                    marginBottom: spacing.xs,
                    backgroundColor: drillTier === 'NATIONAL' ? (isDark ? 'rgba(0,102,179,0.18)' : '#F0F9FF') : isDark ? 'rgba(255,255,255,0.02)' : '#F8FAFC',
                    borderColor: drillTier === 'NATIONAL' ? '#0066B3' : colors.border,
                  },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.optionTitle, { color: colors.text, fontFamily: drillTier === 'NATIONAL' ? fonts.bold : fonts.medium }]}>
                    Skala Nasional (38 Provinsi)
                  </Text>
                  <Text style={[styles.optionDesc, { color: colors.textMuted }]}>Ringkasan agregat seluruh Indonesia</Text>
                </View>
                {drillTier === 'NATIONAL' && <Feather name="check" size={18} color="#0066B3" />}
              </TouchableOpacity>

              {allProvinces.map((province) => {
                const isSelected = selectedProvince?.id === province.id;
                const tierColor = getTierColorForMode(province, mode);
                return (
                  <TouchableOpacity
                    key={province.id}
                    onPress={() => selectProvince(province)}
                    style={[
                      styles.optionRow,
                      { backgroundColor: isSelected ? (isDark ? 'rgba(0,102,179,0.18)' : '#F0F9FF') : isDark ? 'rgba(255,255,255,0.02)' : '#F8FAFC', borderColor: isSelected ? '#0066B3' : colors.border },
                    ]}
                  >
                    <View style={[styles.tierDot, { backgroundColor: tierColor }]} />
                    <Text style={[styles.optionTitle, { flex: 1, color: colors.text, fontFamily: isSelected ? fonts.bold : fonts.medium }]}>
                      {province.name}
                    </Text>
                    <Text style={[styles.optionValue, { color: tierColor }]}>{getTierValueLabelForMode(province, mode)}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 6. SHEET: RINGKASAN (4 KPI sesuai mode aktif, Bagian 5) */}
      <Modal visible={isRingkasanVisible} transparent animationType="slide" onRequestClose={() => setIsRingkasanVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.drawerSheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.drawerHandle}>
              <View style={[styles.drawerHandleBar, { backgroundColor: colors.border }]} />
            </View>
            <View style={styles.drawerHeader}>
              <Text style={[styles.drawerTitle, { color: colors.text }]}>
                Ringkasan — {wilayahLabel}
              </Text>
              <TouchableOpacity onPress={() => setIsRingkasanVisible(false)}>
                <Feather name="x" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.optionDesc, { color: colors.textMuted, marginBottom: spacing.sm }]}>
              Mode: {activeModeMeta.label} — {activeModeMeta.sublabel}
            </Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.kpiGrid}>
                {/* Kartu dipangkas jadi ikon + angka + label saja (1 arti per kartu).
                    Detail (sublabel/badge tier) dipindah ke tap -> Alert, bukan
                    ditumpuk sebagai teks tambahan di kartu (progressive disclosure). */}
                {kpiCards.map((card) => {
                  const hasDetail = Boolean((card as any).sublabel || (card as any).badge);
                  const accentColor = (card as any).badgeColor || colors.border;
                  return (
                    <TouchableOpacity
                      key={card.label}
                      activeOpacity={hasDetail ? 0.7 : 1}
                      disabled={!hasDetail}
                      onPress={() => {
                        if (!hasDetail) return;
                        const parts = [
                          (card as any).badge ? `Status: ${(card as any).badge}` : null,
                          (card as any).sublabel || null,
                        ].filter(Boolean);
                        Alert.alert(card.label, `${card.value}\n\n${parts.join('\n')}`);
                      }}
                      style={[
                        styles.kpiCard,
                        { backgroundColor: colors.background, borderColor: colors.border, borderLeftColor: accentColor },
                      ]}
                    >
                      <Feather name={card.icon} size={16} color={(card as any).isDanger ? colors.danger : colors.primary} />
                      <Text style={[styles.kpiValue, { color: (card as any).isDanger ? colors.danger : colors.text }]} numberOfLines={1}>
                        {card.value}
                      </Text>
                      <Text style={[styles.kpiLabel, { color: colors.textMuted }]} numberOfLines={1}>
                        {card.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Rincian Kab/Kota — muncul begitu satu provinsi dipilih (Relawan/Saksi Mandat/Kemenangan sekaligus) */}
              {selectedProvince ? (
                <>
                  <Text style={[styles.sectionSubtitle, { color: colors.text }]}>
                    Kabupaten/Kota di {selectedProvince.name}
                  </Text>
                  {regencyBreakdown.length === 0 ? (
                    <Text style={[styles.optionDesc, { color: colors.textMuted, paddingVertical: spacing.sm }]}>
                      Data batas kab/kota untuk provinsi ini belum tersedia di dataset (batasan sumber pihak ketiga).
                    </Text>
                  ) : (
                    // Label teks per metrik dipangkas jadi ikon saja (R/S/K
                    // diwakili ikon, bukan kata penuh) — nama & rincian
                    // lengkap muncul lewat tap -> Alert, bukan tertumpuk di kartu.
                    regencyBreakdown.map((regency) => (
                      <TouchableOpacity
                        key={regency.name}
                        activeOpacity={0.7}
                        onPress={() =>
                          Alert.alert(
                            regency.name,
                            `Relawan: ${formatPercent(regency.relawanPercent)}\nSaksi Mandat: ${formatPercent(regency.saksiPercent)}\nKemenangan: ${formatPercent(regency.kemenanganPercent)}`,
                          )
                        }
                        style={[styles.regencyCard, { backgroundColor: colors.background, borderColor: colors.border }]}
                      >
                        <Text style={[styles.regencyName, { color: colors.text }]} numberOfLines={1}>
                          {regency.name}
                        </Text>
                        <View style={styles.regencyMetricsRow}>
                          <View style={styles.regencyMetricItem}>
                            <Feather name="target" size={11} color={regency.relawanTier.color} />
                            <Text style={[styles.regencyMetricValue, { color: regency.relawanTier.color }]}>
                              {formatPercent(regency.relawanPercent)}
                            </Text>
                          </View>
                          <View style={styles.regencyMetricItem}>
                            <Feather name="shield" size={11} color={regency.saksiTier.color} />
                            <Text style={[styles.regencyMetricValue, { color: regency.saksiTier.color }]}>
                              {formatPercent(regency.saksiPercent)}
                            </Text>
                          </View>
                          <View style={styles.regencyMetricItem}>
                            <Feather name="bar-chart-2" size={11} color={regency.kemenanganTier.color} />
                            <Text style={[styles.regencyMetricValue, { color: regency.kemenanganTier.color }]}>
                              {formatPercent(regency.kemenanganPercent)}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))
                  )}
                </>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#091322' },
  topSafeArea: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 30, gap: 8 },
  topBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ? StatusBar.currentHeight + 8 : 36) : 10,
    gap: spacing.sm,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },
  territoryChip: {
    flex: 1,
    height: 44,
    borderRadius: radius.full,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },
  territoryTierTag: { fontSize: 8.5, fontFamily: fonts.bold, letterSpacing: 0.5, marginBottom: 1 },
  territoryChipText: { flex: 1, fontSize: 13, fontFamily: fonts.bold },

  // Dock kanan: tombol ganti mode (posisi FAB, sejajar top bar — bukan
  // menumpuk di bawah chip wilayah seperti sebelumnya)
  rightDockContainer: {
    position: 'absolute',
    top: Platform.OS === 'android' ? (StatusBar.currentHeight ? StatusBar.currentHeight + 62 : 90) : 66,
    right: 14,
    zIndex: 35,
    alignItems: 'center',
    gap: 4,
  },
  dockFabButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 4,
  },
  dockFabCaption: {
    fontSize: 8.5,
    fontFamily: fonts.semiBold,
    textAlign: 'center',
    maxWidth: 64,
  },

  // Dock kiri: legenda warna choropleth
  legendPanel: {
    position: 'absolute',
    top: Platform.OS === 'android' ? (StatusBar.currentHeight ? StatusBar.currentHeight + 62 : 90) : 66,
    left: 14,
    zIndex: 35,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 5,
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 4,
  },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 9.5, fontFamily: fonts.medium, maxWidth: 118 },

  bottomCardContainer: { position: 'absolute', bottom: Platform.OS === 'ios' ? 32 : 24, left: 14, right: 14, zIndex: 40 },
  floatingSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 4,
  },
  cardStatusAccent: { width: 4, alignSelf: 'stretch', borderRadius: 2 },
  cardTierBadge: { fontSize: 10, fontFamily: fonts.bold, letterSpacing: 0.4, textTransform: 'uppercase' },
  cardTitleText: { fontSize: 13.5, fontFamily: fonts.bold, letterSpacing: -0.1 },
  cardSubtitleText: { fontSize: 11, fontFamily: fonts.medium, marginTop: 1 },
  cardActionContainer: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingLeft: 6 },
  cardActionText: { fontSize: 11.5, fontFamily: fonts.bold },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  drawerSheet: { borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, borderTopWidth: 1, paddingHorizontal: spacing.md, paddingBottom: spacing.xl, maxHeight: '82%' },
  drawerHandle: { alignItems: 'center', paddingVertical: 10 },
  drawerHandleBar: { width: 38, height: 4.5, borderRadius: radius.full },
  drawerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: spacing.sm },
  drawerTitle: { fontSize: 15, fontFamily: fonts.bold, flex: 1 },
  optionRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.sm, borderRadius: radius.md, borderWidth: 1, gap: spacing.sm, marginBottom: spacing.xs },
  optionTitle: { fontSize: 13 },
  optionDesc: { fontSize: 10.5 },
  optionValue: { fontSize: 12, fontFamily: fonts.bold },
  tierDot: { width: 10, height: 10, borderRadius: 5 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingBottom: spacing.md },
  kpiCard: { flex: 1, minWidth: '46%', borderRadius: radius.md, borderWidth: 1, borderLeftWidth: 3, padding: spacing.sm, gap: 3 },
  kpiValue: { fontFamily: fonts.bold, fontSize: 18 },
  kpiLabel: { fontFamily: fonts.medium, fontSize: 10.5 },

  sectionSubtitle: { fontFamily: fonts.bold, fontSize: 13, marginTop: spacing.sm, marginBottom: spacing.xs },
  regencyCard: { borderRadius: radius.md, borderWidth: 1, padding: spacing.sm, marginBottom: spacing.xs, gap: 6 },
  regencyName: { fontFamily: fonts.semiBold, fontSize: 12.5 },
  regencyMetricsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  regencyMetricItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  regencyMetricValue: { fontFamily: fonts.bold, fontSize: 12.5 },
});
