import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import {
  AppHeader,
  CategoryChips,
  DestinationCard,
  EmptyState,
  ErrorState,
  LoadingState,
  SearchBar,
} from '@/components';
import { DESTINATION_CATEGORIES } from '@/constants/categories';
import { useAppTheme, useFavorites } from '@/context';
import { useDebounce, useDestinations } from '@/hooks';
import type { DestinationCategory } from '@/types';

const RATING_FILTERS = [
  { label: 'Bütün reytinqlər', value: 0 },
  { label: '4.8+ ulduz', value: 4.8 },
  { label: '4.9+ ulduz', value: 4.9 },
];

export default function SearchScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const {
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
    isFavorite,
    toggleFavorite,
  } = useFavorites();

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<DestinationCategory>('All');
  const [minRating, setMinRating] = useState(0);

  const debouncedQuery = useDebounce(query, 350);

  const { destinations, isLoading, error, retry } = useDestinations({
    search: debouncedQuery,
    category,
    minRating,
  });

  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      addRecentSearch(debouncedQuery.trim());
    }
  }, [debouncedQuery, addRecentSearch]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Məkan Axtarışı"
        subtitle="Ölkə, şəhər və kateqoriya üzrə canlı axtarış"
        showBack
      />

      <View style={styles.filterSection}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          autoFocus
          onSubmit={() => {
            if (query.trim().length >= 2) addRecentSearch(query.trim());
          }}
        />

        <CategoryChips
          items={DESTINATION_CATEGORIES}
          selected={category}
          onSelect={setCategory}
        />

        <View style={styles.ratingRow}>
          {RATING_FILTERS.map((rf) => {
            const active = minRating === rf.value;
            return (
              <Pressable
                key={rf.label}
                onPress={() => setMinRating(rf.value)}
                style={[
                  styles.ratingChip,
                  {
                    backgroundColor: active
                      ? colors.primaryLight
                      : colors.surface,
                    borderColor: active ? colors.primaryText : colors.border,
                  },
                ]}
              >
                <Text
                  style={{
                    color: active ? colors.primaryText : colors.muted,
                    fontSize: 12,
                    fontWeight: '700',
                  }}
                >
                  {rf.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {recentSearches.length > 0 && !query.trim() ? (
          <View style={styles.recentWrap}>
            <View style={styles.recentHeader}>
              <Text
                variant="labelMedium"
                style={{ color: colors.muted, fontWeight: '700' }}
              >
                Son axtarışlar
              </Text>
              <Pressable onPress={clearRecentSearches}>
                <Text
                  variant="labelSmall"
                  style={{ color: colors.danger, fontWeight: '600' }}
                >
                  Təmizlə
                </Text>
              </Pressable>
            </View>
            <View style={styles.recentChips}>
              {recentSearches.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setQuery(item)}
                  style={[
                    styles.recentChip,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="history"
                    size={13}
                    color={colors.muted}
                  />
                  <Text
                    style={{
                      color: colors.navy,
                      fontSize: 12,
                      fontWeight: '600',
                    }}
                  >
                    {item}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}
      </View>

      {isLoading ? (
        <LoadingState label="Axtarılır..." />
      ) : error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : (
        <FlatList
          data={destinations}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <DestinationCard
              destination={item}
              isFavorite={isFavorite(item.id)}
              onPress={() =>
                router.push({
                  pathname: '/destination/[id]',
                  params: { id: String(item.id) },
                })
              }
              onToggleFavorite={() => toggleFavorite(item.id)}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="magnify-close"
              title="Nəticə tapılmadı"
              description="Axtarış sözünü və ya reytinq/kateqoriya filtrini dəyişdirin."
              actionLabel="Filtrləri sıfırla"
              onAction={() => {
                setQuery('');
                setCategory('All');
                setMinRating(0);
              }}
            />
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
  filterSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  ratingChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  recentWrap: {
    marginTop: 2,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  recentChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 28,
  },
});
