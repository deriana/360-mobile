import React, { useEffect, useState } from 'react';
import { Keyboard, StyleSheet, Text, View, Pressable } from 'react-native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { iconStrokeWidth, useTheme } from '../theme';
import { buildDetailStack } from './DetailStack';

import DashboardScreen from '../screens/DashboardScreen';
import CommandCenterScreen from '../screens/CommandCenterScreen';
import WitnessListScreen from '../screens/WitnessListScreen';
import MoreMenuScreen from '../screens/MoreMenuScreen';
import WitnessHomeScreen from '../screens/WitnessHomeScreen';
import CheckInScreen from '../screens/CheckInScreen';
import ReportFormScreen from '../screens/ReportFormScreen';

import SupervisionScreen from '../screens/SupervisionScreen';

const Tab = createBottomTabNavigator<any>();

const DashboardStack = buildDetailStack('Dashboard', DashboardScreen, 'Dashboard');
const SupervisionStack = buildDetailStack('Supervision', SupervisionScreen, 'Pengawasan TPS');
const CommandCenterStack = buildDetailStack('CommandCenter', CommandCenterScreen, 'Command Center');
const WitnessesStack = buildDetailStack('WitnessList', WitnessListScreen, 'Saksi');
const MoreStack = buildDetailStack('MoreMenu', MoreMenuScreen, 'Lainnya');

const WitnessHomeStack = buildDetailStack('WitnessHome', WitnessHomeScreen, 'Tugas Saya');
const CheckInStack = buildDetailStack('CheckIn', CheckInScreen, 'Check-in');
const ReportFormStack = buildDetailStack('ReportForm', ReportFormScreen, 'Lapor Hasil');

const SUPERVISOR_TABS = [
  { name: 'HomeTab', component: DashboardStack, label: 'Tugas', icon: 'home' as const },
  { name: 'SupervisionTab', component: SupervisionStack, label: 'Pengawasan', icon: 'grid' as const },
  { name: 'CheckInTab', component: CheckInStack, label: 'Check-in', icon: 'map-pin' as const },
  { name: 'ReportFormTab', component: ReportFormStack, label: 'Lapor C1', icon: 'edit-3' as const },
  { name: 'MoreTab', component: MoreStack, label: 'Lainnya', icon: 'more-horizontal' as const },
];

const WITNESS_TABS = [
  { name: 'HomeTab', component: DashboardStack, label: 'Tugas', icon: 'home' as const },
  { name: 'CheckInTab', component: CheckInStack, label: 'Check-in', icon: 'map-pin' as const },
  { name: 'ReportFormTab', component: ReportFormStack, label: 'Lapor C1', icon: 'edit-3' as const },
  { name: 'MoreTab', component: MoreStack, label: 'Lainnya', icon: 'more-horizontal' as const },
];

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

        const activeColor = colors.primary;
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
              pressed && { opacity: 0.7 },
            ]}
          >
            {/* Top Indicator Line */}
            {isFocused && (
              <View style={[styles.activeIndicatorBar, { backgroundColor: activeColor }]} />
            )}

            {/* Icon Wrapper Pill */}
            <View style={[styles.iconWrapper, isFocused && { backgroundColor: colors.primaryLight }]}>
              {options.tabBarIcon ? options.tabBarIcon({ focused: isFocused, color, size: 20 }) : null}
            </View>

            <Text
              style={[
                styles.tabLabel,
                {
                  color,
                  fontWeight: isFocused ? '800' : '500',
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
  const isWitness = role === 'TPS_WITNESS';
  const tabs = isWitness ? WITNESS_TABS : SUPERVISOR_TABS;

  return (
    <Tab.Navigator
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
              <Feather name={tab.icon} size={20} color={color} strokeWidth={iconStrokeWidth} />
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
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 4,
    paddingHorizontal: 4,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    position: 'relative',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    gap: 2,
  },
  activeIndicatorBar: {
    position: 'absolute',
    top: -4,
    width: 26,
    height: 4,
    borderRadius: 999, // Smooth fully-rounded capsule ends
  },
  iconWrapper: {
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
});
