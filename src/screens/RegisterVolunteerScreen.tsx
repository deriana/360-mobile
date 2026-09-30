import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { Card, ConfirmDialog, Input, Modal, Pill, PrimaryButton } from '../components/ui';
import { fonts, fontSize, iconStrokeWidth, radius, shadow, spacing } from '../theme';
import { BRAND_ASSETS, getWitnessAvatar } from '../data/images';
import { pickImage } from '../utils/pickImage';
import { scanKtpWithVisionAi } from '../utils/ocrApi';
import QrPlaceholder from '../components/QrPlaceholder';

type RegisterStep = 'scan' | 'verify' | 'completed';

const OCR_STEPS = ['Pindai KTP', 'Validasi Relawan', 'Digital ID Terbit'];

export default function RegisterVolunteerScreen({ navigation, onBack }: any) {
  const { colors, isDark } = useTheme();
  const { login, loggedIn } = useApp();
  const insets = useSafeAreaInsets();
  const navigationHook = useNavigation<any>();
  const nav = navigation || navigationHook;

  const [step, setStep] = useState<RegisterStep>('scan');
  const [isScanning, setIsScanning] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  // Form states extracted via AI OCR / Manual
  const [nik, setNik] = useState('');
  const [nama, setNama] = useState('');
  const [tempatLahir, setTempatLahir] = useState('Bandung');
  const [tglLahir, setTglLahir] = useState('12/06/1998');
  const [jenisKelamin, setJenisKelamin] = useState('Perempuan');
  const [alamat, setAlamat] = useState('Jl. Cisitu Lama No. 24, RT 03 / RW 05');
  const [kecamatan, setKecamatan] = useState('Coblong');
  const [kota, setKota] = useState('Kota Bandung');

  // Relawan Specific Data
  const [phone, setPhone] = useState('081298765432');
  const [email, setEmail] = useState('');
  const [posko, setPosko] = useState('Posko Pemenangan Coblong / Dago Atas');
  const [minatKeahlian, setMinatKeahlian] = useState('Pengawalan Warga & Suara TPS');

  // Generated Volunteer ID & UI State
  const [volunteerId, setVolunteerId] = useState('');
  const [copiedField, setCopiedField] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    tone?: 'danger' | 'primary' | 'warning' | 'success' | 'info';
    singleButton?: boolean;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  }>({ visible: false, title: '', message: '' });

  // Scanning animation
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isScanning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(scanAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scanAnim.setValue(0);
    }
  }, [isScanning]);

  const handlePickPhoto = async (source: 'camera' | 'library') => {
    const uri = await pickImage(source);
    if (uri) {
      setPhotoUri(uri);
      processOcr(uri);
    }
  };

  const handleSimulateSample = () => {
    const sampleUri = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&q=80';
    setPhotoUri(sampleUri);
    processOcr(sampleUri);
  };

  const processOcr = async (uri: string) => {
    setIsScanning(true);
    try {
      const result = await scanKtpWithVisionAi(uri);
      if (result.nik) setNik(result.nik);
      if (result.nama) setNama(result.nama);
      if (result.tempatLahir) setTempatLahir(result.tempatLahir);
      if (result.tglLahir) setTglLahir(result.tglLahir);
      if (result.jenisKelamin) setJenisKelamin(result.jenisKelamin);
      if (result.alamat) setAlamat(result.alamat);
      if (result.kecamatan) setKecamatan(result.kecamatan);
      if (result.kota) setKota(result.kota);
      if (result.phone) setPhone(result.phone);
      if (result.email) setEmail(result.email);
    } catch (err) {
      console.warn('[RegisterVolunteerScreen] Error scanning KTP:', err);
    } finally {
      setIsScanning(false);
      setStep('verify');
    }
  };

  const handleRegisterVolunteer = () => {
    if (!nik || !nama) {
      setDialogConfig({
        visible: true,
        title: 'Data Belum Lengkap',
        message: 'Mohon lengkapi NIK dan Nama lengkap sebelum mendaftar.',
        tone: 'warning',
      });
      return;
    }
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const generatedId = `KTA-3273-2024-${randomSuffix}`;
    setVolunteerId(generatedId);
    setStep('completed');
  };

  const handleCopyKta = () => {
    setCopiedField(true);
    setTimeout(() => setCopiedField(false), 2000);
  };

  // Pendaftar baru masuk sebagai relawan yang belum terverifikasi (akun demo Nadia),
  // bukan relawan aktif yang sudah terverifikasi.
  const handleLoginAsVolunteer = () => {
    login('VOLUNTEER', 'relawan.baru@pan.go.id');
  };

  const isExitingRef = useRef(false);

  const handleExitToLogin = () => {
    isExitingRef.current = true;
    if (onBack) {
      onBack();
    } else if (nav?.canGoBack?.() || nav?.goBack) {
      nav.goBack();
    }
  };

  const handleBack = () => {
    // Jika sedang di Step 2 (Verifikasi/Form), kembali ke Step 1 (Pindai KTP)
    if (step === 'verify') {
      setStep('scan');
      return;
    }

    // Jika sedang di Step 1 dan sudah ada data KTP pindaian/input, konfirmasi sebelum batal
    if (step === 'scan' && (photoUri || nik || nama)) {
      setDialogConfig({
        visible: true,
        title: 'Batalkan Pendaftaran?',
        message: 'Data pendaftaran relawan yang telah dimasukkan akan dibatalkan.',
        tone: 'danger',
        singleButton: false,
        confirmLabel: 'Ya, Keluar',
        cancelLabel: 'Batal',
        onConfirm: () => {
          isExitingRef.current = true;
          setDialogConfig((prev) => ({ ...prev, visible: false }));
          handleExitToLogin();
        },
        onCancel: () => {
          setDialogConfig((prev) => ({ ...prev, visible: false }));
        },
      });
      return;
    }

    // Step 3 (Completed) atau Step 1 bersih langsung keluar ke login
    handleExitToLogin();
  };

  // React Navigation beforeRemove Listener (Menangkap hardware back, edge swipe gesture, predictive back)
  useEffect(() => {
    if (!nav?.addListener) return;

    return nav.addListener('beforeRemove', (e: any) => {
      // Jika keluar sudah disetujui, biarkan aksi default navigasi berjalan
      if (isExitingRef.current) {
        return;
      }

      // Jika sedang di Step 2 (Verifikasi/Form), tahan dan kembali ke Step 1 (Pindai KTP)
      if (step === 'verify') {
        e.preventDefault();
        setStep('scan');
        return;
      }

      // Jika sedang di Step 1 dan ada data KTP pindaian/input, tahan dan minta konfirmasi
      if (step === 'scan' && (photoUri || nik || nama)) {
        e.preventDefault();
        setDialogConfig({
          visible: true,
          title: 'Batalkan Pendaftaran?',
          message: 'Data pendaftaran relawan yang telah dimasukkan akan dibatalkan.',
          tone: 'danger',
          singleButton: false,
          confirmLabel: 'Ya, Keluar',
          cancelLabel: 'Batal',
          onConfirm: () => {
            isExitingRef.current = true;
            setDialogConfig((prev) => ({ ...prev, visible: false }));
            nav.dispatch(e.data.action);
          },
          onCancel: () => {
            setDialogConfig((prev) => ({ ...prev, visible: false }));
          },
        });
        return;
      }

      // Step 3 (Completed) atau Step 1 kosong: biarkan action default berjalan (pop ke Login)
    });
  }, [nav, step, photoUri, nik, nama]);

  // Hardware Back Button fallback listener (Android)
  useEffect(() => {
    const onHardwareBack = () => {
      handleBack();
      return true;
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onHardwareBack);
    return () => sub.remove();
  }, [step, photoUri, nik, nama, onBack, nav]);

  // Web Browser Back Button support (popstate)
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const handlePopState = () => {
        if (step === 'verify') {
          window.history.pushState({ step: 'verify' }, '');
          setStep('scan');
        } else {
          handleExitToLogin();
        }
      };

      window.history.pushState({ step }, '');
      window.addEventListener('popstate', handlePopState);

      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [step, photoUri, nik, nama, onBack, nav]);

  const backButtonLabel =
    step === 'verify'
      ? 'Kembali ke Pindai KTP'
      : loggedIn
      ? 'Kembali'
      : 'Kembali ke Login';

  const displayKtaNo = (volunteerId || 'KTA-3273-2024-0018').replace(/^REL-/, 'KTA-');
  const barcodeClean = `*${displayKtaNo.replace(/[^A-Z0-9]/g, '')}*`;

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} animated />

      {/* Top Header Bar dengan Navigasi Berjenjang */}
      <View
        style={[
          styles.headerBar,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
            paddingTop: Math.max(insets.top, 14),
          },
        ]}
      >
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => [
            styles.backBtn,
            pressed && { opacity: 0.7 },
            Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
          ]}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel={backButtonLabel}
        >
          <Feather name="arrow-left" size={20} color={colors.text} strokeWidth={iconStrokeWidth} />
          <Text style={[styles.backBtnText, { color: colors.text }]}>{backButtonLabel}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Header Title */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Image source={BRAND_ASSETS.official} style={{ width: 34, height: 34 }} resizeMode="contain" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: colors.text }]}>Pendaftaran Relawan PAN</Text>
              <Text style={[styles.subTitle, { color: colors.textMuted }]}>
                Bergabung dalam gerakan pengawalan suara & pemenangan rakyat bersama Partai Amanat Nasional.
              </Text>
            </View>
          </View>
        </View>

        {/* Step Indicator */}
        <View style={styles.stepIndicatorRow}>
          {OCR_STEPS.map((stepLabel, idx) => {
            const currentIdx = step === 'scan' ? 0 : step === 'verify' ? 1 : 2;
            const isDone = idx < currentIdx;
            const isCurrent = idx === currentIdx;
            return (
              <React.Fragment key={stepLabel}>
                <View style={styles.stepItem}>
                  <View
                    style={[
                      styles.stepCircle,
                      {
                        backgroundColor: isDone || isCurrent ? '#0284C7' : colors.border,
                      },
                    ]}
                  >
                    {isDone ? (
                      <Feather name="check" size={12} color="#FFFFFF" strokeWidth={iconStrokeWidth} />
                    ) : (
                      <Text style={[styles.stepNum, { color: isCurrent ? '#FFFFFF' : colors.textMuted }]}>
                        {idx + 1}
                      </Text>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.stepLabel,
                      { color: isCurrent || isDone ? colors.text : colors.textMuted, fontWeight: isCurrent ? '800' : '600' },
                    ]}
                  >
                    {stepLabel}
                  </Text>
                </View>
                {idx < OCR_STEPS.length - 1 && (
                  <View
                    style={[
                      styles.stepLine,
                      { backgroundColor: idx < currentIdx ? '#0284C7' : colors.border },
                    ]}
                  />
                )}
              </React.Fragment>
            );
          })}
        </View>

        {/* STEP 1: SCAN KTP AI OCR */}
        {step === 'scan' && (
          <View style={{ gap: spacing.md }}>
            <Card style={{ padding: 0, overflow: 'hidden', borderRadius: radius.xl }}>
              <View style={[styles.viewfinderHeader, { backgroundColor: '#0A192F' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={styles.aiDot} />
                  <Text style={styles.viewfinderTitle}>AI Scanner e-KTP Relawan</Text>
                </View>
                <Pill label={isScanning ? 'Memindai...' : 'Siap Pindai'} tone={isScanning ? 'warning' : 'primary'} />
              </View>

              {photoUri ? (
                <ImageBackground source={{ uri: photoUri }} style={styles.viewfinderBox}>
                  <View style={styles.viewfinderOverlay}>
                    <View style={[styles.scanFrame, { borderColor: '#0284C7' }]}>
                      {isScanning && (
                        <Animated.View
                          style={[
                            styles.laserLine,
                            {
                              backgroundColor: '#38BDF8',
                              top: scanAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [10, 130],
                              }),
                            },
                          ]}
                        />
                      )}
                      <Feather name="credit-card" size={32} color="rgba(255,255,255,0.7)" />
                      <Text style={styles.frameHint}>
                        {isScanning ? 'Membaca NIK, Nama & Alamat...' : 'Posisikan e-KTP dalam bingkai'}
                      </Text>
                    </View>
                  </View>
                </ImageBackground>
              ) : (
                <View style={[styles.viewfinderBox, { backgroundColor: isDark ? '#111827' : '#F1F5F9' }]}>
                  <View style={[styles.scanFrame, { borderColor: colors.border, borderStyle: 'dashed' }]}>
                    <Feather name="camera" size={36} color={colors.textMuted} />
                    <Text style={[styles.frameHint, { color: colors.textMuted }]}>
                      Ambil foto e-KTP untuk pengisian instan otomatis
                    </Text>
                  </View>
                </View>
              )}

              <View style={[styles.viewfinderFooter, { borderTopColor: colors.border }]}>
                {isScanning ? (
                  <View style={styles.scanningStatusWrap}>
                    <Feather name="loader" size={16} color="#0284C7" />
                    <Text style={[styles.scanningStatusText, { color: '#0284C7' }]}>
                      Memproses ekstraksi data OCR...
                    </Text>
                  </View>
                ) : (
                  <View style={{ gap: spacing.xs }}>
                    <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                      <PrimaryButton
                        label="Buka Kamera"
                        icon="camera"
                        onPress={() => handlePickPhoto('camera')}
                        style={{ flex: 1, backgroundColor: '#0284C7' }}
                      />
                      <PrimaryButton
                        label="Galeri Foto"
                        icon="image"
                        variant="secondary"
                        onPress={() => handlePickPhoto('library')}
                        style={{ flex: 1 }}
                      />
                    </View>

                    <Pressable
                      onPress={handleSimulateSample}
                      style={({ pressed }) => [
                        styles.sampleBtn,
                        { backgroundColor: isDark ? '#1E293B' : '#E0F2FE' },
                        pressed && { opacity: 0.7 },
                      ]}
                    >
                      <Feather name="zap" size={13} color="#0284C7" />
                      <Text style={[styles.sampleBtnText, { color: '#0284C7' }]}>
                        Gunakan Sampel Simulasi KTP Relawan
                      </Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </Card>

            <Card style={{ gap: spacing.sm }}>
              <Text style={{ fontFamily: fonts.bold, fontSize: fontSize.sm, color: colors.text }}>
                Keuntungan Menjadi Relawan PAN:
              </Text>
              <View style={styles.benefitRow}>
                <Feather name="check" size={15} color="#0284C7" />
                <Text style={[styles.benefitText, { color: colors.textMuted }]}>
                  Mendapatkan Digital ID Relawan resmi terverifikasi tim daerah.
                </Text>
              </View>
              <View style={styles.benefitRow}>
                <Feather name="check" size={15} color="#0284C7" />
                <Text style={[styles.benefitText, { color: colors.textMuted }]}>
                  Akses langsung ke Bursa Tugas, Posko Pemenangan, dan Event Lapangan.
                </Text>
              </View>
              <View style={styles.benefitRow}>
                <Feather name="check" size={15} color="#0284C7" />
                <Text style={[styles.benefitText, { color: colors.textMuted }]}>
                  Dapat mengajukan diri menjadi Saksi TPS Resmi atau Anggota simPAN KTA kapan saja melalui profil.
                </Text>
              </View>
            </Card>
          </View>
        )}

        {/* STEP 2: VERIFY & LENGKAPI DATA */}
        {step === 'verify' && (
          <View style={{ gap: spacing.md }}>
            <Card style={{ gap: spacing.sm }}>
              <View style={styles.verifyHeaderRow}>
                <View style={[styles.verifyIconWrap, { backgroundColor: '#E0F2FE' }]}>
                  <Feather name="check-circle" size={20} color="#0284C7" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.verifyTitle, { color: colors.text }]}>Data KTP Berhasil Diperoleh</Text>
                  <Text style={[styles.verifySub, { color: colors.textMuted }]}>
                    Periksa data identitas dan pilih penempatan posko relawan Anda.
                  </Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <Input label="NIK (Nomor Induk Kependudukan)" icon="credit-card" value={nik} onChangeText={setNik} keyboardType="numeric" />
              <Input label="Nama Lengkap (Sesuai KTP)" icon="user" value={nama} onChangeText={setNama} autoCapitalize="characters" />

              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <View style={{ flex: 1 }}>
                  <Input label="Tempat Lahir" value={tempatLahir} onChangeText={setTempatLahir} />
                </View>
                <View style={{ flex: 1 }}>
                  <Input label="Tanggal Lahir" value={tglLahir} onChangeText={setTglLahir} />
                </View>
              </View>

              <Input label="Jenis Kelamin" icon="users" value={jenisKelamin} onChangeText={setJenisKelamin} />
              <Input label="Alamat Domisili" icon="map-pin" value={alamat} onChangeText={setAlamat} />

              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <View style={{ flex: 1 }}>
                  <Input label="Kecamatan" value={kecamatan} onChangeText={setKecamatan} />
                </View>
                <View style={{ flex: 1 }}>
                  <Input label="Kota / Kabupaten" value={kota} onChangeText={setKota} />
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <Text style={[styles.subSectionTitle, { color: colors.text }]}>Informasi Kontak & Posko Relawan</Text>

              <Input label="Nomor WhatsApp Aktif" icon="phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
              <Input label="Alamat Email (Opsional)" icon="mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
              <Input label="Pilihan Posko Pemenangan" icon="home" value={posko} onChangeText={setPosko} />
              <Input label="Fokus / Minat Relawan" icon="heart" value={minatKeahlian} onChangeText={setMinatKeahlian} />

              <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
                <PrimaryButton label="Pindai Ulang" icon="rotate-ccw" variant="secondary" onPress={() => setStep('scan')} style={{ flex: 1 }} />
                <PrimaryButton
                  label="Daftar Relawan"
                  icon="check"
                  onPress={handleRegisterVolunteer}
                  style={{ flex: 1.6, backgroundColor: '#0284C7' }}
                />
              </View>
            </Card>
          </View>
        )}

        {/* STEP 3: DIGITAL ID RELAWAN TERBIT */}
        {step === 'completed' && (
          <View style={{ gap: spacing.md }}>
            <View style={[styles.successCelebrationCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.celebrationIcon, { backgroundColor: isDark ? 'rgba(217, 119, 6, 0.2)' : '#FEF3C7' }]}>
                <Feather name="clock" size={28} color="#D97706" />
              </View>
              <Text style={[styles.celebrationTitle, { color: colors.text }]}>Pendaftaran Terkirim ke DPD</Text>
              <Text style={[styles.celebrationSub, { color: colors.textMuted }]}>
                Data pendaftaran relawan telah masuk ke sistem. Berkas sedang dalam proses validasi oleh admin DPD. KTA Digital di bawah berstatus pratinjau informasi.
              </Text>
            </View>

            {/* KTA DIGITAL RELAWAN (PROPORSI KARTU FISIK ASLI ISO/IEC 7810 ID-1 1.58:1) */}
            <View style={styles.adminCardContainer}>
              {/* Watermark Logo PAN Transparan di Sudut Kanan Atas */}
              <Image source={BRAND_ASSETS.official} style={styles.adminCardWatermark} resizeMode="contain" />

              {/* Top Header Card */}
              <View style={styles.adminCardHeader}>
                <View style={styles.adminHeaderLeft}>
                  <View style={styles.adminLogoBox}>
                    <Image source={BRAND_ASSETS.official} style={styles.adminLogoImg} resizeMode="contain" />
                  </View>
                  <View style={styles.adminHeaderTitles}>
                    <Text style={styles.adminCardMainTitle} numberOfLines={1}>KARTU TANDA ANGGOTA RELAWAN</Text>
                    <Text style={styles.adminCardSubTitle} numberOfLines={1}>PARTAI AMANAT NASIONAL · BSN SAKSI360</Text>
                  </View>
                </View>

                <View style={styles.adminHeaderBadges}>
                  <View style={styles.adminPanBadge}>
                    <Image source={BRAND_ASSETS.official} style={styles.adminPanMiniLogo} resizeMode="contain" />
                    <Text style={styles.adminPanBadgeText}>PAN</Text>
                  </View>
                  <View style={styles.adminStatusBadgePending}>
                    <Text style={styles.adminStatusBadgeTextPending}>PROSES VALIDASI DPD</Text>
                  </View>
                </View>
              </View>

              {/* Card Middle: Foto Squircle + Chip NFC + No KTA + QR Code */}
              <View style={styles.adminCardMiddleRow}>
                <View style={styles.adminPhotoAndInfo}>
                  <View style={styles.adminPhotoWrap}>
                    <Image
                      source={photoUri ? { uri: photoUri } : getWitnessAvatar(2)}
                      style={styles.adminPhotoSquircle}
                    />
                    <View style={styles.adminOnlineDot}>
                      <View style={styles.adminOnlinePulse} />
                    </View>
                  </View>

                  <View style={styles.adminKtaDetails}>
                    <View style={styles.adminNfcChipWrap}>
                      <View style={styles.adminNfcMicrochip}>
                        <View style={styles.adminNfcLines} />
                      </View>
                      <Text style={styles.adminNfcChipText}>NFC SMARTPASS</Text>
                    </View>
                    <Text style={styles.adminLabelKta}>NOMOR ANGGOTA KTA</Text>
                    <View style={styles.adminKtaNumberRow}>
                      <Text style={styles.adminKtaNumberText} numberOfLines={1}>{displayKtaNo}</Text>
                      <Pressable
                        onPress={handleCopyKta}
                        style={({ pressed }) => [styles.adminCopyBtn, pressed && { opacity: 0.6 }]}
                        accessibilityRole="button"
                        accessibilityLabel="Salin Nomor KTA"
                      >
                        <Feather
                          name={copiedField ? 'check' : 'copy'}
                          size={11}
                          color={copiedField ? '#10B981' : '#94A3B8'}
                        />
                      </Pressable>
                    </View>
                  </View>
                </View>

                {/* QR Code Card */}
                <Pressable
                  onPress={() => setShowQrModal(true)}
                  style={({ pressed }) => [styles.adminQrContainer, pressed && { opacity: 0.85 }]}
                  accessibilityRole="button"
                  accessibilityLabel="Perbesar QR Code"
                >
                  <View style={styles.adminQrInnerBox}>
                    <QrPlaceholder seed={displayKtaNo} size={38} />
                  </View>
                  <Text style={styles.adminQrLabel}>VERIFIKASI QR</Text>
                </Pressable>
              </View>

              {/* Bento Grid 2x2 Info (Sesuai Persis Tangkapan Layar Admin) */}
              <View style={styles.adminBentoGrid}>
                <View style={styles.adminBentoRow}>
                  <View style={styles.adminBentoTile}>
                    <Text style={styles.adminBentoLabel}>NAMA ANGGOTA</Text>
                    <Text style={styles.adminBentoValue} numberOfLines={1}>{nama || 'SITI RAHMAWATI'}</Text>
                  </View>
                  <View style={styles.adminBentoTile}>
                    <Text style={styles.adminBentoLabel}>JABATAN / ROLE</Text>
                    <Text style={styles.adminBentoValue} numberOfLines={1}>Relawan Penggerak Posko</Text>
                  </View>
                </View>
                <View style={styles.adminBentoRow}>
                  <View style={styles.adminBentoTile}>
                    <Text style={styles.adminBentoLabel}>UNIT PENUGASAN</Text>
                    <Text style={styles.adminBentoValueSmall} numberOfLines={1}>{posko || 'Posko Kel. Dago, Kec. Coblong'}</Text>
                  </View>
                  <View style={styles.adminBentoTile}>
                    <Text style={styles.adminBentoLabel}>MASA BERLAKU</Text>
                    <Text style={styles.adminBentoValueMono} numberOfLines={1}>31 DESEMBER 2026</Text>
                  </View>
                </View>
              </View>

              {/* Card Footer Barcode & Legalitas */}
              <View style={styles.adminCardFooter}>
                <View style={styles.adminBarcodeGroup}>
                  <View style={styles.barcodeLinesRow}>
                    {[2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 2, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 3].map((w, idx) => (
                      <View
                        key={idx}
                        style={{
                          width: w,
                          height: 10,
                          backgroundColor: '#FFFFFF',
                          marginRight: idx % 2 === 0 ? 1 : 1.5,
                        }}
                      />
                    ))}
                  </View>
                  <Text style={styles.adminBarcodeText}>{barcodeClean}</Text>
                </View>

                <View style={styles.adminBrandingWrap}>
                  <Text style={styles.adminBrandTitle}>Saksi360</Text>
                  <View style={styles.adminBrandDot} />
                  <Text style={styles.adminBrandSub}>EDISI 2026</Text>
                </View>
              </View>
            </View>

            {/* Kartu Informasi Status Validasi DPD */}
            <Card
              style={{
                gap: spacing.xs,
                backgroundColor: isDark ? 'rgba(217, 119, 6, 0.08)' : '#FFFBEB',
                borderColor: isDark ? '#78350F' : '#FDE68A',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Feather name="info" size={16} color="#D97706" />
                <Text style={{ fontFamily: fonts.bold, fontSize: fontSize.xs, color: '#B45309' }}>
                  Informasi Status Pendaftaran
                </Text>
              </View>
              <Text style={{ fontFamily: fonts.regular, fontSize: 11.5, color: isDark ? '#FDE047' : '#92400E', lineHeight: 17 }}>
                Data pendaftaran Anda telah tercatat dan saat ini berstatus "PROSES VALIDASI DPD". Setelah admin DPD melakukan validasi berkas pada Web Command Center, status kartu akan beralih menjadi "AKTIF & SAH" serta membuka fitur Ajak Relawan dan penugasan resmi Saksi TPS.
              </Text>
            </Card>

            <Card style={{ gap: spacing.sm }}>
              <PrimaryButton
                label="Masuk ke Akun Relawan"
                icon="log-in"
                onPress={handleLoginAsVolunteer}
                style={{ backgroundColor: '#0284C7' }}
              />

              <Pressable
                onPress={() => {
                  setStep('scan');
                  setPhotoUri(null);
                }}
                style={({ pressed }) => [
                  styles.registerOtherBtn,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={[styles.registerOtherText, { color: '#0284C7' }]}>Daftarkan Relawan Lainnya</Text>
              </Pressable>
            </Card>
          </View>
        )}
      </ScrollView>

      <ConfirmDialog
        visible={dialogConfig.visible}
        title={dialogConfig.title}
        message={dialogConfig.message}
        tone={dialogConfig.tone || 'info'}
        singleButton={dialogConfig.singleButton ?? true}
        confirmLabel={dialogConfig.confirmLabel || 'OK'}
        cancelLabel={dialogConfig.cancelLabel || 'Batal'}
        onConfirm={dialogConfig.onConfirm || (() => setDialogConfig((prev) => ({ ...prev, visible: false })))}
        onCancel={dialogConfig.onCancel || (() => setDialogConfig((prev) => ({ ...prev, visible: false })))}
      />

      {/* Modal Zoom QR Code */}
      <Modal visible={showQrModal} onClose={() => setShowQrModal(false)} title="Kode QR Verifikasi Relawan">
        <View style={{ alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm }}>
          <View style={[styles.qrModalBox, { backgroundColor: '#FFFFFF', borderColor: colors.border }]}>
            <QrPlaceholder seed={displayKtaNo} size={180} />
          </View>
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Text style={{ fontFamily: fonts.bold, fontSize: fontSize.sm, fontWeight: '800', color: colors.text }}>
              {nama || 'SITI RAHMAWATI'}
            </Text>
            <Text style={{ fontFamily: fonts.bold, fontSize: fontSize.xs, color: '#0284C7', fontWeight: '800' }}>
              {displayKtaNo}
            </Text>
            <Pill
              label="Menunggu Validasi DPD"
              tone="warning"
              icon="clock"
              style={{ marginTop: 4 }}
            />
          </View>
          <PrimaryButton
            label="Tutup"
            icon="x"
            variant="secondary"
            style={{ width: '100%', marginTop: spacing.xs }}
            onPress={() => setShowQrModal(false)}
          />
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  headerBar: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  backBtnText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  header: { gap: 4 },
  title: { fontFamily: fonts.extraBold, fontSize: fontSize.lg },
  subTitle: { fontFamily: fonts.regular, fontSize: fontSize.xs, lineHeight: 17 },
  stepIndicatorRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: spacing.xs },
  stepItem: { alignItems: 'center', gap: 4, width: 90 },
  stepCircle: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  stepNum: { fontFamily: fonts.bold, fontSize: 11 },
  stepLabel: { fontFamily: fonts.medium, fontSize: 10, textAlign: 'center' },
  stepLine: { flex: 1, height: 2, marginHorizontal: 2, marginBottom: 16 },
  viewfinderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  aiDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#38BDF8' },
  viewfinderTitle: { fontFamily: fonts.bold, fontSize: 11, color: '#FFFFFF' },
  viewfinderBox: { width: '100%', height: 220, justifyContent: 'center', alignItems: 'center' },
  viewfinderOverlay: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center', padding: spacing.md },
  scanFrame: {
    width: '84%',
    height: 150,
    borderRadius: radius.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.3)',
    gap: 6,
  },
  frameHint: { fontFamily: fonts.bold, fontSize: 11, color: '#FFFFFF' },
  laserLine: { position: 'absolute', left: 0, right: 0, height: 3, shadowColor: '#38BDF8', shadowOpacity: 0.8, shadowRadius: 6 },
  viewfinderFooter: { padding: spacing.md, borderTopWidth: 1 },
  scanningStatusWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 8 },
  scanningStatusText: { fontFamily: fonts.bold, fontSize: fontSize.xs },
  sampleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.md,
    marginTop: 4,
  },
  sampleBtnText: { fontFamily: fonts.bold, fontSize: 11 },
  benefitRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  benefitText: { fontFamily: fonts.regular, fontSize: fontSize.xs, flex: 1, lineHeight: 18 },
  verifyHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  verifyIconWrap: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  verifyTitle: { fontFamily: fonts.bold, fontSize: fontSize.sm },
  verifySub: { fontFamily: fonts.regular, fontSize: 11, marginTop: 2, lineHeight: 16 },
  divider: { height: 1, marginVertical: spacing.xs },
  subSectionTitle: { fontFamily: fonts.bold, fontSize: fontSize.xs, marginBottom: 2 },
  successCelebrationCard: {
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    gap: 6,
  },
  celebrationIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  celebrationTitle: { fontFamily: fonts.extraBold, fontSize: fontSize.lg },
  celebrationSub: { fontFamily: fonts.regular, fontSize: fontSize.xs, textAlign: 'center', lineHeight: 17, maxWidth: 280 },
  // GAYA SMARTCARD DENGAN PROPORSI STANDAR KARTU IDENTITAS ISO/IEC 7810 ID-1 (1.58:1)
  adminCardContainer: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#0A3D6B',
    backgroundColor: '#030D1A',
    padding: 12,
    aspectRatio: 1.58, // Standar rasio kartu fisik (85.6mm x 53.98mm = 1.586 : 1)
    justifyContent: 'space-between',
    ...shadow.lg,
  },
  adminCardWatermark: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 110,
    height: 110,
    opacity: 0.08,
  },
  adminCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(56, 189, 248, 0.2)',
    paddingBottom: 6,
  },
  adminHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  adminLogoBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
    ...shadow.sm,
  },
  adminLogoImg: {
    width: 26,
    height: 26,
  },
  adminHeaderTitles: {
    flex: 1,
    minWidth: 0,
  },
  adminCardMainTitle: {
    fontFamily: fonts.extraBold,
    fontSize: 10.5,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  adminCardSubTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 8,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.2,
    marginTop: 1,
  },
  adminHeaderBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },
  adminPanBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(2, 6, 23, 0.85)',
    borderWidth: 1,
    borderColor: '#1E3A8A',
    paddingHorizontal: 5,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  adminPanMiniLogo: {
    width: 10,
    height: 10,
  },
  adminPanBadgeText: {
    fontFamily: fonts.extraBold,
    fontSize: 8.5,
    fontWeight: '900',
    color: '#38BDF8',
    letterSpacing: 0.4,
  },
  adminStatusBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  adminStatusBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  adminStatusBadgePending: {
    backgroundColor: '#D97706',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  adminStatusBadgeTextPending: {
    fontFamily: fonts.bold,
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  // Middle Row
  adminCardMiddleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  adminPhotoAndInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  adminPhotoWrap: {
    position: 'relative',
    flexShrink: 0,
  },
  adminPhotoSquircle: {
    width: 50,
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  adminOnlineDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: '#030D1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminOnlinePulse: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  adminKtaDetails: {
    flex: 1,
    minWidth: 0,
    gap: 0.5,
  },
  adminNfcChipWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  adminNfcMicrochip: {
    width: 15,
    height: 10,
    borderRadius: 2,
    backgroundColor: '#F59E0B',
    borderWidth: 0.8,
    borderColor: '#D97706',
    padding: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminNfcLines: {
    width: 10,
    height: 5,
    borderWidth: 0.6,
    borderColor: '#78350F',
    borderRadius: 0.5,
  },
  adminNfcChipText: {
    fontFamily: fonts.bold,
    fontSize: 7.5,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.4,
  },
  adminLabelKta: {
    fontFamily: fonts.bold,
    fontSize: 7,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginTop: 1.5,
  },
  adminKtaNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  adminKtaNumberText: {
    fontFamily: fonts.extraBold,
    fontSize: 12.5,
    fontWeight: '900',
    color: '#38BDF8',
    letterSpacing: 0.5,
  },
  adminCopyBtn: {
    padding: 2,
    borderRadius: 3,
  },

  // QR Container
  adminQrContainer: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    borderRadius: 8,
    padding: 3.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  adminQrInnerBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    padding: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminQrLabel: {
    fontFamily: fonts.bold,
    fontSize: 6.5,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.4,
    marginTop: 2,
  },

  // Bento Grid
  adminBentoGrid: {
    gap: 3.5,
  },
  adminBentoRow: {
    flexDirection: 'row',
    gap: 4,
  },
  adminBentoTile: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3.5,
  },
  adminBentoLabel: {
    fontFamily: fonts.bold,
    fontSize: 6.8,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.4,
  },
  adminBentoValue: {
    fontFamily: fonts.bold,
    fontSize: 9.8,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 1,
  },
  adminBentoValueSmall: {
    fontFamily: fonts.semiBold,
    fontSize: 8.8,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 1,
  },
  adminBentoValueMono: {
    fontFamily: fonts.bold,
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 1,
    letterSpacing: 0.4,
  },

  // Card Footer
  adminCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(56, 189, 248, 0.2)',
    paddingTop: 5,
  },
  adminBarcodeGroup: {
    flexDirection: 'column',
    gap: 1,
  },
  barcodeLinesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminBarcodeText: {
    fontFamily: fonts.semiBold,
    fontSize: 6.5,
    color: 'rgba(255, 255, 255, 0.85)',
    letterSpacing: 1,
  },
  adminBrandingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  adminBrandTitle: {
    fontFamily: fonts.bold,
    fontSize: 8,
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 0.3,
  },
  adminBrandDot: {
    width: 2.5,
    height: 2.5,
    borderRadius: 1.5,
    backgroundColor: '#38BDF8',
  },
  adminBrandSub: {
    fontFamily: fonts.bold,
    fontSize: 7.5,
    color: '#38BDF8',
    letterSpacing: 0.5,
  },
  qrModalBox: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerOtherBtn: { alignItems: 'center', paddingVertical: 8 },
  registerOtherText: { fontFamily: fonts.bold, fontSize: fontSize.xs },
});
