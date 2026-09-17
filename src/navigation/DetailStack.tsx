import React from 'react';
import { Image, Pressable, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { fonts, useTheme } from '../theme';
import { BRAND_ASSETS } from '../data/images';

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
import WitnessAcademyScreen from '../screens/WitnessAcademyScreen';
import WitnessLessonScreen from '../screens/WitnessLessonScreen';

const Stack = createNativeStackNavigator<any>();

const DETAIL_SCREENS: Array<{ name: string; component: React.ComponentType<any>; title: string }> = [
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
  { name: 'SimpanOfficeDetail', component: SimpanOfficeDetailScreen, title: 'Detail Sekretariat simPAN' },
  { name: 'SimpanBacaleg', component: SimpanBacalegScreen, title: 'Pendaftaran Bacaleg simPAN' },
  { name: 'SimpanNews', component: SimpanNewsScreen, title: 'Warta & Instruksi simPAN' },
  { name: 'RegisterMember', component: RegisterMemberScreen, title: 'Registrasi Kader (AI Scan KTP)' },
  { name: 'WitnessAcademy', component: WitnessAcademyScreen, title: 'Akademi Saksi BSN PAN' },
  { name: 'WitnessLesson', component: WitnessLessonScreen, title: 'Materi Pelatihan Saksi' },
];

export function buildDetailStack(homeName: string, HomeComponent: React.ComponentType<any>, homeTitle: string) {
  return function Navigator() {
    const { colors, isDark, toggleTheme } = useTheme();

    const screenOptions = {
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.text,
      headerTitleStyle: { fontFamily: fonts.bold, fontWeight: '700' as const, color: colors.text },
      headerShadowVisible: false,
      contentStyle: { backgroundColor: colors.background },
      headerRight: () => (
        <Pressable
          hitSlop={8}
          onPress={toggleTheme}
          style={({ pressed }) => [
            { paddingHorizontal: 8, paddingVertical: 4 },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Feather name={isDark ? 'sun' : 'moon'} size={20} color={colors.primary} strokeWidth={2} />
        </Pressable>
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
        {DETAIL_SCREENS.filter((s) => s.name !== homeName).map((s) => (
          <Stack.Screen key={s.name} name={s.name} component={s.component} options={{ title: s.title }} />
        ))}
      </Stack.Navigator>
    );
  };
}

