import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  LayoutAnimation,
  Platform,
  Pressable,
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

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
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
  onSelectRole: (role: Role) => void;
  defaultExpanded?: boolean;
  style?: StyleProp<ViewStyle>;
}

const TRACK_PADDING = 4;

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
  const [trackWidth, setTrackWidth] = useState(0);

  const chevronAnim = useRef(new Animated.Value(defaultExpanded ? 1 : 0)).current;
  const indicatorAnim = useRef(new Animated.Value(0)).current;

  const activeCategory = categories[activeIndex] ?? categories[0];
  const segmentWidth = trackWidth > 0 ? (trackWidth - TRACK_PADDING * 2) / categories.length : 0;

  useEffect(() => {
    Animated.timing(indicatorAnim, {
      toValue: activeIndex,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [activeIndex, indicatorAnim]);

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Animated.timing(chevronAnim, {
      toValue: expanded ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setExpanded((v) => !v);
  };

  const selectCategory = (index: number) => {
    if (index === activeIndex) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveIndex(index);
  };

  const chevronRotate = chevronAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const indicatorTranslateX = indicatorAnim.interpolate({
    inputRange: categories.map((_, i) => i),
    outputRange: categories.map((_, i) => i * segmentWidth),
  });

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
          <View
            onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
            style={[styles.track, { backgroundColor: colors.background, borderColor: colors.border, borderRadius: radius.pill }]}
          >
            {trackWidth > 0 && (
              <Animated.View
                style={[
                  styles.indicator,
                  {
                    width: segmentWidth,
                    backgroundColor: colors.primary,
                    borderRadius: radius.pill,
                    transform: [{ translateX: indicatorTranslateX }],
                    ...shadow.sm,
                  },
                ]}
              />
            )}

            {categories.map((cat, index) => {
              const isActive = index === activeIndex;
              return (
                <Pressable
                  key={cat.key}
                  onPress={() => selectCategory(index)}
                  style={styles.segment}
                  hitSlop={4}
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
                    <View style={[styles.countBadge, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
                      <Text style={[styles.countBadgeText, { color: colors.primary }]}>{cat.accounts.length}</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>

          {/* Active category header */}
          <View style={styles.categoryHeaderRow}>
            <Text style={[styles.categoryHeaderTitle, { color: colors.text, fontSize: fontSize.xs }]}>
              {activeCategory.fullLabel}
            </Text>
            <Text style={[styles.categoryHeaderCount, { color: colors.textMuted }]}>
              {activeCategory.accounts.length} peran
            </Text>
          </View>

          {/* Role list */}
          <View style={{ gap: spacing.xs }}>
            {activeCategory.accounts.map((account) => (
              <Pressable
                key={account.role}
                hitSlop={4}
                onPress={() => onSelectRole(account.role)}
                style={({ pressed }) => [
                  styles.accountRow,
                  { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md },
                  pressed && { opacity: 0.75, transform: [{ scale: 0.985 }] },
                ]}
              >
                <View style={[styles.accountAvatar, { backgroundColor: colors.primaryLight }]}>
                  <Feather
                    name={ROLE_ICON[account.role]}
                    size={16}
                    color={colors.primary}
                    strokeWidth={iconStrokeWidth}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={[styles.accountRole, { color: colors.text }]} numberOfLines={1}>
                    {ROLE_LABEL[account.role]}
                  </Text>
                  <Text style={[styles.accountScope, { color: colors.textMuted }]} numberOfLines={1}>
                    {ROLE_SCOPE_DESCRIPTION[account.role]}
                  </Text>
                </View>

                <View style={[styles.useTag, { backgroundColor: colors.primaryLight }]}>
                  <Text style={[styles.useTagText, { color: colors.primary }]}>Masuk</Text>
                  <Feather name="arrow-right" size={11} color={colors.primary} strokeWidth={iconStrokeWidth} />
                </View>
              </Pressable>
            ))}
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
    gap: 10,
    borderWidth: 1,
    padding: 10,
  },
  triggerIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  triggerTitle: {
    fontFamily: fonts.bold,
    fontWeight: '800',
  },
  triggerSubtitle: {
    fontFamily: fonts.medium,
    fontSize: 10.5,
    marginTop: 1,
    fontWeight: '500',
  },
  panel: {
    borderTopWidth: 0,
  },
  track: {
    flexDirection: 'row',
    borderWidth: 1,
    padding: TRACK_PADDING,
  },
  indicator: {
    position: 'absolute',
    top: TRACK_PADDING,
    left: TRACK_PADDING,
    bottom: TRACK_PADDING,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
  },
  segmentLabel: {
    fontFamily: fonts.bold,
    fontWeight: '800',
  },
  countBadge: {
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeText: {
    fontFamily: fonts.extraBold,
    fontSize: 9,
    fontWeight: '800',
  },
  categoryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryHeaderTitle: {
    fontFamily: fonts.bold,
    fontWeight: '800',
  },
  categoryHeaderCount: {
    fontFamily: fonts.semiBold,
    fontSize: 10.5,
    fontWeight: '600',
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    padding: 10,
  },
  accountAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountRole: {
    fontFamily: fonts.bold,
    fontSize: 12.5,
    fontWeight: '800',
  },
  accountScope: {
    fontFamily: fonts.medium,
    fontSize: 10.5,
    fontWeight: '600',
    marginTop: 1,
  },
  useTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  useTagText: {
    fontFamily: fonts.bold,
    fontSize: 10.5,
    fontWeight: '800',
  },
});
