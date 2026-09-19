import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
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
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { Card, ConfirmDialog, Input, Pill, PrimaryButton } from '../components/ui';
import { fonts, fontSize, iconStrokeWidth, radius, shadow, spacing } from '../theme';
import { BRAND_ASSETS, getWitnessAvatar } from '../data/images';
import { pickImage } from '../utils/pickImage';
import { scanKtpWithVisionAi } from '../utils/ocrApi';

type RegisterStep = 'scan' | 'verify' | 'completed';

const OCR_STEPS = ['Pindai KTP', 'Validasi Relawan', 'Digital ID Terbit'];

export default function RegisterVolunteerScreen({ navigation, onBack }: any) {
  const { colors, isDark } = useTheme();
  const { login } = useApp();

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

  // Generated Volunteer ID
  const [volunteerId, setVolunteerId] = useState('');
  const [dialogConfig, setDialogConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    tone?: 'danger' | 'primary' | 'warning' | 'success' | 'info';
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
    const generatedId = `REL-3273-2024-${randomSuffix}`;
    setVolunteerId(generatedId);
    setStep('completed');
  };

  const handleLoginAsVolunteer = () => {
    login('VOLUNTEER', 'siti.rahmawati@relawanpan.id');
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
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
              <View style={[styles.celebrationIcon, { backgroundColor: '#E0F2FE' }]}>
                <Feather name="heart" size={28} color="#0284C7" />
              </View>
              <Text style={[styles.celebrationTitle, { color: colors.text }]}>Selamat Bergabung, Relawan!</Text>
              <Text style={[styles.celebrationSub, { color: colors.textMuted }]}>
                Digital ID Relawan PAN resmi diterbitkan. Anda kini terhubung dengan posko pemenangan dan bursa tugas lapangan.
              </Text>
            </View>

            {/* Kartu Digital ID Relawan */}
            <View style={styles.volunteerCard}>
              <View style={styles.volunteerCardHeader}>
                <Image source={BRAND_ASSETS.official} style={{ width: 38, height: 38 }} resizeMode="contain" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.volunteerCardParty}>PARTAI AMANAT NASIONAL</Text>
                  <Text style={styles.volunteerCardSubtitle}>KARTU TANDA RELAWAN DIGITAL</Text>
                </View>
                <View style={styles.volunteerBadge}>
                  <Text style={styles.volunteerBadgeText}>RELAWAN</Text>
                </View>
              </View>

              <View style={styles.volunteerCardBody}>
                <View style={styles.volunteerAvatarWrap}>
                  {photoUri ? (
                    <Image source={{ uri: photoUri }} style={{ width: '100%', height: '100%', borderRadius: radius.sm }} />
                  ) : (
                    <Image source={getWitnessAvatar(2)} style={{ width: '100%', height: '100%', borderRadius: radius.sm }} />
                  )}
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.volunteerIdNum}>{volunteerId || 'REL-3273-2024-0018'}</Text>
                  <Text style={styles.volunteerName}>{nama || 'SITI RAHMAWATI'}</Text>
                  <Text style={styles.volunteerMeta}>Domisili: {kecamatan}, {kota}</Text>
                  <Text style={styles.volunteerMeta}>Posko: {posko}</Text>
                  <Text style={styles.volunteerMetaHighlight}>Fokus: {minatKeahlian}</Text>
                </View>
              </View>

              <View style={styles.volunteerCardFooter}>
                <View style={styles.qrBox}>
                  <Feather name="grid" size={28} color="#0369A1" />
                </View>
                <View style={{ flex: 1, alignItems: 'flex-end', gap: 1 }}>
                  <Text style={styles.footerNote}>Terverifikasi Badan Relawan PAN</Text>
                  <Text style={styles.footerDate}>Terdaftar: {new Date().toLocaleDateString('id-ID')}</Text>
                </View>
              </View>
            </View>

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
        singleButton
        confirmLabel="OK"
        onConfirm={() => setDialogConfig((prev) => ({ ...prev, visible: false }))}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
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
  volunteerCard: {
    backgroundColor: '#0369A1',
    borderRadius: radius.xl,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: '#38BDF8',
    ...shadow.card,
  },
  volunteerCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.2)', paddingBottom: 8 },
  volunteerCardParty: { fontFamily: fonts.extraBold, fontSize: 12, color: '#FFFFFF', letterSpacing: 0.5 },
  volunteerCardSubtitle: { fontFamily: fonts.bold, fontSize: 8.5, color: '#BAE6FD' },
  volunteerBadge: { backgroundColor: '#0284C7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#7DD3FC' },
  volunteerBadgeText: { fontFamily: fonts.extraBold, fontSize: 9, color: '#FFFFFF' },
  volunteerCardBody: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 4 },
  volunteerAvatarWrap: { width: 56, height: 68, borderRadius: radius.sm, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  volunteerIdNum: { fontFamily: fonts.extraBold, fontSize: 12, color: '#7DD3FC', letterSpacing: 0.5 },
  volunteerName: { fontFamily: fonts.bold, fontSize: 13, color: '#FFFFFF' },
  volunteerMeta: { fontFamily: fonts.medium, fontSize: 9.5, color: 'rgba(255,255,255,0.85)' },
  volunteerMetaHighlight: { fontFamily: fonts.bold, fontSize: 9.5, color: '#E0F2FE' },
  volunteerCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 8,
  },
  qrBox: { width: 40, height: 40, borderRadius: 4, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  footerNote: { fontFamily: fonts.bold, fontSize: 9, color: '#FFFFFF' },
  footerDate: { fontFamily: fonts.regular, fontSize: 8, color: 'rgba(255,255,255,0.75)' },
  registerOtherBtn: { alignItems: 'center', paddingVertical: 8 },
  registerOtherText: { fontFamily: fonts.bold, fontSize: fontSize.xs },
});
