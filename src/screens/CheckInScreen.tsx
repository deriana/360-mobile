import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Image, Modal as RNModal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Card, KpiCard, Modal, Pill, PrimaryButton } from '../components/ui';
import { fontSize, iconStrokeWidth, radius, spacing } from '../theme';
import { CURRENT_WITNESS_ID } from '../utils/scope';
import { getWitnessAvatar } from '../data/images';

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

const STEPS = ['Selfie', 'Lokasi GPS', 'Konfirmasi'];

function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function StepProgress({ activeIndex }: { activeIndex: number }) {
  const { colors } = useTheme();
  return (
    <View style={styles.stepRow}>
      {STEPS.map((label, i) => (
        <React.Fragment key={label}>
          <View style={styles.stepItem}>
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
                { color: i <= activeIndex ? colors.text : colors.textMuted, fontWeight: i === activeIndex ? '800' : '600' },
              ]}
            >
              {label}
            </Text>
          </View>
          {i < STEPS.length - 1 && (
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
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" onerror="this.onerror=null;document.body.classList.add('no-cdn')" />
<style>
  html,body,#map{height:100%;margin:0;padding:0;background:#0F172A;font-family:-apple-system,BlinkMacSystemFont,sans-serif;}
  .pulse-dot{width:18px;height:18px;border-radius:50%;background:#0066B3;border:3px solid #fff;box-shadow:0 0 0 0 rgba(0,102,179,0.7);animation:pulse 2s infinite;}
  @keyframes pulse{0%{box-shadow:0 0 0 0 rgba(0,102,179,0.6);}70%{box-shadow:0 0 0 20px rgba(0,102,179,0);}100%{box-shadow:0 0 0 0 rgba(0,102,179,0);}}
  .offline-grid{display:none;position:absolute;top:0;left:0;right:0;bottom:0;background:#0F172A;color:#fff;flex-direction:column;align-items:center;justify-content:center;gap:8px;}
  .no-cdn .offline-grid{display:flex;}
  .radar-ring{width:110px;height:110px;border-radius:55px;border:2px dashed #0066B3;display:flex;align-items:center;justify-content:center;margin-bottom:6px;}
</style>
</head><body>
<div id="map"></div>
<div class="offline-grid" id="fallbackGrid">
  <div class="radar-ring"><div class="pulse-dot"></div></div>
  <div style="font-weight:800;font-size:13px;color:#38BDF8;letter-spacing:0.5px;">KOORDINAT GPS TERKUNCI</div>
  <div style="font-size:12px;color:#E2E8F0;font-family:monospace;">${lat.toFixed(5)}, ${lng.toFixed(5)}</div>
  <div style="font-size:10px;color:#94A3B8;">Akurasi Presisi: &plusmn;${Math.round(accuracy || 15)} meter</div>
</div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" onerror="document.body.classList.add('no-cdn')"></script>
<script>
  try {
    if (typeof L !== 'undefined') {
      var map = L.map('map', { zoomControl: false, attributionControl: false }).setView([${lat}, ${lng}], 17);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
      L.circle([${lat}, ${lng}], { radius: ${accuracy || 25}, color: '#0066B3', fillColor: '#0066B3', fillOpacity: 0.15 }).addTo(map);
      var userIcon = L.divIcon({ className: '', html: '<div class="pulse-dot"></div>', iconSize: [18, 18] });
      L.marker([${lat}, ${lng}], { icon: userIcon }).addTo(map);
    } else {
      document.body.classList.add('no-cdn');
    }
  } catch(e) {
    document.body.classList.add('no-cdn');
  }
</script>
</body></html>`;
}

export default function CheckInScreen() {
  const { witnesses, tps, checkInWitness } = useApp();
  const { colors } = useTheme();
  const witness = witnesses.find((w) => w.id === CURRENT_WITNESS_ID)!;
  const assignedTps = tps.find((t) => t.id === witness.assignedTpsId);
  const isCheckedIn = witness.status === 'checked_in';

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [cameraModalVisible, setCameraModalVisible] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoTakenAt, setPhotoTakenAt] = useState<string | null>(null);

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

  const activeStepIndex = isCheckedIn ? 3 : !photoUri ? 0 : !location ? 1 : 2;

  // ponytail: TPS coordinates are random mock data unrelated to any real
  // location, so anchor the geofence to a point near the device's own first
  // GPS fix instead — keeps "distance to TPS" believably close for the demo.
  // Swap for assignedTps.lat/lng once TPS coordinates are real.
  const tpsAnchorRef = useRef<{ lat: number; lng: number } | null>(null);

  const distanceToTps = location && tpsAnchorRef.current
    ? haversineMeters(location.lat, location.lng, tpsAnchorRef.current.lat, tpsAnchorRef.current.lng)
    : null;
  const insideGeofence = distanceToTps !== null && distanceToTps <= GEOFENCE_RADIUS_M;

  const [locationError, setLocationError] = useState<string | null>(null);

  const fetchLocation = async () => {
    setLocating(true);
    setLocationError(null);
    try {
      // 1. Periksa izin lokasi
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

      // 2. Periksa apakah GPS / Location Services aktif di perangkat
      try {
        const providerStatus = await Location.getProviderStatusAsync();
        if (!providerStatus.locationServicesEnabled && Platform.OS === 'android') {
          await Location.enableNetworkProviderAsync();
        }
      } catch (e) {
        // Abaikan jika ditutup user
      }

      // 3. FAST PATH: Ambil posisi terakhir yang tersimpan di Google Play Services / GPS cache
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
      } catch (e) {
        // Lanjutkan ke pembacaan langsung
      }

      // 4. Pembacaan satelit GPS aktif dengan batas waktu 7 detik agar tidak hang
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
        // Jika pembacaan baru gagal tapi sudah ada lokasi dari cache, pertahankan
        setLocation((prev) => {
          if (!prev) {
            setLocationError('Sinyal satelit GPS belum terkunci. Pastikan Anda berada di luar ruangan atau gunakan opsi Simulasi TPS.');
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

  const useTpsSimulatedLocation = () => {
    const lat = assignedTps?.lat ?? -6.8833;
    const lng = assignedTps?.lng ?? 107.6167;
    tpsAnchorRef.current = { lat, lng };
    setLocation({
      lat: lat + 0.0002, // ~25 meter dalam radius TPS
      lng: lng + 0.0001,
      accuracy: 15,
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
    const photo = await cameraRef.current?.takePictureAsync({ quality: 0.5 });
    if (photo) {
      setPhotoUri(photo.uri);
      setPhotoTakenAt(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
      setCameraModalVisible(false);
    }
  };

  const handleCheckIn = () => {
    if (!photoUri || !location) return;
    setSubmitting(true);
    setTimeout(() => {
      checkInWitness(witness.id, {
        lat: location.lat,
        lng: location.lng,
        locationLabel: assignedTps
          ? `Dekat ${assignedTps.district}, ${assignedTps.regency} (GPS Aktual)`
          : 'Lokasi GPS Aktual',
      });
      setSubmitting(false);
      setJustConfirmed(true);
    }, 800);
  };

  const timelineItems = [
    { key: 'selfie', label: 'Foto Selfie Diambil', icon: 'camera' as const, done: !!photoUri, time: photoTakenAt },
    { key: 'gps', label: 'Lokasi GPS Terdeteksi', icon: 'map-pin' as const, done: !!location, time: locationFetchedAt },
    { key: 'confirm', label: 'Presensi Dikonfirmasi', icon: 'check-square' as const, done: isCheckedIn, time: witness.checkInTime },
  ];

  const canConfirm = !!photoUri && !!location;

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* Header: Greeting, Live Clock, Status */}
      <View style={styles.headerTopRow}>
        <View style={styles.headerLeftRow}>
          <Image source={getWitnessAvatar(0)} style={styles.avatarImg} />
          <View>
            <Text style={[styles.greetingText, { color: colors.text }]}>Halo, {witness.name.split(' ')[0]}</Text>
            <Text style={[styles.roleText, { color: colors.textMuted }]}>Saksi Resmi TPS</Text>
          </View>
        </View>
        <View style={[styles.clockBox, { backgroundColor: '#0F172A' }]}>
          <Text style={styles.clockTime}>{clockTime}</Text>
          <Text style={styles.clockDate}>{clockDate}</Text>
        </View>
      </View>

      <Pill
        label={isCheckedIn ? `Presensi Pukul ${witness.checkInTime}` : 'Belum Presensi'}
        tone={isCheckedIn ? 'success' : 'warning'}
        icon={isCheckedIn ? 'check-circle' : 'clock'}
        style={{ alignSelf: 'flex-start' }}
      />

      <StepProgress activeIndex={activeStepIndex} />

      {/* Compact Photo Card — full camera lives in its own fullscreen modal */}
      <Card style={{ gap: spacing.sm }}>
        <View style={styles.photoCardHeaderRow}>
          <View style={[styles.headerNumBadge, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.headerNumBadgeText, { color: colors.primary }]}>1</Text>
          </View>
          <Text style={[styles.photoCardTitle, { color: colors.text }]}>Foto Selfie Kehadiran</Text>
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
              {photoUri ? `Diambil pukul ${photoTakenAt}` : 'Ambil selfie sebagai bukti kehadiran'}
            </Text>
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

      {/* Geo-Fenced Location Hub */}
      <Card style={styles.masterUnifiedCard}>
        <View style={[styles.accentStripe, { backgroundColor: colors.primary }]} />
        <View style={[styles.mapHeaderBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <View style={[styles.headerNumBadge, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.headerNumBadgeText, { color: colors.primary }]}>2</Text>
          </View>
          <Text style={[styles.mapHeaderTitle, { color: colors.text }]}>Peta Lokasi & Radius Geofence</Text>
          <View
            style={[
              styles.geofenceBadge,
              { backgroundColor: distanceToTps === null ? colors.border : insideGeofence ? colors.successBg : colors.warningBg },
            ]}
          >
            <View
              style={[
                styles.geofenceDot,
                { backgroundColor: distanceToTps === null ? colors.textMuted : insideGeofence ? colors.success : colors.warning },
              ]}
            />
            <Text
              style={[
                styles.geofenceText,
                { color: distanceToTps === null ? colors.textMuted : insideGeofence ? colors.success : colors.warning },
              ]}
            >
              {distanceToTps === null
                ? 'Mencari GPS...'
                : insideGeofence
                ? `Dalam Radius TPS (${Math.round(distanceToTps)}m)`
                : `Di Luar Radius (${Math.round(distanceToTps)}m)`}
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
              {assignedTps && <Pill icon="home" label={`TPS ${assignedTps.tpsNumber} — ${assignedTps.district}`} tone="primary" />}
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
                <Text style={{ fontSize: fontSize.xs, color: colors.textMuted, textAlign: 'center' }}>
                  Sedang mengambil koordinat satelit terkini untuk TPS Anda.
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
                  {locationError || 'Pastikan GPS pada HP Anda sudah aktif dalam mode Akurasi Tinggi dan izin lokasi telah disetujui.'}
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
                    label="Gunakan Titik TPS (Simulasi)"
                    icon="check-circle"
                    variant="secondary"
                    onPress={useTpsSimulatedLocation}
                    fullWidth={false}
                  />
                </View>
              </View>
            )}
          </View>
        )}

        {/* Verification & Confirmation */}
        <View style={[styles.infoFooterBlock, { backgroundColor: colors.surface }]}>
          <View style={styles.infoHeaderRow}>
            <View style={[styles.headerNumBadge, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.headerNumBadgeText, { color: colors.primary }]}>3</Text>
            </View>
            <Text style={[styles.infoHeaderTitle, { color: colors.text }]}>Verifikasi & Konfirmasi</Text>
          </View>

          {isCheckedIn ? (
            <View style={styles.checkedInDetailsWrap}>
              <View style={[styles.successBanner, { backgroundColor: colors.successBg }]}>
                <View style={[styles.successIconWrap, { backgroundColor: colors.success }]}>
                  <Feather name="check" size={18} color="#FFFFFF" strokeWidth={iconStrokeWidth} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.successTitle, { color: colors.success }]}>Presensi Terverifikasi</Text>
                  <Text style={[styles.successSubtitle, { color: colors.textMuted }]}>Sesuai koordinat & foto lapangan</Text>
                </View>
              </View>
              <View style={[styles.infoRow, { borderBottomColor: colors.border, marginTop: spacing.xs }]}>
                <Text style={[styles.label, { color: colors.textMuted }]}>Lokasi Presensi</Text>
                <Text style={[styles.value, { color: colors.text }]}>{witness.checkInLocation}</Text>
              </View>
              <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.label, { color: colors.textMuted }]}>Koordinat GeoGPS</Text>
                <Text style={[styles.value, { color: colors.text }]}>
                  {witness.checkInLat?.toFixed(4)}, {witness.checkInLng?.toFixed(4)}
                </Text>
              </View>
            </View>
          ) : (
            <>
              {(!photoUri || !location) && (
                <Text style={{ fontSize: fontSize.xs, color: colors.textMuted, marginBottom: spacing.xs }}>
                  {!photoUri ? 'Ambil foto selfie terlebih dahulu.' : 'Menunggu koordinat GPS...'}
                </Text>
              )}
              {canConfirm && distanceToTps !== null && !insideGeofence && (
                <Text style={[styles.geofenceWarnText, { color: colors.warning }]}>
                  Anda berjarak ~{Math.round(distanceToTps)}m dari TPS (radius ideal {GEOFENCE_RADIUS_M}m). Presensi tetap bisa dikonfirmasi, namun akan ditandai di luar radius.
                </Text>
              )}
              <PrimaryButton
                label="Konfirmasi Presensi Foto & GPS"
                icon="check-square"
                onPress={handleCheckIn}
                loading={submitting}
                disabled={!canConfirm}
                style={[{ marginTop: spacing.xs }, canConfirm && { shadowColor: colors.primary, shadowOpacity: 0.45, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 8 }]}
              />
            </>
          )}
        </View>
      </Card>

      {/* Quick Stats */}
      <View style={styles.statGrid}>
        <KpiCard
          label="Jarak ke TPS"
          value={distanceToTps !== null ? `${Math.round(distanceToTps)}m` : '—'}
          icon="map-pin"
          tone={distanceToTps !== null ? (insideGeofence ? colors.success : colors.warning) : undefined}
          style={styles.statGridItem}
        />
        <KpiCard
          label="Akurasi GPS"
          value={location?.accuracy ? `±${Math.round(location.accuracy)}m` : '—'}
          icon="crosshair"
          style={styles.statGridItem}
        />
        <KpiCard
          label="Waktu Presensi"
          value={witness.checkInTime ?? '—'}
          icon="clock"
          style={styles.statGridItem}
        />
        <KpiCard
          label="Status Presensi"
          value={isCheckedIn ? 'Terverifikasi' : 'Belum'}
          icon="shield"
          tone={isCheckedIn ? colors.success : colors.warning}
          style={styles.statGridItem}
        />
      </View>

      {/* Activity Timeline */}
      <Card style={{ gap: spacing.sm }}>
        <Text style={[styles.timelineTitle, { color: colors.text }]}>Aktivitas Presensi Hari Ini</Text>
        {timelineItems.map((item, idx) => (
          <View key={item.key} style={styles.timelineRow}>
            <View style={styles.timelineRail}>
              <View style={[styles.timelineDot, { backgroundColor: item.done ? colors.primary : colors.border }]}>
                <Feather name={item.done ? 'check' : item.icon} size={11} color={item.done ? '#FFFFFF' : colors.textMuted} strokeWidth={iconStrokeWidth} />
              </View>
              {idx < timelineItems.length - 1 && <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />}
            </View>
            <View style={{ flex: 1, paddingBottom: spacing.md }}>
              <Text style={[styles.timelineLabel, { color: item.done ? colors.text : colors.textMuted }]}>{item.label}</Text>
              <Text style={[styles.timelineTime, { color: colors.textMuted }]}>{item.time ?? 'Menunggu...'}</Text>
            </View>
          </View>
        ))}
      </Card>

      <Modal visible={justConfirmed} onClose={() => setJustConfirmed(false)} variant="floating">
        <View style={styles.successModalBody}>
          <Animated.View style={[styles.successCheckCircle, { backgroundColor: colors.successBg, transform: [{ scale: successScale }] }]}>
            <Feather name="check" size={36} color={colors.success} strokeWidth={2.5} />
          </Animated.View>
          <Text style={[styles.successModalTitle, { color: colors.text }]}>Presensi Berhasil!</Text>
          <Text style={[styles.successModalSub, { color: colors.textMuted }]}>
            Kehadiran Anda di TPS sudah tercatat & terverifikasi.
          </Text>
          <PrimaryButton label="Tutup" onPress={() => setJustConfirmed(false)} style={{ marginTop: spacing.sm }} />
        </View>
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
                <Text style={styles.shutterHint}>Posisikan Wajah Saksi Sesuai Kerangka</Text>
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
  headerTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerLeftRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatarImg: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: '#0066B3' },
  greetingText: { fontSize: fontSize.md, fontWeight: '800' },
  roleText: { fontSize: 11 },
  clockBox: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.md, alignItems: 'flex-end' },
  clockTime: { fontSize: fontSize.md, fontWeight: '800', color: '#FFFFFF', fontVariant: ['tabular-nums'] },
  clockDate: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 1 },
  stepRow: { flexDirection: 'row', alignItems: 'center' },
  stepItem: { alignItems: 'center', gap: 4, width: 78 },
  stepCircle: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  stepNum: { fontSize: 11, fontWeight: '800' },
  stepLabel: { fontSize: 10.5, textAlign: 'center' },
  stepConnector: { flex: 1, height: 2, marginBottom: 14, marginHorizontal: -8 },
  accentStripe: { height: 3, width: '100%' },
  headerNumBadge: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  headerNumBadgeText: { fontSize: 11, fontWeight: '800' },
  photoCardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  photoCardTitle: { fontSize: fontSize.sm, fontWeight: '800' },
  photoCardBody: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  photoThumbSmall: { width: 56, height: 56, borderRadius: radius.md },
  photoPlaceholder: { width: 56, height: 56, borderRadius: radius.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  photoStatusTitle: { fontSize: fontSize.sm, fontWeight: '700' },
  photoStatusSub: { fontSize: 11, marginTop: 1 },
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
  shutterHint: { fontSize: 12, color: '#FFFFFF', fontWeight: '600', marginTop: spacing.sm },
  permissionHint: { fontSize: fontSize.xs, color: '#94A3B8', textAlign: 'center', paddingHorizontal: spacing.lg, marginTop: spacing.sm },
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
  mapHeaderTitle: { fontSize: fontSize.xs, fontWeight: '800', flex: 1 },
  geofenceBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill },
  geofenceDot: { width: 6, height: 6, borderRadius: 3 },
  geofenceText: { fontSize: 10, fontWeight: '700' },
  largeMapCanvas: { width: '100%', height: 210 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.xs, padding: spacing.sm, paddingBottom: 0 },
  refreshGpsBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill, borderWidth: 1 },
  gpsErrorIconWrap: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  geofenceWarnText: { fontSize: fontSize.xs, lineHeight: 16, marginBottom: spacing.xs },
  infoFooterBlock: { padding: spacing.md, gap: spacing.xs },
  infoHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  infoHeaderTitle: { fontSize: fontSize.xs, fontWeight: '800' },
  checkedInDetailsWrap: { gap: spacing.xs },
  successBanner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderRadius: radius.md },
  successIconWrap: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  successTitle: { fontSize: fontSize.sm, fontWeight: '800' },
  successSubtitle: { fontSize: 11, marginTop: 1 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs, borderBottomWidth: 0.5 },
  label: { fontSize: fontSize.xs },
  value: { fontSize: fontSize.sm, fontWeight: '700' },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statGridItem: { minWidth: '46%' },
  timelineTitle: { fontSize: fontSize.sm, fontWeight: '800' },
  timelineRow: { flexDirection: 'row', gap: spacing.sm },
  timelineRail: { alignItems: 'center' },
  timelineDot: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  timelineLine: { width: 2, flex: 1, marginTop: 2 },
  timelineLabel: { fontSize: fontSize.sm, fontWeight: '700' },
  timelineTime: { fontSize: 11, marginTop: 1 },
  successModalBody: { alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.md },
  successCheckCircle: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs },
  successModalTitle: { fontSize: fontSize.lg, fontWeight: '800' },
  successModalSub: { fontSize: fontSize.xs, textAlign: 'center' },
});
