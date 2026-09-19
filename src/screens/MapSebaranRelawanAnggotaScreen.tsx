import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
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
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { fonts, radius, spacing } from '../theme';
import {
  GisLayerMode,
  gisDistributionService,
} from '../services/gisDistributionService';
import { buildIndonesiaGisMapHtml } from '../utils/gisHtmlBuilder';
import GisScorecardInspector from '../components/gis/GisScorecardInspector';
import PoskoActionSheet from '../components/gis/PoskoActionSheet';
import {
  GIS_NATIONAL_SUMMARY,
  PoskoDesaItem,
  PoskoLocation,
  RegionalCluster,
} from '../data/gisRegionalData';
import { KantorSekretariat } from '../data/simpan';
import { PAN_MEMBER_CLUSTERS } from '../data/panMemberDistributionData';
import { INDONESIA_GEOJSON } from '../data/indonesiaGeojsonData';

export type GisDrillTier = 'NATIONAL' | 'PROVINCE' | 'REGENCY' | 'DISTRICT';

export default function MapSebaranRelawanAnggotaScreen() {
  const navigation = useNavigation<any>();
  const { role } = useApp();
  const { colors, isDark } = useTheme();
  const webViewRef = useRef<WebView>(null);

  // Data State
  const [clusters, setClusters] = useState<RegionalCluster[]>([]);
  const [poskos, setPoskos] = useState<PoskoLocation[]>([]);
  const [poskoDesasList, setPoskoDesasList] = useState<PoskoDesaItem[]>([]);
  const [offices, setOffices] = useState<KantorSekretariat[]>([]);
  const [selectedCluster, setSelectedCluster] = useState<RegionalCluster | null>(null);

  // Camera Focus State (Role-Adaptive Initial Scoping)
  const defaultFocus = useMemo(() => {
    return gisDistributionService.getCameraFocusByRole(role);
  }, [role]);

  // 4-Tier Hierarchical State (Nasional > Provinsi > Kab/Kota > Kecamatan & Posko Desa)
  const [drillTier, setDrillTier] = useState<GisDrillTier>(
    defaultFocus.scopeLevel === 'POSKO' || defaultFocus.scopeLevel === 'DISTRICT'
      ? 'DISTRICT'
      : defaultFocus.scopeLevel === 'REGENCY'
      ? 'REGENCY'
      : defaultFocus.scopeLevel === 'PROVINCE'
      ? 'PROVINCE'
      : 'NATIONAL'
  );
  const [activeProvince, setActiveProvince] = useState<RegionalCluster | null>(null);
  const [activeRegency, setActiveRegency] = useState<RegionalCluster | null>(null);
  const [activeDistrict, setActiveDistrict] = useState<RegionalCluster | null>(null);

  // Modals & Sheets State
  const [activeLayer, setActiveLayer] = useState<GisLayerMode>('ALL');
  const [isLayerSheetVisible, setIsLayerSheetVisible] = useState(false);
  const [isRegionSheetVisible, setIsRegionSheetVisible] = useState(false);
  const [isScorecardVisible, setIsScorecardVisible] = useState(false);
  const [actionSheetData, setActionSheetData] = useState<{
    visible: boolean;
    posko: PoskoLocation | null;
    office: KantorSekretariat | null;
  }>({ visible: false, posko: null, office: null });

  // Right-side floating action dock collapse/expand state
  const [isDockExpanded, setIsDockExpanded] = useState(true);

  const [currentCamera, setCurrentCamera] = useState({
    lat: defaultFocus.lat,
    lng: defaultFocus.lng,
    zoom: defaultFocus.zoom,
    label: defaultFocus.label,
  });

  const isGrassroots = role === 'VOLUNTEER' || role === 'MEMBER';

  // Load Data on Mount (Cache-First)
  useEffect(() => {
    let isMounted = true;
    Promise.all([
      gisDistributionService.getRegionalClusters(),
      gisDistributionService.getPoskoLocations(),
    ]).then(([clusterData, poskoData]) => {
      if (isMounted) {
        setClusters(clusterData);
        setPoskos(poskoData);
        setOffices(gisDistributionService.getOfficialOffices());
        const allDesas = gisDistributionService.getPoskoDesaList();
        setPoskoDesasList(allDesas);

        // Inisialisasi kluster awal sesuai fokus
        const match = clusterData.find((c) => c.name.toLowerCase().includes('coblong')) || clusterData[0];
        setSelectedCluster(match || null);
        if (match) {
          if (match.level === 'KECAMATAN') {
            setActiveDistrict(match);
            const parentReg = clusterData.find(c => c.level === 'KAB_KOTA' && (c.name.toLowerCase().includes('bandung') || match.parentRegion?.toLowerCase().includes(c.name.toLowerCase())));
            if (parentReg) setActiveRegency(parentReg);
            const parentProv = clusterData.find(c => c.level === 'PROVINSI' && c.name.toLowerCase().includes('jawa barat'));
            if (parentProv) setActiveProvince(parentProv);
          }
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Helper Drill-Down ke Tier Tertentu
  const drillDownTo = (tier: GisDrillTier, cluster: RegionalCluster, targetZoom: number) => {
    setSelectedCluster(cluster);
    setCurrentCamera({
      lat: cluster.lat,
      lng: cluster.lng,
      zoom: targetZoom,
      label: cluster.name,
    });

    if (tier === 'PROVINCE') {
      setDrillTier('PROVINCE');
      setActiveProvince(cluster);
      setActiveRegency(null);
      setActiveDistrict(null);
    } else if (tier === 'REGENCY') {
      setDrillTier('REGENCY');
      setActiveRegency(cluster);
      setActiveDistrict(null);
      if (!activeProvince && cluster.parentRegion) {
        const foundProv = clusters.find(c => c.level === 'PROVINSI' && cluster.parentRegion?.toLowerCase().includes(c.name.toLowerCase()));
        if (foundProv) setActiveProvince(foundProv);
      }
    } else if (tier === 'DISTRICT') {
      setDrillTier('DISTRICT');
      setActiveDistrict(cluster);
      if (!activeRegency && cluster.parentRegion) {
        const foundReg = clusters.find(c => c.level === 'KAB_KOTA' && cluster.parentRegion?.toLowerCase().includes(c.name.toLowerCase()));
        if (foundReg) setActiveRegency(foundReg);
      }
    }

    if (webViewRef.current) {
      const script = `if (window.panFlyTo) { window.panFlyTo(${cluster.lat}, ${cluster.lng}, ${targetZoom}); }`;
      webViewRef.current.injectJavaScript(script);
    }
  };

  // Navigasi Bertahap Mundur (Hardware Back & Header Back Button)
  const handleBackStep = (): boolean => {
    if (drillTier === 'DISTRICT') {
      setDrillTier('REGENCY');
      setActiveDistrict(null);
      if (activeRegency) {
        setSelectedCluster(activeRegency);
        setCurrentCamera({
          lat: activeRegency.lat,
          lng: activeRegency.lng,
          zoom: 11.2,
          label: activeRegency.name,
        });
        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(`if (window.panFlyTo) { window.panFlyTo(${activeRegency.lat}, ${activeRegency.lng}, 11.2); }`);
        }
      } else {
        setDrillTier('PROVINCE');
        if (activeProvince) {
          setSelectedCluster(activeProvince);
          setCurrentCamera({
            lat: activeProvince.lat,
            lng: activeProvince.lng,
            zoom: 8.5,
            label: activeProvince.name,
          });
          if (webViewRef.current) {
            webViewRef.current.injectJavaScript(`if (window.panFlyTo) { window.panFlyTo(${activeProvince.lat}, ${activeProvince.lng}, 8.5); }`);
          }
        }
      }
      return true;
    }

    if (drillTier === 'REGENCY') {
      setDrillTier('PROVINCE');
      setActiveRegency(null);
      if (activeProvince) {
        setSelectedCluster(activeProvince);
        setCurrentCamera({
          lat: activeProvince.lat,
          lng: activeProvince.lng,
          zoom: 8.5,
          label: activeProvince.name,
        });
        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(`if (window.panFlyTo) { window.panFlyTo(${activeProvince.lat}, ${activeProvince.lng}, 8.5); }`);
        }
      } else {
        setDrillTier('NATIONAL');
        setCurrentCamera({
          lat: -2.5,
          lng: 118.0,
          zoom: 5.0,
          label: 'Nasional (38 DPW)',
        });
        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(`if (window.panFlyTo) { window.panFlyTo(-2.5, 118.0, 5.0); }`);
        }
      }
      return true;
    }

    if (drillTier === 'PROVINCE') {
      setDrillTier('NATIONAL');
      setActiveProvince(null);
      setCurrentCamera({
        lat: -2.5,
        lng: 118.0,
        zoom: 5.0,
        label: 'Nasional (38 DPW)',
      });
      if (webViewRef.current) {
        webViewRef.current.injectJavaScript(`if (window.panFlyTo) { window.panFlyTo(-2.5, 118.0, 5.0); }`);
      }
      return true;
    }

    // Jika sudah di level Nasional: keluar dari screen
    navigation.goBack();
    return true;
  };

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      return handleBackStep();
    });
    return () => subscription.remove();
  }, [drillTier, activeRegency, activeProvince]);

  // Handle Posko Desa Aksi Lembar
  const handleSelectPoskoDesa = (desa: PoskoDesaItem) => {
    setIsScorecardVisible(false);
    setActionSheetData({
      visible: true,
      posko: {
        id: desa.id,
        name: `Posko ${desa.villageName}`,
        category: 'POSKO_WARGA',
        categoryLabel: 'Posko Desa Siaga (Level 4)',
        address: `${desa.villageName}, ${desa.districtName}, ${desa.regencyName}`,
        district: desa.districtName,
        regency: desa.regencyName,
        lat: desa.lat,
        lng: desa.lng,
        activeVolunteers: desa.registeredVolunteers,
        picName: `${desa.coordinatorName} (${desa.skStatus})`,
        phone: desa.coordinatorPhone || '0812-9900-1122',
        isMainCommandCenter: false,
      },
      office: null,
    });
  };

  // Handle Event Bridge dari WebView Leaflet
  const handleWebViewMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);

      if (message.type === 'DRILL_DOWN') {
        const category = message.category;
        const data = message.data;

        if (category === 'PROVINCE') {
          const cl = data.cluster || clusters.find(c => c.name.toLowerCase().includes(data.name?.toLowerCase?.() || '')) || data;
          if (cl && cl.lat) {
            drillDownTo('PROVINCE', cl, 8.5);
          }
          if (!isGrassroots && cl) {
            setIsScorecardVisible(true);
          }
        } else if (category === 'REGENCY') {
          const cl = data.cluster || clusters.find(c => c.name.toLowerCase().includes(data.name?.toLowerCase?.() || '')) || data;
          if (cl && cl.lat) {
            drillDownTo('REGENCY', cl, 11.2);
          }
          if (!isGrassroots && cl) {
            setIsScorecardVisible(true);
          }
        } else if (category === 'DISTRICT') {
          const cl = data.cluster || clusters.find(c => c.name.toLowerCase().includes(data.name?.toLowerCase?.() || '')) || data;
          if (cl && cl.lat) {
            drillDownTo('DISTRICT', cl, 13.5);
          }
          setIsScorecardVisible(true);
        }
      } else if (message.type === 'PROVINCE_TAP') {
        const provName = message.data.name;
        const cl = message.data.cluster || clusters.find(c => c.name.toLowerCase().includes(provName.toLowerCase()));
        if (cl) {
          drillDownTo('PROVINCE', cl, 8.5);
        } else {
          setCurrentCamera((prev) => ({
            ...prev,
            label: provName,
            lat: message.data.lat,
            lng: message.data.lng,
            zoom: 8.5,
          }));
        }
        if (!isGrassroots && cl) {
          setIsScorecardVisible(true);
        }
      } else if (message.type === 'MAP_VIEWPORT_CHANGE') {
        const z = message.data.zoom;
        if (z < 7.5 && drillTier !== 'NATIONAL') {
          setDrillTier('NATIONAL');
          setActiveProvince(null);
          setActiveRegency(null);
          setActiveDistrict(null);
          setCurrentCamera((prev) => ({
            ...prev,
            zoom: z,
            label: 'Nasional (38 DPW)',
          }));
        } else if (z >= 7.5 && z < 10.5 && drillTier !== 'PROVINCE' && drillTier !== 'NATIONAL') {
          setDrillTier('PROVINCE');
          setActiveDistrict(null);
          setActiveRegency(null);
        }
      } else if (message.type === 'MARKER_CLICK') {
        if (message.category === 'POSKO') {
          setActionSheetData({
            visible: true,
            posko: message.data as PoskoLocation,
            office: null,
          });
        } else if (message.category === 'OFFICE') {
          setActionSheetData({
            visible: true,
            posko: null,
            office: message.data as KantorSekretariat,
          });
        } else if (message.category === 'POSKO_DESA') {
          handleSelectPoskoDesa(message.data as PoskoDesaItem);
        } else if (message.category === 'CLUSTER') {
          const cl = message.data as RegionalCluster;
          setSelectedCluster(cl);
          if (cl.level === 'PROVINSI') drillDownTo('PROVINCE', cl, 8.5);
          else if (cl.level === 'KAB_KOTA') drillDownTo('REGENCY', cl, 11.2);
          else if (cl.level === 'KECAMATAN') drillDownTo('DISTRICT', cl, 13.5);

          if (isGrassroots) {
            const matchingPosko = poskos.find((p) =>
              p.district.toLowerCase().includes(cl.name.toLowerCase()) ||
              p.regency.toLowerCase().includes(cl.name.toLowerCase()) ||
              cl.name.toLowerCase().includes(p.district.toLowerCase())
            );
            const matchingOffice = offices.find((o) =>
              o.kota.toLowerCase().includes(cl.name.toLowerCase()) ||
              o.provinsi.toLowerCase().includes(cl.name.toLowerCase())
            );

            if (matchingPosko) {
              setActionSheetData({ visible: true, posko: matchingPosko, office: null });
            } else if (matchingOffice) {
              setActionSheetData({ visible: true, posko: null, office: matchingOffice });
            } else if (poskos.length > 0) {
              setActionSheetData({ visible: true, posko: poskos[0], office: null });
            }
          } else {
            setIsScorecardVisible(true);
          }
        }
      }
    } catch (err) {
      console.warn('[MapWebView] Error handling message:', err);
    }
  };

  // Pusatkan Kembali Kamera ke Wilayah Penugasan Akun
  const handleCenterToAssignment = () => {
    setCurrentCamera({
      lat: defaultFocus.lat,
      lng: defaultFocus.lng,
      zoom: defaultFocus.zoom,
      label: defaultFocus.label,
    });

    if (webViewRef.current) {
      const script = `if (window.panFlyTo) { window.panFlyTo(${defaultFocus.lat}, ${defaultFocus.lng}, ${defaultFocus.zoom}); }`;
      webViewRef.current.injectJavaScript(script);
    }
  };

  // Pilih Wilayah dari Chip Atas / Modal Selector
  const handleSelectRegionScope = (cluster: RegionalCluster) => {
    setIsRegionSheetVisible(false);
    const targetZoom = cluster.level === 'PROVINSI' ? 8.5 : cluster.level === 'KAB_KOTA' ? 11.2 : 13.5;
    const targetTier: GisDrillTier = cluster.level === 'PROVINSI' ? 'PROVINCE' : cluster.level === 'KAB_KOTA' ? 'REGENCY' : 'DISTRICT';
    drillDownTo(targetTier, cluster, targetZoom);
  };

  const handleSelectNationalScope = () => {
    setIsRegionSheetVisible(false);
    setDrillTier('NATIONAL');
    setActiveProvince(null);
    setActiveRegency(null);
    setActiveDistrict(null);
    setCurrentCamera({
      lat: -2.5,
      lng: 118.0,
      zoom: 5.0,
      label: 'Nasional (38 DPW)',
    });
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`if (window.panFlyTo) { window.panFlyTo(-2.5, 118.0, 5.0); }`);
    }
  };

  // Sub-Clusters untuk Drill-Down di Scorecard
  const activeSubClusters = useMemo(() => {
    if (drillTier === 'PROVINCE' && activeProvince) {
      const provClean = activeProvince.name.toLowerCase().replace('provinsi', '').trim();
      const kabList = clusters.filter(c => c.level === 'KAB_KOTA' && (
        !c.parentRegion || c.parentRegion.toLowerCase().includes(provClean) || provClean.includes(c.parentRegion.toLowerCase())
      ));
      return kabList.length > 0 ? kabList : clusters.filter(c => c.level === 'KAB_KOTA');
    }
    if (drillTier === 'REGENCY' && activeRegency) {
      const regClean = activeRegency.name.toLowerCase().replace('kabupaten', '').replace('kab.', '').replace('kota', '').trim();
      const kecList = clusters.filter(c => c.level === 'KECAMATAN' && (
        !c.parentRegion || c.parentRegion.toLowerCase().includes(regClean) || regClean.includes(c.parentRegion.toLowerCase())
      ));
      return kecList.length > 0 ? kecList : clusters.filter(c => c.level === 'KECAMATAN');
    }
    if (drillTier === 'NATIONAL') {
      return clusters.filter(c => c.level === 'PROVINSI');
    }
    return [];
  }, [drillTier, activeProvince, activeRegency, clusters]);

  // Posko Desa Aktif (Level 4)
  const currentPoskoDesas = useMemo(() => {
    const query = activeDistrict ? activeDistrict.name : (selectedCluster ? selectedCluster.name : 'Saguling');
    return gisDistributionService.getPoskoDesaList(query);
  }, [activeDistrict, selectedCluster]);

  // Pimpinan Wilayah Sesuai Tier
  const currentLeader = useMemo(() => {
    const targetName = activeDistrict?.name || activeRegency?.name || activeProvince?.name || selectedCluster?.name;
    return gisDistributionService.getRegionalLeader(targetName);
  }, [activeDistrict, activeRegency, activeProvince, selectedCluster]);

  // Hitung Metrik 4 Pilar untuk Kluster Terpilih
  const activeMetrics = useMemo(() => {
    if (!selectedCluster) return null;
    return gisDistributionService.calculateFourPillars(selectedCluster, activeLayer);
  }, [selectedCluster, activeLayer]);

  // Label Dinamis untuk Chip Teritori di Header
  const topChipLabel = useMemo(() => {
    if (drillTier === 'DISTRICT' && activeDistrict) {
      return `Kec. ${activeDistrict.name.replace(/kecamatan /i, '').replace(/kec\. /i, '')}`;
    }
    if (drillTier === 'REGENCY' && activeRegency) {
      return activeRegency.name.replace(/ \(.*\)/, '');
    }
    if (drillTier === 'PROVINCE' && activeProvince) {
      return activeProvince.name;
    }
    return currentCamera.label || 'Nasional (38 DPW)';
  }, [drillTier, activeDistrict, activeRegency, activeProvince, currentCamera.label]);

  const topChipTierTag = useMemo(() => {
    switch (drillTier) {
      case 'DISTRICT':
        return 'TINGKAT KECAMATAN (PAC)';
      case 'REGENCY':
        return 'TINGKAT KAB/KOTA (DPC)';
      case 'PROVINCE':
        return 'TINGKAT PROVINSI (DPW)';
      default:
        return 'TINGKAT NASIONAL (38 DPW)';
    }
  }, [drillTier]);

  // Label Dinamis untuk Status Pill di Kiri Bawah (Role-Adaptive)
  const statusPillText = useMemo(() => {
    if (isGrassroots) {
      if (role === 'VOLUNTEER') {
        const nearestPosko = poskos[0];
        if (nearestPosko) {
          return `Posko ${nearestPosko.district} • ${nearestPosko.activeVolunteers} Relawan Siaga`;
        }
        return 'Posko Relawan Siaga • GPS Navigasi';
      }
      return 'Kantor Sekretariat Terdekat • Layanan KTA';
    }

    // Role Manajerial / Caleg / Bappilu
    if (activeLayer === 'MEMBERS') {
      return `${(GIS_NATIONAL_SUMMARY.totalNationalCadres / 1000000).toFixed(1)}M+ Anggota Resmi simPAN`;
    }
    if (activeLayer === 'VOLUNTEERS') {
      return `${(GIS_NATIONAL_SUMMARY.totalNationalVolunteers / 1000).toFixed(0)}K Relawan Posko Aktif`;
    }
    return `${(GIS_NATIONAL_SUMMARY.totalNationalCadres / 1000000).toFixed(1)}M+ Kader & ${(GIS_NATIONAL_SUMMARY.totalNationalVolunteers / 1000).toFixed(0)}K Relawan`;
  }, [isGrassroots, role, poskos, activeLayer]);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        translucent
        backgroundColor="transparent"
      />

      {/* 1. KANVAS PETA LEAFLET (FULLSCREEN VIEWPORT) */}
      <View style={StyleSheet.absoluteFill}>
        <WebView
          ref={webViewRef}
          key={`leaflet-map-${activeLayer}`}
          source={{
            html: buildIndonesiaGisMapHtml({
              centerLat: currentCamera.lat,
              centerLng: currentCamera.lng,
              zoom: currentCamera.zoom,
              clusters,
              poskos,
              poskoDesas: poskoDesasList,
              offices,
              memberClusters: PAN_MEMBER_CLUSTERS,
              geoJsonData: INDONESIA_GEOJSON,
              filterType: activeLayer,
              isDark,
            }),
          }}
          style={StyleSheet.absoluteFill}
          onMessage={handleWebViewMessage}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          scrollEnabled={false}
        />
      </View>

      {/* 2. TOP FLOATING BAR (HEADER TUNGGAL TERPADU - HIERARCHICAL DRILL-DOWN STEP) */}
      <SafeAreaView style={styles.topSafeArea}>
        <View style={styles.topBarRow}>
          <TouchableOpacity
            onPress={handleBackStep}
            style={[
              styles.floatingBackButton,
              {
                backgroundColor: isDark ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.95)',
                borderColor: colors.border,
              },
            ]}
            activeOpacity={0.8}
          >
            <Feather name="arrow-left" size={20} color={colors.text} />
          </TouchableOpacity>

          {/* Chip Teritori Tunggal dengan Badge Tingkatan */}
          <TouchableOpacity
            onPress={() => setIsRegionSheetVisible(true)}
            style={[
              styles.territoryChip,
              {
                backgroundColor: isDark ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.95)',
                borderColor: colors.border,
              },
            ]}
            activeOpacity={0.8}
          >
            <View style={styles.statusDot} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.territoryTierTag, { color: '#38BDF8' }]}>
                {topChipTierTag}
              </Text>
              <Text style={[styles.territoryChipText, { color: colors.text }]} numberOfLines={1}>
                {topChipLabel}
              </Text>
            </View>
            <Feather name="chevron-down" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* 3. FLOATING RIGHT ACTION DOCK (RINGKAS: TOGGLE + LAYER + LOKASI) */}
      <View style={styles.rightDockContainer}>
        {/* Toggle Collapse/Expand Button */}
        <TouchableOpacity
          onPress={() => setIsDockExpanded((prev) => !prev)}
          style={[
            styles.dockToggleButton,
            {
              backgroundColor: isDark ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.95)',
              borderColor: colors.border,
            },
          ]}
          activeOpacity={0.8}
        >
          <Feather
            name={isDockExpanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={colors.text}
          />
        </TouchableOpacity>

        {isDockExpanded && (
          <View style={styles.dockItemsStack}>
            {/* Tombol 1: Layer */}
            <TouchableOpacity
              onPress={() => setIsLayerSheetVisible(true)}
              style={[
                styles.dockCardButton,
                {
                  backgroundColor: isDark ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.95)',
                  borderColor: colors.border,
                },
              ]}
              activeOpacity={0.8}
            >
              <Feather name="layers" size={20} color="#0066B3" />
              <Text style={[styles.dockCardLabel, { color: colors.text }]}>Layer</Text>
            </TouchableOpacity>

            {/* Tombol 2: Lokasi (Pusatkan ke Penugasan Akun) */}
            <TouchableOpacity
              onPress={handleCenterToAssignment}
              style={[
                styles.dockCardButton,
                {
                  backgroundColor: isDark ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.95)',
                  borderColor: colors.border,
                },
              ]}
              activeOpacity={0.8}
            >
              <Feather name="crosshair" size={20} color="#0066B3" />
              <Text style={[styles.dockCardLabel, { color: colors.text }]}>Lokasi</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 4. FLOATING BOTTOM-LEFT STATUS PILL */}
      <View style={styles.bottomLeftContainer}>
        <TouchableOpacity
          onPress={() => {
            if (isGrassroots) {
              if (role === 'VOLUNTEER' && poskos.length > 0) {
                setActionSheetData({ visible: true, posko: poskos[0], office: null });
              } else if (offices.length > 0) {
                setActionSheetData({ visible: true, posko: null, office: offices[0] });
              }
            } else if (selectedCluster) {
              setIsScorecardVisible(true);
            }
          }}
          style={[
            styles.statusPill,
            {
              backgroundColor: isDark ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.95)',
              borderColor: colors.border,
            },
          ]}
          activeOpacity={0.85}
        >
          <View style={styles.pulsingRedDot} />
          <Text style={[styles.statusPillText, { color: colors.text }]} numberOfLines={1}>
            {statusPillText}
          </Text>
          <Feather
            name={isGrassroots ? 'navigation' : 'bar-chart-2'}
            size={13}
            color="#0066B3"
          />
        </TouchableOpacity>
      </View>

      {/* 5. MODAL SHEET: PILIH LAPISAN DATA (LAYER) */}
      <Modal
        visible={isLayerSheetVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsLayerSheetVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.drawerSheet,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.drawerHandle}>
              <View style={[styles.drawerHandleBar, { backgroundColor: colors.border }]} />
            </View>

            <View style={styles.drawerHeader}>
              <Text style={[styles.drawerTitle, { color: colors.text }]}>Pilih Lapisan Data Peta</Text>
              <TouchableOpacity onPress={() => setIsLayerSheetVisible(false)}>
                <Feather name="x" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={{ gap: spacing.sm, paddingVertical: spacing.sm }}>
              {[
                {
                  key: 'ALL' as const,
                  label: 'Kekuatan Terpadu',
                  desc: 'Seluruh kader ber-KTA, relawan posko, dan saksi TPS BSN',
                  icon: 'grid',
                },
                {
                  key: 'MEMBERS' as const,
                  label: 'Anggota Resmi PAN (simPAN)',
                  desc: 'Kader ber-e-KTA simPAN & Kantor Sekretariat Resmi DPP/DPW/DPD',
                  icon: 'credit-card',
                },
                {
                  key: 'VOLUNTEERS' as const,
                  label: 'Relawan Posko Lapangan',
                  desc: 'Relawan siaga posko warga, rumah aspirasi, dan tim pengawal suara',
                  icon: 'heart',
                },
                {
                  key: 'WITNESSES' as const,
                  label: 'Saksi TPS Mandat BSN',
                  desc: 'Cakupan kesiapan saksi resmi mandat BSN di bilik TPS',
                  icon: 'check-circle',
                },
              ].map((opt) => {
                const isSelected = activeLayer === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    onPress={() => {
                      setActiveLayer(opt.key);
                      setIsLayerSheetVisible(false);
                    }}
                    style={[
                      styles.layerOptionCard,
                      {
                        backgroundColor: isSelected
                          ? isDark ? 'rgba(0,102,179,0.18)' : '#F0F9FF'
                          : isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
                        borderColor: isSelected ? '#0066B3' : colors.border,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.layerIconBox,
                        { backgroundColor: isSelected ? '#0066B3' : 'rgba(0,102,179,0.1)' },
                      ]}
                    >
                      <Feather
                        name={opt.icon as any}
                        size={18}
                        color={isSelected ? '#FFFFFF' : '#0066B3'}
                      />
                    </View>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text
                        style={[
                          styles.layerOptionTitle,
                          { color: colors.text, fontFamily: isSelected ? fonts.bold : fonts.medium },
                        ]}
                      >
                        {opt.label}
                      </Text>
                      <Text style={[styles.layerOptionDesc, { color: colors.textMuted }]}>
                        {opt.desc}
                      </Text>
                    </View>
                    {isSelected && <Feather name="check" size={18} color="#0066B3" />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      {/* 6. MODAL SHEET: PILIH CAKUPAN WILAYAH (CHIP ATAS) */}
      <Modal
        visible={isRegionSheetVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsRegionSheetVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.drawerSheet,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.drawerHandle}>
              <View style={[styles.drawerHandleBar, { backgroundColor: colors.border }]} />
            </View>

            <View style={styles.drawerHeader}>
              <Text style={[styles.drawerTitle, { color: colors.text }]}>Pilih Cakupan Wilayah</Text>
              <TouchableOpacity onPress={() => setIsRegionSheetVisible(false)}>
                <Feather name="x" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
              {/* Opsi 1: Seluruh Indonesia (Nasional) */}
              <TouchableOpacity
                onPress={handleSelectNationalScope}
                style={[
                  styles.regionOptionRow,
                  {
                    backgroundColor: drillTier === 'NATIONAL'
                      ? isDark ? 'rgba(0,102,179,0.18)' : '#F0F9FF'
                      : isDark ? 'rgba(255,255,255,0.02)' : '#F8FAFC',
                    borderColor: drillTier === 'NATIONAL' ? '#0066B3' : colors.border,
                    marginBottom: spacing.xs,
                  },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.regionOptionName,
                      { color: colors.text, fontFamily: drillTier === 'NATIONAL' ? fonts.bold : fonts.medium },
                    ]}
                  >
                    🇮🇩 Skala Nasional (38 DPW)
                  </Text>
                  <Text style={[styles.regionOptionStat, { color: colors.textMuted }]}>
                    {(GIS_NATIONAL_SUMMARY.totalNationalCadres / 1000000).toFixed(1)}M+ Kader &bull; {(GIS_NATIONAL_SUMMARY.totalNationalVolunteers / 1000).toFixed(0)}K Relawan
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 2 }}>
                  <Text style={{ fontSize: 11, fontFamily: fonts.bold, color: '#10B981' }}>
                    {GIS_NATIONAL_SUMMARY.nationalCoveragePct}% TPS
                  </Text>
                  <Text style={{ fontSize: 9, color: colors.textMuted }}>NASIONAL</Text>
                </View>
              </TouchableOpacity>

              {/* Header DPW Provinsi */}
              <Text style={[styles.sectionHeadingText, { color: colors.textMuted }]}>
                DEWAN PIMPINAN WILAYAH (PROVINSI)
              </Text>
              {clusters.filter(c => c.level === 'PROVINSI').map((c) => {
                const isSelected = selectedCluster?.id === c.id;
                return (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => handleSelectRegionScope(c)}
                    style={[
                      styles.regionOptionRow,
                      {
                        backgroundColor: isSelected
                          ? isDark ? 'rgba(0,102,179,0.18)' : '#F0F9FF'
                          : isDark ? 'rgba(255,255,255,0.02)' : '#F8FAFC',
                        borderColor: isSelected ? '#0066B3' : colors.border,
                      },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.regionOptionName,
                          { color: colors.text, fontFamily: isSelected ? fonts.bold : fonts.medium },
                        ]}
                      >
                        {c.name}
                      </Text>
                      <Text style={[styles.regionOptionStat, { color: colors.textMuted }]}>
                        {c.totalCadres.toLocaleString('id-ID')} Kader &bull; {c.totalVolunteers.toLocaleString('id-ID')} Relawan
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 2 }}>
                      <Text style={{ fontSize: 11, fontFamily: fonts.bold, color: '#10B981' }}>
                        {c.tpsCoveragePct}% TPS
                      </Text>
                      <Text style={{ fontSize: 9, color: colors.textMuted }}>DPW</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}

              {/* Header DPC Kab/Kota */}
              <Text style={[styles.sectionHeadingText, { color: colors.textMuted, marginTop: spacing.sm }]}>
                DEWAN PIMPINAN DAERAH (KABUPATEN / KOTA)
              </Text>
              {clusters.filter(c => c.level === 'KAB_KOTA').map((c) => {
                const isSelected = selectedCluster?.id === c.id;
                return (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => handleSelectRegionScope(c)}
                    style={[
                      styles.regionOptionRow,
                      {
                        backgroundColor: isSelected
                          ? isDark ? 'rgba(0,102,179,0.18)' : '#F0F9FF'
                          : isDark ? 'rgba(255,255,255,0.02)' : '#F8FAFC',
                        borderColor: isSelected ? '#0066B3' : colors.border,
                      },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.regionOptionName,
                          { color: colors.text, fontFamily: isSelected ? fonts.bold : fonts.medium },
                        ]}
                      >
                        {c.name}
                      </Text>
                      <Text style={[styles.regionOptionStat, { color: colors.textMuted }]}>
                        {c.totalCadres.toLocaleString('id-ID')} Kader &bull; {c.totalVolunteers.toLocaleString('id-ID')} Relawan
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 2 }}>
                      <Text style={{ fontSize: 11, fontFamily: fonts.bold, color: '#10B981' }}>
                        {c.tpsCoveragePct}% TPS
                      </Text>
                      <Text style={{ fontSize: 9, color: colors.textMuted }}>DPC</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}

              {/* Header PAC Kecamatan */}
              <Text style={[styles.sectionHeadingText, { color: colors.textMuted, marginTop: spacing.sm }]}>
                PIMPINAN ANAK CABANG (KECAMATAN)
              </Text>
              {clusters.filter(c => c.level === 'KECAMATAN').map((c) => {
                const isSelected = selectedCluster?.id === c.id;
                return (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => handleSelectRegionScope(c)}
                    style={[
                      styles.regionOptionRow,
                      {
                        backgroundColor: isSelected
                          ? isDark ? 'rgba(0,102,179,0.18)' : '#F0F9FF'
                          : isDark ? 'rgba(255,255,255,0.02)' : '#F8FAFC',
                        borderColor: isSelected ? '#0066B3' : colors.border,
                      },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.regionOptionName,
                          { color: colors.text, fontFamily: isSelected ? fonts.bold : fonts.medium },
                        ]}
                      >
                        {c.name}
                      </Text>
                      <Text style={[styles.regionOptionStat, { color: colors.textMuted }]}>
                        {c.totalCadres.toLocaleString('id-ID')} Kader &bull; {c.totalVolunteers.toLocaleString('id-ID')} Relawan
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 2 }}>
                      <Text style={{ fontSize: 11, fontFamily: fonts.bold, color: '#10B981' }}>
                        {c.tpsCoveragePct}% TPS
                      </Text>
                      <Text style={{ fontSize: 9, color: colors.textMuted }}>PAC</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 7. BOTTOM SHEET: GIS SCORECARD INSPECTOR (4 PILAR METRIK) */}
      <GisScorecardInspector
        visible={isScorecardVisible}
        onClose={() => setIsScorecardVisible(false)}
        cluster={selectedCluster}
        metrics={activeMetrics}
        layerMode={activeLayer}
        leaderInfo={currentLeader}
        subClusters={activeSubClusters}
        poskoDesas={currentPoskoDesas}
        onSelectSubRegion={(sub) => {
          setIsScorecardVisible(false);
          if (sub.level === 'KAB_KOTA') drillDownTo('REGENCY', sub, 11.2);
          else if (sub.level === 'KECAMATAN') drillDownTo('DISTRICT', sub, 13.5);
          else if (sub.level === 'PROVINSI') drillDownTo('PROVINCE', sub, 8.5);
        }}
        onSelectPoskoDesa={handleSelectPoskoDesa}
      />

      {/* 8. BOTTOM SHEET: POSKO & KANTOR ACTION SHEET (NAVIGASI GPS & KONTAK) */}
      <PoskoActionSheet
        visible={actionSheetData.visible}
        onClose={() => setActionSheetData({ visible: false, posko: null, office: null })}
        posko={actionSheetData.posko}
        office={actionSheetData.office}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#091322',
  },
  topSafeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 30,
  },
  topBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: Platform.OS === 'android' ? 36 : 10,
    gap: spacing.sm,
  },
  floatingBackButton: {
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
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: '#10B981',
  },
  territoryChipText: {
    flex: 1,
    fontSize: 13,
    fontFamily: fonts.bold,
  },
  rightDockContainer: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 100 : 90,
    right: 14,
    zIndex: 40,
    alignItems: 'center',
    gap: 8,
  },
  dockToggleButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 5,
    elevation: 4,
  },
  dockItemsStack: {
    gap: 8,
    alignItems: 'center',
  },
  dockCardButton: {
    width: 58,
    height: 58,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 5,
  },
  dockCardLabel: {
    fontSize: 10,
    fontFamily: fonts.medium,
  },
  bottomLeftContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 96 : 84,
    left: 14,
    zIndex: 40,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.full,
    borderWidth: 1,
    maxWidth: '82%',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 5,
  },
  pulsingRedDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: '#E60012',
  },
  statusPillText: {
    fontSize: 11.5,
    fontFamily: fonts.bold,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  drawerSheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: 1,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    maxHeight: '80%',
  },
  drawerHandle: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  drawerHandleBar: {
    width: 38,
    height: 4.5,
    borderRadius: radius.full,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.sm,
  },
  drawerTitle: {
    fontSize: 15,
    fontFamily: fonts.bold,
  },
  layerOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
  },
  layerIconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  layerOptionTitle: {
    fontSize: 13,
  },
  layerOptionDesc: {
    fontSize: 10.5,
    lineHeight: 14,
  },
  regionOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  regionOptionName: {
    fontSize: 13,
  },
  regionOptionStat: {
    fontSize: 10.5,
  },
  territoryTierTag: {
    fontSize: 8.5,
    fontFamily: fonts.bold,
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  sectionHeadingText: {
    fontSize: 10,
    fontFamily: fonts.bold,
    letterSpacing: 0.8,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
});
