import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Image, ImageBackground, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Card, IconButton, Input, Modal, PrimaryButton, SectionTitle } from '../components/ui';
import { fontSize, iconStrokeWidth, radius, spacing } from '../theme';
import { pickImage } from '../utils/pickImage';

type ScanStage = 'idle' | 'scanning' | 'extracted' | 'saved';

const STEPS = ['Foto KTP', 'Ekstraksi Data', 'Simpan Data'];

const MONTH_NAMES = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const WEEKDAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

function pad2(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function parseDob(value: string): Date | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return null;
  const [, dd, mm, yyyy] = match;
  return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
}

function buildCalendarCells(year: number, month: number) {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<number | null> = new Array(firstWeekday).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function chunkWeeks(cells: Array<number | null>) {
  const weeks: Array<Array<number | null>> = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
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

export default function KtpOcrScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [stage, setStage] = useState<ScanStage>('idle');
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const scrollRef = useRef<ScrollView>(null);
  const scrollOffsetRef = useRef(0);
  const scrollFieldIntoView = (fieldRef: React.RefObject<View | null>, offsetExtra = 0) => () => {
    setTimeout(() => {
      const node = fieldRef.current;
      const scrollNode = scrollRef.current;
      if (!node || !scrollNode) return;
      node.measureInWindow((_fx: number, fy: number) => {
        (scrollNode as any).measureInWindow((_sx: number, sy: number) => {
          const delta = fy - sy - 60 + offsetExtra;
          if (delta > 0) scrollNode.scrollTo({ y: scrollOffsetRef.current + delta, animated: true });
        });
      });
    }, 150);
  };
  const nikFieldRef = useRef<View>(null);
  const nameFieldRef = useRef<View>(null);
  const addressFieldRef = useRef<View>(null);
  const phoneFieldRef = useRef<View>(null);
  const emailFieldRef = useRef<View>(null);

  // Extracted KTP Data
  const [nik, setNik] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [dob, setDob] = useState('');

  // Data Opsional
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  const handlePickProfilePhoto = async (source: 'camera' | 'library') => {
    const uri = await pickImage(source);
    if (uri) setProfilePhoto(uri);
  };

  const [dobPickerOpen, setDobPickerOpen] = useState(false);
  const [calendarCursor, setCalendarCursor] = useState(() => new Date());

  const openDobPicker = () => {
    setCalendarCursor(parseDob(dob) || new Date());
    setDobPickerOpen(true);
  };

  const selectDobDay = (day: number) => {
    setDob(`${pad2(day)}/${pad2(calendarCursor.getMonth() + 1)}/${calendarCursor.getFullYear()}`);
    setDobPickerOpen(false);
  };

  const shiftCalendarMonth = (delta: number) => {
    setCalendarCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const selectedDob = parseDob(dob);

  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (stage !== 'scanning') return;
    scanAnim.setValue(0);
    const loop = Animated.loop(
      Animated.timing(scanAnim, { toValue: 1, duration: 1100, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [stage, scanAnim]);

  const activeStepIndex = stage === 'idle' || stage === 'scanning' ? 0 : stage === 'extracted' ? 1 : 2;

  const hasUnsavedChanges = stage !== 'saved'
    && (!!photoUri || !!nik || !!name || !!address || !!dob || !!phone || !!email || !!profilePhoto);
  const hasUnsavedRef = useRef(hasUnsavedChanges);
  hasUnsavedRef.current = hasUnsavedChanges;

  useEffect(() => {
    return navigation.addListener('beforeRemove', (e: any) => {
      if (!hasUnsavedRef.current) return;
      e.preventDefault();
      Alert.alert(
        'Keluar Tanpa Menyimpan?',
        'Data KTP yang sudah diisi akan hilang jika Anda keluar sekarang.',
        [
          { text: 'Batal', style: 'cancel' },
          { text: 'Keluar', style: 'destructive', onPress: () => navigation.dispatch(e.data.action) },
        ],
      );
    });
  }, [navigation]);

  const handlePick = async (source: 'camera' | 'library') => {
    const uri = await pickImage(source);
    if (!uri) return;
    setPhotoUri(uri);
    handleScanKtp();
  };

  const handleScanKtp = () => {
    setStage('scanning');
    setTimeout(() => {
      setNik('3271041908940003');
      setName('BAMBANG HIDAYAT');
      setAddress('Jl. Ir. H. Juanda No. 128, Kel. Dago, Kec. Coblong, Kota Bandung');
      setDob('19/08/1994');
      setStage('extracted');
    }, 1200);
  };

  const handleSave = () => {
    setStage('saved');
    setTimeout(() => {
      navigation.goBack();
    }, 1200);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
    <ScrollView
      ref={scrollRef}
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      onScroll={(e) => { scrollOffsetRef.current = e.nativeEvent.contentOffset.y; }}
      scrollEventThrottle={16}
    >
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={[styles.headerIconWrap, { backgroundColor: colors.primaryLight }]}>
            <Feather name="credit-card" size={20} color={colors.primary} strokeWidth={iconStrokeWidth} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: colors.text }]}>Pemindaian KTP Saksi</Text>
            <Text style={[styles.subTitle, { color: colors.textMuted }]}>
              Pindai KTP Saksi untuk mengisi NIK, nama, dan alamat secara otomatis.
            </Text>
          </View>
        </View>
      </View>

      <StepProgress activeIndex={activeStepIndex} />

      {/* Frame Pemindaian KTP */}
      <Card style={{ padding: 0, overflow: 'hidden', borderRadius: radius.xl }}>
        <View style={[styles.accentStripe, { backgroundColor: colors.primary }]} />
        <View style={styles.ktpHeaderBar}>
          <View style={styles.headerNumBadge}>
            <Text style={styles.headerNumBadgeText}>1</Text>
          </View>
          <Text style={styles.ktpHeaderTitle}>Pemindaian KTP Lapangan</Text>
          <View style={[styles.ocrBadge, { backgroundColor: `${colors.primary}55` }]}>
            <Feather name="camera" size={10} color="#FFFFFF" strokeWidth={iconStrokeWidth} />
            <Text style={styles.ocrBadgeText}>KTP</Text>
          </View>
        </View>

        {photoUri ? (
          <ImageBackground source={{ uri: photoUri }} style={styles.ktpViewfinder}>
            <View style={styles.ktpFrameWrap}>
              <View style={styles.ktpTargetFrame}>
                {stage === 'scanning' && (
                  <Animated.View
                    style={[
                      styles.scanLine,
                      { backgroundColor: colors.primary, transform: [{ translateY: scanAnim.interpolate({ inputRange: [0, 1], outputRange: [-70, 70] }) }] },
                    ]}
                  />
                )}
              </View>
            </View>
          </ImageBackground>
        ) : (
          <View style={[styles.ktpViewfinder, styles.ktpViewfinderEmpty]}>
            <View style={styles.ktpFrameWrap}>
              <View style={styles.ktpTargetFrame}>
                <View style={[styles.scanIconWrap, { backgroundColor: `${colors.primary}33` }]}>
                  <Feather name="maximize" size={24} color={colors.primary} strokeWidth={iconStrokeWidth} />
                </View>
                <Text style={styles.targetHint}>Pindai KTP Saksi</Text>
              </View>
            </View>
          </View>
        )}

        <View style={[styles.ktpActionFooter, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          {photoUri ? (
            <PrimaryButton
              label={stage === 'scanning' ? 'Memproses Foto KTP...' : 'Pindai Ulang KTP'}
              icon="camera"
              onPress={() => handlePick('camera')}
              loading={stage === 'scanning'}
            />
          ) : (
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <PrimaryButton label="Ambil Foto" icon="camera" onPress={() => handlePick('camera')} style={{ flex: 1 }} />
              <PrimaryButton label="Pilih File" icon="upload" variant="secondary" onPress={() => handlePick('library')} style={{ flex: 1 }} />
            </View>
          )}
        </View>
      </Card>

      {/* Tips foto saat belum ada foto */}
      {stage === 'idle' && (
        <Card style={{ gap: spacing.sm }}>
          <View style={styles.formHeaderRow}>
            <View style={[styles.headerIconWrap, styles.formHeaderIcon, { backgroundColor: colors.infoBg }]}>
              <Feather name="info" size={16} color={colors.info} strokeWidth={iconStrokeWidth} />
            </View>
            <Text style={[styles.tipsTitle, { color: colors.text }]}>Tips Agar Hasil Pindai Akurat</Text>
          </View>
          {[
            'Pastikan pencahayaan cukup terang & tidak ada bayangan.',
            'Letakkan KTP di permukaan rata dan datar.',
            'Hindari pantulan cahaya (glare) pada permukaan KTP.',
          ].map((tip) => (
            <View key={tip} style={styles.tipRow}>
              <Feather name="check" size={13} color={colors.primary} strokeWidth={iconStrokeWidth} />
              <Text style={[styles.tipText, { color: colors.textMuted }]}>{tip}</Text>
            </View>
          ))}
        </Card>
      )}

      {/* Extracted Form Inputs */}
      {(stage === 'extracted' || stage === 'saved') && (
        <Card style={{ gap: spacing.sm, borderRadius: radius.xl }}>
          <View style={styles.formHeaderRow}>
            <View
              style={[
                styles.headerIconWrap,
                styles.formHeaderIcon,
                { backgroundColor: stage === 'saved' ? colors.successBg : colors.primaryLight },
              ]}
            >
              <Feather
                name={stage === 'saved' ? 'check-circle' : 'edit-3'}
                size={16}
                color={stage === 'saved' ? colors.success : colors.primary}
                strokeWidth={iconStrokeWidth}
              />
            </View>
            <View style={{ flex: 1 }}>
              <SectionTitle style={{ marginBottom: 0 }}>Hasil Ekstraksi Otomatis KTP</SectionTitle>
              <Text style={[styles.editHint, { color: colors.textMuted }]}>
                Silakan periksa dan perbaiki teks jika terdapat kesalahan pembacaan karakter.
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <View ref={nikFieldRef} style={{ flex: 1.4 }}>
              <Input
                label="NIK"
                icon="credit-card"
                value={nik}
                onChangeText={setNik}
                keyboardType="numeric"
                onFocus={scrollFieldIntoView(nikFieldRef)}
              />
            </View>
            <Pressable style={{ flex: 1 }} onPress={openDobPicker}>
              <View pointerEvents="none">
                <Input label="Tanggal Lahir" icon="calendar" value={dob} placeholder="dd/mm/yyyy" />
              </View>
            </Pressable>
          </View>

          <View ref={nameFieldRef}>
            <Input
              label="Nama Lengkap Saksi"
              icon="user"
              value={name}
              onChangeText={setName}
              autoCapitalize="characters"
              onFocus={scrollFieldIntoView(nameFieldRef)}
            />
          </View>

          <View ref={addressFieldRef}>
            <Input
              label="Alamat KTP"
              icon="map-pin"
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={2}
              onFocus={scrollFieldIntoView(addressFieldRef)}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Text style={[styles.optionalLabel, { color: colors.textMuted }]}>Data Tambahan (Opsional)</Text>

          <View style={{ gap: spacing.sm }}>
            <View ref={phoneFieldRef}>
              <Input
                label="No. Telepon"
                icon="phone"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                onFocus={scrollFieldIntoView(phoneFieldRef, 60)}
              />
            </View>
            <View ref={emailFieldRef}>
              <Input
                label="Email Saksi"
                icon="mail"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={scrollFieldIntoView(emailFieldRef, 120)}
              />
            </View>
          </View>

          <View style={styles.profilePhotoRow}>
            <View style={[styles.profilePhotoAvatar, { backgroundColor: colors.background, borderColor: colors.border }]}>
              {profilePhoto ? (
                <Image source={{ uri: profilePhoto }} style={styles.profilePhotoImg} />
              ) : (
                <Feather name="user" size={22} color={colors.textMuted} strokeWidth={iconStrokeWidth} />
              )}
            </View>
            <View style={{ flex: 1, gap: spacing.xs }}>
              <Text style={[styles.profilePhotoLabel, { color: colors.text }]}>Foto Profil (Opsional)</Text>
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <PrimaryButton label="Ambil Foto" icon="camera" variant="secondary" onPress={() => handlePickProfilePhoto('camera')} style={{ flex: 1 }} />
                <PrimaryButton label="Pilih File" icon="upload" variant="secondary" onPress={() => handlePickProfilePhoto('library')} style={{ flex: 1 }} />
              </View>
            </View>
          </View>

          {stage === 'saved' ? (
            <View style={[styles.successBanner, { backgroundColor: colors.successBg }]}>
              <View style={[styles.successIconWrap, { backgroundColor: colors.success }]}>
                <Feather name="check" size={18} color="#FFFFFF" strokeWidth={iconStrokeWidth} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.successTitle, { color: colors.success }]}>Data Saksi Tersimpan</Text>
                <Text style={[styles.successSubtitle, { color: colors.textMuted }]}>Verifikasi berhasil, mengalihkan halaman...</Text>
              </View>
            </View>
          ) : (
            <PrimaryButton
              label="Simpan & Verifikasi Data Saksi"
              icon="check"
              onPress={handleSave}
              style={{ marginTop: spacing.xs }}
            />
          )}
        </Card>
      )}

      <Modal visible={dobPickerOpen} onClose={() => setDobPickerOpen(false)} title="Pilih Tanggal Lahir">
        <View style={styles.calendarHeaderRow}>
          <IconButton icon="chevron-left" onPress={() => shiftCalendarMonth(-1)} tone="ghost" size={18} shape="circle" />
          <Text style={[styles.calendarMonthLabel, { color: colors.text }]}>
            {MONTH_NAMES[calendarCursor.getMonth()]} {calendarCursor.getFullYear()}
          </Text>
          <IconButton icon="chevron-right" onPress={() => shiftCalendarMonth(1)} tone="ghost" size={18} shape="circle" />
        </View>

        <View style={styles.calendarWeekRow}>
          {WEEKDAY_NAMES.map((w) => (
            <Text key={w} style={[styles.calendarWeekday, { color: colors.textMuted }]}>{w}</Text>
          ))}
        </View>

        <View style={styles.calendarGrid}>
          {chunkWeeks(buildCalendarCells(calendarCursor.getFullYear(), calendarCursor.getMonth())).map((week, wi) => (
            <View key={wi} style={styles.calendarWeekCellsRow}>
              {week.map((day, di) => {
                const isSelected = !!day
                  && selectedDob?.getDate() === day
                  && selectedDob?.getMonth() === calendarCursor.getMonth()
                  && selectedDob?.getFullYear() === calendarCursor.getFullYear();
                return (
                  <Pressable
                    key={di}
                    disabled={!day}
                    onPress={() => day && selectDobDay(day)}
                    style={[styles.calendarCell, isSelected && { backgroundColor: colors.primary }]}
                  >
                    {day && (
                      <Text style={[styles.calendarCellText, { color: isSelected ? '#FFFFFF' : colors.text }]}>
                        {day}
                      </Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      </Modal>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },
  header: { gap: 2 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  headerIconWrap: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  formHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  formHeaderIcon: { width: 32, height: 32, borderRadius: radius.sm },
  title: { fontSize: fontSize.xl, fontWeight: '800' },
  subTitle: { fontSize: fontSize.xs, lineHeight: 18, marginTop: 2 },
  stepRow: { flexDirection: 'row', alignItems: 'center' },
  stepItem: { alignItems: 'center', gap: 4, width: 78 },
  stepCircle: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  stepNum: { fontSize: 11, fontWeight: '800' },
  stepLabel: { fontSize: 10.5, textAlign: 'center' },
  stepConnector: { flex: 1, height: 2, marginBottom: 14, marginHorizontal: -8 },
  accentStripe: { height: 3, width: '100%' },
  ktpHeaderBar: {
    backgroundColor: '#0F172A',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerNumBadge: { width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  headerNumBadgeText: { fontSize: 11, fontWeight: '800', color: '#FFFFFF' },
  ktpHeaderTitle: { fontSize: fontSize.xs, fontWeight: '700', color: '#FFFFFF', flex: 1 },
  ocrBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill },
  ocrBadgeText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },
  ktpViewfinder: { width: '100%', height: 210, justifyContent: 'space-between' },
  ktpViewfinderEmpty: { backgroundColor: '#0F172A' },
  ktpFrameWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  ktpTargetFrame: {
    width: '82%',
    maxHeight: '100%',
    aspectRatio: 1.586, // Rasio kartu KTP standar (85.6mm x 54mm)
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    gap: spacing.xs,
  },
  scanIconWrap: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  scanLine: { position: 'absolute', left: 4, right: 4, height: 2, borderRadius: 1, shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 4 },
  targetHint: { fontSize: 11, color: '#FFFFFF', fontWeight: '700', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  ktpActionFooter: { padding: spacing.md, borderTopWidth: 1 },
  editHint: { fontSize: fontSize.xs, marginTop: 2 },
  successBanner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderRadius: radius.md },
  successIconWrap: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  successTitle: { fontSize: fontSize.sm, fontWeight: '800' },
  successSubtitle: { fontSize: 11, marginTop: 1 },
  divider: { height: 1, marginTop: spacing.xs },
  optionalLabel: { fontSize: fontSize.xs, fontWeight: '700' },
  tipsTitle: { fontSize: fontSize.sm, fontWeight: '800', flex: 1 },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  tipText: { fontSize: fontSize.xs, lineHeight: 17, flex: 1 },
  profilePhotoRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  profilePhotoAvatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  profilePhotoImg: { width: '100%', height: '100%' },
  profilePhotoLabel: { fontSize: fontSize.xs, fontWeight: '700' },
  calendarHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  calendarMonthLabel: { fontSize: fontSize.sm, fontWeight: '800' },
  calendarWeekRow: { flexDirection: 'row', marginTop: spacing.sm },
  calendarWeekday: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '700' },
  calendarGrid: { marginTop: spacing.xs },
  calendarWeekCellsRow: { flexDirection: 'row' },
  calendarCell: { flex: 1, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill },
  calendarCellText: { fontSize: fontSize.sm, fontWeight: '600' },
});
