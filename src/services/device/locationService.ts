import * as Location from 'expo-location';

import type { Coordinates } from '@/types';

export type LocationResult =
  | {
      granted: true;
      coords: Coordinates;
    }
  | {
      granted: false;
      reason: string;
    };

export async function requestUserLocation(): Promise<LocationResult> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return {
        granted: false,
        reason:
          'Lokasiya icazəsi rədd edildi. Zəhmət olmasa cihaz parametrlərindən icazə verin.',
      };
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      granted: true,
      coords: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
    };
  } catch (error) {
    console.warn('Location fetch failed:', error);
    return {
      granted: false,
      reason: 'Lokasiya məlumatı əldə edilə bilmədi.',
    };
  }
}

export function calculateDistanceKm(
  from: Coordinates,
  to: Coordinates
): number {
  const R = 6371;
  const dLat = ((to.latitude - from.latitude) * Math.PI) / 180;
  const dLon = ((to.longitude - from.longitude) * Math.PI) / 180;
  const lat1 = (from.latitude * Math.PI) / 180;
  const lat2 = (to.latitude * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}
