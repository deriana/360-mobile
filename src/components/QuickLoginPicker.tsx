import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  UIManager,
  View,
  ViewStyle,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { fonts } from '../theme';
import { Account } from '../data/accounts';
import { Role } from '../types';
import { ROLE_ICON, ROLE_LABEL, ROLE_SCOPE_DESCRIPTION } from '../utils/scope';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental &&
  !(globalThis as any).nativeFabricUIManager
) {
  try {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  } catch {}
}

// ==========================================
// QUICK LOGIN PICKER
// Segmented one-tap role switcher used on the login screen.
// See QUICK_LOGIN_PICKER.md at the repo root for the design contract.
// ==========================================
export interface QuickLoginCategory {
  key: string;
  /** Short label shown inside the segmented control, e.g. "Kader". */
  label: string;
  /** Full label shown above the role list, e.g. "Caleg & Kader". */
  fullLabel: string;
  icon: keyof typeof Feather.glyphMap;
  accounts: Account[];
}

export interface QuickLoginPickerProps {
  title?: string;
  subtitle?: string;
  categories: QuickLoginCategory[];
  onSelectRole: (role: Role, email?: string) => void;
  defaultExpanded?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function QuickLoginPicker({
  title = 'Login Cepat',
  subtitle = 'Ketuk peran untuk langsung masuk',
  categories,
  onSelectRole,
  defaultExpanded = false,
  style,
}: QuickLoginPickerProps) {
  const { colors, radius, spacing, fontSize, iconStrokeWidth, shadow } = useTheme();

  const [expanded, setExpanded] = useState(defaultExpanded);
  const [activeIndex, setActiveIndex] = useState(0);

  const chevronAnim = useRef(new Animated.Value(defaultExpanded ? 1 : 0)).current;

  const activeCategory = categories[activeIndex] ?? categories[0];

  const toggleExpanded = () => {
    if (Platform.OS !== 'web') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    Animated.timing(chevronAnim, {
      toValue: expanded ? 0 : 1,
      duration: 200,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
    setExpanded((v) => !v);
  };

  const selectCategory = (index: number) => {
    if (index === activeIndex) return;
    if (Platform.OS !== 'web') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    setActiveIndex(index);
  };

  const chevronRotate = chevronAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  if (categories.length === 0) return null;

  return (
    <View style={style}>
      {/* Trigger row */}
      <Pressable
        onPress={toggleExpanded}
        style={({ pressed }) => [
          styles.trigger,
          { backgroundColor: colors.background, borderColor: colors.border, borderRadius: radius.md },
          pressed && { opacity: 0.85 },
        ]}
      >
        <View style={[styles.triggerIconWrap, { backgroundColor: colors.primaryLight }]}>
          <Feather name="users" size={16} color={colors.primary} strokeWidth={iconStrokeWidth} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.triggerTitle, { color: colors.text, fontSize: fontSize.xs }]}>{title}</Text>
          <Text style={[styles.triggerSubtitle, { color: colors.textMuted }]}>{subtitle}</Text>
        </View>
        <Animated.View style={{ transform: [{ rotate: chevronRotate }] }}>
          <Feather name="chevron-down" size={18} color={colors.textMuted} strokeWidth={iconStrokeWidth} />
        </Animated.View>
      </Pressable>

      {expanded && (
        <View style={[styles.panel, { paddingTop: spacing.md, gap: spacing.sm }]}>
            {/* Segmented category switcher */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScrollContent}
              style={styles.categoryScroll}
            >
              {categories.map((cat, index) => {
                const isActive = index === activeIndex;
                return (
                  <Pressable
                    key={cat.key}
                    onPress={() => selectCategory(index)}
                    style={({ pressed }) => [
                      styles.categoryChip,
                      {
                        backgroundColor: isActive ? colors.primary : colors.surface,
                        borderColor: isActive ? colors.primary : colors.border,
                        borderRadius: radius.pill,
                      },
                      isActive && shadow.sm,
                      pressed && { opacity: 0.8 },
                    ]}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Feather
                      name={cat.icon}
                      size={13}
                      color={isActive ? colors.textInverse : colors.textMuted}
                      strokeWidth={iconStrokeWidth}
                    />
                    <Text
                      style={[
                        styles.segmentLabel,
                        { color: isActive ? colors.textInverse : colors.text, fontSize: fontSize.xs },
                      ]}
                    >
                      {cat.label}
                    </Text>

                    {cat.accounts.length > 0 && (
                      <View
                        style={[
                          styles.countBadge,
                          {
                            backgroundColor: isActive ? 'rgba(255, 255, 255, 0.25)' : colors.primaryLight,
                            borderColor: isActive ? 'rgba(255, 255, 255, 0.4)' : colors.primary,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.countBadgeText,
                            { color: isActive ? colors.textInverse : colors.primary },
                          ]}
                        >
                          {cat.accounts.length}
                        </Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Active category header */}
            <View style={styles.categoryHeaderRow}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={[styles.categoryHeaderTitle, { color: colors.text, fontSize: fontSize.xs }]} numberOfLines={1}>
                  {activeCategory.fullLabel}
                </Text>
              </View>
              <View style={[styles.categoryHeaderCountBadge, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.categoryHeaderCount, { color: colors.primary }]}>
                  {activeCategory.accounts.length} Akun Demo
                </Text>
              </View>
            </View>

            {/* Role list */}
            <View style={{ gap: spacing.sm }}>
              {activeCategory.accounts.map((account) => {
                const roleLabel = ROLE_LABEL[account.role] ?? account.role;
                const roleScope = ROLE_SCOPE_DESCRIPTION[account.role] ?? '';
                const roleIcon = ROLE_ICON[account.role] ?? 'user';

                return (
                  <Pressable
                    key={account.email || `${account.role}-${account.name}`}
                    hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                    onPress={() => onSelectRole(account.role, account.email)}
                    style={({ pressed }) => [
                      styles.accountCard,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        borderRadius: radius.md,
                      },
                      pressed && { opacity: 0.8, transform: [{ scale: 0.99 }] },
                    ]}
                  >
                    <View style={styles.accountCardHeader}>
                      <View style={[styles.accountAvatar, { backgroundColor: colors.primaryLight }]}>
                        <Feather
                          name={roleIcon}
                          size={16}
                          color={colors.primary}
                          strokeWidth={iconStrokeWidth}
                        />
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text style={[styles.accountName, { color: colors.text }]} numberOfLines={1}>
                          {account.name}
                        </Text>
                        <Text style={[styles.accountRoleBadge, { color: colors.primary }]} numberOfLines={1}>
                          {roleLabel}
                        </Text>
                      </View>

                      <View style={[styles.useTag, { backgroundColor: colors.primaryLight }]}>
                        <Text style={[styles.useTagText, { color: colors.primary }]}>Masuk</Text>
                        <Feather name="arrow-right" size={11} color={colors.primary} strokeWidth={iconStrokeWidth} />
                      </View>
                    </View>

                    {roleScope ? (
                      <View style={[styles.scopeContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                        <Feather name="map-pin" size={11} color={colors.textMuted} style={{ marginTop: 1 }} />
                        <Text style={[styles.accountScope, { color: colors.textMuted }]} numberOfLines={2}>
                          {roleScope}
                        </Text>
                      </View>
                    ) : null}

                    <View style={styles.accountFooter}>
                      <Text style={[styles.emailHint, { color: colors.textMuted }]} numberOfLines={1}>
                        <Text style={{ fontWeight: '600' }}>Email:</Text> {account.email}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
      </View>
    );
  }

  const styles = StyleSheet.create({
    trigger: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      borderWidth: 1,
      padding: 12,
    },
    triggerIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    triggerTitle: {
      fontFamily: fonts.bold,
      fontWeight: '800',
    },
    triggerSubtitle: {
      fontFamily: fonts.medium,
      fontSize: 11,
      marginTop: 2,
      fontWeight: '500',
    },
    panel: {
      borderTopWidth: 0,
    },
    categoryScroll: {
      marginHorizontal: -2,
    },
    categoryScrollContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 2,
      paddingHorizontal: 2,
    },
    categoryChip: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 7,
      paddingHorizontal: 12,
      borderWidth: 1,
    },
    segmentLabel: {
      fontFamily: fonts.bold,
      fontWeight: '800',
    },
    countBadge: {
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: 1,
      paddingHorizontal: 4,
      alignItems: 'center',
      justifyContent: 'center',
    },
    countBadgeText: {
      fontFamily: fonts.extraBold,
      fontSize: 9.5,
      fontWeight: '800',
    },
    categoryHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 2,
    },
    categoryHeaderTitle: {
      fontFamily: fonts.bold,
      fontWeight: '800',
    },
    categoryHeaderCountBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    categoryHeaderCount: {
      fontFamily: fonts.bold,
      fontSize: 10.5,
      fontWeight: '700',
    },
    accountCard: {
      borderWidth: 1,
      padding: 12,
      gap: 8,
    },
    accountCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    accountAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    accountName: {
      fontFamily: fonts.bold,
      fontSize: 13,
      fontWeight: '800',
    },
    accountRoleBadge: {
      fontFamily: fonts.semiBold,
      fontSize: 11,
      fontWeight: '700',
      marginTop: 2,
    },
    scopeContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 6,
      paddingHorizontal: 8,
      paddingVertical: 6,
      borderRadius: 6,
      borderWidth: 1,
    },
    accountScope: {
      flex: 1,
      fontFamily: fonts.medium,
      fontSize: 10.5,
      lineHeight: 14,
    },
    accountFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: 'rgba(0,0,0,0.06)',
      paddingTop: 6,
    },
    emailHint: {
      fontFamily: fonts.regular,
      fontSize: 10.5,
    },
    useTag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
    },
    useTagText: {
      fontFamily: fonts.bold,
      fontSize: 11,
      fontWeight: '800',
    },
  });
