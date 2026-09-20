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
  GIS_POSKO_LOCATIONS,
  GIS_REGIONAL_CLUSTERS,
  PoskoDesaItem,
  PoskoLocation,
  RegionalCluster,
} from '../data/gisRegionalData';
import { KantorSekretariat } from '../data/simpan';
import { PAN_MEMBER_CLUSTERS } from '../data/panMemberDistributionData';
import {
  INDONESIA_GEOJSON,
  JAWA_BARAT_GEOJSON,
  KOTA_BANDUNG_GEOJSON,
} from '../data/indonesiaGeojsonData';
import {
  getProvinceKabupatenGeoJson,
  getKabupatenKecamatanGeoJson,
  getFeatureCentroid,
} from '../utils/geoRegistry';

export type GisDrillTier = 'NATIONAL' | 'PROVINCE' | 'REGENCY' | 'DISTRICT';

export default function MapSebaranRelawanAnggotaScreen() {
  const navigation = useNavigation<any>();
  const { role } = useApp();
  const { colors, isDark } = useTheme();
  const webViewRef = useRef<WebView>(null);

  // Data State (Synchronous Cache-First Initial State)
  const [clusters, setClusters] = useState<RegionalCluster[]>(GIS_REGIONAL_CLUSTERS);
  const [poskos, setPoskos] = useState<PoskoLocation[]>(GIS_POSKO_LOCATIONS);
  const [poskoDesasList, setPoskoDesasList] = useState<PoskoDesaItem[]>(() =>
    gisDistributionService.getPoskoDesaList()
  );
  const [offices, setOffices] = useState<KantorSekretariat[]>(() =>
    gisDistributionService.getOfficialOffices()
  );
  const [selectedCluster, setSelectedCluster] = useState<RegionalCluster | null>(() =>
    GIS_REGIONAL_CLUSTERS.find((c) => c.name.toLowerCase().includes('coblong')) || GIS_REGIONAL_CLUSTERS[0]
  );

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
  const [activeProvince, setActiveProvince] = useState<RegionalCluster | null>(() =>
    GIS_REGIONAL_CLUSTERS.find(c => c.level === 'PROVINSI' && c.name.toLowerCase().includes('jawa barat')) || null
  );
  const [activeRegency, setActiveRegency] = useState<RegionalCluster | null>(() =>
    GIS_REGIONAL_CLUSTERS.find(c => c.level === 'KAB_KOTA' && c.name.toLowerCase().includes('bandung')) || null
  );
  const [activeDistrict, setActiveDistrict] = useState<RegionalCluster | null>(() =>
    GIS_REGIONAL_CLUSTERS.find(c => c.level === 'KECAMATAN' && c.name.toLowerCase().includes('coblong')) || null
  );

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

  // Helper Drill-Down ke Tier Tertentu (Dengan Dynamic GeoJSON Injection)
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

      // Injeksi GeoJSON kabupaten untuk provinsi yang dipilih
      const provGeo = getProvinceKabupatenGeoJson(cluster.name);
      if (provGeo && webViewRef.current) {
        const payloadStr = JSON.stringify(provGeo);
        const nameStr = JSON.stringify(cluster.name);
        webViewRef.current.injectJavaScript(`if (window.panUpdateRegencyPolygons) { window.panUpdateRegencyPolygons(${payloadStr}, ${nameStr}); }`);
      }
    } else if (tier === 'REGENCY') {
      setDrillTier('REGENCY');
      setActiveRegency(cluster);
      setActiveDistrict(null);
      if (!activeProvince && cluster.parentRegion) {
        const foundProv = clusters.find(c => c.level === 'PROVINSI' && cluster.parentRegion?.toLowerCase().includes(c.name.toLowerCase()));
        if (foundProv) setActiveProvince(foundProv);
      }

      // Injeksi GeoJSON kecamatan untuk kab/kota yang dipilih
      const kabGeo = getKabupatenKecamatanGeoJson(cluster.name);
      if (kabGeo && webViewRef.current) {
        const payloadStr = JSON.stringify(kabGeo);
        const nameStr = JSON.stringify(cluster.name);
        webViewRef.current.injectJavaScript(`if (window.panUpdateDistrictPolygons) { window.panUpdateDistrictPolygons(${payloadStr}, ${nameStr}); }`);
      }
    } else if (tier === 'DISTRICT') {
      setDrillTier('DISTRICT');
      setActiveDistrict(cluster);
      if (!activeRegency && cluster.parentRegion) {
        const foundReg = clusters.find(c => c.level === 'KAB_KOTA' && cluster.parentRegion?.toLowerCase().includes(c.name.toLowerCase()));
        if (foundReg) setActiveRegency(foundReg);
      }
      if (webViewRef.current) {
        const nameStr = JSON.stringify(cluster.name);
        webViewRef.current.injectJavaScript(`if (window.panUpdateDistrictPolygons) { window.panUpdateDistrictPolygons(null, ${nameStr}); }`);
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
        const kabGeo = getKabupatenKecamatanGeoJson(activeRegency.name);
        if (webViewRef.current) {
          if (kabGeo) {
            webViewRef.current.injectJavaScript(`if (window.panUpdateDistrictPolygons) { window.panUpdateDistrictPolygons(${JSON.stringify(kabGeo)}, ''); }`);
          }
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
          const provGeo = getProvinceKabupatenGeoJson(activeProvince.name);
          if (webViewRef.current) {
            if (provGeo) {
              webViewRef.current.injectJavaScript(`if (window.panUpdateRegencyPolygons) { window.panUpdateRegencyPolygons(${JSON.stringify(provGeo)}, ${JSON.stringify(activeProvince.name)}); }`);
            }
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
        const provGeo = getProvinceKabupatenGeoJson(activeProvince.name);
        if (webViewRef.current) {
          if (provGeo) {
            webViewRef.current.injectJavaScript(`if (window.panUpdateRegencyPolygons) { window.panUpdateRegencyPolygons(${JSON.stringify(provGeo)}, ${JSON.stringify(activeProvince.name)}); }`);
          }
          webViewRef.current.injectJavaScript(`if (window.panFlyTo) { window.panFlyTo(${activeProvince.lat}, ${activeProvince.lng}, 8.5); }`);
        }
      } else {
        setDrillTier('NATIONAL');
        handleSelectNationalScope();
      }
      return true;
    }

    if (drillTier === 'PROVINCE') {
      setDrillTier('NATIONAL');
      handleSelectNationalScope();
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

      if (message.type === 'WEBVIEW_ERROR') {
        console.warn('[MapWebView JS Error]', message.category, message.data);
        return;
      }

      if (message.type === 'DRILL_DOWN') {
        const category = message.category;
        const data = message.data;

        if (category === 'PROVINCE') {
          const found = data.cluster || clusters.find(c => c.name.toLowerCase().includes(data.name?.toLowerCase?.() || ''));
          const cl: RegionalCluster = found || {
            id: `PROV_${data.name || 'UNKNOWN'}`,
            name: data.name || 'Provinsi',
            level: 'PROVINSI',
            lat: data.lat || -2.5,
            lng: data.lng || 118.0,
            totalCadres: 12500,
            totalVolunteers: 4500,
            targetVolunteers: 5000,
            volunteerGap: -500,
            status: 'DEFICIT',
            totalTps: 1500,
            coveredTps: 1350,
            tpsCoveragePct: 90.0,
            witnessCount: 1350,
            poskoCount: 45,
            targetSeats: 8,
            density: 'SEDANG',
          };
          if (cl && cl.lat) {
            drillDownTo('PROVINCE', cl, 8.5);
          }
          if (!isGrassroots && cl) {
            setIsScorecardVisible(true);
          }
        } else if (category === 'REGENCY') {
          const found = data.cluster || clusters.find(c => c.name.toLowerCase().includes(data.name?.toLowerCase?.() || ''));
          const cl: RegionalCluster = found || {
            id: `REG_${data.name || 'UNKNOWN'}`,
            name: data.name || 'Kabupaten/Kota',
            level: 'KAB_KOTA',
            lat: data.lat || -6.9,
            lng: data.lng || 107.6,
            totalCadres: 3500,
            totalVolunteers: 1200,
            targetVolunteers: 1500,
            volunteerGap: -300,
            status: 'DEFICIT',
            totalTps: 450,
            coveredTps: 410,
            tpsCoveragePct: 91.1,
            witnessCount: 410,
            poskoCount: 15,
            targetSeats: 3,
            density: 'SEDANG',
          };
          if (cl && cl.lat) {
            drillDownTo('REGENCY', cl, 11.2);
          }
          if (!isGrassroots && cl) {
            setIsScorecardVisible(true);
          }
        } else if (category === 'DISTRICT') {
          const found = data.cluster || clusters.find(c => c.name.toLowerCase().includes(data.name?.toLowerCase?.() || ''));
          const cl: RegionalCluster = found || {
            id: `DIST_${data.name || 'UNKNOWN'}`,
            name: data.name || 'Kecamatan',
            level: 'KECAMATAN',
            lat: data.lat || -6.88,
            lng: data.lng || 107.61,
            totalCadres: 850,
            totalVolunteers: 280,
            targetVolunteers: 300,
            volunteerGap: -20,
            status: 'DEFICIT',
            totalTps: 85,
            coveredTps: 80,
            tpsCoveragePct: 94.1,
            witnessCount: 80,
            poskoCount: 4,
            targetSeats: 1,
            density: 'SEDANG',
          };
          if (cl && cl.lat) {
            drillDownTo('DISTRICT', cl, 13.5);
          }
          if (!isGrassroots && cl) {
            setIsScorecardVisible(true);
          }
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
        } else if (z >= 7.5 && z < 10.5 && drillTier !== 'PROVINCE') {
          setDrillTier('PROVINCE');
          setActiveDistrict(null);
          setActiveRegency(null);
        } else if (z >= 10.5 && z < 12.5 && drillTier !== 'REGENCY') {
          setDrillTier('REGENCY');
          setActiveDistrict(null);
        } else if (z >= 12.5 && drillTier !== 'DISTRICT') {
          setDrillTier('DISTRICT');
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

  // Daftar Lengkap 38 DPW Provinsi Se-Indonesia untuk Drawer
  const allProvincesList = useMemo(() => {
    const provMap = new Map<string, RegionalCluster>();
    clusters.filter(c => c.level === 'PROVINSI').forEach(c => {
      provMap.set(c.name.toLowerCase(), c);
    });

    if (INDONESIA_GEOJSON && Array.isArray(INDONESIA_GEOJSON.features)) {
      INDONESIA_GEOJSON.features.forEach((f: any) => {
        const name = f.properties?.PROVINSI || f.properties?.name || '';
        if (name && !provMap.has(name.toLowerCase())) {
          const centroid = getFeatureCentroid(f);
          provMap.set(name.toLowerCase(), {
            id: `reg-prov-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
            name,
            level: 'PROVINSI',
            totalCadres: 35000,
            totalVolunteers: 12500,
            targetVolunteers: 15000,
            volunteerGap: -2500,
            status: 'TARGET_MET',
            totalTps: 5200,
            coveredTps: 4800,
            tpsCoveragePct: 92.3,
            witnessCount: 9600,
            poskoCount: 120,
            targetSeats: 4,
            lat: centroid.lat,
            lng: centroid.lng,
            density: 'SEDANG',
          });
        }
      });
    }

    return Array.from(provMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [clusters]);

  // Daftar DPC Kab/Kota Terkait Provinsi Aktif (Memanfaatkan GeoJSON Provinsi)
  const availableDpcList: RegionalCluster[] = useMemo(() => {
    if (activeProvince) {
      const provGeo = getProvinceKabupatenGeoJson(activeProvince.name);
      if (provGeo && Array.isArray(provGeo.features) && provGeo.features.length > 0) {
        return provGeo.features.map((f: any, idx: number): RegionalCluster => {
          const kabName = f.properties?.kabupaten || f.properties?.name || `Kabupaten ${idx + 1}`;
          const existing = clusters.find(c => c.level === 'KAB_KOTA' && (
            c.name.toLowerCase().includes(kabName.toLowerCase()) || kabName.toLowerCase().includes(c.name.toLowerCase())
          ));
          if (existing) return existing;
          const centroid = getFeatureCentroid(f);
          return {
            id: `reg-dpc-${kabName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
            name: kabName,
            level: 'KAB_KOTA' as const,
            parentRegion: activeProvince.name,
            totalCadres: 3400,
            totalVolunteers: 1250,
            targetVolunteers: 1400,
            volunteerGap: -150,
            status: 'TARGET_MET' as const,
            totalTps: 450,
            coveredTps: 420,
            tpsCoveragePct: 93.3,
            witnessCount: 840,
            poskoCount: 16,
            targetSeats: 3,
            lat: centroid.lat,
            lng: centroid.lng,
            density: 'SEDANG' as const,
          };
        }).sort((a: RegionalCluster, b: RegionalCluster) => a.name.localeCompare(b.name));
      }
    }
    return clusters.filter(c => c.level === 'KAB_KOTA');
  }, [activeProvince, clusters]);

  // Daftar PAC Kecamatan Terkait Kab/Kota Aktif (Memanfaatkan GeoJSON Kabupaten)
  const availablePacList: RegionalCluster[] = useMemo(() => {
    if (activeRegency) {
      const kabGeo = getKabupatenKecamatanGeoJson(activeRegency.name);
      if (kabGeo && Array.isArray(kabGeo.features) && kabGeo.features.length > 0) {
        return kabGeo.features.map((f: any, idx: number): RegionalCluster => {
          const kecName = f.properties?.kecamatan || f.properties?.name || `Kecamatan ${idx + 1}`;
          const existing = clusters.find(c => c.level === 'KECAMATAN' && (
            c.name.toLowerCase().includes(kecName.toLowerCase()) || kecName.toLowerCase().includes(c.name.toLowerCase())
          ));
          if (existing) return existing;
          const centroid = getFeatureCentroid(f);
          return {
            id: `reg-pac-${kecName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
            name: kecName.startsWith('Kec') ? kecName : `Kec. ${kecName}`,
            level: 'KECAMATAN' as const,
            parentRegion: activeRegency.name,
            totalCadres: 750,
            totalVolunteers: 280,
            targetVolunteers: 300,
            volunteerGap: -20,
            status: 'TARGET_MET' as const,
            totalTps: 85,
            coveredTps: 80,
            tpsCoveragePct: 94.1,
            witnessCount: 160,
            poskoCount: 4,
            targetSeats: 1,
            lat: centroid.lat,
            lng: centroid.lng,
            density: 'SEDANG' as const,
          };
        }).sort((a: RegionalCluster, b: RegionalCluster) => a.name.localeCompare(b.name));
      }
    }
    return clusters.filter(c => c.level === 'KECAMATAN');
  }, [activeRegency, clusters]);

  // Sub-Clusters untuk Drill-Down di Scorecard
  const activeSubClusters = useMemo(() => {
    if (drillTier === 'PROVINCE') {
      return availableDpcList;
    }
    if (drillTier === 'REGENCY') {
      return availablePacList;
    }
    if (drillTier === 'NATIONAL') {
      return allProvincesList;
    }
    return [];
  }, [drillTier, availableDpcList, availablePacList, allProvincesList]);

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
    if (drillTier === 'DISTRICT') {
      if (activeDistrict) return `Kec. ${activeDistrict.name.replace(/kecamatan /i, '').replace(/kec\. /i, '')}`;
      return 'Kec. Coblong';
    }
    if (drillTier === 'REGENCY') {
      if (activeRegency) return activeRegency.name.replace(/ \(.*\)/, '');
      return 'Kota Bandung (DPC)';
    }
    if (drillTier === 'PROVINCE') {
      if (activeProvince) return activeProvince.name;
      return 'Jawa Barat (DPW)';
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

  // Informasi Ringkasan Dinamis Sesuai Wilayah Aktif (Harmonis & Tanpa Teks Terpotong)
  const activeSummaryInfo = useMemo(() => {
    // 1. Level 4: Kecamatan & Posko Desa
    if (drillTier === 'DISTRICT') {
      const dist = activeDistrict || clusters.find(c => c.level === 'KECAMATAN' && c.name.toLowerCase().includes('coblong')) || clusters[0];
      const distClean = dist ? dist.name.replace(/kecamatan /i, '').replace(/kec\. /i, '').trim() : 'Coblong';
      const matchedPosko = poskos.find(p => p.district.toLowerCase().includes(distClean.toLowerCase())) || poskos[0];
      return {
        badge: 'POSKO KECAMATAN (PAC)',
        title: matchedPosko ? matchedPosko.name : (dist ? `Posko ${dist.name}` : 'Posko Kecamatan'),
        subtitle: `${matchedPosko ? matchedPosko.activeVolunteers : (dist ? dist.totalVolunteers : 28)} Relawan Siaga • ${poskoDesasList.length > 0 ? `${poskoDesasList.length} Kelurahan Binaan` : 'Posko Siaga'}`,
        actionLabel: isGrassroots ? 'Rute & Kontak' : 'Scorecard',
        poskoData: matchedPosko || null,
        clusterData: dist || null,
      };
    }

    // 2. Level 3: Kabupaten / Kota (DPC)
    if (drillTier === 'REGENCY') {
      const reg = activeRegency || clusters.find(c => c.level === 'KAB_KOTA' && c.name.toLowerCase().includes('bandung')) || clusters[0];
      return {
        badge: 'KOMANDO DAERAH (DPC)',
        title: reg ? reg.name.replace(/ \(.*\)/, '') : 'DPC Kota Bandung',
        subtitle: `${reg && typeof reg.totalVolunteers === 'number' ? reg.totalVolunteers.toLocaleString('id-ID') : '14.850'} Relawan • ${reg?.totalCadres ? `${(reg.totalCadres / 1000).toFixed(0)}K Kader` : 'Daerah Siaga'}`,
        actionLabel: 'Lihat Detail',
        poskoData: null,
        clusterData: reg || null,
      };
    }

    // 3. Level 2: Provinsi (DPW)
    if (drillTier === 'PROVINCE') {
      const prov = activeProvince || clusters.find(c => c.level === 'PROVINSI' && c.name.toLowerCase().includes('jawa barat')) || clusters[0];
      return {
        badge: 'TERITORIAL WILAYAH (DPW)',
        title: prov ? prov.name : 'DPW Jawa Barat',
        subtitle: `${prov ? (prov.totalVolunteers / 1000).toFixed(1) : '96.4'}K Relawan • ${prov ? (prov.totalCadres / 1000).toFixed(0) : '284'}K Kader`,
        actionLabel: 'Lihat Detail',
        poskoData: null,
        clusterData: prov || null,
      };
    }

    // 4. Level 1: Nasional (38 DPW)
    return {
      badge: 'KEKUATAN NASIONAL',
      title: '38 DPW Seluruh Indonesia',
      subtitle: `${(GIS_NATIONAL_SUMMARY.totalNationalCadres / 1000000).toFixed(1)}M+ Kader • ${(GIS_NATIONAL_SUMMARY.totalNationalVolunteers / 1000).toFixed(0)}K Relawan`,
      actionLabel: 'Evaluasi',
      poskoData: null,
      clusterData: clusters[0] || null,
    };
  }, [drillTier, activeDistrict, activeRegency, activeProvince, poskos, clusters, isGrassroots]);

  // Memoize Leaflet HTML Generation to avoid re-stringifying 654 KB GeoJSON on every render
  const mapHtml = useMemo(() => {
    const initRegGeo = activeProvince ? (getProvinceKabupatenGeoJson(activeProvince.name) || JAWA_BARAT_GEOJSON) : JAWA_BARAT_GEOJSON;
    const initDistGeo = activeRegency ? (getKabupatenKecamatanGeoJson(activeRegency.name) || KOTA_BANDUNG_GEOJSON) : KOTA_BANDUNG_GEOJSON;

    return buildIndonesiaGisMapHtml({
      centerLat: currentCamera.lat,
      centerLng: currentCamera.lng,
      zoom: currentCamera.zoom,
      clusters,
      poskos,
      poskoDesas: poskoDesasList,
      offices,
      memberClusters: PAN_MEMBER_CLUSTERS,
      nationalGeoJson: INDONESIA_GEOJSON,
      regencyGeoJson: initRegGeo,
      districtGeoJson: initDistGeo,
      activeDistrictName: activeDistrict ? activeDistrict.name : 'Coblong',
      filterType: activeLayer,
      isDark,
    });
  }, [
    clusters,
    poskos,
    poskoDesasList,
    offices,
    activeProvince?.name,
    activeRegency?.name,
    activeDistrict?.name,
    activeLayer,
    isDark,
  ]);

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
          source={{ html: mapHtml, baseUrl: 'https://localhost' }}
          style={StyleSheet.absoluteFill}
          onMessage={handleWebViewMessage}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          mixedContentMode="always"
          setSupportMultipleWindows={false}
          scrollEnabled={false}
          onError={(e) => console.warn('[MapWebView] Error:', e.nativeEvent)}
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

          {/* Chip Teritori Tunggal dengan Badge Tingkatan (WCAG AA Compliant) */}
          <TouchableOpacity
            onPress={() => setIsRegionSheetVisible(true)}
            style={[
              styles.territoryChip,
              {
                backgroundColor: isDark ? 'rgba(15,23,42,0.94)' : 'rgba(255,255,255,0.96)',
                borderColor: colors.border,
              },
            ]}
            activeOpacity={0.8}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.territoryTierTag, { color: isDark ? '#7DD3FC' : '#005299' }]}>
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

      {/* 3. FLOATING RIGHT ACTION GROUP (CLEAN FAB PILL - NO REDUNDANT TOGGLE) */}
      <View style={styles.rightDockContainer}>
        {/* Tombol 1: Layer */}
        <TouchableOpacity
          onPress={() => setIsLayerSheetVisible(true)}
          style={[
            styles.dockFabButton,
            {
              backgroundColor: isDark ? 'rgba(15,23,42,0.94)' : 'rgba(255,255,255,0.96)',
              borderColor: colors.border,
            },
          ]}
          activeOpacity={0.8}
          accessibilityLabel="Ganti Lapisan Data"
        >
          <Feather name="layers" size={20} color={isDark ? '#7DD3FC' : '#005299'} />
        </TouchableOpacity>

        {/* Tombol 2: Lokasi (Pusatkan ke Penugasan Akun) */}
        <TouchableOpacity
          onPress={handleCenterToAssignment}
          style={[
            styles.dockFabButton,
            {
              backgroundColor: isDark ? 'rgba(15,23,42,0.94)' : 'rgba(255,255,255,0.96)',
              borderColor: colors.border,
            },
          ]}
          activeOpacity={0.8}
          accessibilityLabel="Pusatkan ke Wilayah Penugasan"
        >
          <Feather name="crosshair" size={20} color={isDark ? '#7DD3FC' : '#005299'} />
        </TouchableOpacity>
      </View>

      {/* 4. FLOATING BOTTOM SUMMARY CARD (CLEAN, NO TRUNCATION, WCAG AAA) */}
      <View style={styles.bottomCardContainer}>
        <TouchableOpacity
          onPress={() => {
            if (activeSummaryInfo.poskoData && isGrassroots) {
              setActionSheetData({
                visible: true,
                posko: activeSummaryInfo.poskoData,
                office: null,
              });
            } else if (activeSummaryInfo.clusterData) {
              setSelectedCluster(activeSummaryInfo.clusterData);
              setIsScorecardVisible(true);
            }
          }}
          style={[
            styles.floatingSummaryCard,
            {
              backgroundColor: isDark ? 'rgba(15,23,42,0.96)' : 'rgba(255,255,255,0.98)',
              borderColor: isDark ? 'rgba(51,65,85,0.8)' : 'rgba(226,232,240,0.9)',
            },
          ]}
          activeOpacity={0.88}
        >
          {/* Status Accent Stripe */}
          <View style={styles.cardStatusAccent} />

          <View style={{ flex: 1, paddingVertical: 2, paddingHorizontal: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <View style={styles.semanticActiveDot} />
              <Text style={[styles.cardTierBadge, { color: isDark ? '#7DD3FC' : '#005299' }]}>
                {activeSummaryInfo.badge}
              </Text>
            </View>

            <Text style={[styles.cardTitleText, { color: colors.text }]} numberOfLines={1}>
              {activeSummaryInfo.title}
            </Text>
            <Text style={[styles.cardSubtitleText, { color: colors.textMuted }]} numberOfLines={1}>
              {activeSummaryInfo.subtitle}
            </Text>
          </View>

          <View style={styles.cardActionContainer}>
            <Text style={[styles.cardActionText, { color: isDark ? '#38BDF8' : '#005299' }]}>
              {activeSummaryInfo.actionLabel}
            </Text>
            <Feather name="chevron-right" size={16} color={isDark ? '#38BDF8' : '#005299'} />
          </View>
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
                    Skala Nasional (38 DPW)
                  </Text>
                  <Text style={[styles.regionOptionStat, { color: colors.textMuted }]}>
                    {(GIS_NATIONAL_SUMMARY.totalNationalCadres / 1000000).toFixed(1)}M+ Kader &bull; {(GIS_NATIONAL_SUMMARY.totalNationalVolunteers / 1000).toFixed(0)}K Relawan
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View
                    style={[
                      styles.regionLevelBadge,
                      {
                        backgroundColor: drillTier === 'NATIONAL'
                          ? isDark ? 'rgba(56,189,248,0.18)' : '#E0F2FE'
                          : isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
                        borderColor: drillTier === 'NATIONAL'
                          ? isDark ? 'rgba(56,189,248,0.4)' : '#BAE6FD'
                          : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.regionLevelBadgeText,
                        { color: drillTier === 'NATIONAL' ? (isDark ? '#7DD3FC' : '#005299') : colors.textMuted },
                      ]}
                    >
                      NASIONAL
                    </Text>
                  </View>
                  {drillTier === 'NATIONAL' ? (
                    <Feather name="check" size={17} color={isDark ? '#38BDF8' : '#0066B3'} />
                  ) : (
                    <Feather name="chevron-right" size={17} color={colors.textMuted} />
                  )}
                </View>
              </TouchableOpacity>

              {/* Header DPW Provinsi (38 Provinsi Se-Indonesia) */}
              <Text style={[styles.sectionHeadingText, { color: colors.textMuted }]}>
                DEWAN PIMPINAN WILAYAH (38 PROVINSI)
              </Text>
              {allProvincesList.map((c) => {
                const isSelected = selectedCluster?.id === c.id || activeProvince?.name.toLowerCase() === c.name.toLowerCase();
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
                        {(c.totalCadres ?? 0).toLocaleString('id-ID')} Kader &bull; {(c.totalVolunteers ?? 0).toLocaleString('id-ID')} Relawan
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View
                        style={[
                          styles.regionLevelBadge,
                          {
                            backgroundColor: isSelected
                              ? isDark ? 'rgba(56,189,248,0.18)' : '#E0F2FE'
                              : isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
                            borderColor: isSelected
                              ? isDark ? 'rgba(56,189,248,0.4)' : '#BAE6FD'
                              : colors.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.regionLevelBadgeText,
                            { color: isSelected ? (isDark ? '#7DD3FC' : '#005299') : colors.textMuted },
                          ]}
                        >
                          DPW
                        </Text>
                      </View>
                      {isSelected ? (
                        <Feather name="check" size={17} color={isDark ? '#38BDF8' : '#0066B3'} />
                      ) : (
                        <Feather name="chevron-right" size={17} color={colors.textMuted} />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}

              {/* Header DPC Kab/Kota */}
              <Text style={[styles.sectionHeadingText, { color: colors.textMuted, marginTop: spacing.sm }]}>
                {activeProvince ? `DEWAN PIMPINAN DAERAH (${activeProvince.name.toUpperCase()})` : 'DEWAN PIMPINAN DAERAH (KABUPATEN / KOTA)'}
              </Text>
              {availableDpcList.map((c: RegionalCluster) => {
                const isSelected = selectedCluster?.id === c.id || activeRegency?.name.toLowerCase() === c.name.toLowerCase();
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
                        {(c.totalCadres ?? 0).toLocaleString('id-ID')} Kader &bull; {(c.totalVolunteers ?? 0).toLocaleString('id-ID')} Relawan
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View
                        style={[
                          styles.regionLevelBadge,
                          {
                            backgroundColor: isSelected
                              ? isDark ? 'rgba(56,189,248,0.18)' : '#E0F2FE'
                              : isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
                            borderColor: isSelected
                              ? isDark ? 'rgba(56,189,248,0.4)' : '#BAE6FD'
                              : colors.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.regionLevelBadgeText,
                            { color: isSelected ? (isDark ? '#7DD3FC' : '#005299') : colors.textMuted },
                          ]}
                        >
                          DPC
                        </Text>
                      </View>
                      {isSelected ? (
                        <Feather name="check" size={17} color={isDark ? '#38BDF8' : '#0066B3'} />
                      ) : (
                        <Feather name="chevron-right" size={17} color={colors.textMuted} />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}

              {/* Header PAC Kecamatan */}
              <Text style={[styles.sectionHeadingText, { color: colors.textMuted, marginTop: spacing.sm }]}>
                {activeRegency ? `PIMPINAN ANAK CABANG (${activeRegency.name.toUpperCase()})` : 'PIMPINAN ANAK CABANG (KECAMATAN)'}
              </Text>
              {availablePacList.map((c: RegionalCluster) => {
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
                        {(c.totalCadres ?? 0).toLocaleString('id-ID')} Kader &bull; {(c.totalVolunteers ?? 0).toLocaleString('id-ID')} Relawan
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View
                        style={[
                          styles.regionLevelBadge,
                          {
                            backgroundColor: isSelected
                              ? isDark ? 'rgba(56,189,248,0.18)' : '#E0F2FE'
                              : isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
                            borderColor: isSelected
                              ? isDark ? 'rgba(56,189,248,0.4)' : '#BAE6FD'
                              : colors.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.regionLevelBadgeText,
                            { color: isSelected ? (isDark ? '#7DD3FC' : '#005299') : colors.textMuted },
                          ]}
                        >
                          PAC
                        </Text>
                      </View>
                      {isSelected ? (
                        <Feather name="check" size={17} color={isDark ? '#38BDF8' : '#0066B3'} />
                      ) : (
                        <Feather name="chevron-right" size={17} color={colors.textMuted} />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 7. BOTTOM SHEET: GIS SCORECARD INSPECTOR (4 PILAR METRIK) */}
      {isScorecardVisible && selectedCluster && activeMetrics ? (
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
      ) : null}

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
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ? StatusBar.currentHeight + 8 : 36) : 10,
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
  territoryChipText: {
    flex: 1,
    fontSize: 13,
    fontFamily: fonts.bold,
  },
  rightDockContainer: {
    position: 'absolute',
    top: Platform.OS === 'android' ? (StatusBar.currentHeight ? StatusBar.currentHeight + 60 : 88) : 66,
    right: 14,
    zIndex: 40,
    alignItems: 'center',
    gap: 10,
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
  bottomCardContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 32 : 24,
    left: 14,
    right: 14,
    zIndex: 40,
  },
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
  cardStatusAccent: {
    width: 4,
    alignSelf: 'stretch',
    backgroundColor: '#0066B3',
    borderRadius: 2,
  },
  semanticActiveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#059669',
  },
  cardTierBadge: {
    fontSize: 10,
    fontFamily: fonts.bold,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  cardTitleText: {
    fontSize: 13.5,
    fontFamily: fonts.bold,
    letterSpacing: -0.1,
  },
  cardSubtitleText: {
    fontSize: 11,
    fontFamily: fonts.medium,
    marginTop: 1,
  },
  cardActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingLeft: 6,
  },
  cardActionText: {
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
  regionLevelBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  regionLevelBadgeText: {
    fontSize: 9,
    fontFamily: fonts.bold,
    letterSpacing: 0.5,
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
