import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import {
  calculateDistanceKm,
  requestUserLocation,
} from '@/services/device/locationService';
import type { Coordinates } from '@/types';

export function useLocationPermission() {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const fetchLocation = useCallback(async (showAlertOnDeny: boolean = true) => {
    setIsLoading(true);
    setPermissionError(null);

    const result = await requestUserLocation();
    setIsLoading(false);

    if (result.granted) {
      setCoords(result.coords);
      return result.coords;
    }

    setPermissionError(result.reason);
    if (showAlertOnDeny) {
      Alert.alert('Lokasiya icazəsi', result.reason);
    }
    return null;
  }, []);

  const getDistanceFromUser = useCallback(
    (target: Coordinates): number | null => {
      if (!coords) return null;
      return calculateDistanceKm(coords, target);
    },
    [coords]
  );

  return {
    coords,
    isLoading,
    permissionError,
    fetchLocation,
    getDistanceFromUser,
  };
}
