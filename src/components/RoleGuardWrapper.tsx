import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Card, AppText } from './ui';
import { fonts, spacing, radius } from '../theme';
import { MobileRole } from '../types';

interface GuardRule {
  isAllowed: (params: {
    role: MobileRole;
    isOfficialMember: boolean;
    isWitnessMandated: boolean;
    isCoordinator: boolean;
  }) => boolean;
  title: string;
  badge: string;
  message: string;
  actionLabel?: string;
  actionScreen?: string;
}

const GUARD_RULES: Record<string, GuardRule> = {
  C1Ocr: {
    isAllowed: ({ role, isWitnessMandated }) =>
      role === 'WITNESS' || isWitnessMandated,
    title: 'Akses Khusus Saksi TPS BSN',
    badge: 'Akreditasi BSN',
    message:
      'Fitur Pemindaian C1 Plano (AI OCR) memerlukan SK Mandat resmi dan kelulusan 4 syarat akreditasi BSN. Selesaikan kurikulum saksi di Amanat Academy untuk membuka akses.',
    actionLabel: 'Buka Amanat Academy',
    actionScreen: 'AmanatAcademy',
  },
  ReportForm: {
    isAllowed: ({ role, isWitnessMandated }) =>
      role === 'WITNESS' || isWitnessMandated,
    title: 'Akses Khusus Entri C1 TPS',
    badge: 'Mandat Saksi',
    message:
      'Formulir Pelaporan dan Tabulasi Suara C1 Plano hanya dapat diakses oleh Saksi TPS resmi yang telah terverifikasi KPU/BSN.',
    actionLabel: 'Buka Amanat Academy',
    actionScreen: 'AmanatAcademy',
  },
  AssignmentLetter: {
    isAllowed: ({ role, isWitnessMandated }) =>
      role === 'WITNESS' || isWitnessMandated,
    title: 'Surat Tugas Mandat Belum Terbit',
    badge: 'SK Mandat BSN',
    message:
      'Surat Mandat Digital (e-Mandat) hanya diterbitkan untuk saksi yang telah menyelesaikan 4 syarat verifikasi BSN DPD PAN.',
    actionLabel: 'Kembali ke Beranda',
  },
  TpsDetail: {
    isAllowed: ({ role, isWitnessMandated, isCoordinator }) =>
      role === 'WITNESS' || isWitnessMandated || isCoordinator,
    title: 'Detail TPS & Bilik Suara',
    badge: 'Penugasan TPS',
    message:
      'Informasi data DPT dan lokasi TPS binaan hanya terbuka bagi personil Saksi TPS atau Koordinator Lapangan yang bertugas.',
    actionLabel: 'Kembali ke Beranda',
  },
  Supervision: {
    isAllowed: ({ isCoordinator }) => isCoordinator,
    title: 'Akses Khusus Koordinator Lapangan',
    badge: 'Supervisi DPC',
    message:
      'Fitur Komando dan Supervisi TPS Wilayah ini khusus diperuntukkan bagi Koordinator TPS dan Koordinator Lapangan bersurat tugas resmi.',
    actionLabel: 'Kembali ke Beranda',
  },
  WitnessList: {
    isAllowed: ({ isCoordinator }) => isCoordinator,
    title: 'Akses Khusus Koordinator',
    badge: 'Data Saksi',
    message:
      'Daftar kontak dan verifikasi saksi binaan hanya dapat diakses oleh Koordinator Lapangan yang berwenang.',
    actionLabel: 'Kembali ke Beranda',
  },
  CoordinatorList: {
    isAllowed: ({ isCoordinator, role }) => isCoordinator || role === 'MEMBER',
    title: 'Akses Direktori Koordinator',
    badge: 'Struktur Lapangan',
    message:
      'Halaman ini hanya dapat diakses oleh pengurus struktur partai dan koordinator lapangan aktif.',
    actionLabel: 'Kembali ke Beranda',
  },
  VerifyLetter: {
    isAllowed: ({ isCoordinator }) => isCoordinator,
    title: 'Akses Verifikasi Mandat',
    badge: 'Validasi Barcode',
    message:
      'Pemindaian barcode verifikasi surat mandat di TPS hanya dapat dilakukan oleh Koordinator Lapangan.',
    actionLabel: 'Kembali ke Beranda',
  },
  SimpanKta: {
    isAllowed: ({ isOfficialMember }) => isOfficialMember,
    title: 'Khusus Anggota Resmi Ber-KTA',
    badge: 'e-KTA simPAN',
    message:
      'e-KTA Digital resmi hanya diterbitkan untuk Kader dan Anggota Resmi Partai Amanat Nasional. Simpatisan dapat mengajukan keanggotaan dengan verifikasi e-KTP.',
    actionLabel: 'Ajukan Jadi Anggota Resmi',
    actionScreen: 'RegisterMember',
  },
};

export function withRoleGuard(
  ScreenComponent: React.ComponentType<any>,
  screenName: string,
) {
  const rule = GUARD_RULES[screenName];
  if (!rule) {
    return ScreenComponent;
  }

  return function GuardedScreen(props: any) {
    const { role, currentUser } = useApp();
    const { colors, isDark } = useTheme();
    const navigation = useNavigation<any>();

    const officialMembership = currentUser.memberships.find((m: any) => m.type === 'member');
    const isOfficialMember = Boolean(
      officialMembership &&
        (officialMembership.status === 'verified' || officialMembership.status === 'active'),
    );

    const hasWitnessRole = currentUser.roles.some((r: any) => r.role === 'WITNESS');
    const isWitnessMandated =
      hasWitnessRole ||
      currentUser.dimensions?.programs?.programSaksi === 'MANDATED' ||
      currentUser.dimensions?.programs?.programSaksi === 'CERTIFIED';

    const isCoordinator = role === 'TPS_COORDINATOR' || role === 'FIELD_COORDINATOR';

    const allowed = rule.isAllowed({
      role: role as MobileRole,
      isOfficialMember,
      isWitnessMandated,
      isCoordinator,
    });

    if (allowed) {
      return <ScreenComponent {...props} />;
    }

    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Card style={[styles.guardCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2' }]}>
            <Feather name="shield" size={32} color="#DC2626" />
          </View>

          <View style={[styles.badgeWrap, { backgroundColor: isDark ? 'rgba(0, 102, 179, 0.2)' : '#E0F2FE' }]}>
            <AppText weight="bold" style={[styles.badgeText, { color: colors.primary }]}>
              {rule.badge}
            </AppText>
          </View>

          <AppText weight="bold" style={[styles.guardTitle, { color: colors.text }]}>
            {rule.title}
          </AppText>

          <AppText style={[styles.guardMessage, { color: colors.textMuted }]}>
            {rule.message}
          </AppText>

          <View style={styles.actionGroup}>
            {rule.actionScreen ? (
              <Pressable
                onPress={() => navigation.navigate(rule.actionScreen)}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  { backgroundColor: colors.primary },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Feather name="arrow-right-circle" size={16} color="#FFFFFF" />
                <AppText weight="bold" style={styles.primaryBtnText}>
                  {rule.actionLabel}
                </AppText>
              </Pressable>
            ) : null}

            <Pressable
              onPress={() => {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                } else {
                  navigation.navigate('Dashboard');
                }
              }}
              style={({ pressed }) => [
                styles.secondaryBtn,
                { borderColor: colors.border, backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC' },
                pressed && { opacity: 0.75 },
              ]}
            >
              <Feather name="arrow-left" size={15} color={colors.text} />
              <AppText weight="medium" style={[styles.secondaryBtnText, { color: colors.text }]}>
                Kembali
              </AppText>
            </Pressable>
          </View>
        </Card>
      </View>
    );
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guardCard: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    borderRadius: radius.lg,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeWrap: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  badgeText: {
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  guardTitle: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 24,
  },
  guardMessage: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: spacing.xs,
  },
  actionGroup: {
    width: '100%',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  secondaryBtnText: {
    fontSize: 13,
  },
});
