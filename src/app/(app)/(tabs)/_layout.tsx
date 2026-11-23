import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { useAppTheme } from '@/context';

function resolveIconColor(color: unknown, fallback: string): string {
  return typeof color === 'string' ? color : fallback;
}

export default function MainTabsLayout() {
  const { colors } = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Kəşf et',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="compass-outline"
              size={size}
              color={resolveIconColor(color, colors.primary)}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="map"
        options={{
          title: 'Xəritə',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="map-marker-radius-outline"
              size={size}
              color={resolveIconColor(color, colors.primary)}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="trips"
        options={{
          title: 'Səyahətlər',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="bag-suitcase-outline"
              size={size}
              color={resolveIconColor(color, colors.primary)}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Sevimlilər',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="heart-outline"
              size={size}
              color={resolveIconColor(color, colors.primary)}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="account-circle-outline"
              size={size}
              color={resolveIconColor(color, colors.primary)}
            />
          ),
        }}
      />
    </Tabs>
  );
}
