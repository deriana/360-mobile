import React, { useEffect, useState } from 'react';
import { Keyboard, StyleSheet, Text, View, Pressable } from 'react-native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { fonts, iconStrokeWidth } from '../theme';
import { buildDetailStack } from './DetailStack';

import DashboardScreen from '../screens/DashboardScreen';
import ActivitiesScreen from '../screens/ActivitiesScreen';
import CheckInScreen from '../screens/CheckInScreen';
import SimpanNewsScreen from '../screens/SimpanNewsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator<any>();

const DashboardStack = buildDetailStack('Dashboard', DashboardScreen, 'Beranda');
const ActivitiesStack = buildDetailStack('Activities', ActivitiesScreen, 'Agenda & Kegiatan');
const CheckInStack = buildDetailStack('CheckIn', CheckInScreen, 'Presensi Kehadiran GPS');
const NewsStack = buildDetailStack('SimpanNews', SimpanNewsScreen, 'Warta & Kabar PAN');
const ProfileStack = buildDetailStack('Profile', ProfileScreen, 'Profil Saya');

const STANDARD_BOTTOM_TABS = [
  { name: 'HomeTab', component: DashboardStack, label: 'Beranda', icon: 'home' as const },
  { name: 'CheckInTab', component: CheckInStack, label: 'Presensi', icon: 'map-pin' as const },
  { name: 'ProfileTab', component: ProfileStack, label: 'Profil', icon: 'user' as const },
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

  return (
    <View
      style={[
        styles.tabBarContainer,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: Math.max(insets.bottom, 12),
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
              pressed && { opacity: 0.8 },
            ]}
          >
            <View
              style={[
                styles.iconWrap,
                isFocused && [styles.activeIconCapsule, { backgroundColor: colors.primary }],
              ]}
            >
              {options.tabBarIcon ? options.tabBarIcon({ focused: isFocused, color: isFocused ? '#FFFFFF' : colors.textMuted, size: 18 }) : null}
            </View>
            <Text
              style={[
                styles.tabLabel,
                {
                  color: isFocused ? colors.primary : colors.textMuted,
                  fontFamily: isFocused ? fonts.bold : fonts.medium,
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

  return (
    <Tab.Navigator
      key={role}
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      {STANDARD_BOTTOM_TABS.map((tab) => (
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
    paddingVertical: 4,
    gap: 3,
  },
  iconWrap: {
    width: 54,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconCapsule: {
    borderRadius: 15,
  },
  tabLabel: {
    fontSize: 10.5,
    textAlign: 'center',
  },
});
