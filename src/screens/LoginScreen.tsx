import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { PrimaryButton, Input, Card } from '../components/ui';
import { fontSize, iconStrokeWidth, radius, spacing } from '../theme';
import { ACCOUNTS, MOBILE_FIELD_ACCOUNTS, findAccount } from '../data/accounts';
import { ROLE_LABEL, ROLE_SCOPE_DESCRIPTION } from '../utils/scope';
import { BRAND_ASSETS } from '../data/images';

export default function LoginScreen() {
  const { login } = useApp();
  const { colors } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDemoAccounts, setShowDemoAccounts] = useState(true);

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

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Brand Header with Theme-Adaptive Logo */}
        <View style={styles.brandBlock}>
          <View style={[styles.logoWrapper, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Image source={BRAND_ASSETS.emblem} style={{ width: 34, height: 34 }} resizeMode="contain" />
              <Image
                source={BRAND_ASSETS.logoText}
                style={{ width: 130, height: 28, tintColor: colors.text }}
                resizeMode="contain"
              />
            </View>
          </View>
          <Text style={[styles.tagline, { color: colors.textMuted, marginTop: 10 }]}>
            Sistem Pemantauan & Manajemen Saksi TPS Pemilu Indonesia
          </Text>
        </View>

        <Card style={styles.card}>
          <Text style={[styles.formTitle, { color: colors.text }]}>Masuk ke Akun Saksi 360</Text>

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
            placeholder="nama@saksi360.demo"
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

          <Pressable
            hitSlop={8}
            style={styles.demoToggle}
            onPress={() => setShowDemoAccounts((v) => !v)}
          >
            <Feather name="users" size={16} color={colors.primary} strokeWidth={iconStrokeWidth} />
            <Text style={[styles.demoToggleText, { color: colors.primary }]}>
              {showDemoAccounts ? 'Sembunyikan Akun Per Peran' : 'Pilih Akun Demo Per Tingkatan Wilayah'}
            </Text>
          </Pressable>

          {showDemoAccounts && (
            <View style={[styles.demoList, { borderTopColor: colors.border }]}>
              <Text style={[styles.demoSectionTitle, { color: colors.textMuted }]}>
                Pilih Akun Demo Peran Lapangan (3 Akun Sesuai Notulensi Rapat):
              </Text>

              {MOBILE_FIELD_ACCOUNTS.map((a) => (
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
          Prototipe Pemilu Saksi 360 — Seluruh akun demo & data wilayah bersifat simulasi.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.xl, paddingTop: 48, paddingBottom: spacing.xxl + 40, gap: spacing.md },
  brandBlock: { alignItems: 'center', marginVertical: spacing.md },
  logoWrapper: {
    backgroundColor: '#0A192F', // Dark Navy Brand background for high contrast
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0A192F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  logoImage: { width: 220, height: 60 },
  brand: { fontSize: fontSize.xl, fontWeight: '800', letterSpacing: 1.5 },
  tagline: { fontSize: fontSize.xs, textAlign: 'center', maxWidth: 280 },
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
});
