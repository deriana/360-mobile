import React from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterVolunteerScreen from '../screens/RegisterVolunteerScreen';
import MainTabs from './MainTabs';

const AuthStack = createNativeStackNavigator<any>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="RegisterVolunteer" component={RegisterVolunteerScreen} />
    </AuthStack.Navigator>
  );
}

export default function RootNavigator() {
  const { loggedIn } = useApp();
  const { isDark, colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} animated />
      {loggedIn ? <MainTabs /> : <AuthNavigator />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

