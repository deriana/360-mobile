// SAKSI 360 Official Brand Color Tokens & Dynamic Theme Specification

export const lightColors = {
  primary: '#E60012', // Vibrant Red (SAKSI 360 Primary Accent)
  primaryDark: '#99000B', // Dark Red Shading
  primaryLight: '#FEF2F2', // Soft Red Light Tint
  background: '#F8FAFC', // Slate/Light Gray Background
  surface: '#FFFFFF', // Pure White Surface
  border: '#E2E8F0', // Light Gray Border
  borderStrong: '#CBD5E1', // Slate-300
  text: '#0A192F', // Dark Navy Text
  textMuted: '#64748B', // Slate Muted Text
  textInverse: '#FFFFFF', // Pure White Text
  navy: '#0A192F', // Dark Navy Brand
  darkRed: '#99000B',
  vibrantRed: '#E60012',
  success: '#10B981', // Emerald 500
  successBg: '#ECFDF5', // Emerald 50
  warning: '#F59E0B', // Amber 500
  warningBg: '#FFFBEB', // Amber 50
  danger: '#E60012', // Red 500
  dangerBg: '#FEF2F2', // Red 50
  problem: '#475569', // Slate 600
  problemBg: '#F1F5F9', // Slate 100
  info: '#3B82F6', // Blue 500
  infoBg: '#EFF6FF', // Blue 50
} as const;

export const darkColors = {
  primary: '#E60012', // Vibrant Red Accent
  primaryDark: '#99000B', // Dark Red Shading
  primaryLight: 'rgba(230, 0, 18, 0.18)', // Transparent Red Tint
  background: '#0A192F', // Dark Navy (SAKSI 360 Main Background)
  surface: '#112240', // Deep Navy Surface
  border: '#233554', // Navy Border
  borderStrong: '#3A506B', // Navy Strong Border
  text: '#FFFFFF', // Pure White Text
  textMuted: '#8892B0', // Soft Blue Slate Muted Text
  textInverse: '#0A192F',
  navy: '#0A192F',
  darkRed: '#99000B',
  vibrantRed: '#E60012',
  success: '#10B981', // Emerald 500
  successBg: 'rgba(16, 185, 129, 0.18)',
  warning: '#F59E0B', // Amber 500
  warningBg: 'rgba(245, 158, 11, 0.18)',
  danger: '#E60012', // Vibrant Red
  dangerBg: 'rgba(230, 0, 18, 0.18)',
  problem: '#8892B0', // Slate 400
  problemBg: 'rgba(136, 146, 176, 0.18)',
  info: '#60A5FA', // Blue 400
  infoBg: 'rgba(96, 165, 250, 0.18)',
} as const;

export type ColorPalette = typeof lightColors;

export const colors: ColorPalette = lightColors;

export const getStatusColors = (c: { danger: string; warning: string; success: string; problem: string }) => ({
  not_reported: c.danger,
  in_progress: c.warning,
  done: c.success,
  problem: c.problem,
});

export const getStatusBg = (c: { dangerBg: string; warningBg: string; successBg: string; problemBg: string }) => ({
  not_reported: c.dangerBg,
  in_progress: c.warningBg,
  done: c.successBg,
  problem: c.problemBg,
});

export const statusColors = getStatusColors(lightColors);
export const statusBg = getStatusBg(lightColors);

export const statusLabel = {
  not_reported: 'Belum Lapor',
  in_progress: 'Proses',
  done: 'Selesai',
  problem: 'Masalah',
} as const;

// 4/8px spacing grid
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

// Smooth radiuses
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

// Strict typographic scale: Display / H1 / H2 / H3 / Body / BodyStrong / Label / Caption
export const type = {
  display: { fontSize: 32, fontWeight: '800' as const, lineHeight: 38 },
  h1: { fontSize: 24, fontWeight: '800' as const, lineHeight: 30 },
  h2: { fontSize: 20, fontWeight: '700' as const, lineHeight: 26 },
  h3: { fontSize: 18, fontWeight: '700' as const, lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 22 },
  bodyStrong: { fontSize: 16, fontWeight: '700' as const, lineHeight: 22 },
  label: { fontSize: 14, fontWeight: '600' as const, lineHeight: 18 },
  caption: { fontSize: 12, fontWeight: '500' as const, lineHeight: 16 },
} as const;

// Legacy numeric scale kept for existing call sites
export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

// Elevation via a hairline border + shadow for iOS & Android
export const shadowLight = {
  sm: {
    shadowColor: '#0A192F',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  card: {
    shadowColor: '#0A192F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '#0A192F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  lg: {
    shadowColor: '#0A192F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
} as const;

export const shadowDark = {
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 1,
  },
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

export const shadow = shadowLight;

export const iconSize = {
  sm: 16,
  md: 20,
  lg: 24,
} as const;

export const iconStrokeWidth = 1.75;

export { useTheme, ThemeProvider, type ThemeColors, type ThemeMode } from '../context/ThemeContext';
