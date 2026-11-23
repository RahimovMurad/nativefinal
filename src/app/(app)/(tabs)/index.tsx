import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  ImageBackground,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { Button, Text } from 'react-native-paper';

import {
  AppHeader,
  CategoryChips,
  DestinationCard,
  EmptyState,
  ErrorState,
  LoadingState,
  OfflineBanner,
  SearchBar,
} from '@/components';
import { DESTINATION_CATEGORIES } from '@/constants/categories';
import { useAppTheme, useFavorites } from '@/context';
import { useDestinations } from '@/hooks';
import type { DestinationCategory } from '@/types';

export default function ExploreScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [selectedCategory, setSelectedCategory] =
    useState<DestinationCategory>('All');

  const {
    destinations,
    total,
    hasMore,
    isLoading,
    isRefreshing,
    isLoadingMore,
    isOfflineCache,
    error,
    refresh,
    loadMore,
    retry,
  } = useDestinations({ category: selectedCategory });

  const featuredDestinations = useMemo(
    () => destinations.slice(0, 4),
    [destinations]
  );

  const openDestination = useCallback(
    (id: number) => {
      router.push({
        pathname: '/destination/[id]',
        params: { id: String(id) },
      });
    },
    [router]
  );

  // Memoized JSX element (not a render function!) so FlatList never unmounts/remounts header on favorite toggle
  const listHeader = useMemo(
    () => (
      <View style={styles.headerContent}>
        <OfflineBanner visible={isOfflineCache} />

        <ImageBackground
          source={{
            uri: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1000&q=80',
          }}
          style={[styles.heroCard, { backgroundColor: colors.surfaceElevated }]}
          imageStyle={styles.heroImage}
        >
          <View style={styles.heroOverlay}>
            <View style={styles.heroBadge}>
              <MaterialCommunityIcons
                name="compass"
                size={14}
                color="#FFFFFF"
              />
              <Text style={styles.heroBadgeText}>TRIPMATE EXPLORE</Text>
            </View>

            <Text variant="headlineSmall" style={styles.heroTitle}>
              Növbəti macəranı bu gün planla
            </Text>
            <Text variant="bodySmall" style={styles.heroSub}>
              Şəhərləri kəşf et, marşrut qur və xərcləri nəzarətdə saxla.
            </Text>

            <Pressable
              onPress={() => router.push('/trip/create')}
              style={({ pressed }) => [
                styles.heroBtn,
                {
                  backgroundColor: colors.primary,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="calendar-plus"
                size={16}
                color="#FFFFFF"
              />
              <Text style={styles.heroBtnText}>Yeni Səyahət Yarat</Text>
            </Pressable>
          </View>
        </ImageBackground>

        <View style={styles.searchWrap}>
          <SearchBar
            value=""
            readOnlyTrigger
            onPressTrigger={() => router.push('/search')}
            placeholder="Ölkə, şəhər və ya kateqoriya axtar..."
          />
        </View>

        <CategoryChips
          items={DESTINATION_CATEGORIES}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />

        {featuredDestinations.length > 0 ? (
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeader}>
              <Text
                variant="titleMedium"
                style={[styles.sectionTitle, { color: colors.navy }]}
              >
                Populyar Məkanlar
              </Text>
              <Pressable onPress={() => router.push('/search')}>
                <Text style={{ color: colors.primaryText, fontWeight: '700' }}>
                  Hamısı →
                </Text>
              </Pressable>
            </View>

            <FlatList
              data={featuredDestinations}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => `featured-${item.id}`}
              contentContainerStyle={styles.horizontalList}
              renderItem={({ item }) => (
                <DestinationCard
                  compact
                  destination={item}
                  isFavorite={isFavorite(item.id)}
                  onPress={() => openDestination(item.id)}
                  onToggleFavorite={() => toggleFavorite(item.id)}
                />
              )}
            />
          </View>
        ) : null}

        <View style={styles.sectionHeader}>
          <Text
            variant="titleMedium"
            style={[styles.sectionTitle, { color: colors.navy }]}
          >
            Bütün Məkanlar ({total})
          </Text>
        </View>
      </View>
    ),
    [
      isOfflineCache,
      colors,
      router,
      selectedCategory,
      featuredDestinations,
      total,
      isFavorite,
      openDestination,
      toggleFavorite,
    ]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="TripMate"
        subtitle="Məkanları Kəşf Et"
        showDrawer
        rightIcon="magnify"
        onRightPress={() => router.push('/search')}
      />

      {isLoading && destinations.length === 0 ? (
        <LoadingState label="Məkanlar API-dən yüklənir..." />
      ) : error && destinations.length === 0 ? (
        <ErrorState message={error} onRetry={retry} />
      ) : (
        <FlatList
          data={destinations}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={listHeader}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) => (
            <DestinationCard
              destination={item}
              isFavorite={isFavorite(item.id)}
              onPress={() => openDestination(item.id)}
              onToggleFavorite={() => toggleFavorite(item.id)}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="map-search-outline"
              title="Bu kateqoriyada məkan tapılmadı"
              description="Başqa kateqoriya seçin və ya axtarış bölməsindən istifadə edin."
              actionLabel="Hamısını göstər"
              onAction={() => setSelectedCategory('All')}
            />
          }
          ListFooterComponent={
            hasMore ? (
              <Button
                mode="outlined"
                loading={isLoadingMore}
                disabled={isLoadingMore}
                textColor={colors.primaryText}
                onPress={loadMore}
                style={[styles.loadMoreBtn, { borderColor: colors.border }]}
              >
                Daha çox yüklə
              </Button>
            ) : undefined
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 28,
  },
  headerContent: {
    marginBottom: 12,
  },
  heroCard: {
    height: 186,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 14,
  },
  heroImage: {
    borderRadius: 20,
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.56)',
    padding: 18,
    justifyContent: 'space-between',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(37, 99, 235, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  heroSub: {
    color: '#E2E8F0',
  },
  heroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  heroBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  searchWrap: {
    marginBottom: 10,
  },
  sectionBlock: {
    marginTop: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    fontWeight: '800',
  },
  horizontalList: {
    gap: 12,
    paddingRight: 8,
  },
  loadMoreBtn: {
    marginTop: 6,
    borderRadius: 12,
  },
});
