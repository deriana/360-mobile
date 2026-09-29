import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Card, AppText } from './ui';
import { fonts, spacing, radius } from '../theme';
import { MobileRole } from '../types';
import { useWitnessApplication } from '../features/witness';
import { useNominations } from '../features/recruitment';
import { canSeeCommandCenterModes, useAccountSnapshot } from '../features/account';

interface GuardRule {
  isAllowed: (params: {
    role: MobileRole;
    isOfficialMember: boolean;
    isWitnessMandated: boolean;
    isCoordinator: boolean;
    isPengurusOrPejabat: boolean;
    canRecruit: boolean;
  }) => boolean;
  title: string;
  badge: string;
  message: string;
  actionLabel?: string;
  actionScreen?: string;
}

const GUARD_RULES: Record<string, GuardRule> = {
  // Fitur saksi terbuka hanya saat status penugasan ASSIGNED (`src/features/witness`).
  C1Ocr: {
    isAllowed: ({ isWitnessMandated }) => isWitnessMandated,
    title: 'Khusus Saksi TPS yang Bertugas',
    badge: 'Foto C1 Plano',
    message: 'Fitur ini terbuka setelah Anda terverifikasi dan ditugaskan sebagai saksi TPS. Cek langkah Anda berikutnya di menu Saksi TPS.',
    actionLabel: 'Lihat Status Saksi',
    actionScreen: 'Saksi',
  },
  ReportForm: {
    isAllowed: ({ isWitnessMandated }) => isWitnessMandated,
    title: 'Khusus Saksi TPS yang Bertugas',
    badge: 'Laporan Hasil TPS',
    message: 'Fitur ini terbuka setelah Anda terverifikasi dan ditugaskan sebagai saksi TPS. Cek langkah Anda berikutnya di menu Saksi TPS.',
    actionLabel: 'Lihat Status Saksi',
    actionScreen: 'Saksi',
  },
  AssignmentLetter: {
    isAllowed: ({ isWitnessMandated }) => isWitnessMandated,
    title: 'Surat Mandat Belum Terbit',
    badge: 'Surat Mandat',
    message:
      'Surat mandat terbit setelah Anda lulus pelatihan dan ditempatkan di TPS oleh tim pusat.',
    actionLabel: 'Lihat Status Saksi',
    actionScreen: 'Saksi',
  },
  TpsDetail: {
    isAllowed: ({ isWitnessMandated, isCoordinator }) => isWitnessMandated || isCoordinator,
    title: 'Khusus Saksi TPS yang Bertugas',
    badge: 'Detail TPS',
    message: 'Fitur ini terbuka setelah Anda terverifikasi dan ditugaskan sebagai saksi TPS. Cek langkah Anda berikutnya di menu Saksi TPS.',
    actionLabel: 'Lihat Status Saksi',
    actionScreen: 'Saksi',
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
  CommandCenter: {
    // Dipersempit (2026-09-28): sebelumnya semua role === 'MEMBER' lolos,
    // padahal catatan produk bilang fitur ini eksklusif "pengurus partai,
    // caleg, atau pejabat daerah" — bukan seluruh anggota resmi biasa.
    isAllowed: ({ isCoordinator, role, isPengurusOrPejabat }) =>
      isCoordinator || isPengurusOrPejabat || role === 'CALEG_OPS',
    title: 'Akses Khusus Pengurus & Komando',
    badge: 'Pusat Kendali 360',
    message:
      'Layar Peta Sebaran & Command Center dirancang khusus untuk Pengurus Partai (DPP/DPW/DPD/DPC), Caleg, Pejabat Daerah, dan Komandan Lapangan untuk pemantauan taktis hari-H pemilu.',
    actionLabel: 'Kembali ke Beranda',
  },
  NominateVolunteer: {
    // Aturan dari `src/features/recruitment` (canRecruit): relawan aktif & terverifikasi, maks. 10/hari.
    isAllowed: ({ canRecruit }) => canRecruit,
    title: 'Ajak Relawan Belum Tersedia',
    badge: 'Ajak Relawan',
    message: 'Fitur Ajak Relawan khusus untuk relawan aktif yang sudah terverifikasi.',
    actionLabel: 'Kembali ke Beranda',
  },
};

// Peta Sebaran & Command Center satu layar (2026-09-28). Revisi 2026-09-29: route peta
// (MapSebaranRelawanAnggota / MapSebaran / PetaSebaran) terbuka untuk semua role — di dalam
// layar, non-pengurus hanya melihat mode "Peta Relawan". Route `CommandCenter` tetap dijaga.

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

    // Satu sumber aturan: saksi terbuka hanya bila penugasan aktif (bukan dari role/preset lama).
    const { access: witnessAccess } = useWitnessApplication();
    const isWitnessMandated = witnessAccess.isUnlocked;
    const { recruitAccess } = useNominations();

    const isCoordinator = role === 'TPS_COORDINATOR' || role === 'FIELD_COORDINATOR';

    // "Anggota Resmi" eksklusif per catatan produk = pengurus partai, caleg,
    // atau pejabat daerah — bukan sekadar kader ber-KTA biasa. Aturannya kini
    // terpusat di `src/features/account` (dipakai juga Profil & layar peta).
    const account = useAccountSnapshot();
    const isPengurusOrPejabat = canSeeCommandCenterModes(account);

    const allowed = rule.isAllowed({
      role: role as MobileRole,
      isOfficialMember,
      isWitnessMandated,
      isCoordinator,
      isPengurusOrPejabat,
      canRecruit: recruitAccess.allowed,
    });
    const message =
      screenName === 'NominateVolunteer' && recruitAccess.reason ? recruitAccess.reason : rule.message;

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
            {message}
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
