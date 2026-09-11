import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { PrimaryButton, Input, Card } from '../components/ui';
import { fontSize, iconStrokeWidth, radius, spacing } from '../theme';
import { ACCOUNTS, CADRE_CANDIDATE_ACCOUNTS, MOBILE_FIELD_ACCOUNTS, PENGURUS_ACCOUNTS, findAccount } from '../data/accounts';
import { ROLE_LABEL, ROLE_SCOPE_DESCRIPTION } from '../utils/scope';
import { BRAND_ASSETS } from '../data/images';
import RegisterMemberScreen from './RegisterMemberScreen';

export default function LoginScreen() {
  const { login } = useApp();
  const { colors } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDemoAccounts, setShowDemoAccounts] = useState(true);
  const [demoCategory, setDemoCategory] = useState<'saksi' | 'kader' | 'pengurus'>('kader');
  const [showRegisterScreen, setShowRegisterScreen] = useState(false);

  const handleSubmit = () => {
    const account = findAccount(email, password);
    if (!account) {
      setError('Email atau kata sandi tidak cocok dengan akun demo manapun.');
      return;
    }
    setError(null);
    login(account.role);
  };

  const fillDemoAccount = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError(null);
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

  const currentCategoryAccounts =
    demoCategory === 'saksi'
      ? MOBILE_FIELD_ACCOUNTS
      : demoCategory === 'kader'
      ? CADRE_CANDIDATE_ACCOUNTS
      : PENGURUS_ACCOUNTS;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Brand Header — Modern Sleek simPAN Official */}
        <View style={styles.brandBlock}>
          <View style={[styles.logoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Image
              source={BRAND_ASSETS.official}
              style={styles.officialLogo}
              resizeMode="contain"
            />
          </View>
          <Text style={[styles.brandTitle, { color: colors.text }]}>sim<Text style={{ color: colors.primary }}>PAN</Text></Text>
          <View style={[styles.partyCapsule, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.partyCapsuleText, { color: colors.primary }]}>PARTAI AMANAT NASIONAL</Text>
          </View>
          <Text style={[styles.tagline, { color: colors.textMuted }]}>
            Sistem Informasi Manajemen Data & Pengawalan Pemilu
          </Text>
        </View>

        <Card style={styles.card}>
          <Text style={[styles.formTitle, { color: colors.text }]}>Masuk ke Akun simPAN</Text>

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

          <Pressable
            hitSlop={8}
            style={styles.demoToggle}
            onPress={() => setShowDemoAccounts((v) => !v)}
          >
            <Feather name="users" size={16} color={colors.primary} strokeWidth={iconStrokeWidth} />
            <Text style={[styles.demoToggleText, { color: colors.primary }]}>
              {showDemoAccounts ? 'Sembunyikan Akun Per Peran' : 'Pilih Akun Demo Per Peran (RBAC)'}
            </Text>
          </Pressable>

          {showDemoAccounts && (
            <View style={[styles.demoList, { borderTopColor: colors.border }]}>
              {/* Category selector pills */}
              <View style={styles.catTabRow}>
                <Pressable
                  onPress={() => setDemoCategory('kader')}
                  style={[
                    styles.catTab,
                    { backgroundColor: demoCategory === 'kader' ? colors.primary : colors.background, borderColor: colors.border },
                  ]}
                >
                  <Text style={[styles.catTabText, { color: demoCategory === 'kader' ? '#FFFFFF' : colors.text }]}>
                    Caleg & Kader (2)
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setDemoCategory('saksi')}
                  style={[
                    styles.catTab,
                    { backgroundColor: demoCategory === 'saksi' ? colors.primary : colors.background, borderColor: colors.border },
                  ]}
                >
                  <Text style={[styles.catTabText, { color: demoCategory === 'saksi' ? '#FFFFFF' : colors.text }]}>
                    Saksi & Lapangan (3)
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setDemoCategory('pengurus')}
                  style={[
                    styles.catTab,
                    { backgroundColor: demoCategory === 'pengurus' ? colors.primary : colors.background, borderColor: colors.border },
                  ]}
                >
                  <Text style={[styles.catTabText, { color: demoCategory === 'pengurus' ? '#FFFFFF' : colors.text }]}>
                    Pengurus Wilayah (5)
                  </Text>
                </Pressable>
              </View>

              {currentCategoryAccounts.map((a) => (
                <Pressable
                  key={a.role}
                  hitSlop={4}
                  style={({ pressed }) => [
                    styles.demoRow,
                    { backgroundColor: colors.background, borderColor: colors.border },
                    pressed && { opacity: 0.75, transform: [{ scale: 0.98 }] },
                  ]}
                  onPress={() => fillDemoAccount(a.email, a.password)}
                >
                  <View style={styles.demoRoleIconWrap}>
                    <Feather name="user-check" size={16} color={colors.primary} strokeWidth={iconStrokeWidth} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.demoRole, { color: colors.text }]}>{ROLE_LABEL[a.role]}</Text>
                    <Text style={[styles.demoDesc, { color: colors.primary }]}>
                      {ROLE_SCOPE_DESCRIPTION[a.role]}
                    </Text>
                    <Text style={[styles.demoCreds, { color: colors.textMuted }]}>
                      {a.email} / {a.password}
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={18} color={colors.textMuted} strokeWidth={iconStrokeWidth} />
                </Pressable>
              ))}
            </View>
          )}
        </Card>

        <Text style={[styles.footnote, { color: colors.textMuted }]}>
          simPAN — Sistem Informasi Manajemen Data Partai Amanat Nasional. Seluruh akun demo & data wilayah bersifat simulasi.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.xl, paddingTop: 48, paddingBottom: spacing.xxl + 40, gap: spacing.md },
  brandBlock: { alignItems: 'center', marginTop: spacing.sm, marginBottom: spacing.sm, gap: 5 },
  logoCard: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0066B3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 4,
  },
  officialLogo: { width: 54, height: 78 },
  brandTitle: { fontSize: 21, fontWeight: '900', letterSpacing: 0.8 },
  partyCapsule: {
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  partyCapsuleText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  tagline: { fontSize: 12, textAlign: 'center', maxWidth: 300, lineHeight: 16 },
  card: { gap: spacing.md },
  formTitle: { fontSize: fontSize.lg, fontWeight: '800' },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  errorText: { fontSize: fontSize.xs, flex: 1, fontWeight: '600' },
  demoToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: spacing.xs },
  demoToggleText: { fontSize: fontSize.xs, fontWeight: '700' },
  demoList: { gap: spacing.sm, borderTopWidth: 1, paddingTop: spacing.md },
  demoSectionTitle: { fontSize: 11, fontWeight: '600', marginBottom: 2 },
  demoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  demoRoleIconWrap: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  demoRole: { fontSize: fontSize.sm, fontWeight: '800' },
  demoDesc: { fontSize: 11, fontWeight: '700', marginTop: 1 },
  demoCreds: { fontSize: 11, marginTop: 2 },
  footnote: { fontSize: fontSize.xs, textAlign: 'center' },
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
    marginTop: 2,
  },
  registerBannerTitle: {
    fontSize: fontSize.xs,
    fontWeight: '800',
  },
  registerBannerSub: {
    fontSize: 10.5,
    marginTop: 1,
  },
  catTabRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: spacing.xs,
  },
  catTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  catTabText: {
    fontSize: 10,
    fontWeight: '800',
  },
});
