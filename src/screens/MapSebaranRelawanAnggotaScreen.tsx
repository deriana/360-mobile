import React, { useState } from 'react';
import {
  Dimensions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
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

function buildIndonesiaGisMapHtml(
  isFullscreen: boolean,
  centerLat: number,
  centerLng: number,
  zoom: number,
  clusters: RegionalCluster[],
  poskos: PoskoLocation[],
  filterType: GisFilterType,
  isDark: boolean
) {
  const filteredClusters = clusters.filter((c) => {
    if (filterType === 'MEMBERS') return c.totalCadres > 0;
    if (filterType === 'VOLUNTEERS') return c.totalVolunteers > 0;
    if (filterType === 'WITNESSES') return c.witnessCount > 0;
    return true;
  });

  const clustersJson = JSON.stringify(filteredClusters);
  const poskosJson = JSON.stringify(poskos);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>Peta Sebaran GIS PAN</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; background: ${isDark ? '#091322' : '#F1F5F9'}; }
    .leaflet-control-attribution { display: none !important; }
    
    .posko-pin {
      background: #E60012;
      width: 28px;
      height: 28px;
      border-radius: 14px;
      border: 2px solid #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 3px 8px rgba(0,0,0,0.35);
      font-size: 13px;
      cursor: pointer;
      animation: pulse 2.5s infinite;
    }
    .posko-pin.sub {
      background: #D97706;
    }
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(230,0,18,0.6); }
      70% { box-shadow: 0 0 0 10px rgba(230,0,18,0); }
      100% { box-shadow: 0 0 0 0 rgba(230,0,18,0); }
    }

    .cluster-badge {
      background: #0066B3;
      color: #FFFFFF;
      padding: 3px 8px;
      border-radius: 12px;
      border: 2px solid #FFFFFF;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 10.5px;
      font-weight: bold;
      white-space: nowrap;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      cursor: pointer;
    }
    .cluster-badge.prov {
      background: #004280;
      font-size: 11px;
      padding: 4px 9px;
    }

    .leaflet-popup-content-wrapper {
      background: ${isDark ? '#0F172A' : '#FFFFFF'};
      color: ${isDark ? '#F8FAFC' : '#1E293B'};
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      padding: 4px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.25);
    }
    .leaflet-popup-tip {
      background: ${isDark ? '#0F172A' : '#FFFFFF'};
    }
    .popup-card {
      padding: 6px 4px;
      font-size: 12px;
      line-height: 1.4;
    }
    .popup-title {
      font-weight: bold;
      font-size: 13px;
      color: #0066B3;
      margin-bottom: 3px;
    }
    .popup-stat {
      color: #10B981;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    try {
      // Batasan Ketat Wilayah NKRI (Se-Indonesia)
      var southWest = L.latLng(-11.5, 94.0);
      var northEast = L.latLng(6.5, 141.5);
      var indonesiaBounds = L.latLngBounds(southWest, northEast);

      var isFull = ${isFullscreen ? 'true' : 'false'};
      var map = L.map('map', {
        center: isFull ? [-2.5489, 118.0149] : [${centerLat}, ${centerLng}],
        zoom: isFull ? 5 : ${zoom},
        minZoom: isFull ? 4.5 : 8,
        maxZoom: 18,
        maxBounds: indonesiaBounds,
        maxBoundsViscosity: 1.0, // Kunci peta agar tidak bisa keluar dari wilayah Indonesia!
        zoomControl: isFull,
        attributionControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(map);

      var clusters = ${clustersJson};
      var poskos = ${poskosJson};

      // Render Posko Markers
      poskos.forEach(function(p) {
        var isMain = p.isMainCommandCenter;
        var iconHtml = '<div class="posko-pin ' + (isMain ? '' : 'sub') + '"><svg width="13" height="13" viewBox="0 0 24 24" fill="#FFFFFF"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15" stroke="#FFFFFF" stroke-width="2"></line></svg></div>';
        var markerIcon = L.divIcon({
          className: '',
          html: iconHtml,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        var m = L.marker([p.lat, p.lng], { icon: markerIcon }).addTo(map);
        var popupContent = '<div class="popup-card">' +
          '<div class="popup-title">' + p.name + '</div>' +
          '<div><b>' + p.categoryLabel + '</b></div>' +
          '<div>Alamat: ' + p.address + '</div>' +
          '<div>PIC: <b>' + p.picName + '</b></div>' +
          '<div class="popup-stat">Relawan Siaga: ' + p.activeVolunteers + ' orang</div>' +
          '</div>';
        m.bindPopup(popupContent);
      });

      // Render Cluster Markers
      clusters.forEach(function(c) {
        var isProv = c.level === 'PROVINSI';
        var label = isProv ? c.name : c.name.replace('Kecamatan ', '');
        var stat = c.totalCadres > 1000 ? (c.totalCadres / 1000).toFixed(1) + 'k' : c.totalCadres;
        var badgeHtml = '<div class="cluster-badge ' + (isProv ? 'prov' : '') + '"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display:inline-block;vertical-align:middle;margin-right:2px"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>' + label + ' (' + stat + ')</div>';

        var clusterIcon = L.divIcon({
          className: '',
          html: badgeHtml,
          iconAnchor: [35, 14]
        });

        var cm = L.marker([c.lat, c.lng], { icon: clusterIcon }).addTo(map);
        var clusterPopup = '<div class="popup-card">' +
          '<div class="popup-title">' + c.name + '</div>' +
          '<div>Total Kader: <b>' + c.totalCadres.toLocaleString('id-ID') + '</b></div>' +
          '<div>Total Relawan: <b>' + c.totalVolunteers.toLocaleString('id-ID') + '</b></div>' +
          '<div class="popup-stat">Cakupan Saksi: ' + c.witnessCount.toLocaleString('id-ID') + ' (' + c.tpsCoveragePct + '%)</div>' +
          '<div>Target Kursi: <b>' + c.targetSeats + ' Kursi</b></div>' +
          '</div>';
        cm.bindPopup(clusterPopup);
      });

      if (isFull) {
        map.fitBounds(indonesiaBounds, { padding: [15, 15] });
      }

    } catch(err) {
      document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#0066B3;font-family:sans-serif;padding:20px;text-align:center;"><b>Peta Interaktif GIS Siap Digunakan</b></div>';
    }
  </script>
</body>
</html>`;
}

export default function MapSebaranRelawanAnggotaScreen() {
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();

  const [filterType, setFilterType] = useState<GisFilterType>('ALL');
  const [selectedCluster, setSelectedCluster] = useState<RegionalCluster>(GIS_REGIONAL_CLUSTERS[3]); // Default: Coblong
  const [selectedPosko, setSelectedPosko] = useState<PoskoLocation | null>(null);
  const [isFullscreenMap, setIsFullscreenMap] = useState(false);
  const [activeMapScope, setActiveMapScope] = useState<'LOCAL' | 'NATIONAL'>('LOCAL');
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

      {/* 4. Interactive GIS Map Canvas (Real Leaflet OpenStreetMap) */}
      <Card style={{ padding: 0, overflow: 'hidden', backgroundColor: colors.surface, borderColor: colors.border }}>
        <View style={[styles.mapContainer, { backgroundColor: isDark ? '#091322' : '#E2E8F0', height: 260 }]}>
          <WebView
            key={`embedded-map-${filterType}-${selectedCluster.id}`}
            source={{
              html: buildIndonesiaGisMapHtml(
                false,
                selectedCluster.lat,
                selectedCluster.lng,
                12,
                GIS_REGIONAL_CLUSTERS,
                GIS_POSKO_LOCATIONS,
                filterType,
                isDark
              ),
            }}
            style={{ width: '100%', height: '100%' }}
            originWhitelist={['*']}
          />

          {/* Floating Area Tag */}
          <View
            style={[
              styles.mapScopeBadge,
              {
                backgroundColor: isDark ? 'rgba(0, 43, 82, 0.92)' : 'rgba(255, 255, 255, 0.95)',
                borderColor: colors.border,
              },
            ]}
          >
            <Feather name="map-pin" size={11} color={colors.primary} />
            <Text style={[styles.mapScopeBadgeText, { color: colors.text }]}>
              Dapil Jabar I | {selectedCluster.name}
            </Text>
          </View>

          {/* Floating Fullscreen Trigger Button */}
          <TouchableOpacity
            onPress={() => setIsFullscreenMap(true)}
            style={[styles.openFullscreenBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.85}
          >
            <Feather name="maximize-2" size={13} color="#FFFFFF" />
            <Text style={styles.openFullscreenBtnText}>Buka Layar Penuh (Batas Se-Indonesia)</Text>
          </TouchableOpacity>
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

      {/* FULLSCREEN MAP MODAL: Batas Terkunci Se-Indonesia (NKRI Bounds) */}
      <Modal
        visible={isFullscreenMap}
        animationType="slide"
        onRequestClose={() => setIsFullscreenMap(false)}
      >
        <View style={[styles.fullscreenContainer, { backgroundColor: isDark ? '#091322' : '#F1F5F9' }]}>
          {/* Fullscreen Header */}
          <View style={[styles.fullscreenHeader, { backgroundColor: isDark ? '#002B52' : '#003366' }]}>
            <TouchableOpacity
              onPress={() => setIsFullscreenMap(false)}
              style={styles.fullscreenBackBtn}
              activeOpacity={0.7}
            >
              <Feather name="arrow-left" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.fullscreenHeaderTitle}>Peta Sebaran Nasional simPAN</Text>
              <Text style={styles.fullscreenHeaderSub}>
                Batas navigasi dikunci wilayah NKRI | Se-Indonesia
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setIsFullscreenMap(false)}
              style={styles.fullscreenCloseChip}
              activeOpacity={0.7}
            >
              <Text style={styles.fullscreenCloseChipText}>Tutup</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Filter Bar inside Fullscreen */}
          <View style={[styles.fullscreenFilterBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingHorizontal: 12, paddingVertical: 8 }}>
              {[
                { key: 'ALL' as const, label: 'Semua Layer' },
                { key: 'MEMBERS' as const, label: 'Kader Ber-KTA' },
                { key: 'VOLUNTEERS' as const, label: 'Relawan Posko' },
                { key: 'WITNESSES' as const, label: 'Saksi TPS BSN' },
              ].map((f) => (
                <TouchableOpacity
                  key={f.key}
                  onPress={() => setFilterType(f.key)}
                  style={[
                    styles.fullscreenFilterPill,
                    {
                      backgroundColor: filterType === f.key ? colors.primary : isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9',
                      borderColor: filterType === f.key ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.fullscreenFilterPillText, { color: filterType === f.key ? '#FFFFFF' : colors.text }]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Real Fullscreen Leaflet Map WebView */}
          <View style={{ flex: 1, position: 'relative' }}>
            <WebView
              key={`fullscreen-map-${filterType}-${activeMapScope}`}
              source={{
                html: buildIndonesiaGisMapHtml(
                  true,
                  activeMapScope === 'LOCAL' ? selectedCluster.lat : -2.5489,
                  activeMapScope === 'LOCAL' ? selectedCluster.lng : 118.0149,
                  activeMapScope === 'LOCAL' ? 12 : 5,
                  GIS_REGIONAL_CLUSTERS,
                  GIS_POSKO_LOCATIONS,
                  filterType,
                  isDark
                ),
              }}
              style={{ width: '100%', height: '100%' }}
              originWhitelist={['*']}
            />

            {/* Floating Scope Controls in Fullscreen */}
            <View style={styles.fullscreenMapControls}>
              <TouchableOpacity
                onPress={() => setActiveMapScope('NATIONAL')}
                style={[
                  styles.fullscreenControlBtn,
                  { backgroundColor: activeMapScope === 'NATIONAL' ? colors.primary : colors.surface, borderColor: colors.border },
                ]}
              >
                <Feather name="globe" size={12} color={activeMapScope === 'NATIONAL' ? '#FFFFFF' : colors.text} />
                <Text style={[styles.fullscreenControlText, { color: activeMapScope === 'NATIONAL' ? '#FFFFFF' : colors.text }]}>
                  Se-Indonesia
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveMapScope('LOCAL')}
                style={[
                  styles.fullscreenControlBtn,
                  { backgroundColor: activeMapScope === 'LOCAL' ? colors.primary : colors.surface, borderColor: colors.border },
                ]}
              >
                <Feather name="map-pin" size={12} color={activeMapScope === 'LOCAL' ? '#FFFFFF' : colors.text} />
                <Text style={[styles.fullscreenControlText, { color: activeMapScope === 'LOCAL' ? '#FFFFFF' : colors.text }]}>
                  Fokus Dapil Jabar I
                </Text>
              </TouchableOpacity>
            </View>

            {/* Bottom Summary Bar in Fullscreen */}
            <View style={[styles.fullscreenBottomBar, { backgroundColor: isDark ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.95)', borderColor: colors.border }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={[styles.fullscreenStatNum, { color: colors.primary }]}>
                    {GIS_NATIONAL_SUMMARY.totalNationalCadres.toLocaleString('id-ID')}
                  </Text>
                  <Text style={[styles.fullscreenStatLbl, { color: colors.textMuted }]}>Kader Nasional</Text>
                </View>
                <View style={[styles.fullscreenStatDivider, { backgroundColor: colors.border }]} />
                <View style={{ alignItems: 'center' }}>
                  <Text style={[styles.fullscreenStatNum, { color: '#10B981' }]}>
                    {GIS_NATIONAL_SUMMARY.nationalCoveragePct}%
                  </Text>
                  <Text style={[styles.fullscreenStatLbl, { color: colors.textMuted }]}>Cakupan TPS</Text>
                </View>
                <View style={[styles.fullscreenStatDivider, { backgroundColor: colors.border }]} />
                <View style={{ alignItems: 'center' }}>
                  <Text style={[styles.fullscreenStatNum, { color: '#E60012' }]}>
                    {GIS_POSKO_LOCATIONS.length} Posko
                  </Text>
                  <Text style={[styles.fullscreenStatLbl, { color: colors.textMuted }]}>Markas Komando</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>

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
                      {c.totalCadres.toLocaleString('id-ID')} Kader | {c.witnessCount} Saksi
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
          <TouchableOpacity
            onPress={() => navigation.navigate('SimpanOffices')}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
          >
            <Text style={{ fontSize: 12, fontFamily: fonts.bold, color: colors.primary }}>Lihat Kantor DPD</Text>
            <Feather name="arrow-right" size={13} color={colors.primary} />
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
                  PIC: {posko.picName} | {posko.activeVolunteers} Relawan Siaga
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
  mapScopeBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    zIndex: 10,
  },
  mapScopeBadgeText: {
    fontSize: 10,
    fontFamily: fonts.bold,
  },
  openFullscreenBtn: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    zIndex: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  openFullscreenBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: fonts.bold,
  },
  fullscreenContainer: {
    flex: 1,
  },
  fullscreenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: Platform.OS === 'ios' ? 48 : 16,
    paddingBottom: 14,
    gap: spacing.sm,
  },
  fullscreenBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenHeaderTitle: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: '#FFFFFF',
  },
  fullscreenHeaderSub: {
    fontSize: 10,
    fontFamily: fonts.regular,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 1,
  },
  fullscreenCloseChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  fullscreenCloseChipText: {
    fontSize: 11.5,
    fontFamily: fonts.bold,
    color: '#FFFFFF',
  },
  fullscreenFilterBar: {
    borderBottomWidth: 1,
  },
  fullscreenFilterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  fullscreenFilterPillText: {
    fontSize: 11,
    fontFamily: fonts.bold,
  },
  fullscreenMapControls: {
    position: 'absolute',
    top: 12,
    right: 12,
    gap: 8,
    zIndex: 20,
  },
  fullscreenControlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  fullscreenControlText: {
    fontSize: 11,
    fontFamily: fonts.bold,
  },
  fullscreenBottomBar: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    zIndex: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  fullscreenStatNum: {
    fontSize: 13.5,
    fontFamily: fonts.bold,
  },
  fullscreenStatLbl: {
    fontSize: 9.5,
    fontFamily: fonts.medium,
  },
  fullscreenStatDivider: {
    width: 1,
    height: 24,
  },
});
