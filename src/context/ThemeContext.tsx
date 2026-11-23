import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  getThemePreference,
  setThemePreference,
  type ThemeModePreference,
} from '@/services/storage/asyncStorageService';
import {
  darkPalette,
  lightPalette,
  type ThemePalette,
} from '@/theme/palette';

interface ThemeContextValue {
  themeMode: ThemeModePreference;
  isDark: boolean;
  colors: ThemePalette;
  toggleTheme: () => Promise<void>;
  setThemeMode: (mode: ThemeModePreference) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function AppThemeProvider({ children }: PropsWithChildren) {
  const [themeMode, setThemeModeState] = useState<ThemeModePreference>('light');

  useEffect(() => {
    let mounted = true;
    getThemePreference()
      .then((saved) => {
        if (mounted) {
          setThemeModeState(saved);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const setThemeMode = useCallback(async (mode: ThemeModePreference) => {
    setThemeModeState(mode);
    await setThemePreference(mode);
  }, []);

  const toggleTheme = useCallback(async () => {
    const next: ThemeModePreference = themeMode === 'dark' ? 'light' : 'dark';
    setThemeModeState(next);
    await setThemePreference(next);
  }, [themeMode]);

  const value = useMemo(
    () => ({
      themeMode,
      isDark: themeMode === 'dark',
      colors: themeMode === 'dark' ? darkPalette : lightPalette,
      toggleTheme,
      setThemeMode,
    }),
    [themeMode, toggleTheme, setThemeMode]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used inside AppThemeProvider');
  }
  return context;
}
