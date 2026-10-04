import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { fonts, radius, spacing } from '../theme';
import { findAccount } from '../data/accounts';
import { Role } from '../types';
import { BRAND_ASSETS } from '../data/images';
import RegisterVolunteerScreen from './RegisterVolunteerScreen';

interface DemoAccountItem {
  id: string;
  label: string;
  email: string;
  password: string;
  role: Role;
}

const DEMO_CHIPS: DemoAccountItem[] = [
  {
    id: 'fauzan',
    label: 'Ahmad (Kader simPAN)',
    email: 'ahmad.fauzan@pan.go.id',
    password: 'pan123',
    role: 'MEMBER',
  },
  {
    id: 'siti',
    label: 'Siti (Relawan Murni)',
    email: 'siti.rahmawati@relawanpan.id',
    password: 'pan123',
    role: 'VOLUNTEER',
  },
  {
    id: 'rudi',
    label: 'Rudi (Saksi TPS 001)',
    email: 'saksi@pan.go.id',
    password: 'saksi123',
    role: 'WITNESS',
  },
  {
    id: 'asep',
    label: 'Asep (Koordinator TPS)',
    email: 'korlap@pan.go.id',
    password: 'korlap123',
    role: 'TPS_COORDINATOR',
  },
  {
    id: 'dina',
    label: 'Dina (Anggota Partai)',
    email: 'anggota@pan.go.id',
    password: 'anggota123',
    role: 'MEMBER',
  },
];

export default function LoginScreen({ navigation }: any) {
  const { login } = useApp();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedDemoId, setSelectedDemoId] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRegisterScreen, setShowRegisterScreen] = useState(false);

  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const handleSelectDemo = (item: DemoAccountItem) => {
    setSelectedDemoId(item.id);
    setEmail(item.email);
    setPassword(item.password);
    setError(null);
    login(item.role, item.email);
  };

  const handleSubmit = () => {
    const account = findAccount(email, password);
    if (!account) {
      setError('Email / No. Handphone atau kata sandi yang dimasukkan belum terdaftar.');
      return;
    }
    setError(null);
    login(account.role, account.email);
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Lupa Kata Sandi?',
      'Silakan hubungi Administrator DPD/DPW PAN atau Koordinator Lapangan Anda dengan menyertakan Nomor KTA atau No. Handphone yang terdaftar untuk verifikasi dan pemulihan akun.',
      [{ text: 'Mengerti', style: 'default' }],
    );
  };

  const handleRegister = () => {
    if (navigation?.navigate) {
      navigation.navigate('RegisterVolunteer');
    } else {
      setShowRegisterScreen(true);
    }
  };

  if (showRegisterScreen) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar style={isDark ? 'light' : 'dark'} animated />
        <RegisterVolunteerScreen onBack={() => setShowRegisterScreen(false)} />
      </View>
    );
  }

  // Hitung tinggi proporsional hero (~35% tinggi layar)
  const heroMinHeight = Math.max(260, Math.round(screenHeight * 0.35));

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.primaryDark }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="light" animated />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Hero Section: Identitas Resmi PAN & Ucapan Selamat Datang (Center Vertikal dalam Kotak Biru) */}
        <View
          style={[
            styles.heroSection,
            {
              backgroundColor: colors.primaryDark,
              minHeight: heroMinHeight,
              paddingTop: insets.top + 12,
              paddingBottom: 24,
            },
          ]}
        >
          {/* Aksen visual ambient background */}
          <View style={styles.ambientCircleRight} pointerEvents="none" />
          <View style={styles.ambientCircleLeft} pointerEvents="none" />

          {/* Logo Resmi PAN */}
          <View style={[styles.logoCard, { backgroundColor: colors.surface }]}>
            <Image source={BRAND_ASSETS.official} style={styles.officialLogo} resizeMode="contain" />
          </View>

          {/* Judul Brand & Kapsul Partai */}
          <Text style={[styles.brandTitle, { color: colors.textInverse }]}>
            sim<Text style={{ color: colors.primaryLight }}>PAN</Text>
          </Text>
          <View style={[styles.partyCapsule, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.partyCapsuleText, { color: colors.primary }]}>PARTAI AMANAT NASIONAL</Text>
          </View>

          {/* Ucapan Selamat Datang & Subtitle */}
          <Text style={styles.welcomeHeading}>Selamat Datang Kembali!</Text>
          <Text style={styles.welcomeSubtitle}>
            Sistem Informasi Manajemen Data & Pengawalan Pemilu
          </Text>
        </View>

        {/* Bottom Sheet: Form Masuk & 1-Klik Demo Akun */}
        <View
          style={[
            styles.bottomSheet,
            {
              backgroundColor: isDark ? colors.surface : '#FFFFFF',
              paddingBottom: Math.max(insets.bottom, 24) + 16,
            },
          ]}
        >
          {/* Header 1-Klik Demo Akun */}
          <Text style={styles.demoSectionLabel}>PILIH AKUN DEMO (1-KLIK):</Text>

          {/* Horizontal Chips Akun Demo */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipsScrollView}
            contentContainerStyle={styles.chipsScrollContainer}
          >
            {DEMO_CHIPS.map((chip) => {
              const isSelected = selectedDemoId === chip.id;
              return (
                <Pressable
                  key={chip.id}
                  onPress={() => handleSelectDemo(chip)}
                  style={({ pressed }) => [
                    styles.chipPill,
                    isSelected
                      ? [styles.chipPillActive, { borderColor: colors.primary, backgroundColor: isDark ? 'rgba(0,102,179,0.2)' : '#E0F2FE' }]
                      : [styles.chipPillInactive, { borderColor: colors.border, backgroundColor: isDark ? colors.background : '#F1F5F9' }],
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <View
                    style={[
                      styles.chipDot,
                      { backgroundColor: isSelected ? colors.primary : colors.textMuted },
                    ]}
                  />
                  <Text
                    style={[
                      styles.chipText,
                      isSelected
                        ? [styles.chipTextActive, { color: colors.primary }]
                        : [styles.chipTextInactive, { color: colors.textMuted }],
                    ]}
                  >
                    {chip.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Error Banner */}
          {error && (
            <View style={[styles.errorBanner, { backgroundColor: colors.dangerBg, borderColor: colors.danger }]}>
              <Feather name="alert-circle" size={16} color={colors.danger} />
              <Text style={[styles.errorBannerText, { color: colors.danger }]}>{error}</Text>
            </View>
          )}

          {/* Field 1: Email / KTA / No. Handphone */}
          <Text style={[styles.fieldLabel, { color: colors.text }]}>Email / KTA / No. Handphone</Text>
          <TextInput
            style={[
              styles.underlineInput,
              { borderBottomColor: isEmailFocused ? colors.primary : colors.border, color: colors.text },
            ]}
            value={email}
            onChangeText={(val) => {
              setEmail(val);
              setSelectedDemoId(null);
            }}
            placeholder="nama@pan.go.id / No. KTA"
            placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
            autoCapitalize="none"
            keyboardType="email-address"
            onFocus={() => setIsEmailFocused(true)}
            onBlur={() => setIsEmailFocused(false)}
          />

          {/* Field 2: Kata Sandi */}
          <Text style={[styles.fieldLabel, { color: colors.text, marginTop: 16 }]}>Kata Sandi</Text>
          <View
            style={[
              styles.passwordRow,
              { borderBottomColor: isPasswordFocused ? colors.primary : colors.border },
            ]}
          >
            <TextInput
              style={[
                styles.underlineInputInner,
                { color: colors.text },
              ]}
              value={password}
              onChangeText={(val) => {
                setPassword(val);
                setSelectedDemoId(null);
              }}
              placeholder="Masukkan kata sandi"
              placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
            />
            <Pressable
              onPress={() => setShowPassword((prev) => !prev)}
              hitSlop={10}
              style={styles.eyeIconButton}
            >
              <Feather
                name={showPassword ? 'eye-off' : 'eye'}
                size={18}
                color={colors.textMuted}
              />
            </Pressable>
          </View>

          {/* Row Aksi: Ingat Saya & Lupa Sandi */}
          <View style={styles.actionRow}>
            <Pressable
              onPress={() => setRememberMe((prev) => !prev)}
              style={styles.rememberMeContainer}
            >
              <View
                style={[
                  styles.checkboxBox,
                  { borderColor: rememberMe ? colors.primaryDark : colors.border },
                  rememberMe && { backgroundColor: colors.primaryDark },
                ]}
              >
                {rememberMe && <Feather name="check" size={12} color="#FFFFFF" strokeWidth={3} />}
              </View>
              <Text style={[styles.rememberMeLabel, { color: colors.text }]}>Ingat Saya</Text>
            </Pressable>

            <Pressable onPress={handleForgotPassword} hitSlop={8}>
              <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>Lupa Sandi?</Text>
            </Pressable>
          </View>

          {/* Tombol Utama: MASUK */}
          <Pressable
            onPress={handleSubmit}
            style={({ pressed }) => [
              styles.masukButton,
              { backgroundColor: colors.primaryDark },
              pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
            ]}
          >
            <Text style={styles.masukButtonText}>MASUK</Text>
          </Pressable>

          {/* Tautan Pendaftaran Relawan: Terikat Rapi Tepat di Bawah Tombol Masuk */}
          <Pressable onPress={handleRegister} style={styles.registerPromptRow} hitSlop={8}>
            <Text style={[styles.registerPromptText, { color: colors.textMuted }]}>
              Belum punya akun?{' '}
              <Text style={[styles.registerPromptLink, { color: colors.primary }]}>DAFTAR SEKARANG</Text>
            </Text>
          </Pressable>

          {/* Catatan Kaki / Hak Cipta */}
          <Text style={[styles.copyrightText, { color: colors.textMuted }]}>
            simPAN — Sistem Informasi Manajemen Data Partai Amanat Nasional © 2026. Data pada versi ini bersifat simulasi.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroSection: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    position: 'relative',
    overflow: 'hidden',
  },
  ambientCircleRight: {
    position: 'absolute',
    top: -50,
    right: -40,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  ambientCircleLeft: {
    position: 'absolute',
    bottom: 20,
    left: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  logoCard: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00111F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 4,
  },
  officialLogo: {
    width: 48,
    height: 68,
  },
  brandTitle: {
    fontFamily: fonts.extraBold,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.6,
    marginTop: 2,
  },
  partyCapsule: {
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: radius.pill,
    marginTop: 3,
    marginBottom: 8,
  },
  partyCapsuleText: {
    fontFamily: fonts.bold,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  welcomeHeading: {
    fontFamily: fonts.bold,
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
    textAlign: 'center',
    marginBottom: 3,
  },
  welcomeSubtitle: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    maxWidth: 310,
    lineHeight: 16,
  },
  bottomSheet: {
    flex: 1,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  demoSectionLabel: {
    fontFamily: fonts.bold,
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  chipsScrollView: {
    flexGrow: 0,
    marginBottom: 10,
  },
  chipsScrollContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 20,
    paddingVertical: 2,
  },
  chipPill: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 35,
    paddingHorizontal: 13,
    borderRadius: 17.5,
    borderWidth: 1,
    gap: 6,
  },
  chipPillInactive: {},
  chipPillActive: {
    borderWidth: 1.3,
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chipText: {
    fontSize: 12,
  },
  chipTextInactive: {
    fontFamily: fonts.semiBold,
    fontWeight: '600',
  },
  chipTextActive: {
    fontFamily: fonts.bold,
    fontWeight: '700',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: 10,
    marginBottom: 4,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 12,
    fontFamily: fonts.semiBold,
    fontWeight: '600',
  },
  fieldLabel: {
    fontFamily: fonts.bold,
    fontSize: 12.5,
    fontWeight: '700',
    marginTop: 14,
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  underlineInput: {
    borderBottomWidth: 1.5,
    paddingVertical: 5,
    paddingHorizontal: 0,
    fontSize: 12.5,
    fontFamily: fonts.regular,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1.5,
  },
  underlineInputInner: {
    flex: 1,
    paddingVertical: 5,
    paddingHorizontal: 0,
    fontSize: 12.5,
    fontFamily: fonts.regular,
  },
  eyeIconButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkboxBox: {
    width: 17,
    height: 17,
    borderRadius: 4,
    borderWidth: 1.5,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rememberMeLabel: {
    fontFamily: fonts.medium,
    fontSize: 12.5,
    fontWeight: '500',
  },
  forgotPasswordText: {
    fontFamily: fonts.bold,
    fontSize: 12.5,
    fontWeight: '700',
  },
  masukButton: {
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  masukButtonText: {
    fontFamily: fonts.bold,
    fontSize: 14.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.2,
  },
  registerPromptRow: {
    marginTop: 18,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerPromptText: {
    fontFamily: fonts.medium,
    fontSize: 12.5,
    textAlign: 'center',
  },
  registerPromptLink: {
    fontFamily: fonts.bold,
    fontWeight: '800',
  },
  copyrightText: {
    fontFamily: fonts.regular,
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 14,
  },
});
