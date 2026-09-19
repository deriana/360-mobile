import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { PrimaryButton, Input } from '../components/ui';
import { QuickLoginPicker, QuickLoginCategory } from '../components/QuickLoginPicker';
import { fontSize, fonts, iconStrokeWidth, radius, spacing } from '../theme';
import {
  COORDINATOR_ACCOUNTS,
  MEMBER_ACCOUNTS,
  VOLUNTEER_ACCOUNTS,
  WITNESS_ACCOUNTS,
  findAccount,
} from '../data/accounts';
import { Role } from '../types';
import { BRAND_ASSETS } from '../data/images';
import RegisterMemberScreen from './RegisterMemberScreen';

const QUICK_LOGIN_CATEGORIES: QuickLoginCategory[] = [
  { key: 'saksi', label: 'Saksi', fullLabel: 'Saksi TPS Resmi (Bilik Suara)', icon: 'eye', accounts: WITNESS_ACCOUNTS },
  { key: 'relawan', label: 'Relawan', fullLabel: 'Relawan Lapangan & Posko', icon: 'heart', accounts: VOLUNTEER_ACCOUNTS },
  { key: 'korlap', label: 'Korlap', fullLabel: 'Koordinator TPS & Wilayah', icon: 'users', accounts: COORDINATOR_ACCOUNTS },
  { key: 'anggota', label: 'Anggota', fullLabel: 'Kader & Anggota Partai (simPAN)', icon: 'user-check', accounts: MEMBER_ACCOUNTS },
];

export default function LoginScreen() {
  const { login } = useApp();
  const { colors, shadow, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRegisterScreen, setShowRegisterScreen] = useState(false);

  const handleSubmit = () => {
    const account = findAccount(email, password);
    if (!account) {
      setError('Email atau kata sandi yang dimasukkan belum terdaftar.');
      return;
    }
    setError(null);
    login(account.role, account.email);
  };

  const handleQuickLogin = (role: Role, accountEmail?: string) => {
    setError(null);
    login(role, accountEmail);
  };

  if (showRegisterScreen) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={[styles.registerHeaderBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Pressable
            onPress={() => setShowRegisterScreen(false)}
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
          >
            <Feather name="arrow-left" size={20} color={colors.text} />
            <Text style={[styles.backBtnText, { color: colors.text }]}>Kembali ke Login</Text>
          </Pressable>
        </View>
        <RegisterMemberScreen navigation={{ goBack: () => setShowRegisterScreen(false) }} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="light" animated />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Hero — identitas brand di atas panel biru pekat */}
        <View style={[styles.hero, { backgroundColor: colors.primaryDark, paddingTop: insets.top + spacing.lg }]}>
          <View style={[styles.logoCard, { backgroundColor: colors.surface }]}>
            <Image source={BRAND_ASSETS.official} style={styles.officialLogo} resizeMode="contain" />
          </View>
          <Text style={[styles.brandTitle, { color: colors.textInverse }]}>
            sim<Text style={{ color: colors.primaryLight }}>PAN</Text>
          </Text>
          <View style={[styles.partyCapsule, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.partyCapsuleText, { color: colors.primary }]}>PARTAI AMANAT NASIONAL</Text>
          </View>
          <Text style={[styles.tagline, { color: colors.textInverse, opacity: 0.82 }]}>
            Sistem Informasi Manajemen Data & Pengawalan Pemilu
          </Text>
        </View>

        {/* Sheet — form kerja, menumpuk di atas hero */}
        <View style={[styles.sheet, { backgroundColor: colors.surface }, shadow.card]}>
          <Text style={[styles.formTitle, { color: colors.text }]}>Masuk ke simPAN</Text>

          {error && (
            <View style={[styles.errorBanner, { backgroundColor: colors.dangerBg }]}>
              <Feather name="alert-circle" size={18} color={colors.danger} strokeWidth={iconStrokeWidth} />
              <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
            </View>
          )}

          <Input
            label="Alamat Email"
            icon="mail"
            value={email}
            onChangeText={setEmail}
            placeholder="nama@pan.go.id"
            autoCapitalize="none"
            keyboardType="email-address"
            onClear={() => setEmail('')}
          />

          <View style={{ gap: 6 }}>
            <Input
              label="Kata Sandi"
              icon="lock"
              value={password}
              onChangeText={setPassword}
              placeholder="Masukkan kata sandi"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <Pressable
              onPress={() => setShowPassword((v) => !v)}
              hitSlop={8}
              style={{ alignSelf: 'flex-end', padding: 4 }}
            >
              <Text style={{ fontSize: fontSize.xs, color: colors.primary, fontWeight: '700' }}>
                {showPassword ? 'Sembunyikan Sandi' : 'Tampilkan Sandi'}
              </Text>
            </Pressable>
          </View>

          <PrimaryButton label="Masuk Sekarang" icon="log-in" onPress={handleSubmit} style={{ marginTop: spacing.xs }} />

          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.textMuted }]}>atau</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          {/* Tombol Pendaftaran Anggota AI Scan KTP */}
          <Pressable
            onPress={() => setShowRegisterScreen(true)}
            style={({ pressed }) => [
              styles.registerBannerBtn,
              { backgroundColor: colors.primaryLight, borderColor: colors.primary },
              pressed && { opacity: 0.8 },
            ]}
          >
            <Feather name="camera" size={18} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.registerBannerTitle, { color: colors.primary }]}>
                Daftar Kader / Anggota (Scan KTP AI)
              </Text>
              <Text style={[styles.registerBannerSub, { color: colors.textMuted }]}>
                Ekstraksi otomatis NIK & terbitkan e-KTA digital instan
              </Text>
            </View>
            <Feather name="arrow-right" size={16} color={colors.primary} />
          </Pressable>

          {/* Persona Demo DPP PAN: 1-Tap Login Presentasi */}
          <View style={{ gap: 8, marginTop: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 11, fontFamily: fonts.bold, color: colors.primary, letterSpacing: 0.5 }}>
                DEMO PERSONA UTAMA DPP PAN
              </Text>
              <View style={{ backgroundColor: colors.primaryLight, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                <Text style={{ fontSize: 10, fontFamily: fonts.bold, color: colors.primary }}>1-Tap Demo</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              {/* Persona 1: Ahmad Fauzan */}
              <Pressable
                onPress={() => handleQuickLogin('MEMBER', 'ahmad.fauzan@pan.go.id')}
                style={({ pressed }) => [
                  styles.personaDemoCard,
                  { backgroundColor: colors.surface, borderColor: colors.primary },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <View style={[styles.personaIconBox, { backgroundColor: colors.primaryLight }]}>
                  <Feather name="user-check" size={16} color={colors.primary} />
                </View>
                <View style={{ flex: 1, gap: 1 }}>
                  <Text style={[styles.personaName, { color: colors.text }]} numberOfLines={1}>
                    Ahmad Fauzan
                  </Text>
                  <Text style={[styles.personaRole, { color: colors.primary }]} numberOfLines={1}>
                    Kader simPAN
                  </Text>
                  <Text style={[styles.personaSub, { color: colors.textMuted }]} numberOfLines={1}>
                    Full Lifecycle
                  </Text>
                </View>
              </Pressable>

              {/* Persona 2: Siti Rahmawati */}
              <Pressable
                onPress={() => handleQuickLogin('VOLUNTEER', 'siti.rahmawati@relawanpan.id')}
                style={({ pressed }) => [
                  styles.personaDemoCard,
                  { backgroundColor: colors.surface, borderColor: '#0284C7' },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <View style={[styles.personaIconBox, { backgroundColor: isDark ? 'rgba(2,132,199,0.2)' : '#E0F2FE' }]}>
                  <Feather name="heart" size={16} color="#0284C7" />
                </View>
                <View style={{ flex: 1, gap: 1 }}>
                  <Text style={[styles.personaName, { color: colors.text }]} numberOfLines={1}>
                    Siti Rahmawati
                  </Text>
                  <Text style={[styles.personaRole, { color: '#0284C7' }]} numberOfLines={1}>
                    Relawan Murni
                  </Text>
                  <Text style={[styles.personaSub, { color: colors.textMuted }]} numberOfLines={1}>
                    Non-KTA • Simpatisan
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>

          <QuickLoginPicker
            categories={QUICK_LOGIN_CATEGORIES}
            onSelectRole={handleQuickLogin}
          />
        </View>

        <Text style={[styles.footnote, { color: colors.textMuted }]}>
          simPAN — Sistem Informasi Manajemen Data Partai Amanat Nasional. Data pada versi ini bersifat simulasi.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, paddingBottom: spacing.xxl },
  hero: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl + 12,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    gap: 6,
  },
  logoCard: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00111F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 4,
  },
  officialLogo: { width: 54, height: 78 },
  brandTitle: { fontFamily: fonts.extraBold, fontSize: 22, fontWeight: '900', letterSpacing: 0.8 },
  partyCapsule: {
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  partyCapsuleText: {
    fontFamily: fonts.bold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  tagline: { fontFamily: fonts.medium, fontSize: 12, textAlign: 'center', maxWidth: 300, lineHeight: 16 },
  sheet: {
    marginTop: -24,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 28,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  formTitle: { fontFamily: fonts.bold, fontSize: fontSize.lg, fontWeight: '800' },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  errorText: { fontFamily: fonts.semiBold, fontSize: fontSize.xs, flex: 1, fontWeight: '600' },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontFamily: fonts.bold, fontSize: fontSize.xs, fontWeight: '700' },
  footnote: { fontFamily: fonts.regular, fontSize: fontSize.xs, textAlign: 'center', paddingHorizontal: spacing.xl, marginTop: spacing.md },
  registerHeaderBar: {
    paddingTop: 48,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  backBtnText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  registerBannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  registerBannerTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xs,
    fontWeight: '800',
  },
  registerBannerSub: {
    fontFamily: fonts.medium,
    fontSize: 10.5,
    marginTop: 1,
  },
  personaDemoCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: radius.md,
    borderWidth: 1.5,
    gap: 8,
  },
  personaIconBox: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personaName: {
    fontFamily: fonts.bold,
    fontSize: 11.5,
  },
  personaRole: {
    fontFamily: fonts.semiBold,
    fontSize: 10,
  },
  personaSub: {
    fontFamily: fonts.regular,
    fontSize: 9.5,
  },
});
