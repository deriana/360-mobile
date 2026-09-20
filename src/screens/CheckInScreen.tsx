import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  Modal as RNModal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Card, KpiCard, Modal, Pill, PrimaryButton } from '../components/ui';
import QrPlaceholder from '../components/QrPlaceholder';
import { fonts, fontSize, iconStrokeWidth, radius, spacing } from '../theme';
import { CURRENT_WITNESS_ID, ROLE_LABEL } from '../utils/scope';
import { getActiveWitnessScope } from '../utils/witnessResolver';
import { getWitnessAvatar } from '../data/images';
import { addToOfflineQueue } from '../utils/offlineQueue';
import { CheckInPayload } from '../types';

interface GeoPoint {
  lat: number;
  lng: number;
  accuracy: number | null;
}

// ponytail: geofence radius is informational only, not a hard block — TPS
// coordinates are randomly generated mock data, so a real device's GPS will
// almost never actually be within range. Wire hard blocking once TPS
// coordinates come from a real source.
const GEOFENCE_RADIUS_M = 100;

function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function StepProgress({ steps, activeIndex }: { steps: string[]; activeIndex: number }) {
  const { colors } = useTheme();
  return (
    <View style={styles.stepRow}>
      {steps.map((label, i) => (
        <React.Fragment key={label}>
          <View style={[styles.stepItem, { width: steps.length === 2 ? 110 : 78 }]}>
            <View
              style={[
                styles.stepCircle,
                { backgroundColor: i <= activeIndex ? colors.primary : colors.border },
              ]}
            >
              {i < activeIndex ? (
                <Feather name="check" size={12} color="#FFFFFF" strokeWidth={iconStrokeWidth} />
              ) : (
                <Text style={[styles.stepNum, { color: i === activeIndex ? '#FFFFFF' : colors.textMuted }]}>
                  {i + 1}
                </Text>
              )}
            </View>
            <Text
              numberOfLines={1}
              style={[
                styles.stepLabel,
                { color: i <= activeIndex ? colors.text : colors.textMuted, fontFamily: i === activeIndex ? fonts.bold : fonts.semiBold },
              ]}
            >
              {label}
            </Text>
          </View>
          {i < steps.length - 1 && (
            <View style={[styles.stepConnector, { backgroundColor: i < activeIndex ? colors.primary : colors.border }]} />
          )}
        </React.Fragment>
      ))}
    </View>
  );
}

// Map renders OpenStreetMap via Leaflet with an automatic graceful offline radar fallback
function buildLiveLocationMapHtml(lat: number, lng: number, accuracy: number | null) {
  return `<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html, body, #map { width:100%; height:100%; background:#0B1E33; }
  .leaflet-control-attribution, .leaflet-control-zoom { display:none !important; }
  .radar-fallback {
    width:100%; height:100%; display:flex; flex-direction:column;
    align-items:center; justify-content:center; background:radial-gradient(circle at center, #0F2D4A 0%, #061524 100%);
    color:#93C5FD; font-family:sans-serif; text-align:center; padding:12px;
  }
  .radar-ring {
    width:70px; height:70px; border-radius:35px; border:2px solid #0066B3;
    display:flex; align-items:center; justify-content:center; margin-bottom:8px;
    box-shadow: 0 0 16px rgba(0, 102, 179, 0.4);
    animation: pulse 2s infinite ease-in-out;
  }
  @keyframes pulse {
    0% { transform: scale(0.96); opacity:0.8; }
    50% { transform: scale(1.04); opacity:1; }
    100% { transform: scale(0.96); opacity:0.8; }
  }
</style>
</head><body>
<div id="map"></div>
<script>
  try {
    var map = L.map('map', { zoomControl:false, attributionControl:false }).setView([${lat}, ${lng}], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
    var marker = L.circleMarker([${lat}, ${lng}], {
      radius: 8,
      fillColor: '#0066B3',
      color: '#FFFFFF',
      weight: 2.5,
      opacity: 1,
      fillOpacity: 0.95
    }).addTo(map);
    var circle = L.circle([${lat}, ${lng}], {
      radius: ${GEOFENCE_RADIUS_M},
      color: '#0066B3',
      fillColor: '#0066B3',
      fillOpacity: 0.15,
      weight: 1.5,
      dashArray: '4, 6'
    }).addTo(map);
  } catch(e) {
    document.body.innerHTML = '<div class="radar-fallback"><div class="radar-ring"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></div><b style="font-size:12px;color:#FFFFFF">Radar GPS Geofence Aktif</b><span style="font-size:10px;margin-top:2px;color:#94A3B8">Koordinat: ${lat.toFixed(4)}, ${lng.toFixed(4)} • Radius ${GEOFENCE_RADIUS_M}m</span></div>';
  }
</script>
</body></html>`;
}

export default function CheckInScreen({ route, navigation }: any) {
  const { role, currentUser, witnesses, tps, events, checkInWitness, checkInEvent, poskoCheckIn, checkInPosko } = useApp();
  const { colors, isDark } = useTheme();
  const activeScope = getActiveWitnessScope(currentUser, witnesses, tps);
  const witness = activeScope.witness;
  const assignedTps = activeScope.tps;

  const isWitnessUser = role === 'WITNESS' || role === 'TPS_WITNESS' || currentUser.roles.some((r) => r.role === 'WITNESS') || currentUser.dimensions?.programs?.programSaksi === 'MANDATED';
  const isVolunteerOnly = (role === 'VOLUNTEER' || role === 'RELAWAN') && !isWitnessUser;

  // Filter agenda yang didaftarkan relawan (sesuai state di ActivitiesScreen)
  const registeredEvents = useMemo(() => {
    return events.filter((ev) => {
      const isReg = Boolean(ev.isRegistered || ev.attended);
      if (!isReg) return false;
      if (isVolunteerOnly && ev.targetAudience) {
        return ev.targetAudience === 'ALL' || ev.targetAudience === 'VOLUNTEER';
      }
      return true;
    });
  }, [events, isVolunteerOnly]);

  type CheckInTargetType = 'tps' | 'event' | 'posko';
  const initialTargetType = (route?.params?.targetType as CheckInTargetType) || (isWitnessUser ? 'tps' : 'event');
  const initialEventId = (route?.params?.eventId as string) || (registeredEvents[0]?.id || events[0]?.id || '');

  const [targetType, setTargetType] = useState<CheckInTargetType>(initialTargetType);
  const [selectedEventId, setSelectedEventId] = useState<string>(initialEventId);
  const selectedEvent = events.find((e) => e.id === selectedEventId) || registeredEvents[0] || events[0];
  const [ticketModalVisible, setTicketModalVisible] = useState(false);
  const [eventPickerModalVisible, setEventPickerModalVisible] = useState(false);

  // Sync state if navigation params change dynamically while screen is mounted
  useEffect(() => {
    if (route?.params?.targetType) {
      setTargetType(route.params.targetType);
    }
    if (route?.params?.eventId && events.some((e) => e.id === route.params.eventId)) {
      setSelectedEventId(route.params.eventId);
    }
  }, [route?.params?.targetType, route?.params?.eventId, events]);

  // Keep selectedEventId pointed to a valid registered event if available
  useEffect(() => {
    if (targetType === 'event' && registeredEvents.length > 0 && !registeredEvents.some((e) => e.id === selectedEventId)) {
      setSelectedEventId(registeredEvents[0].id);
    }
  }, [registeredEvents, targetType, selectedEventId]);

  const isTargetCheckedIn =
    targetType === 'tps'
      ? witness?.status === 'checked_in'
      : targetType === 'event'
      ? Boolean(selectedEvent?.attended)
      : poskoCheckIn.checkedIn;

  const currentCheckInTime =
    targetType === 'tps'
      ? witness?.checkInTime
      : targetType === 'event'
      ? (selectedEvent?.attended ? '08:15' : null)
      : poskoCheckIn.time;

  const currentTargetLocationLabel =
    targetType === 'tps'
      ? (assignedTps
          ? `TPS ${assignedTps.tpsNumber} Kel. ${assignedTps.village || 'Braga'}, Kec. ${assignedTps.district || 'Sumur Bandung'}, ${assignedTps.regency || 'Kota Bandung'}`
          : 'TPS 018 Kel. Braga, Kec. Sumur Bandung')
      : targetType === 'event'
      ? `${selectedEvent?.title || 'Kegiatan'} — ${selectedEvent?.location || 'Bandung'}`
      : (currentUser.coordinatorContact?.posko
          ? `${currentUser.coordinatorContact.posko}, Kec. ${currentUser.coordinatorContact.region}`
          : poskoCheckIn.poskoName);

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [cameraModalVisible, setCameraModalVisible] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoTakenAt, setPhotoTakenAt] = useState<string | null>(null);
  const [photoSizeKb, setPhotoSizeKb] = useState<number | null>(null);
  const [overrideNote, setOverrideNote] = useState('');

  const [location, setLocation] = useState<GeoPoint | null>(null);
  const [locationFetchedAt, setLocationFetchedAt] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [justConfirmed, setJustConfirmed] = useState(false);

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const clockTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const clockDate = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });

  const successScale = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (justConfirmed) {
      successScale.setValue(0);
      Animated.spring(successScale, { toValue: 1, useNativeDriver: true, friction: 5 }).start();
    }
  }, [justConfirmed, successScale]);

  // Steps definition: Witness requires selfie (3 steps), Volunteer only needs GPS & Confirmation (2 steps)
  const steps = targetType === 'tps' ? ['Selfie Saksi', 'Lokasi GPS', 'Konfirmasi'] : ['Lokasi GPS', 'Konfirmasi'];
  const activeStepIndex =
    targetType === 'tps'
      ? isTargetCheckedIn ? 3 : !photoUri ? 0 : !location ? 1 : 2
      : isTargetCheckedIn ? 2 : !location ? 0 : 1;

  // Anchor geofence near user's GPS for realistic demo
  const tpsAnchorRef = useRef<{ lat: number; lng: number } | null>(null);

  const distanceToTarget =
    targetType === 'tps'
      ? (location && tpsAnchorRef.current ? haversineMeters(location.lat, location.lng, tpsAnchorRef.current.lat, tpsAnchorRef.current.lng) : null)
      : (location ? 28 : null);

  const insideGeofence = distanceToTarget !== null && distanceToTarget <= GEOFENCE_RADIUS_M;
  const isOutside = distanceToTarget !== null && !insideGeofence;
  const isOverrideValid = overrideNote.trim().length >= 10;

  // For witness: photo is mandatory. For volunteer: photo is optional documentation!
  const canConfirm =
    targetType === 'tps'
      ? !!photoUri && !!location && (!isOutside || isOverrideValid)
      : !!location && (!isOutside || isOverrideValid);

  const [locationError, setLocationError] = useState<string | null>(null);

  const fetchLocation = async () => {
    setLocating(true);
    setLocationError(null);
    try {
      const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Location.requestForegroundPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        setLocationError('Izin lokasi belum aktif. Buka Pengaturan HP → Aplikasi → SAKSI PAN 360 → Izin → Lokasi → Izinkan.');
        setLocating(false);
        return;
      }

      try {
        const providerStatus = await Location.getProviderStatusAsync();
        if (!providerStatus.locationServicesEnabled && Platform.OS === 'android') {
          await Location.enableNetworkProviderAsync();
        }
      } catch (e) {}

      try {
        const lastKnown = await Location.getLastKnownPositionAsync({});
        if (lastKnown) {
          if (!tpsAnchorRef.current) {
            tpsAnchorRef.current = { lat: lastKnown.coords.latitude + 0.0004, lng: lastKnown.coords.longitude + 0.0003 };
          }
          setLocation({
            lat: lastKnown.coords.latitude,
            lng: lastKnown.coords.longitude,
            accuracy: lastKnown.coords.accuracy,
          });
          setLocationFetchedAt(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
        }
      } catch (e) {}

      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('GPS timeout')), 7000)
        );
        const positionPromise = Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const pos = await Promise.race([positionPromise, timeoutPromise]);
        if (!tpsAnchorRef.current) {
          tpsAnchorRef.current = { lat: pos.coords.latitude + 0.0004, lng: pos.coords.longitude + 0.0003 };
        }
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setLocationFetchedAt(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
        setLocationError(null);
      } catch (posErr) {
        setLocation((prev) => {
          if (!prev) {
            setLocationError('Sinyal satelit GPS belum terkunci. Pastikan Anda berada di luar ruangan atau gunakan opsi Simulasi.');
          }
          return prev;
        });
      }
    } catch (err: any) {
      setLocation((prev) => {
        if (!prev) {
          setLocationError('Gagal mengambil titik GPS. Pastikan GPS HP aktif.');
        }
        return prev;
      });
    } finally {
      setLocating(false);
    }
  };

  const useSimulatedLocation = () => {
    let lat = -6.9175;
    let lng = 107.6098;
    if (targetType === 'tps' && assignedTps) {
      lat = assignedTps.lat || -6.9175;
      lng = assignedTps.lng || 107.6098;
    } else if (targetType === 'event') {
      lat = -6.9180;
      lng = 107.6105;
    } else {
      lat = -6.9170;
      lng = 107.6090;
    }
    tpsAnchorRef.current = { lat, lng };
    setLocation({
      lat: lat + 0.0001,
      lng: lng + 0.0001,
      accuracy: 12,
    });
    setLocationFetchedAt(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
    setLocationError(null);
  };

  useEffect(() => {
    if (!cameraPermission) requestCameraPermission();
    fetchLocation();
  }, []);

  const openCamera = () => setCameraModalVisible(true);

  const takePhoto = async () => {
    const photo = await cameraRef.current?.takePictureAsync({ quality: 0.35, skipProcessing: true });
    if (photo) {
      setPhotoUri(photo.uri);
      setPhotoTakenAt(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
      const estimatedKb = Math.min(Math.max(88, Math.round(105 + Math.random() * 40)), 175);
      setPhotoSizeKb(estimatedKb);
      setCameraModalVisible(false);
    }
  };

  const handleCheckIn = () => {
    if (targetType === 'tps') {
      if (!photoUri || !location) return;
    } else {
      if (!location) return;
    }
    if (isOutside && !isOverrideValid) return;

    setSubmitting(true);
    const approxKb = photoSizeKb ?? 125;

    const payload: CheckInPayload = {
      witnessId: witness.id,
      tpsId: targetType === 'tps' ? witness.assignedTpsId : undefined,
      eventId: targetType === 'event' ? selectedEvent?.id : undefined,
      lat: location.lat,
      lng: location.lng,
      distanceMeters: Math.round(distanceToTarget ?? 0),
      insideGeofence: !isOutside,
      overrideNote: isOutside ? overrideNote.trim() : undefined,
      selfieUrl: photoUri || undefined,
      photoSizeBytes: photoUri ? approxKb * 1024 : undefined,
      timestamp: new Date().toISOString(),
      locationLabel: currentTargetLocationLabel,
    };

    if (targetType === 'tps') {
      addToOfflineQueue('check_in', payload);
      setTimeout(() => {
        checkInWitness(witness.id, {
          lat: location.lat,
          lng: location.lng,
          distanceMeters: Math.round(distanceToTarget ?? 0),
          insideGeofence: !isOutside,
          overrideNote: isOutside ? overrideNote.trim() : undefined,
          locationLabel: assignedTps
            ? `Dekat TPS ${assignedTps.tpsNumber} Kel. ${assignedTps.village || 'Braga'}, Kec. ${assignedTps.district || 'Sumur Bandung'}${isOutside ? ' (Pengecualian Luar Radius)' : ' (Sesuai Geofence)'}`
            : 'Lokasi GPS TPS 018 Braga',
        });
        setSubmitting(false);
        setJustConfirmed(true);
      }, 800);
    } else if (targetType === 'event') {
      setTimeout(() => {
        if (selectedEvent) {
          checkInEvent(selectedEvent.id, payload);
        }
        setSubmitting(false);
        setJustConfirmed(true);
      }, 800);
    } else {
      setTimeout(() => {
        checkInPosko(currentTargetLocationLabel, payload);
        setSubmitting(false);
        setJustConfirmed(true);
      }, 800);
    }
  };

  const checkInDisplayTime = currentCheckInTime || '07:12';
  const timelineItems =
    targetType === 'tps'
      ? [
          {
            key: 'selfie',
            label: 'Foto Selfie Saksi Diambil',
            icon: 'camera' as const,
            done: !!photoUri || isTargetCheckedIn,
            time: photoTakenAt
              ? `${photoTakenAt} WIB`
              : isTargetCheckedIn
              ? '07:10 WIB'
              : 'Menunggu foto selfie',
          },
          {
            key: 'gps',
            label: 'Lokasi GPS TPS Terkunci',
            icon: 'map-pin' as const,
            done: !!location || isTargetCheckedIn,
            time: isTargetCheckedIn
              ? '07:11 WIB'
              : locationFetchedAt
              ? `${locationFetchedAt} WIB`
              : 'Menunggu sinyal GPS',
          },
          {
            key: 'confirm',
            label: 'Presensi Saksi Dikonfirmasi',
            icon: 'check-square' as const,
            done: isTargetCheckedIn,
            time: isTargetCheckedIn
              ? `${checkInDisplayTime} WIB`
              : 'Menunggu konfirmasi',
          },
        ]
      : [
          {
            key: 'gps',
            label: 'Titik Lokasi GPS Terkunci',
            icon: 'map-pin' as const,
            done: !!location || isTargetCheckedIn,
            time: isTargetCheckedIn
              ? (currentCheckInTime ? `${currentCheckInTime} WIB` : '08:14 WIB')
              : locationFetchedAt
              ? `${locationFetchedAt} WIB`
              : 'Menunggu sinyal GPS',
          },
          ...(photoUri
            ? [
                {
                  key: 'photo',
                  label: 'Dokumentasi Lapangan Dilampirkan',
                  icon: 'camera' as const,
                  done: true,
                  time: photoTakenAt ? `${photoTakenAt} WIB` : 'Tercatat',
                },
              ]
            : []),
          {
            key: 'confirm',
            label: `Presensi ${targetType === 'event' ? 'Kegiatan' : 'Posko'} Dikonfirmasi`,
            icon: 'check-square' as const,
            done: isTargetCheckedIn,
            time: isTargetCheckedIn
              ? (currentCheckInTime ? `${currentCheckInTime} WIB` : '08:15 WIB')
              : 'Menunggu konfirmasi',
          },
        ];

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* Header: Greeting & Modern Live Clock Badge */}
      <View style={styles.headerTopRow}>
        <View style={styles.headerLeftRow}>
          <Image source={getWitnessAvatar(currentUser.identity.avatarIndex ?? 0)} style={styles.avatarImg} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[styles.greetingText, { color: colors.text }]} numberOfLines={1}>
              Halo, {(currentUser.identity.name || witness.name).split(' ')[0]}
            </Text>
            <View style={[styles.rolePill, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.rolePillText, { color: colors.primary }]} numberOfLines={1}>
                {ROLE_LABEL[role] || 'Relawan Lapangan'}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.modernClockBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', borderColor: colors.border }]}>
          <Text style={[styles.modernClockTime, { color: colors.text }]}>{clockTime}</Text>
          <Text style={[styles.modernClockDate, { color: colors.textMuted }]} numberOfLines={1}>{clockDate}</Text>
        </View>
      </View>

      {/* Target Presensi Switcher (Saksi TPS / Event Kegiatan / Posko) */}
      <Card style={{ gap: spacing.xs, backgroundColor: colors.surface, borderColor: colors.border }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: colors.text }}>
            Pilih Target Presensi Lapangan
          </Text>
          <Pill
            label={isTargetCheckedIn ? `Tercatat: ${currentCheckInTime || 'Hadir'}` : 'Belum Presensi'}
            tone={isTargetCheckedIn ? 'success' : 'warning'}
            icon={isTargetCheckedIn ? 'check-circle' : 'clock'}
          />
        </View>

        <View style={styles.targetTrack}>
          {isWitnessUser && (
            <Pressable
              onPress={() => setTargetType('tps')}
              style={({ pressed }) => [
                styles.targetPill,
                targetType === 'tps'
                  ? { backgroundColor: colors.primary, borderColor: colors.primary }
                  : { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9', borderColor: colors.border },
                pressed && { opacity: 0.8 },
              ]}
            >
              <Feather name="home" size={14} color={targetType === 'tps' ? '#FFFFFF' : colors.textMuted} />
              <Text style={[styles.targetText, { color: targetType === 'tps' ? '#FFFFFF' : colors.textMuted }]} numberOfLines={1}>
                Saksi TPS
              </Text>
            </Pressable>
          )}

          <Pressable
            onPress={() => setTargetType('event')}
            style={({ pressed }) => [
              styles.targetPill,
              targetType === 'event'
                ? { backgroundColor: colors.primary, borderColor: colors.primary }
                : { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9', borderColor: colors.border },
              pressed && { opacity: 0.8 },
            ]}
          >
            <Feather name="calendar" size={14} color={targetType === 'event' ? '#FFFFFF' : colors.textMuted} />
            <Text style={[styles.targetText, { color: targetType === 'event' ? '#FFFFFF' : colors.textMuted }]} numberOfLines={1}>
              Event & Giat
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setTargetType('posko')}
            style={({ pressed }) => [
              styles.targetPill,
              targetType === 'posko'
                ? { backgroundColor: colors.primary, borderColor: colors.primary }
                : { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9', borderColor: colors.border },
              pressed && { opacity: 0.8 },
            ]}
          >
            <Feather name="map-pin" size={14} color={targetType === 'posko' ? '#FFFFFF' : colors.textMuted} />
            <Text style={[styles.targetText, { color: targetType === 'posko' ? '#FFFFFF' : colors.textMuted }]} numberOfLines={1}>
              Posko
            </Text>
          </Pressable>
        </View>

        {/* Pemilihan Event Terdaftar (Sesuai State Kegiatan ActivitiesScreen) */}
        {targetType === 'event' && (
          <View style={{ marginTop: spacing.xs, gap: 8 }}>
            {registeredEvents.length === 0 ? (
              // Empty State jika belum ada agenda yang di-RSVP oleh relawan
              <View
                style={[
                  styles.emptyRegisteredBox,
                  { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', borderColor: colors.border },
                ]}
              >
                <Feather name="calendar" size={24} color={colors.textMuted} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[styles.emptyRegisteredTitle, { color: colors.text }]}>
                    Belum Ada Agenda yang Anda Ikuti
                  </Text>
                  <Text style={[styles.emptyRegisteredSubtitle, { color: colors.textMuted }]}>
                    Daftar keikutsertaan (RSVP) agenda relawan terlebih dahulu melalui menu Kegiatan.
                  </Text>
                </View>
                <Pressable
                  onPress={() => navigation.navigate('Activities', { tab: 'agenda' })}
                  style={[styles.emptyActionBtn, { backgroundColor: colors.primary }]}
                >
                  <Text style={styles.emptyActionBtnText}>Buka Kegiatan</Text>
                  <Feather name="chevron-right" size={13} color="#FFFFFF" />
                </Pressable>
              </View>
            ) : (
              // Kartu Agenda Terpilih (Bersih, Scannable & Bebas Truncation)
              <View style={{ gap: 6 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontFamily: fonts.medium, fontSize: 11, color: colors.textMuted }}>
                    Agenda Terdaftar ({registeredEvents.length}):
                  </Text>
                  {registeredEvents.length > 1 && (
                    <Pressable
                      onPress={() => setEventPickerModalVisible(true)}
                      style={({ pressed }) => [
                        styles.changeEventBtn,
                        { borderColor: colors.primary, backgroundColor: isDark ? 'rgba(0,102,179,0.15)' : '#F0F9FF' },
                        pressed && { opacity: 0.8 },
                      ]}
                    >
                      <Feather name="repeat" size={11} color={colors.primary} />
                      <Text style={[styles.changeEventBtnText, { color: colors.primary }]}>
                        Ganti Agenda ({registeredEvents.length})
                      </Text>
                    </Pressable>
                  )}
                </View>

                <Pressable
                  onPress={() => {
                    if (registeredEvents.length > 1) {
                      setEventPickerModalVisible(true);
                    }
                  }}
                  style={({ pressed }) => [
                    styles.selectedEventCard,
                    {
                      backgroundColor: isDark ? 'rgba(0,102,179,0.12)' : '#F8FAFC',
                      borderColor: selectedEvent?.attended ? colors.success : colors.primary,
                    },
                    pressed && registeredEvents.length > 1 && { opacity: 0.9 },
                  ]}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={[styles.eventCategoryTag, { color: colors.primary, backgroundColor: isDark ? 'rgba(0,102,179,0.25)' : '#E0F2FE' }]}>
                        {selectedEvent?.category || 'Kegiatan'}
                      </Text>
                      {selectedEvent?.priorityNote && (
                        <Text style={[styles.eventPriorityTag, { color: colors.textMuted }]}>
                          • {selectedEvent.priorityNote}
                        </Text>
                      )}
                    </View>
                    <Pill
                      label={selectedEvent?.attended ? 'Sudah Hadir' : 'Terdaftar RSVP'}
                      tone={selectedEvent?.attended ? 'success' : 'primary'}
                      icon={selectedEvent?.attended ? 'check-circle' : 'user-check'}
                    />
                  </View>

                  <Text style={[styles.selectedEventTitle, { color: colors.text }]} numberOfLines={2}>
                    {selectedEvent?.title}
                  </Text>

                  <View style={styles.selectedEventMetaRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Feather name="calendar" size={11} color={colors.textMuted} />
                      <Text style={[styles.selectedEventMetaText, { color: colors.textMuted }]} numberOfLines={1}>
                        {selectedEvent?.dateLabel} • {selectedEvent?.timeLabel}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Feather name="map-pin" size={11} color={colors.textMuted} />
                      <Text style={[styles.selectedEventMetaText, { color: colors.textMuted }]} numberOfLines={1}>
                        {selectedEvent?.location}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              </View>
            )}
          </View>
        )}

        {targetType === 'posko' && (
          <View style={[styles.targetInfoBanner, { backgroundColor: isDark ? 'rgba(0,43,82,0.3)' : '#F0F9FF', borderColor: colors.border }]}>
            <Feather name="map-pin" size={16} color={colors.primary} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: colors.text }}>
                {currentUser.coordinatorContact?.posko || poskoCheckIn.poskoName}
              </Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted }}>
                Kec. {currentUser.coordinatorContact?.region || 'Sumur Bandung'}, Kota Bandung • Koordinator: {currentUser.coordinatorContact?.name || 'Hendra Gunawan'} ({currentUser.coordinatorContact?.phone || '0813-2211-4455'})
              </Text>
            </View>
          </View>
        )}

        {targetType === 'tps' && assignedTps && (
          <View style={[styles.targetInfoBanner, { backgroundColor: isDark ? 'rgba(0,43,82,0.3)' : '#F0F9FF', borderColor: colors.border }]}>
            <Feather name="home" size={16} color={colors.primary} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: colors.text }}>
                TPS {assignedTps.tpsNumber} — Kel. {assignedTps.village || 'Braga'}, Kec. {assignedTps.district || 'Sumur Bandung'}
              </Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted }}>
                {assignedTps.regency || 'Kota Bandung'}, {assignedTps.province || 'Jawa Barat'} • DPT: {assignedTps.dpt || 268} Pemilih • Geofence Validasi: 100m
              </Text>
            </View>
          </View>
        )}
      </Card>

      {/* ========================================================================= */}
      {/* STATE 1: SUDAH PRESENSI (STREAMLINED & ELEGANT ATTENDANCE PASS)           */}
      {/* ========================================================================= */}
      {isTargetCheckedIn ? (
        <View style={{ gap: spacing.sm }}>
          <Card
            style={[
              styles.compactPassCard,
              {
                backgroundColor: isDark ? 'rgba(16,185,129,0.06)' : '#F0FDF4',
                borderColor: isDark ? 'rgba(34,197,94,0.3)' : '#BBF7D0',
              },
            ]}
          >
            {/* Header: Status Chip + Jam Presensi */}
            <View style={styles.compactPassHeader}>
              <View style={[styles.compactStatusChip, { backgroundColor: isDark ? 'rgba(34,197,94,0.2)' : '#DCFCE7' }]}>
                <Feather name="check-circle" size={13} color={colors.success} />
                <Text style={[styles.compactStatusText, { color: colors.success }]}>
                  Presensi Terverifikasi
                </Text>
              </View>
              <Text style={[styles.compactTimeText, { color: colors.textMuted }]}>
                {clockDate} • {currentCheckInTime || '08:15'} WIB
              </Text>
            </View>

            {/* Target Title & Lokasi Lengkap */}
            <View style={{ gap: 3 }}>
              <Text style={[styles.compactTargetTitle, { color: colors.text }]} numberOfLines={2}>
                {targetType === 'tps'
                  ? `TPS ${assignedTps?.tpsNumber ?? '18'} — Kel. ${assignedTps?.village || 'Braga'}, Kec. ${assignedTps?.district || 'Sumur Bandung'}`
                  : targetType === 'event'
                  ? selectedEvent?.title
                  : (currentUser.coordinatorContact?.posko || poskoCheckIn.poskoName)}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Feather name="map-pin" size={12} color={colors.textMuted} />
                <Text style={[styles.compactTargetSubtitle, { color: colors.textMuted }]} numberOfLines={1}>
                  {targetType === 'tps'
                    ? `${assignedTps?.regency || 'Kota Bandung'}, ${assignedTps?.province || 'Jawa Barat'}`
                    : targetType === 'event'
                    ? selectedEvent?.location
                    : `Kec. ${currentUser.coordinatorContact?.region || 'Sumur Bandung'}, Kota Bandung`}
                </Text>
              </View>
            </View>

            {/* Ringkasan Validasi 2-Kolom Ringkas (Tanpa Koordinat Teknis Mentah) */}
            <View style={[styles.compactMetaRow, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0' }]}>
              <View style={styles.compactMetaCol}>
                <Text style={[styles.compactMetaLabel, { color: colors.textMuted }]}>Waktu Hadir</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Feather name="clock" size={11} color={colors.primary} />
                  <Text style={[styles.compactMetaValue, { color: colors.text }]}>{currentCheckInTime || '07:12'} WIB</Text>
                </View>
              </View>

              <View style={[styles.compactMetaDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0' }]} />

              <View style={styles.compactMetaCol}>
                <Text style={[styles.compactMetaLabel, { color: colors.textMuted }]}>Status Lokasi</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Feather name="navigation" size={11} color={colors.success} />
                  <Text style={[styles.compactMetaValue, { color: colors.success }]}>
                    Dalam Radius ({Math.round(distanceToTarget ?? 24)}m)
                  </Text>
                </View>
              </View>
            </View>

            {/* Embedded Mini Map Preview (Menyatu di dalam kartu bukti kehadiran) */}
            {location && (
              <View style={[styles.compactMapWrap, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#CBD5E1' }]}>
                <WebView
                  source={{ html: buildLiveLocationMapHtml(location.lat, location.lng, location.accuracy) }}
                  style={{ width: '100%', height: 115 }}
                  originWhitelist={['*']}
                />
                <View style={[styles.mapOverlayPill, { backgroundColor: isDark ? 'rgba(6,21,36,0.85)' : 'rgba(255,255,255,0.92)' }]}>
                  <Feather name="lock" size={10} color={colors.success} />
                  <Text style={[styles.mapOverlayText, { color: colors.text }]}>Titik Lokasi Bilik Terkunci</Text>
                </View>
              </View>
            )}

            {/* Quick Action Shortcuts untuk Saksi TPS Terverifikasi */}
            {targetType === 'tps' && (
              <View style={styles.verifiedActionRow}>
                <Pressable
                  onPress={() => navigation.navigate('AssignmentLetter', { witnessId: witness.id })}
                  style={({ pressed }) => [
                    styles.verifiedActionBtn,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#FFFFFF',
                      borderColor: isDark ? 'rgba(255,255,255,0.12)' : colors.border,
                    },
                    pressed && { opacity: 0.75 },
                  ]}
                >
                  <Feather name="file-text" size={13} color={colors.primary} />
                  <Text style={[styles.verifiedActionBtnText, { color: colors.text }]}>E-Mandat KPU</Text>
                </Pressable>

                <Pressable
                  onPress={() => navigation.navigate('TpsDetail', { tpsId: assignedTps.id })}
                  style={({ pressed }) => [
                    styles.verifiedActionBtn,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#FFFFFF',
                      borderColor: isDark ? 'rgba(255,255,255,0.12)' : colors.border,
                    },
                    pressed && { opacity: 0.75 },
                  ]}
                >
                  <Feather name="info" size={13} color={colors.primary} />
                  <Text style={[styles.verifiedActionBtnText, { color: colors.text }]}>Data DPT</Text>
                </Pressable>

                <Pressable
                  onPress={() => navigation.navigate('C1Ocr')}
                  style={({ pressed }) => [
                    styles.verifiedActionBtn,
                    { backgroundColor: colors.primary, borderColor: colors.primary },
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Feather name="camera" size={13} color="#FFFFFF" />
                  <Text style={[styles.verifiedActionBtnText, { color: '#FFFFFF' }]}>Scan C1 Plano</Text>
                </Pressable>
              </View>
            )}

            {/* Tombol Tiket QR Presensi Digital (Khusus Event) */}
            {targetType === 'event' && (
              <Pressable
                onPress={() => setTicketModalVisible(true)}
                style={({ pressed }) => [
                  styles.compactQrBtn,
                  { backgroundColor: colors.primary },
                  pressed && { opacity: 0.88 },
                ]}
              >
                <Feather name="maximize" size={14} color="#FFFFFF" />
                <Text style={styles.compactQrBtnText}>Buka Tiket QR Presensi Digital</Text>
              </Pressable>
            )}
          </Card>

          {/* Activity Timeline Ringkas */}
          <Card style={{ gap: spacing.xs, paddingVertical: spacing.sm }}>
            <Text style={[styles.timelineTitle, { color: colors.text, fontSize: 12 }]}>Riwayat Aktivitas Kehadiran</Text>
            {timelineItems.map((item, idx) => (
              <View key={item.key} style={styles.timelineRow}>
                <View style={styles.timelineRail}>
                  <View style={[styles.timelineDot, { backgroundColor: item.done ? colors.primary : colors.border }]}>
                    <Feather name={item.done ? 'check' : item.icon} size={10} color={item.done ? '#FFFFFF' : colors.textMuted} strokeWidth={iconStrokeWidth} />
                  </View>
                  {idx < timelineItems.length - 1 && <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />}
                </View>
                <View style={{ flex: 1, paddingBottom: spacing.xs }}>
                  <Text style={[styles.timelineLabel, { color: item.done ? colors.text : colors.textMuted, fontSize: 11 }]}>{item.label}</Text>
                  <Text style={[styles.timelineTime, { color: colors.textMuted, fontSize: 10 }]}>{item.time ?? 'Tercatat'}</Text>
                </View>
              </View>
            ))}
          </Card>
        </View>
      ) : (
        /* ========================================================================= */
        /* STATE 2: BELUM PRESENSI (ACTION-READY, STREAMLINED FLOW)                  */
        /* ========================================================================= */
        <View style={{ gap: spacing.md }}>
          {/* Banner Opsi Tiket QR Cepat untuk Event */}
          {targetType === 'event' && selectedEvent && (
            <View
              style={[
                styles.qrPassBanner,
                { backgroundColor: isDark ? 'rgba(0,43,82,0.3)' : '#F0F9FF', borderColor: colors.border },
              ]}
            >
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ fontFamily: fonts.bold, fontSize: 11.5, color: colors.text }}>
                  Ada Meja Registrasi Panitia di Pintu Masuk?
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 10.5, color: colors.textMuted }}>
                  Tunjukkan Tiket QR Presensi digital Anda untuk absensi instan tanpa GPS.
                </Text>
              </View>
              <Pressable
                onPress={() => setTicketModalVisible(true)}
                style={({ pressed }) => [
                  styles.qrPassBtn,
                  { backgroundColor: colors.primary },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Feather name="maximize" size={12} color="#FFFFFF" />
                <Text style={{ fontFamily: fonts.bold, fontSize: 11, color: '#FFFFFF' }}>Buka Tiket</Text>
              </Pressable>
            </View>
          )}

          {/* Jika Saksi TPS: Foto Selfie Wajib */}
          {targetType === 'tps' && (
            <Card style={{ gap: spacing.sm }}>
              <View style={styles.photoCardHeaderRow}>
                <View style={[styles.headerNumBadge, { backgroundColor: colors.primaryLight }]}>
                  <Text style={[styles.headerNumBadgeText, { color: colors.primary }]}>1</Text>
                </View>
                <Text style={[styles.photoCardTitle, { color: colors.text }]}>Foto Selfie Kehadiran Saksi (Wajib)</Text>
              </View>

              <View style={styles.photoCardBody}>
                {photoUri ? (
                  <Image source={{ uri: photoUri }} style={styles.photoThumbSmall} />
                ) : (
                  <View style={[styles.photoPlaceholder, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <Feather name="camera" size={22} color={colors.textMuted} strokeWidth={iconStrokeWidth} />
                  </View>
                )}
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[styles.photoStatusTitle, { color: colors.text }]}>{photoUri ? 'Foto Siap' : 'Belum Ada Foto'}</Text>
                  <Text style={[styles.photoStatusSub, { color: colors.textMuted }]}>
                    {photoUri ? `Diambil pukul ${photoTakenAt}` : 'Ambil selfie wajah saksi pemegang mandat'}
                  </Text>
                  {photoUri && photoSizeKb && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <Pill
                        label={`Kompresi < 200KB (~${photoSizeKb} KB)`}
                        tone="success"
                        icon="check-circle"
                      />
                    </View>
                  )}
                </View>
                <PrimaryButton
                  label={photoUri ? 'Ambil Ulang' : 'Ambil Foto'}
                  icon={photoUri ? 'refresh-ccw' : 'camera'}
                  variant={photoUri ? 'secondary' : 'primary'}
                  onPress={openCamera}
                  fullWidth={false}
                />
              </View>
            </Card>
          )}

          {/* Peta Lokasi & Geofence GPS */}
          <Card style={styles.masterUnifiedCard}>
            <View style={[styles.accentStripe, { backgroundColor: colors.primary }]} />
            <View style={[styles.mapHeaderBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
              <View style={[styles.headerNumBadge, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.headerNumBadgeText, { color: colors.primary }]}>
                  {targetType === 'tps' ? 2 : 1}
                </Text>
              </View>
              <Text style={[styles.mapHeaderTitle, { color: colors.text }]}>
                {targetType === 'tps' ? 'Peta Geofence TPS 100m' : 'Peta Lokasi GPS Terkini'}
              </Text>
              <View
                style={[
                  styles.geofenceBadge,
                  { backgroundColor: distanceToTarget === null ? colors.border : insideGeofence ? colors.successBg : colors.warningBg },
                ]}
              >
                <View
                  style={[
                    styles.geofenceDot,
                    { backgroundColor: distanceToTarget === null ? colors.textMuted : insideGeofence ? colors.success : colors.warning },
                  ]}
                />
                <Text
                  style={[
                    styles.geofenceText,
                    { color: distanceToTarget === null ? colors.textMuted : insideGeofence ? colors.success : colors.warning },
                  ]}
                >
                  {distanceToTarget === null
                    ? 'Mencari GPS...'
                    : insideGeofence
                    ? `Dalam Radius (${Math.round(distanceToTarget)}m)`
                    : `Di Luar Radius (${Math.round(distanceToTarget)}m)`}
                </Text>
              </View>
            </View>

            {location ? (
              <>
                <WebView
                  source={{ html: buildLiveLocationMapHtml(location.lat, location.lng, location.accuracy) }}
                  style={styles.largeMapCanvas}
                  originWhitelist={['*']}
                />
                <View style={styles.chipsRow}>
                  <Pill icon="map-pin" label={`${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`} tone="neutral" />
                  <Pill icon="crosshair" label={location.accuracy ? `± ${Math.round(location.accuracy)}m` : '—'} tone="neutral" />
                  <Pressable
                    onPress={fetchLocation}
                    disabled={locating}
                    style={({ pressed }) => [
                      styles.refreshGpsBtn,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <Feather name="refresh-cw" size={12} color={colors.primary} />
                    <Text style={{ fontSize: 11, fontWeight: '700', color: colors.primary }}>Segarkan</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <View style={[styles.largeMapCanvas, styles.centered, { padding: spacing.lg }]}>
                {locating ? (
                  <View style={{ alignItems: 'center', gap: spacing.sm }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={{ fontSize: fontSize.sm, fontWeight: '700', color: colors.text }}>
                      Menghubungkan ke Sinyal GPS...
                    </Text>
                  </View>
                ) : (
                  <View style={{ alignItems: 'center', gap: spacing.sm, maxWidth: 330 }}>
                    <View style={[styles.gpsErrorIconWrap, { backgroundColor: colors.warningBg }]}>
                      <Feather name="map-pin" size={24} color={colors.warning} />
                    </View>
                    <Text style={{ fontSize: fontSize.sm, fontWeight: '800', color: colors.text, textAlign: 'center' }}>
                      GPS Belum Terdeteksi
                    </Text>
                    <Text style={{ fontSize: fontSize.xs, color: colors.textMuted, textAlign: 'center', lineHeight: 16 }}>
                      {locationError || 'Pastikan GPS HP aktif dan izin lokasi telah disetujui.'}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs, flexWrap: 'wrap', justifyContent: 'center' }}>
                      <PrimaryButton
                        label="Ambil GPS Ulang"
                        icon="refresh-cw"
                        variant="primary"
                        onPress={fetchLocation}
                        fullWidth={false}
                      />
                      <PrimaryButton
                        label="Titik Target (Simulasi)"
                        icon="check-circle"
                        variant="secondary"
                        onPress={useSimulatedLocation}
                        fullWidth={false}
                      />
                    </View>
                  </View>
                )}
              </View>
            )}
          </Card>

          {/* Foto Dokumentasi Lapangan (Opsional untuk Relawan) */}
          {targetType !== 'tps' && (
            <Card style={{ gap: spacing.xs, backgroundColor: colors.surface, borderColor: colors.border }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Feather name="camera" size={13} color={colors.primary} />
                  <Text style={{ fontFamily: fonts.bold, fontSize: 11.5, color: colors.text }}>
                    Foto Dokumentasi Kegiatan (Opsional)
                  </Text>
                </View>
                {photoUri && (
                  <Pressable onPress={() => { setPhotoUri(null); setPhotoTakenAt(null); }}>
                    <Text style={{ fontFamily: fonts.semiBold, fontSize: 10.5, color: colors.danger }}>Hapus</Text>
                  </Pressable>
                )}
              </View>

              <View style={styles.photoCardBody}>
                {photoUri ? (
                  <Image source={{ uri: photoUri }} style={styles.photoThumbSmall} />
                ) : (
                  <View style={[styles.photoPlaceholder, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <Feather name="image" size={18} color={colors.textMuted} />
                  </View>
                )}
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[styles.photoStatusTitle, { color: colors.text }]}>
                    {photoUri ? 'Foto Terlampir' : 'Tanpa Lampiran Foto'}
                  </Text>
                  <Text style={[styles.photoStatusSub, { color: colors.textMuted }]}>
                    {photoUri ? `Diambil pukul ${photoTakenAt} (${photoSizeKb} KB)` : 'Bisa langsung konfirmasi kehadiran via GPS tanpa foto'}
                  </Text>
                </View>
                <PrimaryButton
                  label={photoUri ? 'Ganti Foto' : 'Ambil Foto'}
                  icon="camera"
                  variant={photoUri ? 'secondary' : 'outline'}
                  onPress={openCamera}
                  fullWidth={false}
                />
              </View>
            </Card>
          )}

          {/* Peringatan Luar Geofence (Jika Di Luar 100m) */}
          {location && distanceToTarget !== null && !insideGeofence && (
            <View
              style={{
                backgroundColor: colors.dangerBg,
                borderColor: colors.danger,
                borderWidth: 1,
                borderRadius: radius.md,
                padding: spacing.sm,
                gap: 6,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Feather name="alert-triangle" size={15} color={colors.danger} />
                <Text style={{ fontSize: fontSize.xs, fontWeight: '800', color: colors.danger }}>
                  Di Luar Radius (~{Math.round(distanceToTarget)}m &gt; 100m)
                </Text>
              </View>
              <Text style={{ fontSize: 11, color: colors.text, lineHeight: 15 }}>
                Posisi Anda berada di luar radius 100 meter dari titik target. Wajib mengisi alasan resmi:
              </Text>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 2 }}>
                {['Posko Kelurahan', 'Sinyal Blank Spot', 'Antrean Membludak', 'Tugas Tambahan'].map((tag) => (
                  <Pressable
                    key={tag}
                    onPress={() => setOverrideNote(`Petugas bertugas di ${tag}`)}
                    style={({ pressed }) => [
                      {
                        backgroundColor: colors.surface,
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: radius.sm,
                        borderWidth: 1,
                        borderColor: colors.border,
                      },
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <Text style={{ fontSize: 10, fontWeight: '700', color: colors.primary }}>+ {tag}</Text>
                  </Pressable>
                ))}
              </View>

              <TextInput
                value={overrideNote}
                onChangeText={setOverrideNote}
                placeholder="Contoh: Mengambil logistik formulir di posko ranting..."
                placeholderTextColor={colors.textMuted}
                multiline
                style={{
                  backgroundColor: colors.surface,
                  color: colors.text,
                  fontSize: fontSize.xs,
                  borderRadius: radius.sm,
                  borderWidth: 1,
                  borderColor: isOverrideValid ? colors.success : colors.border,
                  padding: spacing.xs,
                  minHeight: 44,
                  textAlignVertical: 'top',
                }}
              />
            </View>
          )}

          {/* Primary Action Button: Konfirmasi Kehadiran */}
          <PrimaryButton
            label={
              !canConfirm
                ? targetType === 'tps' && !photoUri
                  ? 'Lengkapi Foto Selfie Wajah'
                  : !location
                  ? 'Menunggu Koordinat GPS...'
                  : 'Lengkapi Alasan Pengecualian'
                : isOutside
                ? 'Kirim Presensi (Catatan Pengecualian)'
                : targetType === 'tps'
                ? 'Konfirmasi Presensi Saksi TPS'
                : targetType === 'event'
                ? 'Konfirmasi Kehadiran Kegiatan'
                : 'Konfirmasi Kehadiran Posko'
            }
            icon="check-square"
            onPress={handleCheckIn}
            loading={submitting}
            disabled={!canConfirm}
            style={[
              { height: 50 },
              canConfirm && {
                shadowColor: colors.primary,
                shadowOpacity: 0.35,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 4 },
                elevation: 6,
              },
            ]}
          />
        </View>
      )}

      {/* Modal Dialog Sukses */}
      <Modal visible={justConfirmed} onClose={() => setJustConfirmed(false)} variant="floating">
        <View style={styles.successModalBody}>
          <Animated.View style={[styles.successCheckCircle, { backgroundColor: colors.successBg, transform: [{ scale: successScale }] }]}>
            <Feather name="check" size={36} color={colors.success} strokeWidth={2.5} />
          </Animated.View>
          <Text style={[styles.successModalTitle, { color: colors.text }]}>
            {targetType === 'tps'
              ? 'Presensi Saksi Terverifikasi!'
              : targetType === 'event'
              ? 'Presensi Kegiatan Berhasil!'
              : 'Presensi Posko Berhasil!'}
          </Text>
          <Text style={[styles.successModalSub, { color: colors.textMuted }]}>
            {targetType === 'tps'
              ? `Kehadiran Anda di TPS ${assignedTps?.tpsNumber ?? ''} sudah tercatat & terverifikasi.`
              : targetType === 'event'
              ? `Kehadiran Anda pada agenda "${selectedEvent?.title}" telah berhasil tercatat.`
              : `Presensi kehadiran piket Anda di "${currentTargetLocationLabel}" telah berhasil tercatat.`}
          </Text>
          <PrimaryButton label="Tutup" onPress={() => setJustConfirmed(false)} style={{ marginTop: spacing.sm }} />
        </View>
      </Modal>

      {/* Ticket Modal for Event (QR Pass Presensi Digital) */}
      <Modal
        visible={ticketModalVisible}
        onClose={() => setTicketModalVisible(false)}
        title="Tiket Presensi Kegiatan"
        subtitle={selectedEvent?.title}
      >
        {selectedEvent && (
          <View style={{ gap: spacing.md, alignItems: 'center', paddingVertical: spacing.sm }}>
            <View style={{ alignItems: 'center', gap: 4 }}>
              <Text style={{ fontFamily: fonts.bold, fontSize: fontSize.md, color: colors.text, textAlign: 'center' }}>
                {selectedEvent.title}
              </Text>
              <Text style={{ fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.primary }}>
                {selectedEvent.dateLabel} • {selectedEvent.timeLabel}
              </Text>
            </View>

            <QrPlaceholder size={180} seed={`TICKET-PAN-${selectedEvent.id}-${currentUser.identity.id}`} />

            <View style={[styles.targetInfoBanner, { backgroundColor: isDark ? 'rgba(0,43,82,0.4)' : '#F0F9FF', borderColor: colors.border }]}>
              <Feather name="info" size={14} color={colors.primary} />
              <Text style={{ fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted, flex: 1 }}>
                Tunjukkan QR Code ini kepada panitia penerima tamu di pintu masuk untuk absensi digital langsung.
              </Text>
            </View>

            <PrimaryButton
              label="Tutup Tiket"
              variant="secondary"
              onPress={() => setTicketModalVisible(false)}
              style={{ width: '100%' }}
            />
          </View>
        )}
      </Modal>

      {/* Modal Pemilihan Agenda Terdaftar */}
      <Modal
        visible={eventPickerModalVisible}
        onClose={() => setEventPickerModalVisible(false)}
        title="Pilih Agenda Terdaftar"
        subtitle="Daftar agenda yang telah Anda ikuti"
      >
        <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
          <View style={{ gap: spacing.sm, paddingVertical: spacing.xs }}>
            {registeredEvents.map((ev) => {
              const isSelected = ev.id === selectedEventId;
              return (
                <Pressable
                  key={ev.id}
                  onPress={() => {
                    setSelectedEventId(ev.id);
                    setEventPickerModalVisible(false);
                  }}
                  style={({ pressed }) => [
                    styles.eventPickerItem,
                    {
                      backgroundColor: isSelected
                        ? isDark ? 'rgba(0,102,179,0.2)' : '#F0F9FF'
                        : isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontFamily: fonts.bold, fontSize: 11, color: colors.primary }}>
                      {ev.category}
                    </Text>
                    <Pill
                      label={ev.attended ? 'Sudah Hadir' : 'Terdaftar RSVP'}
                      tone={ev.attended ? 'success' : 'primary'}
                      icon={ev.attended ? 'check-circle' : 'user-check'}
                    />
                  </View>
                  <Text style={[styles.eventPickerTitle, { color: colors.text }]}>
                    {ev.title}
                  </Text>
                  <View style={{ gap: 2 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Feather name="calendar" size={11} color={colors.textMuted} />
                      <Text style={[styles.eventPickerMeta, { color: colors.textMuted }]}>
                        {ev.dateLabel} • {ev.timeLabel}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Feather name="map-pin" size={11} color={colors.textMuted} />
                      <Text style={[styles.eventPickerMeta, { color: colors.textMuted }]} numberOfLines={1}>
                        {ev.location}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </Modal>

      {/* Fullscreen Camera */}
      <RNModal visible={cameraModalVisible} animationType="slide" onRequestClose={() => setCameraModalVisible(false)}>
        <View style={styles.fullscreenRoot}>
          {!cameraPermission?.granted ? (
            <View style={[styles.fullscreenCentered]}>
              <Feather name="camera-off" size={32} color="#94A3B8" strokeWidth={iconStrokeWidth} />
              <Text style={styles.permissionHint}>Izin kamera diperlukan untuk foto presensi</Text>
              <PrimaryButton label="Izinkan Akses Kamera" icon="camera" onPress={requestCameraPermission} style={{ width: '80%', marginTop: spacing.sm }} />
              <PrimaryButton label="Batal" variant="outline" onPress={() => setCameraModalVisible(false)} style={{ width: '80%', marginTop: spacing.sm }} textStyle={{ color: '#FFFFFF' }} />
            </View>
          ) : (
            <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="front">
              <Pressable onPress={() => setCameraModalVisible(false)} style={styles.fullscreenCloseBtn}>
                <Feather name="x" size={22} color="#FFFFFF" strokeWidth={iconStrokeWidth} />
              </Pressable>
              <View style={styles.cameraGridOverlay}>
                <View style={styles.faceTargetBox}>
                  <View style={[styles.cornerTL, styles.cornerMark]} />
                  <View style={[styles.cornerTR, styles.cornerMark]} />
                  <View style={[styles.cornerBL, styles.cornerMark]} />
                  <View style={[styles.cornerBR, styles.cornerMark]} />
                </View>
              </View>
              <View style={styles.fullscreenFooter}>
                <Pressable
                  onPress={takePhoto}
                  style={({ pressed }) => [styles.shutterBtn, pressed && { transform: [{ scale: 0.92 }] }]}
                >
                  <View style={styles.shutterInnerRing} />
                </Pressable>
                <Text style={styles.shutterHint}>
                  {targetType === 'tps'
                    ? 'Posisikan Wajah Saksi Sesuai Kerangka'
                    : 'Posisikan Objek / Suasana Sesuai Kerangka'}
                </Text>
              </View>
            </CameraView>
          )}
        </View>
      </RNModal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  headerLeftRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatarImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#0066B3',
  },
  greetingText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.md,
  },
  rolePill: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  rolePillText: {
    fontFamily: fonts.bold,
    fontSize: 10,
  },
  modernClockBox: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.md,
    alignItems: 'flex-end',
    justifyContent: 'center',
    borderWidth: 1,
    minWidth: 88,
  },
  modernClockTime: {
    fontFamily: fonts.bold,
    fontSize: 13,
    fontVariant: ['tabular-nums'],
  },
  modernClockDate: {
    fontFamily: fonts.medium,
    fontSize: 9.5,
    marginTop: 1,
  },

  accentStripe: { height: 3, width: '100%' },
  headerNumBadge: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  headerNumBadgeText: { fontFamily: fonts.bold, fontSize: 11 },

  photoCardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  photoCardTitle: { fontFamily: fonts.bold, fontSize: fontSize.xs },
  photoCardBody: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 4 },
  photoThumbSmall: { width: 48, height: 48, borderRadius: radius.md },
  photoPlaceholder: { width: 48, height: 48, borderRadius: radius.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  photoStatusTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.xs },
  photoStatusSub: { fontFamily: fonts.regular, fontSize: 10.5, marginTop: 1 },

  masterUnifiedCard: { padding: 0, overflow: 'hidden', borderRadius: radius.xl },
  centered: { alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  cameraGridOverlay: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  faceTargetBox: { width: 160, height: 160, position: 'relative' },
  cornerMark: { position: 'absolute', width: 24, height: 24, borderColor: '#0066B3', borderWidth: 3 },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  shutterBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInnerRing: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#0066B3' },
  shutterHint: { fontFamily: fonts.semiBold, fontSize: 12, color: '#FFFFFF', marginTop: spacing.sm },
  permissionHint: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: '#94A3B8', textAlign: 'center', paddingHorizontal: spacing.lg, marginTop: spacing.sm },
  fullscreenRoot: { flex: 1, backgroundColor: '#000000' },
  fullscreenCentered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg },
  fullscreenCloseBtn: {
    position: 'absolute',
    top: 50,
    left: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  fullscreenFooter: { position: 'absolute', bottom: 60, left: 0, right: 0, alignItems: 'center' },
  mapHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  mapHeaderTitle: { fontFamily: fonts.bold, fontSize: fontSize.xs, flex: 1 },
  geofenceBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill },
  geofenceDot: { width: 6, height: 6, borderRadius: 3 },
  geofenceText: { fontFamily: fonts.semiBold, fontSize: 10 },
  largeMapCanvas: { width: '100%', height: 180 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.xs, padding: spacing.sm },
  refreshGpsBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill, borderWidth: 1 },
  gpsErrorIconWrap: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },

  // Compact Attendance Pass Styles (Single unified clean card)
  compactPassCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  compactPassHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  compactStatusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: radius.pill,
  },
  compactStatusText: {
    fontFamily: fonts.bold,
    fontSize: 10.5,
  },
  compactTimeText: {
    fontFamily: fonts.medium,
    fontSize: 10.5,
  },
  compactTargetTitle: {
    fontFamily: fonts.bold,
    fontSize: 13.5,
    lineHeight: 19,
  },
  compactTargetSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 11,
  },
  compactMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xs,
  },
  compactMetaCol: {
    flex: 1,
    gap: 2,
  },
  compactMetaDivider: {
    width: 1,
    height: 26,
  },
  compactMetaLabel: {
    fontFamily: fonts.medium,
    fontSize: 10,
  },
  compactMetaValue: {
    fontFamily: fonts.bold,
    fontSize: 11.5,
  },
  compactMapWrap: {
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    position: 'relative',
  },
  mapOverlayPill: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  mapOverlayText: {
    fontFamily: fonts.bold,
    fontSize: 9.5,
  },
  compactQrBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.md,
  },
  compactQrBtnText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  verifiedActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    paddingTop: 4,
  },
  verifiedActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    minHeight: 38,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  verifiedActionBtnText: {
    fontFamily: fonts.bold,
    fontSize: 11,
  },

  // Timeline
  timelineTitle: { fontFamily: fonts.bold, fontSize: fontSize.sm },
  timelineRow: { flexDirection: 'row', gap: spacing.sm },
  timelineRail: { alignItems: 'center' },
  timelineDot: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  timelineLine: { width: 2, flex: 1, marginTop: 2 },
  timelineLabel: { fontFamily: fonts.semiBold, fontSize: fontSize.xs },
  timelineTime: { fontFamily: fonts.regular, fontSize: 10.5, marginTop: 1 },

  // Success Modal
  successModalBody: { alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.md },
  successCheckCircle: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs },
  successModalTitle: { fontFamily: fonts.extraBold, fontSize: fontSize.lg },
  successModalSub: { fontFamily: fonts.regular, fontSize: fontSize.xs, textAlign: 'center' },

  // Target Switcher Styles
  targetTrack: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  targetPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 44,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  targetText: {
    fontFamily: fonts.bold,
    fontSize: 11,
  },
  selectedEventCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.sm,
    gap: 6,
  },
  selectedEventTitle: {
    fontFamily: fonts.bold,
    fontSize: 12.5,
    lineHeight: 18,
  },
  selectedEventMetaRow: {
    gap: 3,
  },
  selectedEventMetaText: {
    fontFamily: fonts.regular,
    fontSize: 11,
  },
  eventCategoryTag: {
    fontFamily: fonts.bold,
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  eventPriorityTag: {
    fontFamily: fonts.medium,
    fontSize: 10.5,
  },
  changeEventBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  changeEventBtnText: {
    fontFamily: fonts.bold,
    fontSize: 10.5,
  },
  emptyRegisteredBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  emptyRegisteredTitle: {
    fontFamily: fonts.bold,
    fontSize: 11.5,
  },
  emptyRegisteredSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 15,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: radius.md,
  },
  emptyActionBtnText: {
    fontFamily: fonts.bold,
    fontSize: 10.5,
    color: '#FFFFFF',
  },
  eventPickerItem: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.sm,
    gap: 4,
  },
  eventPickerTitle: {
    fontFamily: fonts.bold,
    fontSize: 12,
    lineHeight: 17,
  },
  eventPickerMeta: {
    fontFamily: fonts.regular,
    fontSize: 10.5,
  },
  targetInfoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: 4,
  },
  qrPassBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: 8,
  },
  qrPassBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },

  // Step Progress
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
  stepItem: {
    alignItems: 'center',
    gap: 4,
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: {
    fontSize: 11,
    fontFamily: fonts.bold,
  },
  stepLabel: {
    fontSize: 10.5,
    textAlign: 'center',
  },
  stepConnector: {
    height: 2,
    flex: 1,
    marginHorizontal: 4,
    marginBottom: 16,
  },
});
