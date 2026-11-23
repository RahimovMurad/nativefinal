import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import {
  AppHeader,
  CategoryChips,
  InteractiveMapView,
  LoadingState,
  MapMarkerDetailSheet,
} from '@/components';
import { DESTINATION_CATEGORIES } from '@/constants/categories';
import { useAppTheme } from '@/context';
import { getAllDestinations } from '@/database';
import { useLocationPermission } from '@/hooks';
import type { Destination, DestinationCategory } from '@/types';

export default function MapScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const {
    coords,
    isLoading: locationBusy,
    permissionError,
    fetchLocation,
    getDistanceFromUser,
  } = useLocationPermission();

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loadingMap, setLoadingMap] = useState(true);
  const [category, setCategory] = useState<DestinationCategory>('All');
  const [selectedDestination, setSelectedDestination] =
    useState<Destination | null>(null);
  const [focusRequest, setFocusRequest] = useState<{
    latitude: number;
    longitude: number;
    zoom?: number;
    nonce: number;
  } | null>(null);

  useEffect(() => {
    getAllDestinations()
      .then((list) => {
        setDestinations(list);
        if (list.length > 0) {
          setSelectedDestination(list[0]);
        }
      })
      .finally(() => setLoadingMap(false));
  }, []);

  const filteredDestinations = useMemo(() => {
    if (category === 'All') return destinations;
    return destinations.filter((d) => d.category === category);
  }, [destinations, category]);

  useEffect(() => {
    if (
      selectedDestination &&
      !filteredDestinations.some((d) => d.id === selectedDestination.id)
    ) {
      setSelectedDestination(filteredDestinations[0] ?? null);
    }
  }, [filteredDestinations, selectedDestination]);

  const handleMyLocation = async () => {
    const userPos = await fetchLocation(true);
    if (userPos) {
      setFocusRequest({
        latitude: userPos.latitude,
        longitude: userPos.longitude,
        zoom: 10,
        nonce: Date.now(),
      });
    }
  };

  const handleSelectAndFocus = (dest: Destination) => {
    setSelectedDestination(dest);
    setFocusRequest({
      latitude: dest.latitude,
      longitude: dest.longitude,
      zoom: 8,
      nonce: Date.now(),
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Xəritə"
        subtitle="Məkan markerləri və GPS lokasiya"
        showDrawer
        rightIcon="crosshairs-gps"
        onRightPress={handleMyLocation}
      />

      {loadingMap ? (
        <LoadingState label="Xəritə məlumatları yüklənir..." />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.locationBar}>
            <View style={styles.locationInfo}>
              <MaterialCommunityIcons
                name={coords ? 'map-marker-check' : 'map-marker-outline'}
                size={18}
                color={coords ? colors.success : colors.primaryText}
              />
              <Text
                variant="bodySmall"
                style={{
                  color: coords ? colors.success : colors.muted,
                  fontWeight: '600',
                  flex: 1,
                }}
              >
                {coords
                  ? `Lokasiyanız: ${coords.latitude.toFixed(3)}°, ${coords.longitude.toFixed(3)}°`
                  : 'Məsafələri görmək üçün lokasiyanızı aktiv edin'}
              </Text>
            </View>

            <Button
              mode="contained-tonal"
              compact
              loading={locationBusy}
              disabled={locationBusy}
              onPress={handleMyLocation}
            >
              Lokasiyam
            </Button>
          </View>

          {permissionError ? (
            <View
              style={[
                styles.permissionBox,
                {
                  backgroundColor: colors.warningSoft,
                  borderColor: colors.warning,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={18}
                color={colors.warning}
              />
              <Text
                variant="bodySmall"
                style={{ color: colors.navy, flex: 1 }}
              >
                {permissionError}
              </Text>
            </View>
          ) : null}

          <View style={styles.chipsWrap}>
            <CategoryChips
              items={DESTINATION_CATEGORIES}
              selected={category}
              onSelect={setCategory}
            />
          </View>

          <InteractiveMapView
            destinations={filteredDestinations}
            selectedId={selectedDestination?.id ?? null}
            userCoords={coords}
            focusRequest={focusRequest}
            onSelectDestination={setSelectedDestination}
            height={360}
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickCityRow}
          >
            {filteredDestinations.map((dest) => {
              const active = selectedDestination?.id === dest.id;
              return (
                <Pressable
                  key={dest.id}
                  onPress={() => handleSelectAndFocus(dest)}
                  style={[
                    styles.cityChip,
                    {
                      backgroundColor: active ? colors.primary : colors.surface,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={13}
                    color={active ? '#FFFFFF' : colors.primaryText}
                  />
                  <Text
                    style={{
                      color: active ? '#FFFFFF' : colors.navy,
                      fontSize: 12,
                      fontWeight: '700',
                    }}
                  >
                    {dest.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {selectedDestination ? (
            <View style={styles.sheetWrap}>
              <MapMarkerDetailSheet
                destination={selectedDestination}
                distanceKm={getDistanceFromUser({
                  latitude: selectedDestination.latitude,
                  longitude: selectedDestination.longitude,
                })}
                onOpenDetails={() =>
                  router.push({
                    pathname: '/destination/[id]',
                    params: { id: String(selectedDestination.id) },
                  })
                }
                onPlanTrip={() =>
                  router.push({
                    pathname: '/trip/create',
                    params: {
                      destinationId: String(selectedDestination.id),
                      city: selectedDestination.name,
                      country: selectedDestination.country,
                    },
                  })
                }
              />
            </View>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 28,
  },
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  permissionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  chipsWrap: {
    marginBottom: 10,
  },
  quickCityRow: {
    gap: 8,
    marginTop: 12,
  },
  cityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  sheetWrap: {
    marginTop: 12,
  },
});
