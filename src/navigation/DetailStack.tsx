import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { fonts } from '../theme';
import { BRAND_ASSETS } from '../data/images';
import { withRoleGuard } from '../components/RoleGuardWrapper';

import TpsDetailScreen from '../screens/TpsDetailScreen';
import SupervisionScreen from '../screens/SupervisionScreen';
import WitnessListScreen from '../screens/WitnessListScreen';
import WitnessDetailScreen from '../screens/WitnessDetailScreen';
import CoordinatorListScreen from '../screens/CoordinatorListScreen';
import CoordinatorDetailScreen from '../screens/CoordinatorDetailScreen';
import KartuPetugasScreen from '../screens/KartuPetugasScreen';
import PartyLeaderboardScreen from '../screens/PartyLeaderboardScreen';
import PartyRosterScreen from '../screens/PartyRosterScreen';
import LegislativeMemberDetailScreen from '../screens/LegislativeMemberDetailScreen';
import AssignmentLetterScreen from '../screens/AssignmentLetterScreen';
import VerifyLetterScreen from '../screens/VerifyLetterScreen';
import ReportFormScreen from '../screens/ReportFormScreen';
import C1OcrScreen from '../screens/C1OcrScreen';
import KtpOcrScreen from '../screens/KtpOcrScreen';
import DocumentationScreen from '../screens/DocumentationScreen';
import EmergencyListScreen from '../screens/EmergencyListScreen';
import EmergencyFormScreen from '../screens/EmergencyFormScreen';
import BroadcastScreen from '../screens/BroadcastScreen';
import PaymentScreen from '../screens/PaymentScreen';
import ProfileScreen from '../screens/ProfileScreen';
import InsightsScreen from '../screens/InsightsScreen';
import SecurityScreen from '../screens/SecurityScreen';
import CheckInScreen from '../screens/CheckInScreen';
import HelpCenterScreen from '../screens/HelpCenterScreen';
import QuickCountGameScreen from '../screens/QuickCountGameScreen';
import SimpanKtaScreen from '../screens/SimpanKtaScreen';
import SimpanStructureScreen from '../screens/SimpanStructureScreen';
import SimpanOfficesScreen from '../screens/SimpanOfficesScreen';
import SimpanBacalegScreen from '../screens/SimpanBacalegScreen';
import SimpanNewsScreen from '../screens/SimpanNewsScreen';
import SimpanOfficeDetailScreen from '../screens/SimpanOfficeDetailScreen';
import RegisterMemberScreen from '../screens/RegisterMemberScreen';
import RegisterVolunteerScreen from '../screens/RegisterVolunteerScreen';
import WitnessAcademyScreen from '../screens/WitnessAcademyScreen';
import WitnessLessonScreen from '../screens/WitnessLessonScreen';
import ActivitiesScreen from '../screens/ActivitiesScreen';
import TasksScreen from '../screens/TasksScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import TransparencyHubScreen from '../screens/TransparencyHubScreen';
import AmanatAcademyScreen from '../screens/AmanatAcademyScreen';
import PandawaProgramScreen from '../screens/PandawaProgramScreen';
import MapSebaranRelawanAnggotaScreen from '../screens/MapSebaranRelawanAnggotaScreen';
import StatusPeranSayaScreen from '../screens/StatusPeranSayaScreen';
import KelolaStatusScreen from '../screens/KelolaStatusScreen';

const DETAIL_SCREENS: Array<{ name: string; component: React.ComponentType<any>; title: string; headerShown?: boolean }> = [
  { name: 'StatusPeranSaya', component: StatusPeranSayaScreen, title: 'Status & Peran Saya' },
  { name: 'KelolaStatus', component: KelolaStatusScreen, title: 'Kelola Status' },
  { name: 'Activities', component: ActivitiesScreen, title: 'Agenda Kegiatan' },
  { name: 'Tasks', component: TasksScreen, title: 'Tugas Lapangan' },
  { name: 'Notifications', component: NotificationsScreen, title: 'Notifikasi' },
  { name: 'CheckIn', component: CheckInScreen, title: 'Presensi Kehadiran GPS' },
  { name: 'Profile', component: ProfileScreen, title: 'Kartu Petugas' },
  { name: 'Supervision', component: SupervisionScreen, title: 'Pengawasan TPS' },
  { name: 'TpsDetail', component: TpsDetailScreen, title: 'Detail TPS' },
  { name: 'WitnessList', component: WitnessListScreen, title: 'Daftar Saksi' },
  { name: 'WitnessDetail', component: WitnessDetailScreen, title: 'Detail Saksi' },
  { name: 'CoordinatorList', component: CoordinatorListScreen, title: 'Daftar Koordinator' },
  { name: 'CoordinatorDetail', component: CoordinatorDetailScreen, title: 'Detail Koordinator' },
  { name: 'KartuPetugas', component: KartuPetugasScreen, title: 'Kartu Petugas' },
  { name: 'PartyLeaderboard', component: PartyLeaderboardScreen, title: 'Partai & Legislatif' },
  { name: 'PartyRoster', component: PartyRosterScreen, title: 'Anggota Legislatif' },
  { name: 'LegislativeMemberDetail', component: LegislativeMemberDetailScreen, title: 'Detail Anggota DPR RI' },
  { name: 'AssignmentLetter', component: AssignmentLetterScreen, title: 'Surat Tugas Digital' },
  { name: 'VerifyLetter', component: VerifyLetterScreen, title: 'Verifikasi Surat' },
  { name: 'ReportForm', component: ReportFormScreen, title: 'Formulir Laporan' },
  { name: 'C1Ocr', component: C1OcrScreen, title: 'Pemindaian C1 Plano' },
  { name: 'KtpOcr', component: KtpOcrScreen, title: 'Pemindaian KTP Saksi' },
  { name: 'Documentation', component: DocumentationScreen, title: 'Dokumentasi Kegiatan TPS' },
  { name: 'EmergencyList', component: EmergencyListScreen, title: 'Laporan Darurat' },
  { name: 'EmergencyForm', component: EmergencyFormScreen, title: 'Lapor Kejadian' },
  { name: 'Broadcast', component: BroadcastScreen, title: 'Broadcast' },
  { name: 'Payment', component: PaymentScreen, title: 'Honorarium' },
  { name: 'Insights', component: InsightsScreen, title: 'Pemantauan TPS' },
  { name: 'Security', component: SecurityScreen, title: 'Keamanan' },
  { name: 'HelpCenter', component: HelpCenterScreen, title: 'Pusat Bantuan' },
  { name: 'QuickCountGame', component: QuickCountGameScreen, title: 'Hitung Cepat Suara' },
  { name: 'SimpanKta', component: SimpanKtaScreen, title: 'e-KTA Digital simPAN' },
  { name: 'SimpanStructure', component: SimpanStructureScreen, title: 'Struktur Pengurus simPAN' },
  { name: 'SimpanOffices', component: SimpanOfficesScreen, title: 'Kantor Sekretariat simPAN' },
  { name: 'SimpanOfficeDetail', component: SimpanOfficeDetailScreen, title: 'Detail Sekretariat' },
  { name: 'SimpanBacaleg', component: SimpanBacalegScreen, title: 'Pendaftaran Bacaleg simPAN' },
  { name: 'SimpanNews', component: SimpanNewsScreen, title: 'Warta & Instruksi simPAN' },
  { name: 'RegisterMember', component: RegisterMemberScreen, title: 'Registrasi Kader (AI Scan KTP)' },
  { name: 'RegisterVolunteer', component: RegisterVolunteerScreen, title: 'Registrasi Relawan PAN' },
  { name: 'WitnessAcademy', component: WitnessAcademyScreen, title: 'Akademi Saksi BSN PAN' },
  { name: 'WitnessLesson', component: WitnessLessonScreen, title: 'Materi Pelatihan Saksi' },
  { name: 'TransparencyHub', component: TransparencyHubScreen, title: 'Transparansi & Akuntabilitas' },
  { name: 'AmanatAcademy', component: AmanatAcademyScreen, title: 'Amanat Academy Hub' },
  { name: 'PandawaProgram', component: PandawaProgramScreen, title: 'Satgas Muda PANdawa' },
  { name: 'MapSebaranRelawanAnggota', component: MapSebaranRelawanAnggotaScreen, title: 'Peta Sebaran GIS', headerShown: false },
  { name: 'MapSebaran', component: MapSebaranRelawanAnggotaScreen, title: 'Peta Sebaran GIS', headerShown: false },
  { name: 'PetaSebaran', component: MapSebaranRelawanAnggotaScreen, title: 'Peta Sebaran GIS', headerShown: false },
];

const GUARDED_SCREENS = DETAIL_SCREENS.map((s) => ({
  ...s,
  component: withRoleGuard(s.component, s.name),
}));

/**
 * Komponen header kanan yang berdiri sendiri.
 * useNavigation() dipanggil di sini agar mendapat context Stack navigator
 * (bukan Tab parent), sehingga navigate('Notifications') bisa ditemukan.
 */
function HeaderRight({
  isDark,
  toggleTheme,
  unreadCount,
  primaryColor,
  dangerColor,
}: {
  isDark: boolean;
  toggleTheme: () => void;
  unreadCount: number;
  primaryColor: string;
  dangerColor: string;
}) {
  const nav = useNavigation<any>();
  return (
    <View style={headerStyles.row}>
      {/* Bell notifikasi dengan badge jumlah belum dibaca */}
      <Pressable
        hitSlop={10}
        onPress={() => nav.navigate('Notifications')}
        style={({ pressed }) => [headerStyles.iconBtn, pressed && { opacity: 0.7 }]}
      >
        <View style={headerStyles.bellWrap}>
          <Feather name="bell" size={20} color={primaryColor} strokeWidth={2} />
          {unreadCount > 0 && (
            <View style={[headerStyles.badge, { backgroundColor: dangerColor }]}>
              <Text style={headerStyles.badgeText}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          )}
        </View>
      </Pressable>

      {/* Toggle dark / light mode */}
      <Pressable
        hitSlop={8}
        onPress={toggleTheme}
        style={({ pressed }) => [headerStyles.iconBtn, pressed && { opacity: 0.7 }]}
      >
        <Feather name={isDark ? 'sun' : 'moon'} size={20} color={primaryColor} strokeWidth={2} />
      </Pressable>
    </View>
  );
}

export function buildDetailStack(homeName: string, HomeComponent: React.ComponentType<any>, homeTitle: string) {
  const Stack = createNativeStackNavigator<any>();
  return function Navigator() {
    const { colors, isDark, toggleTheme } = useTheme();
    const { notifications } = useApp();

    const unreadCount = notifications.filter((n) => !n.read).length;

    const screenOptions = {
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.text,
      headerTitleStyle: { fontFamily: fonts.bold, fontWeight: '700' as const, color: colors.text },
      headerShadowVisible: false,
      contentStyle: { backgroundColor: colors.background },
      headerRight: () => (
        <HeaderRight
          isDark={isDark}
          toggleTheme={toggleTheme}
          unreadCount={unreadCount}
          primaryColor={colors.primary}
          dangerColor={colors.danger ?? '#EF4444'}
        />
      ),
    };

    return (
      <Stack.Navigator screenOptions={screenOptions}>
        <Stack.Screen
          name={homeName}
          component={HomeComponent}
          options={{
            headerTitle: () => (
              <Image source={BRAND_ASSETS.official} style={{ width: 36, height: 36 }} resizeMode="contain" />
            ),
          }}
        />
        {GUARDED_SCREENS.filter((s) => s.name !== homeName).map((s) => (
          <Stack.Screen
            key={s.name}
            name={s.name}
            component={s.component}
            options={{
              title: s.title,
              ...(s.headerShown !== undefined ? { headerShown: s.headerShown } : {}),
            }}
          />
        ))}
      </Stack.Navigator>
    );
  };
}

const headerStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingRight: 4,
  },
  iconBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  bellWrap: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontFamily: fonts.bold,
    lineHeight: 11,
  },
});
