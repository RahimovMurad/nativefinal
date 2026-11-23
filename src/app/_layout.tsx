import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ActivityIndicator, PaperProvider, Text } from 'react-native-paper';

import {
  AppThemeProvider,
  AuthProvider,
  FavoritesProvider,
  TripProvider,
  useAppTheme,
  useAuth,
} from '@/context';
import { getDatabase } from '@/database';
import { getPaperTheme } from '@/theme/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootNavigator() {
  const { token, hasCompletedOnboarding, isLoading } = useAuth();
  const { colors, isDark } = useAppTheme();

  const [databaseReady, setDatabaseReady] = useState(false);
  const [databaseError, setDatabaseError] = useState(false);

  useEffect(() => {
    let mounted = true;
    getDatabase()
      .then(() => {
        if (mounted) {
          setDatabaseReady(true);
        }
      })
      .catch((error) => {
        console.error('Database initialization failed:', error);
        if (mounted) {
          setDatabaseError(true);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isLoading && (databaseReady || databaseError)) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isLoading, databaseReady, databaseError]);

  if (databaseError) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text variant="titleMedium" style={{ color: colors.navy }}>
          Verilənlər bazası açıla bilmədi.
        </Text>
        <Text style={{ color: colors.muted, textAlign: 'center' }}>
          Zəhmət olmasa tətbiqi yenidən başladın.
        </Text>
      </View>
    );
  }

  if (isLoading || !databaseReady) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const isAuthenticated = hasCompletedOnboarding && Boolean(token);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!hasCompletedOnboarding}>
          <Stack.Screen name="onboarding" />
        </Stack.Protected>

        <Stack.Protected guard={hasCompletedOnboarding && !token}>
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
        </Stack.Protected>

        <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen name="(app)" />
          <Stack.Screen name="search" />
          <Stack.Screen name="destination/[id]" />
          <Stack.Screen name="trip/create" />
          <Stack.Screen name="trip/[id]" />
          <Stack.Screen name="trip/edit/[id]" />
          <Stack.Screen name="trip/[id]/itinerary" />
          <Stack.Screen name="trip/[id]/activity-form" />
          <Stack.Screen name="trip/[id]/expenses" />
        </Stack.Protected>

        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}

function ThemedRoot() {
  const { isDark } = useAppTheme();

  return (
    <PaperProvider theme={getPaperTheme(isDark)}>
      <AuthProvider>
        <FavoritesProvider>
          <TripProvider>
            <RootNavigator />
          </TripProvider>
        </FavoritesProvider>
      </AuthProvider>
    </PaperProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <AppThemeProvider>
        <ThemedRoot />
      </AppThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    padding: 24,
  },
});
