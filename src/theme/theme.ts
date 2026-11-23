import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

import { darkPalette, lightPalette, type ThemePalette } from './palette';

export { darkPalette, lightPalette, type ThemePalette };

// Default static palette reference (mirrors BizmanApp-morning pattern)
export const palette = lightPalette;

export function getPaperTheme(isDark: boolean) {
  const colors = isDark ? darkPalette : lightPalette;
  const base = isDark ? MD3DarkTheme : MD3LightTheme;

  return {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.primary,
      onPrimary: '#FFFFFF',
      primaryContainer: colors.primaryLight,
      onPrimaryContainer: colors.primaryText,
      secondary: colors.success,
      onSecondary: '#FFFFFF',
      secondaryContainer: colors.successSoft,
      onSecondaryContainer: colors.success,
      background: colors.background,
      onBackground: colors.navy,
      surface: colors.surface,
      onSurface: colors.navy,
      surfaceVariant: colors.surfaceElevated,
      onSurfaceVariant: colors.muted,
      outline: colors.border,
      outlineVariant: colors.border,
      error: colors.danger,
      onError: '#FFFFFF',
    },
  };
}

export const appTheme = getPaperTheme(false);
