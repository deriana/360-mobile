// SAKSI PAN 360 — Partai Amanat Nasional Official Brand Color Tokens & Dynamic Theme Specification

export const lightColors = {
  primary: '#0066B3', // PAN Royal Blue (Partai Amanat Nasional Primary)
  primaryDark: '#004F8A', // PAN Dark Blue Shading
  primaryLight: '#EBF4FF', // PAN Soft Blue Light Tint
  background: '#F8FAFC', // Slate/Light Gray Background
  surface: '#FFFFFF', // Pure White Surface
  border: '#E2E8F0', // Light Gray Border
  borderStrong: '#CBD5E1', // Slate-300
  text: '#003366', // PAN Deep Navy Blue Text
  textMuted: '#64748B', // Slate Muted Text
  textInverse: '#FFFFFF', // Pure White Text
  navy: '#003366', // PAN Deep Navy Brand
  darkRed: '#99000B',
  vibrantRed: '#E60012',
  success: '#10B981', // Emerald 500
  successBg: '#ECFDF5', // Emerald 50
  warning: '#F59E0B', // Amber 500
  warningBg: '#FFFBEB', // Amber 50
  danger: '#DC2626', // Red 600
  dangerBg: '#FEF2F2', // Red 50
  problem: '#475569', // Slate 600
  problemBg: '#F1F5F9', // Slate 100
  info: '#0066B3', // PAN Blue
  infoBg: '#EBF4FF', // PAN Blue 50
} as const;

export const darkColors = {
  primary: '#3B9EE0', // PAN Blue Accent (lighter for dark bg)
  primaryDark: '#0066B3', // PAN Standard Blue
  primaryLight: 'rgba(0, 102, 179, 0.20)', // Transparent PAN Blue Tint
  background: '#001A33', // PAN Ultra Dark Navy Background
  surface: '#002B52', // PAN Deep Navy Surface
  border: '#0A3D6B', // PAN Navy Border
  borderStrong: '#1A5490', // PAN Navy Strong Border
  text: '#FFFFFF', // Pure White Text
  textMuted: '#93C5FD', // PAN Light Blue Muted Text
  textInverse: '#001A33',
  navy: '#001A33',
  darkRed: '#99000B',
  vibrantRed: '#E60012',
  success: '#10B981', // Emerald 500
  successBg: 'rgba(16, 185, 129, 0.18)',
  warning: '#F59E0B', // Amber 500
  warningBg: 'rgba(245, 158, 11, 0.18)',
  danger: '#F87171', // Red 400
  dangerBg: 'rgba(248, 113, 113, 0.18)',
  problem: '#93C5FD', // Blue 300
  problemBg: 'rgba(147, 197, 253, 0.18)',
  info: '#3B9EE0', // PAN Blue Light
  infoBg: 'rgba(59, 158, 224, 0.18)',
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
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
  full: 999,
} as const;

// Poppins Font Family Tokens
export const fonts = {
  regular: 'Poppins-Regular',
  medium: 'Poppins-Medium',
  semiBold: 'Poppins-SemiBold',
  bold: 'Poppins-Bold',
  extraBold: 'Poppins-ExtraBold',
} as const;

export function getFontFamily(weight?: string | number): string {
  if (!weight) return fonts.regular;
  const w = String(weight).toLowerCase();
  if (w === '800' || w === '900' || w === 'heavy' || w === 'extrabold') return fonts.extraBold;
  if (w === '700' || w === 'bold') return fonts.bold;
  if (w === '600' || w === 'semibold') return fonts.semiBold;
  if (w === '500' || w === 'medium') return fonts.medium;
  return fonts.regular;
}

// Strict typographic scale with Poppins: Display / H1 / H2 / H3 / Body / BodyStrong / Label / Caption
export const type = {
  display: { fontFamily: fonts.extraBold, fontSize: 32, fontWeight: '800' as const, lineHeight: 38 },
  h1: { fontFamily: fonts.bold, fontSize: 24, fontWeight: '800' as const, lineHeight: 30 },
  h2: { fontFamily: fonts.bold, fontSize: 20, fontWeight: '700' as const, lineHeight: 26 },
  h3: { fontFamily: fonts.semiBold, fontSize: 18, fontWeight: '700' as const, lineHeight: 24 },
  body: { fontFamily: fonts.regular, fontSize: 16, fontWeight: '400' as const, lineHeight: 22 },
  bodyStrong: { fontFamily: fonts.bold, fontSize: 16, fontWeight: '700' as const, lineHeight: 22 },
  label: { fontFamily: fonts.semiBold, fontSize: 14, fontWeight: '600' as const, lineHeight: 18 },
  caption: { fontFamily: fonts.medium, fontSize: 12, fontWeight: '500' as const, lineHeight: 16 },
} as const;

// Legacy numeric scale kept for existing call sites
export const fontSize = {
  xxs: 10,
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
    shadowColor: '#003366',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  card: {
    shadowColor: '#003366',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '#003366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  lg: {
    shadowColor: '#003366',
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
