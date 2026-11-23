import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ErrorState,
  LoadingState,
  PlaceCard,
  StatCard,
} from '@/components';
import { useAppTheme, useFavorites } from '@/context';
import {
  fetchDestinationById,
  fetchLiveDestinationWeather,
  fetchPlaces,
  type LiveWeatherInfo,
} from '@/services/api/destinationService';
import type { Destination, Place } from '@/types';
import { moneyCompact } from '@/utils/format';

export default function DestinationDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [destination, setDestination] = useState<Destination | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [liveWeather, setLiveWeather] = useState<LiveWeatherInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const destId = Number(id);
      const [destRes, placesRes] = await Promise.all([
        fetchDestinationById(destId),
        fetchPlaces(destId),
      ]);

      if (!destRes.data) {
        setError('Məkan tapılmadı.');
      } else {
        setDestination(destRes.data);
        setPlaces(placesRes.data);
        fetchLiveDestinationWeather(
          destRes.data.latitude,
          destRes.data.longitude
        ).then(setLiveWeather);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Məkan detalları yüklənə bilmədi.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LoadingState label="Məkan detalları yüklənir..." />
      </View>
    );
  }

  if (error || !destination) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ErrorState
          message={error ?? 'Məkan tapılmadı'}
          onRetry={loadDetails}
        />
      </View>
    );
  }

  const fav = isFavorite(destination.id);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ImageBackground
          source={{ uri: destination.imageUrl }}
          style={styles.hero}
        >
          <View
            style={[
              styles.heroOverlay,
              { paddingTop: Math.max(insets.top, 14) },
            ]}
          >
            <View style={styles.topBtns}>
              <Pressable
                onPress={() => router.back()}
                style={styles.roundBtn}
              >
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={22}
                  color="#FFFFFF"
                />
              </Pressable>

              <Pressable
                onPress={() => toggleFavorite(destination.id)}
                style={styles.roundBtn}
              >
                <MaterialCommunityIcons
                  name={fav ? 'heart' : 'heart-outline'}
                  size={22}
                  color={fav ? '#EF4444' : '#FFFFFF'}
                />
              </Pressable>
            </View>

            <View>
              <View
                style={[styles.catBadge, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.catText}>{destination.category}</Text>
              </View>
              <Text variant="headlineMedium" style={styles.heroTitle}>
                {destination.name}, {destination.country}
              </Text>
              <View style={styles.ratingLine}>
                <MaterialCommunityIcons name="star" size={16} color="#FBBF24" />
                <Text style={styles.ratingText}>
                  {destination.rating.toFixed(1)} ({destination.reviewCount} rəy)
                </Text>
              </View>
            </View>
          </View>
        </ImageBackground>

        <View style={styles.body}>
          <View style={styles.statsRow}>
            <StatCard
              label="Orta Günlük Xərc"
              value={moneyCompact(destination.avgDailyCost)}
              icon="cash"
              accent={colors.primary}
            />
            <StatCard
              label="Ən Yaxşı Mövsüm"
              value={destination.bestSeason.split('/')[0].trim()}
              icon="weather-sunny"
              accent={colors.success}
            />
          </View>

          <Text
            variant="titleMedium"
            style={[styles.sectionTitle, { color: colors.navy }]}
          >
            Məkan Haqqında
          </Text>
          <Text
            variant="bodyMedium"
            style={[styles.desc, { color: colors.muted }]}
          >
            {destination.description}
          </Text>

          <Text
            variant="titleMedium"
            style={[styles.sectionTitle, { color: colors.navy }]}
          >
            Əsas Görməli Yerlər
          </Text>
          <View style={styles.highlightsWrap}>
            {destination.highlights.map((h) => (
              <View
                key={h}
                style={[
                  styles.highlightChip,
                  {
                    backgroundColor: colors.primaryLight,
                    borderColor: colors.border,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="check-circle-outline"
                  size={14}
                  color={colors.primaryText}
                />
                <Text
                  style={[styles.highlightTxt, { color: colors.primaryText }]}
                >
                  {h}
                </Text>
              </View>
            ))}
          </View>

          <View
            style={[
              styles.infoCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.infoHeader}>
              <MaterialCommunityIcons
                name="earth"
                size={18}
                color={colors.primaryText}
              />
              <Text
                variant="titleSmall"
                style={{ color: colors.navy, fontWeight: '700' }}
              >
                Koordinat və Canlı Hava {liveWeather ? '(REST API)' : ''}
              </Text>
            </View>

            <Text variant="bodySmall" style={{ color: colors.muted }}>
              GPS Koordinatlar: {destination.latitude.toFixed(4)}°,{' '}
              {destination.longitude.toFixed(4)}°
            </Text>

            {liveWeather ? (
              <View style={styles.liveGrid}>
                <Text variant="bodySmall" style={{ color: colors.navy }}>
                  Temperatur:{' '}
                  <Text style={{ fontWeight: '700' }}>
                    {liveWeather.temperatureC}°C
                  </Text>
                </Text>
                <Text variant="bodySmall" style={{ color: colors.navy }}>
                  Külək:{' '}
                  <Text style={{ fontWeight: '700' }}>
                    {liveWeather.windSpeedKmh} km/s
                  </Text>
                </Text>
                <Text variant="bodySmall" style={{ color: colors.navy }}>
                  Rütubət:{' '}
                  <Text style={{ fontWeight: '700' }}>
                    {liveWeather.humidityPercent}%
                  </Text>
                </Text>
                <Text variant="bodySmall" style={{ color: colors.navy }}>
                  Saat qurşağı:{' '}
                  <Text style={{ fontWeight: '700' }}>
                    {liveWeather.timezone}
                  </Text>
                </Text>
              </View>
            ) : null}
          </View>

          <Text
            variant="titleMedium"
            style={[styles.sectionTitle, { color: colors.navy }]}
          >
            Turistik Məkanlar ({places.length})
          </Text>

          {places.map((place) => (
            <PlaceCard
              key={place.id}
              place={place}
              onAddToTrip={() =>
                router.push({
                  pathname: '/trip/create',
                  params: {
                    destinationId: String(destination.id),
                    city: destination.name,
                    country: destination.country,
                  },
                })
              }
            />
          ))}
        </View>
      </ScrollView>

      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            paddingBottom: Math.max(insets.bottom, 14),
          },
        ]}
      >
        <Button
          mode="contained"
          icon="calendar-plus"
          buttonColor={colors.primary}
          contentStyle={styles.ctaContent}
          style={styles.ctaBtn}
          onPress={() =>
            router.push({
              pathname: '/trip/create',
              params: {
                destinationId: String(destination.id),
                city: destination.name,
                country: destination.country,
              },
            })
          }
        >
          Bu Məkana Səyahət Planla
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  hero: {
    height: 290,
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.48)',
    padding: 16,
    justifyContent: 'space-between',
  },
  topBtns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roundBtn: {
    width: 42,
    height: 42,
    borderRadius: 999,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  catBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 8,
  },
  catText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  ratingLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
  },
  ratingText: {
    color: '#F8FAFC',
    fontWeight: '600',
  },
  body: {
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  sectionTitle: {
    fontWeight: '800',
    marginTop: 20,
    marginBottom: 10,
  },
  desc: {
    lineHeight: 22,
  },
  highlightsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  highlightChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  highlightTxt: {
    fontSize: 12,
    fontWeight: '700',
  },
  infoCard: {
    marginTop: 18,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 4,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  ctaBtn: {
    borderRadius: 14,
  },
  ctaContent: {
    paddingVertical: 5,
  },
});
