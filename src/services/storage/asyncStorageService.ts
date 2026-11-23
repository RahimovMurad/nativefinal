import AsyncStorage from '@react-native-async-storage/async-storage';

import { APP_CONFIG } from '@/config/appConfig';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import type { Destination } from '@/types';

export type ThemeModePreference = 'light' | 'dark';

export async function getThemePreference(): Promise<ThemeModePreference> {
  const value = await AsyncStorage.getItem(STORAGE_KEYS.THEME_MODE_KEY);
  return value === 'dark' ? 'dark' : 'light';
}

export async function setThemePreference(
  mode: ThemeModePreference
): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.THEME_MODE_KEY, mode);
}

export async function getOnboardingDone(): Promise<boolean> {
  const value = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_DONE_KEY);
  return value === 'true';
}

export async function setOnboardingDone(done: boolean): Promise<void> {
  await AsyncStorage.setItem(
    STORAGE_KEYS.ONBOARDING_DONE_KEY,
    done ? 'true' : 'false'
  );
}

export async function getRecentSearches(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveRecentSearch(query: string): Promise<string[]> {
  const clean = query.trim();
  if (!clean) return getRecentSearches();
  const current = await getRecentSearches();
  const updated = [
    clean,
    ...current.filter((item) => item.toLowerCase() !== clean.toLowerCase()),
  ].slice(0, APP_CONFIG.maxRecentSearches);
  await AsyncStorage.setItem(
    STORAGE_KEYS.RECENT_SEARCHES_KEY,
    JSON.stringify(updated)
  );
  return updated;
}

export async function clearRecentSearchesStorage(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.RECENT_SEARCHES_KEY);
}

export async function getDestinationsCache(): Promise<Destination[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.DESTINATIONS_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function setDestinationsCache(
  destinations: Destination[]
): Promise<void> {
  await AsyncStorage.setItem(
    STORAGE_KEYS.DESTINATIONS_CACHE_KEY,
    JSON.stringify(destinations)
  );
}

export async function getNotificationsEnabled(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED_KEY);
  return raw !== 'false';
}

export async function setNotificationsEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(
    STORAGE_KEYS.NOTIFICATIONS_ENABLED_KEY,
    enabled ? 'true' : 'false'
  );
}
