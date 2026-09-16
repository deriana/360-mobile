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
import { Card, ConfirmDialog, Input, Pill, PrimaryButton, SectionTitle } from '../components/ui';
import { fonts, fontSize, iconStrokeWidth, radius, shadow, spacing } from '../theme';
import { BRAND_ASSETS, getWitnessAvatar } from '../data/images';
import { pickImage } from '../utils/pickImage';
import { scanKtpWithVisionAi } from '../utils/ocrApi';

type RegisterStep = 'scan' | 'verify' | 'completed';

const OCR_STEPS = ['Pindai KTP', 'Validasi Data', 'e-KTA Terbit'];

export default function RegisterMemberScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { login } = useApp();

  const [step, setStep] = useState<RegisterStep>('scan');
  const [isScanning, setIsScanning] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  // Form states extracted via AI OCR
  const [nik, setNik] = useState('');
  const [nama, setNama] = useState('');
  const [tempatLahir, setTempatLahir] = useState('');
  const [tglLahir, setTglLahir] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState('Laki-Laki');
  const [alamat, setAlamat] = useState('');
  const [rtRw, setRtRw] = useState('');
  const [kelurahan, setKelurahan] = useState('');
  const [kecamatan, setKecamatan] = useState('');
  const [kota, setKota] = useState('Kota Bandung');
  const [provinsi, setProvinsi] = useState('Jawa Barat');
  const [agama, setAgama] = useState('Islam');
  const [pekerjaan, setPekerjaan] = useState('Wiraswasta');

  // Additional Member Information
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [dpd, setDpd] = useState('DPD PAN Kota Bandung');
  const [dpc, setDpc] = useState('DPC PAN Coblong');
  const [sayapPartai, setSayapPartai] = useState('BSN PAN (Badan Saksi Nasional)');

  // Generated KTA Data
  const [noKta, setNoKta] = useState('');
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
    const sampleUri = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80';
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
      if (result.rtRw) setRtRw(result.rtRw);
      if (result.kelurahan) setKelurahan(result.kelurahan);
      if (result.kecamatan) setKecamatan(result.kecamatan);
      if (result.kota) setKota(result.kota);
      if (result.provinsi) setProvinsi(result.provinsi);
      if (result.agama) setAgama(result.agama);
      if (result.pekerjaan) setPekerjaan(result.pekerjaan);
      if (result.phone) setPhone(result.phone);
      if (result.email) setEmail(result.email);
    } catch (err) {
      console.warn('[RegisterMemberScreen] Error scanning KTP:', err);
    } finally {
      setIsScanning(false);
      setStep('verify');
    }
  };

  const handleIssueKta = () => {
    if (!nik || !nama) {
      setDialogConfig({
        visible: true,
        title: 'Data Belum Lengkap',
        message: 'Mohon lengkapi NIK dan Nama sebelum menerbitkan e-KTA.',
        tone: 'warning',
      });
      return;
    }
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const generatedKta = `32.73.01.2024.${randomSuffix}`;
    setNoKta(generatedKta);
    setStep('completed');
  };

  const handleLoginAsMember = () => {
    login('KADER_ANGGOTA');
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
              <Text style={[styles.title, { color: colors.text }]}>Registrasi Anggota simPAN</Text>
              <Text style={[styles.subTitle, { color: colors.textMuted }]}>
                Pindai e-KTP dengan AI OCR untuk verifikasi instan & penerbitan e-KTA Partai Amanat Nasional.
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
                        backgroundColor: isDone || isCurrent ? colors.primary : colors.border,
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
                      { backgroundColor: idx < currentIdx ? colors.primary : colors.border },
                    ]}
                  />
                )}
              </React.Fragment>
            );
          })}
        </View>

        {/* ------------------------------------------------------------- */}
        {/* STEP 1: SCAN KTP AI OCR */}
        {/* ------------------------------------------------------------- */}
        {step === 'scan' && (
          <View style={{ gap: spacing.md }}>
            <Card style={{ padding: 0, overflow: 'hidden', borderRadius: radius.xl }}>
              <View style={[styles.viewfinderHeader, { backgroundColor: '#0A192F' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={styles.aiDot} />
                  <Text style={styles.viewfinderTitle}>AI KTP Scanner Engine v2.4</Text>
                </View>
                <Pill label={isScanning ? 'Memindai...' : 'Siap Pindai'} tone={isScanning ? 'warning' : 'primary'} />
              </View>

              {photoUri ? (
                <ImageBackground source={{ uri: photoUri }} style={styles.viewfinderBox}>
                  <View style={styles.viewfinderOverlay}>
                    <View style={[styles.scanFrame, { borderColor: colors.primary }]}>
                      {isScanning && (
                        <Animated.View
                          style={[
                            styles.laserLine,
                            {
                              backgroundColor: '#00D2FF',
                              transform: [
                                {
                                  translateY: scanAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [-90, 90],
                                  }),
                                },
                              ],
                            },
                          ]}
                        />
                      )}
                    </View>
                  </View>
                </ImageBackground>
              ) : (
                <View style={[styles.viewfinderBox, { backgroundColor: '#0F172A' }]}>
                  <View style={styles.viewfinderOverlay}>
                    <View style={[styles.scanFrame, { borderColor: 'rgba(255,255,255,0.4)' }]}>
                      <Feather name="credit-card" size={38} color="rgba(255,255,255,0.7)" />
                      <Text style={styles.frameHint}>Posisikan e-KTP di dalam bingkai</Text>
                    </View>
                  </View>
                </View>
              )}

              <View style={[styles.viewfinderFooter, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                {isScanning ? (
                  <View style={styles.scanningStatusWrap}>
                    <Feather name="cpu" size={16} color={colors.primary} />
                    <Text style={[styles.scanningStatusText, { color: colors.primary }]}>
                      AI mengekstrak NIK, Nama, & Alamat Dukcapil...
                    </Text>
                  </View>
                ) : (
                  <View style={{ gap: spacing.xs }}>
                    <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                      <PrimaryButton
                        label="Ambil Foto KTP"
                        icon="camera"
                        onPress={() => handlePickPhoto('camera')}
                        style={{ flex: 1 }}
                      />
                      <PrimaryButton
                        label="Pilih Galeri"
                        icon="upload"
                        variant="secondary"
                        onPress={() => handlePickPhoto('library')}
                        style={{ flex: 1 }}
                      />
                    </View>
                    <Pressable
                      onPress={handleSimulateSample}
                      style={({ pressed }) => [
                        styles.sampleBtn,
                        { backgroundColor: colors.primaryLight },
                        pressed && { opacity: 0.7 },
                      ]}
                    >
                      <Feather name="zap" size={14} color={colors.primary} />
                      <Text style={[styles.sampleBtnText, { color: colors.primary }]}>
                        Uji Coba dengan Sampel e-KTP Demo (Instan)
                      </Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </Card>

            {/* Keunggulan Pendaftaran via simPAN */}
            <Card style={{ gap: spacing.sm }}>
              <SectionTitle style={{ marginBottom: 0 }}>Keunggulan Pendaftaran Digital simPAN</SectionTitle>
              {[
                'Verifikasi identitas otomatis berbasis AI OCR mengurangi kesalahan ketik.',
                'Terhubung langsung dengan basis data keanggotaan DPP PAN.',
                'Penerbitan kartu tanda anggota digital (e-KTA) resmi instan dengan QR Code.',
                'Dapat langsung digunakan untuk penugasan saksi BSN di TPS.',
              ].map((text, idx) => (
                <View key={idx} style={styles.benefitRow}>
                  <Feather name="check-circle" size={14} color={colors.primary} style={{ marginTop: 2 }} />
                  <Text style={[styles.benefitText, { color: colors.textMuted }]}>{text}</Text>
                </View>
              ))}
            </Card>
          </View>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 2: VERIFIKASI & FORM DATA KADER */}
        {/* ------------------------------------------------------------- */}
        {step === 'verify' && (
          <View style={{ gap: spacing.md }}>
            <Card style={{ gap: spacing.sm }}>
              <View style={styles.verifyHeaderRow}>
                <View style={[styles.verifyIconWrap, { backgroundColor: colors.successBg }]}>
                  <Feather name="check-circle" size={20} color={colors.success} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.verifyTitle, { color: colors.text }]}>Data e-KTP Berhasil Diekstrak AI</Text>
                  <Text style={[styles.verifySub, { color: colors.textMuted }]}>
                    Periksa kembali data diri dan lengkapi informasi kepengurusan di bawah ini.
                  </Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <Input label="NIK (Nomor Induk Kependudukan)" icon="credit-card" value={nik} onChangeText={setNik} keyboardType="numeric" />
              <Input label="Nama Lengkap (Sesuai e-KTP)" icon="user" value={nama} onChangeText={setNama} autoCapitalize="characters" />

              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <View style={{ flex: 1 }}>
                  <Input label="Tempat Lahir" value={tempatLahir} onChangeText={setTempatLahir} />
                </View>
                <View style={{ flex: 1 }}>
                  <Input label="Tanggal Lahir" value={tglLahir} onChangeText={setTglLahir} />
                </View>
              </View>

              <Input label="Jenis Kelamin" icon="users" value={jenisKelamin} onChangeText={setJenisKelamin} />
              <Input label="Alamat Domisili KTP" icon="map-pin" value={alamat} onChangeText={setAlamat} />

              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <View style={{ flex: 1 }}>
                  <Input label="RT / RW" value={rtRw} onChangeText={setRtRw} />
                </View>
                <View style={{ flex: 1 }}>
                  <Input label="Kelurahan / Desa" value={kelurahan} onChangeText={setKelurahan} />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <View style={{ flex: 1 }}>
                  <Input label="Kecamatan" value={kecamatan} onChangeText={setKecamatan} />
                </View>
                <View style={{ flex: 1 }}>
                  <Input label="Kota / Kabupaten" value={kota} onChangeText={setKota} />
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <Text style={[styles.subSectionTitle, { color: colors.text }]}>Informasi Kontak & Keanggotaan PAN</Text>

              <Input label="Nomor WhatsApp / Handphone" icon="phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
              <Input label="Alamat Email" icon="mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

              <Input label="Penempatan DPD" icon="shield" value={dpd} onChangeText={setDpd} />
              <Input label="Penempatan DPC" icon="map" value={dpc} onChangeText={setDpc} />
              <Input label="Minat Organisasi / Sayap Partai" icon="award" value={sayapPartai} onChangeText={setSayapPartai} />

              <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
                <PrimaryButton label="Pindai Ulang" icon="rotate-ccw" variant="secondary" onPress={() => setStep('scan')} style={{ flex: 1 }} />
                <PrimaryButton label="Terbitkan e-KTA" icon="check" onPress={handleIssueKta} style={{ flex: 1.6 }} />
              </View>
            </Card>
          </View>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 3: E-KTA RESMI TERBIT */}
        {/* ------------------------------------------------------------- */}
        {step === 'completed' && (
          <View style={{ gap: spacing.md }}>
            <View style={[styles.successCelebrationCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.celebrationIcon, { backgroundColor: '#DCFCE7' }]}>
                <Feather name="award" size={28} color="#15803D" />
              </View>
              <Text style={[styles.celebrationTitle, { color: colors.text }]}>Pendaftaran Kader Berhasil!</Text>
              <Text style={[styles.celebrationSub, { color: colors.textMuted }]}>
                e-KTA resmi telah berhasil diterbitkan dan terdaftar dalam sistem simPAN DPP PAN.
              </Text>
            </View>

            {/* Kartu e-KTA Fisik-Digital PAN */}
            <View style={styles.ktaPhysicalCard}>
              <View style={styles.ktaHeaderLine}>
                <Image source={BRAND_ASSETS.official} style={{ width: 42, height: 42 }} resizeMode="contain" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.ktaPartyTitle}>PARTAI AMANAT NASIONAL</Text>
                  <Text style={styles.ktaPartySub}>KARTU TANDA ANGGOTA ELEKTRONIK (e-KTA)</Text>
                </View>
                <View style={styles.ktaChip}>
                  <Text style={styles.ktaChipText}>simPAN</Text>
                </View>
              </View>

              <View style={styles.ktaBody}>
                <View style={styles.ktaAvatarWrap}>
                  {photoUri ? (
                    <Image source={{ uri: photoUri }} style={{ width: '100%', height: '100%', borderRadius: radius.sm }} />
                  ) : (
                    <Image source={getWitnessAvatar(1)} style={{ width: '100%', height: '100%', borderRadius: radius.sm }} />
                  )}
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.ktaKtaNum}>{noKta || '32.73.01.2024.08912'}</Text>
                  <Text style={styles.ktaHolderName}>{nama || 'FAJAR PRATAMA NUGRAHA'}</Text>
                  <Text style={styles.ktaMetaText}>NIK: {nik || '3273011508920005'}</Text>
                  <Text style={styles.ktaMetaText}>TTL: {tempatLahir || 'Bandung'}, {tglLahir || '15/08/1992'}</Text>
                  <Text style={styles.ktaMetaText}>Wilayah: {dpd}</Text>
                </View>
              </View>

              <View style={styles.ktaFooter}>
                <View style={styles.ktaQrPlaceholder}>
                  <Feather name="grid" size={32} color="#0F172A" />
                </View>
                <View style={{ flex: 1, alignItems: 'flex-end', gap: 1 }}>
                  <Text style={styles.ktaSigRole}>Ketua Umum DPP PAN</Text>
                  <Text style={styles.ktaSigName}>Dr. (H.C.) Zulkifli Hasan</Text>
                  <Text style={styles.ktaSigSec}>Sekjen: Eddy Soeparno</Text>
                </View>
              </View>
            </View>

            <Card style={{ gap: spacing.sm }}>
              <PrimaryButton
                label="Unduh / Simpan e-KTA (PDF)"
                icon="download"
                onPress={() =>
                  setDialogConfig({
                    visible: true,
                    title: 'e-KTA Diunduh',
                    message: `e-KTA dengan No. ${noKta} berhasil disimpan ke memori perangkat.`,
                    tone: 'success',
                  })
                }
              />

              <PrimaryButton
                label="Masuk ke Akun Kader simPAN"
                icon="log-in"
                variant="secondary"
                onPress={handleLoginAsMember}
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
                <Text style={[styles.registerOtherText, { color: colors.primary }]}>Daftarkan Anggota Baru Lainnya</Text>
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
  stepItem: { alignItems: 'center', gap: 4, width: 84 },
  stepCircle: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  stepNum: { fontFamily: fonts.bold, fontSize: 11 },
  stepLabel: { fontFamily: fonts.medium, fontSize: 10, textAlign: 'center' },
  stepLine: { flex: 1, height: 2, marginBottom: 16, marginHorizontal: -10 },
  viewfinderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  aiDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#00D2FF' },
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
  laserLine: { position: 'absolute', left: 0, right: 0, height: 3, shadowColor: '#00D2FF', shadowOpacity: 0.8, shadowRadius: 6 },
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
  ktaPhysicalCard: {
    backgroundColor: '#002B49',
    borderRadius: radius.xl,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: '#0066B3',
    ...shadow.card,
  },
  ktaHeaderLine: { flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.15)', paddingBottom: 8 },
  ktaPartyTitle: { fontFamily: fonts.extraBold, fontSize: 12, color: '#FFFFFF', letterSpacing: 0.5 },
  ktaPartySub: { fontFamily: fonts.bold, fontSize: 8.5, color: '#93C5FD' },
  ktaChip: { backgroundColor: '#0066B3', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  ktaChipText: { fontFamily: fonts.extraBold, fontSize: 9, color: '#FFFFFF' },
  ktaBody: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 4 },
  ktaAvatarWrap: { width: 56, height: 68, borderRadius: radius.sm, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  ktaKtaNum: { fontFamily: fonts.extraBold, fontSize: 12, color: '#60A5FA', letterSpacing: 0.5 },
  ktaHolderName: { fontFamily: fonts.bold, fontSize: 13, color: '#FFFFFF' },
  ktaMetaText: { fontFamily: fonts.medium, fontSize: 9.5, color: 'rgba(255,255,255,0.8)' },
  ktaFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    paddingTop: 8,
  },
  ktaQrPlaceholder: { width: 44, height: 44, borderRadius: 4, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  ktaSigRole: { fontFamily: fonts.regular, fontSize: 8, color: '#93C5FD' },
  ktaSigName: { fontFamily: fonts.bold, fontSize: 10, color: '#FFFFFF' },
  ktaSigSec: { fontFamily: fonts.regular, fontSize: 8, color: 'rgba(255,255,255,0.7)' },
  registerOtherBtn: { alignItems: 'center', paddingVertical: 8 },
  registerOtherText: { fontFamily: fonts.bold, fontSize: fontSize.xs },
});
