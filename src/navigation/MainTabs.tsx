import React, { useEffect, useState } from 'react';
import { Keyboard, StyleSheet, Text, View, Pressable } from 'react-native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { iconStrokeWidth, useTheme } from '../theme';
import { buildDetailStack } from './DetailStack';

import DashboardScreen from '../screens/DashboardScreen';
import WitnessListScreen from '../screens/WitnessListScreen';
import MoreMenuScreen from '../screens/MoreMenuScreen';
import AssignmentLetterScreen from '../screens/AssignmentLetterScreen';
import CheckInScreen from '../screens/CheckInScreen';
import ReportFormScreen from '../screens/ReportFormScreen';
import SupervisionScreen from '../screens/SupervisionScreen';
import SimpanKtaScreen from '../screens/SimpanKtaScreen';
import SimpanNewsScreen from '../screens/SimpanNewsScreen';
import SimpanOfficesScreen from '../screens/SimpanOfficesScreen';
import EmergencyFormScreen from '../screens/EmergencyFormScreen';
import { Role } from '../types';

const Tab = createBottomTabNavigator<any>();

const DashboardStack = buildDetailStack('Dashboard', DashboardScreen, 'Dashboard');
const SupervisionStack = buildDetailStack('Supervision', SupervisionScreen, 'Pengawasan TPS');
const WitnessesStack = buildDetailStack('WitnessList', WitnessListScreen, 'Saksi');
const MoreStack = buildDetailStack('MoreMenu', MoreMenuScreen, 'Lainnya');

const AssignmentLetterStack = buildDetailStack('AssignmentLetter', AssignmentLetterScreen, 'Surat Mandat');
const CheckInStack = buildDetailStack('CheckIn', CheckInScreen, 'Check-in');
const ReportFormStack = buildDetailStack('ReportForm', ReportFormScreen, 'Lapor C1');
const EmergencyFormStack = buildDetailStack('EmergencyForm', EmergencyFormScreen, 'Lapor Luar TPS');

const SimpanKtaStack = buildDetailStack('SimpanKta', SimpanKtaScreen, 'e-KTA Digital');
const SimpanNewsStack = buildDetailStack('SimpanNews', SimpanNewsScreen, 'Warta DPP');
const SimpanOfficesStack = buildDetailStack('SimpanOffices', SimpanOfficesScreen, 'Kantor Sekretariat');

// 1. Saksi TPS Lapangan (Fokus pada Checklist Hari-H, Surat Mandat Digital KPPS, & Lapor SOS)
const WITNESS_TABS = [
  { name: 'HomeTab', component: DashboardStack, label: 'Tugas', icon: 'home' as const },
  { name: 'MandatTab', component: AssignmentLetterStack, label: 'Mandat', icon: 'file-text' as const },
  { name: 'EmergencyTab', component: EmergencyFormStack, label: 'Bantuan & SOS', icon: 'alert-triangle' as const },
  { name: 'MoreTab', component: MoreStack, label: 'Lainnya', icon: 'more-horizontal' as const },
];

// 2. Koordinator Lapangan & Operator (Supervisi lapangan & pendamping saksi TPS)
const FIELD_COORDINATOR_TABS = [
  { name: 'HomeTab', component: DashboardStack, label: 'Kluster', icon: 'home' as const },
  { name: 'SupervisionTab', component: SupervisionStack, label: 'Pengawasan', icon: 'grid' as const },
  { name: 'CheckInTab', component: CheckInStack, label: 'Check-in', icon: 'map-pin' as const },
  { name: 'ReportFormTab', component: ReportFormStack, label: 'Input C1', icon: 'edit-3' as const },
  { name: 'MoreTab', component: MoreStack, label: 'Lainnya', icon: 'more-horizontal' as const },
];

// 3. Pengurus Struktural Partai: DPP, DPW, DPD, DPC, PAC (Non-Lapangan / Eksekutif)
// TIDAK ADA Check-in atau Lapor C1, fokus pada monitoring tabulasi suara, daftar saksi, & kantor sekretariat.
const EXECUTIVE_TABS = [
  { name: 'HomeTab', component: DashboardStack, label: 'Beranda', icon: 'home' as const },
  { name: 'SupervisionTab', component: SupervisionStack, label: 'Tabulasi', icon: 'grid' as const },
  { name: 'WitnessesTab', component: WitnessesStack, label: 'Saksi BSN', icon: 'users' as const },
  { name: 'OfficesTab', component: SimpanOfficesStack, label: 'Sekretariat', icon: 'map-pin' as const },
  { name: 'MoreTab', component: MoreStack, label: 'Lainnya', icon: 'more-horizontal' as const },
];

// 4. Calon Legislatif DPR-RI (Parlemen)
// TIDAK ADA Check-in atau Lapor C1, fokus pada suara caleg, kawal TPS dapil, & saksi pengawal suara.
const CALEG_TABS = [
  { name: 'HomeTab', component: DashboardStack, label: 'Suara Caleg', icon: 'bar-chart-2' as const },
  { name: 'SupervisionTab', component: SupervisionStack, label: 'Kawal TPS', icon: 'grid' as const },
  { name: 'WitnessesTab', component: WitnessesStack, label: 'Saksi Dapil', icon: 'users' as const },
  { name: 'MoreTab', component: MoreStack, label: 'Lainnya', icon: 'more-horizontal' as const },
];

// 5. Kader / Anggota simPAN & Calon Parlemen (Kader Mandiri)
// TIDAK ADA Check-in atau Lapor C1, fokus pada suara pribadi masuk, e-KTA digital, kantor/konter, & warta DPP.
const KADER_TABS = [
  { name: 'HomeTab', component: DashboardStack, label: 'Beranda', icon: 'home' as const },
  { name: 'KtaTab', component: SimpanKtaStack, label: 'e-KTA', icon: 'credit-card' as const },
  { name: 'OfficesTab', component: SimpanOfficesStack, label: 'Sekretariat', icon: 'map-pin' as const },
  { name: 'NewsTab', component: SimpanNewsStack, label: 'Warta DPP', icon: 'file-text' as const },
  { name: 'MoreTab', component: MoreStack, label: 'Lainnya', icon: 'more-horizontal' as const },
];

// 6. Relawan Lapangan & Pengawal Suara (Aksi luar bilik TPS, mobilisasi pemilih, pantau kecurangan)
const RELAWAN_TABS = [
  { name: 'HomeTab', component: DashboardStack, label: 'Tugas', icon: 'home' as const },
  { name: 'EmergencyTab', component: EmergencyFormStack, label: 'Lapor Luar', icon: 'alert-triangle' as const },
  { name: 'OfficesTab', component: SimpanOfficesStack, label: 'Posko', icon: 'map-pin' as const },
  { name: 'MoreTab', component: MoreStack, label: 'Lainnya', icon: 'more-horizontal' as const },
];

function getTabsForRole(role: Role) {
  if (role === 'TPS_WITNESS') {
    return WITNESS_TABS;
  }
  if (role === 'RELAWAN') {
    return RELAWAN_TABS;
  }
  if (role === 'TPS_COORDINATOR' || role === 'OPERATOR') {
    return FIELD_COORDINATOR_TABS;
  }
  if (role === 'KADER_ANGGOTA') {
    return KADER_TABS;
  }
  if (role === 'CALEG') {
    return CALEG_TABS;
  }
  return EXECUTIVE_TABS;
}

function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  if (keyboardVisible) return null;

  const bottomInset = Math.max(insets.bottom, 6);

  return (
    <View
      style={[
        styles.tabBarContainer,
        {
          paddingBottom: bottomInset,
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        const label =
          options.tabBarLabel !== undefined
            ? (options.tabBarLabel as string)
            : options.title !== undefined
            ? options.title
            : route.name;

        const activeColor = '#FFFFFF';
        const inactiveColor = colors.textMuted;
        const color = isFocused ? activeColor : inactiveColor;

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarButtonTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={({ pressed }) => [
              styles.tabItem,
              isFocused && [styles.activeRedCapsule, { backgroundColor: colors.primary }],
              pressed && { opacity: 0.8 },
            ]}
          >
            {options.tabBarIcon ? options.tabBarIcon({ focused: isFocused, color, size: 18 }) : null}
            <Text
              style={[
                styles.tabLabel,
                {
                  color,
                  fontWeight: isFocused ? '700' : '500',
                },
              ]}
              numberOfLines={1}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function MainTabs() {
  const { role } = useApp();
  const { colors } = useTheme();
  const tabs = getTabsForRole(role);

  return (
    <Tab.Navigator
      key={role}
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      {tabs.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{
            tabBarLabel: tab.label,
            tabBarIcon: ({ color }: { color: string }) => (
              <Feather name={tab.icon} size={18} color={color} strokeWidth={iconStrokeWidth} />
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    paddingTop: 6,
    paddingHorizontal: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 999, // Smooth fully-rounded capsule ends
    gap: 2,
  },
  activeRedCapsule: {
    borderRadius: 999, // Smooth 100% round capsule ends on left & right
    shadowColor: '#0066B3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  tabLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
});
